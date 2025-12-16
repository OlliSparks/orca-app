// ORCA 2.0 - Animation Service
// Page Transitions, Micro-Interactions, Motion Design

class AnimationService {
    constructor() {
        this.prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        // Wait for DOM
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.init());
        } else {
            this.init();
        }
    }

    init() {
        try {
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
        } catch (e) {
            console.warn('[Animation] Init error:', e);
        }
    }

    setupPageTransitions() {
        const app = document.getElementById('app');
        if (!app) return;

        const observer = new MutationObserver((mutations) => {
            mutations.forEach(mutation => {
                if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                    this.animatePageIn(app);
                }
            });
        });

        observer.observe(app, { childList: true });
    }

    animatePageIn(container) {
        if (this.prefersReducedMotion || !container) return;

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

    setupScrollAnimations() {
        if (this.prefersReducedMotion || !document.body) return;

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

        document.querySelectorAll('[data-animate]').forEach(el => {
            el.classList.add('animate-ready');
            observer.observe(el);
        });
    }

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

    setupRippleEffect() {
        if (this.prefersReducedMotion) return;

        document.addEventListener('click', (e) => {
            const button = e.target.closest('.btn, .action-btn, .filter-chip, button[class*="btn"]');
            if (!button) return;

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

    // Helper methods
    fadeIn(element, duration = 300) {
        if (!element) return Promise.resolve();
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

    fadeOut(element, duration = 300) {
        if (!element) return Promise.resolve();
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

    shake(element) {
        if (!element || this.prefersReducedMotion) return Promise.resolve();

        return new Promise(resolve => {
            element.classList.add('animate-shake');
            setTimeout(() => {
                element.classList.remove('animate-shake');
                resolve();
            }, 500);
        });
    }

    highlight(element, color = '#fef08a') {
        if (!element || this.prefersReducedMotion) return Promise.resolve();

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
}

// Globale Instanz
const animationService = new AnimationService();
