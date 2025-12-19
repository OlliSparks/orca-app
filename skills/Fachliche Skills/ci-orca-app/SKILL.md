# CI-Skill: Orca-App Design System

Corporate Identity und Design-Richtlinien für die Orca 2.0 Web-Applikation (Supplier Portal).

## Anwendungsbereich

Dieser Skill definiert das visuelle Design für:
- Orca 2.0 Supplier Portal (orca-app-github)
- Interne Verwaltungstools
- Business-Applikationen für Lieferanten

## Farbpalette

### Primärfarben
| Name | HEX | RGB | Verwendung |
|------|-----|-----|------------|
| **Primary Blue** | `#2c4a8c` | 44, 74, 140 | Header, Buttons, Links, aktive Elemente |
| **Primary Dark** | `#1e3a6d` | 30, 58, 109 | Hover-States, Fokus |
| **Accent Orange** | `#f97316` | 249, 115, 22 | Sekundäre Buttons, Highlights, CTAs |
| **Accent Dark** | `#ea580c` | 234, 88, 12 | Orange Hover-States |

### Neutralfarben
| Name | HEX | Verwendung |
|------|-----|------------|
| **Background** | `#f5f7fa` | Seitenhintergrund |
| **Card White** | `#ffffff` | Karten, Modals, Container |
| **Text Primary** | `#2c3e50` | Haupttext |
| **Text Secondary** | `#6b7280` | Sekundärtext, Labels |
| **Border Light** | `#e5e7eb` | Rahmen, Trennlinien |
| **Table Header** | `#f9fafb` | Tabellenkopf-Hintergrund |

### Status-Farben
| Status | HEX | Verwendung |
|--------|-----|------------|
| **Success** | `#22c55e` | Erfolgsmeldungen, abgeschlossen |
| **Warning** | `#f59e0b` | Warnungen, in Bearbeitung |
| **Error** | `#ef4444` | Fehler, kritisch |
| **Info** | `#3b82f6` | Hinweise, neutral |

## Typografie

### Schriftart
```css
font-family: 'Oswald', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
```

**Google Fonts Import:**
```css
@import url('https://fonts.googleapis.com/css2?family=Oswald:wght@300;400;500;600;700&display=swap');
```

### Schriftgrößen
| Element | Größe | Gewicht |
|---------|-------|---------|
| Body | 14px | 400 |
| H1 (Header) | 1.4rem | 600 |
| H2 (Seitenüberschrift) | 1.3rem | 600 |
| H3 (Kartenüberschrift) | 1.1rem | 600 |
| Subtitle | 0.9rem | 400 |
| Button | 0.85rem | 600 |
| Small/Label | 0.75rem | 500 |

### Zeilenhöhe
```css
line-height: 1.5;
```

## Komponenten

### Header
```css
.header {
    background: #2c4a8c;
    color: white;
    padding: 1rem 1.5rem;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    position: sticky;
    top: 0;
    z-index: 100;
}
```

### Buttons
```css
/* Primär (Blau) */
.btn-primary {
    background: #2c4a8c;
    color: white;
    padding: 0.6rem 1.2rem;
    border: none;
    border-radius: 6px;
    font-weight: 600;
    min-width: 105px;
}
.btn-primary:hover { background: #1e3a6d; }

/* Sekundär (Orange) */
.btn-secondary {
    background: #f97316;
    color: white;
}
.btn-secondary:hover { background: #ea580c; }

/* Neutral (Grau) */
.btn-neutral {
    background: #6b7280;
    color: white;
}
.btn-neutral:hover { background: #4b5563; }
```

### Cards
```css
.card {
    background: white;
    border-radius: 8px;
    padding: 1.5rem;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    margin-bottom: 1rem;
}
```

### Inputs
```css
.input, .search-input {
    padding: 0.6rem 1rem;
    border: 1.5px solid #e5e7eb;
    border-radius: 6px;
    font-size: 0.9rem;
    font-family: 'Oswald', sans-serif;
}
.input:focus {
    outline: none;
    border-color: #2c4a8c;
}
```

### Filter-Chips
```css
.filter-chip {
    padding: 0.4rem 0.8rem;
    border: 1.5px solid #e5e7eb;
    background: white;
    border-radius: 6px;
    font-size: 0.85rem;
    font-weight: 500;
}
.filter-chip:hover {
    border-color: #2c4a8c;
    background: #f9fafb;
}
.filter-chip.active {
    background: #2c4a8c;
    color: white;
    border-color: #2c4a8c;
}
```

### Tabellen
```css
table { width: 100%; border-collapse: collapse; }
thead { background: #f9fafb; border-bottom: 2px solid #e5e7eb; }
th { text-align: left; padding: 0.75rem; font-weight: 600; }
td { padding: 0.75rem; border-bottom: 1px solid #e5e7eb; }
tr:hover { background: #f9fafb; }
```

### Status-Badges
```css
.status-badge {
    padding: 0.25rem 0.6rem;
    border-radius: 12px;
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
}
.status-offen { background: #fef3c7; color: #92400e; }
.status-in-bearbeitung { background: #dbeafe; color: #1e40af; }
.status-abgeschlossen { background: #dcfce7; color: #166534; }
```

## Layout

### Container
```css
.container {
    max-width: 1400px;
    margin: 0 auto;
    padding: 1rem;
}
```

### Grid (Cards)
```css
.grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 1rem;
}
```

### Abstände
| Name | Wert |
|------|------|
| XS | 0.25rem (4px) |
| SM | 0.5rem (8px) |
| MD | 1rem (16px) |
| LG | 1.5rem (24px) |
| XL | 2rem (32px) |

## Schatten
```css
/* Standard */
box-shadow: 0 1px 3px rgba(0,0,0,0.1);

/* Erhöht (Hover, Dropdowns) */
box-shadow: 0 4px 8px rgba(0,0,0,0.15);

/* Header */
box-shadow: 0 2px 8px rgba(0,0,0,0.1);
```

## Border-Radius
| Element | Wert |
|---------|------|
| Buttons, Inputs | 6px |
| Cards | 8px |
| Badges | 12px |
| Pills/Chips | 6px |

## Icons
Verwendung von Unicode-Symbolen oder einfachen Text-Indikatoren:
- Suche: 🔍 oder "Suchen"
- Filter: Filter-Text
- Navigation: ← → ↑ ↓
- Status: ● (Punkt mit Farbe)

## Responsive Breakpoints
```css
/* Mobile */
@media (max-width: 640px) { }

/* Tablet */
@media (max-width: 1024px) { }

/* Desktop */
@media (min-width: 1025px) { }
```

## Best Practices

### DO
- Oswald als primäre Schrift verwenden
- Primary Blue (#2c4a8c) für interaktive Elemente
- Orange (#f97316) sparsam für wichtige CTAs
- Weißer Hintergrund für Karten und Inhalte
- Konsistente 6px/8px Border-Radius

### DON'T
- Keine anderen Schriftarten mischen
- Keine zusätzlichen Primärfarben einführen
- Nicht zu viele Schatten-Ebenen
- Keine Animationen >0.3s

## Referenz-Dateien
- **CSS:** `orca-app-github/css/styles.css`
- **HTML-Struktur:** `orca-app-github/index.html`
