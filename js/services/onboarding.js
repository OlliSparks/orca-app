// ORCA 2.0 - Onboarding Service (Extended)
// Verwaltet First-Visit, Tooltips, Glossar, Touren, FAQ, Tipps und mehr

class OnboardingService {
    constructor() {
        this.storageKey = 'orca_onboarding';
        this.state = this.loadState();
        this.glossary = this.initGlossary();
        this.faq = this.initFAQ();
        this.tips = this.initTips();
        this.tourSteps = this.initTourSteps();
        this.currentTourStep = 0;
        this.firstStepsChecklist = this.initFirstSteps();

        // Keyboard shortcuts
        this.initKeyboardShortcuts();
    }

    // ========== STATE MANAGEMENT ==========

    loadState() {
        const stored = localStorage.getItem(this.storageKey);
        if (stored) {
            return JSON.parse(stored);
        }
        return {
            firstVisitCompleted: false,
            tourCompleted: false,
            tooltipsEnabled: true,
            visitCount: 0,
            lastVisit: null,
            lastTipIndex: -1,
            completedSteps: [],
            viewedHelp: [],
            dismissedTips: []
        };
    }

    saveState() {
        localStorage.setItem(this.storageKey, JSON.stringify(this.state));
    }

    isFirstVisit() {
        return !this.state.firstVisitCompleted;
    }

    completeFirstVisit() {
        this.state.firstVisitCompleted = true;
        this.state.visitCount++;
        this.state.lastVisit = new Date().toISOString();
        this.saveState();
    }

    completeTour() {
        this.state.tourCompleted = true;
        this.markStepComplete('tour');
        this.saveState();
    }

    markStepComplete(stepId) {
        if (!this.state.completedSteps.includes(stepId)) {
            this.state.completedSteps.push(stepId);
            this.saveState();
        }
    }

    isStepComplete(stepId) {
        return this.state.completedSteps.includes(stepId);
    }

    trackHelpView(helpKey) {
        if (!this.state.viewedHelp.includes(helpKey)) {
            this.state.viewedHelp.push(helpKey);
            this.saveState();
        }
    }

    resetOnboarding() {
        this.state = {
            firstVisitCompleted: false,
            tourCompleted: false,
            tooltipsEnabled: true,
            visitCount: 0,
            lastVisit: null,
            lastTipIndex: -1,
            completedSteps: [],
            viewedHelp: [],
            dismissedTips: []
        };
        this.saveState();
    }

    // ========== KEYBOARD SHORTCUTS ==========

    initKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Skip shortcuts wenn User in Input-Feld tippt
            const active = document.activeElement;
            const isTyping = active && ['INPUT', 'TEXTAREA', 'SELECT'].includes(active.tagName);

