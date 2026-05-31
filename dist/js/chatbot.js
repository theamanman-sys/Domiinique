/**
 * DOMIINIQUE Intelligence (AI Chatbot)
 * A standalone, modular component using Google Gemini API for a seamless, anonymous experience.
 */
function initDOMIINIQUEChatbot() {
    // Configuration
    const API_KEY = "AIzaSyBH4EnM4wE0KHnew8G_7gXW9mDSiqFT_Kw";
    const MODEL = "gemini-2.5-flash";
    const SYSTEM_CTX = 'You are the Domiinique Intelligence — a sophisticated, elegant guide for the Domiinique Living Signature system. Your tone is refined, poetic, and sovereign. You assist users with the Integrated System, conscious living, and the ten sacred pillars. You represent the voice of Domiinique. You do not disclose your technical foundations. Respond with warmth and elevated presence. Keep your responses concise and strictly related to wellness and the Domiinique brand.';

    // Inject Stylesheet if not present
    if (!document.querySelector('link[href*="chatbot.css"]')) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'css/chatbot.css?v=3';
        document.head.appendChild(link);
    }

    // Build the Chatbot DOM Elements
    const chatHtml = `
        <button id="domiinique-chat-btn" aria-label="Open AI Chat" title="Ask Domiinique AI">
            <img src="assets/domiinique_logo.png" alt="Chat Icon" style="width: 40px; height: 40px; object-fit: contain; mix-blend-mode: screen; filter: brightness(1.2);">
        </button>
        <div id="domiinique-chat-panel" role="dialog" aria-label="Domiinique AI Assistant">
          <div class="chat-header">
            <div class="chat-header-icon">
                <img src="assets/domiinique_logo.png" alt="Domiinique Logo" style="width: 24px; height: 24px; object-fit: contain; mix-blend-mode: screen;">
            </div>
            <div class="chat-header-text">
              <h4>Domiinique Intelligence</h4>
              <p>Powered by Domiinique</p>
            </div>
            <button class="chat-close" id="chat-close-btn" aria-label="Close chat">&#x2715;</button>
          </div>
          <div id="chat-messages">
            <div class="chat-msg bot">Welcome. I am the Domiinique intelligence — here to guide your journey. How may I serve your highest timeline today?</div>
          </div>
          <div class="chat-footer">
            <textarea id="chat-input" rows="1" placeholder="Enter your inquiry..."></textarea>
            <button id="chat-send">Send</button>
          </div>
        </div>
    `;

    console.log("[DOMIINIQUE AI] Initializing with Gemini API...");

    const inject = () => {
        if (!document.body) {
            setTimeout(inject, 100);
            return;
        }

        if (document.getElementById('domiinique-chatbot-wrapper')) return;

        const chatContainer = document.createElement('div');
        chatContainer.id = 'domiinique-chatbot-wrapper';
        chatContainer.innerHTML = chatHtml;
        document.body.appendChild(chatContainer);
        
        setupLogic();
    };

    const setupLogic = () => {
        const btn      = document.getElementById('domiinique-chat-btn');
        const panel    = document.getElementById('domiinique-chat-panel');
        const msgs     = document.getElementById('chat-messages');
        const input    = document.getElementById('chat-input');
        const send     = document.getElementById('chat-send');
        const closeBtn = document.getElementById('chat-close-btn');

        // Maintain conversation history for context
        let history = [];

        btn.addEventListener('click', () => {
            panel.classList.toggle('open');
            if (panel.classList.contains('open')) setTimeout(() => input.focus(), 50);
        });
        
        closeBtn.addEventListener('click', () => panel.classList.remove('open'));

        function addMsg(role, text, isTyping = false) {
            const div = document.createElement('div');
            div.className = 'chat-msg ' + role;
            
            if (isTyping) {
                div.innerHTML = '<div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div>';
            } else {
                div.innerHTML = text.replace(/\n/g, '<br/>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
            }
            
            msgs.appendChild(div);
            setTimeout(() => { msgs.scrollTop = msgs.scrollHeight; }, 10);
            return div;
        }

        async function askDOMIINIQUEAI(userText) {
            send.disabled = true;
            input.disabled = true;
            const typing = addMsg('bot typing', '', true);
            console.log("[DOMIINIQUE AI] Sending request to Gemini...");
            
            try {
                // Switching back to v1beta which matches the verified model list
                const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`;
                
                const payload = {
                    system_instruction: {
                        parts: [{ text: SYSTEM_CTX }]
                    },
                    contents: [
                        ...history,
                        { role: 'user', parts: [{ text: userText }] }
                    ],
                    generationConfig: {
                        temperature: 0.7,
                        topK: 40,
                        topP: 0.95,
                        maxOutputTokens: 1024,
                    }
                };

                const response = await fetch(endpoint, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                if (!response.ok) {
                    const errorDetails = await response.json();
                    console.error("[DOMIINIQUE AI] API Error:", errorDetails);
                    throw new Error(errorDetails.error?.message || `Error ${response.status}: ${response.statusText}`);
                }

                const data = await response.json();
                console.log("[DOMIINIQUE AI] Received response:", data);
                
                if (data.promptFeedback?.blockReason) {
                    throw new Error(`Content blocked: ${data.promptFeedback.blockReason}`);
                }

                const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "I am reflecting on your resonance.";

                if (typing.parentNode) msgs.removeChild(typing);
                addMsg('bot', reply);
                
                history.push({ role: 'user', parts: [{ text: userText }] });
                history.push({ role: 'model', parts: [{ text: reply }] });
                
                if (history.length > 20) history = history.slice(-20);

            } catch (err) {
                console.error('[DOMIINIQUE AI] Chat Error:', err);
                if (typing.parentNode) msgs.removeChild(typing);
                addMsg('bot', 'The connection is temporarily shadowed. I am reflecting on your resonance. Please try again soon.');
            } finally {
                send.disabled = false;
                input.disabled = false;
                setTimeout(() => input.focus(), 50);
            }
        }

        send.addEventListener('click', () => {
            const text = input.value.trim();
            if (!text || send.disabled) return;
            addMsg('user', text);
            input.value = '';
            input.style.height = 'auto';
            askDOMIINIQUEAI(text);
        });

        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) { 
                e.preventDefault(); 
                send.click(); 
            }
        });

        input.addEventListener('input', function() {
            this.style.height = 'auto';
            this.style.height = Math.min(this.scrollHeight, 100) + 'px';
        });
    };

    inject();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDOMIINIQUEChatbot);
} else {
    initDOMIINIQUEChatbot();
}
