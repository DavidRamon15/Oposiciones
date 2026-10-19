// Arranque de la web propia: descarga el índice y los datos de la oposición que se abre (y solo esa),
// y después carga app.js, el mismo código que la versión publicada en Claude.
(async function () {
  const aviso = texto => {
    const el = document.createElement("p");
    el.className = "carga-aviso";
    el.textContent = texto;
    document.body.prepend(el);
    return el;
  };
  const cargando = aviso("Cargando…");
  try {
    // ?v=…: la versión de esta publicación (la pone construir.py en index.html), para no mezclar archivos de la caché
    const v = window.VERSION ? "?v=" + window.VERSION : "";
    const indice = await (await fetch("datos/indice.json" + v)).json();
    // misma regla que app.js: la oposición del enlace (#prisiones) o, si el enlace es a una sección, la última elegida
    const h = location.hash.replace("#", "");
    let k = h;
    if (!indice[h] && h !== "inicio") { try { k = localStorage.getItem("opos-sel") || ""; } catch (e) { /* sin almacenamiento */ } }
    // en la portada no hace falta ninguna oposición entera: se carga la más ligera para que la página arranque
    const abrir = indice[k] && k !== "inicio" ? k : "policia-nacional";
    const r = await fetch(`datos/${abrir}.json${v}`);
    if (!r.ok) throw new Error(`datos/${abrir}.json: ${r.status}`);
    window.OPS = Object.fromEntries(Object.entries(indice).map(([op, v]) => [op, {cfg: v.cfg, temas: v.temas}]));
    window.OPS[abrir] = await r.json();
    window.INDICE = indice;
    const s = document.createElement("script");
    s.src = "app.js" + v;
    s.onload = () => { cargando.remove(); window.CUENTA?.iniciar(); };
    s.onerror = () => { cargando.textContent = "No se pudo cargar la página. Recarga para intentarlo de nuevo."; };
    document.body.append(s);
  } catch (e) {
    cargando.textContent = "No se pudieron descargar los datos. Comprueba tu conexión y recarga la página.";
    console.error(e);
  }
})();
