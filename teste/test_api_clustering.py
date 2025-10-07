"""
Script para testar a API 
"""
import requests
import json

BASE_URL = "http://localhost:8000/clustering"

print("Testando API de Clustering ")
print("=" * 70)

# Teste 1: Listar todos os bairros
print("\nTestando GET /clustering/")
try:
    response = requests.get(f"{BASE_URL}/")
    if response.status_code == 200:
        data = response.json()
        print(f"Total de bairros: {data['total_bairros']}")
        print(f"Primeiros 3 bairros:")
        for bairro in data['bairros'][:3]:
            print(f"{bairro['bairro']}: Cluster {bairro['cluster']}, "
                  f"Risco {bairro['nivel_risco']}, "
                  f"{bairro['media_suspeitos']:.2f} suspeitos/ocorrência, "
                  f"{bairro['percentual_com_arma']:.1f}% com arma")
    else:
        print(f"Erro: {response.status_code}")
except Exception as e:
    print(f" Erro: {e}")

# Teste 2: Informações dos clusters
print("\nTestando GET /clustering/clusters/info")
try:
    response = requests.get(f"{BASE_URL}/clusters/info")
    if response.status_code == 200:
        data = response.json()
        print(f"Total de clusters: {data['total_clusters']}")
        for cluster in data['clusters']:
            print(f"\nCluster {cluster['cluster_id']} - Risco {cluster['nivel_risco']}:")
            print(f"Descrição: {cluster['descricao']}")
            print(f"Total de bairros: {cluster['total_bairros']}")
            print(f"Média de suspeitos: {cluster['estatisticas']['media_suspeitos']}")
            print(f"Percentual com arma: {cluster['estatisticas']['percentual_com_arma']:.1f}%")
            print(f"Horário médio: {cluster['estatisticas']['media_hora']:.1f}h")
            print(f"Total de ocorrências: {cluster['estatisticas']['total_ocorrencias']}")
            print(f"Bairro mais crítico: {cluster['estatisticas']['bairro_mais_critico']}")
            print(f"Bairros: {', '.join(cluster['bairros'])}")
    else:
        print(f"Erro: {response.status_code}")
except Exception as e:
    print(f"Erro: {e}")

# Teste 3: Ranking de bairros
print("\nTestando GET /clustering/bairros/ranking")
try:
    response = requests.get(f"{BASE_URL}/bairros/ranking?limite=5")
    if response.status_code == 200:
        data = response.json()
        print(f"Top 5 bairros com mais ocorrências:")
        for item in data['top_bairros']:
            print(f"{item['posicao']}º - {item['bairro']}: "
                  f"{item['total_ocorrencias']} ocorrências, "
                  f"{item['media_suspeitos']:.2f} suspeitos/ocorrência, "
                  f"{item['percentual_com_arma']:.1f}% com arma, "
                  f"Risco: {item['nivel_risco']}")
    else:
        print(f"Erro: {response.status_code}")
except Exception as e:
    print(f"Erro: {e}")

# Teste 4: Predição para bairros específicos
print("\nTestando POST /clustering/predict")
bairros_teste = ["Boa Viagem", "Torre", "Afogados"]
for bairro in bairros_teste:
    try:
        response = requests.post(
            f"{BASE_URL}/predict",
            json={"bairro": bairro}
        )
        if response.status_code == 200:
            data = response.json()
            print(f"\n{data['bairro']}:")
            print(f"Cluster: {data['cluster']} - Risco: {data['nivel_risco']}")
            print(f"Média de suspeitos: {data['estatisticas_bairro']['media_suspeitos']}")
            print(f"Média de vítimas: {data['estatisticas_bairro']['media_vitimas']}")
            print(f"Percentual com arma: {data['estatisticas_bairro']['percentual_com_arma']}%")
            print(f"Horário médio: {data['estatisticas_bairro']['media_hora']}h")
            print(f"Idade média dos suspeitos: {data['estatisticas_bairro']['media_idade_suspeitos']} anos")
            print(f"Total de ocorrências: {data['estatisticas_bairro']['total_ocorrencias']}")
            print(f"Posição no ranking: {data['estatisticas_bairro']['posicao_no_ranking']}º")
            print(f"Recomendação: {data['recomendacao']}")
        else:
            print(f"Erro para {bairro}: {response.status_code}")
    except Exception as e:
        print(f"Erro para {bairro}: {e}")

print("\n" + "=" * 70)
print("Testes concluídos!")
