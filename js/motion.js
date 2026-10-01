/* SALA · movimiento (agente B)
   1) Revelados con IntersectionObserver en todo el sitio salvo el hero de la home y la intro.
   2) Cortinilla entre páginas en el color de fondo del destino, con o sin View Transitions.
   3) Paralaje suave de las imágenes de los rollos, vista previa del índice, botones magnéticos y menú.
   Mejora progresiva: si algo falla, se quita html.m y todo queda visible. */
(() => {
"use strict";
const doc = document, root = doc.documentElement, main = doc.getElementById("main");
const mqR = matchMedia("(prefers-reduced-motion: reduce)");
if (!main || mqR.matches || !("IntersectionObserver" in window)) return;

const fine = matchMedia("(hover:hover) and (pointer:fine)").matches;
const $ = (s, r = doc) => r.querySelector(s), $$ = (s, r = doc) => Array.from(r.querySelectorAll(s));
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const now = () => performance.now();
const EASE = "cubic-bezier(.16,1,.3,1)", CUT = "cubic-bezier(.77,0,.18,1)";
const canAnim = typeof Element.prototype.animate === "function";

root.classList.add("m");

/* ================= 1. revelados ================= */
let units = new Map(), claimed = new WeakSet(), navAt = -1e9, navDelay = 0, skipInView = false, filterMO = null;
const io = new IntersectionObserver(onIO, { rootMargin: "0px 0px -8% 0px", threshold: 0 });

/* Una «unidad» es un elemento observado y la lista de piezas que entran cuando aparece: [elemento, tipo, retraso ms]. */
function U(target, specs, opt) {
  if (!target) return;
  const pending = skipInView && inView(target);
  const items = [];
  for (const s of specs) {
    const el = s && s[0];
    if (!el || claimed.has(el) || el.closest(".hero")) continue;
    claimed.add(el);
    if (pending) continue; /* ya estaba pintado antes de que llegase este script: se queda como está */
    el.classList.add("m-" + s[1]);
    items.push(s);
  }
  if (!items.length) return;
  target._m = (target._m || []).concat(items);
  const u = units.get(target);
  if (u) { u.items.push(...items); if (opt) Object.assign(u.opt, opt); return; }
  units.set(target, { items, opt: opt || {} });
  io.observe(target);
}
const seq = (els, kind, start, step) => Array.from(els || [], (el, i) => [el, kind, start + i * step]);
const inView = el => { const r = el.getBoundingClientRect(); return r.bottom > 0 && r.top < innerHeight && (r.width || r.height); };

function onIO(entries) {
  const vis = [];
  for (const e of entries) {
    const u = units.get(e.target); if (!u) continue;
    if (e.isIntersecting) vis.push(e);
    else if (e.boundingClientRect.height && e.boundingClientRect.bottom <= 0) reveal(e.target, u, 0, true); /* ya quedó atrás */
  }
  if (!vis.length) return;
  /* las que entran a la vez se escalonan en orden de lectura */
  vis.sort((a, b) => (Math.round(a.boundingClientRect.top / 12) - Math.round(b.boundingClientRect.top / 12)) || (a.boundingClientRect.left - b.boundingClientRect.left));
  const extra = Math.max(0, navDelay - (now() - navAt));
  vis.forEach((e, i) => reveal(e.target, units.get(e.target), extra + Math.min(i, 7) * 90, false));
}

function reveal(t, u, base, instant) {
  io.unobserve(t); units.delete(t);
  for (const [el, , off] of u.items) {
    el.style.setProperty("--md", Math.round(base + off) + "ms");
    el.classList.toggle("m-now", !!instant);
    el.classList.add("in");
  }
  if (!instant && u.opt.open) openFit(t, base + 120);
}

/* el correo grande «se abre»: anchura 50 % → la suya, con la misma transición que usa index.html */
function openFit(fb, delay) {
  const el = $(".fit", fb);
  if (!el) return;
  setTimeout(() => {
    if (!el.isConnected || el._final == null || fb.classList.contains("anim")) return;
    el.style.fontStretch = "50%"; void el.offsetWidth;
    fb.classList.add("anim"); el.style.fontStretch = el._final + "%";
    setTimeout(() => fb.classList.remove("anim"), 900);
  }, delay);
}

/* ---- qué entra y cómo, por componente ---- */
function scan() {
  const q = s => $$(s, main).filter(el => !el.closest(".hero"));

  /* claqueta: la barra se cierra de golpe y las celdas marcan después */
  q(".slate").forEach(sl => U(sl, [[sl, "slate", 120], ...$$("dl > div", sl).flatMap((c, i) => [[$("dt", c), "k", 440 + i * 55], [$("dd", c), "k", 480 + i * 55]])]));

  /* filas de metadatos: marcan una tras otra */
  q(".reel-top, .meta-row, .next .top, .strip .edge").forEach(r => U(r, seq(r.children, "k", 0, 70)));
  q(".close .row1").forEach(r => U(r, [[r, "lb", 0], ...seq(r.children, "k", 160, 90)]));

  /* rollos de la home */
  q(".posters").forEach(p => { const a = $$(":scope > a", p); U(p, [...seq(a, "w", 0, 150), [$(".vlabel", p), "k", 520]]); px(a); });
  q(".v-verde .r").forEach(r => { const a = $$(":scope > a", r); U(r, [...seq(a, "w", 0, 100), ...a.map((x, i) => [$(".code", x), "k", 460 + i * 100])]); px(a); });
  q(".bleedimg, .v-gav .land, .v-gav .tall, .v-eggs .logo, .v-miso .img").forEach(f => { U(f, [[f, "w", 0]]); px([f]); });
  q(".foot").forEach(f => U(f, [[$(".hook", f), "p", 0], [$(".cta", f), "c", 220]]));
  q(".v-verde .l").forEach(l => U(l, [[$(".hook", l), "p", 0], [$(".cta", l), "c", 220]]));
  q(".v-miso table").forEach(t => U(t, [[t, "c", 0], ...$$("tr", t).flatMap((tr, i) => $$("td", tr).map((td, j) => [td, "k", 200 + i * 90 + j * 45]))]));
  q(".v-miso .side > .cta").forEach(c => U(c, [[c, "c", 0]]));
  q(".allwork > .meta").forEach(p => U(p, [[p, "k", 0]]));

  /* proyecto */
  q(".pj-hook").forEach(b => U(b, [[$(".bl", b), "p", 0], [$(".meta", b), "k", 160]]));
  q(".bt").forEach(b => U(b, [[$(".meta", b), "k", 0], [$(".bl, .b", b), "p", 110]]));
  q(".fg").forEach(fg => { const fr = $(".fr", fg); if (!fr || fr.classList.contains("cover-b")) { claimed.add(fg); return; } U(fg, [[fr, "w", 0], [$("figcaption", fg), "k", 420]]); });
  q(".next .nimg").forEach(f => U(f, [[f, "w", 0]]));
  q(".strip .cells").forEach(c => { const f = $$(":scope > figure", c); U(c, [...f.map((x, i) => [$("img", x), "c", i * 90]), ...f.map((x, i) => [$("figcaption", x), "k", 240 + i * 90])]); });
  q(".band").forEach(b => U(b, [[b, "c", 0], [$(".nm", b), "t", 0], [$(".hx", b), "k", 260]]));
  q(".qb").forEach(b => U(b, seq($$(".fitbox", b), "f", 0, 130)));
  q(".sp").forEach(s => { U(s, [[$(".meta", s), "k", 0]]); $$("dl > div", s).forEach(d => U(d, [[d, "l", 0], [$("dt", d), "p", 140], [$("dd", d), "p", 210]])); });
  q(".pnav").forEach(n => U(n, seq(n.children, "k", 0, 70)));

  /* índice */
  q(".filters").forEach(f => U(f, seq(f.children, "k", 0, 45)));
  q(".list > li").forEach(li => { const a = $(".item", li); if (a) U(li, [[a, "c", 0], [$(".t", a), "t", 0], ...seq($$(".n, .k, .y", a), "k", 200, 50), [$(".th", a), "k", 240]]); });

  /* sobre mí */
  q(".ab .lede").forEach(p => U(p, [[p, "p", 0]]));
  q(".ab .body").forEach(b => U(b, seq(b.children, "p", 0, 120)));
  q(".sec > .meta").forEach(p => U(p, [[p, "k", 0]]));
  q(".exp > li").forEach(li => U(li, [[li, "c", 0]]));
  q(".prn > div").forEach(d => U(d, [[d, "l", 0], [$("h3", d), "p", 120], [$("p", d), "p", 200]]));
  q(".cr > div").forEach(d => U(d, [[$("dt", d), "k", 0], [$("dd", d), "p", 90]]));

  /* contacto / cierre y filas de botones */
  q(".close .acts, .cta-row").forEach(a => U(a, seq(a.children, "c", 0, 70)));

  /* sistema */
  q(".sy .row, .swb > div, .gbars > div").forEach(r => U(r, [[r, "c", 0]]));

  /* títulos ajustados que queden (h1 de cada página, títulos de los rollos, siguiente, correo) */
  q(".fitbox").forEach(fb => U(fb, [[fb, "f", 0]], fb.classList.contains("mailfit") ? { open: true } : null));

  /* red de seguridad: cualquier .sx / .wipe sin dueño entra igual */
  const owned = el => claimed.has(el) || $$("*", el).some(d => claimed.has(d));
  q(".sx").forEach(el => { if (!owned(el)) U(el, [[el, "p", 0]]); });
  q(".wipe").forEach(el => { if (!owned(el)) U(el, [[el, "w", 0]]); });
  q(".cta").forEach(c => U(c, [[c, "c", 0]]));
}

/* el índice: al cambiar de filtro, las filas visibles vuelven a entrar */
function watchFilters() {
  const list = $(".list", main);
  if (!list) return;
  let raf = 0;
  filterMO = new MutationObserver(() => { if (!raf) raf = requestAnimationFrame(() => { raf = 0; replay($$(":scope > li", list).filter(li => !li.hidden)); }); });
  filterMO.observe(list, { subtree: true, attributes: true, attributeFilter: ["hidden"] });
}
function replay(targets) {
  targets.forEach(t => (t._m || []).forEach(([el]) => el.classList.remove("in", "m-now")));
  void main.offsetWidth;
  targets.forEach(t => { if (!t._m || units.has(t)) return; units.set(t, { items: t._m.slice(), opt: {} }); io.observe(t); });
}

/* ================= 2. paralaje (solo puntero fino) ================= */
const AMP = .036, pxVis = new Set();
let pxRaf = 0;
const pio = fine ? new IntersectionObserver(es => { es.forEach(e => e.isIntersecting ? pxVis.add(e.target) : pxVis.delete(e.target)); pxReq(); }, { rootMargin: "20% 0px" }) : null;
function px(frames) { if (!pio) return; frames.forEach(f => { if (!f || f.closest(".hero")) return; f.classList.add("m-px"); pio.observe(f); }); }
function pxReq() { if (!pxRaf && pxVis.size) pxRaf = requestAnimationFrame(pxTick); }
function pxTick() {
  pxRaf = 0;
  const vh = innerHeight, out = [];
  pxVis.forEach(f => { const im = $("img", f), r = f.getBoundingClientRect(); if (!im || !r.height) return; const p = clamp((r.top + r.height / 2 - vh / 2) / (vh / 2 + r.height / 2), -1, 1); out.push([im, -p * AMP * r.height]); });
  out.forEach(([im, y]) => { im.style.translate = "0 " + y.toFixed(2) + "px"; });
}
if (pio) { addEventListener("scroll", pxReq, { passive: true }); addEventListener("resize", pxReq, { passive: true }); }

/* ================= 3. cortinilla entre páginas ================= */
const shut = doc.createElement("div");
shut.className = "m-shut"; shut.setAttribute("aria-hidden", "true");
doc.body.appendChild(shut);
let shutAnim = null, shutT = 0, vtPending = false;
function shutCover(color) {
  if (shutAnim) { shutAnim.cancel(); shutAnim = null; }
  shut.style.backgroundColor = color;
  shut.classList.add("on");
  clearTimeout(shutT); shutT = setTimeout(() => shutOpen(0), 900); /* nunca se queda puesta */
}
function shutOpen(delay) {
  clearTimeout(shutT);
  if (!shut.classList.contains("on") || shutAnim) return;
  if (!canAnim) { shut.classList.remove("on"); return; }
  const a = shutAnim = shut.animate([{ clipPath: "inset(0 0 0 0)" }, { clipPath: "inset(0 0 0 100%)" }], { duration: 340, delay, easing: CUT, fill: "forwards" });
  a.onfinish = () => { if (shutAnim !== a) return; shut.classList.remove("on"); a.cancel(); shutAnim = null; };
}
/* Con View Transitions la vieja página sigue en pantalla mientras entra la nueva: envolvemos la API para
   saber cuándo empiezan sus animaciones y retirar la cortinilla a tiempo. El enrutador no cambia. */
const ost = doc.startViewTransition;
if (typeof ost === "function") {
  doc.startViewTransition = function () {
    const t = ost.apply(doc, arguments);
    if (root.classList.contains("m") && t && t.ready) {
      vtPending = true;
      t.ready.then(() => { vtPending = false; shutOpen(130); }, () => { vtPending = false; shutOpen(0); });
      t.finished.then(() => { vtPending = false; }, () => { vtPending = false; });
    }
    return t;
  };
}

doc.addEventListener("sala:render", e => {
  const d = e.detail || {};
  if (d.fromNav && root.classList.contains("m")) {
    navAt = now(); navDelay = vtPending ? 300 : 170;
    const hb = main.querySelector("[data-hb]");
    shutCover(hb && hb.dataset.hb ? hb.dataset.hb : "#0B0B0A");
    if (!vtPending) shutOpen(60); /* sin View Transitions (o atrás/adelante): corte seco al color y se abre */
  }
  rescan();
});

function rescan() {
  io.disconnect(); units = new Map(); claimed = new WeakSet();
  if (pio) { pio.disconnect(); pxVis.clear(); }
  if (filterMO) { filterMO.disconnect(); filterMO = null; }
  if (!root.classList.contains("m")) return;
  try { scan(); watchFilters(); }
  catch (err) { root.classList.remove("m"); if (window.console) console.error("[motion]", err); }
}

/* ================= 5. botones magnéticos (puntero fino) ================= */
if (fine) {
  const live = new Set();
  let hot = null, mraf = 0;
  const loop = () => {
    mraf = 0;
    live.forEach(el => {
      const s = el._mg;
      s.x += (s.tx - s.x) * .18; s.y += (s.ty - s.y) * .18;
      if (!s.tx && !s.ty && Math.abs(s.x) < .05 && Math.abs(s.y) < .05) { s.x = s.y = 0; el.style.translate = ""; live.delete(el); return; }
      el.style.translate = s.x.toFixed(2) + "px " + s.y.toFixed(2) + "px";
    });
    if (live.size) mraf = requestAnimationFrame(loop);
  };
  const release = () => { if (hot && hot._mg) { hot._mg.tx = hot._mg.ty = 0; } hot = null; };
  doc.addEventListener("pointermove", e => {
    const c = root.classList.contains("m") && e.target.closest ? e.target.closest(".cta") : null;
    if (hot && hot !== c) release();
    if (c) {
      hot = c;
      const s = c._mg || (c._mg = { x: 0, y: 0, tx: 0, ty: 0 }), r = c.getBoundingClientRect();
      s.tx = clamp((e.clientX - (r.left - s.x + r.width / 2)) * .2, -10, 10);
      s.ty = clamp((e.clientY - (r.top - s.y + r.height / 2)) * .3, -6, 6);
      live.add(c);
    }
    if (live.size && !mraf) mraf = requestAnimationFrame(loop);
  }, { passive: true });
  root.addEventListener("pointerleave", () => { release(); if (live.size && !mraf) mraf = requestAnimationFrame(loop); });
}

/* ================= 6. menú móvil: entra como una cortinilla ================= */
const menu = $("#menu");
if (menu && canAnim) new MutationObserver(() => {
  if (menu.hidden || !root.classList.contains("m")) return;
  menu.animate([{ clipPath: "inset(0 100% 0 0)" }, { clipPath: "inset(0 0% 0 0)" }], { duration: 420, easing: CUT });
  $$("li", menu).forEach((li, i) => li.animate([{ clipPath: "inset(-10% 100% -10% 0)", translate: "2.5rem 0" }, { clipPath: "inset(-10% 0% -10% 0)", translate: "0 0" }], { duration: 760, delay: 160 + i * 60, easing: EASE, fill: "backwards" }));
}).observe(menu, { attributes: true, attributeFilter: ["hidden"] });

/* ================= arranque ================= */
/* si el navegador ya pintó la página antes de que llegara este script, lo que está a la vista no se esconde (sin parpadeo) */
try { skipInView = performance.getEntriesByType("paint").some(p => p.name === "first-contentful-paint"); } catch (e) { skipInView = false; }
rescan();
skipInView = false;
pxReq();

mqR.addEventListener && mqR.addEventListener("change", () => {
  if (!mqR.matches) return;
  root.classList.remove("m"); io.disconnect(); if (pio) pio.disconnect(); pxVis.clear();
  $$(".m-px img").forEach(im => { im.style.translate = ""; });
});
})();
