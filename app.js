// Generado por construir.py a partir de plantilla.html: no editar aquí.
const OPS = window.OPS;
let OPK = null; try { OPK = localStorage.getItem("opos-sel"); } catch (e) { /* sin almacenamiento */ }
const HASH = location.hash.replace("#", "");
// al pasar a otra sección el enlace pasa a ser #temas: hay que recordar la oposición para cuando se recargue
if (OPS[HASH]) { OPK = HASH; try { localStorage.setItem("opos-sel", OPK); } catch (e) { /* sin almacenamiento */ } }
const PORTAL = HASH === "inicio" || !OPS[OPK]?.r;
const D = OPS[OPK] || Object.values(OPS).find(o => o.r);   // en la web propia solo viene cargada una oposición
const C = D.cfg;
// la versión con cuentas (cuenta.js) rellena estos ganchos; en la de Claude no hay ninguno
const GANCHOS = window.GANCHOS || {};
const R = D.r, TEMAS = D.temas;
if (C.color) { const rs = document.documentElement.style; rs.setProperty("--red", C.color[0]); rs.setProperty("--red-2", C.color[1]); rs.setProperty("--red-tint", C.color[2]); }
// el banco y las repetidas apuntan a la pregunta del examen (o del banco) en vez de repetir su texto
D.banco.forEach(b => { if (b[7] >= 0) { const q = D.examen[b[7]]; b[4] = q.e; b[5] = q.o; } });
R.repetidas.lista.forEach(g => g.preguntas.forEach(p => { if (p.b != null) { const b = D.banco[p.b]; p.enunciado = b[4];
  p.opciones = Object.fromEntries(b[5].map((o, i) => ["abcd"[i], o])); p.resp = b[7] >= 0 ? D.examen[b[7]].r : null; } }));
