// ORCA 2.0 - Animation Service
// Page Transitions, Micro-Interactions, Motion Design

class AnimationService {
    constructor() {
        this.prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        this.init();
    }

    init() {
        // Auf System-Einstellung reagieren
        window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', (e) => {
            this.prefersReducedMotion = e.matches;
        });

        // Page Transitions aktivieren
        this.setupPageTransitions();

        // Scroll-Animationen
        this.setupScrollAnimations();

        // Hover-Effekte
        this.setupHoverEffects();

        // Click-Ripple
        this.setupRippleEffect();
    }

    // Page Transitions bei Route-Wechsel
    setupPageTransitions() {
        // Observer fuer #app Container
        const app = document.getElementById('app');
        if (!app) return;

        const observer = new MutationObserver((mutations) => {
            mutations.forEach(mutation => {
                if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                    // Neue Seite animieren
                    this.animatePageIn(app);
                }
            });
        });

        observer.observe(app, { childList: true });
    }

    animatePageIn(container) {
        if (this.prefersReducedMotion) return;

        // Alle direkten Kinder animieren
        const children = container.children;
        Array.from(children).forEach((child, index) => {
            child.style.opacity = '0';
            child.style.transform = 'translateY(20px)';

            requestAnimationFrame(() => {
                child.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
                child.style.transitionDelay = (index * 50) + 'ms';
                child.style.opacity = '1';
                child.style.transform = 'translateY(0)';
            });
        });
    }

    // Scroll-Animationen (Fade-in bei Sichtbarkeit)
    setupScrollAnimations() {
        if (this.prefersReducedMotion) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });

        // Bestehende Elemente observieren
        document.querySelectorAll('[data-animate]').forEach(el => {
            el.classList.add('animate-ready');
            observer.observe(el);
        });

        // Mutation Observer fuer neue Elemente
        const mutationObserver = new MutationObserver((mutations) => {
            mutations.forEach(mutation => {
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType === 1) {
                        const animatable = node.querySelectorAll ? node.querySelectorAll('[data-animate]') : [];
                        animatable.forEach(el => {
                            el.classList.add('animate-ready');
                            observer.observe(el);
                        });

                        if (node.dataset && node.dataset.animate) {
                            node.classList.add('animate-ready');
                            observer.observe(node);
                        }
                    }
                });
            });
        });

        mutationObserver.observe(document.body, { childList: true, subtree: true });
    }

    // Hover-Effekte fuer Karten und Buttons
    setupHoverEffects() {
        if (this.prefersReducedMotion) return;

        document.addEventListener('mouseenter', (e) => {
            const card = e.target.closest('.card, .stat-card, .tool-card, .progress-stat-card');
            if (card) {
                card.classList.add('hover-lift');
            }
        }, true);

        document.addEventListener('mouseleave', (e) => {
            const card = e.target.closest('.card, .stat-card, .tool-card, .progress-stat-card');
            if (card) {
                card.classList.remove('hover-lift');
            }
        }, true);
    }

    // Ripple-Effekt bei Klick
    setupRippleEffect() {
        if (this.prefersReducedMotion) return;

        document.addEventListener('click', (e) => {
            const button = e.target.closest('.btn, .action-btn, .filter-chip, button[class*="btn"]');
            if (!button) return;

            // Existierende Ripples entfernen
            button.querySelectorAll('.ripple').forEach(r => r.remove());

            const ripple = document.createElement('span');
            ripple.className = 'ripple';

            const rect = button.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;

            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = x + 'px';
            ripple.style.top = y + 'px';

            button.appendChild(ripple);

            setTimeout(() => ripple.remove(), 600);
        });
    }

    // Hilfsmethoden fuer manuelle Animationen

    // Element einblenden
    fadeIn(element, duration = 300) {
        if (this.prefersReducedMotion) {
            element.style.opacity = '1';
            return Promise.resolve();
        }

        return new Promise(resolve => {
            element.style.opacity = '0';
            element.style.display = '';
            element.style.transition = 'opacity ' + duration + 'ms ease';

            requestAnimationFrame(() => {
                element.style.opacity = '1';
            });

            setTimeout(resolve, duration);
        });
    }

    // Element ausblenden
    fadeOut(element, duration = 300) {
        if (this.prefersReducedMotion) {
            element.style.opacity = '0';
            element.style.display = 'none';
            return Promise.resolve();
        }

        return new Promise(resolve => {
            element.style.transition = 'opacity ' + duration + 'ms ease';
            element.style.opacity = '0';

            setTimeout(() => {
                element.style.display = 'none';
                resolve();
            }, duration);
        });
    }

    // Element von unten einschieben
    slideUp(element, duration = 300) {
        if (this.prefersReducedMotion) {
            element.style.transform = 'translateY(0)';
            element.style.opacity = '1';
            return Promise.resolve();
        }

        return new Promise(resolve => {
            element.style.transform = 'translateY(30px)';
            element.style.opacity = '0';
            element.style.display = '';
            element.style.transition = 'transform ' + duration + 'ms ease, opacity ' + duration + 'ms ease';

            requestAnimationFrame(() => {
                element.style.transform = 'translateY(0)';
                element.style.opacity = '1';
            });

            setTimeout(resolve, duration);
        });
    }

    // Element nach unten ausschieben
    slideDown(element, duration = 300) {
        if (this.prefersReducedMotion) {
            element.style.display = 'none';
            return Promise.resolve();
        }

        return new Promise(resolve => {
            element.style.transition = 'transform ' + duration + 'ms ease, opacity ' + duration + 'ms ease';
            element.style.transform = 'translateY(30px)';
            element.style.opacity = '0';

            setTimeout(() => {
                element.style.display = 'none';
                element.style.transform = '';
                resolve();
            }, duration);
        });
    }

    // Skalieren (Popup-Effekt)
    popIn(element, duration = 200) {
        if (this.prefersReducedMotion) {
            element.style.transform = 'scale(1)';
            element.style.opacity = '1';
            return Promise.resolve();
        }

        return new Promise(resolve => {
            element.style.transform = 'scale(0.8)';
            element.style.opacity = '0';
            element.style.display = '';
            element.style.transition = 'transform ' + duration + 'ms cubic-bezier(0.175, 0.885, 0.32, 1.275), opacity ' + duration + 'ms ease';

            requestAnimationFrame(() => {
                element.style.transform = 'scale(1)';
                element.style.opacity = '1';
            });

            setTimeout(resolve, duration);
        });
    }

    // Schuetteln (Fehler-Feedback)
    shake(element) {
        if (this.prefersReducedMotion) return Promise.resolve();

        return new Promise(resolve => {
            element.classList.add('animate-shake');
            setTimeout(() => {
                element.classList.remove('animate-shake');
                resolve();
            }, 500);
        });
    }

    // Pulsieren (Aufmerksamkeit)
    pulse(element, count = 2) {
        if (this.prefersReducedMotion) return Promise.resolve();

        return new Promise(resolve => {
            element.style.animation = 'pulse ' + (count * 0.5) + 's ease-in-out';
            setTimeout(() => {
                element.style.animation = '';
                resolve();
            }, count * 500);
        });
    }

    // Highlight (kurzes Aufleuchten)
    highlight(element, color = '#fef08a') {
        if (this.prefersReducedMotion) return Promise.resolve();

        return new Promise(resolve => {
            const originalBg = element.style.backgroundColor;
            element.style.transition = 'background-color 0.3s ease';
            element.style.backgroundColor = color;

            setTimeout(() => {
                element.style.backgroundColor = originalBg;
                setTimeout(resolve, 300);
            }, 500);
        });
    }

    // Staggered Animation (nacheinander)
    stagger(elements, animation = 'fadeIn', delay = 50) {
        if (this.prefersReducedMotion) return Promise.resolve();

        const promises = Array.from(elements).map((el, index) => {
            return new Promise(resolve => {
                setTimeout(() => {
                    if (animation === 'fadeIn') {
                        this.fadeIn(el).then(resolve);
                    } else if (animation === 'slideUp') {
                        this.slideUp(el).then(resolve);
                    } else if (animation === 'popIn') {
                        this.popIn(el).then(resolve);
                    } else {
                        resolve();
                    }
                }, index * delay);
            });
        });

        return Promise.all(promises);
    }

    // Counter-Animation (Zahlen hochzaehlen)
    countUp(element, target, duration = 1000) {
        if (this.prefersReducedMotion) {
            element.textContent = target;
            return Promise.resolve();
        }

        return new Promise(resolve => {
            const start = parseInt(element.textContent) || 0;
            const increment = (target - start) / (duration / 16);
            let current = start;

            const step = () => {
                current += increment;
                if ((increment > 0 && current >= target) || (increment < 0 && current <= target)) {
                    element.textContent = target;
                    resolve();
                } else {
                    element.textContent = Math.round(current);
                    requestAnimationFrame(step);
                }
            };

            requestAnimationFrame(step);
        });
    }

    // Fortschrittsbalken animieren
    animateProgress(element, target, duration = 500) {
        if (this.prefersReducedMotion) {
            element.style.width = target + '%';
            return Promise.resolve();
        }

        return new Promise(resolve => {
            element.style.transition = 'width ' + duration + 'ms ease-out';
            element.style.width = target + '%';
            setTimeout(resolve, duration);
        });
    }
}

// Globale Instanz
const animationService = new AnimationService();
