"""
Script para treinar o modelo supervisionado de predição de crimes

"""

import pandas as pd
import numpy as np
import joblib
import os
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor, HistGradientBoostingRegressor
from sklearn.preprocessing import OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
import itertools



# 1. Carregar dados
<<<<<<< HEAD
print("\n Carregando dados...")
df = pd.read_csv("../data/raw/dataset_ocorrencias_delegacia_5.csv")
print(f" {len(df)} registros carregados")
=======
print("\n📂 Carregando dados...")
df = pd.read_csv("data/raw/dataset_ocorrencias_delegacia_5.csv")
print(f"✅ {len(df)} registros carregados")
>>>>>>> master

# 2. Preparar dados
print("\n Preparando dados...")
df['data_ocorrencia'] = pd.to_datetime(df['data_ocorrencia'])
df["ano"] = df["data_ocorrencia"].dt.year
df["mes"] = df["data_ocorrencia"].dt.month

# Filtrar apenas tráfico
df_trafico = df[df['tipo_crime'].str.contains("Tráfico", case=False, na=False)]
print(f"{len(df_trafico)} registros de tráfico")

# Agrupar por bairro, ano e mês
df_grouped = (
    df_trafico.groupby(['bairro', 'ano', 'mes'])
    .size()
    .reset_index(name='quantidade_crimes')
)
df_grouped = df_grouped.sort_values(by=['bairro', 'ano', 'mes'])

# Criar lags (lag1 a lag6)
print("\n Criando features de histórico (lags)...")
for i in range(1, 7):
    df_grouped[f'lag{i}'] = df_grouped.groupby('bairro')['quantidade_crimes'].shift(i)

df_grouped = df_grouped.fillna(0)

# Adicionar features extras do df original
print("\ Adicionando features extras")
# Agregar vitimas, suspeitos por bairro/ano/mes
extras = df_trafico.groupby(['bairro', 'ano', 'mes']).agg({
    'quantidade_vitimas': 'mean',
    'quantidade_suspeitos': 'mean'
}).reset_index()

df_grouped = df_grouped.merge(extras, on=['bairro', 'ano', 'mes'], how='left')
df_grouped = df_grouped.fillna(1)

# Adicionar arma_utilizada (valor padrão)
df_grouped['arma_utilizada'] = 'Arma de Fogo'

# Adicionar estação do ano
def estacao_do_ano(mes):
    if mes in [12, 1, 2]:
        return "Verão"
    elif mes in [3, 4, 5]:
        return "Outono"
    elif mes in [6, 7, 8]:
        return "Inverno"
    else:
        return "Primavera"

df_grouped['estacao'] = df_grouped['mes'].apply(estacao_do_ano)

print(f" Features criadas: {list(df_grouped.columns)}")

# 3. Preparar X e y
print("\n Preparando conjunto de treino/teste...")
features = ['bairro', 'ano', 'mes', 'lag1', 'lag2', 'lag3', 'lag4', 'lag5', 'lag6',
            'quantidade_vitimas', 'quantidade_suspeitos', 'arma_utilizada', 'estacao']

X = df_grouped[features]
y = df_grouped['quantidade_crimes']

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, shuffle=True
)

print(f"Treino: {len(X_train)} amostras")
print(f"Teste: {len(X_test)} amostras")

# 4. Criar preprocessador
print("\n Criando pipeline...")
preprocessor = ColumnTransformer([
    ('cat', OneHotEncoder(handle_unknown='ignore'), ['bairro', 'arma_utilizada', 'estacao'])
], remainder='passthrough')

# 5. Testar dois modelos
modelos = {
    'RandomForest': RandomForestRegressor(
        n_estimators=200,
        max_depth=15,
        min_samples_split=5,
        random_state=42,
        n_jobs=-1
    ),
    'HistGradientBoosting': HistGradientBoostingRegressor(
        max_iter=200,
        max_depth=10,
        learning_rate=0.1,
        random_state=42
    )
}