const $ = s => document.querySelector(s);
const fmt = (n, d = 0) => n == null ? "—" : n.toLocaleString("es-ES", {minimumFractionDigits: d, maximumFractionDigits: d});
const esc = s => String(s).replace(/[&<>"]/g, c => ({"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;"}[c]));
// los colores de los gráficos son variables de CSS: cambian solos con el tema claro u oscuro
const css = v => `var(${v})`;
const ANOS = R.anos;
const lblAno = a => (C.lblAno || {})[a] || "'" + String(a).slice(2);
const NOMBRE_OEP = a => (C.nomAno || {})[a] || C.prefijoAno + " " + a;
const bloqueDe = t => C.temaBloque[t] || "Otros";

/* ---------- portada y selección de oposición ---------- */
function elegirOp(k) { try { localStorage.setItem("opos-sel", k); } catch (e) { /* sin almacenamiento */ } location.hash = k; location.reload(); }
const diasHasta = f => f ? Math.ceil((new Date(f + "T09:00:00") - new Date()) / 86400000) : -1;
const OPL = Object.entries(OPS), LETRA = "ABCDEFGH";
const colores = c => c.color ? `--c:${c.color[0]};--c2:${c.color[1]};--ct:${c.color[2]};--cf:${c.color[3]}` : "";
const miles = n => String(n).replace(/(\d)(?=(\d{3})+$)/g, "$1.");   // 2.573 también con cuatro cifras, como en el resto de la web
$("#pt-burbujas").insertAdjacentHTML("beforeend", OPL.map(([k, o], i) =>
  `<a class="pt-op" href="#${k}" data-k="${k}" style="${colores(o.cfg)}"><span class="pt-b" aria-hidden="true">${LETRA[i]}</span>${esc(o.cfg.nombreCorto)}</a>`).join(""));
const totP = OPL.reduce((x, [, o]) => x + (o.cfg.portada?.[1]?.[0] || 0), 0), totC = OPL.reduce((x, [, o]) => x + (o.cfg.portada?.[0]?.[0] || 0), 0);
$("#pt-lede").innerHTML = `<b>${miles(totP)} preguntas</b> de ${totC} exámenes oficiales, analizadas una a una: qué temas caen, qué leyes se repiten y simulacros corregidos con la plantilla del tribunal. Puedes cambiar de oposición cuando quieras.`;
$("#op-cards").innerHTML = OPL.map(([k, o], i) => { const c = o.cfg, d = diasHasta(c.fechaExamen), nop = c.nOpciones || 4;
  return `<article class="opcard" data-k="${k}" style="${colores(c)}">
    <div class="oc-foto">${c.imagen ? `<img class="oc-img" src="${c.imagen}" alt="${esc(c.imagenAlt || "")}" loading="lazy">` : `<div class="oc-sinimg"></div>`}
    ${d >= 0 ? `<span class="oc-aviso">${d === 0 ? "El examen es hoy" : `Examen en ${d} día${d === 1 ? "" : "s"}`}</span>` : ""}</div>
    <div class="oc-top"><div class="oc-cab"><span class="pt-b" aria-hidden="true">${LETRA[i]}</span><span class="oc-cuerpo">${esc(c.cuerpo)}</span></div>
    <h2>${esc(c.nombreCorto)}</h2><p class="oc-res">${esc(c.resumen)}${d >= 0 ? ` <b>Próximo examen: ${esc(c.fechaExamenTexto)}.</b>` : ""}</p></div>
    ${c.portada ? `<dl class="oc-cifras">${c.portada.map(([n, t]) => `<div><dt>${esc(t)}</dt><dd>${miles(n)}</dd></div>`).join("")}</dl>` : ""}
    <p class="oc-formato"><b>El test:</b> ${c.simN} preguntas de ${nop} opciones en ${c.simMin} minutos; cada fallo resta 1/${nop - 1} de acierto.</p>
    <button class="primary oc-ir" data-k="${k}">Entrar en ${esc(c.nombreCorto)}</button></article>`; }).join("");
$("#op-cards").querySelectorAll(".opcard").forEach(card => card.onclick = () => elegirOp(card.dataset.k));
$("#pt-burbujas").querySelectorAll(".pt-op").forEach(a => {
  const card = $(`#op-cards .opcard[data-k="${a.dataset.k}"]`);
  a.onclick = e => { e.preventDefault(); elegirOp(a.dataset.k); };
  ["mouseenter", "focus"].forEach(ev => a.addEventListener(ev, () => card.classList.add("resaltada")));
  ["mouseleave", "blur"].forEach(ev => a.addEventListener(ev, () => card.classList.remove("resaltada"))); });
$("#pt-que").innerHTML = [
  ["Simulacros corregidos", "Exámenes reales con la plantilla oficial del tribunal: tu nota, lo que fallas y la respuesta correcta de cada pregunta."],
  ["Lo que más cae", "Cada pregunta clasificada por tema y por ley, para saber dónde se concentra el examen y qué se repite."],
  ["Qué repasar primero", "Tu acierto por tema cruzado con lo que pesa cada tema en el examen real."],
  ...(window.CONFIG?.supabaseUrl ? [["Con tu preparador", "Con una cuenta gratuita tu progreso va contigo a cualquier dispositivo y tu preparador puede seguirlo y ponerte tareas."]] : [])
].map(([t, x]) => `<li><b>${t}</b><span>${x}</span></li>`).join("");
$("#nav-cambiar").onclick = e => { e.preventDefault(); location.hash = "inicio"; location.reload(); };

/* ---------- menú superior ---------- */
$("#nav-op").textContent = C.nombreCorto;
const NAV = $("nav.toc"), bAn = $("#nav-analisis-b"), mAn = $("#nav-analisis"), bMov = $("#nav-movil");
function grupoNav(abrir) { mAn.hidden = !abrir; bAn.setAttribute("aria-expanded", String(abrir)); }
function hojaNav(abrir) { NAV.classList.toggle("abierto", abrir); bMov.setAttribute("aria-expanded", String(abrir)); }
const cerrarNav = () => { grupoNav(false); hojaNav(false); };
bAn.onclick = () => { grupoNav(mAn.hidden); if (!mAn.hidden) mAn.querySelector("a").focus(); };
bMov.onclick = () => hojaNav(!NAV.classList.contains("abierto"));
document.addEventListener("click", e => { if (!e.target.closest("nav.toc") || e.target.closest("nav.toc a")) cerrarNav(); });
document.addEventListener("keydown", e => { if (e.key === "Escape" && (!mAn.hidden || NAV.classList.contains("abierto"))) { const vuelve = !mAn.hidden ? bAn : bMov; cerrarNav(); vuelve.focus(); } });
mAn.addEventListener("keydown", e => {   // flechas dentro del desplegable
  if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return; e.preventDefault();
  const l = [...mAn.querySelectorAll("a")], i = l.indexOf(document.activeElement);
  l[(i + (e.key === "ArrowDown" ? 1 : l.length - 1)) % l.length].focus(); });
// una sección a la vista: la del enlace (#temas) o, si el enlace apunta a algo de dentro, la que lo contiene
// (también las que añade la versión con cuentas al iniciar sesión)
const VISTAS = () => [...document.querySelectorAll("#main > header.hero, #main > section")];
const ANALISIS = [...mAn.querySelectorAll("[data-sec]")].map(a => a.dataset.sec);
let VISTA = null;
function vistaDe(h) {
  if (!h || OPS[h]) return "resumen";
  const el = document.getElementById(h), v = el?.closest("#main > header.hero, #main > section");
  return v ? v.id : null; }
function mostrarVista(h, subir = true) {
  const id = vistaDe(h) || (VISTAS().some(v => v.id === VISTA) ? VISTA : "resumen");
  const cambia = id !== VISTA; VISTA = id;
  VISTAS().forEach(v => v.classList.toggle("actual", v.id === id));
  document.querySelectorAll("nav.toc [data-sec], .an-tabs a").forEach(a => a.dataset.sec === id ? a.setAttribute("aria-current", "page") : a.removeAttribute("aria-current"));
  bAn.classList.toggle("actual", ANALISIS.includes(id));
  const pest = document.querySelector(`#${id} > .an-tabs`), act = pest?.querySelector("[aria-current]");
  if (act) pest.scrollLeft = act.offsetLeft - pest.offsetLeft - 20;   // en el móvil la fila se desliza: que se vea la pestaña actual
  if (!subir) return;
  const el = h && document.getElementById(h);
  if (el && el.id !== id) el.scrollIntoView({block: "start"}); else if (cambia) scrollTo(0, 0); }
// si las entradas no caben junto a la cuenta, el menú pasa a compacto (botón «Menú»)
function ajustarNav() {
  if (NAV.hidden) return;
  NAV.classList.remove("compacto");
  const items = $("#nav-items"), cuenta = $("#nav-cuenta"), ultimo = items.lastElementChild.lastElementChild || items.lastElementChild;
  const fin = Math.max(...[...items.children].map(e => e.getBoundingClientRect().right), ultimo.getBoundingClientRect().right);
  const cabe = innerWidth > 760 && fin + 16 <= cuenta.getBoundingClientRect().left && items.scrollWidth <= items.clientWidth + 1;
  NAV.classList.toggle("compacto", !cabe);
  if (cabe) hojaNav(false);
}
new ResizeObserver(ajustarNav).observe($("nav.toc .in"));
new MutationObserver(ajustarNav).observe(NAV, {childList: true, subtree: true, characterData: true});
ajustarNav();
$("#portal").hidden = !PORTAL; $("#main").hidden = PORTAL; document.querySelector("nav.toc").hidden = PORTAL;
document.title = PORTAL ? "Radiografía de Oposiciones" : "Radiografía " + C.nombreCorto;
[["#h-eyebrow", C.cuerpo], ["#h-title", C.titulo]].forEach(([s, v]) => $(s).textContent = v);
if (C.imagen) { $("#h-img").src = C.imagen; $("#h-img").alt = C.imagenAlt || ""; $("#h-img").hidden = false; }
[["#h-lede", C.lede], ["#ex-intro", C.exIntro], ["#sim-desc", C.simDesc], ["#temas-intro", C.temasIntro], ["#heat-note", C.heatNote],
 ["#normas-title", C.normasTitulo], ["#normas-intro", C.normasIntro], ["#normas-h3", C.normasH3], ["#formato-intro", C.formatoIntro],
 ["#formato-title", C.formatoTitulo], ["#rep-intro", C.repIntro], ["#metodo-body", C.metodoHTML], ["#pie", C.pie], ["#nav-normas", C.navNormas], ["#nav-formato", C.navFormato]]
  .forEach(([s, v]) => { if (v != null) $(s).innerHTML = v; });
$("#opt-rec").textContent = `Más preguntados (${C.recienteLabel})`;
if (C.sinSupuestos) { $("#lb-parte").hidden = true; }
// en cada sección de análisis, las demás a un clic
ANALISIS.forEach(id => document.getElementById(id)?.insertAdjacentHTML("afterbegin", `<nav class="an-tabs" aria-label="Análisis">${
  [...mAn.querySelectorAll("[data-sec]")].map(a => `<a href="#${a.dataset.sec}" data-sec="${a.dataset.sec}">${a.querySelector("b").textContent}</a>`).join("")}</nav>`));
addEventListener("hashchange", () => { const h = location.hash.slice(1); if (h === "inicio") return location.reload(); if (vistaDe(h)) mostrarVista(h); });
new MutationObserver(() => mostrarVista(location.hash.slice(1), false)).observe($("#main"), {childList: true});
mostrarVista(location.hash.slice(1));

/* ---------- tooltip ---------- */
const tip = $("#tip");
function showTip(e, html) { tip.innerHTML = html; tip.hidden = false; moveTip(e); }
function moveTip(e) { const w = tip.offsetWidth, h = tip.offsetHeight; let x = e.clientX + 14, y = e.clientY + 14;
  if (x + w > innerWidth - 8) x = e.clientX - w - 14; if (y + h > innerHeight - 8) y = e.clientY - h - 14; tip.style.left = x + "px"; tip.style.top = y + "px"; }
function hideTip() { tip.hidden = true; }
function bindTip(el, html) { el.addEventListener("mouseenter", e => showTip(e, html)); el.addEventListener("mousemove", moveTip); el.addEventListener("mouseleave", hideTip);
  el.setAttribute("tabindex", "0"); el.addEventListener("focus", () => { const r = el.getBoundingClientRect(); showTip({clientX: r.right, clientY: r.top}, html); }); el.addEventListener("blur", hideTip); }
const SVGNS = "http://www.w3.org/2000/svg";
function svgEl(tag, attrs, parent) { const e = document.createElementNS(SVGNS, tag);
  for (const k in attrs) { const v = String(attrs[k]); if ((k === "fill" || k === "stroke") && v.startsWith("var(")) e.style[k] = v; else e.setAttribute(k, v); }
  if (parent) parent.appendChild(e); return e; }

/* ---------- datos derivados ---------- */
const test = D.banco.filter(q => q[1] === "T");
const totalAno = {}; ANOS.forEach(a => totalAno[a] = test.filter(q => String(q[0]) === String(a)).length);
const conArt = {}; ANOS.forEach(a => { const qs = test.filter(q => String(q[0]) === String(a)); conArt[a] = 100 * qs.filter(q => q[6]).length / qs.length; });
const temasR = R.temas.filter(t => t.tema !== "??");
const tm = Object.fromEntries(R.temas.map(t => [t.tema, t]));

/* ---------- KPIs + conclusiones ---------- */
$("#kpis").innerHTML = C.kpis.map(([b, s]) => `<div class="kpi"><b>${b}</b><span>${s}</span></div>`).join("");
// a la vista solo el titular de cada conclusión; los datos, al pulsarlo
$("#takeaways").innerHTML = C.takeaways.map((s, i) => { const m = s.match(/^<b>(.*?)<\/b>\s*(.*)$/s);
  if (!m) return `<li><p>${s}</p></li>`;
  const frase = /\.$/.test(m[1]);   // «<b>Los temas que más preguntas dan</b> en los…» no es una frase entera: el detalle la repite
  const sec = (C.tkSec || [])[i], nav = sec && document.querySelector(`#nav-analisis [data-sec="${sec}"] b`);
  return `<li><details><summary>${m[1].replace(/[.:]$/, "")}</summary><p>${frase ? m[2] : s}</p>${nav ? `<p><a href="#${sec}">Ver el detalle en «${nav.textContent}»</a></p>` : ""}</details></li>`; }).join("");
// lo que concluye cada sección, a la vista nada más entrar en ella
// (si el titular no es una frase entera, como «Los temas que más preguntas dan», la primera frase completa, que lleva los datos)
const TITULARES = C.takeaways.map(s => { const t = (s.match(/^<b>(.*?)<\/b>/s) || [])[1]; if (!t) return null;
  if (/\.$/.test(t)) return t.replace(/\.$/, "");
  const llano = s.replace(/<[^>]+>/g, ""); let f = (llano.match(/^.*?\.(?=\s|$)/s) || [llano])[0].replace(/\.$/, "");
  // las listas largas, con sus primeros elementos (cortando tras «(4,1 %)», no dentro de un título con comas)
  const corte = f.length > 150 ? f.lastIndexOf("), ", 150) : -1; if (corte > 60) f = f.slice(0, corte + 1);
  return f; });
[...new Set(C.tkSec || [])].forEach(sec => { const ts = TITULARES.filter((t, i) => t && C.tkSec[i] === sec);
  document.querySelector(`#${sec} > header`)?.insertAdjacentHTML("beforeend", `<ul class="clave">${ts.map(t => `<li>${t}</li>`).join("")}</ul>`); });
const artAll = R.articulos || [];

/* ---------- 1a: bloques apilados ---------- */
(function () {
  const keys = [...C.bloques.map(([k, p], i) => [k, ["--s1", "--s2", "--s3", "--s4"][i], p]), ["Otros", "--s-other", ""]];
  $("#lg-bloques").innerHTML = keys.map(([k, c, p]) => `<span><i style="background:var(${c})"></i>${k === "Otros" ? "Sin clasificar / fuera del temario actual" : k}${p ? " (" + p + ")" : ""}</span>`).join("");
  const W = Math.max(640, ANOS.length * 44 + 60), H = 300, m = {l: 40, r: 10, t: 10, b: 28}, svg = $("#ch-bloques");
  svg.setAttribute("viewBox", `0 0 ${W} ${H}`); svg.style.width = "100%"; svg.style.minWidth = "600px"; svg.style.maxWidth = "none";
  const iw = W - m.l - m.r, ih = H - m.t - m.b, bw = iw / ANOS.length;
  [0, 25, 50, 75, 100].forEach(v => { const y = m.t + ih - ih * v / 100; svgEl("line", {x1: m.l, x2: W - m.r, y1: y, y2: y, stroke: css("--rule")}, svg); const t = svgEl("text", {x: m.l - 6, y: y + 4, "text-anchor": "end", "font-size": 11, fill: css("--muted")}, svg); t.textContent = v + "%"; });
  ANOS.forEach((a, i) => {
    const b = R.bloques_por_ano[a], tot = Object.values(b).reduce((x, y) => x + y, 0);
    const vals = keys.map(([k]) => k === "Otros" ? (b["Sin clasificar"] || 0) + (b["Fuera del temario actual"] || 0) : (b[k] || 0));
    let y0 = m.t + ih; const x = m.l + i * bw + bw * 0.18, w = bw * 0.64;
    vals.forEach((v, j) => { const h = ih * v / tot; if (h <= 0) return; const r = svgEl("rect", {x, y: y0 - h, width: w, height: Math.max(0, h - 2), fill: css(keys[j][1]), rx: j === vals.length - 1 || vals.slice(j + 1).every(z => !z) ? 3 : 0}, svg); y0 -= h; });
    const hit = svgEl("rect", {x: m.l + i * bw, y: m.t, width: bw, height: ih, fill: "transparent"}, svg);
    bindTip(hit, `<b>${NOMBRE_OEP(a)}</b>, ${tot} preguntas<br>` + keys.map(([k], j) => `${k === "Otros" ? "Otros" : k}: ${fmt(100 * vals[j] / tot)} %`).join("<br>"));
    const t = svgEl("text", {x: m.l + i * bw + bw / 2, y: H - 9, "text-anchor": "middle", "font-size": 11, fill: css("--ink-2")}, svg); t.textContent = lblAno(a);
  });
})();

/* ---------- 1b: mapa de calor ---------- */
const RAMP = ["--q100", "--q200", "--q300", "--q400", "--q500", "--q600", "--q700"];
const HS = C.heatStep || 1.5, stepOf = p => p <= 0 ? -1 : Math.min(6, Math.floor(p / HS));
$("#lg-heat").innerHTML = "<span>% del examen:</span>" + RAMP.map((c, i) => `<span><i style="background:var(${c})"></i>${i < 6 ? fmt(i * HS, 1) + "–" + fmt((i + 1) * HS, 1) : "≥ " + fmt(6 * HS, 1)}</span>`).join("");
function drawHeat() {
  const orden = $("#sel-orden").value;
  let rows = [...temasR];
  if (orden === "rec") rows.sort((a, b) => b.pct_ultimos - a.pct_ultimos); else if (orden === "tot") rows.sort((a, b) => b.total - a.total);
  let html = `<thead><tr><th>Tema</th>${ANOS.map(a => `<th class="y">${lblAno(a)}</th>`).join("")}<th class="num">Total</th><th class="num">Media ${C.recienteCorto}</th></tr></thead><tbody>`;
  let last = "";
  // ordenados por lo que más cae basta con los primeros; en el orden del programa se ven todos
  const corto = orden !== "prog" && !heatTodos && rows.length > HEAT_N; if (corto) rows = rows.slice(0, HEAT_N);
  $("#btn-heat").hidden = orden === "prog" || temasR.length <= HEAT_N;
  $("#btn-heat").textContent = corto ? `Ver los ${temasR.length} temas` : `Ver solo los ${HEAT_N} primeros`;
  rows.forEach(t => {
    if (orden === "prog" && t.bloque !== last) { html += `<tr class="blk"><td colspan="${ANOS.length + 3}">${esc(t.bloque)}</td></tr>`; last = t.bloque; }
    html += `<tr><td class="t"><span class="mono muted">${t.tema}</span> ${esc(t.titulo)}</td>` + ANOS.map(a => { const n = t.por_ano[a] || 0, p = 100 * n / totalAno[a], s = stepOf(p);
      return `<td class="c" data-t="${t.tema}" data-a="${a}" style="background:${s < 0 ? "transparent" : `var(${RAMP[s]})`};color:${s >= 4 ? "#fff" : s < 0 ? "var(--muted)" : "#0d1b2e"}">${n || "·"}</td>`; }).join("") +
      `<td class="num">${t.total}</td><td class="num"><b>${fmt(t.pct_ultimos, 1)} %</b></td></tr>`;
  });
  $("#tb-heat").innerHTML = html + "</tbody>";
  $("#tb-heat").querySelectorAll("td.c").forEach(td => { const t = tm[td.dataset.t], a = td.dataset.a, n = t.por_ano[a] || 0;
    bindTip(td, `<b>${esc(t.titulo)}</b><br>${NOMBRE_OEP(a)}: ${n} pregunta${n === 1 ? "" : "s"} (${fmt(100 * n / totalAno[a], 1)} % del test)`); td.removeAttribute("tabindex"); });
}
let heatTodos = false; const HEAT_N = 12;
$("#sel-orden").addEventListener("change", drawHeat); $("#btn-heat").addEventListener("click", () => { heatTodos = !heatTodos; drawHeat(); }); drawHeat();

/* ---------- barras horizontales genéricas ---------- */
function hbars(el, rows, unit = "") { const max = Math.max(...rows.map(r => r.v));
  el.innerHTML = rows.map(r => `<div class="hbar"><span class="lbl" title="${esc(r.full || r.l)}">${esc(r.l)}</span><div><div class="bar" style="width:${(100 * r.v / max).toFixed(1)}%"></div></div><span class="num mono">${fmt(r.v)}${unit}</span></div>`).join("");
  [...el.querySelectorAll(".hbar")].forEach((d, i) => bindTip(d, `<b>${esc(rows[i].full || rows[i].l)}</b><br>${esc(rows[i].tip)}`)); }
const pracRows = Object.entries(R.temas_practico || {}).filter(([t]) => t !== "??").slice(0, 12);
if (pracRows.length) hbars($("#ch-prac"), pracRows.map(([t, v]) => ({l: TEMAS[t], full: TEMAS[t], v, tip: `${v} preguntas de supuestos`}))); else $("#panel-prac").hidden = true;
if (R.normas) hbars($("#ch-normas"), R.normas.slice(0, 12).map(n => ({l: n.nombre, v: n.total, tip: `${n.total} preguntas · ${Object.keys(n.por_ano).length} convocatorias`})));
else hbars($("#ch-normas"), R.materias.slice(0, 12).map(n => ({l: n.materia, v: n.veces, tip: `${n.veces} preguntas · ${n.anos.length} convocatorias`})));
if (C.sinLiteral) $("#panel-literal").hidden = true;
if (!R.normas) { $("#ch-normas").closest(".panel").hidden = true; if (C.sinLiteral) $("#panel-literal").parentElement.hidden = true; }

/* ---------- 2b: literalidad ---------- */
if (!C.sinLiteral) (function () {
  const W = 520, H = 230, m = {l: 36, r: 12, t: 14, b: 26}, svg = $("#ch-literal"); svg.setAttribute("viewBox", `0 0 ${W} ${H}`); svg.style.width = "100%";
  const iw = W - m.l - m.r, ih = H - m.t - m.b, x = i => m.l + iw * i / (ANOS.length - 1), y = v => m.t + ih - ih * v / 80;
  [0, 20, 40, 60, 80].forEach(v => { svgEl("line", {x1: m.l, x2: W - m.r, y1: y(v), y2: y(v), stroke: css("--rule")}, svg); svgEl("text", {x: m.l - 6, y: y(v) + 4, "text-anchor": "end", "font-size": 11, fill: css("--muted")}, svg).textContent = v + "%"; });
  const pts = ANOS.map((a, i) => [x(i), y(conArt[a])]);
  svgEl("path", {d: "M" + pts.map(p => p.join(",")).join("L") + `L${x(ANOS.length - 1)},${y(0)}L${x(0)},${y(0)}Z`, fill: css("--s1"), "fill-opacity": .12}, svg);
  svgEl("path", {d: "M" + pts.map(p => p.join(",")).join("L"), fill: "none", stroke: css("--s1"), "stroke-width": 2}, svg);
  ANOS.forEach((a, i) => { if (i % 2 === 0 || i === ANOS.length - 1) svgEl("text", {x: x(i), y: H - 8, "text-anchor": "middle", "font-size": 11, fill: css("--ink-2")}, svg).textContent = lblAno(a);
    const c = svgEl("circle", {cx: pts[i][0], cy: pts[i][1], r: i === ANOS.length - 1 ? 4.5 : 3, fill: css("--s1"), stroke: css("--surface"), "stroke-width": 2}, svg);
    const hit = svgEl("rect", {x: pts[i][0] - iw / ANOS.length / 2, y: m.t, width: iw / ANOS.length, height: ih, fill: "transparent"}, svg);
    bindTip(hit, `<b>${NOMBRE_OEP(a)}</b><br>${fmt(conArt[a], 1)} % de preguntas del test citan un artículo`); });
  const L = ANOS.length - 1; svgEl("text", {x: pts[L][0] - 6, y: pts[L][1] - 10, "text-anchor": "end", "font-size": 12, "font-weight": 600, fill: css("--ink")}, svg).textContent = fmt(conArt[ANOS[L]]) + " %";
})();

/* ---------- 2c: artículos ---------- */
const NN = Object.fromEntries((R.normas || []).map(n => [n.norma, n.nombre]));
const normasArt = [...new Set(artAll.map(a => a.norma))];
$("#sel-norma").innerHTML = `<option value="">Todas</option>` + normasArt.map(n => `<option value="${n}">${esc(NN[n] || n)}</option>`).join("");
let artsN = 12; const ARTS_MAX = 40;
function botonArts(total, que) { const b = $("#btn-arts"), n = Math.min(total, ARTS_MAX); b.hidden = total <= 12; const f = que !== "artículos"; b.textContent = artsN < n ? `Ver ${f ? "las" : "los"} ${n} ${que} que más caen` : `Ver solo ${f ? "las 12 primeras" : "los 12 primeros"}`; }
$("#btn-arts").addEventListener("click", () => { artsN = artsN === 12 ? ARTS_MAX : 12; R.articulos ? drawArts() : drawMaterias(); });
// en qué convocatorias sale algo: una casilla por convocatoria (la fecha exacta, al pasar por encima)
function tira(anos) { const on = ANOS.filter(y => anos.includes(+y) || anos.includes(y)), ult = on[on.length - 1];
  return `<span class="tira" role="img" aria-label="En ${on.length} de ${ANOS.length} convocatorias">${ANOS.map(y => `<i${on.includes(y) ? ' class="on"' : ""} title="${NOMBRE_OEP(y)}"></i>`).join("")}</span>` +
    // la fecha de la última solo cuando no es el examen más reciente: es lo que avisa de que algo ha dejado de salir
    `<span class="note tira-t">${on.length} de ${ANOS.length}${ult && ult !== ANOS[ANOS.length - 1] ? `; la última, en ${NOMBRE_OEP(ult)}` : ""}</span>`; }
function drawArts() { const f = $("#sel-norma").value, todas = artAll.filter(a => !f || a.norma === f), rows = todas.slice(0, artsN); botonArts(todas.length, "artículos");
  $("#tb-arts").innerHTML = `<thead><tr><th>Artículo</th><th>Norma</th><th class="num">Preguntas</th><th>En qué exámenes sale</th><th>Tema</th></tr></thead><tbody>` +
    rows.map(a => { const q = D.banco.find(b => b[6].split(",").includes(a.articulo)); const t = q ? q[3] : "";
      return `<tr><td class="mono" style="white-space:nowrap"><b>art. ${a.num}</b></td><td>${esc(NN[a.norma] || a.norma)}</td><td class="num">${a.veces}</td><td>${tira(a.anos)}</td><td>${t && TEMAS[t] ? `<span class="mono muted">${t}</span> ${esc(TEMAS[t])}` : ""}</td></tr>`; }).join("") + "</tbody>"; }
function drawMaterias() { $("#arts-h3").textContent = C.materiasTitulo || "Las materias que más caen"; $("#lb-norma").hidden = true; botonArts(R.materias.length, C.materiasNombre || "materias");
  const max = R.materias[0]?.veces || 1;
  $("#tb-arts").innerHTML = `<thead><tr><th>${C.materiaCol || "Materia (etiqueta del tribunal)"}</th><th class="num">Preguntas</th><th></th><th>En qué exámenes sale</th></tr></thead><tbody>` +
    R.materias.slice(0, artsN).map(m => `<tr><td>${esc(m.materia)}</td><td class="num">${m.veces}</td><td style="width:30%"><div class="minibar"><i style="width:${(100 * m.veces / max).toFixed(1)}%"></i></div></td><td>${tira(m.anos)}</td></tr>`).join("") + "</tbody>"; }
if (R.articulos) { $("#sel-norma").addEventListener("change", () => { artsN = 12; drawArts(); }); drawArts(); } else drawMaterias();

/* ---------- 3: repetidas ---------- */
const RP = R.repetidas;
$("#kpi-rep").innerHTML = [[fmt(RP.preguntas), "preguntas con una pareja en otra convocatoria"], [fmt(RP.grupos), "grupos de preguntas que se repiten"],
  [fmt(RP.lista.filter(g => g.anos.length >= 4).length), "cuestiones que caen en 4 convocatorias o más"], [fmt(100 * RP.preguntas / R.total_preguntas) + " %", "del total de preguntas"]]
  .map(([b, s]) => `<div class="kpi"><b>${b}</b><span>${s}</span></div>`).join("");
const blqs = C.bloques.map(b => b[0]);
$("#sel-rep").innerHTML += blqs.map(b => `<option>${b}</option>`).join("");
let repN = 10;
function qcard(q) { const ops = Object.values(q.opciones || {}).filter(Boolean);
  return `<div class="qcard"><span class="tag">${NOMBRE_OEP(String(q.oep))}${q.ej ? ", modelo " + q.ej : ""}, ${q.parte === "teorico" ? "test" : "supuesto práctico"}, pregunta ${q.n}</span><p style="margin-top:6px">${esc(q.enunciado)}</p>${ops.length ? `<ol>${ops.map((o, i) => `<li data-i="${i}">${esc(o)}</li>`).join("")}</ol>` : ""}` +
    `${q.resp != null && ops.length ? `<button class="ver-resp" data-r="${q.resp}" aria-pressed="false">Ver respuesta</button>` : ""}</div>`; }
// «Ver respuesta» en el banco y en las repetidas
document.addEventListener("click", e => { const b = e.target.closest(".ver-resp"); if (!b) return;
  const on = b.getAttribute("aria-pressed") !== "true"; b.setAttribute("aria-pressed", String(on)); b.textContent = on ? "Ocultar respuesta" : "Ver respuesta";
  const li = b.closest(".qcard").querySelector(`li[data-i="${b.dataset.r}"]`); if (li) li.classList.toggle("ok", on); });
function drawRep() { const f = $("#sel-rep").value; const gs = RP.lista.filter(g => !f || bloqueDe(g.tema) === f);
  $("#lst-rep").innerHTML = gs.slice(0, repN).map(g => `<details class="rep"><summary><span><b>${esc(g.preguntas[0].enunciado.slice(0, 150))}${g.preguntas[0].enunciado.length > 150 ? "…" : ""}</b><br><span class="note">${g.tema} · ${esc(TEMAS[g.tema] || "Sin clasificar")}</span></span><span>${g.anos.map(a => `<span class="chip on">${lblAno(String(a))}</span>`).join("")}</span></summary>${g.preguntas.map(qcard).join("")}</details>`).join("");
  $("#btn-rep").hidden = repN >= gs.length; }
$("#sel-rep").addEventListener("change", () => { repN = 10; drawRep(); }); $("#btn-rep").addEventListener("click", () => { repN += 20; drawRep(); }); drawRep();

/* ---------- 4: formato y notas ---------- */
const CV = D.conv || [];
if (!CV.length) { $("#grid-cortes").hidden = true; $("#panel-conv").hidden = true; $("#formato-extra").hidden = false; $("#formato-extra").innerHTML = C.formatoHTML; }
if (CV.length) (function () {
  const ser = [["pct_test", "--s1", "Test (1.ª parte)"], ["pct_sup", "--s2", "Supuestos prácticos"]];
  $("#lg-corte").innerHTML = ser.map(([, c, l]) => `<span><i style="background:var(${c})"></i>${l}</span>`).join("");
  const data = CV.filter(c => c.pct_test != null);
  const W = 520, H = 250, m = {l: 36, r: 40, t: 14, b: 26}, svg = $("#ch-corte"); svg.setAttribute("viewBox", `0 0 ${W} ${H}`); svg.style.width = "100%";
  const iw = W - m.l - m.r, ih = H - m.t - m.b, x = i => m.l + iw * i / (data.length - 1), y = v => m.t + ih - ih * (v - 30) / 50;
  [30, 40, 50, 60, 70, 80].forEach(v => { svgEl("line", {x1: m.l, x2: W - m.r, y1: y(v), y2: y(v), stroke: css(v === 50 ? "--axis" : "--rule")}, svg); svgEl("text", {x: m.l - 6, y: y(v) + 4, "text-anchor": "end", "font-size": 11, fill: css("--muted")}, svg).textContent = v + "%"; });
  ser.forEach(([k, c, l]) => { const pts = data.map((d, i) => [x(i), y(d[k])]);
    svgEl("path", {d: "M" + pts.map(p => p.join(",")).join("L"), fill: "none", stroke: css(c), "stroke-width": 2}, svg);
    pts.forEach(p => svgEl("circle", {cx: p[0], cy: p[1], r: 3, fill: css(c), stroke: css("--surface"), "stroke-width": 1.5}, svg));
    const L = pts[pts.length - 1]; svgEl("text", {x: L[0] + 6, y: L[1] + 4, "font-size": 11, fill: css("--ink-2")}, svg).textContent = fmt(data[data.length - 1][k]) + "%"; });
  data.forEach((d, i) => { if (i % 2 === 0 || i === data.length - 1) svgEl("text", {x: x(i), y: H - 8, "text-anchor": "middle", "font-size": 11, fill: css("--ink-2")}, svg).textContent = d.oep.length > 4 ? "21-22" : "'" + d.oep.slice(2);
    const hit = svgEl("rect", {x: x(i) - iw / data.length / 2, y: m.t, width: iw / data.length, height: ih, fill: "transparent"}, svg);
    bindTip(hit, `<b>OEP ${d.oep}</b> · ${fmt(d.plazas)} plazas<br>Test: ${fmt(d.corte_test, 2)} / ${d.test} (${fmt(d.pct_test, 1)} %)<br>Supuestos: ${fmt(d.corte_sup, 2)} / ${d.sup} (${fmt(d.pct_sup, 1)} %)`); });
})();
if (CV.length) (function () {
  const data = CV.filter(c => c.por_plaza != null);
  const W = 520, H = 250, m = {l: 36, r: 12, t: 18, b: 26}, svg = $("#ch-ratio"); svg.setAttribute("viewBox", `0 0 ${W} ${H}`); svg.style.width = "100%";
  const iw = W - m.l - m.r, ih = H - m.t - m.b, max = 110, bw = iw / data.length, y = v => m.t + ih - ih * v / max;
  [0, 25, 50, 75, 100].forEach(v => { svgEl("line", {x1: m.l, x2: W - m.r, y1: y(v), y2: y(v), stroke: css("--rule")}, svg); svgEl("text", {x: m.l - 6, y: y(v) + 4, "text-anchor": "end", "font-size": 11, fill: css("--muted")}, svg).textContent = v; });
  data.forEach((d, i) => { const h = ih * d.por_plaza / max, xx = m.l + i * bw + bw * .2, w = bw * .6;
    svgEl("path", {d: `M${xx},${y(0)}V${y(d.por_plaza) + 4}q0,-4 4,-4h${w - 8}q4,0 4,4V${y(0)}Z`, fill: css("--s1")}, svg);
    if (d.por_plaza > 40 || i === data.length - 1) svgEl("text", {x: xx + w / 2, y: y(d.por_plaza) - 5, "text-anchor": "middle", "font-size": 10.5, fill: css("--ink-2")}, svg).textContent = fmt(d.por_plaza);
    svgEl("text", {x: xx + w / 2, y: H - 8, "text-anchor": "middle", "font-size": 10.5, fill: css("--ink-2")}, svg).textContent = d.oep.length > 4 ? "21-22" : "'" + d.oep.slice(2);
    const hit = svgEl("rect", {x: m.l + i * bw, y: m.t, width: bw, height: ih, fill: "transparent"}, svg);
    bindTip(hit, `<b>OEP ${d.oep}</b><br>${fmt(d.presentados)} presentados · ${fmt(d.plazas)} plazas<br>${fmt(d.por_plaza, 1)} por plaza`); });
})();
if (CV.length) $("#tb-conv").innerHTML = `<thead><tr><th>OEP</th><th class="num">Plazas</th><th>Psicotécnico</th><th>Test</th><th>Supuestos</th><th>Error resta</th><th class="num">Presentados</th><th class="num">Corte test</th><th class="num">Corte supuestos</th><th>Notas</th></tr></thead><tbody>` +
  CV.map(c => `<tr><td><a class="mono" href="https://www.boe.es/diario_boe/txt.php?id=${c.boe}">${c.oep}</a></td><td class="num">${fmt(c.plazas)}</td><td>${c.psico ? "Sí (apto)" : "No"}</td><td style="white-space:nowrap">${c.test} preg. · ${c.test_min} min</td><td style="white-space:nowrap">${c.sup_n} × 5 = ${c.sup} · ${c.sup_min} min</td><td class="mono">${c.pen}</td><td class="num">${fmt(c.presentados)}</td><td class="num">${c.corte_test == null ? "—" : fmt(c.corte_test, 2) + ` <span class="muted">(${fmt(c.pct_test)} %)</span>`}</td><td class="num">${c.corte_sup == null ? "—" : fmt(c.corte_sup, 2) + ` <span class="muted">(${fmt(c.pct_sup)} %)</span>`}</td><td class="note" style="min-width:220px">${esc(c.nota)}</td></tr>`).join("") + "</tbody>";

/* ---------- banco ---------- */
$("#f-tema").innerHTML += Object.entries(TEMAS).map(([k, v]) => `<option value="${k}">${k}. ${esc(v)}</option>`).join("") + `<option value="??">Sin clasificar</option>`;
$("#f-ano").innerHTML += ANOS.map(a => `<option value="${a}">${NOMBRE_OEP(a)}</option>`).join("");
const normTxt = s => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
const IDX = D.banco.map(q => normTxt(q[4] + " " + q[5].join(" ") + " " + q[6].replace(/:/g, " ")));
let page = 0, filtered = [];
function filterBanco() { const q = normTxt($("#f-q").value.trim()), t = $("#f-tema").value, a = $("#f-ano").value, p = $("#f-parte").value, conR = $("#f-resp").checked;
  const words = q.split(/\s+/).filter(Boolean);
  filtered = D.banco.map((b, i) => [b, i]).filter(([b, i]) => (!t || b[3] === t) && (!a || String(b[0]) === a) && (!p || b[1] === p) && (!conR || b[7] >= 0) && words.every(w => IDX[i].includes(w))).map(x => x[0]);
  page = 0; drawBanco(); }
function drawBanco() { const per = 10, pages = Math.max(1, Math.ceil(filtered.length / per));
  $("#f-count").textContent = `${fmt(filtered.length)} preguntas`;
  $("#lst-banco").innerHTML = filtered.slice(page * per, page * per + per).map(b => qcard({oep: b[0], parte: b[1] === "T" ? "teorico" : "practico", n: b[2], ej: b[7] >= 0 ? D.examen[b[7]].ej : "", enunciado: b[4], opciones: {a: b[5][0], b: b[5][1], c: b[5][2], d: b[5][3]}, resp: b[7] >= 0 ? D.examen[b[7]].r : null})
    .replace('</span>', `</span> <span class="pill">${esc((TEMAS[b[3]] || "Sin clasificar").slice(0, 70))}</span>`)).join("") || `<p class="note" style="margin-top:10px">Ninguna pregunta coincide con esos filtros. Prueba con menos palabras o quita algún filtro.</p>`;
  $("#pg-info").textContent = `Página ${page + 1} de ${pages}`; $("#pg-prev").disabled = page === 0; $("#pg-next").disabled = page >= pages - 1; }
["#f-q", "#f-tema", "#f-ano", "#f-parte", "#f-resp"].forEach(s => $(s).addEventListener(s === "#f-q" ? "input" : "change", filterBanco));
$("#pg-prev").addEventListener("click", () => { page--; drawBanco(); }); $("#pg-next").addEventListener("click", () => { page++; drawBanco(); });
filterBanco();

/* ================= EXÁMENES ================= */
const EX = D.examen.map((q, i) => ({...q, id: q.oep + "-" + (q.ej || "") + "-" + q.n, i}));
const EXI = Object.fromEntries(EX.map(q => [q.id, q]));
const BLQ = C.bloques.map(b => b[0]);
const REPARTO = C.reparto;
const CORTES = C.cortes, ESC = C.escala;
const NOP = C.nOpciones || 4, LET = "ABCDE", DIV = NOP - 1;  // cada error resta 1/(n-1)
const opsTxt = (q, sep) => q.o.map((o, j) => `${LET[j]}) ${o}`).join(sep);
const LS = C.lsKey;
let LS_SUF = "";   // con sesión iniciada, cada cuenta guarda su copia local aparte de la del visitante
function loadHist() { try { return JSON.parse(localStorage.getItem(LS + LS_SUF)) || {intentos: [], stats: {}}; } catch (e) { return {intentos: [], stats: {}}; } }
function saveHist(h) { try { localStorage.setItem(LS + LS_SUF, JSON.stringify(h)); } catch (e) { /* sin almacenamiento: el examen funciona igual */ } }
let HIST = loadHist();
const shuffle = a => { a = [...a]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const fallosIds = () => Object.entries(HIST.stats).filter(([id, s]) => s.ultimo !== "ok" && EXI[id]).map(([id]) => id);

// la misma pregunta puede repetirse en varias convocatorias: que no salga dos veces en un examen
const clave = q => normTxt(q.e).replace(/[^a-z0-9]+/g, " ").slice(0, 160);
const unicas = qs => { const vistos = new Set(); return qs.filter(q => { const k = clave(q); if (vistos.has(k)) return false; vistos.add(k); return true; }); };
const selTema = $("#ex-tema");
selTema.innerHTML = BLQ.map(b => `<option value="B:${b}">Bloque: ${b}</option>`).join("") +
  Object.entries(TEMAS).filter(([k]) => !k.startsWith("X")).map(([k, v]) => { const n = unicas(EX.filter(q => q.tema === k)).length; return n ? `<option value="T:${k}">${k}. ${esc(v)} (${n})</option>` : ""; }).join("");
const modo = () => document.querySelector('input[name="modo"]:checked').value;
function pool() { const m = modo(), sinRep = $("#ex-nuevas").checked; let p = EX;
  if (m === "tema") { const v = selTema.value; p = v.startsWith("B:") ? EX.filter(q => bloqueDe(q.tema) === v.slice(2)) : EX.filter(q => q.tema === v.slice(2)); }
  if (m === "fallos") { const ids = new Set(fallosIds()); p = EX.filter(q => ids.has(q.id)); }
  if (sinRep && m !== "fallos") p = p.filter(q => !HIST.stats[q.id]);
  return p; }
function syncConfig() { const m = modo();
  $("#lb-n").hidden = m === "sim" || m === "ia"; $("#lb-tema").hidden = !(m === "tema" || m === "ia");
  $("#ex-nuevas").parentElement.hidden = m === "fallos" || m === "ia";
  $("#fallos-n").textContent = `${fallosIds().length} preguntas que has fallado o dejado en blanco`;
  $("#ex-pool").textContent = m === "ia" ? "Usa tu cuenta de Claude; tarda 30–60 s en prepararlas." : `${fmt(unicas(pool()).length)} preguntas disponibles de ${fmt(unicas(EX).length)}`;
  $("#ex-start").textContent = m === "ia" ? "Generar 10 preguntas" : "Empezar examen"; }
document.querySelectorAll('input[name="modo"], #ex-tema, #ex-nuevas').forEach(e => e.addEventListener("change", syncConfig));

/* --- tu progreso: acierto por tema y qué repasar primero --- */
const peso = t => (tm[t] || {}).pct_ultimos || 0;            // % medio del tema en los últimos exámenes
const poolTema = {}; unicas(EX).forEach(q => poolTema[q.tema] = (poolTema[q.tema] || 0) + 1);
function porTema() { const o = {};
  Object.entries(HIST.stats).forEach(([id, s]) => { const q = EXI[id]; if (!q) return; const t = o[q.tema] = o[q.tema] || {n: 0, ok: 0};
    t.n++; if (s.ultimo === "ok") t.ok++; });
  return o; }
function prioridades() { const pt = porTema();
  return Object.keys(poolTema).filter(t => TEMAS[t] && peso(t) > 0).map(t => { const p = pt[t], ac = p ? p.ok / p.n : null;
    // lo que te puede dar el tema: su peso en el examen por lo que aún fallas (sin practicar cuenta como la mitad)
    return {t, peso: peso(t), n: p ? p.n : 0, total: poolTema[t], ac, prio: peso(t) * (ac == null ? .5 : 1 - ac)}; })
    .sort((a, b) => b.prio - a.prio); }
function practicar(t) { document.querySelector('input[name="modo"][value="tema"]').checked = true; selTema.value = "T:" + t;
  if (selTema.value !== "T:" + t) return; $("#ex-n").value = "20"; syncConfig();
  $("#ex-config").scrollIntoView({behavior: "smooth", block: "start"}); $("#ex-start").focus({preventScroll: true}); }
document.addEventListener("click", e => { const b = e.target.closest("[data-practicar]"); if (b) practicar(b.dataset.practicar); });
let progTodos = false;
function drawProg() { const el = $("#prog-body"), it = HIST.intentos;
  if (!it.length) { el.innerHTML = `<p class="note" style="margin-top:6px">Cuando corrijas tu primer examen verás aquí tu acierto por tema y qué temas te conviene repasar primero, según lo que pesan en el examen real.</p>`; return; }
  const ids = Object.keys(HIST.stats).filter(id => EXI[id]), total = unicas(EX).length;
  let v = 0, a = 0; ids.forEach(id => { v += HIST.stats[id].vistas; a += HIST.stats[id].aciertos; });
  const ult = it.slice(-5), media = ult.reduce((x, y) => x + y.nota120, 0) / ult.length;
  const pr = prioridades(), max = Math.max(...pr.map(p => p.prio), .01), filas = progTodos ? pr : pr.slice(0, 8);
  el.innerHTML = `<div class="pkpis"><div><b>${fmt(ids.length)} <span style="font-size:.9rem;color:var(--muted)">de ${fmt(total)}</span></b><span>preguntas distintas practicadas (${fmt(100 * ids.length / total)} %)</span></div>
    <div><b>${fmt(v ? 100 * a / v : 0)} %</b><span>de aciertos en todas tus respuestas</span></div>
    <div><b>${fmt(it[it.length - 1].nota120, 1)}</b><span>nota del último intento, sobre ${ESC}</span></div>
    <div><b>${fmt(media, 1)}</b><span>media de los ${ult.length} últimos, sobre ${ESC}</span></div></div>` +
    (it.length >= 2 ? sparkNotas(it.slice(-20)) : "") +
    `<h3 style="font-size:1rem;margin:16px 0 4px">Qué repasar primero</h3>
    <p class="note" style="margin-bottom:8px">Ordenado por lo que te puede dar cada tema: su peso en los últimos exámenes por la parte que aún fallas (cuenta tu última respuesta a cada pregunta; un tema sin practicar cuenta como un 50 %).</p>
    <div class="scroll"><table class="prio"><thead><tr><th>Tema</th><th class="num">Peso en el examen</th><th class="num">Practicadas</th><th class="num">Acierto</th><th>Prioridad</th><th></th></tr></thead><tbody>` +
    filas.map(p => `<tr><td>${esc(TEMAS[p.t])}</td><td class="num">${fmt(p.peso, 1)} %</td><td class="num">${p.n} de ${p.total}</td><td class="num">${p.ac == null ? `<span class="muted">sin practicar</span>` : fmt(100 * p.ac) + " %"}</td>
      <td><div class="pb"><i style="width:${(100 * p.prio / max).toFixed(0)}%"></i></div></td><td><button data-practicar="${p.t}" aria-label="Practicar ${esc(TEMAS[p.t])}">Practicar</button></td></tr>`).join("") + `</tbody></table></div>` +
    (pr.length > 8 ? `<button id="prog-mas" style="margin-top:8px">${progTodos ? "Ver solo los 8 primeros" : `Ver los ${pr.length} temas`}</button>` : "") +
    `<div class="controls" style="margin-top:12px"><button id="prog-borrar">Borrar mi progreso</button></div>`;
  $("#prog-mas")?.addEventListener("click", () => { progTodos = !progTodos; drawProg(); });
  $("#prog-borrar").onclick = e => { const b = e.currentTarget;
    if (b.dataset.sure !== "1") { b.dataset.sure = "1"; b.textContent = "Pulsa otra vez para borrar todos tus intentos"; setTimeout(() => { if (b.isConnected) { b.dataset.sure = ""; b.textContent = "Borrar mi progreso"; } }, 5000); return; }
    HIST = {intentos: [], stats: {}}; saveHist(HIST); GANCHOS.alBorrarProgreso?.(); drawHist(); syncConfig(); }; }
function sparkNotas(it) { const W = 520, H = 110, m = {l: 30, r: 14, t: 12, b: 20};
  const top = Math.max(ESC, ...it.map(x => x.nota120)), bot = Math.min(0, ...it.map(x => x.nota120));
  const x = i => m.l + (W - m.l - m.r) * (it.length === 1 ? .5 : i / (it.length - 1)), y = v => m.t + (H - m.t - m.b) * (top - v) / (top - bot || 1);
  const pts = it.map((d, i) => `${x(i).toFixed(1)},${y(d.nota120).toFixed(1)}`).join(" "), ref = Math.max(...CORTES.map(c => c[1])), L = it.length - 1;
  return `<svg class="spark" viewBox="0 0 ${W} ${H}" role="img" aria-label="Evolución de tu nota en los últimos ${it.length} intentos">
    <line x1="${m.l}" x2="${W - m.r}" y1="${y(ref)}" y2="${y(ref)}" style="stroke:var(--red-2)" stroke-dasharray="4 3"/>
    <text x="${m.l - 4}" y="${y(ref) + 4}" text-anchor="end" font-size="10" style="fill:var(--muted)">${fmt(ref, ref % 1 ? 1 : 0)}</text>
    <line x1="${m.l}" x2="${W - m.r}" y1="${y(0)}" y2="${y(0)}" style="stroke:var(--rule)"/><text x="${m.l - 4}" y="${y(0) + 4}" text-anchor="end" font-size="10" style="fill:var(--muted)">0</text>
    <polyline points="${pts}" fill="none" style="stroke:var(--pen)" stroke-width="2"/>
    ${it.map((d, i) => `<circle cx="${x(i).toFixed(1)}" cy="${y(d.nota120).toFixed(1)}" r="${i === L ? 4 : 2.5}" style="fill:var(--pen)"><title>${new Date(d.t).toLocaleDateString("es-ES")}: ${fmt(d.nota120, 1)} (${esc(d.tipo)})</title></circle>`).join("")}
    <text x="${x(L)}" y="${y(it[L].nota120) - 8}" text-anchor="end" font-size="11" font-weight="600" style="fill:var(--ink)">${fmt(it[L].nota120, 1)}</text>
    <text x="${m.l}" y="${H - 4}" font-size="10" style="fill:var(--muted)">Tus últimos ${it.length} intentos. Línea discontinua: ${esc(CORTES.reduce((a, b) => b[1] > a[1] ? b : a)[0])}</text></svg>`; }

function drawHist() { drawProg(); const it = HIST.intentos.slice(-8).reverse();
  $("#ex-hist").innerHTML = it.length ? `<h3 style="font-size:1rem;margin-bottom:6px">Tus últimos intentos</h3><div class="scroll"><table><thead><tr><th>Fecha</th><th>Tipo</th><th class="num">Preguntas</th><th class="num">Aciertos</th><th class="num">Fallos</th><th class="num">Nota sobre ${ESC}</th></tr></thead><tbody>` +
    it.map(x => `<tr><td>${new Date(x.t).toLocaleString("es-ES", {dateStyle: "short", timeStyle: "short"})}</td><td>${esc(x.tipo)}</td><td class="num">${x.n}</td><td class="num">${x.ok}</td><td class="num">${x.ko}</td><td class="num"><b>${fmt(x.nota120, 1)}</b></td></tr>`).join("") + `</tbody></table></div>` : ""; }

/* --- examen a medias: se guarda al responder y se puede retomar --- */
const LSC = () => LS + LS_SUF + "-curso";
function leerCurso() { try { return JSON.parse(localStorage.getItem(LSC())); } catch (e) { return null; } }
function borrarCurso() { try { localStorage.removeItem(LSC()); } catch (e) { /* sin almacenamiento */ } GANCHOS.alBorrarCurso?.(); }
function guardarCurso() { if (!CUR || CUR.resp) return; const n = CUR.qs.length, resp = [], marc = [];
  for (let k = 0; k < n; k++) { const i = document.querySelector(`input[name="r${k}"]:checked`); resp.push(i ? +i.value : null);
    if (document.querySelector(`.flag[data-k="${k}"]`)?.getAttribute("aria-pressed") === "true") marc.push(k); }
  const d = {tipo: CUR.tipo, usado: Date.now() - CUR.inicio, restante: CUR.fin ? Math.max(0, CUR.fin - Date.now()) : null, resp, marc, t: Date.now(),
    qs: CUR.qs.map(q => q.ia ? q : q.id), tarea: CUR.tarea || null};
  try { localStorage.setItem(LSC(), JSON.stringify(d)); } catch (e) { /* sin almacenamiento: no se puede retomar */ }
  GANCHOS.alGuardarCurso?.(d); }
function drawCurso() { const d = leerCurso(), el = $("#ex-curso");
  const qs = d && Array.isArray(d.qs) ? d.qs.map(x => typeof x === "string" ? EXI[x] : x) : [];
  if (!d || !qs.length || qs.some(q => !q)) { el.hidden = true; if (d) borrarCurso(); return; }
  const r = d.resp.filter(v => v !== null).length, hace = Math.round((Date.now() - d.t) / 60000);
  el.hidden = false;
  el.innerHTML = `<p><b>Tienes un examen sin terminar:</b> ${esc(d.tipo)}, ${r} de ${qs.length} respondidas${d.restante != null ? `, quedan ${Math.floor(d.restante / 60000)} min` : ""}. Lo dejaste ${hace < 1 ? "hace un momento" : hace < 60 ? `hace ${hace} min` : hace < 1440 ? `hace ${Math.round(hace / 60)} h` : `hace ${Math.round(hace / 1440)} días`}.</p>
    <span class="acc"><button class="primary" id="curso-seguir">Continuar examen</button><button id="curso-borrar">Descartar</button></span>`;
  $("#curso-seguir").onclick = () => { $("#ex-crono").checked = d.restante != null;
    CUR = {qs, tipo: d.tipo, inicio: Date.now() - d.usado, tarea: d.tarea || null}; render(qs, d.restante != null ? Math.max(d.restante, 1000) / 60000 : null);
    d.resp.forEach((v, k) => { if (v !== null) { const i = document.querySelector(`input[name="r${k}"][value="${v}"]`); if (i) i.checked = true; } });
    d.marc.forEach(k => document.querySelector(`.flag[data-k="${k}"]`)?.setAttribute("aria-pressed", "true")); progreso(); };
  $("#curso-borrar").onclick = () => { borrarCurso(); drawCurso(); }; }
addEventListener("pagehide", guardarCurso);
document.addEventListener("visibilitychange", () => { if (document.hidden) guardarCurso(); });

/* --- generar --- */
let CUR = null, TIMER = null;
$("#ex-qs").addEventListener("change", progreso);
function elegir() { const m = modo();
  if (m === "sim") { let out = []; const usados = new Set(); const base = $("#ex-nuevas").checked ? EX.filter(q => !HIST.stats[q.id]) : EX;
    for (const [b, n] of Object.entries(REPARTO)) { const c = unicas(shuffle(base.filter(q => bloqueDe(q.tema) === b))).slice(0, n); c.forEach(q => usados.add(q.id)); out.push(...c); }
    out = unicas([...out, ...shuffle(base.filter(q => !usados.has(q.id)))]).slice(0, C.simN);
    return {qs: shuffle(out), min: C.simMin, tipo: "Simulacro oficial"}; }
  const n = +$("#ex-n").value; const p = pool();
  const tipo = m === "rapido" ? "Test rápido" : m === "fallos" ? "Repaso de fallos" : selTema.options[selTema.selectedIndex].text.split(" (")[0];
  return {qs: unicas(shuffle(p)).slice(0, m === "fallos" ? 60 : n), min: null, tipo}; }

function render(qs, tiempoMin) {
  $("#ex-config").hidden = true; $("#ex-prog").hidden = true; $("#ex-res").hidden = true; $("#ex-run").hidden = false;
  $("#ex-qs").innerHTML = qs.map((q, k) => `<div class="exq" id="q${k}"><div class="hd"><span><span class="qn">${k + 1}</span><span class="src">${origen(q)}</span></span><button class="flag" aria-pressed="false" data-k="${k}">Marcar para revisar</button></div>
    <p class="st">${esc(q.e)}</p>${q.o.map((o, j) => `<label class="opt"><input type="radio" name="r${k}" value="${j}"><span class="l">${LET[j]}</span><span>${esc(o)}</span></label>`).join("")}
    <button class="flag" data-clear="${k}" style="margin-top:6px">Dejar en blanco</button></div>`).join("");
  $("#ex-qs").querySelectorAll("[data-clear]").forEach(b => b.onclick = () => { document.querySelectorAll(`input[name="r${b.dataset.clear}"]`).forEach(i => i.checked = false); progreso(); });
  $("#ex-qs").querySelectorAll(".flag[data-k]").forEach(b => b.onclick = () => { b.setAttribute("aria-pressed", b.getAttribute("aria-pressed") === "true" ? "false" : "true"); progreso(); });
  $("#ex-sheet").innerHTML = qs.map((q, k) => `<button data-k="${k}" aria-label="Ir a la pregunta ${k + 1}"><i></i>${k + 1}</button>`).join("");
  $("#ex-sheet").querySelectorAll("button").forEach(b => b.onclick = () => document.getElementById("q" + b.dataset.k).scrollIntoView({behavior: "smooth", block: "start"}));
  { const estrecha = matchMedia("(max-width: 600px)").matches; $("#ex-sheet").hidden = estrecha;
    $("#ex-sheet-toggle").textContent = estrecha ? "Ver hoja" : "Ocultar hoja"; $("#ex-sheet-toggle").setAttribute("aria-expanded", String(!estrecha)); }
  CUR.fin = tiempoMin && $("#ex-crono").checked ? Date.now() + tiempoMin * 60000 : null;
  clearInterval(TIMER); tick(); TIMER = setInterval(tick, 1000); progreso();
  $("#examenes").scrollIntoView({behavior: "smooth"}); }
function progreso() { if (!CUR) return; const n = CUR.qs.length; let r = 0; for (let k = 0; k < n; k++) if (document.querySelector(`input[name="r${k}"]:checked`)) r++;
  const m = $("#ex-qs").querySelectorAll('.flag[aria-pressed="true"]').length;
  $("#ex-progress").textContent = `${r} de ${n} respondidas${m ? `, ${m} marcada${m > 1 ? "s" : ""} para revisar` : ""}`;
  $("#ex-sheet").querySelectorAll("button").forEach(b => { const k = b.dataset.k;
    b.classList.toggle("on", !!document.querySelector(`input[name="r${k}"]:checked`));
    b.classList.toggle("fl", document.querySelector(`.flag[data-k="${k}"]`)?.getAttribute("aria-pressed") === "true"); });
  guardarCurso(); }
// de dónde sale cada pregunta, en palabras
const origen = q => q.ia ? "Pregunta nueva generada por IA" : `${NOMBRE_OEP(q.oep)}${q.ej ? ", modelo " + q.ej : ""}, pregunta ${q.n}`;
$("#ex-sheet-toggle").onclick = () => { const sh = $("#ex-sheet"), b = $("#ex-sheet-toggle"); sh.hidden = !sh.hidden;
  b.textContent = sh.hidden ? "Ver hoja" : "Ocultar hoja"; b.setAttribute("aria-expanded", String(!sh.hidden)); };
function tick() { const el = $("#ex-timer"); if (!CUR) return;
  if (!CUR.fin) { const s = Math.floor((Date.now() - CUR.inicio) / 1000); el.textContent = `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`; el.classList.remove("low"); return; }
  const s = Math.max(0, Math.round((CUR.fin - Date.now()) / 1000)); el.textContent = `Quedan ${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`; el.classList.toggle("low", s < 300);
  if (s === 0) { clearInterval(TIMER); corregir(true); return; }
  if (s % 15 === 0) guardarCurso(); }

$("#ex-start").onclick = async () => {
  if (modo() === "ia") return generarIA();
  const {qs, min, tipo} = elegir();
  if (!qs.length) { $("#ex-pool").textContent = "No hay preguntas con esos filtros. Quita «Evitar preguntas ya hechas» o elige otro tema."; return; }
  CUR = {qs, tipo, inicio: Date.now()}; render(qs, min ?? (qs.length * C.segPorPregunta / 60)); };
$("#ex-cancel").onclick = () => { clearInterval(TIMER); CUR = null; borrarCurso(); drawCurso(); $("#ex-run").hidden = true; $("#ex-config").hidden = false; $("#ex-prog").hidden = false; syncConfig(); };

/* --- corregir --- */
function corregir(porTiempo = false) {
  clearInterval(TIMER); const qs = CUR.qs; let ok = 0, ko = 0, bl = 0; const porB = {};
  const resp = qs.map((q, k) => { const i = document.querySelector(`input[name="r${k}"]:checked`); const v = i ? +i.value : null;
    const b = bloqueDe(q.tema); porB[b] = porB[b] || {ok: 0, ko: 0, bl: 0, n: 0}; porB[b].n++;
    if (v === null) { bl++; porB[b].bl++; } else if (v === q.r) { ok++; porB[b].ok++; } else { ko++; porB[b].ko++; }
    if (!q.ia) { const s = HIST.stats[q.id] || {vistas: 0, aciertos: 0}; s.vistas++; if (v === q.r) s.aciertos++; s.ultimo = v === null ? "bl" : v === q.r ? "ok" : "ko"; HIST.stats[q.id] = s; }
    return v; });
  const neta = ok - ko / DIV, nota120 = ESC * neta / qs.length, seg = Math.round((Date.now() - CUR.inicio) / 1000);
  HIST.intentos.push({t: Date.now(), tipo: CUR.tipo, n: qs.length, ok, ko, bl, nota120}); saveHist(HIST);
  CUR.resp = resp; borrarCurso(); $("#ex-run").hidden = true; $("#ex-res").hidden = false;
  const porT = {}; qs.forEach((q, k) => { if (!TEMAS[q.tema]) return; const t = porT[q.tema] = porT[q.tema] || {n: 0, mal: 0}; t.n++; if (resp[k] !== q.r) t.mal++; });
  const malT = Object.entries(porT).filter(([, t]) => t.mal).sort((a, b) => b[1].mal - a[1].mal || b[1].n - a[1].n).slice(0, 6);
  if (!qs[0].ia) GANCHOS.alCorregir?.({tipo: CUR.tipo, n: qs.length, ok, ko, bl, nota: Math.round(nota120 * 100) / 100, escala: ESC, segundos: seg, tarea: CUR.tarea || null,
    por_bloque: porB, por_tema: porT, respuestas: qs.map((q, k) => ({q: q.id, v: resp[k] === null ? "bl" : resp[k] === q.r ? "ok" : "ko"}))});
  const hi = Math.max(...CORTES.map(c => c[1])), lo = Math.min(...CORTES.map(c => c[1]));
  const corte = nota120 >= hi ? [C.veredictos[0], "var(--good)"] : nota120 >= lo ? [C.veredictos[1], "var(--s4)"] : [C.veredictos[2], "var(--bad)"];
  $("#ex-score").innerHTML = `${porTiempo ? `<p class="note" style="margin-bottom:8px">Se acabó el tiempo: se ha corregido lo que llevabas.</p>` : ""}
    <div class="scorebig"><div><span class="eyebrow">Nota equivalente sobre ${ESC}</span><div class="n">${fmt(nota120, 1)}</div></div>
    <div style="display:grid;gap:4px"><span><span class="res-ok">✓ ${ok} aciertos</span>, <span class="res-ko">✗ ${ko} fallos</span>, <span class="res-bl">— ${bl} en blanco</span></span>
    <span class="ink2">Puntuación neta: ${fmt(ok, 0)} − ${fmt(ko, 0)}/${DIV} = <b>${fmt(neta, 2)}</b> sobre ${qs.length}. Tiempo: ${Math.floor(seg / 60)} min ${seg % 60} s</span>
    <span class="verdict" style="color:${corte[1]}">${corte[0]}</span></div></div>
    <p class="note" style="margin-top:10px">${C.cortesNota} ${CORTES.map(([o, c]) => `${o}: ${fmt(c, 2)}`).join("; ")}. La nota sobre ${ESC} escala tu puntuación neta al tamaño del examen real.</p>
    <h3 style="font-size:1rem;margin:18px 0 6px">Tu hoja corregida</h3>
    <div class="sheet res" id="ex-sheet-res">${qs.map((q, k) => { const v = resp[k], e = v === null ? "" : v === q.r ? "ok" : "ko";
      return `<button class="${e}" data-k="${k}" aria-label="Pregunta ${k + 1}: ${e === "ok" ? "acierto" : e === "ko" ? "fallo" : "en blanco"}"><i></i>${k + 1}</button>`; }).join("")}</div>
    <p class="note" style="margin-top:6px">Verde, acierto; rojo, fallo; vacía, en blanco. Pulsa un número para ver la pregunta.</p>
    <h3 style="font-size:1rem;margin:18px 0 6px">Por bloque</h3>` +
    Object.entries(porB).sort((a, b) => b[1].n - a[1].n).map(([b, s]) => { const p = 100 * (s.ok - s.ko / DIV) / s.n;
      return `<div class="bk"><span>${esc(b)}</span><div class="track"><i style="width:${Math.max(0, p).toFixed(0)}%"></i></div><span class="num">${fmt(s.ok)} de ${s.n}, ${fmt(p)} %</span></div>`; }).join("") +
    (malT.length && !qs[0].ia ? `<h3 style="font-size:1rem;margin:18px 0 6px">Temas donde más has fallado</h3><ul class="tfallo">` +
      malT.map(([t, x]) => `<li><span>${esc(TEMAS[t])}: <b>${x.mal}</b> de ${x.n} sin acertar</span><button data-practicar="${t}" aria-label="Practicar ${esc(TEMAS[t])}">Practicar este tema</button></li>`).join("") + `</ul>` : "");
  drawReview(); drawHist();
  $("#ex-sheet-res").querySelectorAll("button").forEach(b => b.onclick = () => { if ($("#ex-filtro").value !== "todas") { $("#ex-filtro").value = "todas"; drawReview(); }
    document.getElementById("rv" + b.dataset.k).scrollIntoView({behavior: "smooth", block: "start"}); });
  $("#examenes").scrollIntoView({behavior: "smooth"}); }
$("#ex-submit").onclick = $("#ex-submit2").onclick = () => {
  const n = CUR.qs.length; let r = 0; for (let k = 0; k < n; k++) if (document.querySelector(`input[name="r${k}"]:checked`)) r++;
  const b = $("#ex-submit"); if (r < n && b.dataset.sure !== "1") { b.dataset.sure = "1"; b.textContent = `Te faltan ${n - r}. Pulsa otra vez para entregar`; $("#ex-submit2").textContent = b.textContent; setTimeout(() => { b.dataset.sure = ""; b.textContent = $("#ex-submit2").textContent = "Entregar y corregir"; }, 5000); return; }
  b.dataset.sure = ""; b.textContent = $("#ex-submit2").textContent = "Entregar y corregir"; corregir(); };
function drawReview() { const f = $("#ex-filtro").value; const qs = CUR.qs, rs = CUR.resp;
  $("#ex-review").innerHTML = qs.map((q, k) => { const v = rs[k], est = v === null ? "bl" : v === q.r ? "ok" : "ko"; if (f === "mal" && est === "ok") return "";
    return `<div class="exq" id="rv${k}"><div class="hd"><span><span class="qn">${k + 1}</span><span class="src">${origen(q)}. ${esc(TEMAS[q.tema] || "")}</span></span><span class="${est === "ok" ? "res-ok" : est === "ko" ? "res-ko" : "res-bl"}">${est === "ok" ? "✓ Acierto" : est === "ko" ? "✗ Fallo" : "— En blanco"}</span></div>
      <p class="st">${esc(q.e)}</p>${q.o.map((o, j) => `<div class="opt ${j === q.r ? "ok" : j === v ? "ko" : ""}"><span class="l">${LET[j]}</span><span>${esc(o)}</span>${j === q.r ? `<span class="mk">✓ Correcta</span>` : j === v ? `<span class="mk">✗ Tu respuesta</span>` : ""}</div>`).join("")}
      ${q.exp ? `<div class="explica">${esc(q.exp)}</div>` : `<button class="explain" data-k="${k}" style="margin-top:8px" hidden>Explícamela</button><div class="explica" id="exp${k}" hidden></div>`}</div>`; }).join("") ||
    `<p class="note">Todas correctas. Elige «Todas» para revisarlas.</p>`;
  bindExplain(); }
$("#ex-filtro").onchange = drawReview;
$("#ex-new").onclick = () => { CUR = null; $("#ex-res").hidden = true; $("#ex-config").hidden = false; $("#ex-prog").hidden = false; syncConfig(); $("#examenes").scrollIntoView({behavior: "smooth"}); };

/* --- Claude: explicaciones y preguntas nuevas --- */
let SAMPLE = null, SAMPLE_OFF = false;
const errMsg = c => ({rate_limited: "Has hecho muchas consultas seguidas. Espera un poco y vuelve a pulsar.", session_expired: "Tu sesión de Claude ha caducado. Vuelve a iniciar sesión.", refused: "Claude no ha querido responder a esta consulta.", invalid_json: "La respuesta no salió en el formato esperado. Vuelve a intentarlo."})[c] || "No se pudo conectar con Claude. Vuelve a intentarlo en un momento.";
function hideAI() { SAMPLE_OFF = true; document.querySelectorAll("button.explain").forEach(b => b.hidden = true); $("#mode-ia").hidden = true; if (modo() === "ia") { document.querySelector('input[value="sim"]').checked = true; syncConfig(); } }
function bindExplain() { document.querySelectorAll("button.explain").forEach(b => { b.hidden = !SAMPLE || SAMPLE_OFF; b.onclick = () => explicar(+b.dataset.k, b); }); }
async function explicar(k, btn) { const q = CUR.qs[k], v = CUR.resp[k], out = $("#exp" + k);
  btn.disabled = true; out.hidden = false; out.textContent = "Pensando…";
  const prompt = `${C.rol} Explica en español, en 4-8 frases claras, por qué la respuesta correcta es la que indica la plantilla oficial del tribunal y por qué las otras no lo son. Cita la norma y el artículo concreto si lo conoces. La pregunta es de la convocatoria ${q.ia ? "(generada para practicar)" : NOMBRE_OEP(q.oep)}; si la legislación ha cambiado desde entonces y hoy la respuesta sería otra, dilo claramente. Si el texto tiene erratas de OCR, ignóralas. No uses Markdown.\n\nPregunta: ${q.e}\n${opsTxt(q, "\n")}\nRespuesta correcta según la plantilla: ${LET[q.r]}\nRespuesta del opositor: ${v === null ? "en blanco" : LET[v]}`;
  try { await SAMPLE(prompt, {onText: ({text}) => { out.textContent = text; }}); btn.hidden = true; }
  catch (e) { if (["not_granted", "sampling_disabled", "not_declared", "capability_disabled", "capability_removed"].includes(e.code)) { out.hidden = true; hideAI(); } else { out.textContent = (e.text ? e.text + "\n\n" : "") + errMsg(e.code); btn.disabled = false; } } }
async function generarIA() { const v = selTema.value, nombre = selTema.options[selTema.selectedIndex].text.split(" (")[0];
  const ejemplos = shuffle(EX.filter(q => v.startsWith("B:") ? bloqueDe(q.tema) === v.slice(2) : q.tema === v.slice(2))).slice(0, 3)
    .map(q => `- ${q.e} | ${opsTxt(q, " | ")} | correcta: ${LET[q.r]}`).join("\n");
  const st = $("#ia-status"), b = $("#ex-start"); b.disabled = true; st.textContent = "Claude está redactando las preguntas…";
  const prompt = `Redacta 10 preguntas tipo test inéditas para ${C.genContexto}, sobre: ${nombre}. ${C.genEstilo} Usa solo datos de los que estés seguro. Ejemplos reales del tema:\n${ejemplos}\n\nResponde solo con un array JSON de 10 objetos {"e": enunciado, "o": [${NOP} opciones: ${LET.slice(0, NOP).split("").join(", ")}], "r": índice 0-${DIV} de la correcta, "exp": explicación breve de 1-3 frases citando el artículo}.`;
  try { const arr = await SAMPLE.json(prompt, {cache: false});
    const qs = (Array.isArray(arr) ? arr : []).filter(x => x && typeof x.e === "string" && Array.isArray(x.o) && x.o.length === NOP && Number.isInteger(+x.r) && +x.r >= 0 && +x.r < NOP)
      .map((x, i) => ({ia: true, id: "ia-" + i, oep: "IA", n: i + 1, tema: v.startsWith("T:") ? v.slice(2) : "??", e: String(x.e), o: x.o.map(String), r: +x.r, exp: x.exp ? String(x.exp) : ""}));
    if (!qs.length) throw {code: "invalid_json"};
    st.textContent = ""; CUR = {qs, tipo: "IA: " + nombre, inicio: Date.now()}; render(qs, qs.length * C.segPorPregunta / 60); }
  catch (e) { if (["not_granted", "sampling_disabled", "not_declared", "capability_disabled", "capability_removed"].includes(e.code)) { st.textContent = "Las preguntas de Claude no están disponibles en esta vista."; hideAI(); } else st.textContent = errMsg(e.code); }
  finally { b.disabled = false; } }

$("#mode-ia").hidden = true; syncConfig(); drawHist(); drawCurso();
// cuenta atrás hasta el próximo examen, si la convocatoria tiene fecha
if (C.fechaExamen) { const dias = diasHasta(C.fechaExamen);
  if (dias >= 0) { $("#h-cuenta").hidden = false; $("#h-cuenta").textContent = dias === 0 ? `El examen es hoy, ${C.fechaExamenTexto}.` : `Faltan ${dias} día${dias === 1 ? "" : "s"} para el examen (${C.fechaExamenTexto}).`; } }
(async () => { try { SAMPLE = window.claude ? await window.claude.use("sample") : null; } catch (e) { SAMPLE = null; }
  if (SAMPLE) { $("#mode-ia").hidden = false; bindExplain(); } })();



