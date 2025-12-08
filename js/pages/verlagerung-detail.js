// ORCA 2.0 - Verlagerung Detail
class VerlagerungDetailPage {
    constructor() {
        this.processKey = null;
        this.relocation = null;
        this.positions = [];
        this.isLoading = false;
    }

    async render(processKey) {
        this.processKey = processKey;
        const app = document.getElementById('app');

        // Update Header
        document.getElementById('headerTitle').textContent = 'orca 2.0 - Werkzeug Management';
        document.getElementById('headerSubtitle').textContent = 'Verlagerung Details';

        // Hide header stats
        const headerStats = document.getElementById('headerStats');
        if (headerStats) {
            headerStats.style.display = 'none';
        }

        // Initial loading state
        app.innerHTML = `
            <div class="container">
                <div class="card" style="text-align: center; padding: 4rem 2rem;">
                    <div style="font-size: 2rem; margin-bottom: 1rem;">Lade Verlagerung...</div>
                </div>
            </div>
        `;

        // Update footer
        document.getElementById('footerActions').innerHTML = `
            <button class="btn btn-neutral" onclick="router.navigate('/verlagerung')">Zurück zur Liste</button>
        `;

        // Load data
        await this.loadData();
    }

    async loadData() {
        this.isLoading = true;

        try {
            // Load relocation details
            const detailResult = await api.getRelocationDetail(this.processKey);
            if (!detailResult.success) {
                this.showError('Verlagerung nicht gefunden');
                return;
            }
            this.relocation = detailResult.data;

            // Load positions
            const positionsResult = await api.getRelocationPositions(this.processKey);
            if (positionsResult.success) {
                this.positions = positionsResult.data;
            }

            this.renderDetail();
        } catch (error) {
            console.error('Error loading relocation:', error);
            this.showError('Fehler beim Laden der Verlagerung');
        } finally {
            this.isLoading = false;
        }
    }

