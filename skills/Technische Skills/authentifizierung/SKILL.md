# Authentifizierung Skill

Beratung, Bereitstellung und Prüfung der Authentifizierung im Orca Asset-Management-System.

## Rolle

Der Authentifizierung-Skill ist verantwortlich für:
- **Beratung** - Empfehlung der optimalen Auth-Strategie
- **Service-Bereitstellung** - Implementierung des Auth-Services
- **Implementierungsprüfung** - Kontrolle der korrekten Umsetzung
- **Sicherheitsaudit** - Überprüfung auf Schwachstellen

## Trigger
- Neue Auth-Anforderungen
- Sicherheitsbedenken
- Token-Probleme
- Session-Management
- Berechtigungsfragen

## Aktuelle Implementierung

### Authentifizierungsmethode
| Eigenschaft | Wert |
|-------------|------|
| Methode | JWT Bearer Token |
| Header | `Authorization: Bearer <token>` |
| Token-Quelle | Manuell über Einstellungen |
| Speicherung | localStorage |
| Gültigkeit | Durch Backend definiert |

### Auth-Service (`js/services/auth.js`)
```javascript
// Token-Verwaltung
class AuthService {
    getToken()      // Token aus localStorage lesen
    setToken(token) // Token speichern
    clearToken()    // Token löschen
    isAuthenticated() // Prüfen ob Token vorhanden
}
```

### API-Integration (`js/services/api.js`)
```javascript
// Header-Injection
if (this.bearerToken) {
    const token = this.bearerToken.startsWith('Bearer ')
        ? this.bearerToken.substring(7)
        : this.bearerToken;
    options.headers['Authorization'] = `Bearer ${token}`;
}
```

## Sicherheits-Checkliste

### Token-Handling
- [ ] Token nicht in URL-Parametern
- [ ] Token nicht in Logs ausgeben
- [ ] Token sicher gespeichert (localStorage vs. sessionStorage)
- [ ] Token-Refresh implementiert (wenn Backend unterstützt)
- [ ] Token bei Logout gelöscht

### Übertragung
- [ ] HTTPS erzwungen
- [ ] Keine sensiblen Daten im Klartext
- [ ] CORS korrekt konfiguriert
- [ ] Content-Security-Policy gesetzt

### Session-Management
- [ ] Inaktivitäts-Timeout definiert
- [ ] Mehrfach-Sessions behandelt
- [ ] Session-Fixation verhindert
- [ ] Logout funktioniert korrekt

### Fehlerbehandlung
- [ ] 401 Unauthorized korrekt behandelt
- [ ] 403 Forbidden korrekt behandelt
- [ ] Keine sensiblen Infos in Fehlermeldungen
- [ ] Automatische Weiterleitung bei Auth-Fehler

## JWT Token Struktur

### Token-Aufbau
```
Header.Payload.Signature

eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.
eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.
SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
```

### Payload-Felder (typisch)
```json
{
  "sub": "user-id",
  "name": "Max Mustermann",
  "email": "max@example.com",
  "roles": ["supplier", "admin"],
  "iat": 1704067200,
  "exp": 1704153600
}
```

### Token-Validierung
```javascript
// Token-Ablauf prüfen (Client-seitig)
function isTokenExpired(token) {
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.exp * 1000 < Date.now();
    } catch {
        return true;
    }
}
```

## Berechtigungsmodell

### Rollen (aus Orca-System)
| Rolle | Beschreibung | Berechtigungen |
|-------|--------------|----------------|
| SUP | Supplier/Lieferant | Eigene Assets, Inventur |
| IVL | Inventur-Verantwortlicher | Inventur-Management |
| WVL | Werkzeug-Verantwortlicher | Asset-Management |
| Admin | Administrator | Vollzugriff |

### Rollen-basierte UI
```javascript
// Beispiel: Menü-Elemente basierend auf Rolle
if (user.roles.includes('admin')) {
    showAdminMenu();
}

// Beispiel: Buttons deaktivieren
if (!user.canEdit) {
    editButton.disabled = true;
}
```

## Implementierungs-Empfehlungen

### Best Practices
1. **Token-Refresh**: Automatisches Refresh vor Ablauf
2. **Secure Storage**: sessionStorage für sensible Apps
3. **Token-Rotation**: Regelmäßige Token-Erneuerung
4. **Logout-Handling**: Token auf Server invalidieren

### Zu vermeiden
- ❌ Token im localStorage bei hohen Sicherheitsanforderungen
- ❌ Token in URL-Parametern
- ❌ Lange Token-Gültigkeiten
- ❌ Keine Ablauf-Prüfung
- ❌ Token in Git committen

## Fehlerbehandlung

### HTTP Status Codes
```javascript
switch (response.status) {
    case 401:
        // Token ungültig/abgelaufen
        auth.clearToken();
        router.navigate('/login');
        break;
    case 403:
        // Keine Berechtigung
        showError('Keine Berechtigung für diese Aktion');
        break;
    case 419:
        // Session abgelaufen (Laravel)
        auth.refreshToken();
        break;
}
```

### Benutzerfreundliche Meldungen
| Fehler | Technisch | Benutzer-Meldung |
|--------|-----------|------------------|
| 401 | Unauthorized | "Bitte melden Sie sich erneut an" |
| 403 | Forbidden | "Sie haben keine Berechtigung" |
| Token expired | JWT exp < now | "Ihre Sitzung ist abgelaufen" |
| Network error | fetch failed | "Verbindungsproblem" |

## Token-Flow

### Aktueller Flow (Manuell)
```
1. Benutzer erhält Token (extern)
2. Benutzer trägt Token in Einstellungen ein
3. Token wird in localStorage gespeichert
4. API-Calls verwenden Token im Header
5. Bei 401: Benutzer muss neuen Token eingeben
```

### Empfohlener Flow (Zukunft)
```
1. Benutzer gibt Credentials ein (Login-Seite)
2. Backend validiert und sendet JWT
3. Frontend speichert Token (httpOnly Cookie ideal)
4. Automatisches Token-Refresh vor Ablauf
5. Bei Logout: Token auf Server invalidieren
```

## Sicherheits-Audit Checkliste

### Code-Review
- [ ] Keine hardcoded Credentials
- [ ] Token nicht in console.log
- [ ] Keine Token in Error-Messages
- [ ] Sichere String-Vergleiche (timing-safe)

### Konfiguration
- [ ] HTTPS enforced
- [ ] Secure-Flag bei Cookies
- [ ] HttpOnly bei Cookies (wenn verwendet)
- [ ] SameSite-Attribut gesetzt

### Penetration-Test Szenarien
- [ ] Token-Theft über XSS
- [ ] Session-Hijacking
- [ ] CSRF-Angriffe
- [ ] Brute-Force auf Login

## Verbesserungsvorschläge

### Kurzfristig
1. Token-Ablauf-Prüfung implementieren
2. Automatisches Logout bei Inaktivität
3. Bessere Fehler-Meldungen bei Auth-Fehlern

### Mittelfristig
1. Login-Seite implementieren
2. Token-Refresh-Mechanismus
3. Remember-Me-Funktion

### Langfristig
1. OAuth2/OIDC Integration
2. Multi-Factor Authentication
3. Single Sign-On (SSO)

## Referenzen
- `references/token-management.md` - Token-Verwaltung Details
- `references/security-audit-log.md` - Sicherheitsüberprüfungen
- `references/oauth-migration.md` - OAuth2 Migrations-Plan
