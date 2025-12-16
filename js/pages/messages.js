// ORCA 2.0 - Messages Page
// Shows communication history for all processes

class MessagesPage {
    constructor() {
        this.currentFilter = 'all'; // all, incoming, outgoing
        this.currentProcessFilter = 'all'; // all, inventur, abl, verlagerung, etc.
    }

    async render() {
        const app = document.getElementById('app');

        // Update Header
        document.getElementById('headerTitle').textContent = 'orca 2.0 - Werkzeug Management';
        document.getElementById('headerSubtitle').textContent = 'Nachrichten';

        // Hide header stats
        const headerStats = document.querySelector('.header-stats');
        if (headerStats) {
            headerStats.style.display = 'none';
        }

        // Show loading state
        app.innerHTML = `
            <div class="container">
                <div class="messages-loading">
                    <div class="loading-spinner"></div>
                    <p>Synchronisiere Nachrichten...</p>
                </div>
            </div>
        `;

        // Sync messages with processes
        await messageService.syncWithProcesses();

        // Render full page
        this.renderPage();
    }

    renderPage() {
        const app = document.getElementById('app');
        const messages = messageService.getAllMessages();
        const unreadCount = messageService.getUnreadMessages().length;

        // Count by direction
        const incomingCount = messages.filter(m => m.direction === 'incoming').length;
        const outgoingCount = messages.filter(m => m.direction === 'outgoing').length;

        app.innerHTML = `
            <div class="container messages-container">
                <!-- Header Section -->
                <div class="messages-header">
                    <div class="messages-header-left">
                        <h2>Nachrichten</h2>
                        ${unreadCount > 0 ? `<span class="unread-badge">${unreadCount} ungelesen</span>` : ''}
                        ${this.isLiveMode() ?
                            `<span class="api-badge live">🔗 Live API</span>` :
                            `<span class="api-badge mock">🧪 Offline</span>`
                        }
                    </div>
                    <div class="messages-header-actions">
                        <button class="btn-icon" onclick="messagesPage.syncMessages()" title="${this.isLiveMode() ? 'Mit API synchronisieren' : 'Aktualisieren'}">
                            <span>🔄</span>
                        </button>
                        ${unreadCount > 0 ? `
                            <button class="btn-secondary" onclick="messagesPage.markAllRead()">
                                Alle als gelesen markieren
                            </button>
                        ` : ''}
                    </div>
                </div>

                <!-- Filter Tabs -->
                <div class="messages-filters">
                    <div class="filter-tabs">
                        <button class="filter-tab ${this.currentFilter === 'all' ? 'active' : ''}"
                                onclick="messagesPage.setFilter('all')">
                            Alle <span class="tab-count">${messages.length}</span>
                        </button>
                        <button class="filter-tab ${this.currentFilter === 'incoming' ? 'active' : ''}"
                                onclick="messagesPage.setFilter('incoming')">
                            📥 Eingang <span class="tab-count">${incomingCount}</span>
                        </button>
                        <button class="filter-tab ${this.currentFilter === 'outgoing' ? 'active' : ''}"
                                onclick="messagesPage.setFilter('outgoing')">
                            📤 Ausgang <span class="tab-count">${outgoingCount}</span>
                        </button>
                    </div>

                    <div class="process-filter">
                        <select id="processFilter" onchange="messagesPage.setProcessFilter(this.value)">
                            <option value="all">Alle Prozesse</option>
                            <option value="inventur" ${this.currentProcessFilter === 'inventur' ? 'selected' : ''}>🔍 Inventur</option>
                            <option value="abl" ${this.currentProcessFilter === 'abl' ? 'selected' : ''}>📦 ABL</option>
                            <option value="verlagerung" ${this.currentProcessFilter === 'verlagerung' ? 'selected' : ''}>🚚 Verlagerung</option>
                            <option value="partnerwechsel" ${this.currentProcessFilter === 'partnerwechsel' ? 'selected' : ''}>🔄 Partnerwechsel</option>
                            <option value="verschrottung" ${this.currentProcessFilter === 'verschrottung' ? 'selected' : ''}>♻️ Verschrottung</option>
                        </select>
                    </div>
                </div>

                <!-- Messages List -->
                <div class="messages-list" id="messagesList">
                    ${this.renderMessagesList(messages)}
                </div>
            </div>

            <style>
                .messages-container {
                    max-width: 900px;
                    margin: 0 auto;
                    padding: 1.5rem;
                }

                .messages-loading {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 4rem;
                    color: #6b7280;
                }

                .loading-spinner {
                    width: 40px;
                    height: 40px;
                    border: 3px solid #e5e7eb;
                    border-top-color: #3b82f6;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                    margin-bottom: 1rem;
                }

                @keyframes spin {
                    to { transform: rotate(360deg); }
                }

                .messages-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 1.5rem;
                }

                .messages-header-left {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                }

                .messages-header-left h2 {
                    margin: 0;
                    font-size: 1.5rem;
                    color: #1f2937;
                }

                .unread-badge {
                    background: #ef4444;
                    color: white;
                    padding: 0.25rem 0.75rem;
                    border-radius: 9999px;
                    font-size: 0.875rem;
                    font-weight: 500;
                }

                .api-badge {
                    padding: 0.25rem 0.5rem;
                    border-radius: 6px;
                    font-size: 0.75rem;
                    font-weight: 500;
                }

                .api-badge.live {
                    background: #dcfce7;
                    color: #166534;
                }

                .api-badge.mock {
                    background: #fef3c7;
                    color: #92400e;
                }

                .messages-header-actions {
                    display: flex;
                    gap: 0.75rem;
                    align-items: center;
                }

                .btn-icon {
                    background: #f3f4f6;
                    border: none;
                    border-radius: 8px;
                    padding: 0.5rem;
                    cursor: pointer;
                    font-size: 1.25rem;
                    transition: background 0.2s;
                }

                .btn-icon:hover {
                    background: #e5e7eb;
                }

                .btn-secondary {
                    background: #f3f4f6;
                    border: 1px solid #d1d5db;
                    border-radius: 8px;
                    padding: 0.5rem 1rem;
                    cursor: pointer;
                    font-size: 0.875rem;
                    color: #374151;
                    transition: all 0.2s;
                }

                .btn-secondary:hover {
                    background: #e5e7eb;
                }

                .messages-filters {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 1rem;
                    gap: 1rem;
                    flex-wrap: wrap;
                }

                .filter-tabs {
                    display: flex;
                    gap: 0.5rem;
                    background: #f3f4f6;
                    padding: 0.25rem;
                    border-radius: 10px;
                }

                .filter-tab {
                    background: transparent;
                    border: none;
                    padding: 0.5rem 1rem;
                    border-radius: 8px;
                    cursor: pointer;
                    font-size: 0.875rem;
                    color: #6b7280;
                    transition: all 0.2s;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }

                .filter-tab:hover {
                    color: #374151;
                }

                .filter-tab.active {
                    background: white;
                    color: #1f2937;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
                }

                .tab-count {
                    background: #e5e7eb;
                    padding: 0.125rem 0.5rem;
                    border-radius: 9999px;
                    font-size: 0.75rem;
                }

                .filter-tab.active .tab-count {
                    background: #3b82f6;
                    color: white;
                }

                .process-filter select {
                    padding: 0.5rem 1rem;
                    border: 1px solid #d1d5db;
                    border-radius: 8px;
                    font-size: 0.875rem;
                    color: #374151;
                    background: white;
                    cursor: pointer;
                }

                .messages-list {
                    display: flex;
                    flex-direction: column;
                    gap: 0.75rem;
                }

                .message-card {
                    background: white;
                    border: 1px solid #e5e7eb;
                    border-radius: 12px;
                    padding: 1rem 1.25rem;
                    cursor: pointer;
                    transition: all 0.2s;
                    display: flex;
                    gap: 1rem;
                    align-items: flex-start;
                }

                .message-card:hover {
                    border-color: #3b82f6;
                    box-shadow: 0 2px 8px rgba(59, 130, 246, 0.1);
                }

                .message-card.unread {
                    background: #eff6ff;
                    border-color: #bfdbfe;
                }

                .message-card.unread::before {
                    content: '';
                    position: absolute;
                    left: 0;
                    top: 0;
                    bottom: 0;
                    width: 4px;
                    background: #3b82f6;
                    border-radius: 12px 0 0 12px;
                }

                .message-card {
                    position: relative;
                }

                .message-icon {
                    width: 48px;
                    height: 48px;
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1.5rem;
                    flex-shrink: 0;
                }

                .message-icon.incoming {
                    background: #dcfce7;
                }

                .message-icon.outgoing {
                    background: #dbeafe;
                }

                .message-content {
                    flex: 1;
                    min-width: 0;
                }

                .message-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    margin-bottom: 0.25rem;
                }

                .message-title {
                    font-weight: 600;
                    color: #1f2937;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }

                .process-badge {
                    font-size: 0.75rem;
                    padding: 0.125rem 0.5rem;
                    border-radius: 9999px;
                    background: #f3f4f6;
                    color: #6b7280;
                }

                .message-time {
                    font-size: 0.75rem;
                    color: #9ca3af;
                    white-space: nowrap;
                }

                .message-text {
                    color: #6b7280;
                    font-size: 0.875rem;
                    line-height: 1.5;
                    margin-bottom: 0.5rem;
                }

                .message-tools {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 0.375rem;
                }

                .tool-tag {
                    background: #f3f4f6;
                    padding: 0.125rem 0.5rem;
                    border-radius: 4px;
                    font-size: 0.75rem;
                    color: #374151;
                    font-family: monospace;
                }

                .no-messages {
                    text-align: center;
                    padding: 4rem 2rem;
                    color: #6b7280;
                }

                .no-messages-icon {
                    font-size: 4rem;
                    margin-bottom: 1rem;
                    opacity: 0.5;
                }

                .no-messages h3 {
                    margin: 0 0 0.5rem 0;
                    color: #374151;
                }

                .direction-indicator {
                    font-size: 0.875rem;
                    margin-right: 0.25rem;
                }

                /* Popup Styles */
                .message-popup-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0,0,0,0.5);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1000;
                    animation: fadeIn 0.2s ease;
                }

                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }

                .message-popup {
                    background: white;
                    border-radius: 16px;
                    width: 90%;
                    max-width: 500px;
                    max-height: 80vh;
                    overflow: hidden;
                    box-shadow: 0 20px 60px rgba(0,0,0,0.3);
                    animation: slideUp 0.3s ease;
                }

                @keyframes slideUp {
                    from { transform: translateY(20px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }

                .popup-header {
                    padding: 1.25rem 1.5rem;
                    border-bottom: 1px solid #e5e7eb;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .popup-header h3 {
                    margin: 0;
                    font-size: 1.125rem;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }

                .popup-close {
                    background: none;
                    border: none;
                    font-size: 1.5rem;
                    cursor: pointer;
                    color: #6b7280;
                    padding: 0.25rem;
                    line-height: 1;
                }

                .popup-close:hover {
                    color: #1f2937;
                }

                .popup-content {
                    padding: 1rem 1.5rem;
                    max-height: 50vh;
                    overflow-y: auto;
                }

                .popup-message-item {
                    padding: 0.75rem;
                    border-radius: 8px;
                    background: #f9fafb;
                    margin-bottom: 0.5rem;
                }

                .popup-message-item:last-child {
                    margin-bottom: 0;
                }

                .popup-actions {
                    padding: 1rem 1.5rem;
                    border-top: 1px solid #e5e7eb;
                    display: flex;
                    gap: 0.75rem;
                    justify-content: flex-end;
                }

                .popup-btn {
                    padding: 0.625rem 1.25rem;
                    border-radius: 8px;
                    font-size: 0.875rem;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .popup-btn.primary {
                    background: #3b82f6;
                    color: white;
                    border: none;
                }

                .popup-btn.primary:hover {
                    background: #2563eb;
                }

                .popup-btn.secondary {
                    background: white;
                    border: 1px solid #d1d5db;
                    color: #374151;
                }

                .popup-btn.secondary:hover {
                    background: #f3f4f6;
                }
            </style>
        `;
    }

