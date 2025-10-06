from fastapi import APIRouter, HTTPException
import pandas as pd
import joblib
import os
import numpy as np

router = APIRouter()

# Carrega os modelos salvos
MODEL_PATH = "app/models"

try:
    kmeans = joblib.load(os.path.join(MODEL_PATH, "kmeans_model.pkl"))
    scaler = joblib.load(os.path.join(MODEL_PATH, "scaler.pkl"))
    scaler_risk = joblib.load(os.path.join(MODEL_PATH, "scaler_risk.pkl"))
    print("✅ Modelos carregados com sucesso!")
except Exception as e:
    print(f"❌ Erro ao carregar modelos: {e}")
    kmeans = None
    scaler = None
    scaler_risk = None

#  Carrega os dados processados com a lógica do notebook TESTE
try:
    # Carrega os dados pré-processados dos bairros
    df_bairros = pd.read_csv(os.path.join(MODEL_PATH, "bairros_clusters.csv"))
    cluster_stats = pd.read_csv(os.path.join(MODEL_PATH, "cluster_stats.csv"))
    
    print(f"✅ Dados carregados: {len(df_bairros)} bairros")
    print(f"✅ Clusters identificados: {sorted(df_bairros['cluster'].unique())}")
    print(f"✅ Níveis de risco: {df_bairros['nivel_risco'].value_counts().to_dict()}")
    
    # Também carrega dados brutos para estatísticas adicionais
    df = pd.read_csv("data/processed/dados_processados.csv")
    df_trafico = df[df['tipo_crime'].str.contains('tráfico', case=False, na=False)].copy()
    
    # Conta total de ocorrências de tráfico por bairro
    df_ocorrencias = df_trafico.groupby('bairro').size().reset_index(name='total_ocorrencias')
    df_bairros = df_bairros.merge(df_ocorrencias, on='bairro', how='left')
    
    print(f"✅ Estatísticas adicionais calculadas")
except Exception as e:
    print(f"❌ Erro ao carregar dados: {e}")
    df_bairros = pd.DataFrame()
    cluster_stats = pd.DataFrame()

#  Descrições dos clusters (baseado em 4 grupos - lógica do notebook TESTE)
descricoes_clusters = {
    0: "Perfil de risco médio - Média de suspeitos moderada com ocorrências noturnas",
    1: "Perfil de baixo risco - Menor número de suspeitos por ocorrência",
    2: "Perfil de baixo risco - Poucos suspeitos envolvidos",
    3: "Perfil de risco médio - Maior número de suspeitos por ocorrência"
}

@router.get("/")
def listar_bairros():
    """
    Lista todos os bairros disponíveis com seus clusters e estatísticas
    """
    if df_bairros.empty:
        raise HTTPException(status_code=500, detail="Dados não carregados")
    
    bairros_list = []
    for _, row in df_bairros.iterrows():
        bairros_list.append({
            "bairro": row['bairro'],
            "cluster": int(row['cluster']),
            "nivel_risco": row['nivel_risco'],
            "media_suspeitos": round(row['media_suspeitos'], 2),
            "media_vitimas": round(row['media_vitimas'], 2),
            "percentual_com_arma": round(row['percentual_com_arma'] * 100, 1),
            "media_idade_suspeitos": round(row['media_idade_suspeitos'], 1),
            "media_hora": round(row['media_hora'], 1),
            "total_ocorrencias": int(row.get('total_ocorrencias', 0))
        })
    
    return {
        "total_bairros": len(bairros_list),
        "bairros": bairros_list
    }

@router.post("/predict")
def predict_cluster(data: dict):
    """
    Recebe o nome do bairro e retorna o cluster, risco e estatísticas
    Baseado na lógica do notebook TESTE
    
    Exemplo de requisição:
    {
        "bairro": "Boa Viagem"
    }
    """
    if df_bairros.empty:
        raise HTTPException(status_code=500, detail="Dados não carregados")
    
    bairro = data.get("bairro")
    
    if not bairro:
        raise HTTPException(status_code=400, detail="Você deve informar o nome do bairro.")
    
    # Busca o bairro (case insensitive)
    bairro_info = df_bairros[df_bairros['bairro'].str.lower() == bairro.lower()]
    
    if bairro_info.empty:
        bairros_disponiveis = df_bairros['bairro'].tolist()
        raise HTTPException(
            status_code=404, 
            detail=f"Bairro '{bairro}' não encontrado. Bairros disponíveis: {bairros_disponiveis}"
        )
    
    # Pega informações do bairro
    row = bairro_info.iloc[0]
    cluster_id = int(row['cluster'])
    nivel_risco = row['nivel_risco']
    
    # Estatísticas do bairro
    bairro_stats = {
        "media_suspeitos": round(row['media_suspeitos'], 2),
        "media_vitimas": round(row['media_vitimas'], 2),
        "percentual_com_arma": round(row['percentual_com_arma'] * 100, 1),
        "media_idade_suspeitos": round(row['media_idade_suspeitos'], 1),
        "media_hora": round(row['media_hora'], 1),
        "total_ocorrencias": int(row.get('total_ocorrencias', 0))
    }
    
    # Calcula posição no ranking baseado em total de ocorrências
    df_sorted = df_bairros.sort_values('total_ocorrencias', ascending=False)
    posicao_ranking = int(df_sorted.index.tolist().index(row.name) + 1)
    bairro_stats['posicao_no_ranking'] = posicao_ranking
    
    # Estatísticas do cluster
    cluster_data = df_bairros[df_bairros['cluster'] == cluster_id]
    cluster_stats_info = {
        "total_bairros_cluster": len(cluster_data),
        "bairros": cluster_data['bairro'].tolist(),
        "media_suspeitos": round(cluster_data['media_suspeitos'].mean(), 2),
        "media_vitimas": round(cluster_data['media_vitimas'].mean(), 2),
        "percentual_com_arma": round(cluster_data['percentual_com_arma'].mean() * 100, 1),
        "media_idade_suspeitos": round(cluster_data['media_idade_suspeitos'].mean(), 1),
        "media_hora": round(cluster_data['media_hora'].mean(), 1)
    }
    
    return {
        "bairro": bairro.title(),
        "cluster": cluster_id,
        "nivel_risco": nivel_risco,
        "descricao_cluster": descricoes_clusters.get(cluster_id, "Sem descrição definida"),
        "estatisticas_bairro": bairro_stats,
        "estatisticas_cluster": cluster_stats_info,
        "recomendacao": get_recomendacao(nivel_risco, row['media_suspeitos'])
    }

