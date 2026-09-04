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

Reine statische Seite (HTML, CSS, JS). Einfach den Ordner auf GitHub Pages, Netlify, Vercel oder
einen beliebigen Webspace legen. Lokal testen:

```bash
python3 -m http.server 8080
# → http://localhost:8080
```
