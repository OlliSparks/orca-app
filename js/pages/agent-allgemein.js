// ORCA 2.0 - Allgemein-Agent (ORCA-Kontext Only)
// Antwortet AUSSCHLIESSLICH aus Glossar + Website - kein allgemeines Wissen

class AgentAllgemeinPage {
    constructor() {
        this.messages = [];
        this.isLoading = false;
        this.glossar = [];
        this.websiteContent = {};
        this.websiteLoaded = false;
    }

    async render() {
        const container = document.getElementById('app');
        document.getElementById('headerTitle').textContent = 'orca 2.0 - Allgemein-Agent';
        document.getElementById('headerSubtitle').textContent = 'ORCA Wissensdatenbank';
        document.getElementById('headerStats').style.display = 'none';

        // Daten laden
        await this.loadOrcaData();

        if (this.messages.length === 0) {
            this.messages.push({ role: 'assistant', content: this.getGreeting() });
        }

        const hasApiKey = this.getApiKey();

        container.innerHTML = `
            <div class="allgemein-agent-page">
                <style>${this.getStyles()}</style>

                <div class="agent-layout">
                    <!-- Sidebar mit Quick-Links -->
                    <aside class="agent-sidebar">
                        <div class="sidebar-section">
                            <h3>Prozess-Agenten</h3>
                            <a href="#/agent-inventur" class="quick-link" onclick="router.navigate('/agent-inventur'); return false;">
                                📋 Inventur-Agent
                            </a>
                            <a href="#/agent-abl" class="quick-link" onclick="router.navigate('/agent-abl'); return false;">
                                📦 ABL-Agent
                            </a>
                            <a href="#/agent-verlagerung-beantragen" class="quick-link" onclick="router.navigate('/agent-verlagerung-beantragen'); return false;">
                                🚚 Verlagerungs-Agent
                            </a>
                            <a href="#/agent-vpw" class="quick-link" onclick="router.navigate('/agent-vpw'); return false;">
                                🔄 VPW-Agent
                            </a>
                        </div>

                        <div class="sidebar-section">
                            <h3>Nachschlagen</h3>
                            <a href="#/glossar" class="quick-link" onclick="router.navigate('/glossar'); return false;">
                                📖 Glossar oeffnen
                            </a>
                            <a href="https://ollisparks.github.io/Relaunch-Website/support.html" target="_blank" class="quick-link">
                                🌐 Support-Seite
                            </a>
                        </div>

                        <div class="sidebar-info">
                            <p>Dieser Agent antwortet <strong>ausschliesslich</strong> aus der ORCA-Wissensdatenbank (Glossar + Website).</p>
                            <p>Fragen ausserhalb des ORCA-Kontexts werden entsprechend gekennzeichnet.</p>
                        </div>
                    </aside>

                    <!-- Chat-Bereich -->
                    <main class="agent-main">
                        <div class="chat-container">
                            <div class="chat-header">
                                <span class="chat-icon">🤖</span>
                                <div class="chat-header-text">
                                    <h2>ORCA Wissens-Assistent</h2>
                                    <span class="chat-status">${hasApiKey ? '🟢 KI-gestuetzt' : '🟡 Offline-Modus'}</span>
                                </div>
                            </div>

                            <div id="chatMessages" class="chat-messages">
                                ${this.renderMessages()}
                            </div>

                            <div class="chat-input-area">
                                ${!hasApiKey ? `
                                    <div class="api-warning">
                                        Kein API Key - Antworten nur aus lokalem Glossar.
                                        <a href="#" onclick="router.navigate('/einstellungen'); return false;">API Key hinterlegen</a>
                                    </div>
                                ` : ''}
                                <div class="input-row">
                                    <textarea
                                        id="userInput"
                                        placeholder="Fragen Sie mich zu ORCA-Begriffen, Prozessen oder Rollen..."
                                        onkeydown="if(event.key==='Enter' && !event.shiftKey) { event.preventDefault(); agentAllgemeinPage.send(); }"
                                    ></textarea>
                                    <button onclick="agentAllgemeinPage.send()" class="send-btn" ${this.isLoading ? 'disabled' : ''}>
                                        ${this.isLoading ? '<span class="loading-dots">...</span>' : '➤'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </main>
                </div>
            </div>
        `;

        this.scrollToBottom();
    }

