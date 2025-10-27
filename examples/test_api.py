#!/usr/bin/env python3
"""
Ejemplo de uso de la API de SupportFlow
"""

import requests
import json

API_URL = "http://localhost:8000"

def test_health():
    """Verifica el estado del servidor"""
    print("🔍 Verificando estado del servidor...")
    response = requests.get(f"{API_URL}/health")
    data = response.json()
    
    print(f"✓ Estado: {data['status']}")
    print(f"✓ Cerebras disponible: {data['cerebras_available']}")
    print(f"✓ Modelo local disponible: {data['local_model_available']}")
    print()

def test_chat(message, use_cerebras=False):
    """Prueba el endpoint de chat"""
    print(f"💬 Enviando mensaje: '{message}'")
    print(f"🤖 Usando: {'Cerebras' if use_cerebras else 'Modelo Local'}")
    
    response = requests.post(
        f"{API_URL}/chat",
        json={
            "message": message,
            "context": {},
            "use_cerebras": use_cerebras
        }
    )
    
    data = response.json()
    
    print(f"📝 Respuesta: {data['reply']}")
    print(f"📊 Modelo usado: {data['model_used']}")
    print(f"📈 Confianza: {data['confidence'] * 100:.0f}%")
    print()

def test_sentiment(message):
    """Prueba el análisis de sentimiento"""
    print(f"😊 Analizando sentimiento de: '{message}'")
    
    response = requests.post(
        f"{API_URL}/analyze",
        json={"message": message}
    )
    
    data = response.json()
    
    sentiment_emoji = {
        "positive": "😊",
        "negative": "😟",
        "neutral": "😐"
    }
    
    emoji = sentiment_emoji.get(data['sentiment'], "❓")
    print(f"{emoji} Sentimiento: {data['sentiment']}")
    print(f"📊 Score: {data['score'] * 100:.0f}%")
    print()

def main():
    """Ejecuta las pruebas"""
    print("=" * 60)
    print("🧪 PRUEBAS DE SUPORTFLOW API")
    print("=" * 60)
    print()
    
    try:
        # Test 1: Health check
        test_health()
        
        # Test 2: Chat con modelo local
        test_chat("Hola, ¿puedes ayudarme?", use_cerebras=False)
        
        # Test 3: Análisis de sentimiento positivo
        test_sentiment("¡Gracias por la ayuda! Es excelente.")
        
        # Test 4: Análisis de sentimiento negativo
        test_sentiment("Tengo un problema urgente, nada funciona")
        
        # Test 5: Chat con consulta técnica
        test_chat("Mi aplicación no inicia, ¿qué puedo hacer?", use_cerebras=False)
        
        print("=" * 60)
        print("✓ Todas las pruebas completadas")
        print("=" * 60)
        
    except requests.exceptions.ConnectionError:
        print("❌ Error: No se puede conectar al servidor")
        print("💡 Asegúrate de que el servidor esté corriendo en http://localhost:8000")
        print("💡 Ejecuta: cd backend && python main.py")
    except Exception as e:
        print(f"❌ Error inesperado: {e}")

if __name__ == "__main__":
    main()

