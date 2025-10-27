#!/usr/bin/env python3
"""
Ejemplo de integración con SupportFlow
Simula un sistema de tickets con integración de IA
"""

import requests
import json
from datetime import datetime
from typing import List, Dict

class SupportFlowIntegration:
    """Clase para integrar SupportFlow con sistemas existentes"""
    
    def __init__(self, api_url: str = "http://localhost:8000"):
        self.api_url = api_url
        self.tickets = []
    
    def create_ticket(self, user_name: str, issue: str, priority: str = "normal") -> Dict:
        """Crea un nuevo ticket de soporte"""
        # Primero, analiza el sentimiento de la consulta
        try:
            sentiment_data = requests.post(
                f"{self.api_url}/analyze",
                json={"message": issue}
            ).json()
            
            # Autoelevar prioridad si el sentimiento es negativo
            if sentiment_data['sentiment'] == 'negative' and priority == 'normal':
                priority = 'high'
        except:
            sentiment_data = {"sentiment": "neutral", "score": 0.5}
        
        # Generar respuesta automática con IA
        try:
            response_data = requests.post(
                f"{self.api_url}/chat",
                json={
                    "message": issue,
                    "context": {
                        "user": user_name,
                        "priority": priority
                    },
                    "use_cerebras": False  # Cambiar a True para mayor calidad
                }
            ).json()
            
            ai_reply = response_data['reply']
        except:
            ai_reply = "Hemos recibido tu consulta. Un agente te contactará pronto."
        
        # Crear ticket
        ticket = {
            "id": len(self.tickets) + 1,
            "user": user_name,
            "issue": issue,
            "ai_reply": ai_reply,
            "sentiment": sentiment_data['sentiment'],
            "priority": priority,
            "status": "pending",
            "created_at": datetime.now().isoformat()
        }
        
        self.tickets.append(ticket)
        return ticket
    
    def get_ticket(self, ticket_id: int) -> Dict:
        """Obtiene un ticket por ID"""
        for ticket in self.tickets:
            if ticket['id'] == ticket_id:
                return ticket
        return None
    
    def list_tickets(self, filter_by: str = None) -> List[Dict]:
        """Lista todos los tickets"""
        if filter_by:
            return [t for t in self.tickets if t['status'] == filter_by]
        return self.tickets
    
    def update_ticket_status(self, ticket_id: int, status: str):
        """Actualiza el estado de un ticket"""
        ticket = self.get_ticket(ticket_id)
        if ticket:
            ticket['status'] = status
            return ticket
        return None

# Ejemplo de uso
def main():
    """Demostración de uso"""
    print("=" * 60)
    print("🔗 INTEGRACIÓN DE SUPORTFLOW")
    print("=" * 60)
    print()
    
    # Inicializar integración
    support = SupportFlowIntegration()
    
    # Caso 1: Ticket con problema técnico
    print("📋 Creando ticket 1...")
    ticket1 = support.create_ticket(
        user_name="Juan Pérez",
        issue="Mi cuenta no inicia sesión, ya intenté varias veces",
        priority="normal"
    )
    print(f"✓ Ticket creado: #{ticket1['id']}")
    print(f"  Usuario: {ticket1['user']}")
    print(f"  Prioridad: {ticket1['priority']} (auto-elevada por sentimiento)")
    print(f"  Respuesta IA: {ticket1['ai_reply'][:80]}...")
    print()
    
    # Caso 2: Ticket con agradecimiento
    print("📋 Creando ticket 2...")
    ticket2 = support.create_ticket(
        user_name="María González",
        issue="Gracias por el excelente servicio, todo funcionó perfectamente"
    )
    print(f"✓ Ticket creado: #{ticket2['id']}")
    print(f"  Sentimiento: {ticket2['sentiment']}")
    print()
    
    # Caso 3: Ticket con consulta general
    print("📋 Creando ticket 3...")
    ticket3 = support.create_ticket(
        user_name="Carlos Rodriguez",
        issue="¿Cómo cambio mi plan de suscripción?"
    )
    print(f"✓ Ticket creado: #{ticket3['id']}")
    print(f"  Respuesta IA: {ticket3['ai_reply'][:80]}...")
    print()
    
    # Listar todos los tickets
    print("📊 Resumen de tickets:")
    print(f"  Total: {len(support.list_tickets())}")
    print(f"  Pendientes: {len(support.list_tickets('pending'))}")
    print()
    
    # Detalles de un ticket específico
    print("🔍 Detalles del ticket #1:")
    details = support.get_ticket(1)
    print(json.dumps(details, indent=2, ensure_ascii=False))
    
    print()
    print("=" * 60)
    print("✓ Integración completada")
    print("=" * 60)

if __name__ == "__main__":
    try:
        main()
    except requests.exceptions.ConnectionError:
        print("❌ Error: No se puede conectar al servidor")
        print("💡 Inicia el servidor: cd backend && python main.py")
    except Exception as e:
        print(f"❌ Error: {e}")

