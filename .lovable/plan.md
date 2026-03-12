

# ForstControl — Polter-Management MVP

## Überblick
Ein digitales Polter-Verwaltungssystem für Förster, Transporteure und Holzkäufer. Drei Rollen, zwei Ansichten (Liste & Karte), ein zentrales Objekt: der Polter.

---

## Datenmodell (Supabase)

### Tabellen
1. **polter** — ID, Name, Sortiment, Volumen (Festmeter), Beschreibung, GPS (lat/lng), EUDR-Nummer, Status, Forstbetrieb-ID, zugewiesener Transporteur-ID, zugewiesener Käufer-ID, Erstelldatum
2. **bookings** — ID, Polter-ID, Typ (Einbuchen/Ausbuchen), Menge, Foto-URL, erstellt_von, Zeitstempel
3. **user_roles** — user_id, Rolle (forester/transporter/buyer)
4. **profiles** — user_id, Name, Betrieb/Firma
5. **photos** — ID, Booking-ID, Speicher-URL

### Status-Modell
`Neu` → `Bereit` → `Transport zugewiesen` → `Abgeholt` → `Geliefert`

### Rollen-Berechtigungen
- **Förster**: CRUD auf eigene Polter, Zuweisung von Transporteur & Käufer, alle Buchungen sehen
- **Transporteur**: Nur zugewiesene Polter sehen, Ein-/Ausbuchen
- **Käufer**: Nur zugewiesene Polter sehen (Leserecht), Buchungshistorie einsehen

---

## Screens & UX

### 1. Layout & Navigation
- Obere Leiste: ForstControl-Logo, Rollenanzeige, Profilmenü
- Hauptnavigation: Umschalter **Liste | Karte** (zentral, prominent)
- Grüne Akzentfarbe (#2D6A4F / Waldgrün), helle Oberfläche, weiche Schatten

### 2. Listenansicht (je nach Rolle unterschiedliche Spalten)
- **Förster**: Polter-Name, Sortiment, Nummer, Standort, Transporteur, Status-Badge
- **Transporteur**: Forstbetrieb, Polter, Standort, EUDR-Nr., Sortiment, Status
- **Käufer**: Polter, Sortiment, Standort, Status, letzte Bewegung
- Sortierbar, filterbar nach Status und Sortiment
- Klick auf Zeile → Polter-Detailansicht

### 3. Kartenansicht (Leaflet/OpenStreetMap)
- Polter als farbige Pins (Farbe = Status)
- Klick auf Pin → kompakte Detailkarte als Overlay auf der Karte
- Detailkarte mit zwei Tabs: **Beschreibung** | **Historie**

### 4. Polter-Detailkarte (Karten-Overlay)
**Tab Beschreibung:**
- Polter-Name, Sortiment, Volumen, Standort, EUDR-Nr., Beschreibung
- Zugewiesener Transporteur & Käufer (nur Förster sieht Zuweisungs-Buttons)
- Zwei Aktions-Buttons: **Einbuchen** (grün) / **Ausbuchen** (orange)

**Tab Historie:**
- Chronologische Liste aller Buchungen
- Je Eintrag: Datum/Uhrzeit, Typ (Ein/Aus), Menge in fm, Foto-Thumbnail
- Beispiel: `12.03.2026 14:32 — Einbuchen +35.2 fm 📷`

### 5. Mobile Buchungs-Screen (Einbuchen / Ausbuchen)
- Vollbild-Modal, mobile-optimiert
- Polter-Name oben
- Typ-Toggle: Einbuchen / Ausbuchen
- Mengenfeld (numerisch, fm)
- Foto aufnehmen oder hochladen
- Letzte 3 Buchungen als Kontext
- Großer Bestätigungs-Button: **Buchung bestätigen**

### 6. Förster: Polter erstellen & zuweisen
- Formular: Name, Sortiment (Dropdown), Volumen, Beschreibung, GPS (Karten-Picker oder manuell), EUDR-Nr.
- Zuweisung: Transporteur auswählen, Käufer auswählen (aus bestehenden Nutzern)

### 7. Rollenumschaltung (MVP ohne echte Auth)
- Einfacher Rollen-Switcher in der Kopfleiste zum Testen/Demo
- Später durch echtes Login ersetzt

---

## Design-System
- **Primärfarbe**: Waldgrün (#2D6A4F)
- **Hintergrund**: Helles Grau (#F8F9FA)
- **Karten**: Weiß, border-radius 12px, weicher Schatten
- **Status-Badges**: Weiche Pastellfarben (Grün=Bereit, Blau=Zugewiesen, Orange=Abgeholt, Grau=Neu)
- **Typografie**: Clean sans-serif, gut lesbar auf kleinen Screens
- **Icons**: Lucide (Baum, LKW, Karte, Kamera, Plus, Check)
- **Sprache**: Deutsch durchgängig

---

## Technische Umsetzung

### Frontend
- React + TypeScript + Tailwind + shadcn/ui
- `react-leaflet` für Kartenansicht
- Responsive/Mobile-first Layout
- React Router: `/`, `/karte`, `/polter/:id`

### Backend (Supabase)
- PostgreSQL-Tabellen mit RLS
- Supabase Storage für Fotos
- Kein echtes Auth im MVP — Rollen-Switcher simuliert Benutzer

### Neues Package
- `react-leaflet` + `leaflet` für die Kartenintegration

---

## MVP-Scope (Phase 1)
✅ Alle drei Rollenansichten (Liste + Karte)
✅ Polter erstellen & bearbeiten (Förster)
✅ Zuweisungen (Transporteur & Käufer)
✅ Ein-/Ausbuchen mit Menge
✅ Buchungshistorie
✅ Kartenansicht mit Pins & Detailkarte
✅ Mobile Buchungs-Flow
✅ Rollen-Switcher für Demo
✅ Status-System

## Phase 2 (später)
- Echte Authentifizierung & Login
- Foto-Upload bei Buchungen (Supabase Storage)
- Push-Benachrichtigungen
- Export/Berichte
- Haglöf-Integration
- EUDR-Compliance-Workflows
- Multi-Forstbetrieb-Support

