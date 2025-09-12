# 🔍 Projeto de Predição de Crimes

Este projeto utiliza técnicas de Machine Learning para análise e predição de ocorrências criminais com base em dados. O projeto inclui análise exploratória de dados (EDA), processamento de dados e modelos de predição usando Random Forest e XGboost

## 🎯 Propósito e Objetivo do Projeto

### 🌟 **Por que este projeto?**
A criminalidade urbana é um dos principais desafios enfrentados pelas grandes cidades brasileiras. Recife, como uma importante metrópole do Nordeste, necessita de ferramentas inteligentes e baseadas em dados para combater efetivamente a violência e melhorar a segurança pública.

### 🚀 **Objetivo Principal**
**Diminuir a quantidade de crimes nos bairros de Recife através da predição inteligente de quando e onde estes crimes têm maior probabilidade de acontecer.**

### 📊 **Objetivos Específicos**
- **Análise Preditiva**: Identificar padrões temporais e geográficos que precedem ocorrências criminais
- **Prevenção Proativa**: Fornecer insights para que as autoridades possam atuar preventivamente
- **Otimização de Recursos**: Auxiliar na alocação eficiente do policiamento nos bairros de maior risco
- **Redução da Criminalidade**: Contribuir para a diminuição dos índices de criminalidade através de ações baseadas em dados
- **Segurança Pública**: Melhorar a sensação de segurança da população recifense

### 🎯 **Impacto Esperado**
Com predições precisas sobre **quando** e **onde** crimes podem ocorrer, as forças de segurança podem:
- Posicionar estrategicamente equipes de patrulhamento
- Intensificar a vigilância em períodos e locais de maior risco
- Implementar ações preventivas direcionadas
- Reduzir o tempo de resposta a ocorrências
- Contribuir para a construção de uma cidade mais segura

## 📁 Estrutura do Projeto

```
Crime_prediction/
├── README.md                           # Este arquivo
├── requirements.txt                    # Dependências do projeto
├── data/                              # Dados do projeto
│   ├── raw/                          # Dados brutos (não processados)
│   │   └── dataset_ocorrencias_delegacia_5.csv
│   └── processed/                    # Dados processados (gerados pelos notebooks)
├── docs/                             # Documentação adicional
├── models/                           # Modelos treinados
│   ├── modelo_random_forest_all_features.pkl
│   └── modelo_random_forest_reduzido.pkl
└── notebooks/                        # Jupyter Notebooks
    ├── EDA.ipynb                     # Análise Exploratória de Dados
    └── processamento.ipynb           # Processamento e Modelagem
```

## 📊 Descrição das Pastas

### 📂 `data/`
- **`raw/`**: Contém os dados originais não processados
  - `dataset_ocorrencias_delegacia_5.csv`: Dataset principal com informações de ocorrências criminais incluindo:
    - ID da ocorrência
    - Data e hora
    - Localização (bairro, latitude, longitude)
    - Tipo de crime
    - Detalhes da ocorrência (modus operandi, arma utilizada, etc.)
    - Informações sobre vítimas e suspeitos
    - Status da investigação

- **`processed/`**: Dados processados e prontos para modelagem (gerados durante a execução dos notebooks)

### 🤖 `models/`
Modelos de Machine Learning treinados e salvos:
- `modelo_random_forest_all_features.pkl`: Modelo usando todas as features disponíveis
- `modelo_random_forest_reduzido.pkl`: Modelo com features reduzidas/selecionadas

### 📓 `notebooks/`
- **`EDA.ipynb`**: Análise Exploratória de Dados
  - Visualizações estatísticas
  - Análise de distribuições
  - Correlações entre variáveis
  - Identificação de padrões temporais e geográficos

- **`processamento.ipynb`**: Processamento de Dados e Modelagem
  - Limpeza e transformação dos dados
  - Engenharia de features
  - Treinamento de modelos de Machine Learning
  - Avaliação de performance dos modelos

### 📚 `docs/`
Documentação adicional do projeto 

## 🚀 Como Executar o Projeto

### Pré-requisitos
- Python 3.7+
- Jupyter Notebook ou JupyterLab

### 1. Instalação das Dependências

```bash
# Clone ou baixe o projeto
# Navegue até a pasta do projeto
cd Crime_prediction

# Instale as dependências
pip install -r requirements.txt
```

### 2. Executando a Análise

#### Passo 1: Análise Exploratória
```bash
# Abra o Jupyter Notebook
jupyter notebook

# Navegue para notebooks/EDA.ipynb
# Execute todas as células para ver a análise exploratória dos dados
```

#### Passo 2: Processamento e Modelagem
```bash
# Abra o notebook de processamento
# notebooks/processamento.ipynb
# Execute todas as células para:
# - Processar os dados
# - Treinar os modelos
# - Salvar os modelos treinados
```

### 3. Usando os Modelos Treinados

Os modelos salvos na pasta `models/` podem ser carregados e utilizados:

```python
import pickle
import pandas as pd

# Carregar modelo
with open('models/modelo_random_forest_all_features.pkl', 'rb') as f:
    modelo = pickle.load(f)

# Fazer predições
# predicoes = modelo.predict(novos_dados)
```

## 📋 Dependências

O projeto utiliza as seguintes bibliotecas Python:

- **pandas** (2.0.3): Manipulação e análise de dados
- **numpy** (1.26.0): Computação científica
- **scikit-learn** (1.3.0): Machine Learning
- **matplotlib** (3.7.2): Visualizações básicas
- **seaborn** (0.12.2): Visualizações estatísticas avançadas

## 🎯 Funcionalidades

### Análise de Dados
- ✅ Análise estatística descritiva
- ✅ Visualizações de distribuições de crimes
- ✅ Análise temporal (padrões por data/hora)
- ✅ Análise geográfica (distribuição por bairros)
- ✅ Correlações entre variáveis

### Modelagem
- ✅ Preprocessamento de dados categóricos
- ✅ Engenharia de features temporais e geográficas
- ✅ Treinamento de modelos Random Forest
- ✅ Avaliação de performance dos modelos
- ✅ Comparação entre modelos completos e reduzidos


## 📈 Resultados Esperados

O projeto visa identificar:
- Padrões temporais de criminalidade
- Áreas de maior risco
- Fatores que influenciam diferentes tipos de crime
- Predições de ocorrências futuras baseadas em dados históricos

## 🤝 Contribuição

Para contribuir com o projeto:
1. Faça um fork do repositório
2. Crie uma branch para sua feature
3. Execute os notebooks para testar suas mudanças
4. Envie um pull request

## ⚠️ Considerações Importantes

- Os dados são fictícios e para fins educacionais
- As predições devem ser interpretadas com cautela
- O projeto não substitui análises profissionais de segurança pública
- Respeite sempre a privacidade e ética no uso de dados criminais

---

**Última atualização**: Setembro 2025