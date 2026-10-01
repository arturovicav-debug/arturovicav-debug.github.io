/* SALA — primera impresión (agente A).
   1) Cola de arranque: cuenta atrás 3·2·1 con barrido radial; sale con un corte horizontal.
   2) Entrada de la portada: líneas del titular, metadatos, proyector y subtítulo, de izquierda a derecha.
   3) Proyector: progreso de 3 s, destello en cada corte, marca de cambio de rollo, grano y vaivén.
   Se ejecuta después del primer render; se re-engancha en cada «sala:render». */
(() => {
  "use strict";
  const d = document.documentElement;
  const SALA = window.SALA || {};
  const reduced = typeof SALA.reduced === "boolean" ? SALA.reduced
    : (() => { try { return matchMedia("(prefers-reduced-motion: reduce)").matches; } catch (e) { return false; } })();
  const $ = (s, r = document) => r.querySelector(s);
  const T = { in: 140, cnt: 400, out: 460 }; // ms; deben coincidir con --in / --cnt / --out de intro.css
  const NAV_DELAY = 140; // ms de espera de la entrada al volver a la portada (bajo la cortinilla entre páginas)
  const pad = n => String(n).padStart(2, "0");
  const tcf = f => "TC 00:00:" + pad(Math.floor(f / 24) % 60) + ":" + pad(f % 24);

  /* la puerta deja un seguro de 2,5 s: a partir de aquí manda este archivo */
  try { clearTimeout(window.__salaGate); } catch (e) {}
  const release = () => { d.classList.remove("intro-pending"); d.classList.remove("hero-pending"); };

  const fontsReady = cap => new Promise(res => {
    const t = setTimeout(res, cap);
    const done = () => { clearTimeout(t); res(); };
    try {
      if (document.fonts && document.fonts.load) Promise.all([document.fonts.load('900 100px "Anybody"'), document.fonts.load('400 16px "DM Mono"')]).then(done, done);
      else done();
    } catch (e) { done(); }
  });
  const focusMain = () => { const m = $("#main"); if (m) try { m.focus({ preventScroll: true }); } catch (e) { m.focus(); } };

  /* ================= 2. Entrada de la portada ================= */
  let heroT = 0;
  function heroGo(fit) {
    const hero = $("#main .hero");
    clearTimeout(heroT);
    if (hero && !reduced) {
      hero.classList.remove("hx-go");
      void hero.offsetWidth;
      hero.classList.add("hx-go"); // las animaciones (fill: both) toman el relevo del estado previo en el mismo fotograma
      heroT = setTimeout(() => hero.classList.remove("hx-go"), 1500);
    }
    d.classList.remove("hero-pending");
    if (fit && hero && !reduced && typeof SALA.fitAll === "function") { try { SALA.fitAll(true); } catch (e) {} }
  }

  /* ================= 3. Proyector ================= */
  let pj = null;
  function detachProjector() {
    if (!pj) return;
    pj.mo.disconnect(); if (pj.mb) pj.mb.disconnect();
    clearTimeout(pj.ft); if (pj.im && pj.onLoad) pj.im.removeEventListener("load", pj.onLoad);
    pj.fx.remove(); pj.bar.remove();
    pj.frame.classList.remove("pj-on", "pj-b", "pj-fa", "pj-fb", "pj-paused");
    pj = null;
  }
  function attachProjector() {
    detachProjector();
    const frame = $("#projector"), lab = $("#pjLabel"), btn = $("#pjBtn");
    if (!frame || !lab) return;
    const im = frame.querySelector("img");
    const fx = document.createElement("div");
    fx.className = "pj-fx"; fx.setAttribute("aria-hidden", "true");
    fx.innerHTML = '<i class="pj-grain"></i><i class="pj-flash"></i><i class="pj-cue"></i>';
    const bar = document.createElement("i");
    bar.className = "pj-bar"; bar.setAttribute("aria-hidden", "true");
    const ctrl = frame.querySelector(".ctrl");
    frame.insertBefore(fx, ctrl && ctrl.parentNode === frame ? ctrl : null); // grano bajo los controles
    frame.appendChild(bar);                                                  // barra encima del degradado
    const st = { frame, fx, bar, im, mo: null, mb: null, ft: 0, onLoad: null };
    const paused = () => !!btn && btn.getAttribute("aria-pressed") === "true";
    const cycle = () => frame.classList.toggle("pj-b");            // cambia el nombre de la animación: reinicia barra y marca
    const flash = () => {
      const a = frame.classList.contains("pj-fa");
      frame.classList.toggle("pj-fa", !a); frame.classList.toggle("pj-fb", a);
    };
    const onCut = () => {
      cycle();
      if (reduced) return;
      clearTimeout(st.ft); if (st.onLoad && im) im.removeEventListener("load", st.onLoad);
      if (im && !im.complete) { // el destello coincide con el momento en que la imagen nueva entra de verdad
        st.onLoad = () => { clearTimeout(st.ft); im.removeEventListener("load", st.onLoad); st.onLoad = null; flash(); };
        im.addEventListener("load", st.onLoad);
        st.ft = setTimeout(st.onLoad, 450);
      } else flash();
    };
    st.mo = new MutationObserver(onCut);
    st.mo.observe(lab, { childList: true, characterData: true, subtree: true });
    if (btn) {
      st.mb = new MutationObserver(() => { const p = paused(); frame.classList.toggle("pj-paused", p); if (!p) cycle(); });
      st.mb.observe(btn, { attributes: true, attributeFilter: ["aria-pressed"] });
    }
    frame.classList.toggle("pj-paused", paused());
    frame.classList.add("pj-on");
    pj = st;
  }

  /* ================= 1. Cola de arranque ================= */
  let lead = null, state = 0, t0 = 0, raf = 0, lastF = -1, exitT = 0, outT = 0, safeT = 0, swallowUntil = 0, swallowT = 0;
  const timers = () => { clearTimeout(exitT); clearTimeout(outT); clearTimeout(safeT); cancelAnimationFrame(raf); };

  function build() {
    const el = document.createElement("div");
    el.className = "lead";
    el.innerHTML =
      '<div class="lead-film" aria-hidden="true">' +
        '<i class="lead-h"></i><i class="lead-v"></i>' +
        '<div class="lead-dial">' +
          '<div class="lead-half lead-r"><i></i></div><div class="lead-half lead-l"><i></i></div>' +
          '<i class="lead-ring"></i><i class="lead-ring lead-ring2"></i><i class="lead-hand"></i>' +
          '<span class="lead-n lead-n1">3</span><span class="lead-n lead-n2">2</span><span class="lead-n lead-n3">1</span>' +
        '</div>' +
        '<div class="lead-row lead-top"><span>Cola de arranque · Rollo 00</span><span class="lead-tc">' + tcf(0) + '</span></div>' +
        '<div class="lead-row lead-bot"><span><b>Arturo</b> — Dirección de arte y concepto</span></div>' +
        '<i class="lead-blade"></i>' +
      '</div>' +
      '<button type="button" class="lead-skip">Saltar intro <span aria-hidden="true">▶</span></button>';
    return el;
  }

  const onKey = e => {
    const b = lead && lead.querySelector(".lead-skip");
    const onBtn = b && e.target === b && (e.key === "Enter" || e.key === " ");
    e.stopPropagation(); // la tecla que salta la intro no dispara atajos de la página (p. ej. «G», retícula)
    if (onBtn) e.preventDefault();
    exit(onBtn ? "button" : "key");
  };
  const onPointer = e => {
    swallowUntil = performance.now() + 750; // el clic que sigue al toque no debe atravesar a la portada
    exit(e.target && e.target.closest && e.target.closest(".lead-skip") ? "button" : "pointer");
  };
  const onScroll = () => exit("scroll");
  const onBtn = () => exit("button");
  const onVis = () => { if (document.hidden && state >= 2) finish(); };
  const onClickCapture = e => { if (performance.now() < swallowUntil) { e.preventDefault(); e.stopPropagation(); } };

  function listen(on) {
    const m = on ? "addEventListener" : "removeEventListener";
    document[m]("keydown", onKey, true);
    window[m]("pointerdown", onPointer, true);
    window[m]("wheel", onScroll, { passive: true });
    window[m]("touchmove", onScroll, { passive: true });
    document[m]("visibilitychange", onVis);
  }

  function tick(now) {
    const f = Math.max(0, Math.floor((now - t0) * 24 / 1000));
    if (f !== lastF && lead) { lastF = f; const tc = lead.querySelector(".lead-tc"); if (tc) tc.textContent = tcf(f); }
    raf = requestAnimationFrame(tick);
  }

  function runIntro() {
    try { sessionStorage.setItem("sala:intro", "1"); } catch (e) {}
    lead = build();
    document.body.insertBefore(lead, document.body.firstChild); // el botón es lo primero que alcanza el tabulador
    d.classList.remove("intro-pending");                        // la tapa CSS ya no hace falta: la cola está encima
    d.classList.add("intro-on");
    lead.querySelector(".lead-skip").addEventListener("click", onBtn);
    window.addEventListener("click", onClickCapture, true);
    listen(true);
    state = 1;
    const go = () => fontsReady(450).then(start);
    if (document.visibilityState === "hidden") {
      // pestaña abierta en segundo plano: la cuenta empieza cuando alguien la mira
      const v = () => { if (document.visibilityState !== "hidden") { document.removeEventListener("visibilitychange", v); go(); } };
      document.addEventListener("visibilitychange", v);
    } else go();
  }

  function start() {
    if (state !== 1 || !lead) return;
    try {
      state = 2;
      lead.classList.add("is-run");
      t0 = performance.now(); lastF = -1; raf = requestAnimationFrame(tick);
      exitT = setTimeout(() => exit("end"), T.in + 3 * T.cnt);
      safeT = setTimeout(finish, T.in + 3 * T.cnt + T.out + 1500); // seguro propio
    } catch (e) { finish(); }
  }

  function exit(how) {
    if (!lead || state >= 3) return;
    if (state < 2) { finish(how === "button"); return; } // aún no había empezado: fuera sin ceremonia
    state = 3;
    clearTimeout(exitT);
    const b = lead.querySelector(".lead-skip");
    if (how === "button" || (b && document.activeElement === b && how !== "key")) focusMain();
    lead.classList.add("is-out");
    heroGo(true);
    outT = setTimeout(finish, T.out + 40);
  }

  function finish(toMain) {
    timers();
    listen(false);
    if (lead) {
      if (toMain || lead.contains(document.activeElement)) focusMain();
      lead.remove(); lead = null;
    }
    d.classList.remove("intro-pending"); d.classList.remove("intro-on");
    if (d.classList.contains("hero-pending")) heroGo(true);
    state = 4;
    clearTimeout(swallowT);
    swallowT = setTimeout(() => window.removeEventListener("click", onClickCapture, true), Math.max(0, swallowUntil - performance.now()) + 50);
  }

  /* ================= cableado ================= */
  document.addEventListener("sala:render", e => {
    const det = e.detail || {}, key = det.key;
    if (lead) finish(); // si cambia la ruta durante la intro, se corta en seco
    clearTimeout(heroT);
    detachProjector();
    if (key !== "") { d.classList.remove("hero-pending"); return; }
    try {
      attachProjector();
      if (det.fromNav && !reduced && $("#main .hero")) {
        // al volver a la portada, la cortinilla entre páginas tapa los primeros fotogramas:
        // la entrada espera a que se abra y relanza la apertura del titular para que se vea
        d.classList.add("hero-pending");
        heroT = setTimeout(() => { try { heroGo(true); } catch (err) { release(); } }, NAV_DELAY);
      } else heroGo(false); // fitAll(true) ya lo lanza render()
    } catch (err) { release(); }
  });

  try {
    const home = !!$("#main .hero");
    if (home) attachProjector();
    if (d.classList.contains("intro-pending") && home && !reduced) runIntro();
    else {
      d.classList.remove("intro-pending");
      if (d.classList.contains("hero-pending")) {
        if (home && !reduced) fontsReady(1200).then(() => { try { heroGo(true); } catch (e) { release(); } });
        else release();
      }
    }
  } catch (e) {
    try { if (lead) { lead.remove(); lead = null; } } catch (x) {}
    release(); d.classList.remove("intro-on");
  }
})();
