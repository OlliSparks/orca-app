// ORCA 2.0 - Form Service
// Inline-Validierung, Auto-Save, verbesserte UX

class FormService {
    constructor() {
        this.autoSaveTimers = {};
        this.validationRules = {};
        this.init();
    }

    init() {
        // Observer fuer neue Formulare im DOM
        this.setupMutationObserver();

        // Event-Delegation fuer Formulare
        document.addEventListener('input', (e) => this.handleInput(e), true);
        document.addEventListener('blur', (e) => this.handleBlur(e), true);
        document.addEventListener('focus', (e) => this.handleFocus(e), true);
    }

    setupMutationObserver() {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach(mutation => {
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType === 1) {
                        // Neue Formulare initialisieren
                        const forms = node.querySelectorAll ? node.querySelectorAll('form, [data-form]') : [];
                        forms.forEach(form => this.enhanceForm(form));

                        // Einzelne Inputs initialisieren
                        const inputs = node.querySelectorAll ? node.querySelectorAll('input, textarea, select') : [];
                        inputs.forEach(input => this.enhanceInput(input));
                    }
                });
            });
        });

        observer.observe(document.body, { childList: true, subtree: true });
    }

    // Formular verbessern
    enhanceForm(form) {
        if (form.dataset.enhanced) return;
        form.dataset.enhanced = 'true';

        // Auto-Save aktivieren wenn gewuenscht
        if (form.dataset.autosave) {
            this.setupAutoSave(form);
        }

        // Submit-Handler
        form.addEventListener('submit', (e) => this.handleSubmit(e, form));
    }

    // Einzelnes Input verbessern
    enhanceInput(input) {
        if (input.dataset.enhanced) return;
        input.dataset.enhanced = 'true';

        // Wrapper hinzufuegen wenn noetig
        this.wrapInput(input);
    }

    wrapInput(input) {
        // Nur wrappen wenn noch nicht gewrappt
        if (input.parentElement && input.parentElement.classList.contains('form-field')) return;

        const wrapper = document.createElement('div');
        wrapper.className = 'form-field';

        // Nur wrappen wenn Input ein Label oder Placeholder hat
        if (input.id || input.placeholder) {
            input.parentNode.insertBefore(wrapper, input);
            wrapper.appendChild(input);

            // Feedback-Element hinzufuegen
            const feedback = document.createElement('div');
            feedback.className = 'field-feedback';
            wrapper.appendChild(feedback);
        }
    }

    handleInput(e) {
        const input = e.target;
        if (!this.isFormElement(input)) return;

        // Live-Validierung (nach kurzer Verzoegerung)
        clearTimeout(input._validationTimer);
        input._validationTimer = setTimeout(() => {
            this.validateField(input, false); // Soft validation while typing
        }, 300);

        // Auto-Save triggern
        const form = input.closest('form, [data-form]');
        if (form && form.dataset.autosave) {
            this.triggerAutoSave(form);
        }

        // Character counter aktualisieren
        this.updateCharCounter(input);
    }

    handleBlur(e) {
        const input = e.target;
        if (!this.isFormElement(input)) return;

        // Vollstaendige Validierung bei Blur
        this.validateField(input, true);
    }

    handleFocus(e) {
        const input = e.target;
        if (!this.isFormElement(input)) return;

        // Focus-Styling
        const wrapper = input.closest('.form-field');
        if (wrapper) {
            wrapper.classList.add('focused');
        }

        // Fehler-State temporaer entfernen beim Focus
        input.classList.remove('field-error');
    }

    isFormElement(el) {
        return el && ['INPUT', 'TEXTAREA', 'SELECT'].includes(el.tagName);
    }

    // Feld validieren
    validateField(input, strict = true) {
        const wrapper = input.closest('.form-field');
        const feedback = wrapper ? wrapper.querySelector('.field-feedback') : null;

        let isValid = true;
        let message = '';

        // Required check
        if (input.required && !input.value.trim()) {
            if (strict) {
                isValid = false;
                message = 'Dieses Feld ist erforderlich';
            }
        }

        // Type-spezifische Validierung
        if (input.value && isValid) {
            switch (input.type) {
                case 'email':
                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    if (!emailRegex.test(input.value)) {
                        isValid = false;
                        message = 'Bitte geben Sie eine gueltige E-Mail-Adresse ein';
                    }
                    break;

                case 'tel':
                    const phoneRegex = /^[\d\s\-\+\(\)]{6,}$/;
                    if (!phoneRegex.test(input.value)) {
                        isValid = false;
                        message = 'Bitte geben Sie eine gueltige Telefonnummer ein';
                    }
                    break;

                case 'number':
                    const num = parseFloat(input.value);
                    if (input.min && num < parseFloat(input.min)) {
                        isValid = false;
                        message = 'Mindestwert: ' + input.min;
                    }
                    if (input.max && num > parseFloat(input.max)) {
                        isValid = false;
                        message = 'Maximalwert: ' + input.max;
                    }
                    break;

                case 'url':
                    try {
                        new URL(input.value);
                    } catch {
                        isValid = false;
                        message = 'Bitte geben Sie eine gueltige URL ein';
                    }
                    break;
            }
        }

        // Pattern check
        if (input.pattern && input.value && isValid) {
            const regex = new RegExp(input.pattern);
            if (!regex.test(input.value)) {
                isValid = false;
                message = input.title || 'Format ungueltig';
            }
        }

        // Min/Max length check
        if (input.minLength > 0 && input.value.length < input.minLength && isValid) {
            isValid = false;
            message = 'Mindestens ' + input.minLength + ' Zeichen erforderlich';
        }
        if (input.maxLength > 0 && input.value.length > input.maxLength && isValid) {
            isValid = false;
            message = 'Maximal ' + input.maxLength + ' Zeichen erlaubt';
        }

        // Custom validation
        if (input.dataset.validate && isValid) {
            const customResult = this.runCustomValidation(input);
            if (!customResult.valid) {
                isValid = false;
                message = customResult.message;
            }
        }

        // UI aktualisieren
        this.updateFieldUI(input, wrapper, feedback, isValid, message, strict);

        return isValid;
    }

    runCustomValidation(input) {
        const validationType = input.dataset.validate;

        switch (validationType) {
            case 'match':
                // Muss mit anderem Feld uebereinstimmen
                const matchField = document.getElementById(input.dataset.matchField);
                if (matchField && input.value !== matchField.value) {
                    return { valid: false, message: 'Felder stimmen nicht ueberein' };
                }
                break;

            case 'inventoryNumber':
                // ORCA Inventurnummer Format
                const invRegex = /^[A-Z]{2,4}-\d{4,8}$/;
                if (!invRegex.test(input.value)) {
                    return { valid: false, message: 'Format: XX-12345' };
                }
                break;

            case 'toolNumber':
                // Werkzeugnummer
                const toolRegex = /^\d{6,12}$/;
                if (!toolRegex.test(input.value)) {
                    return { valid: false, message: 'Nur Ziffern (6-12 Stellen)' };
                }
                break;
        }

        return { valid: true, message: '' };
    }

    updateFieldUI(input, wrapper, feedback, isValid, message, strict) {
        if (!strict && isValid) {
            // Beim Tippen: nur Erfolg zeigen, keine Fehler
            if (input.value.length > 2) {
                input.classList.remove('field-error');
                input.classList.add('field-valid');
            }
            return;
        }

        input.classList.toggle('field-error', !isValid);
        input.classList.toggle('field-valid', isValid && input.value.length > 0);

        if (wrapper) {
            wrapper.classList.toggle('has-error', !isValid);
            wrapper.classList.toggle('has-success', isValid && input.value.length > 0);
            wrapper.classList.remove('focused');
        }

        if (feedback) {
            feedback.textContent = message;
            feedback.className = 'field-feedback ' + (isValid ? 'success' : 'error');
        }
    }

    // Character Counter
    updateCharCounter(input) {
        if (!input.maxLength || input.maxLength < 0) return;

        let counter = input.parentElement.querySelector('.char-counter');
        if (!counter) {
            counter = document.createElement('span');
            counter.className = 'char-counter';
            input.parentElement.appendChild(counter);
        }

        const remaining = input.maxLength - input.value.length;
        counter.textContent = remaining + ' / ' + input.maxLength;
        counter.classList.toggle('warning', remaining < 20);
        counter.classList.toggle('danger', remaining < 5);
    }

    // Auto-Save
    setupAutoSave(form) {
        const formId = form.id || 'form_' + Math.random().toString(36).substr(2, 9);
        form.dataset.formId = formId;

        // Gespeicherte Daten laden
        this.loadFormData(form, formId);

        // Auto-Save Indicator hinzufuegen
        const indicator = document.createElement('div');
        indicator.className = 'autosave-indicator';
        indicator.innerHTML = '<span class="autosave-icon">&#128190;</span> <span class="autosave-text">Automatisch gespeichert</span>';
        form.insertBefore(indicator, form.firstChild);
    }

    triggerAutoSave(form) {
        const formId = form.dataset.formId;
        if (!formId) return;

        clearTimeout(this.autoSaveTimers[formId]);

        // Indicator: Speichern...
        const indicator = form.querySelector('.autosave-indicator');
        if (indicator) {
            indicator.classList.add('saving');
            indicator.querySelector('.autosave-text').textContent = 'Speichern...';
        }

        this.autoSaveTimers[formId] = setTimeout(() => {
            this.saveFormData(form, formId);

            // Indicator: Gespeichert
            if (indicator) {
                indicator.classList.remove('saving');
                indicator.classList.add('saved');
                indicator.querySelector('.autosave-text').textContent = 'Gespeichert';

                setTimeout(() => {
                    indicator.classList.remove('saved');
                    indicator.querySelector('.autosave-text').textContent = 'Automatisch gespeichert';
                }, 2000);
            }
        }, 1000);
    }

    saveFormData(form, formId) {
        const data = {};
        const inputs = form.querySelectorAll('input, textarea, select');

        inputs.forEach(input => {
            if (input.name || input.id) {
                const key = input.name || input.id;
                if (input.type === 'checkbox') {
                    data[key] = input.checked;
                } else if (input.type === 'radio') {
                    if (input.checked) data[key] = input.value;
                } else {
                    data[key] = input.value;
                }
            }
        });

        try {
            localStorage.setItem('orca_form_' + formId, JSON.stringify({
                data: data,
                timestamp: Date.now()
            }));
        } catch (e) {
            console.warn('[Form] Auto-save failed:', e);
        }
    }

    loadFormData(form, formId) {
        try {
            const saved = localStorage.getItem('orca_form_' + formId);
            if (!saved) return;

            const { data, timestamp } = JSON.parse(saved);

            // Daten aelter als 24h ignorieren
            if (Date.now() - timestamp > 24 * 60 * 60 * 1000) {
                localStorage.removeItem('orca_form_' + formId);
                return;
            }

            // Daten wiederherstellen
            Object.keys(data).forEach(key => {
                const input = form.querySelector('[name="' + key + '"], #' + key);
                if (input) {
                    if (input.type === 'checkbox') {
                        input.checked = data[key];
                    } else if (input.type === 'radio') {
                        if (input.value === data[key]) input.checked = true;
                    } else {
                        input.value = data[key];
                    }
                }
            });

            // Hinweis anzeigen
            if (typeof errorService !== 'undefined') {
                errorService.showToast('Formular wurde aus Entwurf wiederhergestellt', 'info');
            }
        } catch (e) {
            console.warn('[Form] Load failed:', e);
        }
    }

    clearFormData(formId) {
        localStorage.removeItem('orca_form_' + formId);
    }

    // Submit Handler
    handleSubmit(e, form) {
        // Alle Felder validieren
        const inputs = form.querySelectorAll('input, textarea, select');
        let allValid = true;
        let firstInvalid = null;

        inputs.forEach(input => {
            if (!this.validateField(input, true)) {
                allValid = false;
                if (!firstInvalid) firstInvalid = input;
            }
        });

        if (!allValid) {
            e.preventDefault();

            // Zum ersten fehlerhaften Feld scrollen
            if (firstInvalid) {
                firstInvalid.focus();
                firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }

            // Fehlermeldung
            if (typeof errorService !== 'undefined') {
                errorService.showToast('Bitte korrigieren Sie die markierten Felder', 'error');
            }

            // Form schuetteln
            form.classList.add('form-shake');
            setTimeout(() => form.classList.remove('form-shake'), 500);

            return false;
        }

        // Auto-Save Daten loeschen bei erfolgreichem Submit
        if (form.dataset.formId) {
            this.clearFormData(form.dataset.formId);
        }

        return true;
    }

    // Hilfsmethoden fuer manuelle Verwendung
    validate(formOrSelector) {
        const form = typeof formOrSelector === 'string'
            ? document.querySelector(formOrSelector)
            : formOrSelector;

        if (!form) return false;

        const inputs = form.querySelectorAll('input, textarea, select');
        let allValid = true;

        inputs.forEach(input => {
            if (!this.validateField(input, true)) {
                allValid = false;
            }
        });

        return allValid;
    }

    reset(formOrSelector) {
        const form = typeof formOrSelector === 'string'
            ? document.querySelector(formOrSelector)
            : formOrSelector;

        if (!form) return;

        form.reset();

        // Validation states zuruecksetzen
        form.querySelectorAll('.field-error, .field-valid').forEach(el => {
            el.classList.remove('field-error', 'field-valid');
        });
        form.querySelectorAll('.has-error, .has-success').forEach(el => {
            el.classList.remove('has-error', 'has-success');
        });
        form.querySelectorAll('.field-feedback').forEach(el => {
            el.textContent = '';
        });

        // Auto-Save loeschen
        if (form.dataset.formId) {
            this.clearFormData(form.dataset.formId);
        }
    }
}

// Globale Instanz
const formService = new FormService();
