"""
Script para testar a API de predição supervisionada
"""
import requests
import json

BASE_URL = "http://127.0.0.1:8000"


# Teste 1: Informações do modelo
print("\nTestando informações do modelo...")
try:
    response = requests.get(f"{BASE_URL}/predicao/")
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print(f"Modelo: {data.get('modelo')}")
        print(f"Bairros disponíveis: {len(data.get('bairros_disponiveis', []))}")
        print(f"Exemplos: {data.get('bairros_disponiveis', [])[:5]}")
    else:
        print(f"Erro: {response.text}")
except Exception as e:
    print(f"Erro de conexão: {e}")

# Teste 2: Predição simples
print("\nTestando predição para Boa Viagem...")
try:
    payload = {
        "bairro": "Boa Viagem",
        "ano": 2025,
        "mes": 11,
        "quantidade_vitimas": 1,
        "quantidade_suspeitos": 1,
        "arma_utilizada": "Nenhum"
    }
    
    response = requests.post(f"{BASE_URL}/predicao/predict", json=payload)
    print(f"Status: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        print(f"Bairro: {data.get('bairro')}")
        print(f"Período: {data.get('periodo')}")
        print(f"Previsão: {data.get('previsao_crimes')} crimes")
        print(f"Nível de risco: {data.get('nivel_risco')}")
        print(f"Recomendação: {data.get('recomendacao')}")
    else:
        print(f"Erro: {response.text}")
        print(f"Detalhes: {response.json()}")
except Exception as e:
    print(f"Erro: {e}")

# Teste 3: Lista de bairros do clustering
print("\nTestando lista de bairros")
try:
    response = requests.get(f"{BASE_URL}/clustering/")
    print(f"Status: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        print(f"Total de bairros: {data.get('total_bairros')}")
        bairros = [b['bairro'] for b in data.get('bairros', [])]
        print(f"Bairros: {bairros}")
    else:
        print(f"Erro: {response.text}")
except Exception as e:
    print(f"Erro: {e}")

# Teste 4: Predição com dados mínimos
print("\nTestando predição com dados mínimos...")
try:
    payload = {
        "bairro": "Boa Viagem",
        "ano": 2025,
        "mes": 11
    }
    
    response = requests.post(f"{BASE_URL}/predicao/predict", json=payload)
    print(f"Status: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        print(f"Previsão: {data.get('previsao_crimes')} crimes")
        print(f"Nível: {data.get('nivel_risco')}")
    else:
        print(f"Erro: {response.json().get('detail')}")
except Exception as e:
    print(f"Erro: {e}")

print("\n" + "=" * 70)
print("TESTE CONCLUÍDO")
print("=" * 70)
