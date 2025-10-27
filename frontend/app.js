// SupportFlow - Cliente JavaScript
// Detectar automáticamente la URL del backend
const API_URL = window.location.origin;

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    checkHealth();
    setupEventListeners();
    setupCharacterCounter();
});

// Setup contador de caracteres
function setupCharacterCounter() {
    const input = document.getElementById('user-input');
    const charCount = document.getElementById('char-count');
    
    input.addEventListener('input', () => {
        charCount.textContent = input.value.length;
    });
}

// Auto-resize del textarea
function autoResizeTextarea() {
    const textarea = document.getElementById('user-input');
    textarea.style.height = 'auto';
    textarea.style.height = textarea.scrollHeight + 'px';
}

document.getElementById('user-input').addEventListener('input', autoResizeTextarea);

// Verificar salud del servidor
async function checkHealth() {
    try {
        const response = await fetch(`${API_URL}/health`);
        const data = await response.json();
        
        const statusText = document.getElementById('status-text');
        if (data.status === 'healthy') {
            statusText.textContent = '✓ En línea';
            statusText.style.opacity = '1';
        }
    } catch (error) {
        console.error('Error conectando al servidor:', error);
        document.getElementById('status-text').textContent = '✗ Desconectado';
    }
}

// Configurar listeners de eventos
function setupEventListeners() {
    const userInput = document.getElementById('user-input');
    const sendButton = document.getElementById('send-button');
    
    // Enviar con Enter
    userInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });
    
    console.log('SupportFlow inicializado - Modo API Cerebras');
}

// Enviar mensaje
async function sendMessage() {
    const input = document.getElementById('user-input');
    const message = input.value.trim();
    
    if (!message) return;
    
    // Usar siempre Cerebras (solo API)
    const useCerebras = true;
    
    // Agregar mensaje del usuario
    addMessage(message, 'user');
    
    // Limpiar input
    input.value = '';
    input.disabled = true;
    autoResizeTextarea();
    document.getElementById('char-count').textContent = '0';
    
    // Mostrar indicador de carga
    const loadingId = addLoadingMessage();
    
    try {
        const response = await fetch(`${API_URL}/chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message: message,
                context: {},
                use_cerebras: useCerebras
            })
        });
        
        const data = await response.json();
        
        // Remover indicador de carga
        removeLoadingMessage(loadingId);
        
        // Agregar respuesta
        addMessage(data.reply, 'ai');
        
    } catch (error) {
        console.error('Error:', error);
        removeLoadingMessage(loadingId);
        addMessage('❌ Error al procesar la solicitud. Por favor, intenta de nuevo.', 'error');
    } finally {
        input.disabled = false;
        input.focus();
    }
}

// Agregar mensaje al chat
function addMessage(text, type) {
    const chatMessages = document.getElementById('chat-messages');
    const messageId = `msg-${Date.now()}`;
    
    const messageDiv = document.createElement('div');
    messageDiv.id = messageId;
    
    if (type === 'user') {
        messageDiv.className = 'user-message';
        messageDiv.innerHTML = `
            <div class="message-bubble user-bubble">
                <div class="message-text"><p>${escapeHtml(text)}</p></div>
                <div class="message-time">${getCurrentTime()}</div>
            </div>
            <div class="user-avatar">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                </svg>
            </div>
        `;
    } else if (type === 'ai') {
        messageDiv.className = 'welcome-message';
        messageDiv.innerHTML = `
            <div class="avatar ai-avatar">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
                </svg>
            </div>
            <div class="message-bubble ai-message">
                <div class="message-text">${formatMessage(text)}</div>
                <div class="message-time">${getCurrentTime()}</div>
            </div>
        `;
    } else if (type === 'error') {
        messageDiv.className = 'welcome-message';
        messageDiv.innerHTML = `
            <div class="avatar ai-avatar">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
            </div>
            <div class="message-bubble ai-message" style="background: #fee2e2; border-color: #fecaca;">
                <div class="message-text" style="color: #dc2626;"><p>${escapeHtml(text)}</p></div>
                <div class="message-time">${getCurrentTime()}</div>
            </div>
        `;
    }
    
    chatMessages.appendChild(messageDiv);
    
    // Scroll automático
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    return messageId;
}

// Agregar mensaje de carga
function addLoadingMessage() {
    const chatMessages = document.getElementById('chat-messages');
    const loadingId = `loading-${Date.now()}`;
    
    const loadingDiv = document.createElement('div');
    loadingId.id = loadingId;
    loadingDiv.className = 'welcome-message';
    loadingDiv.innerHTML = `
        <div class="avatar ai-avatar">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
            </svg>
        </div>
        <div class="message-bubble ai-message">
            <div class="loading-message">
                <span>Escribiendo</span>
                <div class="loading-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        </div>
    `;
    
    chatMessages.appendChild(loadingDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    return loadingId;
}

// Remover mensaje de carga
function removeLoadingMessage(loadingId) {
    const element = document.getElementById(loadingId);
    if (element) {
        element.remove();
    }
}

// Formatear mensaje (convertir saltos de línea a HTML)
function formatMessage(text) {
    return text.split('\n').map(line => `<p>${escapeHtml(line)}</p>`).join('');
}

// Escapar HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Obtener hora actual
function getCurrentTime() {
    return new Date().toLocaleTimeString('es-ES', { 
        hour: '2-digit', 
        minute: '2-digit' 
    });
}

// Limpiar chat
function clearChat() {
    const chatMessages = document.getElementById('chat-messages');
    chatMessages.innerHTML = `
        <div class="welcome-message">
            <div class="avatar ai-avatar">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
                </svg>
            </div>
            <div class="message-bubble ai-message">
                <div class="message-text">
                    <p><strong>¡Hola! 👋</strong></p>
                    <p>Soy el asistente de soporte técnico de SupportFlow, desarrollado por <strong>Francisco Castaño</strong>.</p>
                    <p>Estoy aquí para ayudarte a resolver cualquier problema técnico. ¿En qué puedo asistirte hoy?</p>
                </div>
                <div class="message-time">Ahora</div>
            </div>
        </div>
    `;
}

// Exportar funciones para uso en HTML
window.sendMessage = sendMessage;
window.clearChat = clearChat;
