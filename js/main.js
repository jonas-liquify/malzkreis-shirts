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
  const esc = (str) => String(str).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  const bind = (key, value, attr) =>
    $$(`[data-bind="${key}"]`).forEach((el) => (attr ? el.setAttribute(attr, value) : (el.textContent = value)));

  const singleColor = C.shirt.farben.length === 1;
  let currentColor = 0;

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

    bind("produktion", s.produktion || "November");
    bind("lieferung", s.lieferung || "nach der Produktion");
    if (s.bestellschluss) {
      bind("bestellschluss", fmtDate(s.bestellschluss));
      const kurz = new Date(s.bestellschluss + "T12:00:00").toLocaleDateString("de-DE", { day: "numeric", month: "long" });
      bind("tag-bestellschluss", `Vorbestellung bis ${kurz} · Produktion im ${(s.produktion || "November").replace(/\s*\d{4}$/, "")}`);
    } else {
      bind("bestellschluss", "Bestellschluss (wird noch bekannt gegeben)");
      bind("tag-bestellschluss", `Vorbestellung · Produktion im ${s.produktion || "November"}`);
    }

    if (!(s.versand > 0)) $("#lieferung-fieldset").hidden = true; // kein Versand → Übergabe wird persönlich geklärt

    // Farb-Chips in der Shirt-Sektion
    $("#shirt-colors").innerHTML = s.farben
      .map((f) => `<span class="color-chip"><i style="background:${f.hex}"></i>${esc(f.name)}</span>`)
      .join("");
    $("#shirt-colors").hidden = singleColor;

    // Swatches im Hero (nur bei mehreren Farben)
    const sw = $("#hero-swatches");
    sw.hidden = singleColor;
    sw.innerHTML = s.farben
      .map((f, i) => `<button type="button" class="swatch" style="background:${f.hex}" title="${esc(f.name)}" aria-label="${esc(f.name)}" aria-pressed="${i === 0}" data-index="${i}"></button>`)
      .join("");
    sw.addEventListener("click", (e) => {
      const b = e.target.closest(".swatch");
      if (b) setShirtColor(+b.dataset.index);
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

    loadPhotos();
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
  }

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
        stage.classList.add("has-photo");
        if (stage.dataset.side === side) {
          stage.innerHTML = `<img src="${fotos[side]}" alt="Shirt ${side === "back" ? "Rückseite" : "Vorderseite"}">`;
        }
        $("#hero-swatches").hidden = true; // Fotos zeigen die echte Farbe
      };
      img.src = fotos[side];
    });
  }

  /* ---------- Positionen (mehrere Größen) ---------- */
  const positions = $("#positions");
  const tpl = $("#position-template");

  function addPosition(preset = {}) {
    const node = tpl.content.firstElementChild.cloneNode(true);
    const sizeSel = $('select[name="groesse[]"]', node);
    sizeSel.innerHTML = '<option value="" disabled selected>Bitte wählen</option>' +
      C.shirt.groessen.map((g) => `<option value="${esc(g)}">${esc(g)}</option>`).join("");
    if (preset.groesse) sizeSel.value = preset.groesse;

    const colorWrap = $(".position-color", node);
    const colorSel = $('select[name="farbe[]"]', node);
    colorSel.innerHTML = C.shirt.farben.map((f) => `<option value="${esc(f.name)}">${esc(f.name)}</option>`).join("");
    if (singleColor) {
      colorWrap.hidden = true;
    } else {
      colorSel.required = true;
      colorSel.insertAdjacentHTML("afterbegin", '<option value="" disabled selected>Bitte wählen</option>');
    }
    if (preset.farbe) colorSel.value = preset.farbe;
    if (preset.anzahl) $('input[name="anzahl[]"]', node).value = preset.anzahl;

    positions.appendChild(node);
    updateSummary();
    return node;
  }

  positions.classList.toggle("single-color", singleColor);

  positions.addEventListener("click", (e) => {
    const rm = e.target.closest(".remove-position");
    if (rm) {
      if (positions.children.length > 1) rm.closest(".position").remove();
      updateSummary();
      return;
    }
    const step = e.target.closest(".qty-btn");
    if (step) {
      const input = $("input", step.parentElement);
      const v = Math.max(1, Math.min(20, (parseInt(input.value, 10) || 1) + +step.dataset.step));
      input.value = v;
      updateSummary();
    }
  });

  positions.addEventListener("change", (e) => {
    // Hero-Shirt in der gewählten Farbe zeigen
    if (e.target.name === "farbe[]") {
      const idx = C.shirt.farben.findIndex((f) => f.name === e.target.value);
      if (idx >= 0) setShirtColor(idx);
    }
  });

  $("#add-position").addEventListener("click", () => {
    const node = addPosition();
    $("select", node).focus();
  });

  /* ---------- Formular ---------- */
  const form = $("#order-form");
  const success = $("#order-success");
  const errBox = $("#form-error");

  function readOrder() {
    const fd = new FormData(form);
    const items = $$(".position", positions).map((row) => ({
      groesse: $('select[name="groesse[]"]', row).value,
      farbe: singleColor ? C.shirt.farben[0].name : $('select[name="farbe[]"]', row).value,
      anzahl: Math.max(1, Math.min(20, parseInt($('input[name="anzahl[]"]', row).value, 10) || 1)),
      row,
    }));
    const anzahl = items.reduce((n, it) => n + it.anzahl, 0);
    const versand = fd.get("lieferung") === "versand" && C.shirt.versand > 0;
    const shirts = anzahl * C.shirt.preis;
    const total = shirts + (versand ? C.shirt.versand : 0);
    return {
      name: (fd.get("name") || "").trim(),
      email: (fd.get("email") || "").trim(),
      items, anzahl,
      lieferung: versand ? "Versand" : "Persönliche Übergabe (wird abgesprochen)",
      adresse: versand ? (fd.get("adresse") || "").trim() : "",
      bemerkung: (fd.get("bemerkung") || "").trim(),
      shirts, versand: versand ? C.shirt.versand : 0, total,
    };
  }

  const itemLabel = (it) => `${it.anzahl} × ${it.groesse || "?"}${singleColor ? "" : ", " + (it.farbe || "?")}`;
  const itemsShort = (o) => o.items.map((it) => `${it.anzahl}x ${it.groesse}${singleColor ? "" : " " + it.farbe}`).join(", ");

  function updateSummary() {
    const o = readOrder();
    $("#sum-lines").innerHTML = o.items
      .map((it) => {
        const label = it.groesse ? `${itemLabel(it)} Shirt` : `${it.anzahl} × Shirt <span class="text-muted">(Größe wählen)</span>`;
        return `<div class="summary-line"><span>${it.groesse ? esc(label) : label}</span><span>${fmtEur(it.anzahl * C.shirt.preis)}</span></div>`;
      })
      .join("");
    bind("sum-versand", fmtEur(o.versand));
    bind("sum-total", fmtEur(o.total));
    $("#sum-versand-row").hidden = !o.versand;
    $("#adresse-field").hidden = !o.versand;
    $("#adresse").required = !!o.versand;
    $("#positionen-hidden").value = itemsShort(o);
  }

  function validate(o) {
    const problems = [];
    $$(".is-invalid", form).forEach((el) => el.classList.remove("is-invalid"));
    const mark = (el) => el && el.classList.add("is-invalid");
    if (!o.name) { problems.push("Bitte gib deinen Namen an."); mark($("#name")); }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(o.email)) { problems.push("Bitte gib eine gültige E-Mail-Adresse an."); mark($("#email")); }
    let missingSize = false, missingColor = false;
    o.items.forEach((it) => {
      if (!it.groesse) { missingSize = true; mark($('select[name="groesse[]"]', it.row)); }
      if (!singleColor && !it.farbe) { missingColor = true; mark($('select[name="farbe[]"]', it.row)); }
    });
    if (missingSize) problems.push(o.items.length > 1 ? "Bitte wähle für jede Position eine Größe." : "Bitte wähle eine Größe.");
    if (missingColor) problems.push("Bitte wähle für jede Position eine Farbe.");
    if (o.lieferung === "Versand" && o.adresse.length < 8) { problems.push("Bitte gib eine Lieferadresse an."); mark($("#adresse")); }
    if (!$("#einverstaendnis").checked) problems.push("Bitte bestätige den Hinweis zur Vorbestellung.");
    if (form.elements.website.value) problems.push("Spam-Schutz ausgelöst."); // Honeypot
    return problems;
  }

  const verwendungszweck = (o) => `Shirt ${itemsShort(o)} – ${o.name}`;

  function orderText(o) {
    return [
      `Neue Shirt-Vorbestellung – ${C.stammtisch.name}`,
      ``,
      `Name:       ${o.name}`,
      `E-Mail:     ${o.email}`,
      `Shirt:      ${C.shirt.name}`,
      ``,
      `Positionen:`,
      ...o.items.map((it) => `  - ${itemLabel(it)}`),
      `  = ${o.anzahl} Shirt${o.anzahl === 1 ? "" : "s"} gesamt`,
      ``,
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

  function paypalUrl(o) {
    const base = (C.paypalMe || "").replace(/\/+$/, "");
    return `${base}/${o.total.toFixed(2)}EUR`;
  }

  async function submitOrder(o) {
    const mode = C.orderMode;
    const payload = {
      name: o.name, email: o.email, shirt: C.shirt.name,
      positionen: o.items.map(({ groesse, farbe, anzahl }) => ({ groesse, farbe, anzahl })),
      positionenText: itemsShort(o), anzahl: o.anzahl,
      lieferung: o.lieferung, adresse: o.adresse, bemerkung: o.bemerkung,
      shirts: o.shirts, versand: o.versand, gesamt: o.total,
      verwendungszweck: verwendungszweck(o), zeitpunkt: new Date().toISOString(),
    };
    if (mode === "webhook" && C.orderWebhook) {
      const res = await fetch(C.orderWebhook, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(payload),
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
    const subject = `Shirt-Vorbestellung: ${itemsShort(o)} – ${o.name}`;
    window.location.href = `mailto:${encodeURIComponent(C.stammtisch.email)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(orderText(o))}`;
    return "mailto";
  }

  const versandLabel = (o) => (o.versand ? "Versand" : "klären wir persönlich mit dir");

  function showSuccess(o, mode) {
    bind("success-name", o.name.split(" ")[0] || "du");
    bind("success-total", fmtEur(o.total));
    $("#success-summary").innerHTML = [
      ...o.items.map((it, i) => [i === 0 ? "Shirts" : "", itemLabel(it)]),
      ["Übergabe", versandLabel(o)],
      o.adresse ? ["Adresse", o.adresse.replace(/\n/g, ", ")] : null,
      ["Gesamt", `<strong>${fmtEur(o.total)}</strong>`],
    ].filter(Boolean).map(([k, v]) => `<div><span>${esc(k)}</span><span>${k === "Gesamt" ? v : esc(v)}</span></div>`).join("");
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
      errBox.innerHTML = problems.map((p) => `<div>${esc(p)}</div>`).join("");
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
    try {
      await navigator.clipboard.writeText($("#verwendungszweck").textContent);
      e.target.textContent = "Kopiert ✓";
      setTimeout(() => (e.target.textContent = "Kopieren"), 1800);
    } catch { /* Clipboard nicht verfügbar */ }
  });

  $("#order-again").addEventListener("click", () => {
    form.reset();
    positions.innerHTML = "";
    addPosition();
    success.hidden = true;
    form.hidden = false;
    updateSummary();
    form.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  /* ---------- Spenden ---------- */
  (function initDonate() {
    const wrap = $("#donate-amounts"), link = $("#donate-link"), custom = $("#donate-custom");
    if (!wrap || !link) return;
    const cfg = C.spende || { betraege: [5, 10, 20, 50] };
    const base = (C.paypalMe || "").replace(/\/+$/, "");
    bind("spende-vz", cfg.verwendungszweck || "Spende");
    let amount = cfg.betraege[1] || cfg.betraege[0];
    const render = () => {
      $$(".amount", wrap).forEach((b) => b.setAttribute("aria-pressed", String(+b.dataset.amount === amount && !custom.value)));
      const a = custom.value ? Math.max(1, Math.min(5000, parseInt(custom.value, 10) || 0)) : amount;
      link.href = a ? `${base}/${a}EUR` : base;
      $("#donate-link-text").textContent = a ? `${fmtEur(a).replace(",00", "")} per PayPal spenden` : "Per PayPal spenden";
    };
    wrap.innerHTML = cfg.betraege.map((n) => `<button type="button" class="amount" data-amount="${n}">${n} €</button>`).join("");
    wrap.addEventListener("click", (e) => {
      const b = e.target.closest(".amount");
      if (!b) return;
      amount = +b.dataset.amount; custom.value = ""; render();
    });
    custom.addEventListener("input", render);
    render();
  })();

  applyConfig();
  addPosition();
})();
