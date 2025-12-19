# Performance Skill

Bewertung, Ausrichtung und Optimierung der System- und API-Performance im Orca Asset-Management-System.

## Rolle

Der Performance-Skill ist verantwortlich für:
- **Bewertung** - Analyse der aktuellen System-Performance
- **Ausrichtung** - Definition von Performance-Zielen und -Standards
- **Optimierung** - Vorschläge zur Performance-Verbesserung
- **Monitoring** - Überwachung von Performance-Metriken

## Trigger
- Langsame Ladezeiten
- API-Timeout-Probleme
- Benutzer-Feedback zu Geschwindigkeit
- Neue Features mit Performance-Impact
- Regelmäßige Performance-Reviews

## Performance-Ziele

### Frontend (Orca App)
| Metrik | Ziel | Kritisch |
|--------|------|----------|
| First Contentful Paint (FCP) | < 1.5s | > 3s |
| Largest Contentful Paint (LCP) | < 2.5s | > 4s |
| Time to Interactive (TTI) | < 3s | > 5s |
| Total Blocking Time (TBT) | < 200ms | > 600ms |
| Cumulative Layout Shift (CLS) | < 0.1 | > 0.25 |

### API-Calls
| Metrik | Ziel | Kritisch |
|--------|------|----------|
| Response Time (einfache Abfrage) | < 200ms | > 1s |
| Response Time (Liste) | < 500ms | > 2s |
| Response Time (komplexe Abfrage) | < 1s | > 3s |
| Timeout-Grenze | 30s | - |

## Performance-Messung

### Browser DevTools
```javascript
// Performance-Timing in Console
console.log('Navigation Timing:');
const timing = performance.getEntriesByType('navigation')[0];
console.log('DNS:', timing.domainLookupEnd - timing.domainLookupStart, 'ms');
console.log('TCP:', timing.connectEnd - timing.connectStart, 'ms');
console.log('Request:', timing.responseStart - timing.requestStart, 'ms');
console.log('Response:', timing.responseEnd - timing.responseStart, 'ms');
console.log('DOM:', timing.domComplete - timing.domInteractive, 'ms');
console.log('Total:', timing.loadEventEnd - timing.startTime, 'ms');
```

### API-Performance messen
```javascript
// API-Call mit Zeitmessung
async function measureApiCall(endpoint) {
    const start = performance.now();
    try {
        const response = await api.call(endpoint, 'GET');
        const duration = performance.now() - start;
        console.log(`${endpoint}: ${duration.toFixed(0)}ms`);
        return { success: true, duration, data: response };
    } catch (error) {
        const duration = performance.now() - start;
        console.error(`${endpoint}: FAILED after ${duration.toFixed(0)}ms`);
        return { success: false, duration, error };
    }
}

// Batch-Test
async function runPerformanceTest() {
    const endpoints = [
        '/profile',
        '/inventory-list?limit=100',
        '/process?limit=100',
        '/companies/list'
    ];

    console.log('=== Performance Test ===');
    for (const ep of endpoints) {
        await measureApiCall(ep);
    }
}
```

### Lighthouse Audit
```bash
# Chrome DevTools → Lighthouse Tab
# Oder CLI:
npx lighthouse https://ollisparks.github.io/orca-app/ --view
```

## Performance-Probleme identifizieren

### Häufige Frontend-Probleme
| Problem | Symptom | Lösung |
|---------|---------|--------|
| Große Bundle-Größe | Langsamer Initial Load | Code-Splitting, Lazy Loading |
| Blocking Scripts | Render blockiert | async/defer, kritisches CSS inline |
| Unoptimierte Bilder | Lange Ladezeit | WebP, Lazy Loading, Compression |
| Layout Thrashing | Ruckeln beim Scroll | DOM-Batch-Updates, requestAnimationFrame |
| Memory Leaks | Wird langsamer über Zeit | Event-Listener aufräumen |

### Häufige API-Probleme
| Problem | Symptom | Lösung |
|---------|---------|--------|
| N+1 Queries | Viele kleine Requests | Batch-Endpoints nutzen |
| Große Payloads | Lange Übertragung | Pagination, Field Selection |
| Fehlende Pagination | Timeout bei großen Listen | Pagination implementieren |
| Kein Caching | Wiederholte identische Calls | Cache-Header, Client-Cache |
| Serielle Requests | Langsame Gesamtzeit | Parallelisierung |

## Optimierungs-Strategien

### 1. API-Optimierung

#### Pagination
```javascript
// Statt alles auf einmal:
// GET /process?limit=1000 ❌

// Besser mit Pagination:
// GET /process?limit=50&skip=0 ✅
// GET /process?limit=50&skip=50 ✅

async function loadAllWithPagination(endpoint, pageSize = 50) {
    let allData = [];
    let skip = 0;
    let hasMore = true;

    while (hasMore) {
        const response = await api.call(`${endpoint}?limit=${pageSize}&skip=${skip}`);
        const data = response.data || response;
        allData = allData.concat(data);
        hasMore = data.length === pageSize;
        skip += pageSize;
    }

    return allData;
}
```

#### Parallelisierung
```javascript
// Sequentiell (langsam):
const profile = await api.getProfile();
const inventory = await api.getInventoryList();
const processes = await api.getVerlagerungList();

// Parallel (schnell):
const [profile, inventory, processes] = await Promise.all([
    api.getProfile(),
    api.getInventoryList(),
    api.getVerlagerungList()
]);
```

