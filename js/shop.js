/* Ulmer Malzkreis – Produktkarten der Malzkreis Collection (Startseite und /shop/) */
(function () {
  "use strict";
  const C = window.SHOP_CONFIG;
  const ROOT = document.documentElement.dataset.root || "";
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const eur = (n) => new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(n).replace(",00", "");
  const datum = (iso) => new Date(iso + "T12:00:00").toLocaleDateString("de-DE", { day: "numeric", month: "long" });

  function badge(p) {
    switch (p.status) {
      case "vorbestellung":
        return C.shirt.bestellschluss ? `Vorbestellung bis ${datum(C.shirt.bestellschluss)}` : "Vorbestellung";
      case "verfuegbar": return "Verfügbar";
      case "ausverkauft": return "Ausverkauft";
      case "demnaechst": return "Demnächst";
      default: return "";
    }
  }

  function card(p) {
    const preis = p.preis ?? C.shirt.preis;
    const hover = p.bildHover ? `<img class="product-img product-img-hover" src="${ROOT}${esc(p.bildHover)}" alt="" loading="lazy">` : "";
    const soldOut = p.status === "ausverkauft";
    return `
      <a class="product-card${soldOut ? " is-soldout" : ""}" href="${ROOT}${esc(p.url)}">
        <div class="product-media">
          <img class="product-img" src="${ROOT}${esc(p.bild)}" alt="${esc(p.name)}" loading="lazy">
          ${hover}
          <span class="product-badge">${esc(badge(p))}</span>
        </div>
        <div class="product-info">
          <div>
            <h3 class="product-name">${esc(p.name)}</h3>
            <p class="product-sub">${esc(p.untertitel || "")}</p>
          </div>
          <div class="product-price">${eur(preis)}</div>
        </div>
        <span class="product-cta">${soldOut ? "Ansehen" : p.status === "vorbestellung" ? "Jetzt vorbestellen" : "Zum Produkt"} <span aria-hidden="true">→</span></span>
      </a>`;
  }

  const placeholder = `
      <div class="product-card product-card-soon" aria-label="Nächstes Design in Arbeit">
        <div class="product-media">
          <svg class="soon-mark" aria-hidden="true"><use href="#muenster"/></svg>
          <span class="product-badge">In Arbeit</span>
        </div>
        <div class="product-info">
          <div>
            <h3 class="product-name">Nächstes Design</h3>
            <p class="product-sub">Wird gerade am Stammtisch ausgeheckt.</p>
          </div>
        </div>
      </div>`;

  document.querySelectorAll("[data-products]").forEach((el) => {
    const limit = parseInt(el.dataset.limit || "0", 10);
    let list = C.produkte || [];
    if (limit) list = list.slice(0, limit);
    el.innerHTML = list.map(card).join("") + (C.platzhalterKarte ? placeholder : "");
  });
})();

/* Gemeinsame Bindings für Startseite und Shop (Kennzahlen, Kontakt) */
(function () {
  "use strict";
  const C = window.SHOP_CONFIG, st = C.stammtisch;
  const set = (key, val) => document.querySelectorAll(`[data-bind="${key}"]`).forEach((el) => (el.textContent = val));
  set("mitglieder", st.mitglieder);
  set("gruendung", String(st.gruendung));
  set("bierverbrauch", st.bierverbrauch);
  set("preis-kurz", new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(C.shirt.preis).replace(",00", ""));
  document.querySelectorAll('[data-bind="email-link"]').forEach((a) => {
    a.href = `mailto:${st.email}`;
    if (a.dataset.showEmail !== undefined) a.textContent = st.email;
  });
  document.querySelectorAll('[data-bind="sommerfest-link"]').forEach((a) => (a.href = st.sommerfestUrl));
})();
