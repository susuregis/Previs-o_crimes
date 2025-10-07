"""
Script para recriar os modelos de clustering 
Lógica: Agrupa bairros por perfil de tráfico usando média de suspeitos, vítimas, armas, idade e horário
"""
import pandas as pd
import numpy as np
import joblib
import os
from sklearn.preprocessing import StandardScaler, MinMaxScaler
from sklearn.cluster import KMeans



# Carrega dados
df = pd.read_csv("../data/processed/dados_processados.csv")
print(f"Dados carregados: {len(df)} registros")

# Filtra apenas crimes de tráfico
df_trafico = df[df['tipo_crime'].str.contains('tráfico', case=False, na=False)].copy()
print(f"Crimes de tráfico: {len(df_trafico)} registros")

# Cria coluna indicando se tem arma
df_trafico['tem_arma'] = np.where(df_trafico['arma_utilizada'].str.lower() != 'não informado', 1, 0)

# Agrupa por bairro calculando médias
df_bairros = df_trafico.groupby('bairro').agg({
    'quantidade_suspeitos': 'mean',
    'quantidade_vitimas': 'mean',
    'tem_arma': 'mean',  # percentual de ocorrências com arma
    'idade_suspeito': 'mean',
    'hora': 'mean'       # horário médio das ocorrências
}).reset_index()

# Renomear colunas
df_bairros.rename(columns={
    'quantidade_suspeitos': 'media_suspeitos',
    'quantidade_vitimas': 'media_vitimas',
    'tem_arma': 'percentual_com_arma',
    'idade_suspeito': 'media_idade_suspeitos',
    'hora': 'media_hora'
}, inplace=True)

print(f"Bairros agrupados: {len(df_bairros)} bairros")

# Preenche valores ausentes com a média
df_bairros.fillna(df_bairros.mean(numeric_only=True), inplace=True)

# Padroniza os dados para clustering
scaler = StandardScaler()
X = scaler.fit_transform(df_bairros.drop(columns='bairro'))
print(f"Dados padronizados: {X.shape}")

# Clustering com KMeans (4 clusters)
k = 4
kmeans = KMeans(n_clusters=k, random_state=42)
df_bairros['cluster'] = kmeans.fit_predict(X)
print(f"Clusters criados: {k}")

# Calcular médias de cada cluster
cluster_stats = df_bairros.groupby('cluster').agg({
    'media_suspeitos': 'mean',
    'media_vitimas': 'mean',
    'percentual_com_arma': 'mean',
    'media_idade_suspeitos': 'mean',
    'media_hora': 'mean'
}).reset_index()

# Normalizar as métricas de risco (entre 0 e 1)
scaler_risk = MinMaxScaler()
cluster_scaled = scaler_risk.fit_transform(cluster_stats[['media_suspeitos', 'percentual_com_arma', 'media_hora']])

cluster_stats[['suspeitos_norm', 'arma_norm', 'hora_norm']] = cluster_scaled

# Criar um "índice de risco" combinando as métricas
cluster_stats['indice_risco'] = (
    0.5 * cluster_stats['suspeitos_norm'] +
    0.3 * cluster_stats['arma_norm'] +
    0.2 * cluster_stats['hora_norm']
)

# Classificar o risco com base no índice
def classificar_risco(valor):
    if valor >= 0.66:
        return 'Alto'
    elif valor >= 0.33:
        return 'Médio'
    else:
        return 'Baixo'

cluster_stats['nivel_risco'] = cluster_stats['indice_risco'].apply(classificar_risco)

# Juntar com o dataframe principal
df_bairros = df_bairros.merge(cluster_stats[['cluster', 'nivel_risco']], on='cluster', how='left')

print("\nAnálise dos clusters:")
for c in range(k):
    cluster_data = df_bairros[df_bairros['cluster'] == c]
    nivel_risco = cluster_data['nivel_risco'].iloc[0]
    print(f"\n  Cluster {c} - Nível de Risco: {nivel_risco}")
    print(f"- {len(cluster_data)} bairros: {list(cluster_data['bairro'].values)}")
    print(f"- Média de suspeitos: {cluster_data['media_suspeitos'].mean():.2f}")
    print(f"- Percentual com arma: {cluster_data['percentual_com_arma'].mean()*100:.1f}%")
    print(f"- Horário médio: {cluster_data['media_hora'].mean():.1f}h")
    print(f"- Idade média: {cluster_data['media_idade_suspeitos'].mean():.1f} anos")

# Criar pasta de modelos
os.makedirs("../app/models", exist_ok=True)

# Salvar modelos e dados
joblib.dump(kmeans, "../app/models/kmeans_model.pkl")
joblib.dump(scaler, "../app/models/scaler.pkl")
joblib.dump(scaler_risk, "../app/models/scaler_risk.pkl")

# Salvar dataframe com clusters e estatísticas para uso na API
df_bairros.to_csv("../app/models/bairros_clusters.csv", index=False)
cluster_stats.to_csv("../app/models/cluster_stats.csv", index=False)


print("\nArquivos salvos em ../app/models/:")
print("kmeans_model.pkl - Modelo KMeans (4 clusters)")
print("scaler.pkl - StandardScaler para features")
print("scaler_risk.pkl - MinMaxScaler para cálculo de risco")
print("bairros_clusters.csv - Dados dos bairros com clusters")
print("cluster_stats.csv - Estatísticas dos clusters")

