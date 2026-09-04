# Ulmer Malzkreis – Shirt-Shop

One-Pager, über den der Stammtisch sein Shirt bewirbt und Bestellungen entgegennimmt.
Bezahlt wird per **PayPal Freunde & Familie**, deshalb braucht die Seite keinen Shop und kein Backend.

## Anpassen

Alles Wichtige steht in **`js/config.js`**:

| Was | Wo |
|---|---|
| PayPal.me-Link | `paypalMe` – ohne Betrag, z. B. `https://paypal.me/ulmermalzkreis` |
| Preis, Versand, Größen, Farben, Bestellschluss | `shirt` |
| E-Mail für Bestellungen & Kontakt | `stammtisch.email` |
| Kennzahlen (Mitglieder, Gründung, Bier) | `stammtisch` |

Weitere Stellen, die noch ausgefüllt werden sollten (mit `TODO` markiert):

- **Shirt-Fotos**: Aktuell zeigt die Seite eine SVG-Vorschau des Shirts, die automatisch die
  Farbe wechselt. Für echte Fotos in `index.html` die beiden `<div class="shirt-photo …">`
  durch `<img src="assets/shirt-front.jpg">` bzw. `shirt-back.jpg` ersetzen.
- **Impressum** im Footer von `index.html`.
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

## Hosting

Die Seite wird automatisch per GitHub Pages veröffentlicht:

**https://jonas-liquify.github.io/malzkreis-shirts/**

Jeder Push auf `main` löst den Workflow `.github/workflows/pages.yml` aus, der die Seite neu
deployt (beim ersten Lauf wird GitHub Pages automatisch aktiviert). Eine eigene Domain ist nicht
nötig; falls doch, kann sie später unter *Settings → Pages* eingetragen werden.

Reine statische Seite (HTML, CSS, JS), läuft genauso auf Netlify, Vercel oder jedem Webspace.
Lokal testen:

```bash
python3 -m http.server 8080
# → http://localhost:8080
```
