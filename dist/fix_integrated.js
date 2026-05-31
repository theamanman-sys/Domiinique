const fs = require('fs');
let html = fs.readFileSync('integrated.html', 'utf8');

// Find where exactly the broken auth handler starts
const authIndex = html.indexOf('// 2. AUTH HANDLER');
if (authIndex === -1) {
    console.error("Could not find auth handler marker!");
    process.exit(1);
}

const tail = `// 2. AUTH HANDLER
    async function checkCurrentAuth() {
        if (window.domAuth && window.domAuth.isReady()) {
            const user = window.domAuth.getUser();
            if (user) {
                renderDashboard(user);
            }
        } else {
            setTimeout(checkCurrentAuth, 200);
        }
    }

    // Handle the local login form
    const loginForm = document.getElementById('mod-login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const userIdent = document.getElementById('mod-login-user').value;
            const pass = document.getElementById('mod-login-pw').value;
            const msg = document.getElementById('mod-login-msg');
            const submitBtn = e.target.querySelector('button');

            submitBtn.disabled = true;
            submitBtn.textContent = 'Authenticating...';
            msg.textContent = '';

            try {
                const res = await window.domAuth.login(userIdent, pass);
                if (res.success) {
                    location.reload(); // Reload to trigger dashboard render
                } else {
                    msg.innerHTML = \`<span style="color:var(--accent);">\${res.message}</span>\`;
                    submitBtn.disabled = false;
                    submitBtn.textContent = 'Enter the Inner Circle';
                }
            } catch (err) {
                msg.textContent = 'System error occurred.';
                submitBtn.disabled = false;
                submitBtn.textContent = 'Enter the Inner Circle';
            }
        });
    }

    // Handle library filters
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const filter = btn.dataset.filter;
            renderLibrary(filter);
            
            // Show/hide cinema spotlight
            const spotlight = document.getElementById('cinema-spotlight');
            if (spotlight) {
                spotlight.style.display = (filter === 'movies') ? 'block' : 'none';
            }
        });
    });

    // Start check
    checkCurrentAuth();

    /* Tab logic for guest view */
    document.querySelectorAll('.members-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.members-tab, .members-panel').forEach(el => el.classList.remove('active'));
            tab.classList.add('active');
            document.getElementById('panel-' + tab.dataset.tab).classList.add('active');
        });
    });
    </script>

    <!-- ═══ GEMINI AI CHATBOT ═══ -->
    <button id="gemini-chat-btn" aria-label="Open AI Chat" title="Ask Domiinique AI">&#10022;</button>

    <div id="gemini-chat-panel" role="dialog" aria-label="Domiinique AI Assistant">
      <div class="chat-header">
        <div class="chat-header-icon">&#10022;</div>
        <div class="chat-header-text">
          <h4>Domiinique AI</h4>
          <p>Powered by Gemini — Ask me anything</p>
        </div>
        <button class="chat-close" id="chat-close-btn" aria-label="Close chat">&#x2715;</button>
      </div>
      <div id="chat-messages">
        <div class="chat-msg bot">Welcome. I am the Domiinique intelligence — here to guide your journey through the integrated system. What would you like to explore?</div>
      </div>
      <div class="chat-footer">
        <textarea id="chat-input" rows="1" placeholder="Ask about the Integrated System..."></textarea>
        <button id="chat-send">Send</button>
      </div>
    </div>

    <script>
    (function() {
        var GEMINI_KEY = 'AIzaSyCK1WibONu9l-hoAwkck3rmtyQTsDd18fU';
        var SYSTEM_CTX = 'You are the Domiinique AI, a sophisticated and elegant guide for the Domiinique Living Signature lifestyle system. Speak in a refined, clear, poetic manner. Help users understand the 10 pillars: body, mind, soul, relationships, financial life, environment, spiritual practice, lifestyle design. Keep responses concise (2-4 sentences). Do not mention Gemini or Google.';
        var history = [];
        var btn   = document.getElementById('gemini-chat-btn');
        var panel = document.getElementById('gemini-chat-panel');
        var msgs  = document.getElementById('chat-messages');
        var input = document.getElementById('chat-input');
        var send  = document.getElementById('chat-send');
        var closeBtn = document.getElementById('chat-close-btn');

        btn.addEventListener('click', function() {
            panel.classList.toggle('open');
            if (panel.classList.contains('open')) setTimeout(function(){ input.focus(); }, 50);
        });
        closeBtn.addEventListener('click', function() { panel.classList.remove('open'); });

        function addMsg(role, text) {
            var div = document.createElement('div');
            div.className = 'chat-msg ' + role;
            div.textContent = text;
            msgs.appendChild(div);
            msgs.scrollTop = msgs.scrollHeight;
            return div;
        }

        function askGemini(userText) {
            send.disabled = true;
            input.disabled = true;
            var typing = addMsg('bot typing', 'Thinking...');
            history.push({ role: 'user', parts: [{ text: userText }] });

            fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=' + GEMINI_KEY, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    systemInstruction: { parts: [{ text: SYSTEM_CTX }] },
                    contents: history
                })
            })
            .then(function(res) { return res.json(); })
            .then(function(data) {
                msgs.removeChild(typing);
                var reply = (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts[0])
                    ? data.candidates[0].content.parts[0].text
                    : 'I cannot respond right now. Please try again shortly.';
                history.push({ role: 'model', parts: [{ text: reply }] });
                addMsg('bot', reply);
            })
            .catch(function() {
                msgs.removeChild(typing);
                addMsg('bot', 'Connection interrupted. Please try again.');
            })
            .finally(function() {
                send.disabled = false;
                input.disabled = false;
                input.focus();
            });
        }

        send.addEventListener('click', function() {
            var text = input.value.trim();
            if (!text || send.disabled) return;
            addMsg('user', text);
            input.value = '';
            input.style.height = 'auto';
            askGemini(text);
        });
        input.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send.click(); }
        });
        input.addEventListener('input', function() {
            this.style.height = 'auto';
            this.style.height = Math.min(this.scrollHeight, 80) + 'px';
        });
    })();
    </script>
</body>
</html>`;

const newHtml = html.substring(0, authIndex) + tail;
fs.writeFileSync('integrated.html', newHtml);
console.log('Successfully fixed integrated.html');
