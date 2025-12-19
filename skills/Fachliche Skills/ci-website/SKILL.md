# CI-Skill: Orca Website Design System

Corporate Identity und Design-Richtlinien für die öffentliche Orca-Website (Marketing/Relaunch-Website).

## Anwendungsbereich

Dieser Skill definiert das visuelle Design für:
- Öffentliche Marketing-Website (organizingcompanyassets.com)
- Landing Pages
- Support-Dokumentation
- Externe Kommunikation

## Modi

Die Website unterstützt zwei Modi:
- **Dark Mode** (Standard) - Dunkler Hintergrund, helle Schrift
- **Light Mode** - Heller Hintergrund, dunkle Schrift

## Farbpalette

### CSS Variablen (Dark Mode - Standard)
```css
:root {
    --primary: #1C2553;          /* Dunkelblau */
    --accent: #f97316;           /* Orange */
    --accent-dark: #ea580c;      /* Orange Dunkel */
    --bg-dark: #0a0e1a;          /* Hintergrund */
    --bg-card: rgba(255, 255, 255, 0.03);  /* Karten */
    --text-primary: #ffffff;     /* Haupttext */
    --text-secondary: rgba(255, 255, 255, 0.7);  /* Sekundärtext */
    --border: rgba(255, 255, 255, 0.1);  /* Rahmen */
}
```

### Primärfarben
| Name | HEX | Verwendung |
|------|-----|------------|
| **Primary Navy** | `#1C2553` | Akzente, Wellen, Grafiken |
| **Accent Orange** | `#f97316` | CTAs, Buttons, Highlights |
| **Accent Dark** | `#ea580c` | Hover-States |

### Dark Mode Farben
| Name | Wert | Verwendung |
|------|------|------------|
| **Background** | `#0a0e1a` | Seitenhintergrund |
| **Card Background** | `rgba(255,255,255,0.03)` | Karten, Sections |
| **Text Primary** | `#ffffff` | Haupttext |
| **Text Secondary** | `rgba(255,255,255,0.7)` | Untertitel, Labels |
| **Border** | `rgba(255,255,255,0.1)` | Trennlinien |

### Light Mode Farben
| Name | Wert | Verwendung |
|------|------|------------|
| **Background** | `#ffffff` | Seitenhintergrund |
| **Card Background** | `#f8fafc` | Karten, Sections |
| **Text Primary** | `#1C2553` | Haupttext |
| **Text Secondary** | `#64748b` | Untertitel, Labels |
| **Border** | `#e2e8f0` | Trennlinien |

## Typografie

### Schriftart
```css
font-family: 'Oswald', sans-serif;
```

**Google Fonts Import:**
```css
@import url('https://fonts.googleapis.com/css2?family=Oswald:wght@300;400;500;600;700&display=swap');
```

### Schriftgrößen
| Element | Größe | Gewicht | Letter-Spacing |
|---------|-------|---------|----------------|
| Hero H1 | 4rem | 700 | 0.02em |
| H2 Section | 2.5rem | 600 | - |
| H3 Card | 1.5rem | 600 | - |
| Body | 1rem | 400 | - |
| Nav Links | 1rem | 500 | 0.02em |
| Button | 0.95rem | 600 | 0.05em |
| Small | 0.875rem | 400 | - |

### Zeilenhöhe
```css
line-height: 1.6;
```

## Komponenten

### Navigation (Fixed Header)
```css
.nav {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 1000;
    background: rgba(10, 14, 26, 0.95);
    backdrop-filter: blur(20px);
    padding: 1rem 2rem;
    border-bottom: 1px solid rgba(255,255,255,0.1);
}
```

### CTA Buttons
```css
.nav-btn, .cta-btn {
    background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
    color: white;
    padding: 0.8rem 2rem;
    border-radius: 50px;
    border: none;
    font-weight: 600;
    font-size: 0.95rem;
    letter-spacing: 0.05em;
    cursor: pointer;
    transition: transform 0.3s, box-shadow 0.3s;
}
.cta-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 30px rgba(249, 115, 22, 0.3);
}
```

