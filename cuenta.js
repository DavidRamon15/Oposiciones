// Cuentas y roles de la web propia (Supabase). Se carga antes que app.js: rellena window.GANCHOS, que
// app.js llama al corregir un examen o guardar uno a medias, y window.CUENTA.iniciar(), que el cargador
// llama cuando app.js ya ha pintado la página. Toda la seguridad la impone la base de datos (RLS):
// aquí solo se decide qué enseñar a cada rol.
(function () {
  "use strict";
  const CFG = window.CONFIG || {};
  const sb = window.supabase && CFG.supabaseUrl
    ? window.supabase.createClient(CFG.supabaseUrl, CFG.supabaseAnon, {auth: {flowType: "pkce", persistSession: true, detectSessionInUrl: true, autoRefreshToken: true}})
    : null;
  // los avisos de sesión llegan desde que se crea el cliente (p. ej. al volver de un enlace de email),
  // antes de que la página esté lista: se guardan y se atienden en iniciar()
  const EVENTOS = []; let alEvento = null;
  sb?.auth.onAuthStateChange((ev, ses) => alEvento ? alEvento(ev, ses) : EVENTOS.push([ev, ses]));
  const ROL = {admin: "Administrador", preparador: "Preparador", opositor: "Opositor"};
  const MODOS = {sim: "Simulacro oficial", rapido: "Test rápido", tema: "Por tema", fallos: "Repaso de fallos"};
  let PERFIL = null, EMAIL = "", LISTO = false;
  const q = s => document.querySelector(s);
  const h = s => String(s ?? "").replace(/[&<>"]/g, c => ({"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;"}[c]));
  const op = () => (typeof PORTAL !== "undefined" && !PORTAL) ? OPK : null;     // oposición abierta (null en la portada)
  const nombreOp = k => window.INDICE?.[k]?.cfg?.nombreCorto || k || "—";
  const fecha = t => t ? new Date(t).toLocaleDateString("es-ES", {day: "numeric", month: "short", year: "numeric"}) : "—";
  const hace = t => { if (!t) return "nunca"; const m = (Date.now() - new Date(t)) / 60000;
    return m < 2 ? "ahora" : m < 60 ? `hace ${Math.round(m)} min` : m < 1440 ? `hace ${Math.round(m / 60)} h` : m < 2880 ? "ayer" : `hace ${Math.round(m / 1440)} días`; };
  const pl = (n, uno, varios) => `${n} ${n === 1 ? uno : varios}`;
  const pct = (nota, escala) => escala ? Math.round(100 * nota / escala) : null;

  // ---------- mensajes de error en castellano ----------
  function mensaje(e) {
    const m = String(e?.message || e || "");
    const t = [
      [/Invalid login credentials/i, "Email o contraseña incorrectos."],
      [/Email not confirmed/i, "Aún no has confirmado tu email. Busca el enlace que te enviamos al registrarte."],
      [/User already registered|already been registered/i, "Ya hay una cuenta con ese email. Entra o recupera la contraseña."],
      [/Password should be at least|at least \d+ characters/i, "La contraseña debe tener al menos 8 caracteres."],
      [/rate limit|Too many|security purposes/i, "Demasiados intentos seguidos. Espera un minuto y vuelve a probar."],
      [/Unable to validate email|invalid format|email address.*invalid/i, "Ese email no es válido."],
      [/New password should be different/i, "La contraseña nueva tiene que ser distinta de la anterior."],
      [/Failed to fetch|NetworkError|network/i, "No hay conexión con el servidor. Comprueba tu conexión."],
      [/JWT expired|session/i, "Tu sesión ha caducado. Vuelve a entrar."],
    ].find(([rx]) => rx.test(m));
    return t ? t[1] : m || "Algo ha fallado. Vuelve a intentarlo.";
  }
  let avisoT;
  function aviso(texto, tipo = "") {
    const el = q("#cu-aviso"); if (!el) return;
    el.textContent = texto; el.className = "cu-aviso " + tipo; el.hidden = false;
    clearTimeout(avisoT); avisoT = setTimeout(() => { el.hidden = true; }, tipo === "error" ? 9000 : 4500);
  }

  // ---------- ganchos que llama app.js ----------
  let cursoT = null, cursoDatos = null;
  window.GANCHOS = {
    // el examen queda ligado a la cuenta con la que se corrigió, aunque luego cambie la sesión
    alCorregir(i) { if (PERFIL) guardarIntento({...i, usuario: PERFIL.id, oposicion: op()}); },
    alGuardarCurso(d) {   // examen a medias: a la nube como mucho cada 15 s
      if (!PERFIL || !op()) return; cursoDatos = d;
      if (!cursoT) cursoT = setTimeout(subirCurso, 15000);
    },
    alBorrarCurso() { if (!PERFIL || !op()) return; clearTimeout(cursoT); cursoT = null; cursoDatos = null;
      sb.from("cursos").delete().eq("usuario", PERFIL.id).eq("oposicion", op()).then(() => {}); },
    alBorrarProgreso() { if (PERFIL && op()) sb.rpc("borrar_progreso", {p_usuario: PERFIL.id, p_oposicion: op()}).then(({error}) => error ? aviso(mensaje(error), "error") : aviso("Progreso borrado de tu cuenta")); },
  };
  async function subirCurso() {
    cursoT = null; if (!cursoDatos || !PERFIL) return;
    const datos = cursoDatos; cursoDatos = null;
    const {error} = await sb.from("cursos").upsert({usuario: PERFIL.id, oposicion: op(), datos, actualizado: new Date().toISOString()});
    if (error) console.warn("examen a medias sin subir:", error.message);
  }
  document.addEventListener("visibilitychange", () => { if (document.hidden && cursoT) { clearTimeout(cursoT); subirCurso(); } });

  // los exámenes que no se pudieron guardar (sin conexión) esperan aquí y se reintentan
  const PEND = "cu-pendientes";
  const pendientes = () => { try { return JSON.parse(localStorage.getItem(PEND)) || []; } catch (e) { return []; } };
  const setPend = l => { try { localStorage.setItem(PEND, JSON.stringify(l)); } catch (e) { /* sin almacenamiento */ } };
  async function guardarIntento(i, reintento = false) {
    const {respuestas, usuario, oposicion, ...intento} = i;
    const {error} = await sb.rpc("registrar_intento", {p_usuario: usuario, p_oposicion: oposicion, p_intento: intento, p_respuestas: respuestas});
    if (error) {
      // si la sesión ya es de otra persona no se reintenta: el servidor lo rechazaría igual
      if (!reintento && PERFIL?.id === usuario) setPend([...pendientes(), i]);
      aviso("No se pudo guardar el examen en tu cuenta: " + mensaje(error) + " Se reintentará al volver a abrir la web.", "error");
      return false;
    }
    if (!reintento) aviso((i.juego ? "Partida guardada en tu cuenta" : "Examen guardado en tu cuenta") + (i.tarea ? ". Tarea completada." : ""), "ok");
    if (i.tarea) pintarTareas();
    return true;
  }
  let reintentando = false;
  async function reintentarPendientes() {
    const l = pendientes(); if (!l.length || reintentando) return;
    reintentando = true;
    const resto = [];
    for (const i of l) { if (i.usuario !== PERFIL.id || !(await guardarIntento(i, true))) resto.push(i); }
    setPend(resto); reintentando = false;
    const n = l.length - resto.length;
    if (n) aviso(n === 1 ? "Se ha guardado un examen que estaba pendiente" : `Se han guardado ${n} exámenes que estaban pendientes`, "ok");
  }

  // ---------- interfaz común ----------
  function montarBase() {
    // botón de cuenta: en la barra de secciones y en la portada
    // fuera del carril desplazable de secciones, para que siempre se vea
    (q("#nav-cuenta") || q("nav.toc"))?.insertAdjacentHTML("beforeend", `<span class="cu-sitio" id="cu-nav"></span>`);
    (q("#portal-cuenta") || q("#portal .wrap"))?.insertAdjacentHTML("afterbegin", `<div class="cu-portal" id="cu-portal"></div>`);
    document.body.insertAdjacentHTML("beforeend", `
      <div class="cu-aviso" id="cu-aviso" role="status" aria-live="polite" hidden></div>
      <dialog class="cu-dlg" id="cu-dlg" aria-labelledby="cu-dlg-t"><form method="dialog" class="cu-cerrar"><button aria-label="Cerrar">×</button></form><div id="cu-dlg-c"></div></dialog>`);
    document.querySelectorAll("footer").forEach(f => f.insertAdjacentHTML("beforeend", `<span><a href="#privacidad" class="cu-priv-link">Privacidad y datos personales</a></span>`));
    document.querySelectorAll(".cu-priv-link").forEach(a => a.addEventListener("click", e => { e.preventDefault(); verPrivacidad(); }));
    document.addEventListener("click", e => {
      const b = e.target.closest("[data-cu]"); if (!b) return;
      const a = b.dataset.cu;
      if (a === "entrar") dlgEntrar(); else if (a === "registro") dlgRegistro(); else if (a === "cuenta") dlgCuenta();
      else if (a === "privacidad") verPrivacidad();
    });
  }
  function dlg(titulo, html, alAbrir) {
    q("#cu-dlg-c").innerHTML = `<h2 id="cu-dlg-t">${titulo}</h2>${html}`;
    const d = q("#cu-dlg"); if (!d.open) d.showModal();
    alAbrir?.(q("#cu-dlg-c"));
    q("#cu-dlg-c").querySelector("input:not([type=hidden]):not([readonly]), select, textarea, button")?.focus();
  }
  const cerrarDlg = () => q("#cu-dlg").open && q("#cu-dlg").close();
  function estadoForm(f, texto, tipo = "error") { const p = f.querySelector(".cu-estado"); p.textContent = texto; p.className = "cu-estado " + tipo; }
  function ocupado(f, si) { f.querySelectorAll("button, input, select").forEach(x => x.disabled = si); }

  function pintarBoton() {
    const el = q("#cu-nav"), por = q("#cu-portal");
    const html = !sb ? "" : PERFIL
      ? `<button class="cu-yo" data-cu="cuenta" aria-label="Mi cuenta: ${h(PERFIL.nombre || EMAIL)}, ${ROL[PERFIL.rol]}"><span class="cu-ini" aria-hidden="true">${h((PERFIL.nombre || EMAIL || "?").trim()[0]?.toUpperCase() || "?")}</span><span class="cu-yo-t"><b>${h(PERFIL.nombre || EMAIL)}</b><small>${ROL[PERFIL.rol]}</small></span></button>`
      : `<button data-cu="entrar">Entrar</button><button class="primary" data-cu="registro">Crear cuenta</button>`;
    if (el) el.innerHTML = html;
    if (por) por.innerHTML = html;
    const nota = q("#ex-prog .controls .note");
    if (nota) nota.textContent = PERFIL ? "Se guarda en tu cuenta" : "Se guarda solo en este navegador";
    const inv = q("#cu-invitacion");
    if (!PERFIL && sb && op() && !inv) {
      q("#ex-prog")?.insertAdjacentHTML("afterbegin", `<div class="cu-invitacion" id="cu-invitacion"><p>Sin cuenta, tu progreso se queda en este navegador. Con una cuenta gratuita lo tienes en cualquier dispositivo y, si estudias con un preparador, él puede seguirlo y ponerte tareas.</p>
        <span class="acc"><button class="primary" data-cu="registro">Crear cuenta</button><button data-cu="entrar">Ya tengo cuenta</button></span></div>`);
    } else if (PERFIL && inv) inv.remove();
  }

  // ---------- entrar, registrarse, recuperar ----------
  function dlgEntrar(email = "") {
    dlg("Entrar", `<form id="cu-f" class="cu-form" novalidate>
      <label for="cu-email">Email<input id="cu-email" type="email" autocomplete="email" required value="${h(email)}"></label>
      <label for="cu-pass">Contraseña<input id="cu-pass" type="password" autocomplete="current-password" required minlength="8"></label>
      <p class="cu-estado" role="alert"></p>
      <div class="cu-acciones"><button class="primary" type="submit">Entrar</button><button type="button" id="cu-olvido" class="cu-enlace">He olvidado la contraseña</button></div>
      <p class="note">¿No tienes cuenta? <button type="button" class="cu-enlace" data-cu="registro">Crea una gratis</button></p></form>`, c => {
      c.querySelector("#cu-olvido").onclick = () => dlgRecuperar(c.querySelector("#cu-email").value);
      c.querySelector("#cu-f").onsubmit = async e => { e.preventDefault(); const f = e.target;
        const email = f.querySelector("#cu-email").value.trim(), password = f.querySelector("#cu-pass").value;
        if (!email || !password) return estadoForm(f, "Escribe tu email y tu contraseña.");
        ocupado(f, true); estadoForm(f, "Entrando…", "");
        const {error} = await sb.auth.signInWithPassword({email, password});
        ocupado(f, false);
        if (error) {
          estadoForm(f, mensaje(error));
          if (/not confirmed/i.test(error.message)) f.querySelector(".cu-estado").insertAdjacentHTML("beforeend", ` <button type="button" class="cu-enlace" id="cu-reenviar">Reenviar el email</button>`),
            f.querySelector("#cu-reenviar").onclick = async () => { const r = await sb.auth.resend({type: "signup", email, options: {emailRedirectTo: volver()}}); estadoForm(f, r.error ? mensaje(r.error) : "Te hemos vuelto a enviar el email de confirmación.", r.error ? "error" : "ok"); };
          return;
        }
        cerrarDlg();
      };
    });
  }
  const volver = () => location.origin + location.pathname;
  function dlgRegistro() {
    const ops = Object.entries(window.INDICE || {}).map(([k, v]) => `<option value="${k}"${k === op() ? " selected" : ""}>${h(v.cfg.nombre)}</option>`).join("");
    dlg("Crear cuenta", `<form id="cu-f" class="cu-form" novalidate>
      <p class="note" style="margin-top:-4px">Es gratis. Tu progreso se guarda en tu cuenta y, si tienes preparador, él puede verlo.</p>
      <label for="cu-nombre">Nombre<input id="cu-nombre" autocomplete="name" required maxlength="80" placeholder="Como quieres que te vea tu preparador"></label>
      <label for="cu-email">Email<input id="cu-email" type="email" autocomplete="email" required></label>
      <label for="cu-pass">Contraseña<input id="cu-pass" type="password" autocomplete="new-password" required minlength="8" aria-describedby="cu-pass-a"><small id="cu-pass-a" class="note">Al menos 8 caracteres.</small></label>
      <label for="cu-op">Qué oposición preparas<select id="cu-op"><option value="">Aún no lo sé</option>${ops}</select></label>
      <label class="check" for="cu-acepto"><input type="checkbox" id="cu-acepto" required> He leído <button type="button" class="cu-enlace" data-cu="privacidad">cómo se usan mis datos</button></label>
      <p class="cu-estado" role="alert"></p>
      <div class="cu-acciones"><button class="primary" type="submit">Crear cuenta</button><button type="button" class="cu-enlace" data-cu="entrar">Ya tengo cuenta</button></div></form>`, c => {
      c.querySelector("#cu-f").onsubmit = async e => { e.preventDefault(); const f = e.target;
        const nombre = f.querySelector("#cu-nombre").value.trim(), email = f.querySelector("#cu-email").value.trim(), password = f.querySelector("#cu-pass").value;
        if (!nombre) return estadoForm(f, "Escribe tu nombre.");
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return estadoForm(f, "Ese email no es válido.");
        if (password.length < 8) return estadoForm(f, "La contraseña debe tener al menos 8 caracteres.");
        if (!f.querySelector("#cu-acepto").checked) return estadoForm(f, "Marca la casilla de privacidad para continuar.");
        ocupado(f, true); estadoForm(f, "Creando la cuenta…", "");
        const {data, error} = await sb.auth.signUp({email, password, options: {data: {nombre, oposicion: f.querySelector("#cu-op").value || null}, emailRedirectTo: volver()}});
        ocupado(f, false);
        if (error) return estadoForm(f, mensaje(error));
        if (data.session) return cerrarDlg();   // proyectos sin confirmación de email
        dlg("Revisa tu correo", `<p>Te hemos enviado un email a <b>${h(email)}</b> con un enlace para confirmar la cuenta. Ábrelo y volverás aquí con la sesión iniciada.</p>
          <p class="note">Si no lo ves en unos minutos, mira en la carpeta de spam.</p><div class="cu-acciones"><button class="primary" onclick="this.closest('dialog').close()">Entendido</button></div>`);
      };
    });
  }
  function dlgRecuperar(email = "") {
    dlg("Recuperar la contraseña", `<form id="cu-f" class="cu-form" novalidate>
      <p class="note" style="margin-top:-4px">Te enviaremos un enlace para elegir una contraseña nueva.</p>
      <label for="cu-email">Email<input id="cu-email" type="email" autocomplete="email" required value="${h(email)}"></label>
      <p class="cu-estado" role="alert"></p>
      <div class="cu-acciones"><button class="primary" type="submit">Enviar el enlace</button><button type="button" class="cu-enlace" data-cu="entrar">Volver</button></div></form>`, c => {
      c.querySelector("#cu-f").onsubmit = async e => { e.preventDefault(); const f = e.target, email = f.querySelector("#cu-email").value.trim();
        if (!email) return estadoForm(f, "Escribe tu email.");
        ocupado(f, true);
        const {error} = await sb.auth.resetPasswordForEmail(email, {redirectTo: volver() + "?tipo=recuperar"});
        ocupado(f, false);
        estadoForm(f, error ? mensaje(error) : "Si hay una cuenta con ese email, te llegará el enlace en unos minutos.", error ? "error" : "ok");
      };
    });
  }
  function dlgNuevaClave() {
    dlg("Elige una contraseña nueva", `<form id="cu-f" class="cu-form" novalidate>
      <label for="cu-pass">Contraseña nueva<input id="cu-pass" type="password" autocomplete="new-password" required minlength="8"></label>
      <label for="cu-pass2">Repítela<input id="cu-pass2" type="password" autocomplete="new-password" required minlength="8"></label>
      <p class="cu-estado" role="alert"></p><div class="cu-acciones"><button class="primary" type="submit">Guardar contraseña</button></div></form>`, c => {
      c.querySelector("#cu-f").onsubmit = async e => { e.preventDefault(); const f = e.target, p1 = f.querySelector("#cu-pass").value;
        if (p1.length < 8) return estadoForm(f, "Debe tener al menos 8 caracteres.");
        if (p1 !== f.querySelector("#cu-pass2").value) return estadoForm(f, "Las dos contraseñas no coinciden.");
        ocupado(f, true); const {error} = await sb.auth.updateUser({password: p1}); ocupado(f, false);
        if (error) return estadoForm(f, mensaje(error));
        cerrarDlg(); aviso("Contraseña cambiada", "ok");
      };
    });
  }

  // ---------- mi cuenta ----------
  async function dlgCuenta() {
    const p = PERFIL;
    let prep = "";
    if (p.preparador_id) { const r = await sb.from("perfiles").select("nombre").eq("id", p.preparador_id).maybeSingle(); prep = r.data?.nombre || "tu preparador"; }
    const ops = Object.entries(window.INDICE || {}).map(([k, v]) => `<option value="${k}"${k === p.oposicion ? " selected" : ""}>${h(v.cfg.nombre)}</option>`).join("");
    dlg("Mi cuenta", `<div class="cu-ficha-yo"><p><b>${h(p.nombre || "Sin nombre")}</b> · ${ROL[p.rol]}<br><span class="note">${h(EMAIL)}</span></p></div>
      <form id="cu-f" class="cu-form" novalidate>
        <label for="cu-nombre">Nombre<input id="cu-nombre" maxlength="80" value="${h(p.nombre)}" autocomplete="name"></label>
        <label for="cu-op">Oposición que preparas<select id="cu-op"><option value="">Ninguna en concreto</option>${ops}</select></label>
        <p class="cu-estado" role="alert"></p><div class="cu-acciones"><button class="primary" type="submit">Guardar cambios</button></div></form>
      <section class="cu-bloque"><h3>Preparador</h3>${p.preparador_id
        ? `<p>Te prepara <b>${h(prep)}</b>: ve tu progreso y te puede poner tareas.</p><button id="cu-dejar">Dejar de tener preparador</button>`
        : `<form id="cu-fc" class="cu-form cu-fila" novalidate><label for="cu-codigo">Código de tu preparador<input id="cu-codigo" maxlength="8" autocomplete="off" placeholder="8 letras y números" style="text-transform:uppercase"></label><button type="submit">Unirme</button><p class="cu-estado" role="alert"></p></form>`}</section>
      ${p.rol !== "opositor" ? `<section class="cu-bloque"><h3>Tu código de invitación</h3><p class="note">Dáselo a tus alumnos: al escribirlo en su cuenta quedan unidos a ti.</p><p class="cu-codigo-v" id="cu-codigo-v">${h(p.codigo || "Aún no tienes código")}</p><span class="acc"><button id="cu-gen">${p.codigo ? "Generar otro" : "Generar código"}</button>${p.codigo ? `<button id="cu-copiar">Copiar</button>` : ""}</span></section>` : ""}
      <section class="cu-bloque"><h3>Seguridad</h3><span class="acc"><button id="cu-clave">Cambiar la contraseña</button><button id="cu-salir">Cerrar sesión</button></span></section>
      <section class="cu-bloque cu-peligro"><h3>Borrar mi cuenta</h3><p class="note">Se borran tu cuenta, tu progreso, tus tareas y tus notas. No se puede deshacer.</p><button id="cu-borrar">Borrar mi cuenta</button></section>`, c => {
      c.querySelector("#cu-f").onsubmit = async e => { e.preventDefault(); const f = e.target;
        const cambios = {nombre: f.querySelector("#cu-nombre").value.trim(), oposicion: f.querySelector("#cu-op").value || null};
        ocupado(f, true); const {error} = await sb.from("perfiles").update(cambios).eq("id", p.id); ocupado(f, false);
        if (error) return estadoForm(f, mensaje(error));
        Object.assign(PERFIL, cambios); pintarBoton(); estadoForm(f, "Guardado", "ok"); };
      const fc = c.querySelector("#cu-fc");
      if (fc) fc.onsubmit = async e => { e.preventDefault(); const cod = fc.querySelector("#cu-codigo").value.trim();
        if (!cod) return estadoForm(fc, "Escribe el código.");
        const {data, error} = await sb.rpc("unirse_preparador", {p_usuario: PERFIL.id, p_codigo: cod});
        if (error) return estadoForm(fc, mensaje(error));
        await cargarPerfil(); aviso(`Ya estás con ${data || "tu preparador"}`, "ok"); dlgCuenta(); pintarTareas(); };
      c.querySelector("#cu-dejar")?.addEventListener("click", async e => { if (!confirmarBoton(e.currentTarget, "Pulsa otra vez para confirmar")) return;
        const {error} = await sb.rpc("dejar_preparador", {p_usuario: PERFIL.id}); if (error) return aviso(mensaje(error), "error");
        await cargarPerfil(); dlgCuenta(); pintarTareas(); });
      c.querySelector("#cu-gen")?.addEventListener("click", async () => { const {data, error} = await sb.rpc("generar_codigo");
        if (error) return aviso(mensaje(error), "error"); PERFIL.codigo = data; dlgCuenta(); pintarRoles(); });
      c.querySelector("#cu-copiar")?.addEventListener("click", e => copiar(p.codigo, e.currentTarget));
      c.querySelector("#cu-clave").onclick = dlgNuevaClave;
      c.querySelector("#cu-salir").onclick = async () => { cerrarDlg(); await sb.auth.signOut(); };
      c.querySelector("#cu-borrar").onclick = async e => { if (!confirmarBoton(e.currentTarget, "Pulsa otra vez: se borrará todo")) return;
        const {error} = await sb.rpc("borrar_mi_cuenta", {p_usuario: PERFIL.id}); if (error) return aviso(mensaje(error), "error");
        cerrarDlg(); await sb.auth.signOut(); aviso("Tu cuenta y tus datos se han borrado", "ok"); };
    });
  }
  // confirmación en dos pulsaciones (la página no puede usar confirm())
  function confirmarBoton(b, texto) {
    if (b.dataset.seguro === "1") { b.dataset.seguro = ""; return true; }
    const antes = b.textContent; b.dataset.seguro = "1"; b.textContent = texto;
    setTimeout(() => { if (b.isConnected && b.dataset.seguro === "1") { b.dataset.seguro = ""; b.textContent = antes; } }, 5000);
    return false;
  }
  async function copiar(texto, b) {
    try { await navigator.clipboard.writeText(texto); b.textContent = "Copiado"; }
    catch (e) { const r = document.createRange(); r.selectNodeContents(q("#cu-codigo-v")); getSelection().removeAllRanges(); getSelection().addRange(r); b.textContent = "Selecciónalo y cópialo"; }
  }
  function verPrivacidad() {
    dlg("Privacidad y datos personales", `<div class="cu-texto">
      <p><b>Sin cuenta</b> no se guarda nada en ningún servidor: tu progreso se queda en este navegador.</p>
      <p><b>Con cuenta</b> se guardan tu email, tu nombre, la oposición que preparas y tus exámenes corregidos (nota, aciertos, fallos y qué preguntas has acertado). La contraseña se guarda cifrada y nadie, ni el administrador, puede verla.</p>
      <p><b>Quién ve tus datos:</b> tú; tu preparador, solo si te unes a él con su código; y el administrador de la web, para gestionar las cuentas. No se ceden a terceros ni se usan para publicidad.</p>
      <p><b>Dónde están:</b> en Supabase, un servicio de bases de datos con servidores en la Unión Europea.</p>
      <p><b>Tus derechos:</b> puedes corregir tu nombre y borrar tu progreso o tu cuenta entera en cualquier momento desde «Mi cuenta». Al borrar la cuenta se eliminan todos tus datos.</p>
      ${CFG.contacto ? `<p><b>Contacto:</b> ${h(CFG.contacto)}</p>` : ""}</div><div class="cu-acciones"><button class="primary" onclick="this.closest('dialog').close()">Cerrar</button></div>`);
  }

  // ---------- sesión y progreso en la nube ----------
  async function cargarPerfil() {
    const {data: {user}} = await sb.auth.getUser();
    if (!user) { PERFIL = null; EMAIL = ""; return; }
    EMAIL = user.email || "";
    const {data, error} = await sb.from("perfiles").select("*").eq("id", user.id).maybeSingle();
    if (error || !data) { PERFIL = null; console.warn("perfil no disponible", error?.message); return; }
    PERFIL = data;
  }
  // los avisos de sesión pueden llegar dos a la vez (SIGNED_IN e INITIAL_SESSION): se atienden de uno en uno
  let entrando = null;
  function alEntrar() { if (!entrando) entrando = entrar().finally(() => { entrando = null; }); return entrando; }
  async function entrar() {
    if (PERFIL) alSalir();   // cambio de cuenta (por ejemplo, desde otra pestaña): primero se cierra la anterior
    await cargarPerfil();
    if (!PERFIL) { pintarBoton(); return; }
    if (!PERFIL.activo) { aviso("Tu cuenta está desactivada. Habla con el administrador de la web.", "error"); await sb.auth.signOut(); return; }
    LS_SUF = "-" + PERFIL.id;
    pintarBoton();
    if (op()) { await cargarProgreso(); await ofrecerImportar(); await traerCurso(); reintentarPendientes(); }
    pintarTareas(); pintarRoles();
  }
  function alSalir() {
    PERFIL = null; EMAIL = ""; LS_SUF = "";
    if (op()) { HIST = loadHist(); drawHist(); drawCurso(); syncConfig(); }
    q("#cu-tareas")?.remove(); q("#alumnos")?.remove(); q("#administracion")?.remove();
    document.querySelectorAll(".cu-navrol").forEach(a => a.remove());
    pintarBoton();
  }
  async function todas(consulta) {   // PostgREST devuelve como mucho 1000 filas por petición
    const out = [];
    for (let i = 0; ; i += 1000) { const {data, error} = await consulta().range(i, i + 999); if (error) throw error; out.push(...data); if (data.length < 1000) return out; }
  }
  async function cargarProgreso() {
    try {
      const [rs, its] = await Promise.all([
        todas(() => sb.from("respuestas").select("pregunta, vistas, aciertos, ultimo").eq("usuario", PERFIL.id).eq("oposicion", op())),
        // los 500 más recientes (con el juego se acumulan muchos intentos), en orden de fecha
        sb.from("intentos").select("tipo, n, ok, ko, bl, nota, creado").eq("usuario", PERFIL.id).eq("oposicion", op()).order("creado", {ascending: false}).limit(500)]);
      if (its.error) throw its.error;
      HIST = {stats: Object.fromEntries(rs.map(r => [r.pregunta, {vistas: r.vistas, aciertos: r.aciertos, ultimo: r.ultimo}])),
        intentos: its.data.reverse().map(i => ({t: +new Date(i.creado), tipo: i.tipo, n: i.n, ok: i.ok, ko: i.ko, bl: i.bl, nota120: +i.nota}))};
      saveHist(HIST); drawHist(); syncConfig();
    } catch (e) { aviso("No se pudo cargar tu progreso: " + mensaje(e) + " Se muestra la última copia de este dispositivo.", "error"); HIST = loadHist(); drawHist(); }
  }
  async function ofrecerImportar() {
    let local; try { local = JSON.parse(localStorage.getItem(LS)) || null; } catch (e) { local = null; }
    if (!local?.intentos?.length || HIST.intentos.length) return;
    q("#ex-prog")?.insertAdjacentHTML("afterbegin", `<div class="cu-invitacion" id="cu-importar"><p>En este navegador tienes <b>${local.intentos.length}</b> examen${local.intentos.length > 1 ? "es" : ""} de ${h(C.nombreCorto)} hechos sin cuenta. ¿Los pasamos a tu cuenta?</p>
      <span class="acc"><button class="primary" id="cu-imp-si">Pasarlos a mi cuenta</button><button id="cu-imp-no">No, empezar de cero</button></span></div>`);
    q("#cu-imp-no").onclick = () => q("#cu-importar").remove();
    q("#cu-imp-si").onclick = async () => {
      const {data, error} = await sb.rpc("importar_local", {p_usuario: PERFIL.id, p_oposicion: op(), p_stats: local.stats || {}, p_intentos: local.intentos.slice(-500), p_escala: ESC});
      if (error) return aviso(mensaje(error), "error");
      q("#cu-importar").remove(); aviso(`${data} examen${data === 1 ? "" : "es"} pasados a tu cuenta`, "ok"); cargarProgreso();
    };
  }
  async function traerCurso() {
    const {data} = await sb.from("cursos").select("datos, actualizado").eq("usuario", PERFIL.id).eq("oposicion", op()).maybeSingle();
    if (!data) return;
    const local = leerCurso();
    if (!local || (data.datos.t || 0) > (local.t || 0)) { try { localStorage.setItem(LSC(), JSON.stringify(data.datos)); } catch (e) { /* sin almacenamiento */ } }
    drawCurso();
  }

  // ---------- opositor: tareas y notas de su preparador ----------
  async function pintarTareas() {
    q("#cu-tareas")?.remove();
    if (!PERFIL || !op()) return;
    const [ts, ns] = await Promise.all([
      sb.from("tareas").select("*").eq("alumno", PERFIL.id).order("creada", {ascending: false}).limit(30),
      sb.from("notas").select("texto, creada, preparador").eq("alumno", PERFIL.id).order("creada", {ascending: false}).limit(5)]);
    const tareas = ts.data || [], notas = ns.data || [];
    const pend = tareas.filter(t => !t.completada), hechas = tareas.filter(t => t.completada).slice(0, 5);
    if (!pend.length && !notas.length && !hechas.length) return;
    const hoy = new Date().toISOString().slice(0, 10);
    const desc = t => `${MODOS[t.modo]}${t.modo === "tema" && t.tema ? ": " + h(window.INDICE?.[t.oposicion]?.temas?.[t.tema] || t.tema) : ""}${t.n && t.modo !== "sim" ? `, ${t.n} preguntas` : ""}`;
    const el = document.createElement("div"); el.className = "cu-tareas"; el.id = "cu-tareas";
    el.innerHTML = `<h3>Tareas de tu preparador</h3>` + (pend.length ? `<ul class="cu-lista">${pend.map(t => `<li class="${t.fecha_limite && t.fecha_limite < hoy ? "tarde" : ""}">
        <span><b>${desc(t)}</b>${t.oposicion !== op() ? ` <span class="pill">${h(nombreOp(t.oposicion))}</span>` : ""}<br>
        <span class="note">${t.fecha_limite ? (t.fecha_limite < hoy ? "Fuera de plazo: era para el " : "Para el ") + fecha(t.fecha_limite + "T12:00") : "Sin fecha límite"}${t.mensaje ? " · " + h(t.mensaje) : ""}</span></span>
        <button class="primary" data-tarea="${t.id}">${t.oposicion === op() ? "Empezar" : "Ir a " + h(nombreOp(t.oposicion))}</button></li>`).join("")}</ul>` : `<p class="note">No tienes tareas pendientes.</p>`)
      + (hechas.length ? `<details><summary>Hechas recientemente (${hechas.length})</summary><ul class="cu-lista">${hechas.map(t => `<li><span>${desc(t)}<br><span class="note">Hecha el ${fecha(t.completada)}</span></span></li>`).join("")}</ul></details>` : "")
      + (notas.length ? `<h3 style="margin-top:12px">Notas de tu preparador</h3><ul class="cu-notas">${notas.map(n => `<li><p>${h(n.texto)}</p><span class="note">${fecha(n.creada)}</span></li>`).join("")}</ul>` : "");
    q("#ex-config")?.prepend(el);
    el.querySelectorAll("[data-tarea]").forEach(b => b.onclick = () => empezarTarea(tareas.find(t => t.id === +b.dataset.tarea)));
  }
  function empezarTarea(t) {
    if (t.oposicion !== op()) { try { sessionStorage.setItem("cu-tarea", String(t.id)); } catch (e) { /* sin almacenamiento */ } return elegirOp(t.oposicion); }
    document.querySelector(`input[name="modo"][value="${t.modo}"]`).checked = true;
    if (t.modo === "tema") { selTema.value = "T:" + t.tema; if (selTema.value !== "T:" + t.tema) return aviso("Ese tema ya no tiene preguntas en los exámenes de práctica.", "error"); }
    if (t.n && (t.modo === "tema" || t.modo === "rapido")) { const s = q("#ex-n");
      if (![...s.options].some(o => +o.value === t.n)) s.insertAdjacentHTML("beforeend", `<option value="${t.n}">${t.n}</option>`); s.value = String(t.n); }
    syncConfig(); q("#ex-start").click();
    if (CUR) { CUR.tarea = t.id; CUR.tipo = "Tarea: " + CUR.tipo; guardarCurso(); }
  }

  // ---------- preparador y administrador ----------
  function pintarRoles() {
    q("#alumnos")?.remove(); q("#administracion")?.remove(); document.querySelectorAll(".cu-navrol").forEach(a => a.remove());
    if (!PERFIL || PERFIL.rol === "opositor") return;
    const ancla = q("#examenes");
    if (!ancla) return;   // en la portada no hay paneles
    const roles = q("#nav-roles");
    ancla.insertAdjacentHTML("afterend", `<section id="alumnos" class="cu-sec"><header><h2>Mis alumnos</h2><p class="ink2">Los opositores que se han unido con tu código. Ves su progreso en cualquier oposición y puedes ponerles tareas y dejarles notas.</p></header><div id="al-cuerpo"><p class="note">Cargando…</p></div></section>`);
    if (PERFIL.rol === "admin") {
      q("#alumnos").insertAdjacentHTML("afterend", `<section id="administracion" class="cu-sec"><header><h2>Administración</h2><p class="ink2">Todas las cuentas de la web. Los cambios se guardan al momento.</p></header><div id="ad-cuerpo"><p class="note">Cargando…</p></div></section>`);
      // con dos entradas van en un desplegable, como «Análisis»: así el menú cabe en una línea en el ordenador
      roles?.insertAdjacentHTML("beforeend", `<div class="nav-grupo cu-navrol"><button type="button" class="nav-abre" id="nav-gestion-b" aria-expanded="false" aria-controls="nav-gestion">Gestión
          <svg viewBox="0 0 10 10" aria-hidden="true"><path d="M1.5 3.5 5 7l3.5-3.5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg></button>
        <div class="nav-menu" id="nav-gestion" hidden><span class="nav-menu-t">Gestión</span>
          <a href="#alumnos" data-sec="alumnos"><b>Mis alumnos</b><small>Su progreso, tareas y notas</small></a>
          <a href="#administracion" data-sec="administracion"><b>Administración</b><small>Todas las cuentas de la web</small></a></div></div>`);
      pintarAdmin();
    } else roles?.insertAdjacentHTML("beforeend", `<a href="#alumnos" class="cu-navrol" data-sec="alumnos">Mis alumnos</a>`);
    pintarAlumnos();
  }

  async function pintarAlumnos() {
    const el = q("#al-cuerpo"); if (!el) return;
    const {data, error} = await sb.rpc("mis_alumnos");
    if (error) { el.innerHTML = `<p class="cu-estado error">${h(mensaje(error))}</p>`; return; }
    const cod = PERFIL.codigo;
    el.innerHTML = `<div class="panel cu-codigo"><div><b>Tu código de invitación:</b> <span class="cu-codigo-v" id="cu-codigo-v">${h(cod || "aún no tienes")}</span>
        <p class="note">Tus alumnos lo escriben en «Mi cuenta» para unirse a ti.</p></div><span class="acc">${cod ? `<button id="al-copiar">Copiar</button>` : ""}<button id="al-gen">${cod ? "Generar otro" : "Generar código"}</button></span></div>` +
      (data.length ? `<div class="scroll"><table class="cu-tabla"><thead><tr><th>Alumno</th><th>Oposición</th><th>Última actividad</th><th class="num">Exámenes</th><th class="num">Media últimos 5</th><th class="num">Último</th><th class="num">Tareas pendientes</th><th></th></tr></thead><tbody>` +
        data.map(a => `<tr><td><b>${h(a.nombre || "Sin nombre")}</b><br><span class="note">${h(a.email)}</span></td><td>${h(nombreOp(a.oposicion))}</td><td>${hace(a.ultima_actividad)}</td>
          <td class="num">${a.intentos}</td><td class="num">${a.nota_media == null ? "—" : fmt(+a.nota_media) + " %"}</td><td class="num">${a.ultima_nota == null ? "—" : fmt(+a.ultima_nota, 1) + " / " + a.escala}</td>
          <td class="num">${a.tareas_pendientes}</td><td><span class="acc"><button data-ficha="${a.id}">Ver ficha</button><button data-poner="${a.id}">Poner tarea</button></span></td></tr>`).join("") + `</tbody></table></div><div id="al-ficha"></div>`
        : `<p class="note" style="margin-top:12px">Aún no tienes alumnos. Pásales tu código para que se unan.</p>`);
    q("#al-copiar")?.addEventListener("click", e => copiar(cod, e.currentTarget));
    q("#al-gen").onclick = async () => { const r = await sb.rpc("generar_codigo"); if (r.error) return aviso(mensaje(r.error), "error"); PERFIL.codigo = r.data; pintarAlumnos(); };
    const porId = Object.fromEntries(data.map(a => [a.id, a]));
    el.querySelectorAll("[data-ficha]").forEach(b => b.onclick = () => ficha(porId[b.dataset.ficha], q("#al-ficha"), {puedeQuitar: true}));
    el.querySelectorAll("[data-poner]").forEach(b => b.onclick = () => dlgTarea(porId[b.dataset.poner]));
  }

  // ficha de un opositor: evolución, acierto por tema, tareas y notas
  async function ficha(a, cont, {puedeQuitar = false} = {}) {
    cont.innerHTML = `<div class="panel cu-ficha"><p class="note">Cargando la ficha…</p></div>`;
    const [its, ts, ns] = await Promise.all([
      sb.from("intentos").select("id, oposicion, tipo, n, ok, ko, bl, nota, escala, segundos, por_tema, creado").eq("usuario", a.id).order("creado", {ascending: false}).limit(200),
      sb.from("tareas").select("*").eq("alumno", a.id).order("creada", {ascending: false}).limit(50),
      sb.from("notas").select("id, texto, creada, preparador").eq("alumno", a.id).order("creada", {ascending: false}).limit(20)]);
    const err = its.error || ts.error || ns.error;
    if (err) { cont.innerHTML = `<div class="panel"><p class="cu-estado error">${h(mensaje(err))}</p></div>`; return; }
    const intentos = its.data;
    const ops = [...new Set(intentos.map(i => i.oposicion))];
    const opF = a.oposicion && ops.includes(a.oposicion) ? a.oposicion : ops[0] || a.oposicion;
    // las partidas del juego de la racha van aparte: su «nota» es cuántas preguntas acertó seguidas
    const esJuego = i => String(i.tipo).startsWith("Juego de la racha");
    const delOp = intentos.filter(i => i.oposicion === opF && !esJuego(i)), juegos = intentos.filter(i => i.oposicion === opF && esJuego(i));
    // acierto por tema sumando el detalle de cada examen
    const temas = {};
    delOp.forEach(i => Object.entries(i.por_tema || {}).forEach(([t, x]) => { const o = temas[t] = temas[t] || {n: 0, mal: 0}; o.n += x.n; o.mal += x.mal; }));
    const nombres = window.INDICE?.[opF]?.temas || {};
    const peores = Object.entries(temas).filter(([, x]) => x.n >= 3).map(([t, x]) => ({t, n: x.n, ac: 1 - x.mal / x.n})).sort((p, r) => p.ac - r.ac).slice(0, 8);
    const ult = delOp.slice(0, 20).reverse();
    cont.innerHTML = `<div class="panel cu-ficha"><div class="controls" style="justify-content:space-between;align-items:baseline"><h3>${h(a.nombre || "Sin nombre")} <span class="note">${h(a.email || "")}</span></h3>
        <span class="acc"><button data-poner-f="1">Poner tarea</button>${puedeQuitar ? `<button id="fi-quitar">Dejar de llevarlo</button>` : ""}<button id="fi-cerrar">Cerrar ficha</button></span></div>
      ${ops.length > 1 ? `<p class="note">Ha practicado ${ops.map(nombreOp).join(", ")}; aquí se muestra ${h(nombreOp(opF))}.</p>` : ""}
      ${juegos.length ? `<p class="note">Juego de la racha: récord de <b>${Math.max(...juegos.map(i => +i.nota))}</b> seguidas en ${juegos.length} partida${juegos.length === 1 ? "" : "s"}.</p>` : ""}
      ${delOp.length ? `<div class="grid2"><div><h4>Evolución de la nota (últimos ${ult.length})</h4>${grafNotas(ult)}</div>
        <div><h4>Acierto por tema, los más flojos primero</h4>${peores.length ? `<ul class="cu-temas">${peores.map(p => `<li><span>${h(nombres[p.t] || p.t)}</span><span class="cu-barra"><i style="width:${Math.round(100 * p.ac)}%"></i></span><span class="num">${Math.round(100 * p.ac)} % de ${p.n}</span></li>`).join("")}</ul>` : `<p class="note">Aún no hay bastantes preguntas por tema.</p>`}</div></div>
        <h4>Exámenes</h4><div class="scroll"><table class="cu-tabla"><thead><tr><th>Fecha</th><th>Tipo</th><th class="num">Nota</th><th class="num">Aciertos</th><th class="num">Fallos</th><th class="num">En blanco</th><th class="num">Tiempo</th></tr></thead><tbody>${delOp.slice(0, 15).map(i => `<tr><td>${fecha(i.creado)}</td><td>${h(i.tipo)}</td><td class="num"><b>${fmt(+i.nota, 1)}</b> / ${i.escala}</td><td class="num">${i.ok}</td><td class="num">${i.ko}</td><td class="num">${i.bl}</td><td class="num">${i.segundos == null ? "—" : i.segundos < 60 ? "menos de 1 min" : Math.round(i.segundos / 60) + " min"}</td></tr>`).join("")}</tbody></table></div>`
        : `<p class="note">Todavía no ha hecho ningún examen con su cuenta.</p>`}
      <div class="grid2"><div><h4>Tareas</h4>${ts.data.length ? `<ul class="cu-lista">${ts.data.map(t => `<li><span><b>${MODOS[t.modo]}${t.modo === "tema" && t.tema ? ": " + h(window.INDICE?.[t.oposicion]?.temas?.[t.tema] || t.tema) : ""}</b><br><span class="note">${t.completada ? "Hecha el " + fecha(t.completada) + (t.intento ? notaDe(intentos, t.intento) : "") : t.fecha_limite ? "Para el " + fecha(t.fecha_limite + "T12:00") : "Pendiente, sin fecha"}</span></span>${!t.completada && (t.preparador === PERFIL.id || PERFIL.rol === "admin") ? `<button data-borrar-t="${t.id}">Quitar</button>` : ""}</li>`).join("")}</ul>` : `<p class="note">Sin tareas.</p>`}</div>
        <div><h4>Notas para el alumno</h4><form id="fi-nota" class="cu-form" novalidate><label for="fi-nota-t">Nueva nota (la verá en su página de exámenes)<textarea id="fi-nota-t" maxlength="2000" rows="3"></textarea></label><p class="cu-estado" role="alert"></p><div class="cu-acciones"><button type="submit">Enviar nota</button></div></form>
          ${ns.data.length ? `<ul class="cu-notas">${ns.data.map(n => `<li><p>${h(n.texto)}</p><span class="note">${fecha(n.creada)}</span>${n.preparador === PERFIL.id || PERFIL.rol === "admin" ? ` <button class="cu-enlace" data-borrar-n="${n.id}">Borrar</button>` : ""}</li>`).join("")}</ul>` : ""}</div></div></div>`;
    cont.scrollIntoView({behavior: "smooth", block: "start"});
    const repintar = () => ficha(a, cont, {puedeQuitar});
    cont.querySelector("#fi-cerrar").onclick = () => { cont.innerHTML = ""; };
    cont.querySelector("[data-poner-f]").onclick = () => dlgTarea(a, repintar);
    cont.querySelector("#fi-quitar")?.addEventListener("click", async e => { if (!confirmarBoton(e.currentTarget, "Pulsa otra vez para confirmar")) return;
      const {error} = await sb.rpc("quitar_alumno", {p_alumno: a.id}); if (error) return aviso(mensaje(error), "error");
      cont.innerHTML = ""; aviso("Ya no llevas a este alumno", "ok"); pintarAlumnos(); });
    cont.querySelectorAll("[data-borrar-t]").forEach(b => b.onclick = async () => { const {error} = await sb.from("tareas").delete().eq("id", +b.dataset.borrarT);
      if (error) return aviso(mensaje(error), "error"); repintar(); pintarAlumnos(); });
    cont.querySelectorAll("[data-borrar-n]").forEach(b => b.onclick = async () => { const {error} = await sb.from("notas").delete().eq("id", +b.dataset.borrarN);
      if (error) return aviso(mensaje(error), "error"); repintar(); });
    cont.querySelector("#fi-nota").onsubmit = async e => { e.preventDefault(); const f = e.target, texto = f.querySelector("textarea").value.trim();
      if (!texto) return estadoForm(f, "Escribe la nota.");
      ocupado(f, true); const {error} = await sb.from("notas").insert({preparador: PERFIL.id, alumno: a.id, texto}); ocupado(f, false);
      if (error) return estadoForm(f, mensaje(error)); aviso("Nota enviada", "ok"); repintar(); };
  }
  const notaDe = (its, id) => { const i = its.find(x => x.id === id); return i ? `: ${fmt(+i.nota, 1)} / ${i.escala}` : ""; };
  function grafNotas(it) {
    if (it.length < 2) return `<p class="note">Hace falta más de un examen para ver la evolución.</p>`;
    const W = 420, H = 120, m = {l: 32, r: 10, t: 10, b: 18}, v = it.map(i => 100 * i.nota / i.escala);
    const top = 100, bot = Math.min(0, ...v), x = k => m.l + (W - m.l - m.r) * k / (it.length - 1), y = p => m.t + (H - m.t - m.b) * (top - p) / (top - bot);
    return `<svg class="spark" viewBox="0 0 ${W} ${H}" role="img" aria-label="Evolución de la nota en porcentaje del máximo">
      ${[0, 50, 100].map(p => `<line x1="${m.l}" x2="${W - m.r}" y1="${y(p)}" y2="${y(p)}" style="stroke:var(--rule)"/><text x="${m.l - 4}" y="${y(p) + 4}" text-anchor="end" font-size="10" style="fill:var(--muted)">${p} %</text>`).join("")}
      <polyline points="${v.map((p, k) => `${x(k).toFixed(1)},${y(p).toFixed(1)}`).join(" ")}" fill="none" style="stroke:var(--pen)" stroke-width="2"/>
      ${v.map((p, k) => `<circle cx="${x(k).toFixed(1)}" cy="${y(p).toFixed(1)}" r="${k === v.length - 1 ? 4 : 2.5}" style="fill:var(--pen)"><title>${fecha(it[k].creado)}: ${fmt(+it[k].nota, 1)} / ${it[k].escala}</title></circle>`).join("")}</svg>`;
  }

  function dlgTarea(a, despues) {
    const opT = a.oposicion || op() || Object.keys(window.INDICE || {})[0];
    const opciones = k => { const t = window.INDICE?.[k]?.temas || {}; return Object.entries(t).filter(([c]) => !c.startsWith("X") && c !== "??").map(([c, n]) => `<option value="${c}">${h(c)}. ${h(n)}</option>`).join(""); };
    const manana = new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10);
    dlg(`Poner una tarea a ${h(a.nombre || "tu alumno")}`, `<form id="cu-f" class="cu-form" novalidate>
      <label for="ta-op">Oposición<select id="ta-op">${Object.entries(window.INDICE || {}).map(([k, v]) => `<option value="${k}"${k === opT ? " selected" : ""}>${h(v.cfg.nombre)}</option>`).join("")}</select></label>
      <label for="ta-modo">Qué tiene que hacer<select id="ta-modo">${Object.entries(MODOS).map(([k, v]) => `<option value="${k}"${k === "tema" ? " selected" : ""}>${v}</option>`).join("")}</select></label>
      <label for="ta-tema" id="ta-tema-l">Tema<select id="ta-tema">${opciones(opT)}</select></label>
      <label for="ta-n" id="ta-n-l">Número de preguntas<select id="ta-n">${[10, 20, 30, 40, 60].map(n => `<option${n === 20 ? " selected" : ""}>${n}</option>`).join("")}</select></label>
      <label for="ta-fecha">Fecha límite<input id="ta-fecha" type="date" value="${manana}" min="${new Date().toISOString().slice(0, 10)}"></label>
      <label for="ta-msg">Mensaje (opcional)<textarea id="ta-msg" maxlength="500" rows="2" placeholder="Por ejemplo: céntrate en los plazos"></textarea></label>
      <p class="cu-estado" role="alert"></p><div class="cu-acciones"><button class="primary" type="submit">Poner la tarea</button></div></form>`, c => {
      const sinc = () => { const m = c.querySelector("#ta-modo").value; c.querySelector("#ta-tema-l").hidden = m !== "tema"; c.querySelector("#ta-n-l").hidden = m === "sim" || m === "fallos"; };
      c.querySelector("#ta-modo").onchange = sinc; sinc();
      c.querySelector("#ta-op").onchange = e => { c.querySelector("#ta-tema").innerHTML = opciones(e.target.value); };
      c.querySelector("#cu-f").onsubmit = async e => { e.preventDefault(); const f = e.target, modo = f.querySelector("#ta-modo").value;
        const t = {preparador: PERFIL.id, alumno: a.id, oposicion: f.querySelector("#ta-op").value, modo,
          tema: modo === "tema" ? f.querySelector("#ta-tema").value : null, n: modo === "tema" || modo === "rapido" ? +f.querySelector("#ta-n").value : null,
          fecha_limite: f.querySelector("#ta-fecha").value || null, mensaje: f.querySelector("#ta-msg").value.trim()};
        ocupado(f, true); const {error} = await sb.from("tareas").insert(t); ocupado(f, false);
        if (error) return estadoForm(f, mensaje(error));
        cerrarDlg(); aviso("Tarea puesta. La verá en su página de exámenes.", "ok"); pintarAlumnos(); despues?.();
      };
    });
  }

  async function pintarAdmin() {
    const el = q("#ad-cuerpo"); if (!el) return;
    const [us, es] = await Promise.all([sb.rpc("admin_usuarios"), sb.rpc("admin_estadisticas")]);
    if (us.error || es.error) { el.innerHTML = `<p class="cu-estado error">${h(mensaje(us.error || es.error))}</p>`; return; }
    const U = us.data, E = es.data, preps = U.filter(u => (u.rol === "preparador" || u.rol === "admin") && u.activo);
    const nombreDe = id => { const u = U.find(x => x.id === id); return u ? (u.nombre || u.email) : "—"; };
    el.innerHTML = `<div class="pkpis"><div><b>${E.usuarios}</b><span>${E.usuarios === 1 ? "cuenta" : "cuentas"} (${pl(E.por_rol.opositor || 0, "opositor", "opositores")}, ${pl(E.por_rol.preparador || 0, "preparador", "preparadores")}, ${pl(E.por_rol.admin || 0, "administrador", "administradores")})</span></div>
        <div><b>${E.activos_7d}</b><span>${E.activos_7d === 1 ? "persona activa" : "personas activas"} en los últimos 7 días</span></div><div><b>${E.intentos_7d}</b><span>${E.intentos_7d === 1 ? "examen corregido" : "exámenes corregidos"} en 7 días</span></div>
        ${Object.entries(E.por_oposicion).map(([k, v]) => `<div><b>${v.intentos}</b><span>${v.intentos === 1 ? "examen" : "exámenes"} de ${h(nombreOp(k))}${v.nota_media != null ? `, media ${fmt(+v.nota_media)} %` : ""}</span></div>`).join("")}</div>
      <div class="controls" style="margin:14px 0 8px"><label for="ad-q">Buscar<input type="search" id="ad-q" placeholder="Nombre o email"></label>
        <label for="ad-rol">Rol<select id="ad-rol"><option value="">Todos</option>${Object.entries(ROL).map(([k, v]) => `<option value="${k}">${v}</option>`).join("")}</select></label>
        <label for="ad-sin" class="check"><input type="checkbox" id="ad-sin"> Solo opositores sin preparador</label></div>
      <div class="scroll"><table class="cu-tabla" id="ad-tabla"><thead><tr><th>Persona</th><th>Rol</th><th>Preparador</th><th>Oposición</th><th>Cuenta</th><th>Alta</th><th>Actividad</th><th class="num">Exámenes</th><th></th></tr></thead><tbody></tbody></table></div>
      <p class="note" id="ad-n"></p><div id="ad-ficha"></div>`;
    const fila = u => `<tr data-id="${u.id}"><td><b>${h(u.nombre || "Sin nombre")}</b><br><span class="note">${h(u.email)}${u.confirmado ? "" : " · sin confirmar"}</span></td>
      <td><select data-campo="rol" aria-label="Rol de ${h(u.nombre || u.email)}">${Object.entries(ROL).map(([k, v]) => `<option value="${k}"${k === u.rol ? " selected" : ""}>${v}</option>`).join("")}</select></td>
      <td>${u.rol === "opositor" ? `<select data-campo="preparador_id" aria-label="Preparador de ${h(u.nombre || u.email)}"><option value="">Sin preparador</option>${preps.filter(p => p.id !== u.id).map(p => `<option value="${p.id}"${p.id === u.preparador_id ? " selected" : ""}>${h(p.nombre || p.email)}</option>`).join("")}</select>` : `<span class="note">—</span>`}</td>
      <td>${h(nombreOp(u.oposicion))}</td>
      <td><label class="check"><input type="checkbox" data-campo="activo"${u.activo ? " checked" : ""}${u.id === PERFIL.id ? " disabled" : ""}> Activa</label></td>
      <td>${fecha(u.creado)}</td><td>${hace(u.ultima_actividad)}</td><td class="num">${u.intentos}</td>
      <td>${u.intentos ? `<button data-ficha-ad="${u.id}">Ver ficha</button>` : ""}</td></tr>`;
    const filtrar = () => { const t = q("#ad-q").value.trim().toLowerCase(), r = q("#ad-rol").value, sin = q("#ad-sin").checked;
      const l = U.filter(u => (!t || (u.nombre + " " + u.email).toLowerCase().includes(t)) && (!r || u.rol === r) && (!sin || (u.rol === "opositor" && !u.preparador_id)));
      q("#ad-tabla tbody").innerHTML = l.map(fila).join(""); q("#ad-n").textContent = `${l.length} de ${U.length} cuentas`; };
    ["#ad-q", "#ad-rol", "#ad-sin"].forEach(s => q(s).addEventListener(s === "#ad-q" ? "input" : "change", filtrar)); filtrar();
    q("#ad-tabla").addEventListener("change", async e => {
      const c = e.target.dataset.campo; if (!c) return;
      const tr = e.target.closest("tr"), id = tr.dataset.id, u = U.find(x => x.id === id);
      const valor = c === "activo" ? e.target.checked : (e.target.value || null);
      e.target.disabled = true;
      const {error} = await sb.from("perfiles").update({[c]: valor}).eq("id", id);
      e.target.disabled = id === PERFIL.id && c === "activo";
      if (error) { aviso(mensaje(error), "error"); if (c === "activo") e.target.checked = u.activo; else e.target.value = u[c] || ""; return; }
      u[c] = valor; aviso(`Guardado: ${u.nombre || u.email}, ${c === "rol" ? ROL[valor] : c === "activo" ? (valor ? "cuenta activada" : "cuenta desactivada") : "preparador " + (valor ? nombreDe(valor) : "quitado")}`, "ok");
      if (c === "rol") { pintarAdmin(); if (id === PERFIL.id) { await cargarPerfil(); pintarBoton(); pintarRoles(); } }
      if (c === "preparador_id") pintarAlumnos();
    });
    q("#ad-tabla").addEventListener("click", e => { const b = e.target.closest("[data-ficha-ad]"); if (!b) return;
      const u = U.find(x => x.id === b.dataset.fichaAd); ficha(u, q("#ad-ficha")); });
  }

  // ---------- arranque ----------
  async function iniciar() {
    if (LISTO) return; LISTO = true;
    if (!sb) { console.warn("Sin configuración de Supabase: la web funciona sin cuentas"); return; }
    montarBase(); pintarBoton();
    // el enlace de recuperación lleva ?tipo=recuperar (más fiable que esperar el evento de supabase-js)
    const u = new URL(location.href);
    let recuperando = u.searchParams.get("tipo") === "recuperar";
    const manejar = (ev, ses) => setTimeout(async () => {   // supabase-js pide no llamarle dentro del aviso
      if (ev === "PASSWORD_RECOVERY" || (recuperando && ses && ev !== "SIGNED_OUT")) {
        if (recuperando === "hecho") return; recuperando = "hecho"; await alEntrar(); dlgNuevaClave(); return; }
      if (ev === "SIGNED_OUT") return alSalir();
      if ((ev === "SIGNED_IN" || ev === "INITIAL_SESSION") && ses && (!PERFIL || PERFIL.id !== ses.user.id)) await alEntrar();
    }, 0);
    EVENTOS.splice(0).forEach(([ev, ses]) => manejar(ev, ses));
    alEvento = manejar;
    // vuelta desde el enlace del email (?code=...): la sesión ya se ha recogido; se limpia la dirección
    if (u.searchParams.has("code") || u.searchParams.has("error_description") || u.searchParams.has("tipo")) {
      const errDesc = u.searchParams.get("error_description");
      ["code", "error", "error_code", "error_description", "tipo"].forEach(p => u.searchParams.delete(p));
      history.replaceState(null, "", u.pathname + u.search + u.hash);
      setTimeout(async () => { const {data: {session}} = await sb.auth.getSession();
        if (session && !recuperando) {
          aviso("Email confirmado. Ya tienes tu cuenta.", "ok");
          // recién registrado desde la portada: se abre la oposición que eligió
          let elegida = null; try { elegida = localStorage.getItem("opos-sel"); } catch (e) { /* sin almacenamiento */ }
          if (!op() && !elegida && PERFIL?.oposicion && window.INDICE?.[PERFIL.oposicion]) setTimeout(() => elegirOp(PERFIL.oposicion), 1200);
        }
        else if (!session) dlg("Enlace abierto", `<p>${errDesc ? h(errDesc) + ". " : ""}Si acabas de confirmar tu email, ya puedes entrar con tu contraseña.</p><div class="cu-acciones"><button class="primary" data-cu="entrar">Entrar</button></div>`); }, 800);
    }
    // tarea empezada desde otra oposición
    let tid = null; try { tid = sessionStorage.getItem("cu-tarea"); sessionStorage.removeItem("cu-tarea"); } catch (e) { /* sin almacenamiento */ }
    if (tid && op()) { const espera = setInterval(async () => { if (!PERFIL) return; clearInterval(espera);
      const {data} = await sb.from("tareas").select("*").eq("id", +tid).maybeSingle(); if (data && !data.completada) empezarTarea(data); }, 300);
      setTimeout(() => clearInterval(espera), 15000); }
  }
  // subirCurso: envía ya el examen a medias pendiente (lo usan las pruebas, para no esperar 15 s)
  window.CUENTA = {iniciar, perfil: () => PERFIL, sb, subirCurso: () => { clearTimeout(cursoT); return subirCurso(); }};
})();
