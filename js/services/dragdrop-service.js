// ORCA 2.0 - Drag & Drop Service
// Datei-Upload per Drag & Drop, Listen-Sortierung

class DragDropService {
    constructor() {
        this.dropZones = [];
        this.init();
    }

    init() {
        // Globales Drag-Over Event fuer visuelles Feedback
        document.addEventListener('dragover', (e) => this.handleGlobalDragOver(e));
        document.addEventListener('dragleave', (e) => this.handleGlobalDragLeave(e));
        document.addEventListener('drop', (e) => this.handleGlobalDrop(e));

        // Observer fuer neue Drop-Zones
        this.setupMutationObserver();
    }

    setupMutationObserver() {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach(mutation => {
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType === 1 && node.querySelectorAll) {
                        // Drop-Zones finden und initialisieren
                        const zones = node.querySelectorAll('[data-dropzone]');
                        zones.forEach(zone => this.initDropZone(zone));

                        // Sortierbare Listen finden
                        const sortables = node.querySelectorAll('[data-sortable]');
                        sortables.forEach(list => this.initSortable(list));
                    }
                });
            });
        });

        observer.observe(document.body, { childList: true, subtree: true });

        // Bestehende Elemente initialisieren
        document.querySelectorAll('[data-dropzone]').forEach(zone => this.initDropZone(zone));
        document.querySelectorAll('[data-sortable]').forEach(list => this.initSortable(list));
    }

    // Drop-Zone fuer Datei-Upload initialisieren
    initDropZone(zone) {
        if (zone.dataset.initialized) return;
        zone.dataset.initialized = 'true';

        // Styling hinzufuegen
        zone.classList.add('dropzone');

        // Overlay erstellen
        const overlay = document.createElement('div');
        overlay.className = 'dropzone-overlay';
        overlay.innerHTML = '<div class="dropzone-icon">&#128194;</div><div class="dropzone-text">Dateien hier ablegen</div>';
        zone.appendChild(overlay);

        // Events
        zone.addEventListener('dragenter', (e) => this.handleDragEnter(e, zone));
        zone.addEventListener('dragover', (e) => this.handleDragOver(e, zone));
        zone.addEventListener('dragleave', (e) => this.handleDragLeave(e, zone));
        zone.addEventListener('drop', (e) => this.handleDrop(e, zone));

        // Click fuer Datei-Dialog
        zone.addEventListener('click', (e) => {
            if (e.target === zone || e.target === overlay || overlay.contains(e.target)) {
                this.openFileDialog(zone);
            }
        });

        this.dropZones.push(zone);
    }

    handleDragEnter(e, zone) {
        e.preventDefault();
        e.stopPropagation();
        zone.classList.add('dragover');
    }

    handleDragOver(e, zone) {
        e.preventDefault();
        e.stopPropagation();
        e.dataTransfer.dropEffect = 'copy';
    }

    handleDragLeave(e, zone) {
        e.preventDefault();
        e.stopPropagation();

        // Nur entfernen wenn wirklich die Zone verlassen wird
        const rect = zone.getBoundingClientRect();
        const x = e.clientX;
        const y = e.clientY;

        if (x < rect.left || x >= rect.right || y < rect.top || y >= rect.bottom) {
            zone.classList.remove('dragover');
        }
    }

    handleDrop(e, zone) {
        e.preventDefault();
        e.stopPropagation();
        zone.classList.remove('dragover');

        const files = e.dataTransfer.files;
        if (files.length > 0) {
            this.processFiles(files, zone);
        }
    }

    handleGlobalDragOver(e) {
        // Verhindert Standard-Browser-Verhalten
        if (e.dataTransfer && e.dataTransfer.types.includes('Files')) {
            e.preventDefault();
            document.body.classList.add('dragging-file');
        }
    }

    handleGlobalDragLeave(e) {
        // Nur entfernen wenn komplett aus dem Fenster
        if (e.clientX === 0 && e.clientY === 0) {
            document.body.classList.remove('dragging-file');
        }
    }

    handleGlobalDrop(e) {
        document.body.classList.remove('dragging-file');

        // Wenn Drop ausserhalb einer Zone, verhindern
        if (!e.target.closest('[data-dropzone]')) {
            e.preventDefault();
        }
    }

    openFileDialog(zone) {
        const input = document.createElement('input');
        input.type = 'file';
        input.multiple = zone.dataset.multiple !== 'false';

        // Akzeptierte Dateitypen
        if (zone.dataset.accept) {
            input.accept = zone.dataset.accept;
        }

        input.addEventListener('change', () => {
            if (input.files.length > 0) {
                this.processFiles(input.files, zone);
            }
        });

        input.click();
    }

    processFiles(files, zone) {
        const maxSize = parseInt(zone.dataset.maxSize) || 10 * 1024 * 1024; // 10MB default
        const accept = zone.dataset.accept ? zone.dataset.accept.split(',').map(t => t.trim()) : null;

        const validFiles = [];
        const errors = [];

        Array.from(files).forEach(file => {
            // Groesse pruefen
            if (file.size > maxSize) {
                errors.push(file.name + ': Datei zu gross (max ' + this.formatFileSize(maxSize) + ')');
                return;
            }

            // Typ pruefen
            if (accept) {
                const isValid = accept.some(type => {
                    if (type.startsWith('.')) {
                        return file.name.toLowerCase().endsWith(type.toLowerCase());
                    }
                    if (type.endsWith('/*')) {
                        return file.type.startsWith(type.slice(0, -1));
                    }
                    return file.type === type;
                });

                if (!isValid) {
                    errors.push(file.name + ': Dateityp nicht erlaubt');
                    return;
                }
            }

            validFiles.push(file);
        });

        // Fehler anzeigen
        if (errors.length > 0 && typeof errorService !== 'undefined') {
            errorService.showToast(errors.join('\n'), 'error');
        }

        // Callback aufrufen
        if (validFiles.length > 0) {
            const callback = zone.dataset.callback;
            if (callback && typeof window[callback] === 'function') {
                window[callback](validFiles, zone);
            }

            // Custom Event
            zone.dispatchEvent(new CustomEvent('filesdropped', {
                detail: { files: validFiles },
                bubbles: true
            }));

            // Vorschau anzeigen
            this.showFilePreview(validFiles, zone);
        }
    }

    showFilePreview(files, zone) {
        let preview = zone.querySelector('.dropzone-preview');
        if (!preview) {
            preview = document.createElement('div');
            preview.className = 'dropzone-preview';
            zone.appendChild(preview);
        }

        files.forEach(file => {
            const item = document.createElement('div');
            item.className = 'preview-item';

            if (file.type.startsWith('image/')) {
                // Bild-Vorschau
                const img = document.createElement('img');
                img.src = URL.createObjectURL(file);
                img.onload = () => URL.revokeObjectURL(img.src);
                item.appendChild(img);
            } else {
                // Icon fuer andere Dateien
                const icon = document.createElement('div');
                icon.className = 'file-icon';
                icon.textContent = this.getFileIcon(file.type);
                item.appendChild(icon);
            }

            const info = document.createElement('div');
            info.className = 'file-info';
            info.innerHTML = '<span class="file-name">' + this.escapeHtml(file.name) + '</span>' +
                             '<span class="file-size">' + this.formatFileSize(file.size) + '</span>';
            item.appendChild(info);

            const remove = document.createElement('button');
            remove.className = 'remove-file';
            remove.innerHTML = '&times;';
            remove.addEventListener('click', (e) => {
                e.stopPropagation();
                item.remove();
                zone.dispatchEvent(new CustomEvent('fileremoved', {
                    detail: { file: file },
                    bubbles: true
                }));
            });
            item.appendChild(remove);

            preview.appendChild(item);
        });
    }

    getFileIcon(mimeType) {
        if (mimeType.startsWith('image/')) return '&#127912;';
        if (mimeType.startsWith('video/')) return '&#127916;';
        if (mimeType.startsWith('audio/')) return '&#127925;';
        if (mimeType.includes('pdf')) return '&#128196;';
        if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) return '&#128200;';
        if (mimeType.includes('document') || mimeType.includes('word')) return '&#128196;';
        if (mimeType.includes('zip') || mimeType.includes('archive')) return '&#128230;';
        return '&#128196;';
    }

    formatFileSize(bytes) {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
        return (bytes / (1024 * 1024 * 1024)).toFixed(1) + ' GB';
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Sortierbare Liste initialisieren
    initSortable(list) {
        if (list.dataset.sortableInit) return;
        list.dataset.sortableInit = 'true';

        const items = list.children;

        Array.from(items).forEach(item => {
            this.makeDraggable(item, list);
        });

        // Observer fuer neue Items
        const observer = new MutationObserver((mutations) => {
            mutations.forEach(mutation => {
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType === 1) {
                        this.makeDraggable(node, list);
                    }
                });
            });
        });

        observer.observe(list, { childList: true });
    }

    makeDraggable(item, list) {
        item.draggable = true;
        item.classList.add('sortable-item');

        item.addEventListener('dragstart', (e) => {
            item.classList.add('dragging');
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('text/plain', '');
        });

        item.addEventListener('dragend', () => {
            item.classList.remove('dragging');

            // Alle Placeholder entfernen
            list.querySelectorAll('.drag-placeholder').forEach(p => p.remove());

            // Custom Event
            list.dispatchEvent(new CustomEvent('sorted', {
                detail: { order: Array.from(list.children).map(el => el.dataset.id || el.id) },
                bubbles: true
            }));
        });

        item.addEventListener('dragover', (e) => {
            e.preventDefault();
            const dragging = list.querySelector('.dragging');
            if (!dragging || dragging === item) return;

            const rect = item.getBoundingClientRect();
            const midY = rect.top + rect.height / 2;

            if (e.clientY < midY) {
                list.insertBefore(dragging, item);
            } else {
                list.insertBefore(dragging, item.nextSibling);
            }
        });
    }

    // Programmatisch Drop-Zone erstellen
    createDropZone(container, options = {}) {
        const zone = document.createElement('div');
        zone.className = 'dropzone custom-dropzone';

        if (options.accept) zone.dataset.accept = options.accept;
        if (options.maxSize) zone.dataset.maxSize = options.maxSize;
        if (options.multiple !== undefined) zone.dataset.multiple = options.multiple;
        if (options.callback) zone.dataset.callback = options.callback;

        zone.dataset.dropzone = 'true';
        zone.innerHTML = '<div class="dropzone-content">' +
            '<div class="dropzone-icon">&#128194;</div>' +
            '<div class="dropzone-text">' + (options.text || 'Dateien hier ablegen oder klicken') + '</div>' +
            '<div class="dropzone-hint">' + (options.hint || '') + '</div>' +
        '</div>';

        container.appendChild(zone);
        this.initDropZone(zone);

        return zone;
    }
}

// Globale Instanz
const dragDropService = new DragDropService();
