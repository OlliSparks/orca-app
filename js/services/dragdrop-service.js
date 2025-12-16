// ORCA 2.0 - Drag & Drop Service
// Datei-Upload per Drag & Drop, Listen-Sortierung

class DragDropService {
    constructor() {
        this.dropZones = [];
        // Wait for DOM
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.init());
        } else {
            this.init();
        }
    }

    init() {
        try {
            // Globales Drag-Over Event fuer visuelles Feedback
            document.addEventListener('dragover', (e) => this.handleGlobalDragOver(e));
            document.addEventListener('dragleave', (e) => this.handleGlobalDragLeave(e));
            document.addEventListener('drop', (e) => this.handleGlobalDrop(e));

            // Observer fuer neue Drop-Zones
            this.setupMutationObserver();
        } catch (e) {
            console.warn('[DragDrop] Init error:', e);
        }
    }

    setupMutationObserver() {
        if (!document.body) return;

        const observer = new MutationObserver((mutations) => {
            mutations.forEach(mutation => {
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType === 1 && node.querySelectorAll) {
                        const zones = node.querySelectorAll('[data-dropzone]');
                        zones.forEach(zone => this.initDropZone(zone));

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

    initDropZone(zone) {
        if (!zone || zone.dataset.initialized) return;
        zone.dataset.initialized = 'true';

        zone.classList.add('dropzone');

        const overlay = document.createElement('div');
        overlay.className = 'dropzone-overlay';
        overlay.innerHTML = '<div class="dropzone-icon">&#128194;</div><div class="dropzone-text">Dateien hier ablegen</div>';
        zone.appendChild(overlay);

        zone.addEventListener('dragenter', (e) => this.handleDragEnter(e, zone));
        zone.addEventListener('dragover', (e) => this.handleDragOver(e, zone));
        zone.addEventListener('dragleave', (e) => this.handleDragLeave(e, zone));
        zone.addEventListener('drop', (e) => this.handleDrop(e, zone));

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
        if (e.dataTransfer && e.dataTransfer.types && e.dataTransfer.types.includes('Files')) {
            e.preventDefault();
            document.body.classList.add('dragging-file');
        }
    }

    handleGlobalDragLeave(e) {
        if (e.clientX === 0 && e.clientY === 0) {
            document.body.classList.remove('dragging-file');
        }
    }

    handleGlobalDrop(e) {
        document.body.classList.remove('dragging-file');
        if (!e.target.closest('[data-dropzone]')) {
            e.preventDefault();
        }
    }

    openFileDialog(zone) {
        const input = document.createElement('input');
        input.type = 'file';
        input.multiple = zone.dataset.multiple !== 'false';

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
        const maxSize = parseInt(zone.dataset.maxSize) || 10 * 1024 * 1024;
        const accept = zone.dataset.accept ? zone.dataset.accept.split(',').map(t => t.trim()) : null;

        const validFiles = [];
        const errors = [];

        Array.from(files).forEach(file => {
            if (file.size > maxSize) {
                errors.push(file.name + ': Datei zu gross');
                return;
            }

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

        if (errors.length > 0 && typeof errorService !== 'undefined') {
            errorService.showToast(errors.join('\n'), 'error');
        }

        if (validFiles.length > 0) {
            zone.dispatchEvent(new CustomEvent('filesdropped', {
                detail: { files: validFiles },
                bubbles: true
            }));

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
                const img = document.createElement('img');
                img.src = URL.createObjectURL(file);
                img.onload = () => URL.revokeObjectURL(img.src);
                item.appendChild(img);
            } else {
                const icon = document.createElement('div');
                icon.className = 'file-icon';
                icon.textContent = '&#128196;';
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
            });
            item.appendChild(remove);

            preview.appendChild(item);
        });
    }

    formatFileSize(bytes) {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    initSortable(list) {
        if (!list || list.dataset.sortableInit) return;
        list.dataset.sortableInit = 'true';

        Array.from(list.children).forEach(item => {
            this.makeDraggable(item, list);
        });
    }

    makeDraggable(item, list) {
        item.draggable = true;
        item.classList.add('sortable-item');

        item.addEventListener('dragstart', (e) => {
            item.classList.add('dragging');
            e.dataTransfer.effectAllowed = 'move';
        });

        item.addEventListener('dragend', () => {
            item.classList.remove('dragging');
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
}

// Globale Instanz
const dragDropService = new DragDropService();