    renderMessagesList(allMessages) {
        // Apply filters
        let messages = allMessages;

        if (this.currentFilter !== 'all') {
            messages = messages.filter(m => m.direction === this.currentFilter);
        }

        if (this.currentProcessFilter !== 'all') {
            messages = messages.filter(m => m.process === this.currentProcessFilter);
        }

        if (messages.length === 0) {
            return `
                <div class="no-messages">
                    <div class="no-messages-icon">📭</div>
                    <h3>Keine Nachrichten</h3>
                    <p>Es gibt noch keine Nachrichten in diesem Bereich.</p>
                </div>
            `;
        }

        return messages.map(msg => this.renderMessageCard(msg)).join('');
    }

    renderMessageCard(msg) {
        const processIcon = messageService.getProcessIcon(msg.process);
        const processName = messageService.getProcessName(msg.process);
        const timeStr = messageService.formatTimestamp(msg.timestamp);
        const directionIcon = messageService.getDirectionIcon(msg.direction);

        const toolsHtml = msg.tools && msg.tools.length > 0
            ? `<div class="message-tools">
                   ${msg.tools.slice(0, 5).map(t => `<span class="tool-tag">${t}</span>`).join('')}
                   ${msg.tools.length > 5 ? `<span class="tool-tag">+${msg.tools.length - 5} weitere</span>` : ''}
               </div>`
            : '';

        return `
            <div class="message-card ${msg.read ? '' : 'unread'}"
                 onclick="messagesPage.openMessage('${msg.id}')">
                <div class="message-icon ${msg.direction}">
                    ${processIcon}
                </div>
                <div class="message-content">
                    <div class="message-header">
                        <div class="message-title">
                            <span class="direction-indicator">${directionIcon}</span>
                            ${msg.title}
                            <span class="process-badge">${processName}</span>
                        </div>
                        <span class="message-time">${timeStr}</span>
                    </div>
                    <div class="message-text">${msg.content}</div>
                    ${toolsHtml}
                </div>
            </div>
        `;
    }

