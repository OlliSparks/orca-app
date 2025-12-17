// ORCA 2.0 - Unternehmen (Company Profile)
class UnternehmenPage {
    constructor() {
        this.companyData = null;
        this.locations = [];
        this.users = [];
        this.suppliers = [];
        this.companyKey = null;
        this.activeMenu = null;
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

        // Close menu on outside click
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.context-menu') && !e.target.closest('.menu-trigger')) {
                this.closeAllMenus();
            }
        });
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

            // Dann Locations, Users und Suppliers parallel laden
            if (this.companyKey) {
                const [locationsResponse, usersResponse, suppliersResponse] = await Promise.all([
                    api.getCompanyLocations(this.companyKey),
                    api.getCompanyUsers(this.companyKey),
                    api.getCompanySuppliers(this.companyKey)
                ]);

                if (locationsResponse.success) {
                    this.locations = locationsResponse.data;
                    console.log('Loaded locations:', this.locations.length);
                }

                if (usersResponse.success) {
                    this.users = usersResponse.data;
                    console.log('Loaded users:', this.users.length);
                }

                if (suppliersResponse.success) {
                    this.suppliers = suppliersResponse.data;
                    console.log('Loaded suppliers:', this.suppliers.length);
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
                        <button class="btn btn-primary" onclick="router.navigate('/')">Zurück zur Übersicht</button>
                    </div>
                </div>
            `;
            return;
        }

        app.innerHTML = `
            <div class="container">
                <!-- Back Button -->
                <div style="margin-bottom: 1rem;">
                    <button class="back-btn" onclick="router.navigate('/')">← Zurück zur Übersicht</button>
                </div>

                <!-- Basis-Informationen -->
                <div class="base-info-card">
                    <div class="base-info-header">
                        <span class="base-info-icon">🏢</span>
                        <span class="base-info-title">Unternehmensprofil</span>
                    </div>
                    <div class="base-info-row-inline">
                        <div class="base-info-item">
                            <div class="base-info-label">Firmenname</div>
                            <div class="base-info-value">${data.name}</div>
                        </div>
                        <div class="base-info-item">
                            <div class="base-info-label">Lieferantennummer</div>
                            <div class="base-info-value">${data.number}</div>
                        </div>
                        <div class="base-info-item">
                            <div class="base-info-label">USt-IdNr.</div>
                            <div class="base-info-value">${data.vatId || 'Nicht hinterlegt'}</div>
                        </div>
                    </div>
                </div>

                <!-- Standorte -->
                ${this.renderAccordionWithAction('locations', '📍', 'Standorte (' + this.locations.length + ')', this.renderLocations(), '+ Standort anlegen', 'addLocation')}

                <!-- Benutzer -->
                ${this.renderAccordionWithAction('users', '👥', 'Benutzer (' + this.users.length + ')', this.renderUsers(), '+ Benutzer einladen', 'addUser')}

                <!-- Lieferanten (Sub-Supplier) -->
                ${this.renderAccordionWithAction('suppliers', '🏭', 'Lieferanten (' + this.suppliers.length + ')', this.renderSuppliers(), '+ Lieferant anlegen', 'addSupplier')}
            </div>

            <!-- Modals -->
            <div id="modalOverlay" class="modal-overlay" style="display: none;">
                <div class="modal-content" id="modalContent"></div>
            </div>
        `;

        this.attachAccordionListeners();
        this.attachMenuListeners();
    }

    renderAccordionWithAction(id, icon, title, content, actionText, actionFn) {
        return `
            <div class="accordion-section">
                <div class="accordion-header" data-section="${id}">
                    <div class="accordion-title">
                        <span class="accordion-icon">${icon}</span>
                        <span>${title}</span>
                    </div>
                    <div class="accordion-actions">
                        <button class="btn-action-small" onclick="event.stopPropagation(); unternehmenPage.${actionFn}()">${actionText}</button>
                        <span class="accordion-toggle">▼</span>
                    </div>
                </div>
                <div class="accordion-content">
                    <div class="accordion-body">
                        ${content}
                    </div>
                </div>
            </div>
        `;
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

    renderLocations() {
        if (this.locations.length === 0) {
            return '<div class="empty-state">Keine Standorte hinterlegt</div>';
        }

        // Gruppiere nach aktiv/inaktiv
        const activeLocations = this.locations.filter(l => l.isActive !== false);
        const inactiveLocations = this.locations.filter(l => l.isActive === false);

        return `
            <div class="locations-section">
                ${activeLocations.length > 0 ? `
                    <div class="locations-grid">
                        ${activeLocations.map(loc => this.renderLocationCard(loc)).join('')}
                    </div>
                ` : '<div class="empty-state">Keine aktiven Standorte</div>'}
            </div>

            ${inactiveLocations.length > 0 ? `
                <div class="locations-section" style="margin-top: 1.5rem;">
                    <div class="subsection-title">
                        <span>🚫</span>
                        <span>Inaktive Standorte (${inactiveLocations.length})</span>
                    </div>
                    <div class="locations-grid inactive">
                        ${inactiveLocations.map(loc => this.renderLocationCard(loc, true)).join('')}
                    </div>
                </div>
            ` : ''}
        `;
    }

    renderLocationCard(loc, isInactive = false) {
        return `
            <div class="location-card ${loc.isDefault ? 'default' : ''} ${isInactive ? 'inactive' : ''}">
                <div class="location-header">
                    <span class="location-icon">${this.getCountryFlag(loc.country)}</span>
                    <span class="location-name">${loc.name}</span>
                    ${loc.isDefault ? '<span class="default-badge">Standard</span>' : ''}
                    <div class="card-menu">
                        <button class="menu-trigger" onclick="event.stopPropagation(); unternehmenPage.toggleMenu('loc-${loc.key}')">⋮</button>
                        <div class="context-menu" id="menu-loc-${loc.key}">
                            <div class="menu-item" onclick="unternehmenPage.editLocation('${loc.key}')">
                                <span>✏️</span> Bearbeiten
                            </div>
                            <div class="menu-item ${isInactive ? '' : 'danger'}" onclick="unternehmenPage.toggleLocationStatus('${loc.key}', ${isInactive})">
                                <span>${isInactive ? '✅' : '🚫'}</span> ${isInactive ? 'Aktivieren' : 'Deaktivieren'}
                            </div>
                        </div>
                    </div>
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
                    <div class="users-list">
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
                    <div class="users-list inactive">
                        ${inactiveUsers.map(user => this.renderUserCard(user, true)).join('')}
                    </div>
                </div>
            ` : ''}
        `;
    }

    renderUserCard(user, isInactive = false) {
        const roleLabels = {
            'IVL': 'IVL',
            'ITL': 'ITL',
            'ID': 'ID',
            'SUP': 'SUP',
            'WVL': 'WVL',
            'FEK': 'FEK',
            'CL': 'CL',
            'ABL': 'ABL',
            'STL': 'STL'
        };

        return `
            <div class="user-card-row ${isInactive ? 'inactive' : ''}">
                <div class="user-main-info">
                    <div class="user-name-line">
                        <span class="user-name">${user.fullName}</span>
                        <span class="user-key">· ${user.key || ''}</span>
                    </div>
                    <div class="user-contact-line">
                        ${user.phone ? `<span class="user-phone">📞 ${user.phone}</span>` : '<span class="user-phone">📞 Keine Daten verfügbar</span>'}
                        ${user.email ? `<span class="user-email">📧 ${user.email}</span>` : ''}
                    </div>
                    <div class="user-roles">
                        ${user.groups.map(g => `<span class="role-badge">${roleLabels[g] || g}</span>`).join('')}
                    </div>
                </div>
                <div class="card-menu">
                    <button class="menu-trigger" onclick="event.stopPropagation(); unternehmenPage.toggleMenu('user-${user.key}')">⋮</button>
                    <div class="context-menu" id="menu-user-${user.key}">
                        <div class="menu-item" onclick="unternehmenPage.editUser('${user.key}')">
                            <span>✏️</span> Bearbeiten
                        </div>
                        <div class="menu-item" onclick="unternehmenPage.resetPassword('${user.key}')">
                            <span>🔑</span> Passwort zurücksetzen
                        </div>
                        <div class="menu-item" onclick="unternehmenPage.resendRegistration('${user.key}')">
                            <span>📧</span> Registrierungslink erneut senden
                        </div>
                        <div class="menu-item ${isInactive ? '' : 'danger'}" onclick="unternehmenPage.toggleUserStatus('${user.key}', ${isInactive})">
                            <span>${isInactive ? '✅' : '🚫'}</span> ${isInactive ? 'Aktivieren' : 'Deaktivieren'}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    renderSuppliers() {
        if (this.suppliers.length === 0) {
            return '<div class="empty-state">Keine Lieferanten hinterlegt</div>';
        }

        // Gruppiere nach gültig/ungültig
        const validSuppliers = this.suppliers.filter(s => s.isValid);
        const invalidSuppliers = this.suppliers.filter(s => !s.isValid);

        return `
            <div class="suppliers-section">
                <div class="subsection-title">
                    <span>✅</span>
                    <span>Aktive Lieferanten (${validSuppliers.length})</span>
                </div>
                ${validSuppliers.length > 0 ? `
                    <div class="suppliers-grid">
                        ${validSuppliers.map(sup => this.renderSupplierCard(sup)).join('')}
                    </div>
                ` : '<div class="empty-state">Keine aktiven Lieferanten</div>'}
            </div>

            ${invalidSuppliers.length > 0 ? `
                <div class="suppliers-section" style="margin-top: 1.5rem;">
                    <div class="subsection-title">
                        <span>⚠️</span>
                        <span>Unvollständige Lieferanten (${invalidSuppliers.length})</span>
                    </div>
                    <div class="suppliers-grid inactive">
                        ${invalidSuppliers.map(sup => this.renderSupplierCard(sup, true)).join('')}
                    </div>
                </div>
            ` : ''}
        `;
    }

    renderSupplierCard(supplier, isInvalid = false) {
        return `
            <div class="supplier-card ${isInvalid ? 'invalid' : ''}">
                <div class="supplier-header">
                    <span class="supplier-flag">${this.getCountryFlag(supplier.country)}</span>
                    <span class="supplier-name">${supplier.name}</span>
                    ${supplier.number ? `<span class="supplier-number">#${supplier.number}</span>` : ''}
                    <div class="card-menu">
                        <button class="menu-trigger" onclick="event.stopPropagation(); unternehmenPage.toggleMenu('sup-${supplier.key}')">⋮</button>
                        <div class="context-menu" id="menu-sup-${supplier.key}">
                            <div class="menu-item" onclick="unternehmenPage.editSupplier('${supplier.key}')">
                                <span>✏️</span> Bearbeiten
                            </div>
                            <div class="menu-item ${isInvalid ? '' : 'danger'}" onclick="unternehmenPage.toggleSupplierStatus('${supplier.key}', ${isInvalid})">
                                <span>${isInvalid ? '✅' : '🚫'}</span> ${isInvalid ? 'Aktivieren' : 'Deaktivieren'}
                            </div>
                        </div>
                    </div>
                </div>
                <div class="supplier-details">
                    ${supplier.street ? `<div class="supplier-row">${supplier.street}</div>` : ''}
                    ${supplier.city ? `<div class="supplier-row">${supplier.postcode ? supplier.postcode + ' ' : ''}${supplier.city}</div>` : ''}
                    ${!supplier.street && !supplier.city ? '<div class="supplier-row empty">Adressdaten nicht verfügbar</div>' : ''}
                </div>
            </div>
        `;
    }

    // === Menu Functions ===
    toggleMenu(menuId) {
        const menu = document.getElementById('menu-' + menuId);
        if (!menu) return;

        // Close other menus
        document.querySelectorAll('.context-menu.active').forEach(m => {
            if (m.id !== 'menu-' + menuId) {
                m.classList.remove('active');
            }
        });

        menu.classList.toggle('active');
        this.activeMenu = menu.classList.contains('active') ? menuId : null;
    }

    closeAllMenus() {
        document.querySelectorAll('.context-menu.active').forEach(m => {
            m.classList.remove('active');
        });
        this.activeMenu = null;
    }

    // === Location Actions ===
    addLocation() {
        this.showModal('Neuen Standort anlegen', `
            <form id="locationForm">
                <div class="form-group">
                    <label>Name *</label>
                    <input type="text" name="name" required placeholder="Standortname">
                </div>
                <div class="form-group">
                    <label>Strasse</label>
                    <input type="text" name="street" placeholder="Strasse und Hausnummer">
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>PLZ</label>
                        <input type="text" name="postcode" placeholder="PLZ">
                    </div>
                    <div class="form-group">
                        <label>Ort</label>
                        <input type="text" name="city" placeholder="Ort">
                    </div>
                </div>
                <div class="form-group">
                    <label>Land</label>
                    <select name="country">
                        <option value="DE">Deutschland</option>
                        <option value="AT">Oesterreich</option>
                        <option value="CH">Schweiz</option>
                        <option value="CZ">Tschechien</option>
                        <option value="PL">Polen</option>
                        <option value="HU">Ungarn</option>
                        <option value="RO">Rumaenien</option>
                        <option value="SK">Slowakei</option>
                        <option value="SI">Slowenien</option>
                        <option value="HR">Kroatien</option>
                        <option value="RS">Serbien</option>
                        <option value="MX">Mexiko</option>
                        <option value="US">USA</option>
                        <option value="CN">China</option>
                    </select>
                </div>
                <div class="form-actions">
                    <button type="button" class="btn btn-secondary" onclick="unternehmenPage.closeModal()">Abbrechen</button>
                    <button type="submit" class="btn btn-primary">Anlegen</button>
                </div>
            </form>
        `);
        document.getElementById('locationForm').onsubmit = (e) => this.submitLocation(e);
    }

    async submitLocation(e) {
        e.preventDefault();
        const form = e.target;
        const data = {
            name: form.name.value,
            street: form.street.value,
            postcode: form.postcode.value,
            city: form.city.value,
            country: form.country.value
        };

        try {
            const result = await api.createLocation(this.companyKey, data);
            if (result.success) {
                this.closeModal();
                alert('Standort erfolgreich angelegt!');
                await this.loadData();
                this.renderDetail();
            } else {
                alert('Fehler: ' + (result.error || 'Unbekannter Fehler'));
            }
        } catch (error) {
            alert('Fehler beim Anlegen: ' + error.message);
        }
    }

    editLocation(key) {
        this.closeAllMenus();
        const loc = this.locations.find(l => l.key === key);
        if (!loc) return;

        this.showModal('Standort bearbeiten', `
            <form id="locationForm">
                <div class="form-group">
                    <label>Name *</label>
                    <input type="text" name="name" required value="${loc.name || ''}">
                </div>
                <div class="form-group">
                    <label>Strasse</label>
                    <input type="text" name="street" value="${loc.street || ''}">
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>PLZ</label>
                        <input type="text" name="postcode" value="${loc.postcode || ''}">
                    </div>
                    <div class="form-group">
                        <label>Ort</label>
                        <input type="text" name="city" value="${loc.city || ''}">
                    </div>
                </div>
                <div class="form-group">
                    <label>Land</label>
                    <select name="country">
                        <option value="DE" ${loc.country === 'DE' ? 'selected' : ''}>Deutschland</option>
                        <option value="AT" ${loc.country === 'AT' ? 'selected' : ''}>Oesterreich</option>
                        <option value="CH" ${loc.country === 'CH' ? 'selected' : ''}>Schweiz</option>
                        <option value="CZ" ${loc.country === 'CZ' ? 'selected' : ''}>Tschechien</option>
                        <option value="PL" ${loc.country === 'PL' ? 'selected' : ''}>Polen</option>
                        <option value="HU" ${loc.country === 'HU' ? 'selected' : ''}>Ungarn</option>
                        <option value="RO" ${loc.country === 'RO' ? 'selected' : ''}>Rumaenien</option>
                    </select>
                </div>
                <div class="form-actions">
                    <button type="button" class="btn btn-secondary" onclick="unternehmenPage.closeModal()">Abbrechen</button>
                    <button type="submit" class="btn btn-primary">Speichern</button>
                </div>
            </form>
        `);
        document.getElementById('locationForm').onsubmit = (e) => this.submitEditLocation(e, key);
    }

    async submitEditLocation(e, key) {
        e.preventDefault();
        const form = e.target;
        const data = {
            name: form.name.value,
            street: form.street.value,
            postcode: form.postcode.value,
            city: form.city.value,
            country: form.country.value
        };

        try {
            const result = await api.updateLocation(this.companyKey, key, data);
            if (result.success) {
                this.closeModal();
                alert('Standort aktualisiert!');
                await this.loadData();
                this.renderDetail();
            } else {
                alert('Fehler: ' + (result.error || 'Unbekannter Fehler'));
            }
        } catch (error) {
            alert('Fehler beim Speichern: ' + error.message);
        }
    }

    async toggleLocationStatus(key, currentlyInactive) {
        this.closeAllMenus();
        const action = currentlyInactive ? 'aktivieren' : 'deaktivieren';
        if (!confirm(`Standort wirklich ${action}?`)) return;

        try {
            const result = await api.updateLocationStatus(this.companyKey, key, !currentlyInactive);
            if (result.success) {
                alert(`Standort ${currentlyInactive ? 'aktiviert' : 'deaktiviert'}!`);
                await this.loadData();
                this.renderDetail();
            } else {
                alert('Fehler: ' + (result.error || 'Unbekannter Fehler'));
            }
        } catch (error) {
            alert('Fehler: ' + error.message);
        }
    }

    // === User Actions ===
    addUser() {
        this.showModal('Neuen Benutzer einladen', `
            <form id="userForm">
                <div class="form-row">
                    <div class="form-group">
                        <label>Vorname *</label>
                        <input type="text" name="firstName" required>
                    </div>
                    <div class="form-group">
                        <label>Nachname *</label>
                        <input type="text" name="lastName" required>
                    </div>
                </div>
                <div class="form-group">
                    <label>E-Mail *</label>
                    <input type="email" name="email" required>
                </div>
                <div class="form-group">
                    <label>Telefon</label>
                    <input type="tel" name="phone">
                </div>
                <div class="form-group">
                    <label>Rollen</label>
                    <div class="checkbox-group">
                        <label><input type="checkbox" name="roles" value="IVL"> IVL (Inventur-Verantwortlicher)</label>
                        <label><input type="checkbox" name="roles" value="ITL"> ITL</label>
                        <label><input type="checkbox" name="roles" value="WVL"> WVL (Werkzeug-Verantwortlicher)</label>
                        <label><input type="checkbox" name="roles" value="SUP"> SUP (Lieferant)</label>
                    </div>
                </div>
                <div class="form-actions">
                    <button type="button" class="btn btn-secondary" onclick="unternehmenPage.closeModal()">Abbrechen</button>
                    <button type="submit" class="btn btn-primary">Einladen</button>
                </div>
            </form>
        `);
        document.getElementById('userForm').onsubmit = (e) => this.submitUser(e);
    }

    async submitUser(e) {
        e.preventDefault();
        const form = e.target;
        const roles = Array.from(form.querySelectorAll('input[name="roles"]:checked')).map(cb => cb.value);

        const data = {
            firstName: form.firstName.value,
            lastName: form.lastName.value,
            email: form.email.value,
            phone: form.phone.value,
            groups: roles
        };

        try {
            const result = await api.createUser(this.companyKey, data);
            if (result.success) {
                this.closeModal();
                alert('Benutzer eingeladen!');
                await this.loadData();
                this.renderDetail();
            } else {
                alert('Fehler: ' + (result.error || 'Unbekannter Fehler'));
            }
        } catch (error) {
            alert('Fehler beim Einladen: ' + error.message);
        }
    }

    editUser(key) {
        this.closeAllMenus();
        const user = this.users.find(u => u.key === key);
        if (!user) return;

        this.showModal('Benutzer bearbeiten', `
            <form id="userForm">
                <div class="form-row">
                    <div class="form-group">
                        <label>Vorname *</label>
                        <input type="text" name="firstName" required value="${user.firstName || ''}">
                    </div>
                    <div class="form-group">
                        <label>Nachname *</label>
                        <input type="text" name="lastName" required value="${user.lastName || ''}">
                    </div>
                </div>
                <div class="form-group">
                    <label>E-Mail *</label>
                    <input type="email" name="email" required value="${user.email || ''}">
                </div>
                <div class="form-group">
                    <label>Telefon</label>
                    <input type="tel" name="phone" value="${user.phone || ''}">
                </div>
                <div class="form-group">
                    <label>Rollen</label>
                    <div class="checkbox-group">
                        <label><input type="checkbox" name="roles" value="IVL" ${user.groups.includes('IVL') ? 'checked' : ''}> IVL</label>
                        <label><input type="checkbox" name="roles" value="ITL" ${user.groups.includes('ITL') ? 'checked' : ''}> ITL</label>
                        <label><input type="checkbox" name="roles" value="WVL" ${user.groups.includes('WVL') ? 'checked' : ''}> WVL</label>
                        <label><input type="checkbox" name="roles" value="SUP" ${user.groups.includes('SUP') ? 'checked' : ''}> SUP</label>
                    </div>
                </div>
                <div class="form-actions">
                    <button type="button" class="btn btn-secondary" onclick="unternehmenPage.closeModal()">Abbrechen</button>
                    <button type="submit" class="btn btn-primary">Speichern</button>
                </div>
            </form>
        `);
        document.getElementById('userForm').onsubmit = (e) => this.submitEditUser(e, key);
    }

    async submitEditUser(e, key) {
        e.preventDefault();
        const form = e.target;
        const roles = Array.from(form.querySelectorAll('input[name="roles"]:checked')).map(cb => cb.value);

        const data = {
            firstName: form.firstName.value,
            lastName: form.lastName.value,
            email: form.email.value,
            phone: form.phone.value,
            groups: roles
        };

        try {
            const result = await api.updateUser(this.companyKey, key, data);
            if (result.success) {
                this.closeModal();
                alert('Benutzer aktualisiert!');
                await this.loadData();
                this.renderDetail();
            } else {
                alert('Fehler: ' + (result.error || 'Unbekannter Fehler'));
            }
        } catch (error) {
            alert('Fehler beim Speichern: ' + error.message);
        }
    }

    async resetPassword(key) {
        this.closeAllMenus();
        if (!confirm('Passwort wirklich zurücksetzen? Der Benutzer erhält eine E-Mail.')) return;

        try {
            const result = await api.resetUserPassword(this.companyKey, key);
            if (result.success) {
                alert('Passwort-Reset E-Mail wurde versendet!');
            } else {
                alert('Fehler: ' + (result.error || 'Unbekannter Fehler'));
            }
        } catch (error) {
            alert('Fehler: ' + error.message);
        }
    }

    async resendRegistration(key) {
        this.closeAllMenus();
        if (!confirm('Registrierungslink erneut senden?')) return;

        try {
            const result = await api.resendUserRegistration(this.companyKey, key);
            if (result.success) {
                alert('Registrierungslink wurde erneut versendet!');
            } else {
                alert('Fehler: ' + (result.error || 'Unbekannter Fehler'));
            }
        } catch (error) {
            alert('Fehler: ' + error.message);
        }
    }

    async toggleUserStatus(key, currentlyInactive) {
        this.closeAllMenus();
        const action = currentlyInactive ? 'aktivieren' : 'deaktivieren';
        if (!confirm(`Benutzer wirklich ${action}?`)) return;

        try {
            const result = await api.updateUserStatus(this.companyKey, key, !currentlyInactive);
            if (result.success) {
                alert(`Benutzer ${currentlyInactive ? 'aktiviert' : 'deaktiviert'}!`);
                await this.loadData();
                this.renderDetail();
            } else {
                alert('Fehler: ' + (result.error || 'Unbekannter Fehler'));
            }
        } catch (error) {
            alert('Fehler: ' + error.message);
        }
    }

    // === Supplier Actions ===
    addSupplier() {
        this.showModal('Neuen Lieferanten anlegen', `
            <form id="supplierForm">
                <div class="form-group">
                    <label>Name *</label>
                    <input type="text" name="name" required>
                </div>
                <div class="form-group">
                    <label>Lieferantennummer</label>
                    <input type="text" name="number">
                </div>
                <div class="form-group">
                    <label>Strasse</label>
                    <input type="text" name="street">
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>PLZ</label>
                        <input type="text" name="postcode">
                    </div>
                    <div class="form-group">
                        <label>Ort</label>
                        <input type="text" name="city">
                    </div>
                </div>
                <div class="form-group">
                    <label>Land</label>
                    <select name="country">
                        <option value="DE">Deutschland</option>
                        <option value="AT">Oesterreich</option>
                        <option value="CH">Schweiz</option>
                        <option value="CZ">Tschechien</option>
                        <option value="PL">Polen</option>
                    </select>
                </div>
                <div class="form-actions">
                    <button type="button" class="btn btn-secondary" onclick="unternehmenPage.closeModal()">Abbrechen</button>
                    <button type="submit" class="btn btn-primary">Anlegen</button>
                </div>
            </form>
        `);
        document.getElementById('supplierForm').onsubmit = (e) => this.submitSupplier(e);
    }

    async submitSupplier(e) {
        e.preventDefault();
        const form = e.target;
        const data = {
            name: form.name.value,
            number: form.number.value,
            street: form.street.value,
            postcode: form.postcode.value,
            city: form.city.value,
            country: form.country.value
        };

        try {
            const result = await api.createSupplier(this.companyKey, data);
            if (result.success) {
                this.closeModal();
                alert('Lieferant erfolgreich angelegt!');
                await this.loadData();
                this.renderDetail();
            } else {
                alert('Fehler: ' + (result.error || 'Unbekannter Fehler'));
            }
        } catch (error) {
            alert('Fehler beim Anlegen: ' + error.message);
        }
    }

    editSupplier(key) {
        this.closeAllMenus();
        const sup = this.suppliers.find(s => s.key === key);
        if (!sup) return;

        this.showModal('Lieferant bearbeiten', `
            <form id="supplierForm">
                <div class="form-group">
                    <label>Name *</label>
                    <input type="text" name="name" required value="${sup.name || ''}">
                </div>
                <div class="form-group">
                    <label>Lieferantennummer</label>
                    <input type="text" name="number" value="${sup.number || ''}">
                </div>
                <div class="form-group">
                    <label>Strasse</label>
                    <input type="text" name="street" value="${sup.street || ''}">
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>PLZ</label>
                        <input type="text" name="postcode" value="${sup.postcode || ''}">
                    </div>
                    <div class="form-group">
                        <label>Ort</label>
                        <input type="text" name="city" value="${sup.city || ''}">
                    </div>
                </div>
                <div class="form-group">
                    <label>Land</label>
                    <select name="country">
                        <option value="DE" ${sup.country === 'DE' ? 'selected' : ''}>Deutschland</option>
                        <option value="AT" ${sup.country === 'AT' ? 'selected' : ''}>Oesterreich</option>
                        <option value="CH" ${sup.country === 'CH' ? 'selected' : ''}>Schweiz</option>
                    </select>
                </div>
                <div class="form-actions">
                    <button type="button" class="btn btn-secondary" onclick="unternehmenPage.closeModal()">Abbrechen</button>
                    <button type="submit" class="btn btn-primary">Speichern</button>
                </div>
            </form>
        `);
        document.getElementById('supplierForm').onsubmit = (e) => this.submitEditSupplier(e, key);
    }

    async submitEditSupplier(e, key) {
        e.preventDefault();
        const form = e.target;
        const data = {
            name: form.name.value,
            number: form.number.value,
            street: form.street.value,
            postcode: form.postcode.value,
            city: form.city.value,
            country: form.country.value
        };

        try {
            const result = await api.updateSupplier(this.companyKey, key, data);
            if (result.success) {
                this.closeModal();
                alert('Lieferant aktualisiert!');
                await this.loadData();
                this.renderDetail();
            } else {
                alert('Fehler: ' + (result.error || 'Unbekannter Fehler'));
            }
        } catch (error) {
            alert('Fehler beim Speichern: ' + error.message);
        }
    }

    async toggleSupplierStatus(key, currentlyInvalid) {
        this.closeAllMenus();
        const action = currentlyInvalid ? 'aktivieren' : 'deaktivieren';
        if (!confirm(`Lieferant wirklich ${action}?`)) return;

        try {
            const result = await api.updateSupplierStatus(this.companyKey, key, !currentlyInvalid);
            if (result.success) {
                alert(`Lieferant ${currentlyInvalid ? 'aktiviert' : 'deaktiviert'}!`);
                await this.loadData();
                this.renderDetail();
            } else {
                alert('Fehler: ' + (result.error || 'Unbekannter Fehler'));
            }
        } catch (error) {
            alert('Fehler: ' + error.message);
        }
    }

    // === Modal Functions ===
    showModal(title, content) {
        const overlay = document.getElementById('modalOverlay');
        const modalContent = document.getElementById('modalContent');
        modalContent.innerHTML = `
            <div class="modal-header">
                <h3>${title}</h3>
                <button class="modal-close" onclick="unternehmenPage.closeModal()">&times;</button>
            </div>
            <div class="modal-body">
                ${content}
            </div>
        `;
        overlay.style.display = 'flex';
    }

    closeModal() {
        document.getElementById('modalOverlay').style.display = 'none';
    }

    // === Helper Functions ===
    getCountryFlag(countryCode) {
        const flags = {
            'DE': '🇩🇪', 'AT': '🇦🇹', 'CH': '🇨🇭', 'CZ': '🇨🇿', 'PL': '🇵🇱',
            'HU': '🇭🇺', 'RO': '🇷🇴', 'SK': '🇸🇰', 'SI': '🇸🇮', 'HR': '🇭🇷',
            'RS': '🇷🇸', 'MX': '🇲🇽', 'US': '🇺🇸', 'CN': '🇨🇳', 'IN': '🇮🇳',
            'TN': '🇹🇳', 'EG': '🇪🇬', 'MY': '🇲🇾', 'IT': '🇮🇹', 'MD': '🇲🇩',
            'AF': '🇦🇫', 'SL': '🇸🇱', 'N/A': '🏳️'
        };
        return flags[countryCode] || '🏳️';
    }

    attachAccordionListeners() {
        document.querySelectorAll('.accordion-header').forEach(header => {
            header.addEventListener('click', (e) => {
                // Ignore clicks on buttons
                if (e.target.closest('.btn-action-small')) return;

                const content = header.nextElementSibling;
                const isActive = header.classList.contains('active');

                if (isActive) {
                    header.classList.remove('active');
                    content.classList.remove('active');
                } else {
                    // Alle schließen
                    document.querySelectorAll('.accordion-header').forEach(h => {
                        h.classList.remove('active');
                        h.nextElementSibling.classList.remove('active');
                    });

                    // Aktuelles öffnen
                    header.classList.add('active');
                    content.classList.add('active');
                }
            });
        });
    }

    attachMenuListeners() {
        // Menu listeners are attached via onclick handlers
    }
}

// Create global instance
const unternehmenPage = new UnternehmenPage();
