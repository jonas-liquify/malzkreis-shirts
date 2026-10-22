# Ulmer Malzkreis – Shirt-Shop

One-Pager, über den der Stammtisch sein Shirt bewirbt und Vorbestellungen entgegennimmt
(Produktion gesammelt im November).
Bezahlt wird per **PayPal Freunde & Familie**, deshalb braucht die Seite keinen Shop und kein Backend.

## Anpassen

Alles Wichtige steht in **`js/config.js`**:

| Was | Wo |
|---|---|
| PayPal.me-Link | `paypalMe` – ohne Betrag, z. B. `https://paypal.me/ulmermalzkreis` |
| Preis, Versand, Größen, Farben, Bestellschluss, Produktions- und Liefertermin | `shirt` |
| E-Mail für Bestellungen & Kontakt | `stammtisch.email` |
| Kennzahlen (Mitglieder, Gründung, Bier) | `stammtisch` |

Weitere Stellen, die noch ausgefüllt werden sollten (mit `TODO` markiert):

- **Shirt-Fotos**: Aktuell zeigt die Seite eine SVG-Vorschau des Shirts, die automatisch die
  Farbe wechselt. Für echte Fotos in `index.html` die beiden `<div class="shirt-photo …">`
  durch `<img src="assets/shirt-front.jpg">` bzw. `shirt-back.jpg` ersetzen.
- **Logo**: Das Wortmarken-Logo kann in `.brand` gegen `<img src="assets/logo.svg">` getauscht werden.

## Wie kommen die Bestellungen an?

`orderMode` in `config.js`:

- **`mailto`** (Standard): Beim Absenden öffnet sich beim Besteller das Mailprogramm mit einer
  fertigen Bestellmail an `stammtisch.email`. Funktioniert überall, braucht kein Setup.
- **`webhook`**: Die Bestellung wird als JSON an `orderWebhook` gesendet. Passt für Make.com,
  n8n, Zapier oder Formspree. Damit lassen sich Bestellungen z. B. automatisch in ein Google Sheet
  schreiben.
- **`netlify`**: Wenn die Seite auf Netlify liegt, landen die Bestellungen in Netlify Forms.
  Das Formular ist dafür bereits vorbereitet (`data-netlify="true"`).

Nach dem Absenden bekommt der Besteller den PayPal-Link mit dem exakten Betrag
(`paypal.me/NAME/25.00EUR`) sowie einen Verwendungszweck zum Kopieren.

## Hosting: Cloudflare Workers unter malzkreis.de

Die Seite läuft als Cloudflare Worker mit Static Assets.

| Datei | Zweck |
|---|---|
| `wrangler.jsonc` | Worker-Konfiguration, Custom Domains `malzkreis.de` und `www.malzkreis.de` |
| `src/worker.js` | Leitet `www` auf die Hauptdomain um, setzt Sicherheits- und Cache-Header |
| `scripts/build.mjs` | Kopiert die Seite nach `dist/` und setzt den Cache-Buster (`?v=dev` → Commit-SHA) |

`wrangler deploy` baut automatisch vorher (`"build"` in `wrangler.jsonc`).

### Einmalige Einrichtung

1. **Domain in Cloudflare aufnehmen**: Im Cloudflare-Dashboard *Domain hinzufügen* → `malzkreis.de`,
   Free-Plan wählen. Cloudflare zeigt zwei Nameserver an.
2. **Nameserver beim Registrar umstellen** auf die beiden Cloudflare-Nameserver. Sobald die Zone
   in Cloudflare als *aktiv* angezeigt wird, kann es weitergehen (meist Minuten, selten bis 24 h).
   Vorhandene DNS-Einträge für `malzkreis.de` und `www` vorher löschen, sonst kann Cloudflare die
   Custom Domains nicht anlegen. E-Mail-Einträge (MX) bleiben stehen.
3. **Repo verbinden**: *Workers & Pages* → *Erstellen* → *Repository importieren* →
   `jonas-liquify/malzkreis-shirts`. Einstellungen:
   - Projektname: `malzkreis-shirts`
   - Build-Befehl: leer lassen
   - Deploy-Befehl: `npx wrangler deploy` (Standard)
   - Produktions-Branch: `main`
4. Der erste Build deployt den Worker und legt DNS-Einträge und SSL-Zertifikate für
   `malzkreis.de` und `www.malzkreis.de` automatisch an.

Ab dann deployt jeder Push auf `main` automatisch. Vor der DNS-Umstellung ist der Worker unter
`https://malzkreis-shirts.<account>.workers.dev` erreichbar.

### Lokal entwickeln

```bash
npm install
npm run dev      # Worker lokal unter http://localhost:8787
npm run check    # Probe-Deploy ohne Upload
```

### Übergang von GitHub Pages

Bis die Domain umgezogen ist, veröffentlicht `.github/workflows/pages.yml` die Seite weiterhin unter
https://jonas-liquify.github.io/malzkreis-shirts/. Sobald `malzkreis.de` läuft, kann der Workflow
gelöscht und GitHub Pages unter *Settings → Pages* deaktiviert werden.
