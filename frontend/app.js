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
        messageDiv.className = 'flex items-start gap-3 mb-6 animate-slide-in-right';
        messageDiv.innerHTML = `
            <div class="flex-1"></div>
            <div class="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl rounded-tr-sm px-6 py-4 shadow-lg max-w-md">
                <div class="prose prose-invert prose-sm max-w-none">
                    <p>${escapeHtml(text)}</p>
                </div>
                <p class="text-xs text-white/70 mt-2">${getCurrentTime()}</p>
            </div>
            <div class="flex-shrink-0 w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                <svg class="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                </svg>
            </div>
        `;
    } else if (type === 'ai') {
        messageDiv.className = 'flex items-start gap-3 mb-6 animate-slide-in-left';
        messageDiv.innerHTML = `
            <div class="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center shadow-lg">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
                </svg>
            </div>
            <div class="flex-1 bg-white rounded-2xl rounded-tl-sm px-6 py-4 shadow-sm border border-gray-100 max-w-3xl">
                <div class="prose prose-sm max-w-none">${renderMarkdown(text)}</div>
                <p class="text-xs text-gray-400 mt-2">${getCurrentTime()}</p>
            </div>
            <div class="flex-1"></div>
        `;
    } else if (type === 'error') {
        messageDiv.className = 'flex items-start gap-3 mb-6 animate-fade-in-up';
        messageDiv.innerHTML = `
            <div class="flex-shrink-0 w-10 h-10 bg-red-500 rounded-full flex items-center justify-center">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
            </div>
            <div class="flex-1 bg-red-50 border border-red-200 rounded-2xl rounded-tl-sm px-6 py-4 max-w-3xl">
                <p class="text-red-600 text-sm">${escapeHtml(text)}</p>
                <p class="text-xs text-red-400 mt-2">${getCurrentTime()}</p>
            </div>
            <div class="flex-1"></div>
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
    loadingDiv.id = loadingId;
    loadingDiv.className = 'flex items-start gap-3 mb-6 animate-fade-in-up';
    loadingDiv.innerHTML = `
        <div class="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center shadow-lg">
            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
            </svg>
        </div>
        <div class="flex-1 bg-white rounded-2xl rounded-tl-sm px-6 py-4 shadow-sm border border-gray-100">
            <div class="flex items-center gap-2">
                <span class="text-gray-600 text-sm">Escribiendo</span>
                <div class="flex gap-1">
                    <div class="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style="animation-delay: 0ms"></div>
                    <div class="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style="animation-delay: 150ms"></div>
                    <div class="w-2 h-2 bg-pink-500 rounded-full animate-bounce" style="animation-delay: 300ms"></div>
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

// Renderizar Markdown a HTML
function renderMarkdown(text) {
    let html = escapeHtml(text);
    
    // Procesar código inline primero (antes de bloques)
    html = html.replace(/`([^`\n]+)`/g, '<code>$1</code>');
    
    // Procesar bloques de código
    html = html.replace(/```(\w+)?\n?([\s\S]*?)```/g, '<pre><code>$2</code></pre>');
    
    // Procesar encabezados
    html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');
    
    // Procesar negritas (después de código)
    html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');
    
    // Procesar listas numeradas
    html = html.replace(/^\d+\.\s+(.*)$/gm, '<ol><li>$1</li></ol>');
    html = html.replace(/<\/ol>\s*<ol>/g, '');
    
    // Procesar listas con viñetas
    html = html.replace(/^[-*]\s+(.*)$/gm, '<ul><li>$1</li></ul>');
    html = html.replace(/<\/ul>\s*<ul>/g, '');
    
    // Procesar saltos de línea
    html = html.replace(/\n\n/g, '</p><p>');
    html = html.replace(/\n/g, '<br>');
    
    return html;
}

// Formatear mensaje (convertir saltos de línea a HTML) - DEPRECATED
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
        <div class="flex items-start gap-3 mb-6 animate-fade-in-up">
            <div class="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center shadow-lg">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
                </svg>
            </div>
            <div class="flex-1 bg-white rounded-2xl rounded-tl-sm px-6 py-4 shadow-sm border border-gray-100">
                <div class="prose prose-sm max-w-none">
                    <p class="font-semibold text-gray-900">¡Hola! Soy SupportFlow 👋</p>
                    <p class="text-gray-700">Soy tu asistente de soporte técnico inteligente. ¿En qué puedo asistirte hoy?</p>
                    <div class="mt-4 pt-4 border-t border-gray-200">
                        <p class="text-sm text-gray-600">Desarrollado por <strong class="text-indigo-600">Francisco Castaño</strong> • 
                            <a href="https://www.linkedin.com/in/francisco-salgado-casta%C3%B1o-77a952277/" target="_blank" class="text-[#0a66c2] hover:underline font-medium">LinkedIn</a>
                        </p>
                    </div>
                </div>
                <p class="text-xs text-gray-400 mt-2">Ahora</p>
            </div>
        </div>
    `;
}

// Exportar funciones para uso en HTML
window.sendMessage = sendMessage;
window.clearChat = clearChat;
