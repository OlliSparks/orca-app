// ORCA 2.0 - Error Service
// Benutzerfreundliche Fehlermeldungen mit Lösungsvorschlägen

class ErrorService {
    constructor() {
        this.toastContainer = null;
        this.errorMessages = this.defineErrorMessages();
        this.initToastContainer();
    }

    // Toast-Container initialisieren
    initToastContainer() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.createToastContainer());
        } else {
            this.createToastContainer();
        }
    }

    createToastContainer() {
        if (!this.toastContainer) {
            this.toastContainer = document.createElement('div');
            this.toastContainer.id = 'toast-container';
            this.toastContainer.className = 'toast-container';
            document.body.appendChild(this.toastContainer);
        }
    }

    // Fehler-Definitionen mit benutzerfreundlichen Texten
    defineErrorMessages() {
        return {
            // Netzwerk-Fehler
            'network': {
                title: 'Verbindungsproblem',
                message: 'Die Verbindung zum Server konnte nicht hergestellt werden.',
                suggestions: [
                    'Prüfen Sie Ihre Internetverbindung',
                    'Versuchen Sie es in wenigen Sekunden erneut',
                    'Bei anhaltendem Problem: Seite neu laden'
                ],
                icon: '📡',
                type: 'error'
            },
            'timeout': {
                title: 'Zeitüberschreitung',
                message: 'Der Server antwortet nicht rechtzeitig.',
                suggestions: [
                    'Die Anfrage dauert länger als gewöhnlich',
                    'Bitte warten oder Seite neu laden',
                    'Bei großen Datenmengen kann dies normal sein'
                ],
                icon: '⏱️',
                type: 'warning'
            },
            'offline': {
                title: 'Keine Internetverbindung',
                message: 'Sie sind derzeit offline.',
                suggestions: [
                    'Prüfen Sie Ihre WLAN-Verbindung',
                    'Einige Funktionen sind offline nicht verfügbar',
                    'Änderungen werden gespeichert und später synchronisiert'
                ],
                icon: '📴',
                type: 'warning'
            },

            // Auth-Fehler
            'auth_expired': {
                title: 'Sitzung abgelaufen',
                message: 'Ihre Anmeldung ist abgelaufen.',
                suggestions: [
                    'Bitte melden Sie sich erneut an',
                    'Gehen Sie zu Einstellungen und aktualisieren Sie den Token',
                    'Ungespeicherte Änderungen gehen nicht verloren'
                ],
                icon: '🔐',
                type: 'warning',
                action: {
                    text: 'Zu Einstellungen',
                    handler: () => router.navigate('/settings')
                }
            },
            'auth_invalid': {
                title: 'Zugriff verweigert',
                message: 'Sie haben keine Berechtigung für diese Aktion.',
                suggestions: [
                    'Prüfen Sie Ihre Benutzerrechte',
                    'Kontaktieren Sie Ihren Administrator',
                    'Möglicherweise ist der Prozess einem anderen Benutzer zugewiesen'
                ],
                icon: '🚫',
                type: 'error'
            },

            // API-Fehler
            'api_400': {
                title: 'Ungültige Eingabe',
                message: 'Die eingegebenen Daten sind nicht korrekt.',
                suggestions: [
                    'Überprüfen Sie Ihre Eingaben',
                    'Pflichtfelder müssen ausgefüllt sein',
                    'Achten Sie auf das richtige Format (Datum, Zahlen)'
                ],
                icon: '⚠️',
                type: 'warning'
            },
            'api_404': {
                title: 'Nicht gefunden',
                message: 'Das angeforderte Element existiert nicht.',
                suggestions: [
                    'Der Datensatz wurde möglicherweise gelöscht',
                    'Prüfen Sie die ID oder Nummer',
                    'Zurück zur Übersicht gehen'
                ],
                icon: '🔍',
                type: 'warning'
            },
            'api_409': {
                title: 'Konflikt',
                message: 'Die Änderung konnte nicht durchgeführt werden.',
                suggestions: [
                    'Ein anderer Benutzer hat gleichzeitig Änderungen vorgenommen',
                    'Laden Sie die Seite neu und versuchen Sie es erneut',
                    'Ihre Änderungen wurden nicht überschrieben'
                ],
                icon: '⚔️',
                type: 'warning'
            },
            'api_500': {
                title: 'Serverfehler',
                message: 'Ein interner Fehler ist aufgetreten.',
                suggestions: [
                    'Dies ist kein Problem auf Ihrer Seite',
                    'Versuchen Sie es in wenigen Minuten erneut',
                    'Das Team wurde automatisch benachrichtigt'
                ],
                icon: '🔧',
                type: 'error'
            },

            // Daten-Fehler
            'data_load': {
                title: 'Ladefehler',
                message: 'Die Daten konnten nicht geladen werden.',
                suggestions: [
                    'Seite neu laden',
                    'Cache leeren (Strg+Shift+R)',
                    'Bei Problemen: Einstellungen prüfen'
                ],
                icon: '📂',
                type: 'error',
                action: {
                    text: 'Neu laden',
                    handler: () => window.location.reload()
                }
            },
            'data_save': {
                title: 'Speicherfehler',
                message: 'Die Änderungen konnten nicht gespeichert werden.',
                suggestions: [
                    'Ihre Eingaben sind noch vorhanden',
                    'Prüfen Sie die Internetverbindung',
                    'Versuchen Sie es erneut'
                ],
                icon: '💾',
                type: 'error'
            },
            'data_empty': {
                title: 'Keine Daten',
                message: 'Es wurden keine Daten gefunden.',
                suggestions: [
                    'Ändern Sie die Filterkriterien',
                    'Prüfen Sie den ausgewählten Zeitraum',
                    'Möglicherweise gibt es noch keine Einträge'
                ],
                icon: '📭',
                type: 'info'
            },

            // Prozess-Fehler
            'process_locked': {
                title: 'Prozess gesperrt',
                message: 'Dieser Prozess wird gerade von jemand anderem bearbeitet.',
                suggestions: [
                    'Warten Sie, bis die Bearbeitung abgeschlossen ist',
                    'Kontaktieren Sie den zuständigen Bearbeiter',
                    'Versuchen Sie es später erneut'
                ],
                icon: '🔒',
                type: 'warning'
            },
            'process_invalid_state': {
                title: 'Aktion nicht möglich',
                message: 'Der Prozess befindet sich nicht im richtigen Status.',
                suggestions: [
                    'Prüfen Sie den aktuellen Prozessstatus',
                    'Möglicherweise müssen erst andere Schritte erledigt werden',
                    'Kontaktieren Sie den IVL bei Fragen'
                ],
                icon: '🚦',
                type: 'warning'
            },

            // Inventur-spezifisch
            'inventur_no_selection': {
                title: 'Keine Auswahl',
                message: 'Bitte wählen Sie mindestens ein Werkzeug aus.',
                suggestions: [
                    'Klicken Sie auf die Zeilen die Sie bearbeiten möchten',
                    'Nutzen Sie Strg+Klick für Mehrfachauswahl',
                    'Oder nutzen Sie die Checkbox in der Kopfzeile für alle'
                ],
                icon: '☑️',
                type: 'info'
            },
            'inventur_incomplete': {
                title: 'Inventur unvollständig',
                message: 'Nicht alle Pflichtfelder sind ausgefüllt.',
                suggestions: [
                    'Standort-Bestätigung ist erforderlich',
                    'Bei Abweichungen: Kommentar erforderlich',
                    'Foto ist optional, aber empfohlen'
                ],
                icon: '📋',
                type: 'warning'
            },

            // Verlagerung-spezifisch
            'verlagerung_no_target': {
                title: 'Ziel fehlt',
                message: 'Bitte geben Sie einen Zielstandort an.',
                suggestions: [
                    'Wählen Sie den neuen Standort aus der Liste',
                    'Oder geben Sie eine neue Adresse ein',
                    'Der Zielstandort muss sich vom aktuellen unterscheiden'
                ],
                icon: '🎯',
                type: 'warning'
            },

            // Standard-Fallback
            'unknown': {
                title: 'Unerwarteter Fehler',
                message: 'Ein unerwarteter Fehler ist aufgetreten.',
                suggestions: [
                    'Versuchen Sie die Aktion erneut',
                    'Laden Sie die Seite neu',
                    'Bei anhaltendem Problem: Support kontaktieren'
                ],
                icon: '❓',
                type: 'error'
            }
        };
    }

    // Fehlertyp aus HTTP-Status oder Error-Objekt ermitteln
    getErrorType(error) {
        // Netzwerk-Fehler
        if (!navigator.onLine) {
            return 'offline';
        }

        if (error instanceof TypeError && error.message.includes('fetch')) {
            return 'network';
        }

        // String-Fehler parsen
        if (typeof error === 'string') {
            const lowerError = error.toLowerCase();
            if (lowerError.includes('timeout')) return 'timeout';
            if (lowerError.includes('network')) return 'network';
            if (lowerError.includes('401') || lowerError.includes('unauthorized')) return 'auth_expired';
            if (lowerError.includes('403') || lowerError.includes('forbidden')) return 'auth_invalid';
            if (lowerError.includes('400')) return 'api_400';
            if (lowerError.includes('404')) return 'api_404';
            if (lowerError.includes('409')) return 'api_409';
            if (lowerError.includes('500')) return 'api_500';
        }

        // Error-Objekt analysieren
        if (error instanceof Error) {
            const msg = error.message.toLowerCase();
            if (msg.includes('timeout')) return 'timeout';
            if (msg.includes('network') || msg.includes('failed to fetch')) return 'network';

            // HTTP Status aus Message extrahieren
            const statusMatch = error.message.match(/(\d{3})/);
            if (statusMatch) {
                const status = parseInt(statusMatch[1]);
                if (status === 401) return 'auth_expired';
                if (status === 403) return 'auth_invalid';
                if (status === 400) return 'api_400';
                if (status === 404) return 'api_404';
                if (status === 409) return 'api_409';
                if (status >= 500) return 'api_500';
            }
        }

        // Response-Objekt
        if (error && error.status) {
            const status = error.status;
            if (status === 401) return 'auth_expired';
            if (status === 403) return 'auth_invalid';
            if (status === 400) return 'api_400';
            if (status === 404) return 'api_404';
            if (status === 409) return 'api_409';
            if (status >= 500) return 'api_500';
        }

        return 'unknown';
    }

    // Hauptmethode: Fehler anzeigen
    show(errorOrType, customMessage = null) {
        let errorDef;
        let errorType;

        // Direkt ein Error-Type-String übergeben
        if (typeof errorOrType === 'string' && this.errorMessages[errorOrType]) {
            errorType = errorOrType;
            errorDef = this.errorMessages[errorOrType];
        } else {
            // Error-Objekt analysieren
            errorType = this.getErrorType(errorOrType);
            errorDef = this.errorMessages[errorType] || this.errorMessages['unknown'];
        }

        // Custom message überschreibt Standard
        const message = customMessage || errorDef.message;

        // Toast erstellen und anzeigen
        this.showToast({
            ...errorDef,
            message: message
        });

        // Auch in Console loggen für Debugging
        console.warn(`[ErrorService] ${errorType}:`, errorOrType);

        return errorType;
    }

    // Erfolgs-Meldung anzeigen
    success(message, title = 'Erfolgreich') {
        this.showToast({
            title: title,
            message: message,
            icon: '✅',
            type: 'success',
            suggestions: []
        });
    }

    // Info-Meldung anzeigen
    info(message, title = 'Hinweis') {
        this.showToast({
            title: title,
            message: message,
            icon: 'ℹ️',
            type: 'info',
            suggestions: []
        });
    }

    // Warnung anzeigen
    warning(message, title = 'Achtung') {
        this.showToast({
            title: title,
            message: message,
            icon: '⚠️',
            type: 'warning',
            suggestions: []
        });
    }

    // Toast-Element erstellen und anzeigen
    showToast(config) {
        this.createToastContainer();

        const toast = document.createElement('div');
        toast.className = `toast toast-${config.type}`;

        const suggestionsHtml = config.suggestions && config.suggestions.length > 0
            ? `<ul class="toast-suggestions">
                ${config.suggestions.map(s => `<li>${s}</li>`).join('')}
               </ul>`
            : '';

        const actionHtml = config.action
            ? `<button class="toast-action" onclick="errorService.handleToastAction(this)"
                       data-handler="${config.action.text}">
                ${config.action.text}
               </button>`
            : '';

        toast.innerHTML = `
            <div class="toast-icon">${config.icon}</div>
            <div class="toast-content">
                <div class="toast-header">
                    <strong class="toast-title">${config.title}</strong>
                    <button class="toast-close" onclick="this.closest('.toast').remove()">×</button>
                </div>
                <p class="toast-message">${config.message}</p>
                ${suggestionsHtml}
                ${actionHtml}
            </div>
        `;

        // Action-Handler speichern
        if (config.action) {
            toast._actionHandler = config.action.handler;
        }

        this.toastContainer.appendChild(toast);

        // Animation starten
        requestAnimationFrame(() => {
            toast.classList.add('toast-visible');
        });

        // Auto-Hide nach Zeit (je nach Typ)
        const duration = config.type === 'error' ? 10000 :
                        config.type === 'warning' ? 7000 : 5000;

        setTimeout(() => {
            this.hideToast(toast);
        }, duration);

        return toast;
    }

    hideToast(toast) {
        if (toast && toast.parentNode) {
            toast.classList.remove('toast-visible');
            toast.classList.add('toast-hiding');
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.remove();
                }
            }, 300);
        }
    }

    handleToastAction(button) {
        const toast = button.closest('.toast');
        if (toast && toast._actionHandler) {
            toast._actionHandler();
            this.hideToast(toast);
        }
    }

    // Bestätigungs-Dialog (ersetzt window.confirm)
    async confirm(message, options = {}) {
        return new Promise((resolve) => {
            const overlay = document.createElement('div');
            overlay.className = 'error-dialog-overlay';

            overlay.innerHTML = `
                <div class="error-dialog">
                    <div class="error-dialog-icon">${options.icon || '❓'}</div>
                    <h3 class="error-dialog-title">${options.title || 'Bestätigung'}</h3>
                    <p class="error-dialog-message">${message}</p>
                    <div class="error-dialog-actions">
                        <button class="btn-dialog btn-dialog-cancel">
                            ${options.cancelText || 'Abbrechen'}
                        </button>
                        <button class="btn-dialog btn-dialog-confirm ${options.danger ? 'btn-danger' : ''}">
                            ${options.confirmText || 'Bestätigen'}
                        </button>
                    </div>
                </div>
            `;

            const cancelBtn = overlay.querySelector('.btn-dialog-cancel');
            const confirmBtn = overlay.querySelector('.btn-dialog-confirm');

            cancelBtn.onclick = () => {
                overlay.classList.add('hiding');
                setTimeout(() => overlay.remove(), 200);
                resolve(false);
            };

            confirmBtn.onclick = () => {
                overlay.classList.add('hiding');
                setTimeout(() => overlay.remove(), 200);
                resolve(true);
            };

            // ESC zum Abbrechen
            const escHandler = (e) => {
                if (e.key === 'Escape') {
                    cancelBtn.click();
                    document.removeEventListener('keydown', escHandler);
                }
            };
            document.addEventListener('keydown', escHandler);

            document.body.appendChild(overlay);
            requestAnimationFrame(() => overlay.classList.add('visible'));

            // Focus auf Confirm-Button
            confirmBtn.focus();
        });
    }

    // Alert-Dialog (ersetzt window.alert)
    async alert(message, options = {}) {
        return new Promise((resolve) => {
            const overlay = document.createElement('div');
            overlay.className = 'error-dialog-overlay';

            overlay.innerHTML = `
                <div class="error-dialog">
                    <div class="error-dialog-icon">${options.icon || 'ℹ️'}</div>
                    <h3 class="error-dialog-title">${options.title || 'Hinweis'}</h3>
                    <p class="error-dialog-message">${message}</p>
                    <div class="error-dialog-actions">
                        <button class="btn-dialog btn-dialog-confirm">
                            ${options.buttonText || 'OK'}
                        </button>
                    </div>
                </div>
            `;

            const confirmBtn = overlay.querySelector('.btn-dialog-confirm');

            confirmBtn.onclick = () => {
                overlay.classList.add('hiding');
                setTimeout(() => overlay.remove(), 200);
                resolve(true);
            };

            // ESC oder Enter zum Schließen
            const keyHandler = (e) => {
                if (e.key === 'Escape' || e.key === 'Enter') {
                    confirmBtn.click();
                    document.removeEventListener('keydown', keyHandler);
                }
            };
            document.addEventListener('keydown', keyHandler);

            document.body.appendChild(overlay);
            requestAnimationFrame(() => overlay.classList.add('visible'));
            confirmBtn.focus();
        });
    }

    // Prompt-Dialog (ersetzt window.prompt)
    async prompt(message, defaultValue = '', options = {}) {
        return new Promise((resolve) => {
            const overlay = document.createElement('div');
            overlay.className = 'error-dialog-overlay';

            overlay.innerHTML = `
                <div class="error-dialog">
                    <div class="error-dialog-icon">${options.icon || '✏️'}</div>
                    <h3 class="error-dialog-title">${options.title || 'Eingabe'}</h3>
                    <p class="error-dialog-message">${message}</p>
                    <input type="${options.type || 'text'}"
                           class="error-dialog-input"
                           value="${defaultValue}"
                           placeholder="${options.placeholder || ''}"
                    />
                    <div class="error-dialog-actions">
                        <button class="btn-dialog btn-dialog-cancel">
                            ${options.cancelText || 'Abbrechen'}
                        </button>
                        <button class="btn-dialog btn-dialog-confirm">
                            ${options.confirmText || 'OK'}
                        </button>
                    </div>
                </div>
            `;

            const input = overlay.querySelector('.error-dialog-input');
            const cancelBtn = overlay.querySelector('.btn-dialog-cancel');
            const confirmBtn = overlay.querySelector('.btn-dialog-confirm');

            cancelBtn.onclick = () => {
                overlay.classList.add('hiding');
                setTimeout(() => overlay.remove(), 200);
                resolve(null);
            };

            confirmBtn.onclick = () => {
                overlay.classList.add('hiding');
                setTimeout(() => overlay.remove(), 200);
                resolve(input.value);
            };

            // Enter zum Bestätigen, ESC zum Abbrechen
            input.onkeydown = (e) => {
                if (e.key === 'Enter') {
                    confirmBtn.click();
                } else if (e.key === 'Escape') {
                    cancelBtn.click();
                }
            };

            document.body.appendChild(overlay);
            requestAnimationFrame(() => overlay.classList.add('visible'));
            input.focus();
            input.select();
        });
    }
}

// Globale Instanz
const errorService = new ErrorService();

// Globale Error-Handler für unbehandelte Fehler
window.addEventListener('error', (event) => {
    console.error('Unhandled error:', event.error);
    // Nur kritische Fehler dem User zeigen
    if (event.error && event.error.message && !event.error.message.includes('Script error')) {
        errorService.show(event.error);
    }
});

window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
    // API-Fehler dem User zeigen
    if (event.reason && event.reason.message) {
        errorService.show(event.reason);
    }
});

// Offline/Online Events
window.addEventListener('offline', () => {
    errorService.show('offline');
});

window.addEventListener('online', () => {
    errorService.success('Verbindung wiederhergestellt', 'Online');
});
