---
name: iam
description: "Identity & Access Management Konzept fuer Orca/MyTools. Beschreibt User-Typen, Authentifizierung, Rollen, Berechtigungen und Compliance-Anforderungen nach BMW IT Work Instructions. Trigger: Berechtigungen, Rollen, User-Anlage, Zugriff, IAM."
---

# IAM-Konzept (Identity & Access Management)

Dieses Konzept beschreibt das Identity & Access Management im Orca/MyTools System.

**IT System**: MyTools (APP-28247)
**Stand**: 2024-11-22
**Quelle**: MyTools - IAM Concept v22

---

## User-Typen und Identitaetsquellen

Orca unterscheidet 3 User-Typen mit unterschiedlichen Identity Providern:

| User-Typ | Identity Provider | Beschreibung |
|----------|-------------------|--------------|
| **B2E** | GD/IBV | BMW-interne Mitarbeiter |
| **B2B** | Partner Portal (SAML2) | Externe Partner via Federation |
| **Local User** | Orca selbst | Von Lieferanten erstellte User |

### Besonderheiten

- **B2E User**: Rollen-Gueltigkeit 1 Jahr (IBV)
- **B2B User**: Recertification alle 6 Monate (Partner Portal)
- **Local User**: Recertification mind. alle 12 Monate (organisatorisch)

---

## Rollen-Uebersicht

### BMW-interne Rollen (M-Ressort)

| Rolle | IBV-Gruppe | Orca-Code | Beschreibung |
|-------|-----------|-----------|--------------|
| Facheinkaeufer | orca_M_FEK | **FEK** | Sieht zugeordnete Werkzeuge, kann nach eigenen filtern |
| Facheinkaeufer-Assistenz | orca_M_FEK_A | **FEK** | Gleiche Rechte wie FEK |
| Commodity Servicegruppen | orca_M_CoSe | **FEK** | Gleiche Rechte wie FEK |
| Genehmiger | orca_M_Gen | **CL** | Clearing/Freigabe, sieht alle Werkzeuge |
| Verwertungseinkauf | orca_M_VerE | **VEC** | Sieht Werkzeuge nur ueber Prozesse |
| Support (Inventurbuero) | orca_W_InvB | **SUP** | Sieht alle Werkzeuge inkl. nicht-published |

### BMW-interne Rollen (F-Ressort)

| Rolle | IBV-Gruppe | Orca-Code | Beschreibung |
|-------|-----------|-----------|--------------|
| Anlagenbuchhalter | orca_F_AnBu | **ABC** | Sieht alle Werkzeuge ueber alle Gesellschaften |
| Steuerliche Abwicklung | orca_F_StAb | **STC** | Sieht alle Werkzeuge ueber alle Gesellschaften |

### Lieferanten-Rollen

| Rolle | Orca-Code | Beschreibung |
|-------|-----------|--------------|
| Inventory Lead | **IVL** | Hauptansprechpartner Inventur (Lieferanten-Seite) |
| Inventory Delegate | **ID** | Delegierter fuer Inventur |
| IT Lead | **ITL** | IT-Verantwortlicher beim Lieferanten |
| Werkzeug-Verantwortlicher | **WVL** | Werkzeug-Verantwortlicher Lead |
| WVL mit Standort | **WVL-LOC** | WVL mit Standort-Beschraenkung |
| Verlagerungs-Verantwortlicher | **VVL** | Verlagerungen durchfuehren |

---

## Berechtigungen (Entitlements)

### Funktionale Bereiche

1. **Werkzeugliste**
   - 2.1 Werkzeugliste oeffnen
   - 2.2 Werkzeuge filtern

2. **Inventur**
   - Inventurauftraege sehen
   - Positionen melden
   - Inventur akzeptieren/genehmigen

3. **Verlagerung**
   - Verlagerungsantraege erstellen
   - Verlagerungen durchfuehren
   - Verlagerungen freigeben

4. **Administration**
   - User verwalten
   - Rollen zuweisen
   - Einstellungen aendern

---

## Account-Typen