### Sekundäre Buttons (Outline)
```css
.btn-outline {
    background: transparent;
    border: 2px solid rgba(255,255,255,0.3);
    color: white;
    padding: 0.8rem 2rem;
    border-radius: 50px;
}
.btn-outline:hover {
    background: rgba(255,255,255,0.1);
    border-color: rgba(255,255,255,0.5);
}
```

### Cards
```css
.card {
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    padding: 2rem;
    transition: transform 0.3s, border-color 0.3s;
}
.card:hover {
    transform: translateY(-5px);
    border-color: rgba(249, 115, 22, 0.3);
}
```

### Hero Section
```css
.hero {
    min-height: 100vh;
    display: flex;
    align-items: center;
    padding: 120px 2rem 80px;
    position: relative;
    overflow: hidden;
}
```

### Wellen-Hintergrund (Orca-Motiv)
```css
.hero::before {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 300px;
    background: url("data:image/svg+xml,...wave-svg...") no-repeat bottom;
    opacity: 0.5;
}
```

## Layout

### Container
```css
.container {
    max-width: 1400px;
    margin: 0 auto;
    padding: 0 2rem;
}
```

### Sections
```css
.section {
    padding: 100px 2rem;
}
```

### Grid
```css
.grid-3 {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 2rem;
}

@media (max-width: 1024px) {
    .grid-3 { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 640px) {
    .grid-3 { grid-template-columns: 1fr; }
}
```

## Animationen & Transitions

### Standard Transition
```css
transition: all 0.3s ease;
```

### Hover-Effekte
```css
/* Lift-Effekt */
transform: translateY(-2px);

/* Card-Lift */
transform: translateY(-5px);

/* Button-Glow */
box-shadow: 0 10px 30px rgba(249, 115, 22, 0.3);
```

## Spezielle Elemente

### Mode Switcher (Dark/Light)
```css
.mode-switcher {
    position: fixed;
    bottom: 2rem;
    right: 2rem;
    z-index: 9999;
    display: flex;
    gap: 0.5rem;
    background: rgba(0,0,0,0.8);
    padding: 0.5rem;
    border-radius: 50px;
    backdrop-filter: blur(10px);
}
```

### Logo
- **Größe:** 50px x 50px
- **Schrift:** Oswald, 1.3rem, 600 weight
- **Punkt nach "orca"** im Markennamen

### Video Modal
```css
.video-modal {
    position: fixed;
    background: rgba(0, 0, 0, 0.95);
    z-index: 10000;
}
.video-modal video {
    border-radius: 12px;
    box-shadow: 0 30px 80px rgba(0, 0, 0, 0.5);
}
```

## Schatten

| Typ | Wert |
|-----|------|
| **Card** | Kein Schatten (nur Border) |
| **Button Hover** | `0 10px 30px rgba(249, 115, 22, 0.3)` |
| **Modal** | `0 30px 80px rgba(0, 0, 0, 0.5)` |
| **Navigation** | Backdrop-blur statt Schatten |

## Border-Radius

| Element | Wert |
|---------|------|
| Buttons (Pill) | 50px |
| Cards | 12px |
| Video | 12px |
| Inputs | 8px |

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
- Dark Mode als Standard verwenden
- Orange-Gradient für CTAs
- Glassmorphism für Navigation (backdrop-filter: blur)
- Subtile Animationen mit 0.3s Transition
- Wellen/Orca-Motive als dezente Hintergrundelemente
- Pill-shaped Buttons (border-radius: 50px)

### DON'T
- Keine harten Schatten im Dark Mode
- Keine übermäßigen Animationen (>0.5s)
- Nicht zu viele Orange-Akzente gleichzeitig
- Keine anderen Primärfarben außer Navy + Orange

## Markenzeichen

- **Name:** orca. organizing company assets
- **Schreibweise:** Kleinbuchstaben mit Punkt nach "orca"
- **Logo:** Stilisiertes Orca-Symbol
- **Claim:** "Werkzeug-Management der Zukunft"

## Referenz-Dateien
- **Dark Mode:** `Relaunch-Website/index.html`, `Relaunch-Website/prozesse.html`
- **Light Mode:** `Relaunch-Website/light-mode-index.html`
- **CI Mode:** `Relaunch-Website/ci-mode-index.html`