    async loadOrcaData() {
        // Glossar laden
        try {
            if (typeof onboardingService !== 'undefined' && onboardingService.getAllGlossaryTerms) {
                this.glossar = onboardingService.getAllGlossaryTerms() || [];
            }
        } catch (e) {
            console.warn('Glossar nicht verfuegbar:', e);
            this.glossar = [];
        }

        // Website-Inhalte laden (einmalig)
        if (!this.websiteLoaded) {
            await this.loadWebsiteContent();
        }
    }

    async loadWebsiteContent() {
        const baseUrl = 'https://ollisparks.github.io/Relaunch-Website/';
        const pages = ['support.html', 'prozesse.html', 'ueber-uns.html', 'lieferanten.html'];

        for (const page of pages) {
            try {
                const response = await fetch(baseUrl + page);
                if (response.ok) {
                    const html = await response.text();
                    // Text-Inhalt extrahieren (ohne HTML-Tags)
                    const tempDiv = document.createElement('div');
                    tempDiv.innerHTML = html;
                    // Script- und Style-Tags entfernen
                    tempDiv.querySelectorAll('script, style, nav, footer').forEach(el => el.remove());
                    const text = tempDiv.textContent || tempDiv.innerText || '';
                    // Bereinigen
                    this.websiteContent[page] = text.replace(/\s+/g, ' ').trim();
                }
            } catch (e) {
                console.warn('Website-Seite nicht ladbar:', page, e);
            }
        }
        this.websiteLoaded = true;
    }

    buildOrcaContext(query) {
        const q = query.toLowerCase();
        const results = {
            glossar: [],
            website: [],
            found: false
        };

        // Glossar durchsuchen
        for (const term of this.glossar) {
            const termName = (term.term || '').toLowerCase();
            const termShort = (term.short || '').toLowerCase();
            const termDesc = (term.description || '').toLowerCase();
            const termLong = (term.longDescription || '').toLowerCase();

            if (q.includes(termName) || termName.includes(q) ||
                q.includes(termShort) || termShort.includes(q) ||
                termDesc.includes(q) || termLong.includes(q)) {
                results.glossar.push(term);
                results.found = true;
            }
        }

        // Website-Inhalte durchsuchen
        for (const [page, content] of Object.entries(this.websiteContent)) {
            const contentLower = content.toLowerCase();
            if (contentLower.includes(q)) {
                // Relevanten Ausschnitt extrahieren (500 Zeichen um den Treffer)
                const idx = contentLower.indexOf(q);
                const start = Math.max(0, idx - 250);
                const end = Math.min(content.length, idx + 250);
                let snippet = content.substring(start, end);
                if (start > 0) snippet = '...' + snippet;
                if (end < content.length) snippet = snippet + '...';

                results.website.push({
                    page: page.replace('.html', ''),
                    snippet: snippet
                });
                results.found = true;
            }
        }

        return results;
    }

    formatContextForPrompt(context) {
        let text = '';

        if (context.glossar.length > 0) {
            text += '=== GLOSSAR-EINTRAEGE ===\n\n';
            for (const term of context.glossar) {
                text += `**${term.term}**`;
                if (term.short) text += ` (${term.short})`;
                text += '\n';
                if (term.description) text += `Kurz: ${term.description}\n`;
                if (term.longDescription) text += `Details: ${term.longDescription}\n`;
                if (term.related && term.related.length > 0) {
                    text += `Verwandte Begriffe: ${term.related.join(', ')}\n`;
                }
                text += '\n';
            }
        }

        if (context.website.length > 0) {
            text += '=== WEBSITE-INFORMATIONEN ===\n\n';
            for (const hit of context.website) {
                text += `### Seite: ${hit.page}\n`;
                text += hit.snippet + '\n\n';
            }
        }

        return text;
    }

    getSystemPrompt(context) {
        const hasContext = context.found;
        const contextText = this.formatContextForPrompt(context);

        return `Du bist der ORCA Wissens-Assistent. Du antwortest AUSSCHLIESSLICH auf Basis der folgenden ORCA-Wissensdatenbank.

STRIKTE REGELN:
1. Antworte NUR mit Informationen aus dem unten stehenden ORCA-Kontext
2. Wenn die Frage NICHT aus dem Kontext beantwortet werden kann, sage KLAR: "Diese Information ist nicht in der ORCA-Wissensdatenbank vorhanden."
3. ERFINDE NIEMALS Informationen - auch keine plausibel klingenden
4. Bei Abkuerzungen: Gib NUR die Definition aus dem Glossar, nicht dein allgemeines Wissen
5. Antworte auf Deutsch, kompakt und praezise
6. Verweise bei Prozess-Fragen auf den entsprechenden Spezial-Agenten

${hasContext ? `
VERFUEGBARER ORCA-KONTEXT:
${contextText}
` : `
HINWEIS: Zur Frage wurde KEIN passender Eintrag gefunden.
Antworte mit: "Zu dieser Frage habe ich keine Informationen in der ORCA-Wissensdatenbank gefunden. Bitte pruefen Sie das Glossar oder fragen Sie einen Spezial-Agenten."
`}

WICHTIG: Dein Wissen ist auf den obigen Kontext beschraenkt. Nutze KEIN externes Wissen.`;
    }

