#  Previsão de Crimes - Recife

Um projeto de análise de dados e machine learning para previsão de crimes na região metropolitana do Recife, com foco em análise exploratória e modelagem preditiva baseada em dados históricos de ocorrências policiais.

## Objetivo

Este projeto tem como objetivo desenvolver um modelo de machine learning capaz de prever a ocorrência de crimes por bairro e período temporal, contribuindo para estratégias de segurança pública mais eficazes e alocação otimizada de recursos policiais.

## Estrutura do Projeto

```
├── data/
│   └── raw/
│       └── dataset_ocorrencias_delegacia_5.csv    # Dataset com 5.000+ ocorrências
├── notebooks/
│   ├── EDA.ipynb                                  # Análise Exploratória de Dados
│   └── processamento.ipynb                        # Processamento e Modelagem
├── requirements.txt                               # Dependências do projeto
└── README.md                                      # Documentação do projeto
```

## 🔍 Dataset

O dataset contém **5.002 registros** de ocorrências policiais com as seguintes características:

### Variáveis Principais:
- **`data_ocorrencia`**: Data e hora da ocorrência
- **`bairro`**: Localização (Boa Viagem, Imbiribeira, Santo Amaro, etc.)
- **`tipo_crime`**: Categorias (Homicídio, Roubo, Furto, Sequestro, etc.)
- **`descricao_modus_operandi`**: Método utilizado no crime
- **`arma_utilizada`**: Tipo de arma (Arma de Fogo, Faca, Objeto Contundente, etc.)
- **`quantidade_vitimas`**: Número de vítimas
- **`quantidade_suspeitos`**: Número de suspeitos
- **`sexo_suspeito`** e **`idade_suspeito`**: Perfil demográfico
- **`orgao_responsavel`**: Delegacia responsável

### Período Coberto:
**2022 - 2025** (dados incluem projeções futuras para validação do modelo)

## 🛠️ Tecnologias Utilizadas

### Linguagem e Bibliotecas:
- **Python 3.x**
- **pandas 2.0.3** - Manipulação de dados
- **numpy 1.26.0** - Computação numérica
- **scikit-learn 1.3.0** - Machine learning
- **matplotlib 3.7.2** - Visualização
- **seaborn 0.12.2** - Visualização estatística

### Modelos de Machine Learning:
- **RandomForestRegressor** - Modelo baseline
- **HistGradientBoostingRegressor** - Modelo principal (escolhido)

## 📈 Metodologia

### 1. Análise Exploratória de Dados (EDA)
- Distribuição temporal dos crimes
- Análise por bairro e tipo de crime
- Padrões sazonais e tendências
- Correlações entre variáveis
- Visualizações interativas

### 2. Processamento de Dados
- Limpeza e tratamento de dados faltantes
- Engenharia de features temporais (lags)
- Criação de variáveis agregadas por bairro/mês
- Normalização e encoding de variáveis categóricas

### 3. Modelagem Preditiva
- **Problema**: Regressão para prever número de crimes por bairro/mês
- **Variável Target**: Quantidade de crimes agregada
- **Features**: Dados históricos, sazonalidade, características do bairro

### 4. Avaliação
- **Métricas**: MAE (Mean Absolute Error), RMSE, R²
- **Validação**: Train/test split temporal
- **Comparação**: RandomForest vs HistGradientBoosting

## 🏆 Resultados

### Modelo Escolhido: HistGradientBoostingRegressor

**Justificativa:**
- ✅ **Melhor performance**: Menores valores de MAE e RMSE
- ✅ **Captura padrões temporais**: Aproveita efetivamente os lags criados
- ✅ **Robustez**: Lida bem com dados desbalanceados
- ✅ **Precisão**: Maior capacidade preditiva para apoio à segurança pública

**Trade-offs:**
- ⚠️ Maior custo computacional
- ⚠️ Menor interpretabilidade comparado ao Random Forest

## 🚀 Como Executar

### 1. Pré-requisitos
```bash
# Clone o repositório
git clone [URL_DO_REPOSITORIO]
cd Previs-o_crimes-main

# Instale as dependências
pip install -r requirements.txt
```

### 2. Executar Análises
```bash
# Inicie o Jupyter Notebook
jupyter notebook

# Execute os notebooks na ordem:
# 1. notebooks/EDA.ipynb
# 2. notebooks/processamento.ipynb
```

### 3. Estrutura de Execução
1. **EDA.ipynb**: Execute todas as células para análise exploratória
2. **processamento.ipynb**: Execute para treinar e avaliar modelos

## 🎭 Contexto do Problema

### Caso Motivador
Em **março de 2025**, aproximadamente **R$ 300 mil em drogas** foram apreendidas no Centro de Tratamento de Encomendas dos Correios em Recife, evidenciando:

- **Rota interestadual**: SP → Recife → Interior do Nordeste
- **Sofisticação criminosa**: Uso de encomendas disfarçadas
- **Necessidade de prevenção**: Importância de modelos preditivos

### Impacto Esperado
- 📍 **Alocação eficiente** de recursos policiais
- ⏰ **Prevenção proativa** baseada em previsões
- 📊 **Tomada de decisão** baseada em dados
- 🏘️ **Segurança comunitária** melhorada

## 📝 Insights Principais

### Padrões Identificados:
- Concentração de crimes em determinados bairros
- Sazonalidade temporal das ocorrências
- Correlação entre tipo de crime e características do local
- Influência de fatores socioeconômicos

### Variáveis Mais Importantes:
- Histórico de crimes no bairro
- Sazonalidade (mês/dia da semana)
- Tipo de crime predominante na região
- Densidade populacional



## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.



<div align="center">
  <strong>📊 Dados • 🤖 Machine Learning • 🏛️ Segurança Pública</strong>
</div>