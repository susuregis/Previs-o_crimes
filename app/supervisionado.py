from fastapi import APIRouter, HTTPException
import pandas as pd
import joblib
import os
from typing import List, Optional
from datetime import datetime

router = APIRouter()

#  Carrega o modelo supervisionado
MODEL_PATH = "app/models"

try:
    modelo_supervisionado = joblib.load(os.path.join(MODEL_PATH, "modelo_supervisionado.pkl"))
    print("Modelo supervisionado carregado com sucesso!")
except Exception as e:
    print(f"Erro ao carregar modelo supervisionado: {e}")
    modelo_supervisionado = None

# Carrega os dados históricos para fazer lags
try:
    df_full = pd.read_csv("data/processed/dados_processados.csv")
    df_trafico = df_full[df_full['tipo_crime'].str.contains("Tráfico", case=False, na=False)]
    
    # Agrupa por bairro, ano e mês
    df_grouped = (
        df_trafico.groupby(['bairro', 'ano', 'mes'])
        .size()
        .reset_index(name='quantidade_crimes')
    )
    df_grouped = df_grouped.sort_values(by=['bairro', 'ano', 'mes'])
    
    bairros_unicos = df_grouped['bairro'].unique().tolist()
    print(f"Dados históricos carregados: {len(bairros_unicos)} bairros")
except Exception as e:
    print(f" Erro ao carregar dados históricos: {e}")
    df_grouped = pd.DataFrame()
    bairros_unicos = []

def get_lags(df, bairro, ano, mes, n_lags=6):
    """
    Retorna os últimos n_lags crimes do bairro (para criar features lag)
    """
    historico = df[(df['bairro'] == bairro) & 
                   ((df['ano'] < ano) | ((df['ano'] == ano) & (df['mes'] < mes)))]
    
    historico = historico.sort_values(by=['ano', 'mes'], ascending=False)
    lags = historico['quantidade_crimes'].head(n_lags).values.tolist()
    
    # Preencher com 0 se não houver histórico suficiente
    while len(lags) < n_lags:
        lags.append(0)
    
    return lags[:n_lags]

def estacao_do_ano(mes: int) -> str:
    """Retorna a estação do ano baseado no mês"""
    if mes in [12, 1, 2]:
        return "Verão"
    elif mes in [3, 4, 5]:
        return "Outono"
    elif mes in [6, 7, 8]:
        return "Inverno"
    else:
        return "Primavera"

@router.get("/")
def info_modelo():
    """
    Retorna informações sobre o modelo supervisionado
    """
    return {
        "modelo": "Random Forest Regressor / Hist Gradient Boosting",
        "tipo": "Modelo Supervisionado",
        "objetivo": "Prever quantidade de crimes de tráfico por bairro e período",
        "features": [
            "bairro",
            "ano",
            "mes",
            "lag1, lag2, lag3, lag4, lag5, lag6 (histórico de crimes)",
            "quantidade_vitimas",
            "quantidade_suspeitos",
            "arma_utilizada",
            "estacao"
        ],
        "target": "quantidade_crimes",
        "bairros_disponiveis": bairros_unicos
    }

