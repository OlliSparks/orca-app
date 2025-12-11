// ORCA 2.0 - ABL (Abnahmebereitschaft) Detail
class ABLDetailPage {
    constructor() {
        this.inventoryKey = null;
        this.inventory = null;
        this.positions = [];
        this.isLoading = false;
    }

    async render(inventoryKey) {
        this.inventoryKey = inventoryKey;
        const app = document.getElementById('app');

        // Update Header
        document.getElementById('headerTitle').textContent = 'orca 2.0 - Werkzeug Management';
        document.getElementById('headerSubtitle').textContent = 'ABL Details';

        // Hide header stats
        const headerStats = document.getElementById('headerStats');
        if (headerStats) {
            headerStats.style.display = 'none';
        }

        // Initial loading state
        app.innerHTML = `
            <div class="container">
                <div class="card" style="text-align: center; padding: 4rem 2rem;">
                    <div style="font-size: 2rem; margin-bottom: 1rem;">Lade ABL-Details...</div>
                </div>
            </div>
        `;

        // Update footer
        document.getElementById('footerActions').innerHTML = `
            <button class="btn btn-neutral" onclick="router.navigate('/abl')">Zurueck zur Liste</button>
        `;

        // Load data
        await this.loadData();
    }

    async loadData() {
        this.isLoading = true;

        try {
            // Load inventory details
            const detailResult = await api.getInventoryDetails(this.inventoryKey);
            console.log('ABL Detail Response:', detailResult);

            if (!detailResult.success) {
                this.showError('ABL nicht gefunden');
                return;
            }
            // Extrahiere Daten aus der Response-Struktur
            const rawData = detailResult.data;
            const meta = rawData.meta || rawData;
            this.inventory = {
                ...meta,
                inventoryStatus: meta.status || 'I0',
                title: meta.description || meta.title || 'Abnahmebereitschaft',
                identifier: meta.orders || meta.identifier || '',
                supplier: meta.supplier || '',
                responsibleUser: meta.responsibleUser || '',
                assignedUser: meta.assignedUser || '',
                creator: meta.creator || '',
                dueDate: meta.dueDate || null,
                created: meta.created || null,
                type: meta.type || 'ID'
            };

            // Load positions
            const positionsResult = await api.getABLPositions(this.inventoryKey);
            console.log('ABL Positions Response:', positionsResult);

            if (positionsResult.success) {
                this.positions = positionsResult.data || [];
            }

            this.renderDetail();
        } catch (error) {
            console.error('Error loading ABL:', error);
            this.showError('Fehler beim Laden der ABL: ' + error.message);
        } finally {
            this.isLoading = false;
        }
    }