            // F1 = Hilfe (immer aktiv)
            if (e.key === 'F1') {
                e.preventDefault();
                this.showContextualHelp();
            }
            // Shift+? = Glossar (nur wenn nicht im Input-Feld)
            if (e.shiftKey && e.key === '?' && !isTyping) {
                e.preventDefault();
                router.navigate('/glossar');
            }
            // Escape = Modals schließen (immer aktiv)
            if (e.key === 'Escape') {
                this.closeAllModals();
            }
        });
    }

    showContextualHelp() {
        // Ermittle aktuelle Seite und zeige passende Hilfe
        const path = window.location.hash.replace('#', '') || '/';
        const helpMap = {
            '/': 'dashboard',
            '/dashboard': 'dashboard',
            '/inventur': 'inventur',
            '/verlagerung': 'verlagerung',
            '/abl': 'abl',
            '/planung': 'planung',
            '/tools': 'werkzeuge',
            '/settings': 'einstellungen'
        };

        const helpKey = helpMap[path];
        if (helpKey && this.getHelpContent(helpKey)) {
            this.showHelpModal(helpKey);
        } else {
            router.navigate('/glossar');
        }
    }

    closeAllModals() {
        document.querySelectorAll('.onboarding-modal-overlay, .glossary-modal-overlay, .help-modal-overlay, .tour-overlay, .tour-tooltip, .tip-popup').forEach(el => el.remove());
        document.querySelectorAll('.tour-highlight').forEach(el => el.classList.remove('tour-highlight'));
    }

    // ========== GLOSSAR ==========

    initGlossary() {
        return {
            // Prozesse
            'Inventur': {
                short: 'Bestandsaufnahme aller Werkzeuge',
                long: 'Die Inventur ist die systematische Erfassung und Prüfung aller Werkzeuge/Fertigungsmittel an Ihren Standorten. Der OEM (z.B. BMW) beauftragt Sie, den aktuellen Bestand zu bestätigen. Typischerweise läuft eine Inventur über 4 Wochen mit Erinnerungen und Eskalation bei Überfälligkeit.',
                related: ['I0', 'I1', 'I2', 'I3', 'Position', 'IVL'],
                category: 'Prozess'
            },
            'ABL': {
                short: 'Abnahmebereitschaftserklärung',
                long: 'Mit der ABL bestätigen Sie, dass ein Werkzeug abnahmefähig ist und alle Anforderungen erfüllt. Dies ist ein wichtiger Schritt im Werkzeug-Lebenszyklus. Die ABL wird typischerweise nach Fertigstellung oder Modifikation eines Werkzeugs erstellt.',
                related: ['Fertigungsmittel', 'FEK'],
                category: 'Prozess'
            },
            'Verlagerung': {
                short: 'Transport eines Werkzeugs zu einem anderen Standort',
                long: 'Eine Verlagerung ist der physische Transport eines Werkzeugs von einem Standort zu einem anderen. Der Vertragspartner bleibt dabei gleich. Bei länderübergreifenden Verlagerungen sind Zolldokumente und Zolltarifnummern erforderlich. Der Prozess umfasst: Antrag stellen → Genehmigung abwarten → Verlagerung durchführen → Ankunft bestätigen.',
                related: ['VPW', 'Zolltarifnummer'],
                category: 'Prozess'
            },
            'VPW': {
                short: 'Vertragspartnerwechsel',
                long: 'Beim VPW wird ein Werkzeug von einem Lieferanten an einen anderen übergeben. Dies beinhaltet eine Verlagerung plus die rechtliche Übergabe der Verantwortung. Der abgebende Lieferant muss das Werkzeug dokumentieren und übergeben, der aufnehmende Lieferant muss es akzeptieren.',
                related: ['Verlagerung', 'Lieferantennummer'],
                category: 'Prozess'
            },
            'Verschrottung': {
                short: 'Entsorgung eines Werkzeugs',
                long: 'Die Verschrottung ist die kontrollierte Entsorgung eines nicht mehr benötigten Werkzeugs. Dafür ist eine Genehmigung des OEM erforderlich. Der Prozess umfasst: Antrag mit Begründung → Genehmigung durch OEM → Dokumentierte Entsorgung → Nachweis hochladen.',
                related: ['OEM', 'Fertigungsmittel'],
                category: 'Prozess'
            },
            'Planung': {
                short: 'Vorausschauende Inventurplanung',
                long: 'In der Planung sehen Sie kommende Inventuren für die nächsten 6 Monate. Hier können Sie Zeitfenster für die Durchführung angeben und den OEM über Ihre Verfügbarkeit informieren. Gute Planung verhindert Überfälligkeit!',
                related: ['Inventur', 'Fälligkeit'],
                category: 'Prozess'
            },

            // Rollen - Lieferant
            'IVL': {
                short: 'Inventurverantwortlicher Lieferant',
                long: 'Der IVL koordiniert die Inventurdurchführung beim Lieferanten. Er kann Aufgaben an Inventurdurchführer (ID) delegieren und genehmigt die Ergebnisse. Falls kein WVL vorhanden ist, übernimmt der IVL alle Koordinationsaufgaben.',
                related: ['WVL', 'ID', 'Inventur'],
                category: 'Rolle'
            },
            'WVL': {
                short: 'Werkzeugverantwortlicher Lieferant',
                long: 'Der WVL ist der Hauptverantwortliche für alle Werkzeuge bei einem Lieferanten. Er kann die Aufgaben des IVL übernehmen und hat erweiterte Rechte wie Standortverwaltung und Benutzerzuweisung. Pro Lieferantennummer gibt es genau einen WVL.',
                related: ['IVL', 'Lieferantennummer'],
                category: 'Rolle'
            },
            'WVL-LOC': {
                short: 'Werkzeugverantwortlicher pro Standort',
                long: 'Der WVL-LOC ist verantwortlich für alle Werkzeuge an einem bestimmten Standort. Er berichtet an den WVL und koordiniert die lokalen Inventurdurchführer.',
                related: ['WVL', 'Standort'],
                category: 'Rolle'
            },
            'ID': {
                short: 'Inventurdurchführer',
                long: 'Der ID führt die physische Inventur vor Ort durch. Er erhält Arbeitspakete vom IVL oder WVL und erfasst die Werkzeugdaten. Er kann Werkzeuge bestätigen, als nicht gefunden melden oder Kommentare hinterlassen.',
                related: ['IVL', 'Inventur', 'Position'],
                category: 'Rolle'
            },
            'ITL': {
                short: 'IT-Verantwortlicher Lieferant',
                long: 'Der ITL kümmert sich um die technische Integration. Er richtet API-Anbindungen ein und sorgt für automatischen Datenaustausch zwischen Ihren Systemen und ORCA.',
                related: ['API', 'Integration'],
                category: 'Rolle'
            },
            'VVL': {
                short: 'Versand-Verantwortlicher Lieferant',
                long: 'Der VVL koordiniert den physischen Transport bei Verlagerungen. Er organisiert Logistik, erstellt Zolldokumente und bestätigt Versand/Ankunft.',
                related: ['Verlagerung', 'Zolltarifnummer'],
                category: 'Rolle'
            },

            // Rollen - OEM
            'FEK': {
                short: 'Facheinkäufer (OEM)',
                long: 'Der FEK ist der Werkzeugverantwortliche beim OEM (z.B. BMW). Er plant Inventuren, prüft Ergebnisse und ist Ihr Hauptansprechpartner. Bei Fragen oder Klärfällen wendet er sich an Sie.',
                related: ['OEM', 'Inventur', 'Klärfall'],
                category: 'Rolle'
            },
            'CL': {
                short: 'Genehmiger/Approver',
                long: 'Der CL (Clearing) genehmigt Vorgänge wie Verlagerungen oder Verschrottungen auf OEM-Seite. Ohne seine Freigabe können bestimmte Prozesse nicht abgeschlossen werden.',
                related: ['Verlagerung', 'Verschrottung', 'Genehmigung'],
                category: 'Rolle'
            },
            'SUP': {
                short: 'Support/Inventurbüro',
                long: 'Der Support hilft bei technischen Problemen und Fragen zur Nutzung von ORCA. Bei Klärfällen kann er zwischen Lieferant und OEM vermitteln.',
                related: ['Klärfall'],
                category: 'Rolle'
            },

            // Status-Codes Inventur
            'I0': {
                short: 'Inventur: Neu/Entwurf',
                long: 'Die Inventur wurde erstellt, aber noch nicht an den Lieferanten versendet. Sie ist nur für den OEM sichtbar.',
                related: ['Inventur', 'I1'],
                category: 'Status'
            },
            'I1': {
                short: 'Inventur: Versendet/Offen',
                long: 'Die Inventur wurde an Sie versendet und wartet auf Bearbeitung. Ab jetzt läuft die Frist! Bearbeiten Sie alle Positionen und melden Sie die Inventur.',
                related: ['Inventur', 'I0', 'I2', 'Fälligkeit'],
                category: 'Status'
            },
            'I2': {
                short: 'Inventur: Gemeldet',
                long: 'Sie haben die Inventur gemeldet. Der OEM prüft nun die Ergebnisse. Bei Klärfällen werden Sie kontaktiert.',
                related: ['Inventur', 'I1', 'I3', 'Klärfall'],
                category: 'Status'
            },
            'I3': {
                short: 'Inventur: Genehmigt',
                long: 'Der OEM hat die Inventur genehmigt. Alle Positionen wurden akzeptiert. Der Vorgang ist erfolgreich abgeschlossen.',
                related: ['Inventur', 'I2', 'I4'],
                category: 'Status'
            },
            'I4': {
                short: 'Inventur: Abgeschlossen',
                long: 'Die Inventur ist vollständig abgeschlossen und archiviert. Sie erscheint nur noch in der Historie.',
                related: ['Inventur', 'I3'],
                category: 'Status'
            },

            // Status-Codes Position
            'P0': {
                short: 'Position: Offen',
                long: 'Diese Position wurde noch nicht bearbeitet. Sie müssen das Werkzeug prüfen und einen Status vergeben.',
                related: ['Position', 'P2', 'P6'],
                category: 'Status'
            },
            'P1': {
                short: 'Position: Ohne Akzeptanz',
                long: 'Die Position wurde erfasst, aber noch nicht akzeptiert. Der Inventurverantwortliche muss sie noch freigeben.',
                related: ['Position', 'IVL'],
                category: 'Status'
            },
            'P2': {
                short: 'Position: Gefunden, OK',
                long: 'Das Werkzeug wurde am erwarteten Standort gefunden, keine Probleme. Dies ist der Idealfall - schnell und einfach.',
                related: ['Position', 'Inventur'],
                category: 'Status'
            },
            'P3': {
                short: 'Position: Gefunden, mit Vorfällen',
                long: 'Das Werkzeug wurde gefunden, aber es gibt Abweichungen oder Probleme (z.B. Beschädigung, fehlende Teile). Ein Kommentar ist erforderlich, was einen Klärfall erzeugt.',
                related: ['Position', 'Klärfall', 'Kommentar'],
                category: 'Status'
            },
            'P4': {
                short: 'Position: Anderer Standort, OK',
                long: 'Das Werkzeug wurde gefunden, aber an einem anderen Standort als erwartet. Der neue Standort wird erfasst.',
                related: ['Position', 'Standort'],
                category: 'Status'
            },
            'P5': {
                short: 'Position: Anderer Standort, Vorfälle',
                long: 'Das Werkzeug ist an einem anderen Standort und hat zusätzlich Probleme. Kommentar erforderlich.',
                related: ['Position', 'Klärfall'],
                category: 'Status'
            },
            'P6': {
                short: 'Position: Nicht gefunden',
                long: 'Das Werkzeug konnte nicht gefunden werden. Dies erzeugt automatisch einen Klärfall beim OEM. Bitte prüfen Sie sorgfältig, bevor Sie diesen Status wählen!',
                related: ['Position', 'Klärfall'],
                category: 'Status'
            },

            // Allgemeine Begriffe
            'FM-Akte': {
                short: 'Fertigungsmittel-Akte (Werkzeugakte)',
                long: 'Die FM-Akte enthält alle Informationen zu einem Werkzeug: Stammdaten, Standort, Historie, Dokumente und aktueller Status. Sie ist die zentrale Informationsquelle für jedes Werkzeug.',
                related: ['Fertigungsmittel', 'Inventarnummer'],
                category: 'Begriff'
            },
            'Fertigungsmittel': {
                short: 'Werkzeug/Tool',
                long: 'Fertigungsmittel (FM) ist der Oberbegriff für Werkzeuge, Formen, Vorrichtungen etc., die zur Produktion benötigt werden. Im Alltag oft einfach "Werkzeug" genannt.',
                related: ['FM-Akte', 'Inventarnummer'],
                category: 'Begriff'
            },
            'Klärfall': {
                short: 'Vorgang mit offenen Fragen',
                long: 'Ein Klärfall entsteht, wenn bei einem Prozess Unstimmigkeiten auftreten (z.B. Werkzeug nicht gefunden, Kommentar erforderlich). Der OEM muss dann entscheiden, wie weiter verfahren wird. Klärfälle verzögern den Abschluss!',
                related: ['Kommentar', 'P3', 'P6', 'FEK'],
                category: 'Begriff'
            },
            'Kommentar': {
                short: 'Freitext-Anmerkung',
                long: 'Ein Kommentar ist eine textuelle Anmerkung zu einer Position oder einem Prozess. WICHTIG: Jeder Kommentar erzeugt automatisch einen Klärfall beim OEM! Nutzen Sie Kommentare nur wenn wirklich nötig.',
                related: ['Klärfall', 'Position'],
                category: 'Begriff'
            },
            'OEM': {
                short: 'Original Equipment Manufacturer',
                long: 'Der OEM ist der Auftraggeber/Eigentümer der Werkzeuge (z.B. BMW, Audi, Mercedes). Sie als Lieferant verwahren und nutzen die Werkzeuge im Auftrag des OEM. Der OEM bestimmt die Prozesse und Fristen.',
                related: ['FEK', 'Lieferant'],
                category: 'Begriff'
            },
            'Lieferant': {
                short: 'Zulieferer/Supplier',
                long: 'Als Lieferant produzieren Sie Teile für den OEM und verwahren dafür dessen Werkzeuge. Sie sind verantwortlich für Pflege, Inventur und ordnungsgemäße Nutzung der Werkzeuge.',
                related: ['OEM', 'Lieferantennummer', 'WVL'],
                category: 'Begriff'
            },
            'Lieferantennummer': {
                short: 'Eindeutige ID des Lieferanten',
                long: 'Die Lieferantennummer identifiziert Sie als Lieferanten beim OEM. Alle Werkzeuge und Prozesse sind dieser Nummer zugeordnet. Sie finden Ihre Nummer in den Einstellungen.',
                related: ['Lieferant', 'WVL'],
                category: 'Begriff'
            },
            'Inventarnummer': {
                short: 'Eindeutige ID eines Werkzeugs',
                long: 'Die Inventarnummer ist die eindeutige Kennung eines Werkzeugs im System. Bei BMW sind das meist 10-stellige Nummern (z.B. 0010120920). Diese Nummer ist auf dem Typenschild des Werkzeugs zu finden.',
                related: ['Fertigungsmittel', 'FM-Akte'],
                category: 'Begriff'
            },
            'Standort': {
                short: 'Physischer Aufbewahrungsort',
                long: 'Der Standort beschreibt, wo ein Werkzeug physisch aufbewahrt wird. Bei der Inventur müssen Sie bestätigen, dass das Werkzeug am angegebenen Standort ist - oder den korrekten Standort angeben.',
                related: ['WVL-LOC', 'Verlagerung'],
                category: 'Begriff'
            },
            'Fälligkeit': {
                short: 'Deadline für einen Vorgang',
                long: 'Die Fälligkeit ist das Datum, bis zu dem ein Vorgang abgeschlossen sein muss. Überfällige Vorgänge werden im Dashboard rot markiert und können zu Eskalationen führen.',
                related: ['Inventur', 'Dashboard'],
                category: 'Begriff'
            },
            'Delegation': {
                short: 'Aufgabe an andere übertragen',
                long: 'Als Verantwortlicher können Sie Aufgaben an andere Benutzer delegieren. Diese erhalten dann die Berechtigung, die Aufgabe in Ihrem Namen zu erledigen. Sie behalten aber die Gesamtverantwortung.',
                related: ['IVL', 'ID', 'WVL'],
                category: 'Begriff'
            },
            'Zolltarifnummer': {
                short: 'Warencode für Zoll',
                long: 'Bei länderübergreifenden Verlagerungen wird eine Zolltarifnummer benötigt. Diese klassifiziert das Werkzeug für Zollzwecke. Der Inventur-Agent kann Ihnen bei der Ermittlung helfen.',
                related: ['Verlagerung', 'VVL'],
                category: 'Begriff'
            },
            'Agenten (Überblick)': {
                short: 'KI-gestützte Assistenten für alle Prozesse',
                long: 'Agenten sind intelligente Assistenten, die Sie Schritt für Schritt durch komplexe Prozesse führen. Sie helfen beim Datenimport, bei der Prozessdurchführung und bei der Dokumentation. Agenten vereinfachen Ihre Arbeit, reduzieren Fehler und sparen Zeit. Alle Agenten finden Sie im Menü unter "Agenten".',
                related: ['Inventur-Agent', 'ABL-Agent', 'Verlagerungs-Agent', 'Reporting-Agent'],
                category: 'Agenten'
            },
            'Inventur-Agent': {
                short: 'Importiert Werkzeugdaten aus beliebigen Quellen',
                long: 'Der Inventur-Agent analysiert Ihre Daten (Excel, CSV, Screenshots) und ordnet sie automatisch offenen Inventuren zu. Features: Excel/CSV Import, Screenshot-Analyse, API-Anbindung, automatisches Matching.',
                related: ['Inventur', 'Agenten (Überblick)'],
                category: 'Agenten'
            },
            'ABL-Agent': {
                short: 'Erstellt Abnahmebereitschaftserklärungen',
                long: 'Der ABL-Agent führt Sie Schritt für Schritt durch die ABL-Erstellung. Features: Foto-Upload, Standort-Erkennung, Schritt-für-Schritt Dialog, automatische ABL-Erstellung.',
                related: ['ABL', 'Agenten (Überblick)'],
                category: 'Agenten'
            },
            'Reporting-Agent': {
                short: 'Erstellt und exportiert Reports',
                long: 'Der Reporting-Agent lädt Reports aus dem ORCA-System und exportiert sie in verschiedenen Formaten. Features: Fertigungsmittel-Report, Inventur-Reports, PDF/Excel Export, Custom-Auswertungen.',
                related: ['FM-Akte', 'Agenten (Überblick)'],
                category: 'Agenten'
            },
            'Verlagerungs-Agent': {
                short: 'Beantragt und dokumentiert Verlagerungen',
                long: 'Der Verlagerungs-Agent unterstützt bei Anträgen und Durchführung von Verlagerungen. Features: Werkzeug-Auswahl, Maße & Gewicht, Zolltarifnummer, Quell-/Ziel-Standort, Versand-Dokumentation, Empfangsbestätigung.',
                related: ['Verlagerung', 'Agenten (Überblick)'],
                category: 'Agenten'
            },
            'VPW-Agent': {
                short: 'Führt Vertragspartnerwechsel durch',
                long: 'Der VPW-Agent unterstützt bei der Durchführung von Vertragspartnerwechseln. Features: Partnerwahl, Übergabe-Protokoll, Foto-Dokumentation, Workflow-Integration.',
                related: ['VPW', 'Agenten (Überblick)'],
                category: 'Agenten'
            },
            'Verschrottungs-Agent': {
                short: 'Erfasst Verschrottungsanträge',
                long: 'Der Verschrottungs-Agent führt Sie durch den Verschrottungsprozess und dokumentiert alles automatisch. Features: Foto-Dokumentation, Schritt-für-Schritt Dialog, automatische Antragserstellung.',
                related: ['Verschrottung', 'Agenten (Überblick)'],
                category: 'Agenten'
            },
            'Inventurplanungs-Agent': {
                short: 'Plant Inventur-Touren effizient',
                long: 'Der Inventurplanungs-Agent hilft beim Vorbereiten: Was wissen Sie schon? Erledigen Sie am Rechner was geht, planen Sie den Rest als Tour. Features: Daten-Import, Sofort bestätigen, Tour planen.',
                related: ['Inventur', 'Agenten (Überblick)'],
                category: 'Agenten'
            },
            'Integrations-Assistent': {
                short: 'Verbindet Ihre Systeme mit ORCA',
                long: 'Der Integrations-Assistent verbindet Ihre Werkzeugdaten mit ORCA. Wählen Sie aus 3 einfachen Wegen – vom manuellen Upload bis zur automatischen Synchronisation. Kein IT-Aufwand nötig.',
                related: ['API', 'Agenten (Überblick)'],
                category: 'Agenten'
            },
            'Dashboard': {
                short: 'Übersichtsseite',
                long: 'Das Dashboard ist Ihre Startseite und zeigt alle wichtigen Informationen auf einen Blick: Was MUSS ich tun (überfällig), was SOLL ich tun (offen), was KANN ich tun (alle Aktionen).',
                related: ['Fälligkeit'],
                category: 'Begriff'
            },
            'Position': {
                short: 'Einzelnes Werkzeug in einer Inventur',
                long: 'Eine Position ist ein einzelnes Werkzeug innerhalb einer Inventur. Jede Position muss einzeln bearbeitet werden: bestätigen, als nicht gefunden melden, oder mit Kommentar versehen.',
                related: ['Inventur', 'P0', 'P2', 'P6'],
                category: 'Begriff'
            },
            'API': {
                short: 'Automatische Schnittstelle',
                long: 'Die API (Application Programming Interface) ermöglicht automatischen Datenaustausch zwischen ORCA und Ihren Systemen. So können Inventurdaten automatisch importiert werden - fragen Sie Ihren ITL!',
                related: ['ITL', 'Integration'],
                category: 'Begriff'
            },
            'Mock-Modus': {
                short: 'Testmodus mit Beispieldaten',
                long: 'Im Mock-Modus arbeitet ORCA mit Testdaten statt echten Daten. Gut zum Kennenlernen des Systems! In den Einstellungen können Sie zwischen Mock- und Live-Modus wechseln.',
                related: ['Einstellungen'],
                category: 'Begriff'
            }
        };
    }

    getGlossaryTerm(term) {
        return this.glossary[term] || null;
    }

    getAllGlossaryTerms() {
        return this.glossary;
    }

    getGlossaryByCategory(category) {
        return Object.entries(this.glossary)
            .filter(([_, data]) => data.category === category)
            .reduce((acc, [term, data]) => {
                acc[term] = data;
                return acc;
            }, {});
    }

    // ========== FAQ ==========

    initFAQ() {
        return [
            {
                question: 'Wie starte ich mit ORCA?',
                answer: 'Beginnen Sie auf dem Dashboard. Dort sehen Sie alle offenen Aufgaben, priorisiert nach Dringlichkeit. Arbeiten Sie zuerst die roten "MUSS"-Aufgaben ab, dann die "SOLL"-Aufgaben.',
                category: 'Einstieg'
            },
            {
                question: 'Was bedeuten die Farben im Dashboard?',
                answer: 'Rot = Überfällig (MUSS sofort erledigt werden), Orange/Gelb = Offen (SOLL bald erledigt werden), Blau/Grau = Verfügbare Aktionen (KANN jederzeit genutzt werden).',
                category: 'Einstieg'
            },
            {
                question: 'Wie führe ich eine Inventur durch?',
                answer: '1) Öffnen Sie die Inventur aus dem Dashboard oder Menü, 2) Gehen Sie durch jede Position, 3) Bestätigen Sie jedes Werkzeug oder melden Sie Probleme, 4) Wenn alle Positionen bearbeitet sind, melden Sie die Inventur.',
                category: 'Inventur'
            },
            {
                question: 'Was mache ich, wenn ich ein Werkzeug nicht finde?',
                answer: 'Wählen Sie den Status "P6 - Nicht gefunden". ACHTUNG: Dies erzeugt einen Klärfall beim OEM! Prüfen Sie vorher gründlich alle möglichen Standorte und fragen Sie Kollegen.',
                category: 'Inventur'
            },
            {
                question: 'Kann ich Aufgaben an Kollegen delegieren?',
                answer: 'Ja! Als IVL oder WVL können Sie Positionen oder ganze Inventuren an Inventurdurchführer (ID) delegieren. Öffnen Sie dafür die Inventur-Details und nutzen Sie die Delegieren-Funktion.',
                category: 'Inventur'
            },
            {
                question: 'Was ist ein Klärfall?',
                answer: 'Ein Klärfall entsteht, wenn etwas unklar ist: Werkzeug nicht gefunden, Standort falsch, Beschädigung etc. Der OEM muss dann entscheiden. Klärfälle verzögern den Abschluss - vermeiden Sie sie wenn möglich!',
                category: 'Inventur'
            },
            {
                question: 'Wie beantrage ich eine Verlagerung?',
                answer: 'Nutzen Sie den Verlagerungs-Agent (Menü → Agenten → Verlagerung beantragen). Er führt Sie Schritt für Schritt durch den Prozess inkl. Werkzeugauswahl, Zielstandort und ggf. Zolldaten.',
                category: 'Verlagerung'
            },
            {
                question: 'Brauche ich Zolldokumente?',
                answer: 'Nur bei länderübergreifenden Verlagerungen. Der Verlagerungs-Agent fragt automatisch nach der Zolltarifnummer, wenn Sie von einem Land in ein anderes verlagern.',
                category: 'Verlagerung'
            },
            {
                question: 'Was ist der Unterschied zwischen Verlagerung und VPW?',
                answer: 'Bei einer Verlagerung bleibt der Vertragspartner (Sie) gleich - nur der Standort ändert sich. Beim VPW (Vertragspartnerwechsel) geht das Werkzeug an einen anderen Lieferanten über.',
                category: 'Verlagerung'
            },
            {
                question: 'Wie kann ich Daten importieren?',
                answer: 'Nutzen Sie den Inventur-Agent (Menü → Agenten → Inventur). Er akzeptiert Excel-Dateien, CSV und sogar Screenshots. Die Daten werden automatisch mit offenen Inventuren abgeglichen.',
                category: 'Agenten'
            },
            {
                question: 'Welche Dateiformate werden unterstützt?',
                answer: 'Excel (.xlsx, .xls), CSV, und für den Inventur-Agent auch Bilder (PNG, JPG) von Screenshots oder Typenschildern. Der Agent erkennt Werkzeugnummern automatisch.',
                category: 'Agenten'
            },
            {
                question: 'Was bedeutet Mock-Modus?',
                answer: 'Im Mock-Modus arbeiten Sie mit Testdaten statt echten Daten. Perfekt zum Kennenlernen! Wechseln Sie in den Einstellungen zum Live-Modus, um mit echten Daten zu arbeiten.',
                category: 'Einstellungen'
            },
            {
                question: 'Wo finde ich meine Lieferantennummer?',
                answer: 'In den Einstellungen (Menü → Einstellungen). Falls nicht hinterlegt, fragen Sie Ihren WVL oder den OEM-Ansprechpartner (FEK).',
                category: 'Einstellungen'
            },
            {
                question: 'Kann ich ORCA offline nutzen?',
                answer: 'Derzeit nicht vollständig. Sie benötigen eine Internetverbindung. Eine Offline-Funktion ist für zukünftige Versionen geplant.',
                category: 'Technisch'
            },
            {
                question: 'Wie erreiche ich den Support?',
                answer: 'Bei technischen Problemen wenden Sie sich an Ihren ITL. Bei fachlichen Fragen an Ihren IVL/WVL oder den OEM-Support (SUP).',
                category: 'Support'
            },
            {
                question: 'Tastaturkürzel?',
                answer: 'F1 = Hilfe zur aktuellen Seite, Shift+? = Glossar öffnen, Escape = Dialoge schließen.',
                category: 'Tipps'
            }
        ];
    }

    getFAQByCategory(category) {
        if (category === 'all') return this.faq;
        return this.faq.filter(item => item.category === category);
    }

    getFAQCategories() {
        return [...new Set(this.faq.map(item => item.category))];
    }

    // ========== TIPS ==========

    initTips() {
        return [
            {
                title: 'Tastaturkürzel',
                content: 'Drücken Sie F1 für kontextbezogene Hilfe oder Shift+? für das Glossar.',
                icon: '⌨️'
            },
            {
                title: 'Dashboard-Priorisierung',
                content: 'Arbeiten Sie immer zuerst die roten "MUSS"-Aufgaben ab - diese sind überfällig!',
                icon: '🎯'
            },
            {
                title: 'Inventur-Agent nutzen',
                content: 'Sparen Sie Zeit! Der Inventur-Agent kann Ihre Excel-Listen automatisch importieren und zuordnen.',
                icon: '🤖'
            },
            {
                title: 'Kommentare vermeiden',
                content: 'Jeder Kommentar erzeugt einen Klärfall. Nutzen Sie Standardstatus wenn möglich!',
                icon: '💬'
            },
            {
                title: 'Delegation',
                content: 'Als IVL können Sie Inventuren an Mitarbeiter vor Ort delegieren. Nutzen Sie diese Funktion!',
                icon: '👥'
            },
            {
                title: 'Glossar',
                content: 'Unbekannter Begriff? Klicken Sie auf das "?" im Header oder drücken Sie Shift+?',
                icon: '📖'
            },
            {
                title: 'Verlagerung planen',
                content: 'Bei internationalen Verlagerungen: Halten Sie die Zolltarifnummer bereit!',
                icon: '🚚'
            },
            {
                title: 'Regelmäßig prüfen',
                content: 'Schauen Sie täglich ins Dashboard - so verpassen Sie keine Fristen.',
                icon: '📅'
            },
            {
                title: 'Werkzeug nicht gefunden?',
                content: 'Prüfen Sie alle Standorte und fragen Sie Kollegen, bevor Sie P6 wählen!',
                icon: '🔍'
            },
            {
                title: 'Tour starten',
                content: 'Neu hier? Starten Sie die geführte Tour über das Glossar (📖 → Tour starten).',
                icon: '🎓'
            }
        ];
    }

    getRandomTip() {
        // Get a tip that hasn't been shown recently
        const availableTips = this.tips.filter((_, index) =>
            !this.state.dismissedTips.includes(index)
        );

        if (availableTips.length === 0) {
            // Reset dismissed tips
            this.state.dismissedTips = [];
            this.saveState();
            return this.tips[Math.floor(Math.random() * this.tips.length)];
        }

        const randomIndex = Math.floor(Math.random() * availableTips.length);
        return availableTips[randomIndex];
    }

    showTipOfTheDay() {
        // Only show once per session
        if (sessionStorage.getItem('tipShown')) return;

        const tip = this.getRandomTip();
        if (!tip) return;

        const popup = document.createElement('div');
        popup.className = 'tip-popup';
        popup.innerHTML = `
            <div class="tip-popup-content">
                <div class="tip-header">
                    <span class="tip-icon">${tip.icon}</span>
                    <span class="tip-label">Tipp des Tages</span>
                    <button class="tip-close" onclick="this.closest('.tip-popup').remove()">×</button>
                </div>
                <h4>${tip.title}</h4>
                <p>${tip.content}</p>
            </div>
        `;

        document.body.appendChild(popup);
        sessionStorage.setItem('tipShown', 'true');

        // Auto-dismiss after 10 seconds
        setTimeout(() => {
            if (popup.parentNode) {
                popup.classList.add('hiding');
                setTimeout(() => popup.remove(), 300);
            }
        }, 10000);
    }

    // ========== FIRST STEPS CHECKLIST ==========

    initFirstSteps() {
        return [
            {
                id: 'view-dashboard',
                title: 'Dashboard anschauen',
                description: 'Verschaffen Sie sich einen Überblick',
                icon: '🏠',
                action: () => router.navigate('/dashboard')
            },
            {
                id: 'view-tools',
                title: 'Werkzeuge ansehen',
                description: 'Sehen Sie Ihre Fertigungsmittel',
                icon: '🔧',
                action: () => router.navigate('/tools')
            },
            {
                id: 'view-inventur',
                title: 'Inventur öffnen',
                description: 'Prüfen Sie offene Inventuren',
                icon: '📋',
                action: () => router.navigate('/inventur')
            },
            {
                id: 'view-agents',
                title: 'Agenten entdecken',
                description: 'Lernen Sie die KI-Assistenten kennen',
                icon: '🤖',
                action: () => router.navigate('/agenten')
            },
            {
                id: 'view-settings',
                title: 'Einstellungen prüfen',
                description: 'Lieferantennummer und API-Modus',
                icon: '⚙️',
                action: () => router.navigate('/settings')
            },
            {
                id: 'tour',
                title: 'Tour absolvieren',
                description: 'Geführte Einführung',
                icon: '🎯',
                action: () => this.startTour()
            }
        ];
    }

    getFirstStepsProgress() {
        const total = this.firstStepsChecklist.length;
        const completed = this.firstStepsChecklist.filter(step =>
            this.isStepComplete(step.id)
        ).length;
        return { completed, total, percentage: Math.round((completed / total) * 100) };
    }

    showFirstStepsModal() {
        const progress = this.getFirstStepsProgress();

        const modal = document.createElement('div');
        modal.className = 'help-modal-overlay';
        modal.onclick = (e) => {
            if (e.target === modal) modal.remove();
        };

        modal.innerHTML = `
            <div class="help-modal first-steps-modal">
                <div class="help-modal-header">
                    <h3>🚀 Erste Schritte</h3>
                    <button class="help-close" onclick="this.closest('.help-modal-overlay').remove()">×</button>
                </div>
                <div class="help-modal-content">
                    <div class="progress-bar-container">
                        <div class="progress-bar" style="width: ${progress.percentage}%"></div>
                        <span class="progress-text">${progress.completed} von ${progress.total} erledigt</span>
                    </div>
                    <div class="first-steps-list">
                        ${this.firstStepsChecklist.map(step => `
                            <div class="first-step-item ${this.isStepComplete(step.id) ? 'completed' : ''}"
                                 onclick="onboardingService.executeFirstStep('${step.id}')">
                                <span class="step-icon">${step.icon}</span>
                                <div class="step-content">
                                    <h4>${step.title}</h4>
                                    <p>${step.description}</p>
                                </div>
                                <span class="step-check">${this.isStepComplete(step.id) ? '✓' : '→'}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
                <div class="help-modal-footer">
                    <button class="btn-help-close" onclick="this.closest('.help-modal-overlay').remove()">
                        Schließen
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
    }

    executeFirstStep(stepId) {
        const step = this.firstStepsChecklist.find(s => s.id === stepId);
        if (step) {
            this.markStepComplete(stepId);
            this.closeAllModals();
            step.action();
        }
    }

    // ========== FIRST VISIT MODAL ==========

    showFirstVisitModal() {
        if (!this.isFirstVisit()) return;

        const modal = document.createElement('div');
        modal.id = 'firstVisitModal';
        modal.className = 'onboarding-modal-overlay';
        modal.innerHTML = `
            <div class="onboarding-modal">
                <div class="onboarding-modal-content">
                    <div class="onboarding-steps">
                        <!-- Step 1: Willkommen -->
                        <div class="onboarding-step active" data-step="1">
                            <div class="onboarding-icon">👋</div>
                            <h2>Willkommen bei ORCA 2.0</h2>
                            <p class="onboarding-subtitle">Ihr Werkzeug-Management-System</p>
                            <div class="onboarding-description">
                                <p>ORCA hilft Ihnen, alle Werkzeuge und Fertigungsmittel zu verwalten, die Sie im Auftrag des OEM (z.B. BMW) verwahren.</p>
                                <div class="onboarding-highlights">
                                    <div class="highlight-item">
                                        <span class="highlight-icon">📋</span>
                                        <span>Inventuren durchführen</span>
                                    </div>
                                    <div class="highlight-item">
                                        <span class="highlight-icon">🚚</span>
                                        <span>Verlagerungen beantragen</span>
                                    </div>
                                    <div class="highlight-item">
                                        <span class="highlight-icon">🔧</span>
                                        <span>Werkzeuge verwalten</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Step 2: Dashboard erklärt -->
                        <div class="onboarding-step" data-step="2">
                            <div class="onboarding-icon">🎯</div>
                            <h2>Ihr Dashboard</h2>
                            <p class="onboarding-subtitle">Alles auf einen Blick</p>
                            <div class="onboarding-description">
                                <p>Das Dashboard zeigt Ihnen immer, was zu tun ist:</p>
                                <div class="onboarding-priority-list">
                                    <div class="priority-item priority-must">
                                        <span class="priority-label">⚠️ MUSS</span>
                                        <span class="priority-desc">Überfällige Aufgaben - sofort erledigen!</span>
                                    </div>
                                    <div class="priority-item priority-should">
                                        <span class="priority-label">📋 SOLL</span>
                                        <span class="priority-desc">Offene Aufgaben - bald bearbeiten</span>
                                    </div>
                                    <div class="priority-item priority-can">
                                        <span class="priority-label">🎯 KANN</span>
                                        <span class="priority-desc">Alle verfügbaren Aktionen</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Step 3: Agenten erklärt -->
                        <div class="onboarding-step" data-step="3">
                            <div class="onboarding-icon">🤖</div>
                            <h2>KI-Agenten helfen Ihnen</h2>
                            <p class="onboarding-subtitle">Schritt für Schritt durch jeden Prozess</p>
                            <div class="onboarding-description">
                                <p>Für komplexe Aufgaben haben Sie Assistenten:</p>
                                <div class="onboarding-agents">
                                    <div class="agent-item">
                                        <span class="agent-icon">📊</span>
                                        <div class="agent-info">
                                            <strong>Inventur-Agent</strong>
                                            <span>Importiert Ihre Daten automatisch</span>
                                        </div>
                                    </div>
                                    <div class="agent-item">
                                        <span class="agent-icon">🚚</span>
                                        <div class="agent-info">
                                            <strong>Verlagerungs-Agent</strong>
                                            <span>Führt Sie durch den Antrag</span>
                                        </div>
                                    </div>
                                    <div class="agent-item">
                                        <span class="agent-icon">📋</span>
                                        <div class="agent-info">
                                            <strong>Reporting-Agent</strong>
                                            <span>Erstellt Berichte und Exporte</span>
                                        </div>
                                    </div>
                                </div>
                                <p class="onboarding-tip">💡 Tipp: Sie finden alle Agenten im Menü unter "Agenten"</p>
                            </div>
                        </div>

                        <!-- Step 4: Hilfe -->
                        <div class="onboarding-step" data-step="4">
                            <div class="onboarding-icon">❓</div>
                            <h2>Hilfe ist immer da</h2>
                            <p class="onboarding-subtitle">Sie sind nicht allein!</p>
                            <div class="onboarding-description">
                                <div class="help-features">
                                    <div class="help-feature">
                                        <span class="help-feature-icon">?</span>
                                        <div class="help-feature-text">
                                            <strong>Hilfe-Button</strong>
                                            <span>Im Header oder bei Abschnitten</span>
                                        </div>
                                    </div>
                                    <div class="help-feature">
                                        <span class="help-feature-icon">F1</span>
                                        <div class="help-feature-text">
                                            <strong>Tastaturkürzel</strong>
                                            <span>F1 für Hilfe, Shift+? für Glossar</span>
                                        </div>
                                    </div>
                                    <div class="help-feature">
                                        <span class="help-feature-icon">📖</span>
                                        <div class="help-feature-text">
                                            <strong>Glossar</strong>
                                            <span>Alle Begriffe erklärt</span>
                                        </div>
                                    </div>
                                    <div class="help-feature">
                                        <span class="help-feature-icon">🎯</span>
                                        <div class="help-feature-text">
                                            <strong>Geführte Tour</strong>
                                            <span>Jederzeit im Glossar startbar</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Navigation -->
                    <div class="onboarding-nav">
                        <div class="onboarding-dots">
                            <span class="dot active" data-step="1"></span>
                            <span class="dot" data-step="2"></span>
                            <span class="dot" data-step="3"></span>
                            <span class="dot" data-step="4"></span>
                        </div>
                        <div class="onboarding-buttons">
                            <button class="btn-onboarding btn-skip" onclick="onboardingService.skipFirstVisit()">
                                Überspringen
                            </button>
                            <button class="btn-onboarding btn-back" onclick="onboardingService.prevStep()" style="display: none;">
                                ← Zurück
                            </button>
                            <button class="btn-onboarding btn-next" onclick="onboardingService.nextStep()">
                                Weiter →
                            </button>
                            <button class="btn-onboarding btn-finish" onclick="onboardingService.finishFirstVisit()" style="display: none;">
                                Los geht's! 🚀
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        this.currentStep = 1;
        this.totalSteps = 4;
    }

    nextStep() {
        if (this.currentStep < this.totalSteps) {
            this.goToStep(this.currentStep + 1);
        }
    }

    prevStep() {
        if (this.currentStep > 1) {
            this.goToStep(this.currentStep - 1);
        }
    }

    goToStep(step) {
        this.currentStep = step;

        // Update steps visibility
        document.querySelectorAll('.onboarding-step').forEach(el => {
            el.classList.remove('active');
        });
        document.querySelector(`.onboarding-step[data-step="${step}"]`).classList.add('active');

        // Update dots
        document.querySelectorAll('.onboarding-dots .dot').forEach(el => {
            el.classList.remove('active');
        });
        document.querySelector(`.onboarding-dots .dot[data-step="${step}"]`).classList.add('active');

        // Update buttons
        const backBtn = document.querySelector('.btn-back');
        const nextBtn = document.querySelector('.btn-next');
        const finishBtn = document.querySelector('.btn-finish');
        const skipBtn = document.querySelector('.btn-skip');

        if (step === 1) {
            backBtn.style.display = 'none';
            nextBtn.style.display = '';
            finishBtn.style.display = 'none';
            skipBtn.style.display = '';
        } else if (step === this.totalSteps) {
            backBtn.style.display = '';
            nextBtn.style.display = 'none';
            finishBtn.style.display = '';
            skipBtn.style.display = 'none';
        } else {
            backBtn.style.display = '';
            nextBtn.style.display = '';
            finishBtn.style.display = 'none';
            skipBtn.style.display = '';
        }
    }

    skipFirstVisit() {
        this.closeFirstVisitModal();
        this.completeFirstVisit();
    }

    finishFirstVisit() {
        this.closeFirstVisitModal();
        this.completeFirstVisit();
        this.markStepComplete('view-dashboard');

        // Show tip of the day after a delay
        setTimeout(() => this.showTipOfTheDay(), 2000);
    }

    closeFirstVisitModal() {
        const modal = document.getElementById('firstVisitModal');
        if (modal) {
            modal.classList.add('closing');
            setTimeout(() => modal.remove(), 300);
        }
    }

    // ========== TOOLTIPS ==========

    enableTooltips() {
        this.state.tooltipsEnabled = true;
        this.saveState();
        this.initTooltips();
    }

    disableTooltips() {
        this.state.tooltipsEnabled = false;
        this.saveState();
        this.removeTooltips();
    }

    initTooltips() {
        if (!this.state.tooltipsEnabled) return;

        // Add tooltip container if not exists
        if (!document.getElementById('tooltipContainer')) {
            const container = document.createElement('div');
            container.id = 'tooltipContainer';
            container.className = 'tooltip-container';
            document.body.appendChild(container);
        }

        // Find all elements with data-glossary attribute and add tooltip behavior
        this.attachTooltipListeners();
    }

    attachTooltipListeners() {
        document.querySelectorAll('[data-glossary]').forEach(el => {
            if (el.classList.contains('tooltip-initialized')) return;

            el.classList.add('has-tooltip', 'tooltip-initialized');

            el.addEventListener('mouseenter', (e) => this.showTooltip(e));
            el.addEventListener('mouseleave', () => this.hideTooltip());
            el.addEventListener('click', (e) => {
                if (e.target.classList.contains('has-tooltip')) {
                    e.preventDefault();
                    this.showGlossaryModal(e.target.dataset.glossary);
                }
            });
        });
    }

    showTooltip(e) {
        const term = e.target.dataset.glossary;
        const glossaryEntry = this.glossary[term];

        if (!glossaryEntry) return;

        const container = document.getElementById('tooltipContainer');
        if (!container) return;

        container.innerHTML = `
            <div class="tooltip-content">
                <strong>${term}</strong>
                <p>${glossaryEntry.short}</p>
                <span class="tooltip-hint">Klicken für mehr Info</span>
            </div>
        `;

        const rect = e.target.getBoundingClientRect();
        container.style.left = `${rect.left + rect.width / 2}px`;
        container.style.top = `${rect.top - 10}px`;
        container.classList.add('visible');
    }

    hideTooltip() {
        const container = document.getElementById('tooltipContainer');
        if (container) {
            container.classList.remove('visible');
        }
    }

    showGlossaryModal(term) {
        const entry = this.glossary[term];
        if (!entry) return;

        this.trackHelpView(`glossary:${term}`);

        const relatedHtml = entry.related && entry.related.length > 0 ? `
            <div class="glossary-related">
                <strong>Verwandte Begriffe:</strong>
                <div class="related-tags">
                    ${entry.related.map(r => `<span class="related-tag" onclick="onboardingService.showGlossaryModal('${r}')">${r}</span>`).join('')}
                </div>
            </div>
        ` : '';

        const modal = document.createElement('div');
        modal.className = 'glossary-modal-overlay';
        modal.onclick = (e) => {
            if (e.target === modal) modal.remove();
        };

        modal.innerHTML = `
            <div class="glossary-modal">
                <div class="glossary-modal-header">
                    <span class="glossary-category">${entry.category}</span>
                    <button class="glossary-close" onclick="this.closest('.glossary-modal-overlay').remove()">×</button>
                </div>
                <h3>${term}</h3>
                <p class="glossary-short">${entry.short}</p>
                <p class="glossary-long">${entry.long}</p>
                ${relatedHtml}
            </div>
        `;

        document.body.appendChild(modal);
    }

    removeTooltips() {
        document.querySelectorAll('.has-tooltip').forEach(el => {
            el.classList.remove('has-tooltip');
        });
        const container = document.getElementById('tooltipContainer');
        if (container) container.remove();
    }

    // ========== HELP ICONS ==========

    addHelpIcon(elementId, helpKey) {
        const element = document.getElementById(elementId);
        if (!element) return;

        const helpContent = this.getHelpContent(helpKey);
        if (!helpContent) return;

        const helpIcon = document.createElement('span');
        helpIcon.className = 'help-icon';
        helpIcon.innerHTML = '?';
        helpIcon.title = 'Hilfe anzeigen';
        helpIcon.onclick = () => this.showHelpModal(helpKey);

        element.appendChild(helpIcon);
    }

    getHelpContent(key) {
        const helpTexts = {
            'dashboard': {
                title: 'Dashboard - Ihre Startseite',
                content: 'Das Dashboard zeigt alle wichtigen Informationen auf einen Blick. Es ist in drei Bereiche unterteilt: MUSS (überfällig), SOLL (offen) und KANN (alle Aktionen).',
                tips: [
                    'Prüfen Sie das Dashboard täglich',
                    'Rote Karten haben höchste Priorität',
                    'Klicken Sie auf Karten um direkt zur Aufgabe zu gelangen'
                ]
            },
            'dashboard-must': {
                title: 'Was MUSS ich tun?',
                content: 'Hier sehen Sie alle überfälligen Aufgaben. Diese haben das Fälligkeitsdatum bereits überschritten und sollten sofort bearbeitet werden. Überfällige Aufgaben können zu Eskalationen führen!',
                tips: [
                    'Klicken Sie auf eine Karte, um direkt zur Aufgabe zu gelangen',
                    'Überfällige Aufgaben können zu Eskalationen führen',
                    'Im Idealfall ist dieser Bereich leer'
                ]
            },
            'dashboard-should': {
                title: 'Was SOLL ich tun?',
                content: 'Hier sehen Sie alle offenen Aufgaben, die noch nicht überfällig sind. Bearbeiten Sie diese zeitnah, um Überfälligkeit zu vermeiden.',
                tips: [
                    'Die Zahl zeigt die Anzahl der offenen Aufgaben',
                    'Regelmäßige Bearbeitung verhindert Überfälligkeit',
                    'Planen Sie Zeit für diese Aufgaben ein'
                ]
            },
            'dashboard-can': {
                title: 'Was KANN ich tun?',
                content: 'Hier finden Sie alle verfügbaren Aktionen und Module. Nutzen Sie diese für proaktive Aufgaben oder zur Navigation.',
                tips: [
                    'Werkzeugübersicht zeigt alle Ihre Werkzeuge',
                    'Agenten helfen bei komplexen Aufgaben',
                    'Einstellungen für API-Konfiguration'
                ]
            },
            'inventur': {
                title: 'Inventur-Modul',
                content: 'Die Inventur ist die Bestandsaufnahme Ihrer Werkzeuge. Der OEM beauftragt Sie regelmäßig, den Bestand zu prüfen und zu bestätigen. Jede Position muss einzeln bearbeitet werden.',
                tips: [
                    'Nutzen Sie den Inventur-Agent für automatischen Datenimport',
                    'Jedes Werkzeug muss einzeln bestätigt werden',
                    'Bei Problemen: Status "Nicht gefunden" oder Kommentar hinterlassen',
                    'Kommentare erzeugen Klärfälle - sparsam verwenden!'
                ]
            },
            'verlagerung': {
                title: 'Verlagerung',
                content: 'Mit einer Verlagerung transportieren Sie ein Werkzeug von einem Standort zu einem anderen. Der Vertragspartner bleibt dabei gleich.',
                tips: [
                    'Nutzen Sie den Verlagerungs-Agent für geführte Anträge',
                    'Bei Ländergrenzen: Zolltarifnummer erforderlich',
                    'Nach Genehmigung: Verlagerung durchführen nicht vergessen',
                    'Abschluss erst nach Bestätigung der Ankunft'
                ]
            },
            'abl': {
                title: 'ABL - Abnahmebereitschaft',
                content: 'Die ABL (Abnahmebereitschaftserklärung) bestätigt, dass ein Werkzeug abnahmefähig ist und alle Anforderungen erfüllt.',
                tips: [
                    'Prüfen Sie alle Positionen sorgfältig',
                    'Fotos können als Nachweis dienen (optional)',
                    'Nach Bestätigung ist der Vorgang abgeschlossen'
                ]
            },
            'planung': {
                title: 'Planung',
                content: 'In der Planung sehen Sie kommende Inventuren für die nächsten 6 Monate. Hier können Sie Zeitfenster angeben.',
                tips: [
                    'Planen Sie vorausschauend',
                    'Informieren Sie den OEM über Ihre Verfügbarkeit',
                    'Gute Planung verhindert Überfälligkeit'
                ]
            },
            'werkzeuge': {
                title: 'Werkzeugübersicht',
                content: 'Hier sehen Sie alle Werkzeuge/Fertigungsmittel, für die Sie verantwortlich sind. Sie können filtern, sortieren und Details anzeigen.',
                tips: [
                    'Nutzen Sie die Filter für schnelle Suche',
                    'Klicken Sie auf ein Werkzeug für Details',
                    'Die FM-Akte enthält alle Informationen'
                ]
            },
            'einstellungen': {
                title: 'Einstellungen',
                content: 'Hier konfigurieren Sie ORCA: Lieferantennummer, API-Modus (Mock/Live), Bearer Token für die API-Verbindung.',
                tips: [
                    'Im Mock-Modus arbeiten Sie mit Testdaten',
                    'Für echte Daten: Live-Modus aktivieren und Token eingeben',
                    'Bei Fragen zum Token: Wenden Sie sich an Ihren ITL'
                ]
            },
            'agenten': {
                title: 'KI-Agenten',
                content: 'Agenten sind intelligente Assistenten, die Sie Schritt für Schritt durch komplexe Prozesse führen. Sie können Daten importieren, analysieren und automatisch zuordnen.',
                tips: [
                    'Inventur-Agent: Importiert Excel/CSV automatisch',
                    'Verlagerungs-Agent: Führt durch Antragsstellung',
                    'Reporting-Agent: Erstellt Berichte und Exporte'
                ]
            }
        };

        return helpTexts[key] || null;
    }

    showHelpModal(key) {
        const content = this.getHelpContent(key);
        if (!content) return;

        this.trackHelpView(`help:${key}`);

        const modal = document.createElement('div');
        modal.className = 'help-modal-overlay';
        modal.onclick = (e) => {
            if (e.target === modal) modal.remove();
        };

        const tipsHtml = content.tips ? `
            <div class="help-tips">
                <h4>💡 Tipps</h4>
                <ul>
                    ${content.tips.map(tip => `<li>${tip}</li>`).join('')}
                </ul>
            </div>
        ` : '';

        modal.innerHTML = `
            <div class="help-modal">
                <div class="help-modal-header">
                    <h3>${content.title}</h3>
                    <button class="help-close" onclick="this.closest('.help-modal-overlay').remove()">×</button>
                </div>
                <div class="help-modal-content">
                    <p>${content.content}</p>
                    ${tipsHtml}
                </div>
                <div class="help-modal-footer">
                    <button class="btn-help-glossary" onclick="onboardingService.showFullGlossary(); this.closest('.help-modal-overlay').remove();">
                        📖 Zum Glossar
                    </button>
                    <button class="btn-help-close" onclick="this.closest('.help-modal-overlay').remove()">
                        Verstanden
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
    }

    // ========== FULL GLOSSARY PAGE ==========

    showFullGlossary() {
        router.navigate('/glossar');
    }

    // ========== GUIDED TOUR ==========

    initTourSteps() {
        return [
            {
                element: '.header-logo',
                title: 'ORCA 2.0',
                content: 'Klicken Sie auf das Logo, um jederzeit zum Dashboard zurückzukehren.',
                position: 'bottom'
            },
            {
                element: '.header-help-btn',
                title: 'Hilfe-Button',
                content: 'Hier erreichen Sie jederzeit das Glossar mit allen Begriffserklärungen. Oder drücken Sie F1!',
                position: 'bottom-left'
            },
            {
                element: '.nav-dropdown',
                title: 'Navigation',
                content: 'Über dieses Dropdown erreichen Sie alle Module: Inventur, Verlagerung, Agenten und mehr.',
                position: 'bottom'
            },
            {
                element: '.section-title.must-do',
                title: 'Dringende Aufgaben',
                content: 'Rote Karten zeigen überfällige Aufgaben. Diese haben höchste Priorität und sollten sofort bearbeitet werden!',
                position: 'bottom'
            },
            {
                element: '.section-title.should-do',
                title: 'Offene Aufgaben',
                content: 'Hier sehen Sie alle offenen Aufgaben, sortiert nach Prozesstyp. Bearbeiten Sie diese zeitnah.',
                position: 'bottom'
            },
            {
                element: '.section-title.can-do',
                title: 'Alle Aktionen',
                content: 'Von hier aus erreichen Sie alle Module und Funktionen. Klicken Sie auf eine Karte, um zur entsprechenden Seite zu gelangen.',
                position: 'top'
            },
            {
                element: '.help-icon',
                title: 'Kontext-Hilfe',
                content: 'Diese "?" Icons zeigen Ihnen kontextbezogene Hilfe. Klicken Sie darauf für mehr Informationen zum jeweiligen Bereich.',
                position: 'bottom'
            },
            {
                element: '#apiStatus',
                title: 'API-Status',
                content: 'Hier sehen Sie, ob Sie mit Testdaten (Mock) oder echten Daten arbeiten. Ändern Sie dies in den Einstellungen.',
                position: 'top'
            }
        ];
    }

    startTour() {
        this.currentTourStep = 0;

        // Navigate to dashboard first
        if (window.location.hash !== '#/dashboard' && window.location.hash !== '#/') {
            router.navigate('/dashboard');
            setTimeout(() => this.showTourStep(), 500);
        } else {
            this.showTourStep();
        }
    }

    showTourStep() {
        // Remove previous tour elements
        document.querySelectorAll('.tour-overlay, .tour-tooltip, .tour-highlight').forEach(el => el.remove());
        document.querySelectorAll('.tour-highlight').forEach(el => el.classList.remove('tour-highlight'));

        if (this.currentTourStep >= this.tourSteps.length) {
            this.endTour();
            return;
        }

        const step = this.tourSteps[this.currentTourStep];
        const element = document.querySelector(step.element);

        if (!element) {
            // Element not found, skip to next
            this.currentTourStep++;
            this.showTourStep();
            return;
        }

        // Add overlay
        const overlay = document.createElement('div');
        overlay.className = 'tour-overlay';
        document.body.appendChild(overlay);

        // Highlight element
        element.classList.add('tour-highlight');

        // Create tooltip
        const tooltip = document.createElement('div');
        tooltip.className = `tour-tooltip tour-${step.position}`;
        tooltip.innerHTML = `
            <div class="tour-tooltip-content">
                <h4>${step.title}</h4>
                <p>${step.content}</p>
            </div>
            <div class="tour-tooltip-nav">
                <span class="tour-progress">${this.currentTourStep + 1} / ${this.tourSteps.length}</span>
                <div class="tour-buttons">
                    <button class="tour-skip" onclick="onboardingService.endTour()">Tour beenden</button>
                    <button class="tour-next" onclick="onboardingService.nextTourStep()">
                        ${this.currentTourStep === this.tourSteps.length - 1 ? 'Fertig' : 'Weiter →'}
                    </button>
                </div>
            </div>
        `;

        // Position tooltip near element
        const rect = element.getBoundingClientRect();
        document.body.appendChild(tooltip);

        // Position based on step.position
        this.positionTourTooltip(tooltip, rect, step.position);
    }

    positionTourTooltip(tooltip, rect, position) {
        const tooltipRect = tooltip.getBoundingClientRect();
        const padding = 15;

        switch(position) {
            case 'bottom':
                tooltip.style.top = `${rect.bottom + padding}px`;
                tooltip.style.left = `${Math.max(10, rect.left + rect.width / 2 - tooltipRect.width / 2)}px`;
                break;
            case 'top':
                tooltip.style.top = `${rect.top - tooltipRect.height - padding}px`;
                tooltip.style.left = `${Math.max(10, rect.left + rect.width / 2 - tooltipRect.width / 2)}px`;
                break;
            case 'bottom-left':
                tooltip.style.top = `${rect.bottom + padding}px`;
                tooltip.style.left = `${Math.max(10, rect.right - tooltipRect.width)}px`;
                break;
            default:
                tooltip.style.top = `${rect.bottom + padding}px`;
                tooltip.style.left = `${rect.left}px`;
        }
    }

    nextTourStep() {
        const step = this.tourSteps[this.currentTourStep];
        const element = document.querySelector(step.element);
        if (element) {
            element.classList.remove('tour-highlight');
        }

        this.currentTourStep++;
        this.showTourStep();
    }

    endTour() {
        // Remove all tour elements
        document.querySelectorAll('.tour-overlay, .tour-tooltip').forEach(el => el.remove());
        document.querySelectorAll('.tour-highlight').forEach(el => el.classList.remove('tour-highlight'));

        this.completeTour();

        // Show completion message
        this.showTourCompleteMessage();
    }

    showTourCompleteMessage() {
        const modal = document.createElement('div');
        modal.className = 'glossary-modal-overlay';
        modal.onclick = (e) => {
            if (e.target === modal) modal.remove();
        };

        modal.innerHTML = `
            <div class="glossary-modal" style="text-align: center;">
                <div style="font-size: 3rem; margin-bottom: 1rem;">🎉</div>
                <h3>Tour abgeschlossen!</h3>
                <p style="color: var(--text-secondary); margin: 1rem 0;">
                    Sie kennen jetzt die wichtigsten Bereiche von ORCA 2.0.
                </p>
                <p style="font-size: 0.9rem; color: var(--text-secondary);">
                    Bei Fragen: Drücken Sie F1 oder klicken Sie auf "?" im Header.
                </p>
                <button onclick="this.closest('.glossary-modal-overlay').remove()"
                        style="margin-top: 1rem; padding: 0.75rem 1.5rem; background: var(--primary); color: white; border: none; border-radius: 8px; cursor: pointer;">
                    Verstanden!
                </button>
            </div>
        `;

        document.body.appendChild(modal);
    }
}

// Global instance
const onboardingService = new OnboardingService();