    getGreeting() {
        const hour = new Date().getHours();
        const greeting = hour < 12 ? 'Guten Morgen' : hour >= 18 ? 'Guten Abend' : 'Guten Tag';

        return `${greeting}! Ich bin der ORCA Wissens-Assistent.

Ich beantworte Fragen zu:
- **Begriffen** aus dem ORCA-Glossar (ABL, VPW, Status-Codes...)
- **Rollen** im System (IVL, WVL, VVL...)
- **Prozessen** (Inventur, Verlagerung, Verschrottung...)

Meine Antworten basieren **ausschliesslich** auf der ORCA-Wissensdatenbank.`;
    }

    renderMessages() {
        let html = this.messages.map(m => `
            <div class="message ${m.role}">
                <div class="message-avatar">${m.role === 'assistant' ? '🤖' : '👤'}</div>
                <div class="message-content">${this.formatMessage(m.content)}</div>
            </div>
        `).join('');

        // Typing indicator wenn Loading
        if (this.isLoading) {
            html += `
                <div class="message assistant typing">
                    <div class="message-avatar">🤖</div>
                    <div class="message-content">
                        <div class="typing-indicator">
                            <span class="typing-text">Durchsuche ORCA-Wissensdatenbank</span>
                            <span class="typing-dots">
                                <span></span><span></span><span></span>
                            </span>
                        </div>
                    </div>
                </div>
            `;
        }

        return html;
    }