resultados = {}

for nome, modelo in modelos.items():
    print(f"\n Treinando {nome}")
    
    pipeline = Pipeline([
        ('prep', preprocessor),
        ('model', modelo)
    ])
    
    pipeline.fit(X_train, y_train)
    y_pred = pipeline.predict(X_test)
    
    # Métricas
    mae = mean_absolute_error(y_test, y_pred)
    mse = mean_squared_error(y_test, y_pred)
    rmse = np.sqrt(mse)
    r2 = r2_score(y_test, y_pred)
    
    resultados[nome] = {
        'mae': mae,
        'rmse': rmse,
        'r2': r2,
        'pipeline': pipeline
    }
    
    print(f"  MAE:  {mae:.4f}")
    print(f"  RMSE: {rmse:.4f}")
    print(f"  R²:   {r2:.4f}")

# 6. Escolher melhor modelo
print("\n" + "=" * 70)
print("COMPARAÇÃO DE MODELOS")
print("=" * 70)

melhor_modelo = min(resultados.items(), key=lambda x: x[1]['mae'])
melhor_nome = melhor_modelo[0]
melhor_pipeline = melhor_modelo[1]['pipeline']

print(f"\nMelhor modelo: {melhor_nome}")
print(f"  MAE:  {resultados[melhor_nome]['mae']:.4f}")
print(f"  RMSE: {resultados[melhor_nome]['rmse']:.4f}")
print(f"  R²:   {resultados[melhor_nome]['r2']:.4f}")

# 7. Salvar modelo
<<<<<<< HEAD
print("\nSalvando modelo.")
os.makedirs("../app/models", exist_ok=True)

joblib.dump(melhor_pipeline, "../app/models/modelo_supervisionado.pkl")
print("Modelo salvo em: ../app/models/modelo_supervisionado.pkl")
=======
print("\n💾 Salvando modelo...")
os.makedirs("app/models", exist_ok=True)

joblib.dump(melhor_pipeline, "app/models/modelo_supervisionado.pkl")
print("✅ Modelo salvo em: app/models/modelo_supervisionado.pkl")
>>>>>>> master

# 8. Testar predição
print("\n" + "=" * 70)
print("TESTE DE PREDIÇÃO")
print("=" * 70)

teste_bairro = "Boa Viagem"
teste_ano = 2025
teste_mes = 11

# Buscar lags do bairro
lags_teste = df_grouped[df_grouped['bairro'] == teste_bairro].tail(6)
if len(lags_teste) > 0:
    lag_values = lags_teste['quantidade_crimes'].values[-6:]
    # Preencher com 0 se não houver histórico suficiente
    while len(lag_values) < 6:
        lag_values = np.append(lag_values, 0)
else:
    lag_values = [0] * 6

dados_teste = pd.DataFrame([{
    'bairro': teste_bairro,
    'ano': teste_ano,
    'mes': teste_mes,
    'lag1': lag_values[0] if len(lag_values) > 0 else 0,
    'lag2': lag_values[1] if len(lag_values) > 1 else 0,
    'lag3': lag_values[2] if len(lag_values) > 2 else 0,
    'lag4': lag_values[3] if len(lag_values) > 3 else 0,
    'lag5': lag_values[4] if len(lag_values) > 4 else 0,
    'lag6': lag_values[5] if len(lag_values) > 5 else 0,
    'quantidade_vitimas': 1,
    'quantidade_suspeitos': 1,
    'arma_utilizada': 'Arma de Fogo',
    'estacao': estacao_do_ano(teste_mes)
}])

previsao = melhor_pipeline.predict(dados_teste)[0]
print(f"\n Bairro: {teste_bairro}")
print(f"Período: {teste_mes:02d}/{teste_ano}")
print(f"Previsão: {previsao:.2f} crimes")

print("\n" + "=" * 70)
print("TREINAMENTO CONCLUÍDO COM SUCESSO!")
print("=" * 70)
