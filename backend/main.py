from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
import os
from dotenv import load_dotenv
from AIEngine import AIEngine

load_dotenv()

app = FastAPI(title="SupportFlow - Sistema de Automatización de Soporte")

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Inicializar el motor de IA
ai_engine = AIEngine()

# Servir archivos estáticos del frontend
frontend_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "frontend")
if os.path.exists(frontend_path):
    # Servir archivos estáticos desde la carpeta frontend
    app.mount("/static", StaticFiles(directory=frontend_path), name="static")
    
    # Ruta para servir el frontend
    @app.get("/frontend")
    @app.get("/frontend/")
    async def frontend_index():
        from fastapi.responses import FileResponse
        index_path = os.path.join(frontend_path, "index.html")
        if os.path.exists(index_path):
            return FileResponse(index_path)
        raise HTTPException(status_code=404, detail="Frontend no encontrado")
    
    # Servir archivos individuales del frontend
    @app.get("/frontend/{filename}")
    async def frontend_file(filename: str):
        from fastapi.responses import FileResponse
        file_path = os.path.join(frontend_path, filename)
        if os.path.exists(file_path):
            return FileResponse(file_path)
        raise HTTPException(status_code=404, detail="Archivo no encontrado")

class SupportRequest(BaseModel):
    message: str
    context: dict = {}
    use_cerebras: bool = False

class SupportResponse(BaseModel):
    reply: str
    confidence: float
    model_used: str
    timestamp: str

@app.get("/")
async def root():
    """Sirve el frontend automáticamente"""
    from fastapi.responses import FileResponse
    import os
    
    # Ruta al archivo index.html del frontend
    frontend_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "frontend")
    index_path = os.path.join(frontend_path, "index.html")
    
    if os.path.exists(index_path):
        return FileResponse(index_path)
    else:
        return {
            "message": "SupportFlow API",
            "version": "1.0.0",
            "endpoints": {
                "chat": "/chat",
                "health": "/health"
            },
            "note": "Frontend no encontrado"
        }

@app.get("/api")
async def api_info():
    """Información de la API"""
    return {
        "message": "SupportFlow API",
        "version": "1.0.0",
        "endpoints": {
            "health": "/health",
            "chat": "/chat",
            "analyze": "/analyze"
        }
    }

@app.get("/app.js")
async def serve_app_js():
    """Sirve el archivo JavaScript"""
    from fastapi.responses import FileResponse
    import os
    js_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "frontend", "app.js")
    if os.path.exists(js_path):
        return FileResponse(js_path, media_type="application/javascript")
    raise HTTPException(status_code=404, detail="app.js no encontrado")

@app.get("/styles.css")
async def serve_styles_css():
    """Sirve el archivo CSS"""
    from fastapi.responses import FileResponse
    import os
    css_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "frontend", "styles.css")
    if os.path.exists(css_path):
        return FileResponse(css_path, media_type="text/css")
    raise HTTPException(status_code=404, detail="styles.css no encontrado")

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "cerebras_available": ai_engine.cerebras_available,
        "local_model_available": ai_engine.local_model_available
    }

@app.post("/chat", response_model=SupportResponse)
async def chat(request: SupportRequest):
    """
    Procesa una consulta de soporte y devuelve una respuesta automática
    """
    try:
        response = await ai_engine.process_support_request(
            message=request.message,
            context=request.context,
            use_cerebras=request.use_cerebras
        )
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/analyze")
async def analyze_sentiment(request: SupportRequest):
    """
    Analiza el sentimiento de un mensaje de soporte
    """
    try:
        sentiment = await ai_engine.analyze_sentiment(request.message)
        return sentiment
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

