// ORCA 2.0 - Message Service
// Manages messages for process communication tracking

class MessageService {
    constructor() {
        this.storageKey = 'orca_messages';
        this.lastSyncKey = 'orca_messages_last_sync';
        this.messages = this.loadMessages();
    }

    // Load messages from localStorage
    loadMessages() {
        try {
            const saved = localStorage.getItem(this.storageKey);
            return saved ? JSON.parse(saved) : [];
        } catch (e) {
            console.error('Error loading messages:', e);
            return [];
        }
    }

    // Save messages to localStorage
    saveMessages() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.messages));
        } catch (e) {
            console.error('Error saving messages:', e);
        }
    }

    // Generate unique message ID
    generateId() {
        return 'msg-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    }

    // Add a new message
    addMessage(message) {
        const newMessage = {
            id: this.generateId(),
            timestamp: new Date().toISOString(),
            read: false,
            ...message
        };
        this.messages.unshift(newMessage); // Add to beginning
        this.saveMessages();
        return newMessage;
    }

    // Mark message as read
    markAsRead(messageId) {
        const message = this.messages.find(m => m.id === messageId);
        if (message) {
            message.read = true;
            this.saveMessages();
        }
    }

    // Mark all messages as read
    markAllAsRead() {
        this.messages.forEach(m => m.read = true);
        this.saveMessages();
    }

    // Get all messages
    getAllMessages() {
        return this.messages;
    }

    // Get unread messages
    getUnreadMessages() {
        return this.messages.filter(m => !m.read);
    }

    // Get messages by direction (incoming/outgoing)
    getMessagesByDirection(direction) {
        return this.messages.filter(m => m.direction === direction);
    }

    // Get messages by process type
    getMessagesByProcess(processType) {
        return this.messages.filter(m => m.process === processType);
    }

    // Get new messages since last check (for popup)
    getNewMessagesSinceLastCheck() {
        const lastCheck = localStorage.getItem(this.lastSyncKey);
        if (!lastCheck) {
            return this.getUnreadMessages();
        }
        return this.messages.filter(m =>
            new Date(m.timestamp) > new Date(lastCheck) && !m.read
        );
    }

    // Update last sync timestamp
    updateLastSync() {
        localStorage.setItem(this.lastSyncKey, new Date().toISOString());
    }

    // Delete a message
    deleteMessage(messageId) {
        this.messages = this.messages.filter(m => m.id !== messageId);
        this.saveMessages();
    }

    // Clear all messages
    clearAllMessages() {
        this.messages = [];
        this.saveMessages();
    }

    // Check if message already exists (to avoid duplicates)
    messageExists(processId, process, direction) {
        return this.messages.some(m =>
            m.processId === processId &&
            m.process === process &&
            m.direction === direction
        );
    }

    // ========================================
    // PROCESS SYNC METHODS
    // ========================================

    // Sync with all processes
    async syncWithProcesses() {
        console.log('Syncing messages with processes...');

        // Sync ABLs
        this.syncABLMessages();

        // Sync Verlagerungen
        await this.syncVerlagerungMessages();

        // Sync Inventuren
        await this.syncInventurMessages();

        console.log('Message sync complete. Total messages:', this.messages.length);
    }

    // Sync ABL messages (from localStorage)
    syncABLMessages() {
        const pendingABLs = JSON.parse(localStorage.getItem('pending_abls') || '[]');

        pendingABLs.forEach(abl => {
            // Outgoing: ABL created/sent
            if (!this.messageExists(abl.id, 'abl', 'outgoing')) {
                const toolNumbers = abl.tools?.map(t => t.number).filter(Boolean) || [];
                const toolCount = abl.tools?.length || 0;

                this.addMessage({
                    direction: 'outgoing',
                    process: 'abl',
                    processId: abl.id,
                    title: abl.status === 'sent' ? 'ABL versendet' : 'ABL erstellt',
                    content: `ABL mit ${toolCount} Werkzeug${toolCount !== 1 ? 'en' : ''} ${abl.status === 'sent' ? 'versendet' : 'im Vorrat'}`,
                    tools: toolNumbers,
                    status: abl.status,
                    metadata: {
                        supplier: abl.supplier,
                        owner: abl.owner,
                        toolCount: toolCount
                    }
                });
            }
        });
    }

    // Sync Verlagerung messages (from API + localStorage)
    async syncVerlagerungMessages() {
        // Check localStorage for sent relocations
        const sentRelocations = JSON.parse(localStorage.getItem('sent_relocations') || '[]');

        sentRelocations.forEach(relocation => {
            if (!this.messageExists(relocation.id, 'verlagerung', 'outgoing')) {
                this.addMessage({
                    direction: 'outgoing',
                    process: 'verlagerung',
                    processId: relocation.id,
                    title: 'Verlagerung versendet',
                    content: `Verlagerung für ${relocation.toolNumber || 'Werkzeug'} an ${relocation.targetLocation || 'neuen Standort'}`,
                    tools: [relocation.toolNumber].filter(Boolean),
                    status: 'sent',
                    metadata: relocation
                });
            }
        });

        // Check API for incoming/confirmed relocations
        if (typeof api !== 'undefined') {
            try {
                const config = JSON.parse(localStorage.getItem('orca_api_config') || '{}');
                if (config.mode === 'live') {
                    const response = await api.getRelocations();
                    if (response.success && response.data) {
                        response.data.forEach(relocation => {
                            // Check for confirmed relocations (incoming)
                            if (relocation.status === 'P2' || relocation.status === 'confirmed') {
                                if (!this.messageExists(relocation.key, 'verlagerung', 'incoming')) {
                                    this.addMessage({
                                        direction: 'incoming',
                                        process: 'verlagerung',
                                        processId: relocation.key,
                                        title: 'Verlagerung bestätigt',
                                        content: `Verlagerung ${relocation.identifier || relocation.key} wurde bestätigt`,
                                        tools: [relocation.inventoryNumber].filter(Boolean),
                                        status: relocation.status,
                                        metadata: {
                                            identifier: relocation.identifier,
                                            sourceLocation: relocation.sourceLocation,
                                            targetLocation: relocation.targetLocation
                                        }
                                    });
                                }
                            }
                        });
                    }
                }
            } catch (error) {
                console.error('Error syncing Verlagerung messages:', error);
            }
        }
    }

    // Sync Inventur messages (from API + localStorage)
    async syncInventurMessages() {
        // Check localStorage for completed inventories
        const completedInventories = JSON.parse(localStorage.getItem('completed_inventories') || '[]');

        completedInventories.forEach(inv => {
            if (!this.messageExists(inv.id, 'inventur', 'outgoing')) {
                const toolCount = inv.toolCount || inv.tools?.length || 0;
                this.addMessage({
                    direction: 'outgoing',
                    process: 'inventur',
                    processId: inv.id,
                    title: 'Inventur abgeschlossen',
                    content: `Inventur mit ${toolCount} Werkzeug${toolCount !== 1 ? 'en' : ''} abgeschlossen`,
                    tools: inv.tools || [],
                    status: 'completed',
                    metadata: inv
                });
            }
        });

        // Check API for new inventories (incoming)
        if (typeof api !== 'undefined') {
            try {
                const config = JSON.parse(localStorage.getItem('orca_api_config') || '{}');
                if (config.mode === 'live') {
                    const response = await api.getTasks();
                    if (response.success && response.data) {
                        // Find new/open inventories
                        const newInventories = response.data.filter(task =>
                            task.status === 'I0' || task.status === 'open'
                        );

                        newInventories.forEach(inv => {
                            if (!this.messageExists(inv.key, 'inventur', 'incoming')) {
                                this.addMessage({
                                    direction: 'incoming',
                                    process: 'inventur',
                                    processId: inv.key,
                                    title: 'Neue Inventur eingegangen',
                                    content: `Neue Inventur für Standort ${inv.locationName || inv.location || 'unbekannt'}`,
                                    tools: [],
                                    status: inv.status,
                                    metadata: {
                                        location: inv.locationName || inv.location,
                                        dueDate: inv.dueDate,
                                        toolCount: inv.toolCount
                                    }
                                });
                            }
                        });
                    }
                }
            } catch (error) {
                console.error('Error syncing Inventur messages:', error);
            }
        }
    }

    // ========================================
    // MANUAL MESSAGE CREATION HELPERS
    // ========================================

    // Create outgoing message when user sends something
    createOutgoingMessage(process, title, content, tools = [], metadata = {}) {
        return this.addMessage({
            direction: 'outgoing',
            process: process,
            processId: metadata.processId || this.generateId(),
            title: title,
            content: content,
            tools: tools,
            status: 'sent',
            metadata: metadata
        });
    }

    // Create incoming message for confirmations
    createIncomingMessage(process, title, content, tools = [], metadata = {}) {
        return this.addMessage({
            direction: 'incoming',
            process: process,
            processId: metadata.processId || this.generateId(),
            title: title,
            content: content,
            tools: tools,
            status: 'received',
            metadata: metadata
        });
    }

    // ========================================
    // UTILITY METHODS
    // ========================================

    // Get process icon
    getProcessIcon(process) {
        const icons = {
            'inventur': '🔍',
            'abl': '📦',
            'verlagerung': '🚚',
            'partnerwechsel': '🔄',
            'verschrottung': '♻️'
        };
        return icons[process] || '📋';
    }

    // Get process name
    getProcessName(process) {
        const names = {
            'inventur': 'Inventur',
            'abl': 'ABL',
            'verlagerung': 'Verlagerung',
            'partnerwechsel': 'Vertragspartnerwechsel',
            'verschrottung': 'Verschrottung'
        };
        return names[process] || process;
    }

    // Get direction icon
    getDirectionIcon(direction) {
        return direction === 'incoming' ? '📥' : '📤';
    }

    // Format timestamp
    formatTimestamp(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Gerade eben';
        if (diffMins < 60) return `vor ${diffMins} Min.`;
        if (diffHours < 24) return `vor ${diffHours} Std.`;
        if (diffDays < 7) return `vor ${diffDays} Tag${diffDays > 1 ? 'en' : ''}`;

        return date.toLocaleDateString('de-DE', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    }
}

// Create global instance
const messageService = new MessageService();
