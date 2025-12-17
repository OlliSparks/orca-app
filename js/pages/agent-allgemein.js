// ORCA 2.0 - Allgemein-Agent (Königs-Agent)
// Freier KI-Assistent mit Claude-Anbindung

class AgentAllgemeinPage {
    constructor() {
        this.messages = [];
        this.isLoading = false;
        this.context = null;
    }

    async render() {
        const container = document.getElementById('app');

        // Header aktualisieren
        document.getElementById('headerTitle').textContent = 'orca 2.0 - Allgemein-Agent';
        document.getElementById('headerSubtitle').textContent = 'Ihr persönlicher KI-Assistent';
        document.getElementById('headerStats').style.display = 'none';

        container.innerHTML = `
            <div class="agent-allgemein-page">
                <style>${this.getStyles()}</style>

                <div class="allgemein-layout">
                    <!-- Sidebar mit Kontext -->
                    <div class="allgemein-sidebar">
                        <div class="sidebar-header">
                            <span class="sidebar-icon">🤖</span>
                            <h3>ORCA Assistent</h3>
                        </div>

                        <div class="sidebar-section">
                            <h4>💡 Beispiel-Fragen</h4>
                            <div class="example-questions">
                                <button onclick="agentAllgemeinPage.askExample('Zeige mir meine offenen Inventuren')">
                                    📋 Offene Inventuren
                                </button>
                                <button onclick="agentAllgemeinPage.askExample('Wie erstelle ich eine ABL?')">
                                    📦 ABL erstellen
                                </button>
                                <button onclick="agentAllgemeinPage.askExample('Erkläre mir den Verlagerungsprozess')">
                                    🚚 Verlagerung
                                </button>
                                <button onclick="agentAllgemeinPage.askExample('Was bedeutet Status I0?')">
                                    🔢 Status-Codes
                                </button>
                                <button onclick="agentAllgemeinPage.askExample('Welche Werkzeuge sind überfällig?')">
                                    ⏰ Überfällige
                                </button>
                            </div>
                        </div>

                        <div class="sidebar-section">
                            <h4>📊 Verfügbare Daten</h4>
                            <div class="context-info" id="contextInfo">
                                <div class="context-item">⏳ Lade Kontext...</div>
                            </div>
                        </div>

                        <div class="sidebar-section">
                            <h4>⚙️ Einstellungen</h4>
                            <div class="api-status" id="apiStatus">
                                ${this.getApiKey() ? '✅ Claude API verbunden' : '⚠️ Kein API Key'}
                            </div>
                            ${!this.getApiKey() ? `
                            <button class="btn-settings" onclick="router.navigate('/einstellungen')">
                                🔑 API Key einrichten
                            </button>
                            ` : ''}
                        </div>
                    </div>

                    <!-- Chat-Bereich -->
                    <div class="allgemein-chat">
                        <div class="chat-messages" id="chatMessages">
                            ${this.renderMessages()}
                        </div>

                        <div class="chat-input-area">
                            <div class="input-wrapper">
                                <textarea
                                    id="userInput"
                                    placeholder="Was kann ich für Sie tun?"
                                    rows="1"
                                    onkeydown="if(event.key==='Enter' && !event.shiftKey) { event.preventDefault(); agentAllgemeinPage.sendMessage(); }"
                                    oninput="this.style.height='auto'; this.style.height=Math.min(this.scrollHeight, 150)+'px';"
                                ></textarea>
                                <button class="btn-send" onclick="agentAllgemeinPage.sendMessage()" id="sendBtn">
                                    <span>➤</span>
                                </button>
                            </div>
                            <div class="input-hint">
                                Enter zum Senden • Shift+Enter für neue Zeile
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Willkommensnachricht wenn leer
        if (this.messages.length === 0) {
            this.addAssistantMessage(this.getGreeting());
        }

        this.loadContext();
        this.scrollToBottom();

        // Fokus auf Input
        setTimeout(() => document.getElementById('userInput')?.focus(), 100);
    }

    getGreeting() {
        const hour = new Date().getHours();
        let greeting = 'Guten Tag';
        if (hour < 12) greeting = 'Guten Morgen';
        else if (hour >= 18) greeting = 'Guten Abend';

        return `${greeting}! 👋

Ich bin Ihr persönlicher ORCA-Assistent. Ich kann Ihnen bei allem rund um das Asset-Management helfen:

• **Fragen beantworten** zu Prozessen, Status-Codes, Rollen
• **Daten analysieren** aus Inventuren, Verlagerungen, ABLs
• **Anleitungen geben** für komplexe Workflows
• **Probleme lösen** und Lösungsvorschläge machen

Was kann ich für Sie tun?`;
    }

    async loadContext() {
        const contextInfo = document.getElementById('contextInfo');
        if (!contextInfo) return;

        try {
            // Sammle verfügbare Daten
            const context = {
                inventuren: 0,
                verlagerungen: 0,
                werkzeuge: 0,
                skills: typeof PRELOADED_SKILLS !== 'undefined' ? PRELOADED_SKILLS.length : 0
            };

            // Prüfe ob Page-Instanzen existieren und Daten haben
            if (typeof inventurPage !== 'undefined' && inventurPage.allTools) {
                context.werkzeuge = inventurPage.allTools.length;
            }
            if (typeof verlagerungPage !== 'undefined' && verlagerungPage.allTools) {
                context.verlagerungen = verlagerungPage.allTools.length;
            }

            this.context = context;

            contextInfo.innerHTML = `
                <div class="context-item">🔧 ${context.werkzeuge} Werkzeuge</div>
                <div class="context-item">🚚 ${context.verlagerungen} Verlagerungen</div>
                <div class="context-item">📚 ${context.skills} Skills geladen</div>
            `;
        } catch (e) {
            contextInfo.innerHTML = '<div class="context-item">⚠️ Kontext nicht verfügbar</div>';
        }
    }

    renderMessages() {
        if (this.messages.length === 0) {
            return '';
        }

        return this.messages.map(msg => `
            <div class="message ${msg.role}">
                <div class="message-avatar">
                    ${msg.role === 'assistant' ? '🤖' : '👤'}
                </div>
                <div class="message-content">
                    ${this.formatMessage(msg.content)}
                </div>
            </div>
        `).join('');
    }

    formatMessage(content) {
        // Markdown-ähnliche Formatierung
        let html = content
            .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.+?)\*/g, '<em>$1</em>')
            .replace(/`(.+?)`/g, '<code>$1</code>')
            .replace(/^• /gm, '• ')
            .replace(/\n/g, '<br>');
        return html;
    }

    addAssistantMessage(content) {
        this.messages.push({ role: 'assistant', content });
        this.updateChat();
    }

    addUserMessage(content) {
        this.messages.push({ role: 'user', content });
        this.updateChat();
    }

    updateChat() {
        const chatMessages = document.getElementById('chatMessages');
        if (chatMessages) {
            chatMessages.innerHTML = this.renderMessages();
            this.scrollToBottom();
        }
    }

    scrollToBottom() {
        const chatMessages = document.getElementById('chatMessages');
        if (chatMessages) {
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }
    }

    askExample(question) {
        document.getElementById('userInput').value = question;
        this.sendMessage();
    }

    async sendMessage() {
        const input = document.getElementById('userInput');
        const message = input.value.trim();

        if (!message || this.isLoading) return;

        // User-Nachricht hinzufügen
        this.addUserMessage(message);
        input.value = '';
        input.style.height = 'auto';

        // Loading-State
        this.isLoading = true;
        this.showTypingIndicator();

        try {
            const response = await this.getResponse(message);
            this.hideTypingIndicator();
            this.addAssistantMessage(response);
        } catch (error) {
            this.hideTypingIndicator();
            this.addAssistantMessage(`❌ Fehler: ${error.message}\n\nBitte versuchen Sie es erneut oder prüfen Sie die API-Einstellungen.`);
        }

        this.isLoading = false;
    }

    showTypingIndicator() {
        const chatMessages = document.getElementById('chatMessages');
        chatMessages.insertAdjacentHTML('beforeend', `
            <div class="message assistant typing-indicator" id="typingIndicator">
                <div class="message-avatar">🤖</div>
                <div class="message-content">
                    <span class="typing-dots">
                        <span>.</span><span>.</span><span>.</span>
                    </span>
                </div>
            </div>
        `);
        this.scrollToBottom();
    }

    hideTypingIndicator() {
        document.getElementById('typingIndicator')?.remove();
    }

    getApiKey() {
        try {
            const config = JSON.parse(localStorage.getItem('orca_api_config') || '{}');
            return config.claudeApiKey || null;
        } catch {
            return null;
        }
    }

    async getResponse(userMessage) {
        const apiKey = this.getApiKey();

        if (!apiKey) {
            // Fallback: Lokale Antwort ohne API
            return this.getLocalResponse(userMessage);
        }

        // Claude API Aufruf
        const systemPrompt = this.buildSystemPrompt();

        try {
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
                    messages: this.messages.map(m => ({
                        role: m.role,
                        content: m.content
                    }))
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error?.message || 'API-Fehler');
            }

            const data = await response.json();
            return data.content[0].text;
        } catch (error) {
            console.error('Claude API Error:', error);
            // Fallback zu lokaler Antwort
            return this.getLocalResponse(userMessage);
        }
    }

    buildSystemPrompt() {
        // Glossar-Daten sammeln
        let glossarContext = '';
        if (typeof onboardingService !== 'undefined') {
            const glossary = onboardingService.getAllGlossaryTerms();
            const terms = Object.entries(glossary).slice(0, 30).map(([term, data]) =>
                `${term}: ${data.short}`
            ).join('\n');
            glossarContext = `\n\nGlossar (Auszug):\n${terms}`;
        }

        // Skills-Kontext
        let skillsContext = '';
        if (typeof PRELOADED_SKILLS !== 'undefined') {
            const skillNames = PRELOADED_SKILLS.map(s => s.name).join(', ');
            skillsContext = `\n\nVerfügbare Skills: ${skillNames}`;
        }

        return `Du bist der ORCA-Assistent, ein hilfsbereiter KI-Agent für das ORCA Asset-Management-System.

ORCA ist ein System zur Verwaltung von Fertigungsmitteln (Werkzeugen) zwischen OEMs (z.B. BMW) und Lieferanten.

Wichtige Prozesse:
- Inventur: Jährliche Bestandsaufnahme der Werkzeuge
- Verlagerung: Transport von Werkzeugen zwischen Standorten
- ABL (Abnahmebereitschaftserklärung): Meldung neuer Werkzeuge
- VPW (Vertragspartnerwechsel): Übergabe an anderen Lieferanten

Rollen:
- IVL: Inventurverantwortlicher Lieferant
- WVL: Werkzeugverantwortlicher Lieferant
- FEK: Fertigungsmittel-Einkäufer (OEM)
- SUP: Support

Status-Codes:
- I0: Inventur offen
- I2: Inventur gemeldet
- I6: Inventur bestätigt
- P0: Position offen
- P2: Position gemeldet
- P6: Position bestätigt
${glossarContext}
${skillsContext}

Antworte auf Deutsch, freundlich und hilfreich. Halte Antworten kompakt aber informativ.
Bei Fragen zu spezifischen Daten (Inventuren, Werkzeuge), erkläre was der Benutzer in ORCA tun kann.
Formatiere mit **fett** für wichtige Begriffe und • für Listen.`;
    }

    getLocalResponse(message) {
        // Einfache lokale Antworten ohne API
        const lower = message.toLowerCase();

        if (lower.includes('inventur')) {
            return `**Inventur** ist die jährliche Bestandsaufnahme Ihrer Werkzeuge.

So geht's:
• Öffnen Sie **Inventur** im Menü
• Wählen Sie eine offene Inventur
• Bestätigen Sie jede Position einzeln

Status-Codes:
• **I0** - Offen (noch zu bearbeiten)
• **I2** - Gemeldet (an OEM gesendet)
• **I6** - Bestätigt (abgeschlossen)

Brauchen Sie Hilfe bei einem bestimmten Schritt?`;
        }

        if (lower.includes('abl') || lower.includes('abnahme')) {
            return `**ABL (Abnahmebereitschaftserklärung)** meldet ein neues Werkzeug beim OEM an.

So erstellen Sie eine ABL:
• Gehen Sie zu **Agenten → ABL-Agent**
• Folgen Sie dem Schritt-für-Schritt Dialog
• Erfassen Sie: Bestellnummer, Werkzeugnummer, Fotos, Maße

Der Agent führt Sie durch alle 16 Schritte!`;
        }

        if (lower.includes('verlager')) {
            return `**Verlagerung** transportiert Werkzeuge zwischen Standorten.

Zwei Phasen:
1. **Beantragen** - Antrag mit Werkzeugen, Ziel, Termin
2. **Durchführen** - Versand, Tracking, Empfang dokumentieren

Bei länderübergreifenden Verlagerungen werden **Zolldokumente** benötigt.

Nutzen Sie den **Verlagerungs-Agent** für geführte Anträge!`;
        }

        if (lower.includes('status') || lower.includes('code')) {
            return `**Status-Codes** zeigen den Bearbeitungsstand:

**Inventur:**
• I0 - Offen
• I2 - Gemeldet
• I6 - Bestätigt

**Positionen:**
• P0 - Offen
• P2 - Gemeldet
• P6 - Bestätigt

**Verlagerung:**
• O - Offen/Beantragt
• P - In Bearbeitung
• C - Abgeschlossen`;
        }

        if (lower.includes('hilfe') || lower.includes('help')) {
            return `Ich kann Ihnen bei vielen Themen helfen:

• **Prozesse verstehen** - Inventur, ABL, Verlagerung, VPW
• **Status-Codes erklären** - Was bedeutet I0, P2, etc.?
• **Anleitungen geben** - Schritt-für-Schritt Hilfe
• **Probleme lösen** - Fehler und Fragen klären

Für beste Antworten: Richten Sie einen **Claude API Key** ein unter Einstellungen → KI-Einstellungen.

Was möchten Sie wissen?`;
        }

        // Default
        return `Danke für Ihre Frage!

Leider ist **kein Claude API Key** konfiguriert, daher kann ich nur grundlegende Antworten geben.

**So aktivieren Sie den vollen Assistenten:**
1. Gehen Sie zu **Einstellungen**
2. Geben Sie Ihren Claude API Key ein
3. Dann kann ich alle Fragen intelligent beantworten!

In der Zwischenzeit: Fragen Sie mich zu **Inventur**, **ABL**, **Verlagerung** oder **Status-Codes**.`;
    }

    getStyles() {
        return `
            .agent-allgemein-page { min-height: calc(100vh - 120px); display: flex; flex-direction: column; }

            .allgemein-layout { display: grid; grid-template-columns: 280px 1fr; gap: 0; flex: 1; min-height: 0; }

            .allgemein-sidebar { background: #f8fafc; border-right: 1px solid #e5e7eb; padding: 1rem; overflow-y: auto; }
            .sidebar-header { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1.5rem; padding-bottom: 1rem; border-bottom: 1px solid #e5e7eb; }
            .sidebar-icon { font-size: 1.5rem; }
            .sidebar-header h3 { margin: 0; font-size: 1.1rem; color: #2c4a8c; }

            .sidebar-section { margin-bottom: 1.5rem; }
            .sidebar-section h4 { font-size: 0.85rem; color: #6b7280; margin: 0 0 0.75rem 0; text-transform: uppercase; letter-spacing: 0.5px; }

            .example-questions { display: flex; flex-direction: column; gap: 0.5rem; }
            .example-questions button { text-align: left; padding: 0.6rem 0.75rem; background: white; border: 1px solid #e5e7eb; border-radius: 8px; cursor: pointer; font-size: 0.85rem; transition: all 0.2s; }
            .example-questions button:hover { border-color: #2c4a8c; background: #f0f4ff; }

            .context-info { display: flex; flex-direction: column; gap: 0.5rem; }
            .context-item { font-size: 0.85rem; color: #4b5563; padding: 0.4rem 0; }

            .api-status { font-size: 0.85rem; padding: 0.5rem; background: white; border-radius: 6px; margin-bottom: 0.5rem; }
            .btn-settings { width: 100%; padding: 0.5rem; background: #2c4a8c; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 0.85rem; }
            .btn-settings:hover { background: #1e3a6d; }

            .allgemein-chat { display: flex; flex-direction: column; height: 100%; background: white; min-height: 0; overflow: hidden; }

            .chat-messages { flex: 1; overflow-y: auto; padding: 1.5rem; display: flex; flex-direction: column; gap: 1rem; min-height: 200px; }

            .message { display: flex; gap: 0.75rem; max-width: 85%; overflow: visible; }
            .message.user { align-self: flex-end; flex-direction: row-reverse; }
            .message.assistant { align-self: flex-start; }

            .message-avatar { width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.2rem; flex-shrink: 0; }
            .message.assistant .message-avatar { background: #e0e7ff; }
            .message.user .message-avatar { background: #f3f4f6; }

            .message-content { padding: 0.75rem 1rem; border-radius: 12px; line-height: 1.5; font-size: 0.95rem; overflow: visible; max-height: none; word-wrap: break-word; }
            .message.assistant .message-content { background: #f0f4ff; color: #1e3a5f; border-bottom-left-radius: 4px; }
            .message.user .message-content { background: #2c4a8c; color: white; border-bottom-right-radius: 4px; }
            .message-content code { background: rgba(0,0,0,0.1); padding: 0.1rem 0.3rem; border-radius: 3px; font-size: 0.9em; }
            .message-content strong { font-weight: 600; }

            .typing-indicator .message-content { padding: 1rem; }
            .typing-dots span { animation: blink 1.4s infinite; opacity: 0.3; font-size: 1.5rem; }
            .typing-dots span:nth-child(2) { animation-delay: 0.2s; }
            .typing-dots span:nth-child(3) { animation-delay: 0.4s; }
            @keyframes blink { 50% { opacity: 1; } }

            .chat-input-area { padding: 1rem 1.5rem; border-top: 1px solid #e5e7eb; background: #fafbfc; }
            .input-wrapper { display: flex; gap: 0.75rem; align-items: flex-end; }
            .input-wrapper textarea { flex: 1; padding: 0.75rem 1rem; border: 1px solid #e5e7eb; border-radius: 12px; font-size: 0.95rem; resize: none; min-height: 44px; max-height: 150px; font-family: inherit; }
            .input-wrapper textarea:focus { outline: none; border-color: #2c4a8c; box-shadow: 0 0 0 3px rgba(44,74,140,0.1); }
            .btn-send { width: 44px; height: 44px; border-radius: 50%; background: #2c4a8c; color: white; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 1.1rem; transition: background 0.2s; }
            .btn-send:hover { background: #1e3a6d; }
            .btn-send:disabled { background: #9ca3af; cursor: not-allowed; }
            .input-hint { font-size: 0.75rem; color: #9ca3af; margin-top: 0.5rem; text-align: center; }

            /* Dark mode */
            [data-theme="dark"] .allgemein-sidebar { background: #1e293b; border-color: #334155; }
            [data-theme="dark"] .sidebar-header { border-color: #334155; }
            [data-theme="dark"] .sidebar-header h3 { color: #60a5fa; }
            [data-theme="dark"] .example-questions button { background: #0f172a; border-color: #334155; color: #e2e8f0; }
            [data-theme="dark"] .example-questions button:hover { background: #1e3a5f; border-color: #60a5fa; }
            [data-theme="dark"] .context-item { color: #94a3b8; }
            [data-theme="dark"] .api-status { background: #0f172a; color: #e2e8f0; }
            [data-theme="dark"] .allgemein-chat { background: #0f172a; }
            [data-theme="dark"] .message.assistant .message-content { background: #1e3a5f; color: #e2e8f0; }
            [data-theme="dark"] .message.user .message-avatar { background: #334155; }
            [data-theme="dark"] .chat-input-area { background: #1e293b; border-color: #334155; }
            [data-theme="dark"] .input-wrapper textarea { background: #0f172a; border-color: #334155; color: #e2e8f0; }

            @media (max-width: 768px) {
                .allgemein-layout { grid-template-columns: 1fr; }
                .allgemein-sidebar { display: none; }
            }
        `;
    }
}

const agentAllgemeinPage = new AgentAllgemeinPage();