    setFilter(filter) {
        this.currentFilter = filter;
        this.renderPage();
    }

    setProcessFilter(filter) {
        this.currentProcessFilter = filter;
        this.renderPage();
    }

    isLiveMode() {
        const config = JSON.parse(localStorage.getItem('orca_api_config') || '{}');
        return config.mode === 'live' && !!config.bearerToken;
    }

    async syncMessages() {
        const config = JSON.parse(localStorage.getItem('orca_api_config') || '{}');
        const isLiveMode = config.mode === 'live' && config.bearerToken;

        const app = document.getElementById('app');
        app.innerHTML = `
            <div class="container">
                <div class="messages-loading">
                    <div class="loading-spinner"></div>
                    <p>${isLiveMode ? 'Synchronisiere mit API...' : 'Lade Nachrichten...'}</p>
                    ${isLiveMode ? '<p style="font-size: 0.875rem; color: #6b7280;">Prüfe Inventuren und Verlagerungen auf Änderungen</p>' : ''}
                </div>
            </div>
        `;

        await messageService.syncWithProcesses();
        this.renderPage();
    }

    markAllRead() {
        messageService.markAllAsRead();
        this.renderPage();
    }

    openMessage(messageId) {
        // Mark as read
        messageService.markAsRead(messageId);

        // Get message
        const msg = messageService.getAllMessages().find(m => m.id === messageId);
        if (!msg) return;

        // Navigate to detail view based on process type and processId
        let route = null;

        switch (msg.process) {
            case 'abl':
                // ABL detail view - processId is the ABL ID (e.g., "ABL-1234567890")
                if (msg.processId) {
                    route = `/abl-detail/${msg.processId}`;
                } else {
                    route = '/abl';
                }
                break;

            case 'verlagerung':
                // Verlagerung detail view
                if (msg.processId && !msg.processId.startsWith('rel-')) {
                    route = `/verlagerung/${msg.processId}`;
                } else {
                    route = '/verlagerung';
                }
                break;

            case 'inventur':
                // Inventur has no individual detail view, go to list
                route = '/inventur';
                break;

            case 'partnerwechsel':
                if (msg.processId) {
                    route = `/partnerwechsel/${msg.processId}`;
                } else {
                    route = '/partnerwechsel';
                }
                break;

            case 'verschrottung':
                if (msg.processId) {
                    route = `/verschrottung-detail/${msg.processId}`;
                } else {
                    route = '/verschrottung';
                }
                break;

            default:
                route = null;
        }

        if (route) {
            router.navigate(route);
        } else {
            // Re-render to update read status
            this.renderPage();
        }
    }