@router.post("/predict")
def prever_crimes(data: dict):
    """
    Prevê a quantidade de crimes para um bairro em um período específico
    
    Exemplo de requisição:
    {
        "bairro": "Boa Viagem",
        "ano": 2025,
        "mes": 11,
        "quantidade_vitimas": 2,
        "quantidade_suspeitos": 1,
        "arma_utilizada": "Arma de Fogo"
    }
    """
    if modelo_supervisionado is None:
        raise HTTPException(status_code=500, detail="Modelo não carregado")
    
    if df_grouped.empty:
        raise HTTPException(status_code=500, detail="Dados históricos não disponíveis")
    
    # Validação dos campos obrigatórios
    bairro = data.get("bairro")
    ano = data.get("ano")
    mes = data.get("mes")
    
    if not all([bairro, ano, mes]):
        raise HTTPException(
            status_code=400,
            detail="Campos obrigatórios: bairro, ano, mes"
        )
    
    # Validação do bairro
    if bairro not in bairros_unicos:
        raise HTTPException(
            status_code=404,
            detail=f"Bairro '{bairro}' não encontrado. Bairros disponíveis: {bairros_unicos}"
        )
    
    # Validação de ano e mês
    if not (2020 <= ano <= 2030):
        raise HTTPException(status_code=400, detail="Ano deve estar entre 2020 e 2030")
    
    if not (1 <= mes <= 12):
        raise HTTPException(status_code=400, detail="Mês deve estar entre 1 e 12")
    
    # Campos opcionais com valores padrão
    quantidade_vitimas = data.get("quantidade_vitimas", 1)
    quantidade_suspeitos = data.get("quantidade_suspeitos", 1)
    arma_utilizada = data.get("arma_utilizada", "Nenhum")
    
    # Obter lags (histórico)
    lags = get_lags(df_grouped, bairro, ano, mes)
    
    # Criar DataFrame para predição
    dados_predicao = pd.DataFrame([{
        'bairro': bairro,
        'ano': ano,
        'mes': mes,
        'lag1': lags[0],
        'lag2': lags[1],
        'lag3': lags[2],
        'lag4': lags[3],
        'lag5': lags[4],
        'lag6': lags[5],
        'quantidade_vitimas': quantidade_vitimas,
        'quantidade_suspeitos': quantidade_suspeitos,
        'arma_utilizada': arma_utilizada,
        'estacao': estacao_do_ano(mes)
    }])
    
    # Fazer predição
    try:
        # Debug: verificar tipo do modelo
        print(f"Tipo do modelo: {type(modelo_supervisionado)}")
        print(f"Dados para predição:\n{dados_predicao}")
        print(f"Tipos das colunas: {dados_predicao.dtypes}")
        
        previsao = float(modelo_supervisionado.predict(dados_predicao)[0])
        previsao = max(0, round(previsao, 2))  # Não pode ser negativo
    except Exception as e:
        import traceback
        erro_completo = traceback.format_exc()
        print(f"Erro completo:\n{erro_completo}")
        raise HTTPException(status_code=500, detail=f"Erro na predição: {str(e)}\nVerifique os logs do servidor para mais detalhes.")
    
    # Calcular nível de risco
    if previsao >= 10:
        nivel_risco = "Muito Alto"
        cor = "vermelho"
    elif previsao >= 5:
        nivel_risco = "Alto"
        cor = "laranja"
    elif previsao >= 2:
        nivel_risco = "Médio"
        cor = "amarelo"
    else:
        nivel_risco = "Baixo"
        cor = "verde"
    
    return {
        "bairro": bairro,
        "periodo": f"{mes:02d}/{ano}",
        "previsao_crimes": previsao,
        "nivel_risco": nivel_risco,
        "cor_alerta": cor,
        "features_utilizadas": {
            "historico_crimes": {
                "mes_anterior": lags[0],
                "2_meses_atras": lags[1],
                "3_meses_atras": lags[2],
                "media_ultimos_6_meses": round(sum(lags) / 6, 2)
            },
            "contexto": {
                "vitimas_esperadas": quantidade_vitimas,
                "suspeitos_esperados": quantidade_suspeitos,
                "arma_prevista": arma_utilizada,
                "estacao": estacao_do_ano(mes)
            }
        },
        "recomendacao": get_recomendacao_supervisionado(nivel_risco, previsao)
    }

