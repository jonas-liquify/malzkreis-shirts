/* Ulmer Malzkreis – UI-Effekte: Scroll-Reveal, Zähler, Sticky-Leiste, Siegel-Text */
(function () {
  "use strict";
  const C = window.SHOP_CONFIG;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $$ = (s) => Array.from(document.querySelectorAll(s));

  /* Headline-Schrift per URL testen: ?font=archivo | dela | rubikmono | archivoblack | shrikhand | fraunces | righteous */
  const FONTS = {
    archivo:      { css: "Archivo:wdth,wght@125,900", family: '"Archivo", "Archivo Black"', transform: "uppercase", weight: 900, tracking: "-.01em", scale: .92, stretch: "125%" },
    dela:         { css: "Dela+Gothic+One", family: '"Dela Gothic One"', transform: "uppercase", weight: 400, tracking: "0", scale: .88, stretch: "100%" },
    rubikmono:    { css: "Rubik+Mono+One", family: '"Rubik Mono One"', transform: "uppercase", weight: 400, tracking: "-.02em", scale: .82, stretch: "100%" },
    archivoblack: { css: "Archivo+Black", family: '"Archivo Black"', transform: "uppercase", weight: 400, tracking: "-.015em", scale: 1, stretch: "100%" },
    shrikhand:    { css: "Shrikhand", family: '"Shrikhand"', transform: "none", weight: 400, tracking: "0", scale: 1, stretch: "100%" },
    fraunces:     { css: "Fraunces:ital,opsz,wght,SOFT,WONK@1,9..144,900,100,1", family: '"Fraunces"', transform: "none", weight: 900, tracking: "-.01em", scale: 1.05, stretch: "100%", italic: true },
    righteous:    { css: "Righteous", family: '"Righteous"', transform: "none", weight: 400, tracking: "0", scale: 1.02, stretch: "100%" },
  };
  const want = new URLSearchParams(location.search).get("font");
  if (want && FONTS[want]) {
    const f = FONTS[want];
    const link = document.getElementById("display-font");
    if (link) link.href = `https://fonts.googleapis.com/css2?family=${f.css}&display=swap`;
    const r = document.documentElement.style;
    r.setProperty("--display", `${f.family}, "Poppins", system-ui, sans-serif`);
    r.setProperty("--display-transform", f.transform);
    r.setProperty("--display-weight", String(f.weight));
    r.setProperty("--display-tracking", f.tracking);
    r.setProperty("--display-scale", String(f.scale));
    r.setProperty("--display-stretch", f.stretch || "100%");
    if (f.italic) document.documentElement.classList.add("display-italic");
  }

  /* Siegel-Text und Kurzdatum aus der Config */
  const short = C.shirt.bestellschluss
    ? new Date(C.shirt.bestellschluss + "T12:00:00").toLocaleDateString("de-DE", { day: "2-digit", month: "short" }).replace(".", "").replace(/\s/, ". ")
    : "";
  $$('[data-bind="bestellschluss-kurz"]').forEach((el) => (el.textContent = short || "Bestellschluss"));
  const sealDate = C.shirt.bestellschluss
    ? new Date(C.shirt.bestellschluss + "T12:00:00").toLocaleDateString("de-DE", { day: "numeric", month: "long" })
    : "";
  $$('[data-bind="seal-text"]').forEach((el) => (el.textContent = `Vorbestellung · ${sealDate ? "bis " + sealDate : "jetzt"} · Ulmer Malzkreis · `));

  /* Scroll-Reveal */
  if ("IntersectionObserver" in window && !reduce) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add("in-view"); io.unobserve(e.target); }
      });
    }, { threshold: .12, rootMargin: "0px 0px -8% 0px" });
    $$(".reveal").forEach((el) => io.observe(el));
  } else {
    document.documentElement.classList.add("no-reveal");
  }

  /* Zähler für große Zahlen ("11,5", "692 l") */
  function countUp(el) {
    const raw = el.textContent.trim();
    const m = raw.match(/^([\d.,]+)(.*)$/);
    if (!m) return;
    const target = parseFloat(m[1].replace(".", "").replace(",", "."));
    const decimals = (m[1].split(",")[1] || "").length;
    const suffix = m[2];
    const dur = 1400, t0 = performance.now();
    const step = (t) => {
      const p = Math.min(1, (t - t0) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = (target * eased).toLocaleString("de-DE", { minimumFractionDigits: decimals, maximumFractionDigits: decimals }) + suffix;
      if (p < 1) requestAnimationFrame(step); else el.textContent = raw;
    };
    requestAnimationFrame(step);
  }
  if ("IntersectionObserver" in window && !reduce) {
    const io2 = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { countUp(e.target); io2.unobserve(e.target); } });
    }, { threshold: .5 });
    $$("[data-count]").forEach((el) => io2.observe(el));
  }

  /* Mobile Sticky-Leiste: sichtbar nach dem Hero, versteckt im Bestellbereich */
  const bar = document.getElementById("sticky-cta");
  const hero = document.querySelector(".hero");
  const order = document.getElementById("bestellen");
  const donate = document.getElementById("spenden");
  if (bar && hero && order && "IntersectionObserver" in window) {
    bar.hidden = false;
    let pastHero = false, inOrder = false, inDonate = false;
    const update = () => bar.classList.toggle("visible", pastHero && !inOrder && !inDonate);
    new IntersectionObserver(([e]) => { pastHero = !e.isIntersecting && e.boundingClientRect.bottom < 0; update(); }, { threshold: 0 }).observe(hero);
    new IntersectionObserver(([e]) => { inOrder = e.isIntersecting; update(); }, { threshold: 0.05 }).observe(order);
    if (donate) new IntersectionObserver(([e]) => { inDonate = e.isIntersecting; update(); }, { threshold: 0.2 }).observe(donate);
  }
})();
