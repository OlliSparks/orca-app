// ORCA 2.0 - Form Service
// Inline-Validierung, Auto-Save, verbesserte UX

class FormService {
    constructor() {
        this.autoSaveTimers = {};
        this.validationRules = {};
        // Wait for DOM
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.init());
        } else {
            this.init();
        }
    }

    init() {
        try {
            // Observer fuer neue Formulare im DOM
            this.setupMutationObserver();

            // Event-Delegation fuer Formulare
            document.addEventListener('input', (e) => this.handleInput(e), true);
            document.addEventListener('blur', (e) => this.handleBlur(e), true);
            document.addEventListener('focus', (e) => this.handleFocus(e), true);
        } catch (e) {
            console.warn('[Form] Init error:', e);
        }
    }

    setupMutationObserver() {
        if (!document.body) return;

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

    enhanceForm(form) {
        if (!form || form.dataset.enhanced) return;
        form.dataset.enhanced = 'true';

        if (form.dataset.autosave) {
            this.setupAutoSave(form);
        }

        form.addEventListener('submit', (e) => this.handleSubmit(e, form));
    }

    enhanceInput(input) {
        if (!input || input.dataset.enhanced) return;
        input.dataset.enhanced = 'true';
    }

    handleInput(e) {
        const input = e.target;
        if (!this.isFormElement(input)) return;

        clearTimeout(input._validationTimer);
        input._validationTimer = setTimeout(() => {
            this.validateField(input, false);
        }, 300);

        const form = input.closest('form, [data-form]');
        if (form && form.dataset.autosave) {
            this.triggerAutoSave(form);
        }

        this.updateCharCounter(input);
    }

    handleBlur(e) {
        const input = e.target;
        if (!this.isFormElement(input)) return;
        this.validateField(input, true);
    }

    handleFocus(e) {
        const input = e.target;
        if (!this.isFormElement(input)) return;

        const wrapper = input.closest('.form-field');
        if (wrapper) {
            wrapper.classList.add('focused');
        }
        input.classList.remove('field-error');
    }

    isFormElement(el) {
        return el && ['INPUT', 'TEXTAREA', 'SELECT'].includes(el.tagName);
    }

    validateField(input, strict = true) {
        if (!input) return true;

        let isValid = true;
        let message = '';

        // Required check
        if (input.required && !input.value.trim()) {
            if (strict) {
                isValid = false;
                message = 'Dieses Feld ist erforderlich';
            }
        }

        // Type-specific validation
        if (input.value && isValid) {
            switch (input.type) {
                case 'email':
                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    if (!emailRegex.test(input.value)) {
                        isValid = false;
                        message = 'Bitte geben Sie eine gueltige E-Mail-Adresse ein';
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
            }
        }

        // Min/Max length check
        if (input.minLength > 0 && input.value.length < input.minLength && isValid) {
            isValid = false;
            message = 'Mindestens ' + input.minLength + ' Zeichen erforderlich';
        }

        this.updateFieldUI(input, isValid, message, strict);
        return isValid;
    }

    updateFieldUI(input, isValid, message, strict) {
        const wrapper = input.closest('.form-field');
        const feedback = wrapper ? wrapper.querySelector('.field-feedback') : null;

        if (!strict && isValid) {
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

    updateCharCounter(input) {
        if (!input.maxLength || input.maxLength < 0) return;

        let counter = input.parentElement ? input.parentElement.querySelector('.char-counter') : null;
        if (!counter && input.parentElement) {
            counter = document.createElement('span');
            counter.className = 'char-counter';
            input.parentElement.appendChild(counter);
        }

        if (counter) {
            const remaining = input.maxLength - input.value.length;
            counter.textContent = remaining + ' / ' + input.maxLength;
            counter.classList.toggle('warning', remaining < 20);
            counter.classList.toggle('danger', remaining < 5);
        }
    }

    setupAutoSave(form) {
        const formId = form.id || 'form_' + Math.random().toString(36).substr(2, 9);
        form.dataset.formId = formId;
        this.loadFormData(form, formId);
    }

    triggerAutoSave(form) {
        const formId = form.dataset.formId;
        if (!formId) return;

        clearTimeout(this.autoSaveTimers[formId]);
        this.autoSaveTimers[formId] = setTimeout(() => {
            this.saveFormData(form, formId);
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

            if (Date.now() - timestamp > 24 * 60 * 60 * 1000) {
                localStorage.removeItem('orca_form_' + formId);
                return;
            }

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
        } catch (e) {
            console.warn('[Form] Load failed:', e);
        }
    }

    handleSubmit(e, form) {
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
            if (firstInvalid) {
                firstInvalid.focus();
            }
            return false;
        }

        if (form.dataset.formId) {
            localStorage.removeItem('orca_form_' + form.dataset.formId);
        }
        return true;
    }

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
}

// Globale Instanz
const formService = new FormService();