    renderDetail() {
        const app = document.getElementById('app');
        const rel = this.relocation;

        const statusInfo = {
            'offen': { class: 'status-offen', text: 'Offen', icon: '' },
            'feinplanung': { class: 'status-feinplanung', text: 'Feinplanung', icon: '' },
            'in-inventur': { class: 'status-in-inventur', text: 'In Bearbeitung', icon: '' },
            'abgeschlossen': { class: 'status-abgeschlossen', text: 'Abgeschlossen', icon: '' }
        }[rel.status] || { class: 'status-offen', text: rel.status, icon: '' };

        app.innerHTML = `
            <div class="container">
                <!-- Back Navigation -->
                <div style="margin-bottom: 1rem;">
                    <button class="btn btn-neutral" onclick="router.navigate('/verlagerung')" style="padding: 0.5rem 1rem;">
                        &larr; Zurück zur Liste
                    </button>
                </div>

                <!-- Header Card -->
                <div class="card" style="margin-bottom: 1.5rem;">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 1rem;">
                        <div>
                            <h1 style="font-size: 1.5rem; margin-bottom: 0.5rem;">${rel.name || 'Verlagerung'}</h1>
                            <p style="color: #6b7280; margin-bottom: 0.5rem;">Verlagerungs-Nr.: ${rel.processKey}</p>
                            ${rel.identifier ? `<p style="color: #3b82f6; margin-bottom: 0.5rem;">Identifier: ${rel.identifier}</p>` : ''}
                            <span class="status-badge ${statusInfo.class}" style="font-size: 0.9rem; padding: 0.4rem 0.8rem;">
                                ${statusInfo.icon} ${statusInfo.text}
                            </span>
                        </div>
                        <div style="text-align: right;">
                            <p style="color: #6b7280; font-size: 0.9rem;">Fällig am</p>
                            <p style="font-size: 1.2rem; font-weight: 600;">${rel.dueDate ? this.formatDate(rel.dueDate) : '-'}</p>
                        </div>
                    </div>
                </div>

                <!-- Info Cards -->
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 1.5rem;">
                    <div class="card">
                        <p style="color: #6b7280; font-size: 0.85rem;">Vertragspartner</p>
                        <p style="font-weight: 500;">${rel.supplierName || rel.supplier || '-'}</p>
                    </div>
                    <div class="card">
                        <p style="color: #6b7280; font-size: 0.85rem;">Geplanter Verladetermin</p>
                        <p style="font-weight: 500;">${rel.departureDate ? this.formatDate(rel.departureDate) : '-'}</p>
                    </div>
                    <div class="card">
                        <p style="color: #6b7280; font-size: 0.85rem;">Geplanter Ankunftstermin</p>
                        <p style="font-weight: 500;">${rel.arrivalDate ? this.formatDate(rel.arrivalDate) : '-'}</p>
                    </div>
                    <div class="card">
                        <p style="color: #6b7280; font-size: 0.85rem;">Aktueller Bearbeiter</p>
                        <p style="font-weight: 500;">${rel.assignedUserName || rel.assignedUser || '-'}</p>
                    </div>
                </div>

                <!-- Location Cards -->
                <div style="display: grid; grid-template-columns: 1fr auto 1fr; gap: 1rem; margin-bottom: 1.5rem; align-items: center;">
                    <!-- Source Location -->
                    <div class="card" style="text-align: center;">
                        <p style="color: #6b7280; font-size: 0.85rem; margin-bottom: 0.5rem;">Ausgangsort</p>
                        <p style="font-size: 0.95rem;">${rel.sourceLocation || '-'}</p>
                    </div>

                    <!-- Arrow -->
                    <div style="font-size: 2rem; color: #3b82f6;">&rarr;</div>

                    <!-- Target Location -->
                    <div class="card" style="text-align: center; border: 2px solid #3b82f6;">
                        <p style="color: #6b7280; font-size: 0.85rem; margin-bottom: 0.5rem;">Zielstandort</p>
                        <p style="font-size: 0.95rem;">${rel.targetLocation || '-'}</p>
                    </div>
                </div>

                <!-- Positions Table -->
                <div class="card">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                        <h2 style="font-size: 1.2rem;">Werkzeuge in dieser Verlagerung</h2>
                        <span style="color: #6b7280;">${this.positions.length} Position(en)</span>
                    </div>

                    <div class="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Inventarnummer</th>
                                    <th>Beschreibung</th>
                                    <th>Aktueller Standort</th>
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

                <!-- Comment Section -->
                ${rel.comment ? `
                <div class="card" style="margin-top: 1.5rem;">
                    <h3 style="font-size: 1rem; margin-bottom: 0.5rem;">Kommentar</h3>
                    <p style="color: #6b7280;">${rel.comment}</p>
                </div>
                ` : ''}

                <!-- Meta Information -->
                <div class="card" style="margin-top: 1.5rem; background: #f9fafb;">
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; font-size: 0.9rem;">
                        <div>
                            <p style="color: #6b7280;">Erstellt am</p>
                            <p>${rel.createdAt ? this.formatDateTime(rel.createdAt) : '-'}</p>
                        </div>
                        <div>
                            <p style="color: #6b7280;">Abgeschlossen am</p>
                            <p>${rel.completedAt ? this.formatDateTime(rel.completedAt) : '-'}</p>
                        </div>
                        <div>
                            <p style="color: #6b7280;">Prozess-Key</p>
                            <p style="font-family: monospace; font-size: 0.85rem;">${rel.processKey}</p>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Update footer with actions
        document.getElementById('footerActions').innerHTML = `
            <button class="btn btn-neutral" onclick="router.navigate('/verlagerung')">Zurück</button>
            ${rel.status === 'offen' || rel.status === 'feinplanung' ? `
            <button class="btn btn-primary" onclick="verlagerungDetailPage.addPositions()">+ Werkzeuge hinzufügen</button>
            ` : ''}
        `;
    }

    renderPositionsRows() {
        if (this.positions.length === 0) {
            return `
                <tr>
                    <td colspan="5">
                        <div class="empty-state">
                            <div class="empty-state-icon">Keine Positionen</div>
                            <div class="empty-state-text">Noch keine Werkzeuge zu dieser Verlagerung hinzugefügt</div>
                            <div class="empty-state-hint">
                                <button class="btn btn-primary" onclick="verlagerungDetailPage.addPositions()">+ Werkzeuge hinzufügen</button>
                            </div>
                        </div>
                    </td>
                </tr>
            `;
        }

        return this.positions.map(pos => {
            const posStatusInfo = {
                'PENDING': { class: 'status-offen', text: 'Ausstehend' },
                'IN_PROGRESS': { class: 'status-feinplanung', text: 'In Bearbeitung' },
                'COMPLETED': { class: 'status-abgeschlossen', text: 'Abgeschlossen' },
                'CANCELLED': { class: 'status-offen', text: 'Abgebrochen' }
            }[pos.status] || { class: 'status-offen', text: pos.status };

            return `
                <tr>
                    <td class="tool-number">${pos.inventoryNumber || '-'}</td>
                    <td>${pos.name}</td>
                    <td>${pos.currentLocation || '-'}</td>
                    <td><span class="status-badge ${posStatusInfo.class}">${posStatusInfo.text}</span></td>
                    <td>
                        <button class="btn btn-secondary" style="padding: 0.25rem 0.5rem; font-size: 0.8rem;" onclick="verlagerungDetailPage.viewAsset('${pos.assetKey}')">
                            Details
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
    }

    formatDate(dateStr) {
        const date = new Date(dateStr);
        return date.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
    }