| Account-Typ | Anzahl | Quelle | Bemerkung |
|-------------|--------|--------|-----------|
| Standard Account Business | ~500 | LDAP-Sync mit GD | Normale User |
| Admin Account | 1 | Lokal | Einstellungen aendern |
| Technical Account | 1 | IDAS | Datensynchronisation |
| Breakglass Account | 1 | Lokal | Default: gesperrt |

---

## Authentifizierung

| User-Typ | Methode | MFA |
|----------|---------|-----|
| BMW User | Q-Nummer + PWD | Ja (IBV) |
| B2B User | Username + PWD | Nein (Basic Protection) |
| Local User | Username + PWD | Nein |

**Session-Handling**: Implementiert (Details in IT Security Doku)

---

## Segregation of Duties (SoD)

Folgende Rollen-/Berechtigungskombinationen sind verboten:

| Verbotene Kombination | Grund |
|----------------------|-------|
| Admin + normale User-Rechte | Trennung Administration/Operation |
| Test-Umgebung + Produktion | Umgebungstrennung |
| Ersteller + Genehmiger | Vier-Augen-Prinzip |

---

## Recertification

| Objekt | Intervall | Verantwortlich |
|--------|-----------|----------------|
| IAM Concept | 12 Monate | IT Security |
| Kritische Rollen | 6 Monate | Role Owner |
| BMW-User | 12 Monate | IBV |
| B2B User | 6 Monate | Partner Portal |
| Local User | 12 Monate | Lieferant |

---

## Offene ToDos (aus Konzept)

1. **Local User Genehmigung**: BMW-interne Genehmigung bei Erstellung implementieren
2. **Recertification Local User**: Dokumentierte Recertification durchfuehren
3. **Deaktivierung**: Prozess fuer Deaktivierung/Loeschung nicht mehr benoetigter Identitaeten dokumentieren
4. **Reconciliation**: Abgleich zwischen BMW IAM Systemen und Orca durchfuehren
5. **4-Augen-Prinzip**: Fuer Genehmigungen implementieren
6. **WEBEAM.Next**: Local User Access ueber WEBEAM.Next implementieren
7. **Emergency User**: Implementieren und dokumentieren
8. **SoD-Dokumentation**: Verbotene Rollenkombinationen vollstaendig dokumentieren

---

## Compliance-Referenzen

Das IAM-Konzept erfuellt folgende Anforderungen:

| Regelwerk | Referenz |
|-----------|----------|
| IT Work Instruction - IAM | IAM-IDN-1 bis IAM-IDN-5 |
| IT Work Instruction - IAM | IAM-ATH-1 bis IAM-ATH-4 |
| IT Work Instruction - IAM | IAM-AUT-1 bis IAM-AUT-15 |
| ISO/IEC 27001 | 5.16, 5.17, 5.18, 6.1, 8.5 |
| TISAX | 4.1.1, 4.1.2, 4.1.3, 2.1.1 |
| IT-Grundschutz | ORP.4.A3, ORP.4.A15, ORP.4.A21 |
| BAIT | AT 6.3 |

---

## Genehmigungsworkflow (IBV)

```
User beantragt Rolle in IBV
        ↓
IBV prueft Zugehoerigkeit
        ↓
Business Department genehmigt
        ↓
Rolle wird in GD angelegt
        ↓
LDAP-Sync nach Orca
        ↓
User hat Berechtigung
```

---

## Abweichungen vom Standard

| Bereich | Abweichung | Risiko |
|---------|-----------|--------|
| Local User | Kein zentrales IAM | ToDo: WEBEAM.Next |
| Local User | Keine interne Genehmigung | ToDo: Prozess definieren |
| B2B User | Deaktivierter User bleibt in Orca | ToDo: Aufraeumen |
| 4-Augen-Prinzip | Nicht fuer alle Genehmigungen | Basic Protection |

---

## Update 18.12.2024

- Initial aus IAM Concept v22 extrahiert
- Rollen-Mapping BMW ↔ Orca dokumentiert
- Offene ToDos aus Originalkonzept uebernommen
