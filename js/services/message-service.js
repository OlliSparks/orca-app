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
    // SYNC METHOD (no auto-generation)
    // ========================================

    // Sync just reloads messages from storage - no auto-generation
    async syncWithProcesses() {
        // Only reload from storage, don't auto-generate messages
        this.messages = this.loadMessages();
        console.log('Messages loaded from storage. Total:', this.messages.length);
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