#### Caching
```javascript
// Einfacher Memory-Cache
class CachedAPI {
    constructor(ttlMs = 60000) {
        this.cache = new Map();
        this.ttl = ttlMs;
    }

    async get(key, fetchFn) {
        const cached = this.cache.get(key);
        if (cached && Date.now() - cached.timestamp < this.ttl) {
            console.log(`Cache hit: ${key}`);
            return cached.data;
        }

        console.log(`Cache miss: ${key}`);
        const data = await fetchFn();
        this.cache.set(key, { data, timestamp: Date.now() });
        return data;
    }

    invalidate(key) {
        this.cache.delete(key);
    }

    clear() {
        this.cache.clear();
    }
}
```

### 2. Frontend-Optimierung

#### Lazy Loading für Seiten
```javascript
// Statt alle Seiten sofort laden:
// <script src="js/pages/inventur.js"></script>
// <script src="js/pages/verlagerung.js"></script>
// ...

// Dynamisch laden bei Bedarf:
async function loadPage(pageName) {
    if (!window[`${pageName}Page`]) {
        await loadScript(`js/pages/${pageName}.js`);
    }
    return window[`${pageName}Page`];
}
```

#### Debouncing für Suche
```javascript
// Ohne Debounce: Jeder Tastendruck = API-Call ❌
input.addEventListener('input', () => search(input.value));

// Mit Debounce: Wartet auf Pause ✅
let debounceTimer;
input.addEventListener('input', () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
        search(input.value);
    }, 300);
});
```

#### Virtual Scrolling für lange Listen
```javascript
// Bei > 100 Einträgen Virtual Scrolling erwägen
// Nur sichtbare Elemente rendern
class VirtualList {
    constructor(container, items, rowHeight) {
        this.container = container;
        this.items = items;
        this.rowHeight = rowHeight;
        this.render();
    }

    render() {
        const scrollTop = this.container.scrollTop;
        const viewportHeight = this.container.clientHeight;

        const startIndex = Math.floor(scrollTop / this.rowHeight);
        const endIndex = Math.min(
            startIndex + Math.ceil(viewportHeight / this.rowHeight) + 1,
            this.items.length
        );

        // Nur sichtbare Items rendern
        const visibleItems = this.items.slice(startIndex, endIndex);
        // ... render logic
    }
}
```

### 3. Rendering-Optimierung

#### DOM-Manipulation minimieren
```javascript
// Schlecht: Viele einzelne DOM-Updates ❌
items.forEach(item => {
    const row = document.createElement('tr');
    row.innerHTML = `<td>${item.name}</td>`;
    table.appendChild(row);
});

// Besser: DocumentFragment oder innerHTML ✅
const html = items.map(item =>
    `<tr><td>${item.name}</td></tr>`
).join('');
table.innerHTML = html;

// Oder mit DocumentFragment:
const fragment = document.createDocumentFragment();
items.forEach(item => {
    const row = document.createElement('tr');
    row.innerHTML = `<td>${item.name}</td>`;
    fragment.appendChild(row);
});
table.appendChild(fragment);
```

## Performance-Monitoring

### Metriken sammeln
```javascript
// Performance-Observer
const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
        console.log(`${entry.name}: ${entry.duration}ms`);
        // An Analytics senden
    }
});

observer.observe({ entryTypes: ['measure', 'resource'] });
```

### Dashboard-Metriken
```javascript
// Performance-Stats für Dashboard
function getPerformanceStats() {
    const entries = performance.getEntriesByType('resource');
    const apiCalls = entries.filter(e => e.name.includes('/api/'));

    return {
        totalApiCalls: apiCalls.length,
        avgResponseTime: apiCalls.reduce((a, b) => a + b.duration, 0) / apiCalls.length,
        slowestCall: Math.max(...apiCalls.map(e => e.duration)),
        totalTransferred: apiCalls.reduce((a, b) => a + b.transferSize, 0)
    };
}
```

## Performance-Budget

### Dateigrößen
| Ressource | Budget | Aktuell |
|-----------|--------|---------|
| HTML | < 50 KB | ~5 KB |
| CSS | < 100 KB | ~20 KB |
| JS (gesamt) | < 300 KB | ~100 KB |
| Bilder | < 500 KB | ~20 KB |
| **Total** | **< 1 MB** | **~145 KB** |

### API-Limits
| Endpoint | Max Items | Empfohlen |
|----------|-----------|-----------|
| /process | 1000 | 50-100 mit Pagination |
| /inventory-list | 500 | 50-100 mit Pagination |
| /positions | 500 | 50-100 mit Pagination |

## Verbesserungsvorschläge

### Kurzfristig (Quick Wins)
1. **API-Calls parallelisieren** - Promise.all für unabhängige Calls
2. **Debouncing für Suche** - Weniger API-Calls bei Eingabe
3. **Loading States** - Gefühlte Performance verbessern
4. **Console.logs entfernen** - Weniger Overhead

### Mittelfristig
1. **Client-seitiges Caching** - Wiederholte Calls vermeiden
2. **Pagination überall** - Große Listen aufteilen
3. **Lazy Loading** - Seiten bei Bedarf laden
4. **Bildoptimierung** - WebP, Lazy Loading

### Langfristig
1. **Service Worker** - Offline-Cache, Background Sync
2. **Build-Prozess** - Minification, Tree Shaking
3. **CDN-Nutzung** - Statische Assets cachen
4. **Server-Side Rendering** - Schnellerer Initial Load

## Referenzen
- `references/performance-benchmarks.md` - Aktuelle Messwerte
- `references/optimization-history.md` - Durchgeführte Optimierungen
- `references/monitoring-setup.md` - Monitoring-Konfiguration