    formatMessage(content) {
        return content
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/`(.*?)`/g, '<code>$1</code>')
            .replace(/\n/g, '<br>')
            .replace(/• /g, '&bull; ');
    }

    scrollToBottom() {
        const chat = document.getElementById('chatMessages');
        if (chat) chat.scrollTop = chat.scrollHeight;
    }

    async send() {
        const input = document.getElementById('userInput');
        const message = input.value.trim();

        if (!message || this.isLoading) return;

        this.messages.push({ role: 'user', content: message });
        input.value = '';
        this.isLoading = true;
        this.render();

        // ORCA-Kontext fuer diese Frage finden
        const context = this.buildOrcaContext(message);

        // Antwort generieren
        const response = await this.getResponse(message, context);

        this.messages.push({ role: 'assistant', content: response });
        this.isLoading = false;
        this.render();
    }

    getApiKey() {
        try {
            const config = JSON.parse(localStorage.getItem('orca_api_config') || '{}');
            return config.claudeApiKey || null;
        } catch {
            return null;
        }
    }

    async getResponse(message, context) {
        const apiKey = this.getApiKey();

        // Mit API Key: Claude mit ORCA-Kontext nutzen
        if (apiKey) {
            try {
                const systemPrompt = this.getSystemPrompt(context);

                const response = await fetch('https://api.anthropic.com/v1/messages', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-api-key': apiKey,
                        'anthropic-version': '2023-06-01',
                        'anthropic-dangerous-direct-browser-access': 'true'
                    },
                    body: JSON.stringify({
                        model: 'claude-sonnet-4-20250514',
                        max_tokens: 1024,
                        system: systemPrompt,
                        messages: [{ role: 'user', content: message }]
                    })
                });

                if (response.ok) {
                    const data = await response.json();
                    return data.content[0].text;
                }
            } catch (error) {
                console.error('API Error:', error);
            }
        }

        // Fallback: Lokale Antwort nur aus Kontext
        return this.getLocalResponse(message, context);
    }

    getLocalResponse(message, context) {
        // Wenn kein Kontext gefunden
        if (!context.found) {
            return `Zu dieser Frage habe ich keine Informationen in der ORCA-Wissensdatenbank gefunden.

**Moegliche Optionen:**
- Pruefen Sie das Glossar fuer Begriffsdefinitionen
- Nutzen Sie einen Spezial-Agenten fuer Prozess-Fragen
- Besuchen Sie die Support-Seite fuer weitere Hilfe`;
        }

        // Glossar-Treffer formatieren
        if (context.glossar.length > 0) {
            let response = '';
            for (const term of context.glossar) {
                response += `**${term.term}**`;
                if (term.short) response += ` (${term.short})`;
                response += '\n\n';
                if (term.description) response += term.description + '\n\n';
                if (term.longDescription) response += term.longDescription + '\n\n';
                if (term.related && term.related.length > 0) {
                    response += `*Verwandte Begriffe: ${term.related.join(', ')}*`;
                }
            }
            return response.trim();
        }

        // Website-Treffer formatieren
        if (context.website.length > 0) {
            let response = 'Aus der ORCA-Website:\n\n';
            for (const hit of context.website) {
                response += `**${hit.page}:** ${hit.snippet}\n\n`;
            }
            return response.trim();
        }

        return 'Keine passenden Informationen gefunden.';
    }

    getStyles() {
        return `
            .allgemein-agent-page {
                padding: 1rem;
                height: calc(100vh - 80px);
            }

            .agent-layout {
                display: grid;
                grid-template-columns: 280px 1fr;
                gap: 1.5rem;
                height: 100%;
                max-width: 1400px;
                margin: 0 auto;
            }

            .agent-sidebar {
                background: white;
                border-radius: 12px;
                padding: 1.5rem;
                box-shadow: 0 2px 8px rgba(0,0,0,0.08);
                height: fit-content;
                position: sticky;
                top: 1rem;
            }

            .sidebar-section {
                margin-bottom: 1.5rem;
                padding-bottom: 1.5rem;
                border-bottom: 1px solid #e5e7eb;
            }

            .sidebar-section:last-of-type {
                border-bottom: none;
                margin-bottom: 0;
                padding-bottom: 0;
            }

            .sidebar-section h3 {
                font-size: 0.85rem;
                font-weight: 600;
                color: #6b7280;
                text-transform: uppercase;
                letter-spacing: 0.05em;
                margin: 0 0 1rem 0;
            }

            .quick-link {
                display: block;
                padding: 0.625rem 0.75rem;
                color: #374151;
                text-decoration: none;
                border-radius: 8px;
                margin-bottom: 0.5rem;
                transition: all 0.2s;
            }

            .quick-link:hover {
                background: #f0f4ff;
                color: #2c4a8c;
            }

            .sidebar-info {
                background: #f0f4ff;
                border-radius: 8px;
                padding: 1rem;
                font-size: 0.85rem;
                color: #4b5563;
                line-height: 1.5;
            }

            .sidebar-info p { margin: 0 0 0.5rem 0; }
            .sidebar-info p:last-child { margin-bottom: 0; }

            .agent-main {
                display: flex;
                flex-direction: column;
                gap: 1rem;
                min-height: 0;
            }

            .chat-container {
                background: white;
                border-radius: 12px;
                box-shadow: 0 2px 8px rgba(0,0,0,0.08);
                display: flex;
                flex-direction: column;
                flex: 1;
                min-height: 500px;
                max-height: calc(100vh - 160px);
            }

            .chat-header {
                display: flex;
                align-items: center;
                gap: 1rem;
                padding: 1rem 1.5rem;
                background: linear-gradient(135deg, #2c4a8c 0%, #1e3a6e 100%);
                color: white;
                border-radius: 12px 12px 0 0;
            }

            .chat-icon { font-size: 2rem; }

            .chat-header-text h2 {
                margin: 0;
                font-size: 1.25rem;
                font-weight: 600;
            }

            .chat-status { font-size: 0.8rem; opacity: 0.9; }

            .chat-messages {
                flex: 1;
                overflow-y: auto;
                padding: 1.5rem;
            }

            .message {
                display: flex;
                gap: 0.75rem;
                margin-bottom: 1.25rem;
                max-width: 85%;
            }

            .message.user {
                margin-left: auto;
                flex-direction: row-reverse;
            }

            .message-avatar {
                width: 36px;
                height: 36px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                background: #e0e7ff;
                font-size: 1.1rem;
                flex-shrink: 0;
            }

            .message.user .message-avatar { background: #dbeafe; }

            .message-content {
                padding: 0.875rem 1.125rem;
                border-radius: 16px;
                line-height: 1.6;
                font-size: 0.95rem;
            }

            .message.assistant .message-content {
                background: #f0f4ff;
                color: #1e3a5f;
                border-bottom-left-radius: 4px;
            }

            .message.user .message-content {
                background: #2c4a8c;
                color: white;
                border-bottom-right-radius: 4px;
            }

            .chat-input-area {
                padding: 1rem 1.5rem;
                border-top: 1px solid #e5e7eb;
                background: #fafbfc;
                border-radius: 0 0 12px 12px;
            }

            .api-warning {
                background: #fef3c7;
                color: #92400e;
                padding: 0.625rem 1rem;
                border-radius: 8px;
                font-size: 0.85rem;
                margin-bottom: 0.75rem;
            }

            .api-warning a { color: #92400e; font-weight: 600; }

            .input-row { display: flex; gap: 0.75rem; }

            .input-row textarea {
                flex: 1;
                padding: 0.875rem 1rem;
                border: 1px solid #d1d5db;
                border-radius: 12px;
                resize: none;
                font-family: inherit;
                font-size: 0.95rem;
                min-height: 48px;
                max-height: 120px;
            }

            .input-row textarea:focus {
                outline: none;
                border-color: #2c4a8c;
                box-shadow: 0 0 0 3px rgba(44, 74, 140, 0.1);
            }

            .send-btn {
                width: 48px;
                height: 48px;
                border-radius: 50%;
                background: #2c4a8c;
                color: white;
                border: none;
                cursor: pointer;
                font-size: 1.25rem;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: background 0.2s;
            }

            .send-btn:hover:not(:disabled) { background: #1e3a6e; }
            .send-btn:disabled { background: #9ca3af; cursor: not-allowed; }

            .loading-dots { animation: pulse 1s infinite; }

            @keyframes pulse {
                0%, 100% { opacity: 0.5; }
                50% { opacity: 1; }
            }

            /* Typing Indicator */
            .typing-indicator {
                display: flex;
                align-items: center;
                gap: 0.5rem;
            }

            .typing-text {
                color: #6b7280;
                font-style: italic;
            }

            .typing-dots {
                display: flex;
                gap: 4px;
            }

            .typing-dots span {
                width: 6px;
                height: 6px;
                background: #2c4a8c;
                border-radius: 50%;
                animation: typingBounce 1.4s infinite ease-in-out;
            }

            .typing-dots span:nth-child(1) { animation-delay: 0s; }
            .typing-dots span:nth-child(2) { animation-delay: 0.2s; }
            .typing-dots span:nth-child(3) { animation-delay: 0.4s; }

            @keyframes typingBounce {
                0%, 80%, 100% { transform: scale(0.8); opacity: 0.5; }
                40% { transform: scale(1.2); opacity: 1; }
            }

            /* Dark Mode */
            [data-theme="dark"] .agent-sidebar,
            [data-theme="dark"] .chat-container { background: #1e293b; }

            [data-theme="dark"] .sidebar-section { border-bottom-color: #334155; }
            [data-theme="dark"] .sidebar-section h3 { color: #94a3b8; }
            [data-theme="dark"] .quick-link { color: #e2e8f0; }
            [data-theme="dark"] .quick-link:hover { background: #334155; color: #93c5fd; }

            [data-theme="dark"] .sidebar-info {
                background: #334155;
                color: #94a3b8;
            }

            [data-theme="dark"] .chat-messages { background: #1e293b; }
            [data-theme="dark"] .message.assistant .message-content { background: #334155; color: #e2e8f0; }
            [data-theme="dark"] .chat-input-area { background: #0f172a; border-top-color: #334155; }

            [data-theme="dark"] .input-row textarea {
                background: #1e293b;
                border-color: #334155;
                color: #e2e8f0;
            }

            [data-theme="dark"] .input-row textarea:focus { border-color: #60a5fa; }

            /* Responsive */
            @media (max-width: 900px) {
                .agent-layout {
                    grid-template-columns: 1fr;
                }

                .agent-sidebar {
                    position: static;
                    display: flex;
                    flex-wrap: wrap;
                    gap: 1rem;
                }

                .sidebar-section {
                    flex: 1;
                    min-width: 200px;
                    margin-bottom: 0;
                    padding-bottom: 0;
                    border-bottom: none;
                }

                .sidebar-info {
                    width: 100%;
                }
            }
        `;
    }
}

// Globale Instanz
const agentAllgemeinPage = new AgentAllgemeinPage();