@router.post("/predict/multiplos")
def prever_multiplos_bairros(data: dict):
    """
    Prevê crimes para múltiplos bairros no mesmo período
    
    Exemplo:
    {
        "ano": 2025,
        "mes": 11,
        "bairros": ["Boa Viagem", "Recife", "Afogados"]
    }
    """
    if modelo_supervisionado is None:
        raise HTTPException(status_code=500, detail="Modelo não carregado")
    
    ano = data.get("ano")
    mes = data.get("mes")
    bairros = data.get("bairros", bairros_unicos)
    
    if not ano or not mes:
        raise HTTPException(status_code=400, detail="Ano e mês são obrigatórios")
    
    resultados = []
    
    for bairro in bairros:
        if bairro not in bairros_unicos:
            continue
        
        lags = get_lags(df_grouped, bairro, ano, mes)
        
        dados_predicao = pd.DataFrame([{
            'bairro': bairro,
            'ano': ano,
            'mes': mes,
            'lag1': lags[0],
            'lag2': lags[1],
            'lag3': lags[2],
            'lag4': lags[3],
            'lag5': lags[4],
            'lag6': lags[5],
            'quantidade_vitimas': 1,
            'quantidade_suspeitos': 1,
            'arma_utilizada': 'Nenhum',
            'estacao': estacao_do_ano(mes)
        }])
        
        try:
            previsao = float(modelo_supervisionado.predict(dados_predicao)[0])
            previsao = max(0, round(previsao, 2))
            
            if previsao >= 10:
                nivel_risco = "Muito Alto"
            elif previsao >= 5:
                nivel_risco = "Alto"
            elif previsao >= 2:
                nivel_risco = "Médio"
            else:
                nivel_risco = "Baixo"
            
            resultados.append({
                "bairro": bairro,
                "previsao_crimes": previsao,
                "nivel_risco": nivel_risco
            })
        except:
            continue
    
    # Ordenar por previsão (maior risco primeiro)
    resultados = sorted(resultados, key=lambda x: x['previsao_crimes'], reverse=True)
    
    return {
        "periodo": f"{mes:02d}/{ano}",
        "total_bairros_analisados": len(resultados),
        "previsoes": resultados,
        "bairro_mais_critico": resultados[0] if resultados else None,
        "total_crimes_previstos": round(sum(r['previsao_crimes'] for r in resultados), 2)
    }

@router.get("/historico/{bairro}")
def historico_bairro(bairro: str, limite: int = 12):
    """
    Retorna o histórico de crimes de um bairro
    """
    if df_grouped.empty:
        raise HTTPException(status_code=500, detail="Dados não disponíveis")
    
    if bairro not in bairros_unicos:
        raise HTTPException(
            status_code=404,
            detail=f"Bairro '{bairro}' não encontrado"
        )
    
    historico = df_grouped[df_grouped['bairro'] == bairro].tail(limite)
    
    registros = []
    for _, row in historico.iterrows():
        registros.append({
            "ano": int(row['ano']),
            "mes": int(row['mes']),
            "periodo": f"{int(row['mes']):02d}/{int(row['ano'])}",
            "quantidade_crimes": int(row['quantidade_crimes'])
        })
    
    return {
        "bairro": bairro,
        "total_registros": len(registros),
        "historico": registros,
        "estatisticas": {
            "media": round(historico['quantidade_crimes'].mean(), 2),
            "max": int(historico['quantidade_crimes'].max()),
            "min": int(historico['quantidade_crimes'].min()),
            "tendencia": "crescente" if len(registros) >= 3 and registros[-1]['quantidade_crimes'] > registros[0]['quantidade_crimes'] else "decrescente"
        }
    }

def get_recomendacao_supervisionado(nivel_risco: str, previsao: float) -> str:
    """Retorna recomendação baseada no nível de risco"""
    if nivel_risco == "Muito Alto":
        return f"ALERTA MÁXIMO: Previsão de {previsao:.0f} crimes! Ação imediata necessária: reforço policial, operações especializadas e monitoramento 24h."
    elif nivel_risco == "Alto":
        return f"ATENÇÃO: Previsão de {previsao:.0f} crimes. Aumentar patrulhamento e implementar ações preventivas."
    elif nivel_risco == "Médio":
        return f"Monitoramento necessário: {previsao:.0f} crimes previstos. Manter vigilância constante."
    else:
        return f"Baixo risco: {previsao:.0f} crimes previstos. Manter patrulhamento regular."
