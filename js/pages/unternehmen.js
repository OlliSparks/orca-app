// ORCA 2.0 - Unternehmen (Company Profile)
class UnternehmenPage {
    constructor() {
        this.companyData = null;
        this.locations = [];
        this.users = [];
        this.companyKey = null;
    }

    async render() {
        const app = document.getElementById('app');

        // Update Header
        document.getElementById('headerTitle').textContent = 'orca 2.0 - Werkzeug Management';
        document.getElementById('headerSubtitle').textContent = 'Unternehmen';

        // Hide header stats
        const headerStats = document.getElementById('headerStats');
        if (headerStats) {
            headerStats.style.display = 'none';
        }

        // Loading state
        app.innerHTML = `
            <div class="container" style="text-align: center; padding: 4rem 2rem;">
                <div style="font-size: 3rem; margin-bottom: 1rem;">⏳</div>
                <p style="color: #6b7280;">Lade Unternehmensdaten...</p>
            </div>
        `;

        // Load data
        await this.loadData();

        // Render detail view
        this.renderDetail();

        // Setup footer
        document.getElementById('footerActions').innerHTML = '';
    }

    async loadData() {
        try {
            // Erst Company laden
            const companyResponse = await api.getCompanyBySupplier();
            if (companyResponse.success) {
                this.companyData = companyResponse.data;
                this.companyKey = companyResponse.companyKey;
                console.log('Loaded company:', this.companyData);
            }

            // Dann Locations und Users parallel laden
            if (this.companyKey) {
                const [locationsResponse, usersResponse] = await Promise.all([
                    api.getCompanyLocations(this.companyKey),
                    api.getCompanyUsers(this.companyKey)
                ]);

                if (locationsResponse.success) {
                    this.locations = locationsResponse.data;
                    console.log('Loaded locations:', this.locations.length);
                }

                if (usersResponse.success) {
                    this.users = usersResponse.data;
                    console.log('Loaded users:', this.users.length);
                }
            }
        } catch (error) {
            console.error('Error loading company data:', error);
        }
    }

    renderDetail() {
        const app = document.getElementById('app');
        const data = this.companyData;

        if (!data) {
            app.innerHTML = `
                <div class="container">
                    <div class="card" style="text-align: center; padding: 4rem 2rem;">
                        <div style="font-size: 4rem; margin-bottom: 1rem; color: #f97316;">⚠️</div>
                        <h2 style="font-size: 1.5rem; margin-bottom: 1rem;">Keine Unternehmensdaten</h2>
                        <p style="color: #6b7280; margin-bottom: 2rem;">Die Unternehmensdaten konnten nicht geladen werden.</p>
                        <button class="btn btn-primary" onclick="router.navigate('/')">Zurueck zur Uebersicht</button>
                    </div>
                </div>
            `;
            return;
        }

        app.innerHTML = `
            <div class="container">
                <!-- Back Button -->
                <div style="margin-bottom: 1rem;">
                    <button class="back-btn" onclick="router.navigate('/')">← Zurueck zur Uebersicht</button>
                </div>

                <!-- Basis-Informationen -->
                <div class="base-info-card">
                    <div class="base-info-header">
                        <span class="base-info-icon">🏢</span>
                        <span class="base-info-title">Unternehmensprofil</span>
                    </div>
                    <div class="base-info-grid">
                        <div class="base-info-row">
                            <div class="base-info-label">Firmenname</div>
                            <div class="base-info-value">${data.name}</div>
                        </div>
                        <div class="base-info-row">
                            <div class="base-info-label">Lieferantennummer</div>
                            <div class="base-info-value">${data.number}</div>
                        </div>
                        <div class="base-info-row">
                            <div class="base-info-label">USt-IdNr.</div>
                            <div class="base-info-value">${data.vatId || 'Nicht hinterlegt'}</div>
                        </div>
                    </div>
                </div>

                <!-- Kontaktdaten -->
                ${this.renderAccordion('contact', '📞', 'Kontaktdaten', this.renderContact(data), true)}

                <!-- Standorte -->
                ${this.renderAccordion('locations', '📍', 'Standorte (' + this.locations.length + ')', this.renderLocations(), false)}

                <!-- Benutzer -->
                ${this.renderAccordion('users', '👥', 'Benutzer (' + this.users.length + ')', this.renderUsers(), false)}
            </div>
        `;

        this.attachAccordionListeners();
    }

    renderAccordion(id, icon, title, content, isActive = false) {
        return `
            <div class="accordion-section">
                <div class="accordion-header ${isActive ? 'active' : ''}" data-section="${id}">
                    <div class="accordion-title">
                        <span class="accordion-icon">${icon}</span>
                        <span>${title}</span>
                    </div>
                    <span class="accordion-toggle">▼</span>
                </div>
                <div class="accordion-content ${isActive ? 'active' : ''}">
                    <div class="accordion-body">
                        ${content}
                    </div>
                </div>
            </div>
        `;
    }

