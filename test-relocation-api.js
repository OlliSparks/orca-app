// ============================================
// ORCA API Test: Verlagerungs-Endpunkte
// ============================================
// Fuehre dieses Script in der Browser-Konsole aus,
// nachdem du dich in der App eingeloggt hast (Live-Modus)
// ============================================

async function testRelocationAPIs() {
    // Hole Token und Base-URL aus der bestehenden API-Instanz
    const token = api.bearerToken;
    const baseURL = api.baseURL;
    const supplierNumber = api.supplierNumber;

    if (!token || api.mode === 'mock') {
        console.error('❌ Bitte zuerst in den Live-Modus wechseln und einloggen!');
        console.log('   Gehe zu Einstellungen und setze Mode auf "live" mit gueltigem Token.');
        return;
    }

    console.log('🔍 Teste Verlagerungs-API-Endpunkte...');
    console.log('   Base-URL:', baseURL);
    console.log('   Supplier:', supplierNumber);
    console.log('');

    const results = {};

    // Helper-Funktion fuer API-Calls
    async function testEndpoint(name, endpoint, description) {
        console.log(`\n📡 Test ${name}: ${endpoint}`);
        console.log(`   ${description}`);

        const start = performance.now();
        try {
            const response = await fetch(`${baseURL}${endpoint}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            });
            const duration = Math.round(performance.now() - start);

            if (!response.ok) {
                console.log(`   ❌ Status: ${response.status} ${response.statusText} (${duration}ms)`);
                results[name] = { success: false, status: response.status, duration };
                return null;
            }

            const data = await response.json();
            const count = Array.isArray(data) ? data.length : (data.data?.length || data.total || 'N/A');
            console.log(`   ✅ Status: ${response.status} - ${count} Eintraege (${duration}ms)`);

            // Zeige ersten Eintrag als Sample
            const items = Array.isArray(data) ? data : (data.data || []);
            if (items.length > 0) {
                const sample = items[0];
                console.log('   Sample:', {
                    key: sample.key || sample.context?.key,
                    type: sample.meta?.['p.type'] || sample.meta?.type || sample.type,
                    description: sample.meta?.description || sample.description
                });
            }

            results[name] = { success: true, count, duration, data };
            return data;
        } catch (error) {
            const duration = Math.round(performance.now() - start);
            console.log(`   ❌ Fehler: ${error.message} (${duration}ms)`);
            results[name] = { success: false, error: error.message, duration };
            return null;
        }
    }

    // ============================================
    // TEST 1: Aktueller Ansatz (alle Prozesse)
    // ============================================
    await testEndpoint(
        'process-all',
        '/api/orca/process?limit=50',
        'Aktueller Ansatz: Alle Prozesse laden'
    );

    // ============================================
    // TEST 2: Process mit type-Filter (queryParams)
    // ============================================
    await testEndpoint(
        'process-type-relocation',
        '/api/orca/process?limit=50&queryParams=p.type:RELOCATION',
        'Option A: queryParams mit p.type Filter'
    );

    await testEndpoint(
        'process-type-relocation-v2',
        '/api/orca/process?limit=50&type=RELOCATION',
        'Option B: Direkter type Parameter'
    );

    // ============================================
    // TEST 3: System Tasks fuer Relocation
    // ============================================
    await testEndpoint(
        'tasks-system-relocation',
        `/api/orca/tasks/system?type=RELOCATION&limit=50`,
        'Option C: System Tasks mit type=RELOCATION'
    );

    await testEndpoint(
        'tasks-system-relocation-completion',
        `/api/orca/tasks/system?type=RELOCATION_COMPLETION&limit=50`,
        'Option D: System Tasks mit type=RELOCATION_COMPLETION'
    );

    await testEndpoint(
        'tasks-system-by-supplier',
        `/api/orca/tasks/system?supplier=${supplierNumber}&limit=50`,
        'Option E: System Tasks gefiltert nach Supplier'
    );

    // ============================================
    // TEST 4: Process/scrapping als Referenz
    // ============================================
    await testEndpoint(
        'process-scrapping',
        '/api/orca/process/scrapping?limit=50',
        'Referenz: Dedizierter Scrapping-Endpunkt (als Vergleich)'
    );

    // ============================================
    // TEST 5: Suche nach relocation-spezifischem Endpunkt
    // ============================================
    await testEndpoint(
        'process-relocation-list',
        '/api/orca/process/relocation?limit=50',
        'Option F: Dedizierter /process/relocation Endpunkt'
    );

    // ============================================
    // ZUSAMMENFASSUNG
    // ============================================
    console.log('\n');
    console.log('═══════════════════════════════════════════');
    console.log('📊 ZUSAMMENFASSUNG');
    console.log('═══════════════════════════════════════════');

    Object.entries(results).forEach(([name, result]) => {
        const status = result.success ? '✅' : '❌';
        const info = result.success
            ? `${result.count} Eintraege, ${result.duration}ms`
            : `${result.status || result.error}`;
        console.log(`${status} ${name}: ${info}`);
    });

    // Empfehlung basierend auf Ergebnissen
    console.log('\n');
    console.log('═══════════════════════════════════════════');
    console.log('💡 EMPFEHLUNG');
    console.log('═══════════════════════════════════════════');

    const successfulEndpoints = Object.entries(results)
        .filter(([_, r]) => r.success && r.count > 0)
        .sort((a, b) => a[1].duration - b[1].duration);

    if (successfulEndpoints.length > 0) {
        const [bestName, bestResult] = successfulEndpoints[0];
        console.log(`Schnellster funktionierender Endpunkt: ${bestName}`);
        console.log(`  → ${bestResult.count} Eintraege in ${bestResult.duration}ms`);
    } else {
        console.log('Keiner der getesteten Endpunkte lieferte Verlagerungsdaten.');
        console.log('Moeglicherweise gibt es aktuell keine Verlagerungen im System.');
    }

    return results;
}

// Fuehre Test aus
console.log('╔═══════════════════════════════════════════╗');
console.log('║  ORCA Verlagerungs-API Test               ║');
console.log('║  Starte mit: testRelocationAPIs()        ║');
console.log('╚═══════════════════════════════════════════╝');

// Automatisch starten
testRelocationAPIs();
