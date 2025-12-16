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
    // API SYNC - Erkennt Änderungen vom Backend
    // ========================================

    // Storage key for last known process states
    get processStatesKey() {
        return 'orca_process_states';
    }

    // Load last known states
    loadProcessStates() {
        try {
            const saved = localStorage.getItem(this.processStatesKey);
            return saved ? JSON.parse(saved) : { inventories: {}, relocations: {} };
        } catch (e) {
            return { inventories: {}, relocations: {} };
        }
    }

    // Save process states
    saveProcessStates(states) {
        localStorage.setItem(this.processStatesKey, JSON.stringify(states));
    }

    // Main sync method - checks API for changes
    async syncWithProcesses() {
        // Reload messages from storage first
        this.messages = this.loadMessages();

        // Only sync with API in live mode
        const config = JSON.parse(localStorage.getItem('orca_api_config') || '{}');
        if (config.mode !== 'live' || !config.bearerToken) {
            console.log('Messages: Skip API sync (not in live mode)');
            return;
        }

        console.log('Messages: Syncing with API...');

        try {
            const lastStates = this.loadProcessStates();
            const newStates = { inventories: {}, relocations: {} };
            let newMessagesCount = 0;

            // 1. Sync Inventories (includes ABL)
            newMessagesCount += await this.syncInventories(lastStates.inventories, newStates.inventories);

            // 2. Sync Relocations
            newMessagesCount += await this.syncRelocations(lastStates.relocations, newStates.relocations);

            // Save new states
            this.saveProcessStates(newStates);

            console.log(`Messages: Sync complete. ${newMessagesCount} new messages.`);
        } catch (error) {
            console.error('Messages: Sync error:', error);
        }
    }

    // Sync inventories - detect new and status changes
    async syncInventories(lastStates, newStates) {
        if (typeof api === 'undefined') return 0;

        let newMessages = 0;

        try {
            // Fetch all relevant inventories (I0-I4)
            const result = await api.getInventoryList({
                status: ['I0', 'I1', 'I2', 'I3', 'I4'],
                limit: 1000
            });

            if (!result.success || !result.data) return 0;

            for (const inv of result.data) {
                const key = inv.inventoryKey || inv.id;
                const currentStatus = inv.status;
                const lastStatus = lastStates[key];

                // Store current state
                newStates[key] = currentStatus;

                // Skip if we've already seen this exact state
                if (lastStatus === currentStatus) continue;

                // New inventory (not seen before)
                if (!lastStatus && (currentStatus === 'I0' || currentStatus === 'I1')) {
                    // Only create message if we haven't already
                    if (!this.messageExists(key, 'inventur', 'incoming')) {
                        this.createIncomingMessage(
                            'inventur',
                            'Neue Inventur eingegangen',
                            `Inventur "${inv.name || 'Inventur'}" für ${inv.location || 'Standort'} mit ${inv.assetCount || 0} Werkzeugen`,
                            [],
                            {
                                processId: key,
                                location: inv.location,
                                dueDate: inv.dueDate,
                                assetCount: inv.assetCount
                            }
                        );
                        newMessages++;
                    }
                }
                // Status change - confirmation from OEM
                else if (lastStatus && currentStatus !== lastStatus) {
                    const statusChange = `${lastStatus}→${currentStatus}`;
                    let title = '';
                    let content = '';

                    switch (currentStatus) {
                        case 'I2':
                            title = 'Inventur gemeldet';
                            content = `Inventur "${inv.name || key}" wurde als gemeldet markiert`;
                            break;
                        case 'I3':
                            title = 'Inventur genehmigt';
                            content = `Inventur "${inv.name || key}" wurde vom OEM genehmigt`;
                            break;
                        case 'I4':
                            title = 'Inventur abgeschlossen';
                            content = `Inventur "${inv.name || key}" wurde erfolgreich abgeschlossen`;
                            break;
                        default:
                            continue; // Skip other status changes
                    }

                    const msgKey = `${key}-${currentStatus}`;
                    if (!this.messageExists(msgKey, 'inventur', 'incoming')) {
                        this.createIncomingMessage(
                            'inventur',
                            title,
                            content,
                            [],
                            {
                                processId: msgKey,
                                inventoryKey: key,
                                oldStatus: lastStatus,
                                newStatus: currentStatus
                            }
                        );
                        newMessages++;
                    }
                }
            }
        } catch (error) {
            console.error('Sync inventories error:', error);
        }

        return newMessages;
    }

    // Sync relocations - detect status changes
    async syncRelocations(lastStates, newStates) {
        if (typeof api === 'undefined') return 0;

        let newMessages = 0;

        try {
            // Fetch relocations
            const result = await api.getVerlagerungList({ limit: 1000 });

            if (!result.success || !result.data) return 0;

            for (const rel of result.data) {
                const key = rel.key || rel.id;
                const currentStatus = rel.status;
                const lastStatus = lastStates[key];

                // Store current state
                newStates[key] = currentStatus;

                // Skip if same state
                if (lastStatus === currentStatus) continue;

                // Status change detection
                if (lastStatus && currentStatus !== lastStatus) {
                    let title = '';
                    let content = '';

                    // Map status to user-friendly message
                    if (currentStatus === 'P2' || currentStatus === 'Durchgeführt' || currentStatus === 'completed') {
                        title = 'Verlagerung bestätigt';
                        content = `Verlagerung "${rel.name || rel.identifier || key}" wurde bestätigt`;
                    } else if (currentStatus === 'P3' || currentStatus === 'Genehmigt' || currentStatus === 'approved') {
                        title = 'Verlagerung genehmigt';
                        content = `Verlagerung "${rel.name || rel.identifier || key}" wurde vom OEM genehmigt`;
                    } else if (currentStatus === 'Abgelehnt' || currentStatus === 'rejected') {
                        title = 'Verlagerung abgelehnt';
                        content = `Verlagerung "${rel.name || rel.identifier || key}" wurde abgelehnt`;
                    } else {
                        continue; // Skip other changes
                    }

                    const msgKey = `${key}-${currentStatus}`;
                    if (!this.messageExists(msgKey, 'verlagerung', 'incoming')) {
                        this.createIncomingMessage(
                            'verlagerung',
                            title,
                            content,
                            [rel.inventoryNumber].filter(Boolean),
                            {
                                processId: msgKey,
                                relocationKey: key,
                                oldStatus: lastStatus,
                                newStatus: currentStatus
                            }
                        );
                        newMessages++;
                    }
                }
            }
        } catch (error) {
            console.error('Sync relocations error:', error);
        }

        return newMessages;
    }

    // Force initial sync (for first time or reset)
    async forceInitialSync() {
        // Clear stored states to trigger fresh detection
        localStorage.removeItem(this.processStatesKey);
        await this.syncWithProcesses();
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
