/*
 * ============================================================
 *  ULMER MALZKREIS SHIRT-SHOP – KONFIGURATION
 *  Hier alle Texte, Preise, Größen und Links anpassen.
 *  index.html und main.js müssen dafür nicht angefasst werden.
 * ============================================================
 */
window.SHOP_CONFIG = {
  // --- Stammtisch -------------------------------------------
  stammtisch: {
    name: "Ulmer Malzkreis",
    ort: "Ulm",
    gruendung: 2024,
    mitglieder: "11,5",
    bierverbrauch: "692 l",
    email: "kasse@malzkreis.de",                 // TODO: echte Adresse (Bestellmails & Kontakt)
    sommerfestUrl: "https://sommerfest-malzkreis.webflow.io/",
  },

  // --- PayPal -------------------------------------------------
  // PayPal.me-Link OHNE Betrag, z. B. "https://paypal.me/ulmermalzkreis"
  // Der Betrag wird automatisch angehängt (…/25EUR).
  paypalMe: "https://paypal.me/DEINNAME",        // TODO: echten PayPal.me-Link eintragen

  // --- Shirt --------------------------------------------------
  shirt: {
    name: "Dear Barcelona – das Malzkreis-Shirt",
    preis: 25,                 // Euro pro Shirt
    versand: 4.9,              // Euro Versandpauschale (0 = kein Versand anbieten)
    material: "Oversize-Schnitt, schwere Bio-Baumwolle, Siebdruck",
    groessen: ["S", "M", "L", "XL", "XXL"],
    farben: [
      // hex = Shirtfarbe, print = Druckfarbe (für die SVG-Vorschau).
      // Bei nur einer Farbe wird die Farbauswahl automatisch ausgeblendet.
      { name: "Creme", hex: "#ece3d0", print: "#1b6b3d" },
    ],
    // Echte Mockup-Fotos: einfach unter diesen Pfaden ablegen, die Seite tauscht die
    // SVG-Vorschau dann automatisch gegen die Fotos aus.
    fotos: { front: "assets/shirt-front.jpg", back: "assets/shirt-back.jpg" },
    bestellschluss: "2026-10-15",   // ISO-Datum; leer lassen für "offen"
  },

  // --- Bestell-Übermittlung ----------------------------------
  // "mailto"  : öffnet das Mailprogramm des Bestellers mit fertiger Bestellmail (funktioniert überall, kein Setup)
  // "webhook" : schickt die Bestellung als JSON an orderWebhook (Make.com, n8n, Formspree, Zapier …)
  // "netlify" : nutzt Netlify Forms (nur wenn die Seite auf Netlify gehostet ist)
  orderMode: "mailto",
  orderWebhook: "",   // z. B. "https://hook.eu1.make.com/xxxxxxxx" oder "https://formspree.io/f/xxxx"
};
