import os
from datetime import datetime
from typing import Optional, Dict, Any
import asyncio
from dotenv import load_dotenv
from huggingface_hub import InferenceClient

load_dotenv()

class AIEngine:
    def __init__(self):
        self.cerebras_available = False
        self.local_model_available = False
        
        # Configurar API de Cerebras - SOLO API, sin modelo local
        self.hf_api_key = os.getenv("HUGGINGFACE_API_KEY", "")
        if not self.hf_api_key or self.hf_api_key == "tu_clave_aqui":
            print("⚠️  ADVERTENCIA: HUGGINGFACE_API_KEY no configurada")
            print("   Configure .env con tu clave de HuggingFace")
            self.cerebras_client = None
            self.cerebras_available = False
            self.local_model_available = False
        else:
            try:
                self.cerebras_client = InferenceClient(
                    provider="cerebras",
                    api_key=self.hf_api_key
                )
                self.cerebras_available = True
                self.local_model_available = False
                print("✓ API de Cerebras configurada correctamente")
                print("ℹ️  Usando solo Cerebras API (sin modelo local)")
            except Exception as e:
                print(f"✗ Error configurando Cerebras: {e}")
                self.cerebras_client = None
                self.cerebras_available = False
                self.local_model_available = False
    
    def _load_local_model(self):
        """Modelo local deshabilitado - usando solo API de Cerebras"""
        # NO cargar modelos locales para evitar problemas de memoria
        self.local_loaded = False
        self.local_model_available = False
        print("ℹ️  Modo API-only: Solo usando Cerebras API")
    
    async def process_support_request(self, 
                                     message: str, 
                                     context: Dict[str, Any] = None,
                                     use_cerebras: bool = False) -> Dict:
        """
        Procesa una solicitud de soporte usando el modelo especificado
        """
        if context is None:
            context = {}
        
        # Solo usar Cerebras API (sin modelo local)
        if self.cerebras_available:
            response = await self._use_cerebras(message, context)
            model_used = "Cerebras (Llama-3.3-70B)"
        else:
            # Respuesta de fallback si no hay API configurada
            response = self._generate_fallback_response(message, context)
            model_used = "Fallback (API no configurada)"
        
        return {
            "reply": response,
            "confidence": 0.85,
            "model_used": model_used,
            "timestamp": datetime.now().isoformat()
        }
    
    async def _use_cerebras(self, message: str, context: Dict) -> str:
        """Usa la API de Cerebras para generar la respuesta"""
        try:
            # Crear el prompt mejorado para soporte técnico
            system_prompt = """Eres un asistente de soporte técnico altamente profesional y experto. 

TU FUNCIÓN:
- Solucionar problemas técnicos de manera efectiva y profesional
- Proporcionar soluciones claras, paso a paso
- Ser proactivo en la resolución de problemas
- Mantener un tono profesional pero amigable
- Anticipar problemas comunes y ofrecer soluciones preventivas

ESTILO DE COMUNICACIÓN:
- Responde de manera clara y estructurada
- Usa listas numeradas o con viñetas para pasos
- Incluye ejemplos prácticos cuando sea necesario
- Mantén respuestas concisas pero completas
- Sé empático con las dificultades del usuario

CUANDO NO SEPAS LA RESPUESTA:
- Admite que no estás seguro
- Ofrece buscar más información o escalar el problema
- Proporciona alternativas temporales si es posible"""
            
            response = self.cerebras_client.chat.completions.create(
                model="meta-llama/Llama-3.3-70B-Instruct",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": message}
                ],
                max_tokens=800,
                temperature=0.6
            )
            
            return response.choices[0].message.content
        except Exception as e:
            print(f"Error con Cerebras: {e}")
            raise  # Re-lanzar error para que se use el fallback
    
    async def _use_local_model_disabled(self, message: str, context: Dict) -> str:
        """Usa el modelo local para generar la respuesta"""
        try:
            # Preparar el mensaje en formato chat para Qwen2.5-3B-Instruct
            system_message = "Eres un asistente de soporte técnico profesional. Proporciona soluciones claras, útiles y específicas para problemas técnicos. Sé empático, profesional y proactivo en la resolución de problemas."
            
            # Formato de mensajes para el modelo
            messages = [
                {"role": "system", "content": system_message},
                {"role": "user", "content": message}
            ]
            
            # Aplicar template de chat
            text = self.local_tokenizer.apply_chat_template(
                messages,
                tokenize=False,
                add_generation_prompt=True
            )
            
            # Tokenizar
            model_inputs = self.local_tokenizer([text], return_tensors="pt").to(self.local_model.device)
            
            # Generar respuesta
            with torch.no_grad():
                generated_ids = self.local_model.generate(
                    **model_inputs,
                    max_new_tokens=512,
                    temperature=0.7,
                    top_p=0.9,
                    do_sample=True
                )
            
            # Decodificar respuesta
            generated_ids = [
                output_ids[len(input_ids):] for input_ids, output_ids in zip(model_inputs.input_ids, generated_ids)
            ]
            
            response = self.local_tokenizer.batch_decode(generated_ids, skip_special_tokens=True)[0]
            
            return response.strip()
        except Exception as e:
            print(f"Error con modelo local: {e}")
            import traceback
            traceback.print_exc()
            return self._generate_fallback_response(message, context)
    
    def _generate_fallback_response(self, message: str, context: Dict) -> str:
        """Genera una respuesta de fallback cuando los modelos no están disponibles"""
        fallback_responses = [
            "He recibido tu consulta. Un agente de soporte te contactará pronto.",
            "Estamos procesando tu solicitud. Gracias por tu paciencia.",
            "Tu consulta ha sido registrada. Te responderemos lo antes posible."
        ]
        
        import random
        return random.choice(fallback_responses)
    
    async def analyze_sentiment(self, message: str) -> Dict:
        """Analiza el sentimiento del mensaje"""
        # Clasificación simple de sentimiento
        positive_words = ["gracias", "excelente", "genial", "perfecto", "ayuda"]
        negative_words = ["problema", "error", "no funciona", "mal", "urgente"]
        
        message_lower = message.lower()
        positive_count = sum(1 for word in positive_words if word in message_lower)
        negative_count = sum(1 for word in negative_words if word in message_lower)
        
        if positive_count > negative_count:
            sentiment = "positive"
            score = 0.7
        elif negative_count > positive_count:
            sentiment = "negative"
            score = 0.3
        else:
            sentiment = "neutral"
            score = 0.5
        
        return {
            "sentiment": sentiment,
            "score": score,
            "message": message
        }

