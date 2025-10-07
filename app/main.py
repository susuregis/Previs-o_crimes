from fastapi import FastAPI
from app import clustering, supervisionado

app = FastAPI(
    title="API de Predição de Crimes - Recife",
    description="""
    API completa para análise e predição de crimes de tráfico de drogas nos bairros de Recife.
    
    ## Modelos:
    
    ### Modelo Não Supervisionado (Clustering)
    - Agrupa bairros por padrões de criminalidade
    - Identifica áreas de alto risco
    - Classificação automática por clusters
    
    ### Modelo Supervisionado (Predição)
    - Prevê quantidade exata de crimes por período
    - Utiliza histórico e contexto para predições
    - Recomendações baseadas em níveis de risco
    """,
    version="2.0.0"
)

# Inclui as rotas de clustering (não supervisionado)
app.include_router(clustering.router, prefix="/clustering", tags=["Clustering - Não Supervisionado"])

# Inclui as rotas de predição (supervisionado)
app.include_router(supervisionado.router, prefix="/predicao", tags=["Predição - Supervisionado"])

@app.get("/")
def home():
    return {
        "mensagem": "API de Predição de Crimes - Recife",
        "versao": "2.0.0",
        "status": "online",
        "documentacao": "/docs",
        "modelos_carregados": {
            "clustering": True,
            "supervisionado": True
        },
        "modelos": {
            "clustering": {
                "descricao": "Modelo não supervisionado para agrupamento de bairros",
                "endpoints": {
                    "listar_bairros": "/clustering/",
                    "prever_cluster": "/clustering/predict",
                    "info_clusters": "/clustering/clusters/info",
                    "ranking_bairros": "/clustering/bairros/ranking"
                }
            },
            "predicao": {
                "descricao": "Modelo supervisionado para previsão de crimes",
                "endpoints": {
                    "info_modelo": "/predicao/",
                    "prever_crimes": "/predicao/predict",
                    "prever_multiplos": "/predicao/predict/multiplos",
                    "historico_bairro": "/predicao/historico/{bairro}"
                }
            }
        }
    }
