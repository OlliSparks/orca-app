// ORCA 2.0 - Loading Service
// Skeleton-Screens und Loading-States für bessere UX

class LoadingService {
    constructor() {
        this.activeLoaders = new Set();
    }

    // Skeleton für eine einzelne Karte
    cardSkeleton(count = 1) {
        return Array(count).fill(`
            <div class="skeleton-card">
                <div class="skeleton-header">
                    <div class="skeleton-avatar"></div>
                    <div class="skeleton-title-group">
                        <div class="skeleton-title"></div>
                        <div class="skeleton-subtitle"></div>
                    </div>
                </div>
                <div class="skeleton-body">
                    <div class="skeleton-line"></div>
                    <div class="skeleton-line short"></div>
                    <div class="skeleton-line medium"></div>
                </div>
                <div class="skeleton-footer">
                    <div class="skeleton-button"></div>
                    <div class="skeleton-button small"></div>
                </div>
            </div>
        `).join('');
    }

    // Skeleton für Tabellen-Zeilen
    tableRowSkeleton(count = 5, columns = 6) {
        const cells = Array(columns).fill('<td><div class="skeleton-cell"></div></td>').join('');
        return Array(count).fill(`<tr class="skeleton-row">${cells}</tr>`).join('');
    }

    // Skeleton für Dashboard-Statistiken
    statsSkeleton(count = 4) {
        return Array(count).fill(`
            <div class="skeleton-stat">
                <div class="skeleton-stat-icon"></div>
                <div class="skeleton-stat-content">
                    <div class="skeleton-stat-value"></div>
                    <div class="skeleton-stat-label"></div>
                </div>
            </div>
        `).join('');
    }

    // Skeleton für Listen-Items
    listSkeleton(count = 5) {
        return Array(count).fill(`
            <div class="skeleton-list-item">
                <div class="skeleton-list-icon"></div>
                <div class="skeleton-list-content">
                    <div class="skeleton-line"></div>
                    <div class="skeleton-line short"></div>
                </div>
                <div class="skeleton-list-action"></div>
            </div>
        `).join('');
    }

    // Skeleton für Detail-Ansicht
    detailSkeleton() {
        return `
            <div class="skeleton-detail">
                <div class="skeleton-detail-header">
                    <div class="skeleton-detail-icon"></div>
                    <div class="skeleton-detail-title-group">
                        <div class="skeleton-title large"></div>
                        <div class="skeleton-subtitle"></div>
                    </div>
                </div>
                <div class="skeleton-detail-grid">
                    <div class="skeleton-detail-section">
                        <div class="skeleton-section-title"></div>
                        <div class="skeleton-line"></div>
                        <div class="skeleton-line medium"></div>
                        <div class="skeleton-line short"></div>
                    </div>
                    <div class="skeleton-detail-section">
                        <div class="skeleton-section-title"></div>
                        <div class="skeleton-line"></div>
                        <div class="skeleton-line"></div>
                        <div class="skeleton-line medium"></div>
                    </div>
                </div>
            </div>
        `;
    }

    // Skeleton für Agent-Chat
    chatSkeleton(count = 3) {
        return Array(count).fill(`
            <div class="skeleton-chat-message">
                <div class="skeleton-chat-avatar"></div>
                <div class="skeleton-chat-bubble">
                    <div class="skeleton-line"></div>
                    <div class="skeleton-line medium"></div>
                </div>
            </div>
        `).join('');
    }

    // Full-Page Skeleton
    pageSkeleton(type = 'list') {
        const skeletons = {
            'list': `
                <div class="skeleton-page">
                    <div class="skeleton-page-header">
                        <div class="skeleton-title large"></div>
                        <div class="skeleton-actions">
                            <div class="skeleton-button"></div>
                            <div class="skeleton-button"></div>
                        </div>
                    </div>
                    <div class="skeleton-filters">
                        <div class="skeleton-filter"></div>
                        <div class="skeleton-filter"></div>
                        <div class="skeleton-filter"></div>
                    </div>
                    <div class="skeleton-content">
                        ${this.cardSkeleton(6)}
                    </div>
                </div>
            `,
            'table': `
                <div class="skeleton-page">
                    <div class="skeleton-page-header">
                        <div class="skeleton-title large"></div>
                        <div class="skeleton-actions">
                            <div class="skeleton-button"></div>
                            <div class="skeleton-button"></div>
                        </div>
                    </div>
                    <div class="skeleton-table">
                        <div class="skeleton-table-header">
                            ${Array(6).fill('<div class="skeleton-th"></div>').join('')}
                        </div>
                        ${this.tableRowSkeleton(8, 6)}
                    </div>
                </div>
            `,
            'detail': this.detailSkeleton(),
            'dashboard': `
                <div class="skeleton-page">
                    <div class="skeleton-stats-row">
                        ${this.statsSkeleton(4)}
                    </div>
                    <div class="skeleton-dashboard-grid">
                        <div class="skeleton-dashboard-card large">
                            <div class="skeleton-section-title"></div>
                            ${this.listSkeleton(4)}
                        </div>
                        <div class="skeleton-dashboard-card">
                            <div class="skeleton-section-title"></div>
                            ${this.listSkeleton(3)}
                        </div>
                    </div>
                </div>
            `
        };
        return skeletons[type] || skeletons['list'];
    }

