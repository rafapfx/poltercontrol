

# Komplett-Überarbeitung: Buchungssystem, UX-Logik & Responsiveness

## Gefundene Probleme

### 1. Buchung "funktioniert nicht"
- **Hauptproblem**: Buchung wird zwar zum Array hinzugefügt, aber das Polter-Volumen ändert sich nie sichtbar. Es gibt keine Berechnung von "aktueller Bestand" basierend auf Ein-/Ausbuchungen.
- Nach Buchung schliesst das Modal, der User sieht keine Änderung (ist auf Tab "Beschreibung", nicht "Historie").
- `selectedPolter` in Index.tsx ist ein Snapshot-Objekt — zeigt alte Daten.

### 2. Logik-Probleme
- Volumen auf dem Polter ist statisch (Erstellwert), wird nie durch Buchungen verändert.
- Kein "aktueller Bestand" berechnet (Einbuchungen minus Ausbuchungen).
- Ausbuchung erlaubt mehr als der aktuelle Bestand.
- Status ändert sich nie durch Buchungsaktionen.

### 3. Responsive-Probleme
- Tabelle in Listenansicht scrollt horizontal, nicht mobile-tauglich.
- PolterDetailCard hat feste Breite + absolute Positionierung (nur für Karte gedacht), wird aber auch als Modal in der Liste verwendet.
- Header-Rollen-Switcher zeigt auf Mobile nur Icons ohne Label — ok, aber eng.
- Buchungsmodal: Formular könnte auf kleinen Screens abgeschnitten werden.

---

## Plan

### A. Buchungssystem reparieren & Logik klären

**AppContext erweitern:**
- Neue Funktion `getBestand(polterId)`: Berechnet aktuellen Bestand = Summe aller Einbuchungen - Summe aller Ausbuchungen.
- `addBooking` soll nach Buchung prüfen: Ausbuchung darf nicht mehr als aktuellen Bestand abziehen.
- `selectedPolter` in Index.tsx durch ID ersetzen, damit immer frische Daten angezeigt werden.

**BookingModal verbessern:**
- Aktuellen Bestand prominent anzeigen (z.B. "Aktueller Bestand: 85.4 fm").
- Bei Ausbuchung: Max-Wert auf aktuellen Bestand setzen, Warnung wenn zu viel.
- Nach erfolgreicher Buchung: Toast mit Details, automatisch Tab "Historie" öffnen.

**PolterDetailCard:**
- Zeige berechneten Bestand statt statisches Volumen.
- Nach Buchung automatisch auf Historie-Tab wechseln.

### B. Listenansicht mobile-tauglich machen

- Auf Mobile (< 640px): Karten-Layout statt Tabelle. Jeder Polter als kompakte Karte mit Name, Sortiment, Status-Badge, Bestand.
- Auf Desktop: Tabelle bleibt.

### C. PolterDetailCard responsive machen

- In Listenansicht: Als richtiges Modal/Sheet von unten (mobile) oder zentriert (desktop).
- In Kartenansicht: Overlay-Karte bleibt, aber responsive Breite + auf Mobile als Bottom-Sheet.

### D. Header responsive optimieren

- Auf sehr kleinen Screens: Rollen-Switcher als kompaktes Dropdown statt Button-Gruppe.

### E. Booking-Modal safe-area & scroll

- `max-h-[90vh]` mit overflow-scroll, safe-area-insets für Mobile-Browser.

---

## Betroffene Dateien

1. **`src/contexts/AppContext.tsx`** — `getBestand()` hinzufügen, Validierung bei Ausbuchung
2. **`src/pages/Index.tsx`** — `selectedPolterId` statt `selectedPolter` Objekt, Detail-Modal responsive
3. **`src/components/PolterDetailCard.tsx`** — Bestand anzeigen, responsive Layout, nach Buchung Historie öffnen
4. **`src/components/BookingModal.tsx`** — Bestand anzeigen, Max-Validierung, besseres Feedback
5. **`src/components/PolterListView.tsx`** — Mobile Card-Layout + Desktop Tabelle
6. **`src/components/PolterMapView.tsx`** — Detail-Card auf Mobile als Bottom-Sheet
7. **`src/components/AppHeader.tsx`** — Responsive Rollen-Switcher

