/* SALA — puerta de la intro (agente A).
   Bloqueante al final de <head>: decide ANTES del primer pintado.
   - html.hero-pending  → la portada (hero) arranca oculta para entrar con su animación.
   - html.intro-pending → tapa negra desde el primer pintado hasta que intro.js monta la cola de arranque.
   Solo en la portada sin hash, una vez por sesión y nunca con «reducir movimiento».
   Seguro: si intro.js no llega o falla, a los 2,5 s se quitan las clases y el contenido se ve. */
(function () {
  var d = document.documentElement;
  function release() { d.classList.remove("intro-pending"); d.classList.remove("hero-pending"); }
  try {
    var h = location.hash;
    var bare = !h || h === "#";
    if (!bare && h !== "#top" && h !== "#main") return;
    if (window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    var seen = true;
    try { seen = sessionStorage.getItem("sala:intro") === "1"; } catch (e) { seen = true; }
    d.classList.add("hero-pending");
    if (bare && !seen) d.classList.add("intro-pending");
    window.__salaGate = setTimeout(release, 2500);
  } catch (e) { release(); }
})();