    // Static method to show popup for new messages
    static showNewMessagesPopup(messages) {
        if (messages.length === 0) return;

        const overlay = document.createElement('div');
        overlay.className = 'message-popup-overlay';
        overlay.id = 'messagePopupOverlay';

        const incomingMessages = messages.filter(m => m.direction === 'incoming');
        const outgoingMessages = messages.filter(m => m.direction === 'outgoing');

        overlay.innerHTML = `
            <div class="message-popup">
                <div class="popup-header">
                    <h3>🔔 ${messages.length} neue Nachricht${messages.length !== 1 ? 'en' : ''}</h3>
                    <button class="popup-close" onclick="MessagesPage.closePopup()">&times;</button>
                </div>
                <div class="popup-content">
                    ${incomingMessages.length > 0 ? `
                        <h4 style="margin: 0 0 0.75rem 0; font-size: 0.875rem; color: #059669;">
                            📥 Eingegangen (${incomingMessages.length})
                        </h4>
                        ${incomingMessages.map(msg => `
                            <div class="popup-message-item">
                                <strong>${messageService.getProcessIcon(msg.process)} ${msg.title}</strong>
                                <p style="margin: 0.25rem 0 0 0; font-size: 0.875rem; color: #6b7280;">${msg.content}</p>
                            </div>
                        `).join('')}
                    ` : ''}

                    ${outgoingMessages.length > 0 ? `
                        <h4 style="margin: ${incomingMessages.length > 0 ? '1rem' : '0'} 0 0.75rem 0; font-size: 0.875rem; color: #2563eb;">
                            📤 Gesendet (${outgoingMessages.length})
                        </h4>
                        ${outgoingMessages.map(msg => `
                            <div class="popup-message-item">
                                <strong>${messageService.getProcessIcon(msg.process)} ${msg.title}</strong>
                                <p style="margin: 0.25rem 0 0 0; font-size: 0.875rem; color: #6b7280;">${msg.content}</p>
                            </div>
                        `).join('')}
                    ` : ''}
                </div>
                <div class="popup-actions">
                    <button class="popup-btn secondary" onclick="MessagesPage.closePopup()">
                        Schließen
                    </button>
                    <button class="popup-btn primary" onclick="MessagesPage.goToMessages()">
                        Alle Nachrichten anzeigen
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(overlay);

        // Close on overlay click
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                MessagesPage.closePopup();
            }
        });
    }

    static closePopup() {
        const overlay = document.getElementById('messagePopupOverlay');
        if (overlay) {
            overlay.remove();
        }
        messageService.updateLastSync();
    }

    static goToMessages() {
        MessagesPage.closePopup();
        router.navigate('/messages');
    }
}

// Create global instance
const messagesPage = new MessagesPage();