    renderContact(data) {
        return `
            <div class="subsection">
                <div class="subsection-title">
                    <span>🏠</span>
                    <span>Adresse</span>
                </div>
                <div class="field-grid">
                    <div class="field-row">
                        <div class="field-label">Strasse</div>
                        <div class="field-value">${data.street || 'Nicht hinterlegt'}</div>
                    </div>
                    <div class="field-row">
                        <div class="field-label">PLZ / Ort</div>
                        <div class="field-value">${data.postcode ? data.postcode + ' ' + data.city : data.city || 'Nicht hinterlegt'}</div>
                    </div>
                    <div class="field-row">
                        <div class="field-label">Land</div>
                        <div class="field-value">${this.getCountryFlag(data.country)} ${data.country || 'Nicht hinterlegt'}</div>
                    </div>
                </div>
            </div>

            <div class="subsection">
                <div class="subsection-title">
                    <span>📧</span>
                    <span>Kommunikation</span>
                </div>
                <div class="field-grid">
                    <div class="field-row">
                        <div class="field-label">E-Mail</div>
                        <div class="field-value">${data.email ? '<a href="mailto:' + data.email + '">' + data.email + '</a>' : 'Nicht hinterlegt'}</div>
                    </div>
                    <div class="field-row">
                        <div class="field-label">Telefon</div>
                        <div class="field-value">${data.phone || 'Nicht hinterlegt'}</div>
                    </div>
                </div>
            </div>
        `;
    }

    renderLocations() {
        if (this.locations.length === 0) {
            return '<div class="empty-state">Keine Standorte hinterlegt</div>';
        }

        return `
            <div class="locations-grid">
                ${this.locations.map(loc => `
                    <div class="location-card ${loc.isDefault ? 'default' : ''}">
                        <div class="location-header">
                            <span class="location-icon">${this.getCountryFlag(loc.country)}</span>
                            <span class="location-name">${loc.name}</span>
                            ${loc.isDefault ? '<span class="default-badge">Standard</span>' : ''}
                        </div>
                        <div class="location-details">
                            <div class="location-row">
                                <span class="location-label">Adresse:</span>
                                <span>${loc.street || '-'}</span>
                            </div>
                            <div class="location-row">
                                <span class="location-label">PLZ/Ort:</span>
                                <span>${loc.postcode ? loc.postcode + ' ' : ''}${loc.city || '-'}</span>
                            </div>
                            <div class="location-row">
                                <span class="location-label">Land:</span>
                                <span>${loc.country || '-'}</span>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    renderUsers() {
        if (this.users.length === 0) {
            return '<div class="empty-state">Keine Benutzer hinterlegt</div>';
        }

        // Gruppiere nach aktiv/inaktiv
        const activeUsers = this.users.filter(u => u.isActive);
        const inactiveUsers = this.users.filter(u => !u.isActive);

        return `
            <div class="users-section">
                <div class="subsection-title">
                    <span>✅</span>
                    <span>Aktive Benutzer (${activeUsers.length})</span>
                </div>
                ${activeUsers.length > 0 ? `
                    <div class="users-grid">
                        ${activeUsers.map(user => this.renderUserCard(user)).join('')}
                    </div>
                ` : '<div class="empty-state">Keine aktiven Benutzer</div>'}
            </div>

            ${inactiveUsers.length > 0 ? `
                <div class="users-section" style="margin-top: 1.5rem;">
                    <div class="subsection-title">
                        <span>🚫</span>
                        <span>Inaktive Benutzer (${inactiveUsers.length})</span>
                    </div>
                    <div class="users-grid inactive">
                        ${inactiveUsers.map(user => this.renderUserCard(user, true)).join('')}
                    </div>
                </div>
            ` : ''}
        `;
    }

    renderUserCard(user, isInactive = false) {
        const roleLabels = {
            'IVL': 'Inventur-Verantwortlicher',
            'SUP': 'Lieferant',
            'WVL': 'Werkzeug-Verantwortlicher',
            'FEK': 'Facheinkaeufer',
            'CL': 'Approver',
            'ABL': 'ABL',
            'STL': 'Standortleiter'
        };

        return `
            <div class="user-card ${isInactive ? 'inactive' : ''}">
                <div class="user-avatar">${user.firstName?.charAt(0) || '?'}${user.lastName?.charAt(0) || ''}</div>
                <div class="user-info">
                    <div class="user-name">${user.fullName}</div>
                    <div class="user-email">${user.email || '-'}</div>
                    ${user.phone ? `<div class="user-phone">📞 ${user.phone}</div>` : ''}
                    <div class="user-roles">
                        ${user.groups.map(g => `<span class="role-badge">${roleLabels[g] || g}</span>`).join('')}
                    </div>
                </div>
            </div>
        `;
    }

    getCountryFlag(countryCode) {
        const flags = {
            'DE': '🇩🇪', 'AT': '🇦🇹', 'CH': '🇨🇭', 'CZ': '🇨🇿', 'PL': '🇵🇱',
            'HU': '🇭🇺', 'RO': '🇷🇴', 'SK': '🇸🇰', 'SI': '🇸🇮', 'HR': '🇭🇷',
            'RS': '🇷🇸', 'MX': '🇲🇽', 'US': '🇺🇸', 'CN': '🇨🇳', 'IN': '🇮🇳'
        };
        return flags[countryCode] || '🏳️';
    }

    attachAccordionListeners() {
        document.querySelectorAll('.accordion-header').forEach(header => {
            header.addEventListener('click', () => {
                const content = header.nextElementSibling;
                const isActive = header.classList.contains('active');

                if (isActive) {
                    header.classList.remove('active');
                    content.classList.remove('active');
                } else {
                    // Alle schliessen
                    document.querySelectorAll('.accordion-header').forEach(h => {
                        h.classList.remove('active');
                        h.nextElementSibling.classList.remove('active');
                    });

                    // Aktuelles oeffnen
                    header.classList.add('active');
                    content.classList.add('active');
                }
            });
        });
    }
}

// Create global instance
const unternehmenPage = new UnternehmenPage();