    formatDateTime(dateStr) {
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
            router.navigate(`/detail/${assetKey}`);
        }
    }

    async addPositions() {
        // Show modal to select assets to add
        const modalHtml = `
            <div class="modal-overlay" id="addPositionsModal" onclick="if(event.target === this) verlagerungDetailPage.closeModal()">
                <div class="modal" style="max-width: 700px; max-height: 80vh;">
                    <div class="modal-header">
                        <h2>Werkzeuge hinzufügen</h2>
                        <button class="modal-close" onclick="verlagerungDetailPage.closeModal()">&times;</button>
                    </div>
                    <div class="modal-body" style="overflow-y: auto; max-height: 50vh;">
                        <div class="form-group">
                            <label>Werkzeuge auswählen</label>
                            <input type="text" id="assetSearchInput" class="form-control" placeholder="Suche nach Inventarnummer oder Beschreibung...">
                        </div>
                        <div id="assetSearchResults" style="margin-top: 1rem;">
                            <p style="color: #6b7280;">Geben Sie einen Suchbegriff ein, um Werkzeuge zu finden.</p>
                        </div>
                        <div id="selectedAssets" style="margin-top: 1rem; display: none;">
                            <h4>Ausgewählte Werkzeuge:</h4>
                            <ul id="selectedAssetsList" style="list-style: none; padding: 0;"></ul>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-neutral" onclick="verlagerungDetailPage.closeModal()">Abbrechen</button>
                        <button class="btn btn-primary" id="addAssetsBtn" onclick="verlagerungDetailPage.submitAddPositions()" disabled>Hinzufügen</button>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHtml);

        // Store selected assets
        this.selectedAssetKeys = [];

        // Setup search
        const searchInput = document.getElementById('assetSearchInput');
        let searchTimeout;
        searchInput.addEventListener('input', () => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => this.searchAssets(searchInput.value), 300);
        });
    }

    async searchAssets(query) {
        const resultsDiv = document.getElementById('assetSearchResults');

        if (!query || query.length < 2) {
            resultsDiv.innerHTML = '<p style="color: #6b7280;">Geben Sie mindestens 2 Zeichen ein.</p>';
            return;
        }

        resultsDiv.innerHTML = '<p>Suche...</p>';

        try {
            const result = await api.getFMList({ query });
            if (result.success && result.data.length > 0) {
                resultsDiv.innerHTML = result.data.slice(0, 20).map(asset => `
                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.5rem; border-bottom: 1px solid #e5e7eb;">
                        <div>
                            <strong>${asset.toolNumber || asset.number}</strong> - ${asset.name}
                            <br><small style="color: #6b7280;">${asset.location}</small>
                        </div>
                        <button class="btn btn-secondary" style="padding: 0.25rem 0.5rem;" onclick="verlagerungDetailPage.toggleAsset('${asset.id}', '${(asset.toolNumber || asset.number).replace(/'/g, "\\'")}')">
                            ${this.selectedAssetKeys.includes(asset.id) ? 'Entfernen' : 'Auswählen'}
                        </button>
                    </div>
                `).join('');
            } else {
                resultsDiv.innerHTML = '<p style="color: #6b7280;">Keine Werkzeuge gefunden.</p>';
            }
        } catch (error) {
            console.error('Search error:', error);
            resultsDiv.innerHTML = '<p style="color: #ef4444;">Fehler bei der Suche.</p>';
        }
    }

    toggleAsset(assetKey, assetNumber) {
        const index = this.selectedAssetKeys.indexOf(assetKey);
        if (index > -1) {
            this.selectedAssetKeys.splice(index, 1);
        } else {
            this.selectedAssetKeys.push(assetKey);
        }

        // Update selected list
        const selectedDiv = document.getElementById('selectedAssets');
        const selectedList = document.getElementById('selectedAssetsList');
        const addBtn = document.getElementById('addAssetsBtn');

        if (this.selectedAssetKeys.length > 0) {
            selectedDiv.style.display = 'block';
            selectedList.innerHTML = this.selectedAssetKeys.map(key => `<li style="padding: 0.25rem 0;">${key}</li>`).join('');
            addBtn.disabled = false;
        } else {
            selectedDiv.style.display = 'none';
            addBtn.disabled = true;
        }

        // Refresh search results to update button states
        const searchInput = document.getElementById('assetSearchInput');
        if (searchInput.value.length >= 2) {
            this.searchAssets(searchInput.value);
        }
    }

    async submitAddPositions() {
        if (this.selectedAssetKeys.length === 0) return;

        const result = await api.addRelocationPositions(this.processKey, this.selectedAssetKeys);
        if (result.success) {
            this.closeModal();
            await this.loadData();
        } else {
            alert('Fehler beim Hinzufügen: ' + (result.error || 'Unbekannter Fehler'));
        }
    }

    closeModal() {
        const modal = document.getElementById('addPositionsModal');
        if (modal) {
            modal.remove();
        }
    }

    showError(message) {
        const app = document.getElementById('app');
        app.innerHTML = `
            <div class="container">
                <div style="margin-bottom: 1rem;">
                    <button class="btn btn-neutral" onclick="router.navigate('/verlagerung')" style="padding: 0.5rem 1rem;">
                        &larr; Zurück zur Liste
                    </button>
                </div>
                <div class="card" style="text-align: center; padding: 4rem 2rem;">
                    <div style="font-size: 4rem; margin-bottom: 1rem; color: #f97316;">!</div>
                    <h2 style="font-size: 1.5rem; margin-bottom: 1rem;">Fehler</h2>
                    <p style="color: #6b7280; margin-bottom: 2rem;">${message}</p>
                    <button class="btn btn-primary" onclick="router.navigate('/verlagerung')">Zur Liste</button>
                </div>
            </div>
        `;
    }
}

// Create global instance
const verlagerungDetailPage = new VerlagerungDetailPage();