    // Loading-Overlay für Container
    showLoading(containerId, type = 'spinner', message = 'Laden...') {
        const container = document.getElementById(containerId);
        if (!container) return;

        this.activeLoaders.add(containerId);

        const loaderHtml = type === 'skeleton'
            ? this.cardSkeleton(3)
            : `
                <div class="loading-overlay">
                    <div class="loading-spinner"></div>
                    <p class="loading-message">${message}</p>
                </div>
            `;

        // Wrap existing content
        const existingContent = container.innerHTML;
        container.innerHTML = `
            <div class="loading-wrapper">
                <div class="loading-content" style="display: none;">${existingContent}</div>
                <div class="loading-state">${loaderHtml}</div>
            </div>
        `;
    }

    // Loading beenden und Content zeigen
    hideLoading(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        this.activeLoaders.delete(containerId);

        const wrapper = container.querySelector('.loading-wrapper');
        if (wrapper) {
            const content = wrapper.querySelector('.loading-content');
            const loader = wrapper.querySelector('.loading-state');

            if (content && loader) {
                loader.classList.add('fade-out');
                setTimeout(() => {
                    content.style.display = '';
                    content.classList.add('fade-in');
                    loader.remove();

                    // Unwrap content
                    container.innerHTML = content.innerHTML;
                }, 200);
            }
        }
    }

    // Inline-Loader für Buttons
    buttonLoading(button, loading = true, loadingText = null) {
        if (loading) {
            button.dataset.originalText = button.innerHTML;
            button.disabled = true;
            button.classList.add('btn-loading');
            button.innerHTML = `
                <span class="btn-spinner"></span>
                ${loadingText || 'Laden...'}
            `;
        } else {
            button.disabled = false;
            button.classList.remove('btn-loading');
            button.innerHTML = button.dataset.originalText || button.innerHTML;
        }
    }

    // Progress-Bar
    showProgress(containerId, percent = 0, message = '') {
        const container = document.getElementById(containerId);
        if (!container) return;

        const progressHtml = `
            <div class="progress-wrapper">
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${percent}%"></div>
                </div>
                <div class="progress-info">
                    <span class="progress-message">${message}</span>
                    <span class="progress-percent">${percent}%</span>
                </div>
            </div>
        `;

        const existing = container.querySelector('.progress-wrapper');
        if (existing) {
            existing.querySelector('.progress-fill').style.width = `${percent}%`;
            existing.querySelector('.progress-percent').textContent = `${percent}%`;
            if (message) {
                existing.querySelector('.progress-message').textContent = message;
            }
        } else {
            container.insertAdjacentHTML('afterbegin', progressHtml);
        }
    }

    hideProgress(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const progress = container.querySelector('.progress-wrapper');
        if (progress) {
            progress.classList.add('fade-out');
            setTimeout(() => progress.remove(), 200);
        }
    }

    // Shimmer-Effekt für beliebige Elemente
    addShimmer(element) {
        element.classList.add('shimmer');
    }

    removeShimmer(element) {
        element.classList.remove('shimmer');
    }

    // Empty-State anzeigen
    emptyState(options = {}) {
        const {
            icon = '📭',
            title = 'Keine Daten',
            message = 'Es wurden keine Einträge gefunden.',
            action = null,
            actionText = 'Neu laden'
        } = options;

        return `
            <div class="empty-state">
                <div class="empty-state-icon">${icon}</div>
                <h3 class="empty-state-title">${title}</h3>
                <p class="empty-state-message">${message}</p>
                ${action ? `<button class="btn-empty-action" onclick="${action}">${actionText}</button>` : ''}
            </div>
        `;
    }

    // Error-State anzeigen
    errorState(options = {}) {
        const {
            icon = '⚠️',
            title = 'Fehler beim Laden',
            message = 'Die Daten konnten nicht geladen werden.',
            retryAction = null
        } = options;

        return `
            <div class="error-state">
                <div class="error-state-icon">${icon}</div>
                <h3 class="error-state-title">${title}</h3>
                <p class="error-state-message">${message}</p>
                ${retryAction ? `<button class="btn-retry" onclick="${retryAction}">Erneut versuchen</button>` : ''}
            </div>
        `;
    }
}

// Globale Instanz
const loadingService = new LoadingService();
