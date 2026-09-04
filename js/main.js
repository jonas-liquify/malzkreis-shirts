/* Ulmer Malzkreis – Shirt-Shop Logik. Konfiguration in js/config.js. */
(function () {
  "use strict";
  const C = window.SHOP_CONFIG;
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  const fmtEur = (n) =>
    new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(n);
  const fmtDate = (iso) =>
    iso ? new Date(iso + "T12:00:00").toLocaleDateString("de-DE", { day: "2-digit", month: "long", year: "numeric" }) : "";

  const bind = (key, value, attr) =>
    $$(`[data-bind="${key}"]`).forEach((el) => (attr ? el.setAttribute(attr, value) : (el.textContent = value)));

  /* ---------- Statische Texte aus der Config ---------- */
  function applyConfig() {
    const s = C.shirt, st = C.stammtisch;
    bind("shirt-name", s.name);
    bind("preis", fmtEur(s.preis).replace(",00", ""));
    bind("preis-kurz", fmtEur(s.preis).replace(",00", ""));
    bind("versand", fmtEur(s.versand));
    bind("versand-note", s.versand > 0 ? `, zzgl. ${fmtEur(s.versand)} bei Versand` : "");
    bind("material", s.material);
    bind("groessen-liste", `${s.groessen[0]} – ${s.groessen[s.groessen.length - 1]}`);
    bind("farben-anzahl", String(s.farben.length));
    bind("mitglieder", st.mitglieder);
    bind("gruendung", String(st.gruendung));
    bind("bierverbrauch", st.bierverbrauch);
    bind("sommerfest-link", st.sommerfestUrl, "href");
    $$('[data-bind="email-link"]').forEach((a) => {
      a.href = `mailto:${st.email}`;
      if (a.textContent.trim() === "unsere Kassen-Adresse") a.textContent = st.email;
    });

    if (s.bestellschluss) {
      bind("bestellschluss", fmtDate(s.bestellschluss));
      bind("tag-bestellschluss", `Bestellbar bis ${fmtDate(s.bestellschluss)}`);
    } else {
      bind("bestellschluss", "Bestellschluss (wird noch bekannt gegeben)");
    }

    if (!(s.versand > 0)) $("#versand-option").hidden = true;

    // Selects füllen
    const sizeSel = $("#groesse");
    sizeSel.innerHTML = '<option value="" disabled selected>Bitte wählen</option>' +
      s.groessen.map((g) => `<option value="${g}">${g}</option>`).join("");
    const colorSel = $("#farbe");
    colorSel.innerHTML = '<option value="" disabled selected>Bitte wählen</option>' +
      s.farben.map((f) => `<option value="${f.name}">${f.name}</option>`).join("");

    // Farb-Chips in der Shirt-Sektion
    $("#shirt-colors").innerHTML = s.farben
      .map((f) => `<span class="color-chip"><i style="background:${f.hex}"></i>${f.name}</span>`)
      .join("");

    // Swatches im Hero (nur bei mehreren Farben)
    const sw = $("#hero-swatches");
    const single = s.farben.length === 1;
    sw.hidden = single;
    $("#shirt-colors").hidden = single;
    if (single) {
      // Farbfeld ausblenden und automatisch setzen
      $("#farbe-field").hidden = true;
      colorSel.required = false;
      colorSel.value = s.farben[0].name;
      $("#variant-row").classList.remove("form-row-3");
    }
    sw.innerHTML = s.farben
      .map((f, i) => `<button type="button" class="swatch" style="background:${f.hex}" title="${f.name}" aria-label="${f.name}" aria-pressed="${i === 0}" data-index="${i}"></button>`)
      .join("");
    sw.addEventListener("click", (e) => {
      const b = e.target.closest(".swatch");
      if (!b) return;
      setShirtColor(+b.dataset.index);
    });

    // SVG-Shirts rendern
    $$(".shirt-stage, .shirt-photo-placeholder").forEach((el) => {
      el.innerHTML = window.shirtSVG(el.dataset.side || "front");
    });
    setShirtColor(0);

    // Vorne/Hinten-Umschalter im Hero
    $$(".shirt-side-toggle button").forEach((btn) =>
      btn.addEventListener("click", () => {
        const side = btn.dataset.side;
        const stage = $("#hero-shirt");
        stage.dataset.side = side;
        if (stage.dataset.photo) {
          stage.innerHTML = `<img src="${s.fotos[side]}" alt="Shirt ${side === "back" ? "Rückseite" : "Vorderseite"}">`;
        } else {
          stage.innerHTML = window.shirtSVG(side);
          setShirtColor(currentColor);
        }
        $$(".shirt-side-toggle button").forEach((b) => b.setAttribute("aria-pressed", String(b === btn)));
      })
    );

    // Echte Fotos einbinden, falls vorhanden
    loadPhotos();
  }

  let currentColor = 0;

  function loadPhotos() {
    const fotos = C.shirt.fotos || {};
    ["front", "back"].forEach((side) => {
      if (!fotos[side]) return;
      const img = new Image();
      img.onload = () => {
        $$(`.shirt-photo-placeholder[data-side="${side}"]`).forEach((el) => {
          el.classList.remove("shirt-photo-placeholder");
          el.innerHTML = `<img src="${fotos[side]}" alt="Shirt ${side === "back" ? "Rückseite" : "Vorderseite"}">`;
        });
        const stage = $("#hero-shirt");
        stage.dataset.photo = "1";
        if (stage.dataset.side === side) {
          stage.innerHTML = `<img src="${fotos[side]}" alt="Shirt ${side === "back" ? "Rückseite" : "Vorderseite"}">`;
          stage.classList.add("has-photo");
        }
        $("#hero-swatches").hidden = true; // Fotos zeigen die echte Farbe
      };
      img.src = fotos[side];
    });
  }

  function setShirtColor(i) {
    const f = C.shirt.farben[i];
    if (!f) return;
    currentColor = i;
    $$(".shirt-stage, .shirt-photo-placeholder").forEach((el) => {
      el.style.setProperty("--shirt", f.hex);
      el.style.setProperty("--print", f.print);
    });
    $$("#hero-swatches .swatch").forEach((b) => b.setAttribute("aria-pressed", String(+b.dataset.index === i)));
    const sel = $("#farbe");
    if (sel && !sel.value) sel.value = f.name; // Vorbelegen, falls noch nichts gewählt
    if (sel && sel.value !== f.name) sel.value = f.name;
  }

  /* ---------- Formular ---------- */
  const form = $("#order-form");
  const success = $("#order-success");
  const errBox = $("#form-error");

  function readOrder() {
    const fd = new FormData(form);
    const anzahl = Math.max(1, Math.min(20, parseInt(fd.get("anzahl"), 10) || 1));
    const versand = fd.get("lieferung") === "versand" && C.shirt.versand > 0;
    const shirts = anzahl * C.shirt.preis;
    const total = shirts + (versand ? C.shirt.versand : 0);
    return {
      name: (fd.get("name") || "").trim(),
      email: (fd.get("email") || "").trim(),
      groesse: fd.get("groesse") || "",
      farbe: fd.get("farbe") || "",
      anzahl,
      lieferung: versand ? "Versand" : "Abholung am Stammtisch",
      adresse: versand ? (fd.get("adresse") || "").trim() : "",
      bemerkung: (fd.get("bemerkung") || "").trim(),
      shirts, versand: versand ? C.shirt.versand : 0, total,
    };
  }

  function updateSummary() {
    const o = readOrder();
    bind("sum-anzahl", String(o.anzahl));
    bind("sum-shirts", fmtEur(o.shirts));
    bind("sum-versand", fmtEur(o.versand));
    bind("sum-total", fmtEur(o.total));
    $("#sum-versand-row").hidden = !o.versand;
    const adr = $("#adresse-field");
    adr.hidden = !o.versand;
    $("#adresse").required = !!o.versand;
    // Farb-Swatch im Hero mitziehen
    const idx = C.shirt.farben.findIndex((f) => f.name === o.farbe);
    if (idx >= 0) {
      $$(".shirt-stage, .shirt-photo-placeholder").forEach((el) => {
        el.style.setProperty("--shirt", C.shirt.farben[idx].hex);
        el.style.setProperty("--print", C.shirt.farben[idx].print);
      });
      $$("#hero-swatches .swatch").forEach((b) => b.setAttribute("aria-pressed", String(+b.dataset.index === idx)));
    }
  }

  function validate(o) {
    const problems = [];
    $$(".is-invalid", form).forEach((el) => el.classList.remove("is-invalid"));
    const mark = (id) => $(id).classList.add("is-invalid");
    if (!o.name) { problems.push("Bitte gib deinen Namen an."); mark("#name"); }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(o.email)) { problems.push("Bitte gib eine gültige E-Mail-Adresse an."); mark("#email"); }
    if (!o.groesse) { problems.push("Bitte wähle eine Größe."); mark("#groesse"); }
    if (!o.farbe) { problems.push("Bitte wähle eine Farbe."); mark("#farbe"); }
    if (o.lieferung === "Versand" && o.adresse.length < 8) { problems.push("Bitte gib eine Lieferadresse an."); mark("#adresse"); }
    if (!$("#einverstaendnis").checked) problems.push("Bitte bestätige den Hinweis zur Bestellung.");
    if (form.elements.website.value) problems.push("Spam-Schutz ausgelöst."); // Honeypot
    return problems;
  }

  function orderText(o) {
    return [
      `Neue Shirt-Bestellung – ${C.stammtisch.name}`,
      ``,
      `Name:       ${o.name}`,
      `E-Mail:     ${o.email}`,
      `Shirt:      ${C.shirt.name}`,
      `Größe:      ${o.groesse}`,
      `Farbe:      ${o.farbe}`,
      `Anzahl:     ${o.anzahl}`,
      `Lieferung:  ${o.lieferung}`,
      o.adresse ? `Adresse:    ${o.adresse.replace(/\n/g, ", ")}` : null,
      o.bemerkung ? `Bemerkung:  ${o.bemerkung}` : null,
      ``,
      `Shirts:     ${fmtEur(o.shirts)}`,
      o.versand ? `Versand:    ${fmtEur(o.versand)}` : null,
      `GESAMT:     ${fmtEur(o.total)}`,
      ``,
      `Zahlung per PayPal (Freunde & Familie), Verwendungszweck: ${verwendungszweck(o)}`,
    ].filter((l) => l !== null).join("\n");
  }

  const verwendungszweck = (o) => `Shirt ${o.anzahl}x ${o.groesse} ${o.farbe} – ${o.name}`;

  function paypalUrl(o) {
    const base = (C.paypalMe || "").replace(/\/+$/, "");
    const amount = o.total.toFixed(2);
    return `${base}/${amount}EUR`;
  }

  async function submitOrder(o) {
    const mode = C.orderMode;
    if (mode === "webhook" && C.orderWebhook) {
      const res = await fetch(C.orderWebhook, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ ...o, shirt: C.shirt.name, verwendungszweck: verwendungszweck(o), zeitpunkt: new Date().toISOString() }),
      });
      if (!res.ok) throw new Error(`Webhook antwortete mit ${res.status}`);
      return "webhook";
    }
    if (mode === "netlify") {
      const body = new URLSearchParams(new FormData(form));
      body.set("gesamt", o.total.toFixed(2));
      const res = await fetch("/", { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body });
      if (!res.ok) throw new Error(`Netlify antwortete mit ${res.status}`);
      return "netlify";
    }
    // Fallback: mailto
    const subject = `Shirt-Bestellung: ${o.anzahl}x ${o.groesse} ${o.farbe} – ${o.name}`;
    const href = `mailto:${encodeURIComponent(C.stammtisch.email)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(orderText(o))}`;
    window.location.href = href;
    return "mailto";
  }

  function showSuccess(o, mode) {
    bind("success-name", o.name.split(" ")[0] || "du");
    bind("success-total", fmtEur(o.total));
    $("#success-summary").innerHTML = [
      ["Shirt", `${o.anzahl} × ${o.groesse}, ${o.farbe}`],
      ["Lieferung", o.lieferung],
      o.adresse ? ["Adresse", o.adresse.replace(/\n/g, ", ")] : null,
      ["Gesamt", `<strong>${fmtEur(o.total)}</strong>`],
    ].filter(Boolean).map(([k, v]) => `<div><span>${k}</span><span>${v}</span></div>`).join("");
    $("#paypal-link").href = paypalUrl(o);
    $("#verwendungszweck").textContent = verwendungszweck(o);
    $("#mailto-hint").hidden = mode !== "mailto";
    form.hidden = true;
    success.hidden = false;
    success.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  form.addEventListener("input", updateSummary);
  form.addEventListener("change", updateSummary);

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const o = readOrder();
    const problems = validate(o);
    if (problems.length) {
      errBox.innerHTML = problems.map((p) => `<div>${p}</div>`).join("");
      errBox.hidden = false;
      errBox.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    errBox.hidden = true;
    const btn = $("#submit-btn");
    btn.disabled = true;
    const label = btn.textContent;
    btn.textContent = "Wird gesendet …";
    try {
      const mode = await submitOrder(o);
      showSuccess(o, mode);
    } catch (err) {
      console.error(err);
      errBox.textContent = "Das hat leider nicht geklappt. Bitte versuch es noch einmal oder schreib uns direkt an " + C.stammtisch.email + ".";
      errBox.hidden = false;
    } finally {
      btn.disabled = false;
      btn.textContent = label;
    }
  });

  $("#copy-vz").addEventListener("click", async (e) => {
    const txt = $("#verwendungszweck").textContent;
    try {
      await navigator.clipboard.writeText(txt);
      e.target.textContent = "Kopiert ✓";
      setTimeout(() => (e.target.textContent = "Kopieren"), 1800);
    } catch { /* Clipboard nicht verfügbar */ }
  });

  $("#order-again").addEventListener("click", () => {
    form.reset();
    success.hidden = true;
    form.hidden = false;
    updateSummary();
    form.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  applyConfig();
  if (C.shirt.farben.length > 1) $("#farbe").value = ""; // Farbe erst wählen lassen
  updateSummary();
})();