@router.get("/clusters/info")
def info_clusters():
    """
    Retorna informações sobre todos os clusters
    Baseado na lógica do notebook TESTE
    """
    if df_bairros.empty:
        raise HTTPException(status_code=500, detail="Dados não carregados")
    
    clusters_info = []
    
    for cluster_id in sorted(df_bairros['cluster'].unique()):
        cluster_data = df_bairros[df_bairros['cluster'] == cluster_id]
        nivel_risco = cluster_data['nivel_risco'].iloc[0]
        
        # Identifica bairro mais crítico do cluster (maior número de ocorrências)
        bairro_critico = cluster_data.loc[cluster_data['total_ocorrencias'].idxmax(), 'bairro']
        
        clusters_info.append({
            "cluster_id": int(cluster_id),
            "descricao": descricoes_clusters.get(cluster_id, "Sem descrição"),
            "nivel_risco": nivel_risco,
            "total_bairros": len(cluster_data),
            "bairros": cluster_data['bairro'].tolist(),
            "estatisticas": {
                "media_suspeitos": round(cluster_data['media_suspeitos'].mean(), 2),
                "media_vitimas": round(cluster_data['media_vitimas'].mean(), 2),
                "percentual_com_arma": round(cluster_data['percentual_com_arma'].mean() * 100, 1),
                "media_idade_suspeitos": round(cluster_data['media_idade_suspeitos'].mean(), 1),
                "media_hora": round(cluster_data['media_hora'].mean(), 1),
                "total_ocorrencias": int(cluster_data['total_ocorrencias'].sum()),
                "bairro_mais_critico": bairro_critico
            }
        })
    
    return {
        "total_clusters": len(clusters_info),
        "clusters": clusters_info
    }

@router.get("/bairros/ranking")
def ranking_bairros(limite: int = 50):
    """
    Retorna o ranking dos bairros por número de ocorrências de tráfico
    Baseado na lógica do notebook TESTE
    """
    if df_bairros.empty:
        raise HTTPException(status_code=500, detail="Dados não carregados")
    
    # Ordenar por total de ocorrências
    df_sorted = df_bairros.sort_values('total_ocorrencias', ascending=False)
    top_bairros = df_sorted.head(limite)
    
    ranking = []
    for idx, row in enumerate(top_bairros.itertuples(), 1):
        ranking.append({
            "posicao": idx,
            "bairro": row.bairro,
            "total_ocorrencias": int(row.total_ocorrencias),
            "cluster": int(row.cluster),
            "nivel_risco": row.nivel_risco,
            "media_suspeitos": round(row.media_suspeitos, 2),
            "percentual_com_arma": round(row.percentual_com_arma * 100, 1),
            "media_hora": round(row.media_hora, 1)
        })
    
    return {
        "total_bairros_analisados": len(df_bairros),
        "top_bairros": ranking
    }

def get_recomendacao(risco: str, media_suspeitos: float) -> str:
    """
    Retorna recomendação baseada no nível de risco e perfil do bairro
    Baseado na lógica do notebook TESTE
    """
    if risco == "Alto":
        return "⚠️ ATENÇÃO MÁXIMA: Área de alto risco! Perfil com elevado número de suspeitos e ocorrências armadas. Recomenda-se policiamento ostensivo, investigação aprofundada e ações preventivas imediatas."
    elif risco == "Médio":
        if media_suspeitos >= 2.0:
            return "⚡ MONITORAMENTO REFORÇADO: Área de risco médio com perfil de tráfico organizado (múltiplos suspeitos). Manter vigilância constante e estratégias de inteligência policial."
        else:
            return "⚡ MONITORAMENTO: Área de risco médio. Manter vigilância regular e ações preventivas focadas no combate ao tráfico."
    else:
        return "✅ PATRULHAMENTO REGULAR: Área de baixo risco. Manter patrulhamento preventivo e ações comunitárias de segurança."
