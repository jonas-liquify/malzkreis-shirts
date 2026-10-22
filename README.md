# Ulmer Malzkreis – Website & Malzkreis Collection

Website des Ulmer Malzkreis mit kleinem Shop für eigene Shirt-Designs.

| Seite | Datei | Inhalt |
|---|---|---|
| `/` | `index.html` | Startseite: Über uns, Was wir machen, Collection-Teaser, Kontakt |
| `/shop/` | `shop/index.html` | Malzkreis Collection: alle Produkte als Karten |
| `/shop/dear-barcelona/` | `shop/dear-barcelona/index.html` | Produktseite mit Bestellformular und PayPal-Link |

## Anpassen

Alles Wichtige steht in **`js/config.js`**:

| Was | Wo |
|---|---|
| Produkte im Shop (Name, Bild, Link, Status) | `produkte` |
| Preis, Größen, Bestellschluss, Produktion des aktuellen Shirts | `shirt` |
| PayPal.me-Link | `paypalMe` |
| E-Mail für Bestellungen & Kontakt, Kennzahlen | `stammtisch` |
| Übermittlung der Bestellungen | `orderMode`, `orderWebhook` |

### Neues Produkt hinzufügen

1. Fotos nach `assets/` legen.
2. In `js/config.js` einen Eintrag unter `produkte` ergänzen (mit eigenem `preis`).
3. Für die Produktseite `shop/dear-barcelona/` als Vorlage nach `shop/<neuer-slug>/` kopieren.
   Bestellformular und Texte sind aktuell noch auf ein Shirt (`shirt` in der Config) zugeschnitten;
   bei mehreren gleichzeitig bestellbaren Produkten sollte die Bestelllogik auf Produkt-IDs umgestellt werden.

## Bestellungen

`orderMode` in `config.js`:

- **`mailto`** (Standard): Beim Absenden öffnet sich beim Besteller das Mailprogramm mit einer
  fertigen Bestellmail an `stammtisch.email`.
- **`webhook`**: Die Bestellung wird als JSON an `orderWebhook` gesendet (Make.com, n8n, Formspree …).

Nach dem Absenden bekommt der Besteller den PayPal-Link mit dem exakten Betrag sowie einen
Verwendungszweck zum Kopieren.

## Hosting: Cloudflare Workers unter malzkreis.de

Die Seite läuft als Cloudflare Worker mit Static Assets.

| Datei | Zweck |
|---|---|
| `wrangler.jsonc` | Worker-Konfiguration, Custom Domains `malzkreis.de` und `www.malzkreis.de` |
| `src/worker.js` | Leitet `www` auf die Hauptdomain um, setzt Sicherheits- und Cache-Header |
| `scripts/build.mjs` | Kopiert Startseite, Shop und Dateien nach `dist/` und setzt in allen Seiten den Cache-Buster (`?v=dev` → Commit-SHA) |

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