    renderDetail() {
        const app = document.getElementById('app');
        const inv = this.inventory;

        // Status-Mapping
        const statusInfo = {
            'I0': { class: 'status-geplant', text: 'Geplant' },
            'I1': { class: 'status-laufend', text: 'Laufend' },
            'I2': { class: 'status-durchgefuehrt', text: 'Durchgefuehrt' },
            'I3': { class: 'status-akzeptiert', text: 'Akzeptiert' },
            'I4': { class: 'status-abgeschlossen', text: 'Abgeschlossen' }
        }[inv.inventoryStatus] || { class: 'status-geplant', text: inv.inventoryStatus || 'Unbekannt' };

        // Fortschritt berechnen
        const total = this.positions.length;
        const done = this.positions.filter(p => p.positionStatus === 'P3' || p.positionStatus === 'P4' || p.positionStatus === 'P5').length;
        const progress = total > 0 ? Math.round((done / total) * 100) : 0;

        // Standorte aus Positionen sammeln
        const locations = [...new Set(this.positions.map(p => p.location || p.assetCity).filter(Boolean))];
        const locationStr = locations.length > 0 ? locations.slice(0, 3).join(', ') + (locations.length > 3 ? '...' : '') : '-';

        app.innerHTML = `
            <div class="container">
                <!-- Back Navigation -->
                <div style="margin-bottom: 1rem;">
                    <button class="btn btn-neutral" onclick="router.navigate('/abl')" style="padding: 0.5rem 1rem;">
                        &larr; Zurueck zur Liste
                    </button>
                </div>

                <!-- Header Card -->
                <div class="card" style="margin-bottom: 1.5rem;">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 1rem;">
                        <div>
                            <h1 style="font-size: 1.5rem; margin-bottom: 0.5rem;">${inv.title || inv.description || 'Abnahmebereitschaft'}</h1>
                            <p style="color: #6b7280; margin-bottom: 0.5rem;">Bestell-Position: ${inv.identifier || inv.orders || this.inventoryKey.substring(0, 8)}</p>
                            <span class="status-badge ${statusInfo.class}" style="font-size: 0.9rem; padding: 0.4rem 0.8rem;">
                                ${statusInfo.text}
                            </span>
                        </div>
                        <div style="text-align: right;">
                            <p style="color: #6b7280; font-size: 0.9rem;">Faellig am</p>
                            <p style="font-size: 1.2rem; font-weight: 600; ${this.isOverdue(inv.dueDate) ? 'color: #ef4444;' : ''}">${inv.dueDate ? this.formatDate(inv.dueDate) : '-'}</p>
                        </div>
                    </div>
                </div>

                <!-- Progress Card -->
                <div class="card" style="margin-bottom: 1.5rem;">
                    <div style="display: flex; align-items: center; gap: 2rem;">
                        <div style="flex: 1;">
                            <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                                <span style="font-weight: 500;">Fortschritt</span>
                                <span style="font-weight: 600;">${progress}%</span>
                            </div>
                            <div style="background: #e5e7eb; border-radius: 4px; height: 12px; overflow: hidden;">
                                <div style="height: 100%; background: #10b981; border-radius: 4px; width: ${progress}%; transition: width 0.3s;"></div>
                            </div>
                            <div style="display: flex; justify-content: space-between; margin-top: 0.5rem; font-size: 0.875rem; color: #6b7280;">
                                <span>${done} von ${total} Positionen erledigt</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Info Cards -->
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 1.5rem;">
                    <div class="card">
                        <p style="color: #6b7280; font-size: 0.85rem;">Lieferant</p>
                        <p style="font-weight: 500;">${inv.supplier || '-'}</p>
                    </div>
                    <div class="card">
                        <p style="color: #6b7280; font-size: 0.85rem;">Verantwortlicher</p>
                        <p style="font-weight: 500;">${inv.responsibleUser || inv.assignedUser || '-'}</p>
                    </div>
                    <div class="card">
                        <p style="color: #6b7280; font-size: 0.85rem;">Ersteller</p>
                        <p style="font-weight: 500;">${inv.creator || '-'}</p>
                    </div>
                </div>

                <!-- Positions Table -->
                <div class="card">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                        <h2 style="font-size: 1.2rem;">Werkzeuge in dieser ABL</h2>
                        <span style="color: #6b7280;">${this.positions.length} Position(en)</span>
                    </div>

                    <div class="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Inventarnummer</th>
                                    <th>Beschreibung</th>
                                    <th>Standort</th>
                                    <th>Status</th>
                                    <th>Aktionen</th>
                                </tr>
                            </thead>
                            <tbody id="positionsTableBody">
                                ${this.renderPositionsRows()}
                            </tbody>
                        </table>
                    </div>
                </div>

                <!-- Meta Information -->
                <div class="card" style="margin-top: 1.5rem; background: #f9fafb;">
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; font-size: 0.9rem;">
                        <div>
                            <p style="color: #6b7280;">Erstellt am</p>
                            <p>${inv.created ? this.formatDateTime(inv.created) : '-'}</p>
                        </div>
                        <div>
                            <p style="color: #6b7280;">Inventur-Typ</p>
                            <p>${inv.type || 'ID'} (Abnahmebereitschaft)</p>
                        </div>
                        <div>
                            <p style="color: #6b7280;">Inventur-Key</p>
                            <p style="font-family: monospace; font-size: 0.85rem;">${this.inventoryKey}</p>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Update footer with actions
        document.getElementById('footerActions').innerHTML = `
            <button class="btn btn-neutral" onclick="router.navigate('/abl')">Zurueck</button>
            ${inv.inventoryStatus === 'I1' ? `
            <button class="btn btn-primary" onclick="ablDetailPage.reportAll()">Alle melden</button>
            ` : ''}
        `;

        // Inject styles
        this.injectStyles();
    }

    renderPositionsRows() {
        if (this.positions.length === 0) {
            return `
                <tr>
                    <td colspan="5">
                        <div class="empty-state">
                            <div class="empty-state-icon">Keine Positionen</div>
                            <div class="empty-state-text">Keine Werkzeuge in dieser ABL gefunden</div>
                        </div>
                    </td>
                </tr>
            `;
        }

        return this.positions.map(pos => {
            const posStatusInfo = {
                'P0': { class: 'status-geplant', text: 'Geplant' },
                'P1': { class: 'status-laufend', text: 'Versandt' },
                'P2': { class: 'status-laufend', text: 'In Bearbeitung' },
                'P3': { class: 'status-durchgefuehrt', text: 'Gemeldet' },
                'P4': { class: 'status-akzeptiert', text: 'Akzeptiert' },
                'P5': { class: 'status-abgeschlossen', text: 'Abgeschlossen' },
                'P6': { class: 'status-fehler', text: 'Abgelehnt' }
            }[pos.positionStatus] || { class: 'status-geplant', text: pos.positionStatus || 'Unbekannt' };

            // Location zusammenbauen
            let locationDisplay = '-';
            if (pos.location) {
                locationDisplay = pos.location;
            } else if (pos.assetCity) {
                locationDisplay = pos.assetCity + (pos.assetCountry ? ', ' + pos.assetCountry : '');
            }

            return `
                <tr>
                    <td class="tool-number">${pos.inventoryNumber || pos.toolNumber || '-'}</td>
                    <td>${pos.name || '-'}</td>
                    <td>${locationDisplay}</td>
                    <td><span class="status-badge ${posStatusInfo.class}">${posStatusInfo.text}</span></td>
                    <td>
                        <button class="btn btn-secondary" style="padding: 0.25rem 0.5rem; font-size: 0.8rem;" onclick="ablDetailPage.viewAsset('${pos.assetKey}')">
                            Details
                        </button>
                        ${pos.positionStatus === 'P1' || pos.positionStatus === 'P2' ? `
                        <button class="btn btn-primary" style="padding: 0.25rem 0.5rem; font-size: 0.8rem; margin-left: 0.25rem;" onclick="ablDetailPage.reportPosition('${pos.positionKey}', '${pos.revision}')">
                            Melden
                        </button>
                        ` : ''}
                    </td>
                </tr>
            `;
        }).join('');
    }

    injectStyles() {
        if (document.getElementById('abl-detail-styles')) return;

        const styles = document.createElement('style');
        styles.id = 'abl-detail-styles';
        styles.textContent = `
            .status-badge.status-geplant {
                background: #e0f2fe;
                color: #0369a1;
            }
            .status-badge.status-laufend {
                background: #fef3c7;
                color: #92400e;
            }
            .status-badge.status-durchgefuehrt {
                background: #d1fae5;
                color: #065f46;
            }
            .status-badge.status-akzeptiert {
                background: #dbeafe;
                color: #1e40af;
            }
            .status-badge.status-abgeschlossen {
                background: #f3f4f6;
                color: #374151;
            }
            .status-badge.status-fehler {
                background: #fee2e2;
                color: #991b1b;
            }
        `;
        document.head.appendChild(styles);
    }

    isOverdue(dateStr) {
        if (!dateStr) return false;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const dueDate = new Date(dateStr);
        return dueDate < today;
    }

    formatDate(dateStr) {
        if (!dateStr) return '-';
        const date = new Date(dateStr);
        return date.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
    }

    formatDateTime(dateStr) {
        if (!dateStr) return '-';
        const date = new Date(dateStr);
        return date.toLocaleDateString('de-DE', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    viewAsset(assetKey) {
        if (assetKey) {
            router.navigate('/detail/' + assetKey);
        }
    }

    async reportPosition(positionKey, revision) {
        try {
            const result = await api.reportABLPosition(this.inventoryKey, positionKey, revision, {});
            if (result.success) {
                // Reload data
                await this.loadData();
            } else {
                alert('Fehler beim Melden: ' + (result.error || 'Unbekannter Fehler'));
            }
        } catch (error) {
            console.error('Error reporting position:', error);
            alert('Fehler beim Melden: ' + error.message);
        }
    }

    async reportAll() {
        const pendingPositions = this.positions.filter(p => p.positionStatus === 'P1' || p.positionStatus === 'P2');
        if (pendingPositions.length === 0) {
            alert('Keine offenen Positionen zum Melden.');
            return;
        }

        if (!confirm('Moechten Sie alle ' + pendingPositions.length + ' offenen Positionen melden?')) {
            return;
        }

        try {
            for (const pos of pendingPositions) {
                await api.reportABLPosition(this.inventoryKey, pos.positionKey, pos.revision, {});
            }
            // Reload data
            await this.loadData();
        } catch (error) {
            console.error('Error reporting all:', error);
            alert('Fehler beim Melden: ' + error.message);
        }
    }

    showError(message) {
        const app = document.getElementById('app');
        app.innerHTML = `
            <div class="container">
                <div style="margin-bottom: 1rem;">
                    <button class="btn btn-neutral" onclick="router.navigate('/abl')" style="padding: 0.5rem 1rem;">
                        &larr; Zurueck zur Liste
                    </button>
                </div>
                <div class="card" style="text-align: center; padding: 4rem 2rem;">
                    <div style="font-size: 4rem; margin-bottom: 1rem; color: #f97316;">!</div>
                    <h2 style="font-size: 1.5rem; margin-bottom: 1rem;">Fehler</h2>
                    <p style="color: #6b7280; margin-bottom: 2rem;">${message}</p>
                    <button class="btn btn-primary" onclick="router.navigate('/abl')">Zur Liste</button>
                </div>
            </div>
        `;
    }
}

// Create global instance
const ablDetailPage = new ABLDetailPage();
