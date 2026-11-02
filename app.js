// Generado por construir.py a partir de plantilla.html: no editar aquí.
const OPS = window.OPS;
/* Psicotécnicos de práctica para Tropa y Marinería: los 7 factores de la prueba de aptitudes (verbal, numérico,
   espacial, mecánico, perceptivo, memoria y razonamiento abstracto). Las preguntas no se copian de ningún sitio: se
   generan con reglas, así que la solución es segura por construcción. Cada una sale siempre igual de su identificador
   («T-NUM-0042»), y así el progreso, los fallos, el repaso y el juego funcionan como con las preguntas de examen.
   construir.py inserta este archivo en la plantilla; expone PSICO.banco(n) y PSICO.FACTORES. */
const PSICO = (() => {
  const FACTORES = {NUM: "Numérico", VER: "Verbal", ESP: "Espacial", MEC: "Mecánico", PER: "Perceptivo", MEM: "Memoria", ABS: "Razonamiento abstracto"};
  // azar reproducible: la misma semilla da siempre la misma pregunta
  const semilla = s => { let h = 1779033703 ^ s.length; for (let i = 0; i < s.length; i++) { h = Math.imul(h ^ s.charCodeAt(i), 3432918353); h = h << 13 | h >>> 19; } return h >>> 0; };
  function azar(id) { let a = semilla(id);
    const r = () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
    const ri = (x, y) => x + Math.floor(r() * (y - x + 1)), pick = l => l[Math.floor(r() * l.length)];
    const mezcla = l => { l = [...l]; for (let i = l.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [l[i], l[j]] = [l[j], l[i]]; } return l; };
    return {r, ri, pick, mezcla}; }
  // la correcta y tres distintas, en orden al azar
  function opciones(R, buena, malas) { const vistas = new Set([String(buena)]), o = [buena];
    for (const m of malas) { if (o.length === 4) break;
      if (typeof buena === "number" && buena > 0 && !(m > 0)) continue;   // un negativo entre positivos delataría la respuesta
      if (!vistas.has(String(m))) { vistas.add(String(m)); o.push(m); } }
    if (o.length < 4) throw new Error("faltan distractores");
    const l = R.mezcla(o); return {o: l.map(String), r: l.indexOf(buena)}; }
  const fmt = n => Number(n).toLocaleString("es-ES");

  /* ---------- numérico ---------- */
  function numerico(R) { const t = R.ri(0, 7);
    if (t <= 3) {   // series
      let s, sig, regla;
      if (t === 0) { const a = R.ri(2, 40), d = R.pick([3, 4, 5, 6, 7, 8, 9, 11, 12, 15]) * R.pick([1, 1, -1]); s = [0, 1, 2, 3, 4].map(i => a + i * d + (d < 0 ? 80 : 0)); sig = s[4] + d; regla = `cada número ${d > 0 ? "suma" : "resta"} ${Math.abs(d)}`; }
      else if (t === 1) { const a = R.ri(1, 6), k = R.pick([2, 3]); s = [0, 1, 2, 3].map(i => a * k ** i); sig = s[3] * k; regla = `cada número se multiplica por ${k}`; }
      else if (t === 2) { const a = R.ri(1, 20), d0 = R.ri(1, 4); s = [a]; for (let i = 0; i < 4; i++) s.push(s[i] + d0 + i); sig = s[4] + d0 + 4; regla = `las diferencias crecen de uno en uno (+${d0}, +${d0 + 1}, +${d0 + 2}…)`; }
      else { const a = R.ri(1, 15), b = R.ri(20, 60), da = R.pick([2, 3, 4, 5]), db = R.pick([-2, -3, 5, 6]); s = [a, b, a + da, b + db, a + 2 * da, b + 2 * db]; sig = a + 3 * da; regla = `son dos series intercaladas: una suma ${da} y la otra ${db > 0 ? "suma " + db : "resta " + -db}`; }
      const d = Math.abs(sig - s[s.length - 1]) || 2;
      return {e: `¿Qué número continúa la serie? ${s.join(", ")}, …`, ...opciones(R, sig, R.mezcla([sig + 1, sig - 1, sig + d, sig - 2, sig + 2, sig * 2 - s[s.length - 1]])), exp: `${regla[0].toUpperCase()}${regla.slice(1)}: el siguiente es ${sig}.`}; }
    if (t === 4) { const p = R.pick([5, 10, 15, 20, 25, 30, 40, 75]), base = R.pick([40, 60, 80, 120, 160, 200, 240, 300, 360, 400, 480]); const v = base * p / 100;
      if (!Number.isInteger(v)) return numerico(R);
      return {e: `¿Cuánto es el ${p} % de ${base}?`, ...opciones(R, v, R.mezcla([v + 5, v - 5, v * 2, v + 10, base - v, v / 2].filter(Number.isInteger))), exp: `${base} × ${p} / 100 = ${v}.`}; }
    if (t === 5) { const c = R.ri(2, 6), u = R.ri(2, 9), n = R.ri(3, 12); if (n === c) return numerico(R);
      const total = c * u, v = n * u, cosa = R.pick([["cajas", "cuestan", "€"], ["paquetes", "pesan", "kg"], ["botellas", "contienen", "litros"]]);
      return {e: `Si ${c} ${cosa[0]} ${cosa[1]} ${total} ${cosa[2]}, ¿cuánto ${cosa[1]} ${n} ${cosa[0]}?`, ...opciones(R, v, R.mezcla([v + u, v - u, total + n, v + 1, v * 2])), exp: `Cada una: ${total} / ${c} = ${u}; ${n} × ${u} = ${v} ${cosa[2]}.`}; }
    if (t === 6) { const a = R.ri(12, 89), b = R.ri(11, 69), c = R.ri(5, 39), v = a + b - c;
      return {e: `Calcula de cabeza: ${a} + ${b} − ${c}`, ...opciones(R, v, R.mezcla([v + 10, v - 10, v + 1, v - 1, v + 2])), exp: `${a} + ${b} = ${a + b}; ${a + b} − ${c} = ${v}.`}; }
    const km = R.pick([30, 40, 45, 60, 75, 90]), min = R.pick([15, 20, 30, 45, 60, 90]), h = R.pick([2, 3, 4]); const v = km * 60 * h / min;
    if (!Number.isInteger(v)) return numerico(R);
    return {e: `Un vehículo recorre ${km} km en ${min} minutos. A la misma velocidad, ¿cuántos kilómetros recorre en ${h} horas?`, ...opciones(R, v, R.mezcla([v + km, v - km, km * h, v / 2, v * 2].filter(Number.isInteger))),
      exp: `En una hora recorre ${km} × 60 / ${min} = ${fmt(km * 60 / min)} km; en ${h} horas, ${fmt(v)} km.`}; }

  /* ---------- verbal ---------- */
  // grupos de palabras con el mismo significado: las opciones falsas salen siempre de otros grupos
  const SINONIMOS = [["rápido", "veloz", "raudo"], ["comenzar", "iniciar", "empezar"], ["hermoso", "bello"], ["enojo", "ira", "enfado"], ["valiente", "audaz", "osado"],
    ["terminar", "concluir", "acabar", "finalizar"], ["ayudar", "auxiliar", "socorrer"], ["antiguo", "vetusto"], ["alegre", "contento"], ["astuto", "sagaz"], ["débil", "endeble"],
    ["escaso", "exiguo"], ["honrado", "íntegro"], ["terco", "obstinado", "testarudo"], ["ocultar", "esconder"], ["prudente", "sensato"], ["quieto", "inmóvil"], ["rehusar", "rechazar"],
    ["tranquilo", "sosegado", "sereno"], ["tenaz", "perseverante"], ["útil", "provechoso"], ["extenso", "vasto", "amplio"], ["tosco", "rudo"], ["miedo", "temor", "pavor"],
    ["pelea", "riña", "disputa"], ["esfuerzo", "empeño"], ["orden", "mandato"], ["error", "fallo", "equivocación"], ["vigilar", "custodiar"], ["obedecer", "acatar"],
    ["peligro", "riesgo"], ["lento", "pausado"], ["cansado", "fatigado", "agotado"], ["regresar", "volver"], ["permiso", "autorización"], ["enorme", "colosal", "gigantesco"],
    ["diminuto", "minúsculo"], ["rival", "adversario"], ["meta", "objetivo", "fin"], ["aviso", "advertencia"], ["duda", "incertidumbre"]];
  const ANTONIMOS = [["generoso", "tacaño"], ["abundante", "escaso"], ["valiente", "cobarde"], ["ascender", "descender"], ["amigo", "enemigo"], ["ganar", "perder"], ["claro", "oscuro"],
    ["construir", "destruir"], ["aprobar", "suspender"], ["fácil", "difícil"], ["ruidoso", "silencioso"], ["permitir", "prohibir"], ["orden", "caos"], ["alegría", "tristeza"],
    ["entrada", "salida"], ["ofensivo", "defensivo"], ["avanzar", "retroceder"], ["mínimo", "máximo"], ["superior", "inferior"], ["antiguo", "moderno"], ["obediente", "rebelde"],
    ["paz", "guerra"], ["victoria", "derrota"], ["recordar", "olvidar"], ["lleno", "vacío"], ["temprano", "tarde"], ["unir", "separar"], ["fuerte", "débil"]];
  const ANALOGIAS = [["cría", [["vaca", "ternero"], ["caballo", "potro"], ["oveja", "cordero"], ["cabra", "cabrito"], ["cerdo", "lechón"], ["gallina", "pollito"]]],
    ["herramienta", [["carpintero", "serrucho"], ["pintor", "pincel"], ["cirujano", "bisturí"], ["pescador", "caña"], ["jardinero", "rastrillo"], ["albañil", "paleta"]]],
    ["capital", [["Francia", "París"], ["Italia", "Roma"], ["Portugal", "Lisboa"], ["Alemania", "Berlín"], ["Grecia", "Atenas"], ["Austria", "Viena"], ["Noruega", "Oslo"], ["Irlanda", "Dublín"]]],
    ["lugar de trabajo", [["médico", "hospital"], ["profesor", "colegio"], ["juez", "juzgado"], ["cocinero", "cocina"], ["marinero", "barco"], ["piloto", "avión"], ["minero", "mina"]]]];
  const GRUPOS = {frutas: ["manzana", "pera", "ciruela", "melocotón", "naranja", "uva"], herramientas: ["martillo", "destornillador", "alicates", "llave inglesa", "sierra"],
    colores: ["azul", "verde", "amarillo", "violeta", "granate"], instrumentos: ["guitarra", "violín", "trompeta", "tambor", "flauta"],
    prendas: ["camisa", "pantalón", "chaqueta", "jersey", "abrigo"], planetas: ["Marte", "Venus", "Júpiter", "Saturno", "Mercurio"], peces: ["sardina", "merluza", "atún", "trucha", "lenguado"]};
  function verbal(R) { const t = R.ri(0, 3);
    if (t === 0 || t === 1) { const lista = t === 0 ? SINONIMOS : ANTONIMOS, g = R.pick(lista), [a, b] = t === 0 ? R.mezcla(g) : (R.r() < .5 ? g : [g[1], g[0]]);
      const otras = R.mezcla(lista.filter(p => p !== g).flat().filter(x => !g.includes(x)));
      return {e: `¿Qué palabra significa ${t === 0 ? "lo mismo" : "lo contrario"} que «${a}»?`, ...opciones(R, b, otras), exp: `«${b}» es ${t === 0 ? "sinónimo" : "antónimo"} de «${a}».`}; }
    if (t === 2) { const [rel, pares] = R.pick(ANALOGIAS), [p1, p2] = R.mezcla(pares);
      return {e: `«${p1[0]}» es a «${p1[1]}» como «${p2[0]}» es a…`, ...opciones(R, p2[1], R.mezcla(pares.filter(p => p !== p2).map(p => p[1]).filter(x => x !== p1[1]))),
        exp: `La relación es de ${rel}: ${p1[0]} → ${p1[1]}, ${p2[0]} → ${p2[1]}.`}; }
    const nombres = Object.keys(GRUPOS), g = R.pick(nombres), otro = R.pick(nombres.filter(x => x !== g)), tres = R.mezcla(GRUPOS[g]).slice(0, 3), intrusa = R.pick(GRUPOS[otro]);
    const l = R.mezcla([...tres, intrusa]);
    return {e: "¿Qué palabra no pertenece al grupo?", o: l, r: l.indexOf(intrusa), exp: `Las demás son ${g}; «${intrusa}» no.`}; }

  /* ---------- dibujos ---------- */
  const SVG = (w, h, c, etiqueta) => `<svg class="ps-fig" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img" aria-label="${etiqueta}">${c}</svg>`;
  const TINTA = "#1c2541", SUAVE = "#c9d1e0";

  /* ---------- espacial: la misma figura girada, no reflejada ---------- */
  const giro = c => c.map(([x, y]) => [y, -x]), espejo = c => c.map(([x, y]) => [-x, y]);
  const norma = c => { const mx = Math.min(...c.map(p => p[0])), my = Math.min(...c.map(p => p[1])); return c.map(([x, y]) => [x - mx, y - my]).sort((a, b) => a[0] - b[0] || a[1] - b[1]); };
  const clave = c => JSON.stringify(norma(c)), giros = c => { const l = [c]; for (let i = 0; i < 3; i++) l.push(giro(l[i])); return l; };
  function pieza(R) {   // 5 o 6 cuadrados unidos y quirales (su reflejo no se obtiene girándola)
    for (;;) { const c = [[0, 0]], n = R.ri(5, 6);
      while (c.length < n) { const [x, y] = R.pick(c), [dx, dy] = R.pick([[1, 0], [-1, 0], [0, 1], [0, -1]]); if (!c.some(p => p[0] === x + dx && p[1] === y + dy)) c.push([x + dx, y + dy]); }
      const g = new Set(giros(c).map(clave)); if (!giros(espejo(c)).some(m => g.has(clave(m)))) return c; } }
  function dibujaPieza(c, marca) { const n = norma(c), L = 18, w = (Math.max(...n.map(p => p[0])) + 1) * L, h = (Math.max(...n.map(p => p[1])) + 1) * L, ox = (96 - w) / 2, oy = (96 - h) / 2;
    return SVG(96, 96, n.map(([x, y], i) => `<rect x="${ox + x * L}" y="${oy + y * L}" width="${L}" height="${L}" fill="${i === marca ? "#e0573b" : "#3b6fd8"}" stroke="#fff" stroke-width="2"/>`).join(""), "figura"); }
  function espacial(R) { const c = pieza(R), marca = 0;   // un cuadrado marcado ayuda a seguir el giro
    const conMarca = f => f.map((p, i) => ({p, i})), gira = (l, k) => { let x = l; for (let i = 0; i < k; i++) x = x.map(({p, i}) => ({p: [p[1], -p[0]], i})); return x; };
    const refl = conMarca(c).map(({p, i}) => ({p: [-p[0], p[1]], i})), dib = l => { const n = norma(l.map(x => x.p)), m = l.find(x => x.i === marca).p, mn = [Math.min(...l.map(x => x.p[0])), Math.min(...l.map(x => x.p[1]))];
      const idx = n.findIndex(q => q[0] === m[0] - mn[0] && q[1] === m[1] - mn[1]); return dibujaPieza(l.map(x => x.p), idx); };
    const k = R.ri(1, 3), buena = gira(conMarca(c), k), malas = R.mezcla([0, 1, 2, 3]).map(j => gira(refl, j));
    const fig = [buena, ...malas.slice(0, 3)], orden = R.mezcla([0, 1, 2, 3]);
    return {e: "¿Cuál de las figuras es el modelo girado, sin darle la vuelta?", svg: dib(conMarca(c)), osvg: orden.map(i => dib(fig[i])), o: orden.map(i => `Figura ${"ABCD"[orden.indexOf(i)]}`), r: orden.indexOf(0),
      exp: `La correcta es el modelo girado ${k * 90}°. Las demás son su reflejo (como en un espejo): ningún giro las convierte en el modelo.`}; }

  /* ---------- mecánico ---------- */
  function rueda(cx, cy, r, dientes, flecha) { let d = ""; for (let i = 0; i < dientes; i++) { const a = i / dientes * 2 * Math.PI; d += `<line x1="${cx + r * Math.cos(a)}" y1="${cy + r * Math.sin(a)}" x2="${cx + (r + 6) * Math.cos(a)}" y2="${cy + (r + 6) * Math.sin(a)}" stroke="${TINTA}" stroke-width="4"/>`; }
    return `${d}<circle cx="${cx}" cy="${cy}" r="${r}" fill="#eef2f8" stroke="${TINTA}" stroke-width="2.5"/><circle cx="${cx}" cy="${cy}" r="4" fill="${TINTA}"/>${flecha || ""}`; }
  const flechaHoraria = (cx, cy, r) => `<path d="M${cx - r * .6} ${cy - r * .35} A${r * .7} ${r * .7} 0 0 1 ${cx + r * .6} ${cy - r * .35}" fill="none" stroke="#e0573b" stroke-width="3"/><path d="M${cx + r * .6} ${cy - r * .35} l-9 -3 l6 9 z" fill="#e0573b"/>`;
  function mecanico(R) { const t = R.ri(0, 3);
    if (t === 0) { const n = R.ri(3, 6), r = 26, paso = 2 * r + 8, w = n * paso + 20;
      const c = Array.from({length: n}, (_, i) => rueda(20 + r + i * paso, 50, r, 12, i === 0 ? flechaHoraria(20 + r, 50, r) : "") + `<text x="${20 + r + i * paso}" y="96" text-anchor="middle" font-size="13" fill="${TINTA}">${i + 1}</text>`).join("");
      const horario = n % 2 === 1, l = R.mezcla(["En sentido horario", "En sentido antihorario", "No gira: los engranajes se bloquean", "Alterna de sentido"]);
      return {e: `La rueda 1 gira en sentido horario. ¿En qué sentido gira la rueda ${n}?`, svg: SVG(w, 104, c, `${n} engranajes en fila`), o: l, r: l.indexOf(horario ? "En sentido horario" : "En sentido antihorario"),
        exp: `Cada engranaje gira al revés que el anterior: las ruedas impares van como la 1 y las pares al contrario. La ${n} es ${horario ? "impar" : "par"}.`}; }
    if (t === 1) { const za = R.pick([12, 15, 20, 24, 30]), zb = R.pick([10, 20, 30, 36, 40, 60]); const va = R.pick([2, 3, 4, 5, 6, 10]), vb = va * za / zb;
      if (!Number.isInteger(vb) || za === zb) return mecanico(R);
      return {e: `Un engranaje A de ${za} dientes mueve a otro B de ${zb} dientes. Si A da ${va} vueltas, ¿cuántas da B?`, ...opciones(R, vb, [...R.mezcla([va * zb / za, va, vb + 1, vb * 2, Math.max(1, vb - 1)].filter(x => Number.isInteger(x) && x > 0)), vb + 2, vb + 3, vb + 4]),
        exp: `Pasan los mismos dientes por ambos: ${va} × ${za} = ${va * za} dientes, que en B son ${va * za} / ${zb} = ${vb} vueltas.`}; }
    if (t === 2) { const d1 = R.ri(1, 4), d2 = R.ri(1, 5), p1 = R.pick([10, 20, 30, 40, 60]); const p2 = p1 * d1 / d2;
      if (!Number.isInteger(p2) || d1 === d2) return mecanico(R);
      const x0 = 30, L = 300, f = x0 + L / 2, u = (L / 2) / 5, xa = f - d1 * u, xb = f + d2 * u;
      const c = `<line x1="${x0}" y1="60" x2="${x0 + L}" y2="60" stroke="${TINTA}" stroke-width="5"/><path d="M${f} 62 l-14 26 h28 z" fill="${SUAVE}" stroke="${TINTA}"/>`
        + `<rect x="${xa - 18}" y="24" width="36" height="34" fill="#3b6fd8"/><text x="${xa}" y="46" text-anchor="middle" font-size="13" fill="#fff">${p1} kg</text>`
        + `<rect x="${xb - 18}" y="24" width="36" height="34" fill="#e0573b"/><text x="${xb}" y="46" text-anchor="middle" font-size="15" fill="#fff">?</text>`
        + `<text x="${(xa + f) / 2}" y="104" text-anchor="middle" font-size="13" fill="${TINTA}">${d1} m</text><text x="${(xb + f) / 2}" y="104" text-anchor="middle" font-size="13" fill="${TINTA}">${d2} m</text>`;
      return {e: `La barra está en equilibrio. ¿Cuánto pesa la caja de la derecha?`, svg: SVG(360, 112, c, "palanca con dos pesos"), ...opciones(R, p2, R.mezcla([p1, p1 * d2 / d1, p2 + 10, p2 * 2, p2 + 5].filter(x => Number.isInteger(x) && x > 0))),
        exp: `En equilibrio, peso × distancia es igual a cada lado: ${p1} × ${d1} = ? × ${d2}, así que ? = ${p2} kg.`}; }
    const cruzada = R.r() < .5, c = rueda(60, 55, 32, 0, flechaHoraria(60, 55, 32)) + rueda(220, 55, 32, 0)
      + (cruzada ? `<line x1="60" y1="23" x2="220" y2="87" stroke="${TINTA}" stroke-width="3"/><line x1="60" y1="87" x2="220" y2="23" stroke="${TINTA}" stroke-width="3"/>`
        : `<line x1="60" y1="23" x2="220" y2="23" stroke="${TINTA}" stroke-width="3"/><line x1="60" y1="87" x2="220" y2="87" stroke="${TINTA}" stroke-width="3"/>`);
    const l = R.mezcla(["En sentido horario", "En sentido antihorario", "No gira", "Depende de la velocidad"]);
    return {e: `La polea de la izquierda gira en sentido horario. ¿Cómo gira la de la derecha?`, svg: SVG(280, 110, c, cruzada ? "dos poleas con correa cruzada" : "dos poleas con correa recta"), o: l, r: l.indexOf(cruzada ? "En sentido antihorario" : "En sentido horario"),
      exp: cruzada ? "Con la correa cruzada, la segunda polea gira al revés." : "Con la correa recta (sin cruzar), las dos poleas giran en el mismo sentido."}; }

  /* ---------- perceptivo ---------- */
  const PARECIDOS = {O: "0", 0: "O", I: "1", 1: "I", B: "8", 8: "B", S: "5", 5: "S", Z: "2", 2: "Z", Q: "O", G: "6", 6: "G", E: "F", F: "E", M: "N", N: "M"};
  function perceptivo(R) { const t = R.ri(0, 2), ABC = "ABCDEFGHJKLMNPQRSTUVWXYZ0123456789";
    const codigo = () => Array.from({length: 8}, (_, i) => i === 3 ? "-" : R.pick([...ABC])).join("");
    const tocar = s => { for (;;) { const i = R.pick([0, 1, 2, 4, 5, 6, 7]), c = s[i], n = PARECIDOS[c] || R.pick([...ABC]); if (n !== c) return s.slice(0, i) + n + s.slice(i + 1); } };
    if (t === 0) { const m = codigo(), malas = new Set(); while (malas.size < 3) malas.add(tocar(m));
      return {e: `¿Cuál es exactamente igual que el código ${m}?`, ...opciones(R, m, [...malas]), exp: `Solo «${m}» coincide carácter a carácter; las demás cambian uno.`, mono: true}; }
    if (t === 1) { const m = codigo(), distinta = tocar(m), l = R.mezcla([m, m, m, distinta]);
      return {e: "¿Cuál de estos códigos es distinto de los demás?", o: l.map((x, i) => x + " ".repeat(i)), r: l.indexOf(distinta), exp: `«${distinta}» cambia un carácter respecto a «${m}».`, mono: true}; }
    const letras = R.pick([["b", "d", "p", "q"], ["m", "n", "u", "w"], ["6", "9", "8", "0"], ["E", "F", "L", "T"]]), obj = letras[0];
    const tira = Array.from({length: 48}, () => R.pick(letras)), n = tira.filter(x => x === obj).length;
    return {e: `¿Cuántas veces aparece «${obj}» en esta tira? ${tira.join(" ")}`, ...opciones(R, n, R.mezcla([n + 1, n - 1, n + 2, n - 2])), exp: `«${obj}» aparece ${n} veces.`, mono: true}; }

  /* ---------- memoria: una ficha que se ve unos segundos ---------- */
  const NOMBRES = ["Laura", "Pedro", "Marta", "Javier", "Lucía", "Andrés", "Sara", "Diego", "Elena", "Rubén", "Nerea", "Óscar"];
  const CIUDADES = ["Cádiz", "Burgos", "Lugo", "Toledo", "Huesca", "Cáceres", "Murcia", "Gijón", "Teruel", "Ceuta"];
  const PUESTOS = ["conductor", "radio", "cocina", "almacén", "enfermería", "guardia", "mecánico", "transmisiones"];
  function memoria(R) { const t = R.ri(0, 1);
    if (t === 0) { const filas = R.mezcla(NOMBRES).slice(0, 4).map((n, i) => ({n, c: R.mezcla(CIUDADES)[i], p: R.mezcla(PUESTOS)[i], num: R.ri(10, 99)}));
      // ciudades, puestos y números distintos entre filas: así cada pregunta tiene una sola respuesta
      const ciu = R.mezcla(CIUDADES).slice(0, 4), pue = R.mezcla(PUESTOS).slice(0, 4), nums = R.mezcla(Array.from({length: 90}, (_, i) => i + 10)).slice(0, 4);
      filas.forEach((f, i) => { f.c = ciu[i]; f.p = pue[i]; f.num = nums[i]; });
      const f = R.pick(filas), q = R.ri(0, 2), campo = ["c", "p", "num"][q], fuera = {c: CIUDADES.filter(x => !ciu.includes(x)), p: PUESTOS.filter(x => !pue.includes(x)), num: [nums[0] + 1, nums[1] + 2]}[campo];
      const ficha = `<table class="ps-ficha"><thead><tr><th>Nombre</th><th>Destino</th><th>Puesto</th><th>Número</th></tr></thead><tbody>${filas.map(x => `<tr><td>${x.n}</td><td>${x.c}</td><td>${x.p}</td><td>${x.num}</td></tr>`).join("")}</tbody></table>`;
      const preg = [`¿Cuál era el destino de ${f.n}?`, `¿Qué puesto tenía ${f.n}?`, `¿Qué número tenía ${f.n}?`][q];
      return {e: preg, mem: {html: ficha, seg: 12}, ...opciones(R, f[campo], R.mezcla([...filas.filter(x => x !== f).map(x => x[campo]), ...fuera])), exp: `En la ficha, ${f.n}: ${f.c}, ${f.p}, número ${f.num}.`}; }
    const s = Array.from({length: 7}, () => R.ri(1, 9)), pos = R.ri(1, 7), v = s[pos - 1];
    return {e: `¿Qué número ocupaba el lugar ${pos} de la serie?`, mem: {html: `<p class="ps-serie">${s.join("  ")}</p>`, seg: 8}, ...opciones(R, v, R.mezcla([1, 2, 3, 4, 5, 6, 7, 8, 9].filter(x => x !== v))),
      exp: `La serie era ${s.join(", ")}; en el lugar ${pos} estaba el ${v}.`}; }

  /* ---------- razonamiento abstracto: series de figuras ---------- */
  function figura(f) { const cx = 40, cy = 40; let forma;
    const relleno = f.lleno ? TINTA : "#fff";
    if (f.forma === 0) forma = `<circle cx="${cx}" cy="${cy}" r="22" fill="${relleno}" stroke="${TINTA}" stroke-width="3"/>`;
    else if (f.forma === 1) forma = `<rect x="${cx - 21}" y="${cy - 21}" width="42" height="42" fill="${relleno}" stroke="${TINTA}" stroke-width="3"/>`;
    else forma = `<path d="M${cx} ${cy - 25} L${cx + 24} ${cy + 18} L${cx - 24} ${cy + 18} Z" fill="${relleno}" stroke="${TINTA}" stroke-width="3"/>`;
    const a = f.ang * Math.PI / 180, aguja = `<line x1="${cx}" y1="${cy}" x2="${cx + 30 * Math.sin(a)}" y2="${cy - 30 * Math.cos(a)}" stroke="#e0573b" stroke-width="4" stroke-linecap="round"/>`;
    const puntos = Array.from({length: f.puntos}, (_, i) => `<circle cx="${40 - (f.puntos - 1) * 6 + i * 12}" cy="74" r="3.5" fill="#3b6fd8"/>`).join("");
    return `${forma}${aguja}${puntos}`; }
  const caja = (f, etiqueta) => SVG(80, 84, figura(f), etiqueta);
  function abstracto(R) {
    // dos o tres atributos cambian con una regla fija; el resto queda igual
    const reglas = R.mezcla(["ang", "puntos", "lleno", "forma"]).slice(0, R.ri(2, 3)), d = R.pick([45, 90]), dp = R.pick([1, 1, -1]);
    const ini = {forma: R.ri(0, 2), lleno: R.r() < .5, ang: R.pick([0, 45, 90, 135]), puntos: dp > 0 ? R.ri(0, 1) : R.ri(4, 5)};
    const paso = i => ({forma: reglas.includes("forma") ? (ini.forma + i) % 3 : ini.forma, lleno: reglas.includes("lleno") ? (i % 2 ? !ini.lleno : ini.lleno) : ini.lleno,
      ang: reglas.includes("ang") ? (ini.ang + d * i) % 360 : ini.ang, puntos: reglas.includes("puntos") ? ini.puntos + dp * i : ini.puntos});
    const serie = [0, 1, 2, 3].map(paso), buena = paso(4);
    if (buena.puntos < 0 || buena.puntos > 6) return abstracto(R);
    const variar = (f, k) => ({...f, ...{ang: {ang: (f.ang + (k === 0 ? d : 180)) % 360}, puntos: {puntos: f.puntos + (k ? -1 : 1)}, lleno: {lleno: !f.lleno}, forma: {forma: (f.forma + 1 + k) % 3}}[R.pick(Object.keys({ang: 1, puntos: 1, lleno: 1, forma: 1}))]});
    const malas = [], ver = new Set([JSON.stringify(buena)]);
    for (let k = 0; malas.length < 3 && k < 60; k++) { const m = variar(buena, k % 2); if (m.puntos >= 0 && m.puntos <= 6 && !ver.has(JSON.stringify(m))) { ver.add(JSON.stringify(m)); malas.push(m); } }
    if (malas.length < 3) return abstracto(R);
    const orden = R.mezcla([0, 1, 2, 3]), fig = [buena, ...malas];
    const nombres = {ang: `la aguja gira ${d}° en cada paso`, puntos: `los puntos ${dp > 0 ? "aumentan" : "disminuyen"} de uno en uno`, lleno: "la figura alterna entre rellena y vacía", forma: "la forma pasa de círculo a cuadrado y a triángulo"};
    const tira = serie.map((f, i) => `<g transform="translate(${i * 88} 0)">${figura(f)}</g>`).join("") + `<g transform="translate(${4 * 88} 0)"><rect x="8" y="8" width="64" height="64" rx="8" fill="none" stroke="${SUAVE}" stroke-width="3" stroke-dasharray="6 5"/><text x="40" y="50" text-anchor="middle" font-size="26" fill="${SUAVE}">?</text></g>`;
    return {e: "¿Qué figura continúa la serie?", svg: SVG(5 * 88, 84, tira, "serie de cuatro figuras"), osvg: orden.map(i => caja(fig[i], "opción")), o: orden.map((_, j) => `Figura ${"ABCD"[j]}`), r: orden.indexOf(0),
      exp: `Las reglas: ${reglas.map(r => nombres[r]).join("; ")}.`}; }

  const GEN = {NUM: numerico, VER: verbal, ESP: espacial, MEC: mecanico, PER: perceptivo, MEM: memoria, ABS: abstracto};
  function pregunta(f, n) { const id = `T-${f}-${String(n).padStart(4, "0")}`, R = azar(id);
    return {id, psico: true, tema: f, oep: "Práctica", n, ...GEN[f](R)}; }
  // el banco: n preguntas de cada factor, siempre las mismas
  const banco = n => Object.keys(FACTORES).flatMap(f => Array.from({length: n}, (_, i) => pregunta(f, i + 1)));
  return {FACTORES, pregunta, banco};
})();

let OPK = null; try { OPK = localStorage.getItem("opos-sel"); } catch (e) { /* sin almacenamiento */ }
const HASH = location.hash.replace("#", "");
// al pasar a otra sección el enlace pasa a ser #temas: hay que recordar la oposición para cuando se recargue
if (OPS[HASH]) { OPK = HASH; try { localStorage.setItem("opos-sel", OPK); } catch (e) { /* sin almacenamiento */ } }
const PORTAL = HASH === "inicio" || !OPS[OPK]?.r;
// en la web propia solo viene entera una oposición: en la portada, la más ligera, aunque la última elegida sea otra
const D = OPS[OPK]?.r ? OPS[OPK] : Object.values(OPS).find(o => o.r);
const C = D.cfg;
// la versión con cuentas (cuenta.js) rellena estos ganchos; en la de Claude no hay ninguno
const GANCHOS = window.GANCHOS || {};
const R = D.r, TEMAS = D.temas;
if (C.color) { const rs = document.documentElement.style; rs.setProperty("--red", C.color[0]); rs.setProperty("--red-2", C.color[1]); rs.setProperty("--red-tint", C.color[2]); }
// el banco y las repetidas apuntan a la pregunta del examen (o del banco) en vez de repetir su texto
D.banco.forEach(b => { if (b[7] >= 0) { const q = D.examen[b[7]]; b[4] = q.e; b[5] = q.o; } });
R.repetidas.lista.forEach(g => g.preguntas.forEach(p => { if (p.b != null) { const b = D.banco[p.b]; p.enunciado = b[4];
  p.opciones = Object.fromEntries(b[5].map((o, i) => ["abcd"[i], o])); p.resp = b[7] >= 0 ? D.examen[b[7]].r : null;
  p.boe = b[7] >= 0 ? D.examen[b[7]].a : b[8]; p.boeOculto = b[7] >= 0; } }));   // enlaces al BOE (ver qcard)
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
// las cifras de exámenes analizados no incluyen Tropa y Marinería: sus preguntas son psicotécnicos de práctica
const OPX = OPL.filter(([, o]) => !o.cfg.psico), OPP = OPL.filter(([, o]) => o.cfg.psico);
const totP = OPX.reduce((x, [, o]) => x + (o.cfg.portada?.[1]?.[0] || 0), 0), totC = OPX.reduce((x, [, o]) => x + (o.cfg.portada?.[0]?.[0] || 0), 0);
$("#pt-lede").innerHTML = `<b>${miles(totP)} preguntas</b> de ${totC} exámenes oficiales, analizadas una a una: qué temas caen, qué leyes se repiten y simulacros corregidos con la plantilla del tribunal${OPP.length ? `; y psicotécnicos de práctica para ${OPP.map(([, o]) => esc(o.cfg.nombreCorto)).join(" y ")}` : ""}. Puedes cambiar de oposición cuando quieras.`;
$("#op-cards").innerHTML = OPL.map(([k, o], i) => { const c = o.cfg, d = diasHasta(c.fechaExamen), nop = c.nOpciones || 4;
  return `<article class="opcard" data-k="${k}" style="${colores(c)}">
    <div class="oc-foto">${c.imagen ? `<img class="oc-img" src="${c.imagen}" alt="${esc(c.imagenAlt || "")}" loading="lazy">` : `<div class="oc-sinimg"></div>`}
    ${d >= 0 ? `<span class="oc-aviso">${d === 0 ? "El examen es hoy" : `Examen en ${d} día${d === 1 ? "" : "s"}`}</span>` : ""}</div>
    <div class="oc-top"><div class="oc-cab"><span class="pt-b" aria-hidden="true">${LETRA[i]}</span><span class="oc-cuerpo">${esc(c.cuerpo)}</span></div>
    <h2>${esc(c.nombreCorto)}</h2><p class="oc-res">${esc(c.resumen)}${d >= 0 ? ` <b>Próximo examen: ${esc(c.fechaExamenTexto)}.</b>` : ""}</p></div>
    ${c.portada ? `<dl class="oc-cifras">${c.portada.map(([n, t]) => `<div><dt>${esc(t)}</dt><dd>${miles(n)}</dd></div>`).join("")}</dl>` : ""}
    <p class="oc-formato">${c.formatoTarjeta || `<b>El test:</b> ${c.simN} preguntas de ${nop} opciones en ${c.simMin} minutos; cada fallo resta 1/${nop - 1} de acierto.`}</p>
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
  ["El temario oficial", "Cada tema del programa con las leyes que entran, enlazadas al BOE, y descargable en PDF."],
  ...(window.CONFIG?.supabaseUrl ? [["Con tu preparador", "Con una cuenta gratuita tu progreso va contigo a cualquier dispositivo y tu preparador puede seguirlo y ponerte tareas."]] : [])
].map(([t, x]) => `<li><b>${t}</b><span>${x}</span></li>`).join("");
$("#nav-cambiar").onclick = e => { e.preventDefault(); location.hash = "inicio"; location.reload(); };

/* ---------- menú superior ---------- */
$("#nav-op").textContent = C.nombreCorto;
const NAV = $("nav.toc"), mAn = $("#nav-analisis"), bMov = $("#nav-movil");
// desplegables del menú: «Análisis» y, con cuenta de administrador, «Gestión» (como mucho uno abierto)
const menuDe = b => document.getElementById(b.getAttribute("aria-controls"));
const grupoAbierto = () => [...NAV.querySelectorAll(".nav-abre")].find(b => b.getAttribute("aria-expanded") === "true");
function grupoNav(cual, abrir) { NAV.querySelectorAll(".nav-abre").forEach(b => { const si = abrir && b === cual; menuDe(b).hidden = !si; b.setAttribute("aria-expanded", String(si)); }); }
function hojaNav(abrir) { NAV.classList.toggle("abierto", abrir); bMov.setAttribute("aria-expanded", String(abrir)); }
const cerrarNav = () => { grupoNav(null, false); hojaNav(false); };
NAV.addEventListener("click", e => { const b = e.target.closest(".nav-abre"); if (!b) return;
  const abrir = menuDe(b).hidden; grupoNav(b, abrir); if (abrir) menuDe(b).querySelector("a").focus(); });
bMov.onclick = () => hojaNav(!NAV.classList.contains("abierto"));
document.addEventListener("click", e => { if (!e.target.closest("nav.toc") || e.target.closest("nav.toc a")) cerrarNav(); });
document.addEventListener("keydown", e => { const g = grupoAbierto();
  if (e.key === "Escape" && (g || NAV.classList.contains("abierto"))) { const vuelve = g || bMov; cerrarNav(); vuelve.focus(); } });
NAV.addEventListener("keydown", e => {   // flechas dentro de un desplegable
  const m = e.target.closest(".nav-menu"); if (!m || (e.key !== "ArrowDown" && e.key !== "ArrowUp")) return; e.preventDefault();
  const l = [...m.querySelectorAll("a")], i = l.indexOf(document.activeElement);
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
  NAV.querySelectorAll(".nav-abre").forEach(b => b.classList.toggle("actual", !!menuDe(b).querySelector(`[data-sec="${id}"]`)));
  const pest = document.querySelector(`#${id} > .an-tabs`), act = pest?.querySelector("[aria-current]");
  if (act) pest.scrollLeft = act.offsetLeft - pest.offsetLeft - 20;   // en el móvil la fila se desliza: que se vea la pestaña actual
  if (!subir) return;
  const el = h && document.getElementById(h);
  if (el?.matches("details")) el.open = true;   // #ficha-D12 abre la ficha de ese tema
  if (el && el.id !== id) el.scrollIntoView({block: "start"}); else if (cambia) scrollTo(0, 0); }
// si las entradas no caben junto a la cuenta, el menú pasa a compacto (botón «Menú»)
function ajustarNav() {
  if (NAV.hidden) return;
  NAV.classList.remove("compacto", "ancho");
  const items = $("#nav-items"), cuenta = $("#nav-cuenta");
  const cabe = () => { const ultimo = items.lastElementChild.lastElementChild || items.lastElementChild;
    const fin = Math.max(...[...items.children].map(e => e.getBoundingClientRect().right), ultimo.getBoundingClientRect().right);
    return innerWidth > 760 && fin + 16 <= cuenta.getBoundingClientRect().left && items.scrollWidth <= items.clientWidth + 1; };
  let si = cabe();
  if (!si) { NAV.classList.add("ancho"); si = cabe(); if (!si) NAV.classList.remove("ancho"); }
  NAV.classList.toggle("compacto", !si);
  if (si) hojaNav(false);
}
new ResizeObserver(ajustarNav).observe($("nav.toc .in"));
new MutationObserver(ajustarNav).observe(NAV, {childList: true, subtree: true, characterData: true});
ajustarNav();
$("#portal").hidden = !PORTAL; $("#main").hidden = PORTAL; document.querySelector("nav.toc").hidden = PORTAL;
document.title = PORTAL ? "Radiografía de Oposiciones" : "Radiografía " + C.nombreCorto;
[["#h-eyebrow", C.cuerpo], ["#h-title", C.titulo]].forEach(([s, v]) => $(s).textContent = v);
if (C.imagen) { $("#h-img").src = C.imagen; $("#h-img").alt = C.imagenAlt || ""; $("#h-img").hidden = false; }
[["#h-claves", C.tituloClaves], ["#h-lede", C.lede], ["#ex-intro", C.exIntro], ["#sim-desc", C.simDesc], ["#temas-intro", C.temasIntro], ["#heat-note", C.heatNote],
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
/* --- enlaces al BOE: el artículo (o la ley) que cita cada pregunta, en su texto consolidado --- */
const boeUrl = (id, ancla) => `https://www.boe.es/buscar/act.php?id=${id}${ancla ? "#" + ancla : ""}`;
function boeHTML(refs, oculto = false) { if (!refs?.length) return "";
  return `<p class="boe-l"${oculto ? " hidden" : ""}><span>Repásalo en el BOE:</span> ${refs.map(([id, num, an, tit]) =>
    `<a href="${boeUrl(id, an)}" target="_blank" rel="noopener">${esc(D.boe?.[id] || "la ley")}${num ? `, art. ${esc(num)}${tit ? ": " + esc(tit) : ""}` : ", texto completo"}</a>`).join("")}</p>`; }
// del banco: la de un examen corregible enlaza lo que cita su respuesta (se ve al pulsar «Ver respuesta»); las demás, su enunciado
const boeBanco = b => b[7] >= 0 ? {boe: D.examen[b[7]].a, boeOculto: true} : {boe: b[8], boeOculto: false};
function qcard(q) { const ops = Object.values(q.opciones || {}).filter(Boolean);
  return `<div class="qcard"><span class="tag">${NOMBRE_OEP(String(q.oep))}${q.ej ? ", modelo " + q.ej : ""}, ${q.parte === "teorico" ? "test" : "supuesto práctico"}, pregunta ${q.n}</span><p style="margin-top:6px">${esc(q.enunciado)}</p>${ops.length ? `<ol>${ops.map((o, i) => `<li data-i="${i}">${esc(o)}</li>`).join("")}</ol>` : ""}` +
    `${q.resp != null && ops.length ? `<button class="ver-resp" data-r="${q.resp}" aria-pressed="false">Ver respuesta</button>` : ""}${boeHTML(q.boe, q.boeOculto)}</div>`; }
// «Ver respuesta» en el banco y en las repetidas
document.addEventListener("click", e => { const b = e.target.closest(".ver-resp"); if (!b) return;
  const on = b.getAttribute("aria-pressed") !== "true"; b.setAttribute("aria-pressed", String(on)); b.textContent = on ? "Ocultar respuesta" : "Ver respuesta";
  const li = b.closest(".qcard").querySelector(`li[data-i="${b.dataset.r}"]`); if (li) li.classList.toggle("ok", on);
  const boe = b.closest(".qcard").querySelector(".boe-l"); if (boe) boe.hidden = !on; });
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
  $("#lst-banco").innerHTML = filtered.slice(page * per, page * per + per).map(b => qcard({...boeBanco(b), oep: b[0], parte: b[1] === "T" ? "teorico" : "practico", n: b[2], ej: b[7] >= 0 ? D.examen[b[7]].ej : "", enunciado: b[4], opciones: {a: b[5][0], b: b[5][1], c: b[5][2], d: b[5][3]}, resp: b[7] >= 0 ? D.examen[b[7]].r : null})
    .replace('</span>', `</span> <span class="pill">${esc((TEMAS[b[3]] || "Sin clasificar").slice(0, 70))}</span>`)).join("") || `<p class="note" style="margin-top:10px">Ninguna pregunta coincide con esos filtros. Prueba con menos palabras o quita algún filtro.</p>`;
  $("#pg-info").textContent = `Página ${page + 1} de ${pages}`; $("#pg-prev").disabled = page === 0; $("#pg-next").disabled = page >= pages - 1; }
["#f-q", "#f-tema", "#f-ano", "#f-parte", "#f-resp"].forEach(s => $(s).addEventListener(s === "#f-q" ? "input" : "change", filterBanco));
$("#pg-prev").addEventListener("click", () => { page--; drawBanco(); }); $("#pg-next").addEventListener("click", () => { page++; drawBanco(); });
filterBanco();

/* ---------- temario: el programa oficial, tema a tema ---------- */
const PROG = D.programa || [];
const boePdf = id => `https://www.boe.es/buscar/pdf/${id.split("-")[2]}/${id}-consolidado.pdf`;
const pregTema = {}; D.banco.forEach(b => pregTema[b[3]] = (pregTema[b[3]] || 0) + 1);
const tituloTema = f => TEMAS[f.k] || f.o || "";
$("#tm-intro").textContent = `Los ${PROG.length} temas del programa, con las leyes que entran y lo que más se pregunta de cada uno.`;
if (C.programaFuente) { $("#tm-fuente").textContent = C.programaFuente[0]; $("#tm-fuente").href = C.programaFuente[1]; }
// los PDF se generan al construir la web (generar_pdfs.py, con el mismo diseño de impresión) y aquí solo se enlazan
// en la versión de Claude los PDF son de la web publicada: ahí un enlace de descarga no hace nada, así que se abren en otra pestaña
const PDFS = C.pdfs, PDF_LOCAL = PDFS && !/^https?:/.test(PDFS.base), kb = n => n >= 1024 ? fmt(n / 1024, 1) + " MB" : fmt(n) + " KB";
const nombrePdf = f => `${C.nombreCorto} - Tema ${f.k} - ${tituloTema(f).replace(/[\\/:*?"<>|]/g, "").slice(0, 80)}.pdf`;
function pdfFicha(f) { const t = PDFS?.fichas?.[f.k];
  return t ? `<a class="boton" href="${PDFS.base}${f.k}.pdf"${PDF_LOCAL ? ` download="${esc(nombrePdf(f))}"` : ""} target="_blank" rel="noopener">Descargar en PDF <span class="note">(${kb(t)})</span></a>` : ""; }
function fichaHTML(f) { const t = tm[f.k], pct = t ? t.pct_ultimos : null, n = pregTema[f.k] || 0;
  const aprox = pct ? Math.round(pct * C.simN / 100) : 0, maxPct = Math.max(...temasR.map(x => x.pct_ultimos)) || 1;
  const prog = f.t ? `<p class="oficial">${esc(f.t)}</p>` : `<ul class="prog">${f.l.map(([nv, x]) => `<li data-n="${nv}">${esc(x)}</li>`).join("")}</ul>`;
  const leyes = f.leyes.map(l => `<li><span class="ln">${esc(l.n)}</span>
      <span class="lk"><a href="${boeUrl(l.id)}" target="_blank" rel="noopener">Leer en el BOE</a><a href="${boePdf(l.id)}" target="_blank" rel="noopener">PDF oficial</a>${l.q ? `<span class="note">Citada en ${l.q} pregunta${l.q === 1 ? "" : "s"} de este tema</span>` : ""}</span>
      ${l.a && l.a.length ? `<span class="arts">${l.a.map(([num, an, tit, v]) => `<a href="${boeUrl(l.id, an)}" target="_blank" rel="noopener" title="${v} preguntas">art. ${esc(num)}${tit ? ": " + esc(tit) : ""} (${v})</a>`).join("")}</span>` : ""}</li>`).join("");
  return `<details class="ficha" id="ficha-${f.k}" data-k="${f.k}"><summary><span class="cod">${esc(f.k)}</span><span class="tit">Tema ${f.n}. ${esc(tituloTema(f))}</span>
    <span class="peso">${pct != null ? `<span class="minibar"><i style="width:${(100 * pct / maxPct).toFixed(0)}%"></i></span>${fmt(pct, 1)} %` : ""}</span></summary>
    <div class="ficha-cuerpo">
      <div><h4>Programa oficial</h4>${prog}</div>
      ${t ? `<div class="ficha-cifras"><span><b>${fmt(pct, 1)} %</b>del examen (${C.recienteLabel})${aprox ? `, unas ${aprox} pregunta${aprox === 1 ? "" : "s"} de ${C.simN}` : ""}</span>
        <span><b>${t.anos_presente ?? Object.values(t.por_ano).filter(Boolean).length} de ${ANOS.length}</b>exámenes en los que ha salido</span><span><b>${fmt(n)}</b>preguntas en el banco</span></div>` : ""}
      ${f.leyes.length ? `<div><h4>Leyes que entran</h4><ul class="leyes">${leyes}</ul></div>` : ""}
      <div class="ficha-acc">${poolTemaN(f.k) ? `<button class="primary" data-practicar="${f.k}">Practicar este tema</button>` : ""}${n ? `<button data-banco-tema="${f.k}">Ver sus preguntas</button>` : ""}${pdfFicha(f)}</div>
    </div></details>`; }
const poolTemaN = k => D.examen.filter(q => q.tema === k).length;
const bloqueFicha = f => C.temaBloque[f.k] || "Otras pruebas", ORDEN_BLOQUE = [...new Set(PROG.map(bloqueFicha))];
function drawTemario() { const q = normTxt($("#tm-q").value.trim()), orden = $("#tm-orden").value, words = q.split(/\s+/).filter(Boolean);
  let fs = PROG.filter(f => words.every(w => normTxt(`${f.k} ${tituloTema(f)} ${f.t || ""} ${(f.l || []).map(x => x[1]).join(" ")} ${f.leyes.map(l => l.n).join(" ")}`).includes(w)));
  if (orden === "peso") fs = [...fs].sort((a, b) => (tm[b.k]?.pct_ultimos ?? -1) - (tm[a.k]?.pct_ultimos ?? -1));
  else fs = [...fs].sort((a, b) => ORDEN_BLOQUE.indexOf(bloqueFicha(a)) - ORDEN_BLOQUE.indexOf(bloqueFicha(b)));   // cada bloque junto
  $("#tm-count").textContent = fs.length === PROG.length ? "" : `${fs.length} de ${PROG.length} temas`;
  let html = `<div class="tm-cab"><h2>Temario de ${esc(C.nombreCorto)}</h2><p class="note">${esc(C.programaFuente?.[0] || "")}. Radiografía de Oposiciones.</p></div>`, grupo = null;
  fs.forEach(f => { const g = orden === "prog" ? bloqueFicha(f) : null;
    if (g && g !== grupo) { html += `<h3 class="tm-grupo">${esc(g)}</h3>`; grupo = g; }
    html += fichaHTML(f); });
  $("#tm-lista").innerHTML = html + (fs.length ? "" : `<p class="note" style="margin-top:10px">Ningún tema coincide. Prueba con otra palabra.</p>`); }
$("#tm-q").addEventListener("input", drawTemario); $("#tm-orden").addEventListener("change", drawTemario);
if (PROG.length) drawTemario(); else { $("#temario").remove(); document.querySelector('nav.toc [data-sec="temario"]')?.remove(); }
if (/^ficha-/.test(location.hash.slice(1))) mostrarVista(location.hash.slice(1));   // enlace directo a un tema: las fichas no existían al arrancar
if (PDFS?.todo) { Object.assign($("#tm-pdf"), {href: PDFS.base + "temario.pdf", target: "_blank", rel: "noopener"}); if (PDF_LOCAL) $("#tm-pdf").download = `Temario de ${C.nombreCorto}.pdf`;
  $("#tm-pdf-t").textContent = `PDF, ${kb(PDFS.todo)}`; } else if ($("#tm-pdf")) $("#tm-pdf").hidden = true;   // sin temario la sección ya no está
// ?pdf=D12 (o ?pdf=todo): la página queda como la imprime generar_pdfs.py, con solo esa ficha (o todas) abierta
function prepararPdf(ks) { const fichas = [...document.querySelectorAll("#tm-lista .ficha")].filter(d => !ks || ks.includes(d.dataset.k));
  fichas.forEach(d => { d.open = true; d.classList.add("imprimir"); });
  document.querySelectorAll("#tm-lista .tm-grupo").forEach(h => { let e = h.nextElementSibling;
    while (e && !e.matches(".tm-grupo")) { if (e.classList.contains("imprimir")) { h.classList.add("imprimir"); break; } e = e.nextElementSibling; } });
  document.body.classList.add("imprimiendo"); }
const PARAM_PDF = new URLSearchParams(location.search).get("pdf");
if (PARAM_PDF && PROG.length) prepararPdf(PARAM_PDF === "todo" ? null : [PARAM_PDF]);
document.addEventListener("click", e => { const b = e.target.closest("[data-banco-tema]"); if (!b) return;
  $("#f-tema").value = b.dataset.bancoTema; ["#f-q", "#f-ano"].forEach(s => $(s).value = ""); filterBanco(); location.hash = "banco"; });

/* ================= EXÁMENES ================= */
// en Tropa y Marinería las preguntas no son de examen: las genera psicotecnicos.js, cada una con su identificador fijo
if (C.psico) D.examen = PSICO.banco(C.psico.porFactor);
const EX = D.examen.map((q, i) => ({...q, id: q.id || q.oep + "-" + (q.ej || "") + "-" + q.n, i}));
const EXI = Object.fromEntries(EX.map(q => [q.id, q]));
const BLQ = C.bloques.map(b => b[0]);
const REPARTO = C.reparto;
const CORTES = C.cortes, ESC = C.escala;
const NOP = C.nOpciones || 4, LET = "ABCDE", DIV = C.penaliza === false ? Infinity : NOP - 1;  // cada error resta 1/(n-1), salvo donde solo cuentan los aciertos
const opsTxt = (q, sep) => q.o.map((o, j) => `${LET[j]}) ${o}`).join(sep);
const LS = C.lsKey;
let LS_SUF = "";   // con sesión iniciada, cada cuenta guarda su copia local aparte de la del visitante
function loadHist() { try { return JSON.parse(localStorage.getItem(LS + LS_SUF)) || {intentos: [], stats: {}}; } catch (e) { return {intentos: [], stats: {}}; } }
function saveHist(h) { try { localStorage.setItem(LS + LS_SUF, JSON.stringify(h)); } catch (e) { /* sin almacenamiento: el examen funciona igual */ } }
let HIST = loadHist();
const shuffle = a => { a = [...a]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const fallosIds = () => Object.entries(HIST.stats).filter(([id, s]) => s.ultimo !== "ok" && EXI[id]).map(([id]) => id);
// repaso espaciado (las mismas reglas que registrar_intento en el servidor): un fallo pone la pregunta en la caja 1, que
// vuelve al día siguiente; cada acierto en su fecha la pasa a la caja siguiente (3, 7 y 14 días) y en la caja 4 sale del repaso
const hoyISO = (dias = 0) => { const d = new Date(); d.setDate(d.getDate() + dias); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; };
const ESPERA = {1: 3, 2: 7, 3: 14};
function programar(s, bien) { const hoy = hoyISO();
  if (!bien) { s.caja = 1; s.prox = hoyISO(1); return; }
  if (!s.caja || s.prox > hoy) return;   // no estaba en el repaso, o la acierta antes de tiempo
  if (s.caja >= 4) { delete s.caja; delete s.prox; return; }
  s.prox = hoyISO(ESPERA[s.caja]); s.caja++; }
const repasoIds = (hasta = hoyISO()) => Object.entries(HIST.stats).filter(([id, s]) => s.caja && s.prox <= hasta && EXI[id]).map(([id]) => id);
const enRepaso = () => Object.values(HIST.stats).filter(s => s.caja).length;

// la misma pregunta puede repetirse en varias convocatorias: que no salga dos veces en un examen
const clave = q => q.psico ? q.id : normTxt(q.e).replace(/[^a-z0-9]+/g, " ").slice(0, 160);   // las de figuras comparten enunciado
// lo que tienen de más los psicotécnicos: el dibujo del enunciado, opciones con dibujo o en letra de código, y la ficha de memoria
const opcionHTML = (q, j) => q.osvg ? `<span class="ps-op">${q.osvg[j]}</span>` : `<span${q.mono ? ' class="ps-mono"' : ""}>${esc(q.o[j])}</span>`;
const enunciadoHTML = q => `<p class="st${q.mono ? " ps-mono" : ""}">${esc(q.e)}</p>`;
function extrasHTML(q, abierta = false) { return (q.svg ? `<div class="ps-svg">${q.svg}</div>` : "") + (!q.mem ? "" : abierta ? `<div class="ps-mem">${q.mem.html}</div>`
  : `<div class="ps-mem" data-seg="${q.mem.seg}"><button class="ps-ver">Ver la ficha (${q.mem.seg} s)</button><div class="ps-mem-c" hidden>${q.mem.html}</div></div>`); }
// la ficha de memoria se ve una sola vez y unos segundos, como en la prueba
document.addEventListener("click", e => { const b = e.target.closest(".ps-ver"); if (!b) return;
  const m = b.closest(".ps-mem"), c = m.querySelector(".ps-mem-c"); let s = +m.dataset.seg; c.hidden = false; b.disabled = true; b.textContent = `Memoriza: ${s} s`;
  const t = setInterval(() => { s--; b.textContent = `Memoriza: ${s} s`; if (s <= 0) { clearInterval(t); c.remove(); b.textContent = "Ficha vista"; } }, 1000); });
const unicas = qs => { const vistos = new Set(); return qs.filter(q => { const k = clave(q); if (vistos.has(k)) return false; vistos.add(k); return true; }); };
const selTema = $("#ex-tema");
selTema.innerHTML = (C.psico ? "" : BLQ.map(b => `<option value="B:${b}">Bloque: ${b}</option>`).join("")) +
  Object.entries(TEMAS).filter(([k]) => !k.startsWith("X")).map(([k, v]) => { const n = unicas(EX.filter(q => q.tema === k)).length; return n ? `<option value="T:${k}">${k}. ${esc(v)} (${n})</option>` : ""; }).join("");
const modo = () => document.querySelector('input[name="modo"]:checked').value;
function pool() { const m = modo(), sinRep = $("#ex-nuevas").checked; let p = EX;
  if (m === "tema") { const v = selTema.value; p = v.startsWith("B:") ? EX.filter(q => bloqueDe(q.tema) === v.slice(2)) : EX.filter(q => q.tema === v.slice(2)); }
  if (m === "fallos") { const ids = new Set(fallosIds()); p = EX.filter(q => ids.has(q.id)); }
  if (m === "repaso") { const ids = new Set(repasoIds()); p = EX.filter(q => ids.has(q.id)); }
  if (sinRep && m !== "fallos" && m !== "repaso") p = p.filter(q => !HIST.stats[q.id]);
  return p; }
function syncConfig() { const m = modo();
  $("#lb-n").hidden = m === "sim" || m === "ia"; $("#lb-tema").hidden = !(m === "tema" || m === "ia");
  $("#lb-n").hidden ||= m === "repaso";
  $("#ex-nuevas").parentElement.hidden = m === "fallos" || m === "ia" || m === "repaso";
  $("#fallos-n").textContent = `${fallosIds().length} pregunta${fallosIds().length === 1 ? "" : "s"} que has fallado o dejado en blanco`;
  const hoyN = repasoIds().length, manana = repasoIds(hoyISO(1)).length - hoyN;
  $("#repaso-n").textContent = hoyN ? `${hoyN} pregunta${hoyN === 1 ? "" : "s"} para hoy` : enRepaso() ? `Hoy estás al día${manana ? `; mañana te tocan ${manana}` : ""}` : "Aquí volverán las que falles, espaciadas en el tiempo";
  $("#ex-pool").textContent = m === "ia" ? "Usa tu cuenta de Claude; tarda 30–60 s en prepararlas." : `${fmt(unicas(pool()).length)} preguntas disponibles de ${fmt(unicas(EX).length)}`;
  $("#ex-start").textContent = m === "ia" ? "Generar 10 preguntas" : "Empezar examen"; }
document.querySelectorAll('input[name="modo"], #ex-tema, #ex-nuevas').forEach(e => e.addEventListener("change", syncConfig));

/* --- juego de la racha: una pregunta, 3 respuestas, solo se avanza al acertar --- */
// fuera las que se refieren a otras opciones («todas las anteriores», «a y b»): con 3 de 4 respuestas, o barajadas, dejan de tener sentido
const CRUZADA = /anteriores|ninguna de las|todas (las|ellas|son)|ambas|las dos|(^|\W)[a-d]\)\s*(y|e|o)\s*[a-d]\)|\b(letras?|opciones|respuestas|apartados) [a-d]\b|\b[a-d] y [a-d]\b/i;
const JUGABLES = unicas(EX).filter(q => !q.o.some(o => CRUZADA.test(o)));
$("#jg-tema").innerHTML = `<option value="">${C.psico ? "Todos los factores" : "Todo el temario"}</option>` + (C.psico ? "" : BLQ.map(b => `<option value="B:${b}">Bloque: ${esc(b)}</option>`).join("")) +
  Object.entries(TEMAS).filter(([k]) => !k.startsWith("X")).map(([k, v]) => { const n = JUGABLES.filter(q => q.tema === k).length; return n >= 5 ? `<option value="T:${k}">${k}. ${esc(v)} (${n})</option>` : ""; }).join("");
function poolJuego() { const v = $("#jg-tema").value;
  return !v ? JUGABLES : v.startsWith("B:") ? JUGABLES.filter(q => bloqueDe(q.tema) === v.slice(2)) : JUGABLES.filter(q => q.tema === v.slice(2)); }
// cada partida se guarda como un intento más (tipo «Juego de la racha…», nota = preguntas seguidas acertadas):
// así sus fallos van a «Repasar mis fallos» y el ranking viaja con la cuenta, sin tablas nuevas
const TIPO_JUEGO = "Juego de la racha";
const esJuego = x => String(x.tipo || "").startsWith(TIPO_JUEGO);
const examenes = () => HIST.intentos.filter(x => !esJuego(x));
const partidas = () => HIST.intentos.filter(esJuego);
const recordJuego = () => Math.max(0, ...partidas().map(x => x.nota120));
let JUEGO = null;
function empezarJuego() { const p = poolJuego(); if (!p.length) return;
  const sel = $("#jg-tema");
  JUEGO = {cola: shuffle(p), i: -1, racha: 0, record: recordJuego(), resp: [], inicio: Date.now(), ambito: sel.options[sel.selectedIndex].text.replace(/ \(\d+\)$/, "")};
  pantallaJuego("partida"); $("#jg-fin").hidden = true;
  siguienteJuego(); $("#ex-juego").scrollIntoView({block: "start"}); }
function siguienteJuego() { const J = JUEGO;
  if (++J.i >= J.cola.length) { J.cola = shuffle(J.cola); J.i = 0; }   // se acabaron: se vuelven a barajar
  const q = J.cola[J.i], falsas = shuffle(q.o.map((_, j) => j).filter(j => j !== q.r)).slice(0, 2);
  J.q = q; J.ops = shuffle([q.r, ...falsas]); J.resuelta = false; $("#jg-boe").innerHTML = "";
  $("#jg-tag").textContent = `${NOMBRE_OEP(String(q.oep))} · ${q.tema}. ${TEMAS[q.tema] || ""}`;
  $("#jg-q").textContent = q.e; $("#jg-q").classList.toggle("ps-mono", !!q.mono);
  $("#jg-ops").innerHTML = J.ops.map((j, n) => `<button class="jg-op" data-j="${j}"><span class="l">${n + 1}</span>${opcionHTML(q, j)}</button>`).join("");
  // psicotécnicos: el dibujo, o la ficha de memoria (se ve unos segundos y después salen las respuestas)
  $("#jg-extra").innerHTML = q.svg ? `<div class="ps-svg">${q.svg}</div>` : "";
  if (q.mem) { let s = q.mem.seg; $("#jg-ops").hidden = true; $("#jg-q").hidden = true;
    $("#jg-extra").innerHTML = `<div class="ps-mem">${q.mem.html}</div><p class="note" id="jg-cuenta">Memoriza: ${s} s</p>`;
    const t = setInterval(() => { if (JUEGO !== J || J.q !== q) return clearInterval(t); s--; const c = $("#jg-cuenta"); if (c) c.textContent = `Memoriza: ${s} s`;
      if (s <= 0) { clearInterval(t); $("#jg-extra").innerHTML = ""; $("#jg-ops").hidden = false; $("#jg-q").hidden = false; $("#jg-ops button").focus({preventScroll: true}); } }, 1000); }
  else { $("#jg-ops").hidden = false; $("#jg-q").hidden = false; }
  $("#jg-msg").textContent = ""; $("#jg-msg").className = "jg-msg"; pintarJuego();
  $("#jg-ops button").focus({preventScroll: true}); }
function pintarJuego() { const J = JUEGO;
  $("#jg-racha").textContent = J.racha; $("#jg-mejor").textContent = Math.max(J.record, J.racha);
  $("#jg-meta").style.width = `${(J.racha % 10) * 10}%`; }   // la barra se llena hasta la siguiente decena
// cada respuesta cuenta como en un examen: la fallada pasa a «Repasar mis fallos» y la acertada sale de ahí
function anotarJuego(q, bien) { const s = HIST.stats[q.id] || {vistas: 0, aciertos: 0}; s.vistas++; if (bien) s.aciertos++; s.ultimo = bien ? "ok" : "ko"; programar(s, bien);
  HIST.stats[q.id] = s; saveHist(HIST); JUEGO.resp.push({q: q.id, v: bien ? "ok" : "ko"}); }
// una sola oportunidad: si fallas se marca la correcta y se acaba la partida
function responderJuego(b) { const J = JUEGO; if (!J || J.resuelta || $("#jg-ops").hidden) return;   // oculta mientras se memoriza la ficha
  J.resuelta = true; const j = +b.dataset.j, bien = j === J.q.r, botones = [...$("#jg-ops").children];
  botones.forEach(x => { x.disabled = true; if (+x.dataset.j === J.q.r) x.classList.add("ok"); });
  anotarJuego(J.q, bien);
  if (!bien) { b.classList.add("ko"); $("#jg-msg").textContent = "Esa no es: la correcta está marcada en verde."; $("#jg-msg").className = "jg-msg ko";
    $("#jg-boe").innerHTML = boeHTML(J.q.a);   // dónde está la respuesta, para repasarla
    return setTimeout(() => { if (JUEGO === J) acabarJuego(); }, 900); }
  J.racha++; const r = $("#jg-racha"); r.classList.remove("jg-racha-sube"); void r.offsetWidth; r.classList.add("jg-racha-sube");
  $("#jg-msg").textContent = J.racha % 10 === 0 ? `¡${J.racha} seguidas! Siguiente pregunta…` : "¡Correcto! Siguiente pregunta…";
  $("#jg-msg").className = "jg-msg ok"; pintarJuego();
  setTimeout(() => { if (JUEGO === J) siguienteJuego(); }, 1100); }
// la partida se guarda como intento: en este navegador y, con sesión, en la cuenta
// (el servidor admite hasta 200 respuestas por intento: de una partida más larga van las 200 últimas)
function guardarPartida(J) { if (!J.resp.length) return;
  const tipo = `${TIPO_JUEGO}: ${J.ambito}`, cuenta = rs => rs.filter(x => x.v === "ok").length;
  HIST.intentos.push({t: Date.now(), tipo, n: J.resp.length, ok: cuenta(J.resp), ko: J.resp.length - cuenta(J.resp), bl: 0, nota120: J.racha}); saveHist(HIST);
  const rs = J.resp.slice(-200);
  GANCHOS.alCorregir?.({hoy: hoyISO(), tipo, n: rs.length, ok: cuenta(rs), ko: rs.length - cuenta(rs), bl: 0, nota: J.racha, escala: 0, segundos: Math.round((Date.now() - J.inicio) / 1000),
    tarea: null, por_bloque: {}, por_tema: {}, respuestas: rs, juego: true}); }
function acabarJuego() { const J = JUEGO; if (!J) return; J.resuelta = true;
  const record = J.racha > J.record && J.racha > 0;
  guardarPartida(J);
  $("#jg-fin-t").textContent = record ? "¡Nuevo récord!" : "Fin de la partida";
  $("#jg-fin-n").textContent = `${J.racha} seguida${J.racha === 1 ? "" : "s"}`;
  $("#jg-fin").classList.toggle("record", record);
  $("#jg-ranking").innerHTML = rankingHTML(J.fin = Date.now()); $("#jg-fin").hidden = false; pintarJuego();
  $("#jg-otra").focus({preventScroll: true}); }
// ranking personal: tus 10 mejores partidas (la que acabas de jugar, resaltada)
function rankingHTML(ultima) { const ps = partidas(), top = [...ps].sort((a, b) => b.nota120 - a.nota120 || a.t - b.t).slice(0, 10);
  if (!ps.length) return `<p class="note">Aún no has jugado ninguna partida. Tu mejor puntuación aparecerá aquí.</p>`;
  const dia = t => new Date(t).toLocaleDateString("es-ES", {day: "numeric", month: "short", year: "numeric"});
  return `<h3>Tu ranking</h3><ol class="jg-top">${top.map((x, i) => `<li${ultima && Math.abs(x.t - ultima) < 3000 ? ' class="tuya"' : ""}><span class="pos">${i + 1}</span>
      <b>${x.nota120}</b><span class="det">${esc(x.tipo.slice(TIPO_JUEGO.length + 2) || "Todo el temario")}<small>${dia(x.t)}</small></span></li>`).join("")}</ol>
    <p class="note">${ps.length} partida${ps.length === 1 ? "" : "s"} jugada${ps.length === 1 ? "" : "s"}; media de ${fmt(ps.reduce((a, x) => a + x.nota120, 0) / ps.length, 1)} seguidas.</p>`; }
// el juego tiene su propia pantalla: menú (reglas, empezar, ranking), ranking y partida
function pantallaJuego(cual) { ["menu", "rank-vista", "partida"].forEach(p => $("#jg-" + p).hidden = p !== cual);
  $("#ex-config").hidden = true; $("#ex-prog").hidden = true; $("#ex-juego").hidden = false; }
function abrirMenuJuego() { JUEGO = null; pantallaJuego("menu");
  const r = recordJuego(), n = poolJuego().length;
  $("#jg-record").innerHTML = (r ? `Tu récord: <b>${r}</b> seguida${r === 1 ? "" : "s"}. ` : "Aún no tienes récord: ¡estrénalo! ") + `${fmt(n)} preguntas disponibles.`;
  $("#jg-empezar").disabled = !n; $("#ex-juego").scrollIntoView({block: "nearest"}); $("#jg-empezar").focus({preventScroll: true}); }
$("#jg-tema").addEventListener("change", abrirMenuJuego);
$("#jg-empezar").onclick = () => empezarJuego();
$("#jg-ver-ranking").onclick = () => { pantallaJuego("rank-vista"); $("#jg-ranking-vista").innerHTML = rankingHTML(); $("#jg-rank-volver").focus({preventScroll: true}); };
$("#jg-rank-volver").onclick = abrirMenuJuego;
// «Practicar» tiene dos secciones: exámenes y tests, y el juego (durante un examen las pestañas no se ven)
function seccionPractica(cual) { const jg = cual === "juego";
  $("#pr-tab-ex").setAttribute("aria-selected", String(!jg)); $("#pr-tab-jg").setAttribute("aria-selected", String(jg)); $("#ex-intro").hidden = jg;
  if (jg) { if ($("#ex-juego").hidden) abrirMenuJuego(); return; }
  if (JUEGO?.resp.length && $("#jg-fin").hidden) guardarPartida(JUEGO);   // a mitad de partida: se guarda lo jugado
  JUEGO = null; $("#ex-juego").hidden = true;
  if ($("#ex-run").hidden && $("#ex-res").hidden) { $("#ex-config").hidden = false; $("#ex-prog").hidden = false; }
  drawHist(); syncConfig(); }
$("#pr-tab-ex").onclick = () => seccionPractica("examenes");
$("#pr-tab-jg").onclick = () => seccionPractica("juego");
document.querySelector(".pr-tabs").addEventListener("keydown", e => { if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;   // flechas entre pestañas
  const b = $("#pr-tab-ex").getAttribute("aria-selected") === "true" ? $("#pr-tab-jg") : $("#pr-tab-ex"); b.click(); b.focus(); });
$("#jg-ops").addEventListener("click", e => { const b = e.target.closest(".jg-op"); if (b) responderJuego(b); });
document.addEventListener("keydown", e => { if (!JUEGO || $("#ex-juego").hidden || !/^[1-3]$/.test(e.key) || e.target.matches?.("input, select, textarea")) return;
  const b = $("#jg-ops").children[+e.key - 1]; if (b) responderJuego(b); });
// «Terminar» a mitad de partida: cuenta lo que llevabas acertado seguido
$("#jg-salir").onclick = () => { if (JUEGO && !$("#jg-fin").hidden) return abrirMenuJuego(); if (JUEGO?.resp.length) acabarJuego(); else abrirMenuJuego(); };
$("#jg-volver").onclick = () => { drawHist(); abrirMenuJuego(); };
$("#jg-otra").onclick = () => { JUEGO = null; empezarJuego(); };

/* --- tu progreso: acierto por tema y qué repasar primero --- */
// % medio del tema en los últimos exámenes; en Tropa y Marinería los siete factores pesan lo mismo
const peso = t => C.psico ? 100 / Object.keys(TEMAS).length : (tm[t] || {}).pct_ultimos || 0;
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
  if (selTema.value !== "T:" + t) return; $("#ex-n").value = "20"; seccionPractica("examenes");
  if (VISTA !== "examenes") { history.pushState(null, "", "#examenes"); mostrarVista("examenes"); }   // desde el temario
  $("#ex-config").scrollIntoView({behavior: "smooth", block: "start"}); $("#ex-start").focus({preventScroll: true}); }
document.addEventListener("click", e => { const b = e.target.closest("[data-practicar]"); if (b) practicar(b.dataset.practicar); });
let progTodos = false;
function drawProg() { const el = $("#prog-body"), it = examenes();
  if (!it.length) { el.innerHTML = `<p class="note" style="margin-top:6px">Cuando corrijas tu primer examen verás aquí tu acierto por tema y qué temas te conviene repasar primero, según lo que pesan en el examen real.</p>`; return; }
  const ids = Object.keys(HIST.stats).filter(id => EXI[id]), total = unicas(EX).length;
  let v = 0, a = 0; ids.forEach(id => { v += HIST.stats[id].vistas; a += HIST.stats[id].aciertos; });
  const ult = it.slice(-5), media = ult.reduce((x, y) => x + y.nota120, 0) / ult.length;
  const pr = prioridades(), max = Math.max(...pr.map(p => p.prio), .01), filas = progTodos ? pr : pr.slice(0, 8);
  el.innerHTML = `<div class="pkpis"><div><b>${fmt(repasoIds().length)}</b><span>para repasar hoy, de ${fmt(enRepaso())} en tu repaso</span></div><div><b>${fmt(ids.length)} <span style="font-size:.9rem;color:var(--muted)">de ${fmt(total)}</span></b><span>preguntas distintas practicadas (${fmt(100 * ids.length / total)} %)</span></div>
    <div><b>${fmt(v ? 100 * a / v : 0)} %</b><span>de aciertos en todas tus respuestas</span></div>
    <div><b>${fmt(it[it.length - 1].nota120, 1)}</b><span>nota del último intento, sobre ${ESC}</span></div>
    <div><b>${fmt(media, 1)}</b><span>media de los ${ult.length} últimos, sobre ${ESC}</span></div></div>` +
    (it.length >= 2 ? sparkNotas(it.slice(-20)) : "") +
    `<h3 style="font-size:1rem;margin:16px 0 4px">Qué repasar primero</h3>
    <p class="note" style="margin-bottom:8px">${C.psico ? "Ordenado por lo que más fallas en cada factor (cuenta tu última respuesta a cada pregunta; un factor sin practicar cuenta como un 50 %)." : "Ordenado por lo que te puede dar cada tema: su peso en los últimos exámenes por la parte que aún fallas (cuenta tu última respuesta a cada pregunta; un tema sin practicar cuenta como un 50 %)."}</p>
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
  const pts = it.map((d, i) => `${x(i).toFixed(1)},${y(d.nota120).toFixed(1)}`).join(" "), ref = CORTES.length ? Math.max(...CORTES.map(c => c[1])) : null, L = it.length - 1;
  return `<svg class="spark" viewBox="0 0 ${W} ${H}" role="img" aria-label="Evolución de tu nota en los últimos ${it.length} intentos">
    ${ref == null ? "" : `<line x1="${m.l}" x2="${W - m.r}" y1="${y(ref)}" y2="${y(ref)}" style="stroke:var(--red-2)" stroke-dasharray="4 3"/>
    <text x="${m.l - 4}" y="${y(ref) + 4}" text-anchor="end" font-size="10" style="fill:var(--muted)">${fmt(ref, ref % 1 ? 1 : 0)}</text>`}
    <line x1="${m.l}" x2="${W - m.r}" y1="${y(0)}" y2="${y(0)}" style="stroke:var(--rule)"/><text x="${m.l - 4}" y="${y(0) + 4}" text-anchor="end" font-size="10" style="fill:var(--muted)">0</text>
    <polyline points="${pts}" fill="none" style="stroke:var(--pen)" stroke-width="2"/>
    ${it.map((d, i) => `<circle cx="${x(i).toFixed(1)}" cy="${y(d.nota120).toFixed(1)}" r="${i === L ? 4 : 2.5}" style="fill:var(--pen)"><title>${new Date(d.t).toLocaleDateString("es-ES")}: ${fmt(d.nota120, 1)} (${esc(d.tipo)})</title></circle>`).join("")}
    <text x="${x(L)}" y="${y(it[L].nota120) - 8}" text-anchor="end" font-size="11" font-weight="600" style="fill:var(--ink)">${fmt(it[L].nota120, 1)}</text>
    <text x="${m.l}" y="${H - 4}" font-size="10" style="fill:var(--muted)">Tus últimos ${it.length} intentos.${ref == null ? "" : ` Línea discontinua: ${esc(CORTES.reduce((a, b) => b[1] > a[1] ? b : a)[0])}`}</text></svg>`; }

function drawHist() { drawProg(); const it = examenes().slice(-8).reverse();
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
  const tipo = m === "rapido" ? "Test rápido" : m === "fallos" ? "Repaso de fallos" : m === "repaso" ? "Repaso de hoy" : selTema.options[selTema.selectedIndex].text.split(" (")[0];
  return {qs: unicas(shuffle(p)).slice(0, m === "fallos" ? 60 : m === "repaso" ? 40 : n), min: null, tipo}; }

function render(qs, tiempoMin) {
  $("#ex-config").hidden = true; $("#ex-prog").hidden = true; $("#ex-res").hidden = true; $("#ex-run").hidden = false;
  $("#ex-qs").innerHTML = qs.map((q, k) => `<div class="exq" id="q${k}"><div class="hd"><span><span class="qn">${k + 1}</span><span class="src">${origen(q)}</span></span><button class="flag" aria-pressed="false" data-k="${k}">Marcar para revisar</button></div>
    ${extrasHTML(q)}${enunciadoHTML(q)}${q.o.map((o, j) => `<label class="opt"><input type="radio" name="r${k}" value="${j}"><span class="l">${LET[j]}</span>${opcionHTML(q, j)}</label>`).join("")}
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
const origen = q => q.ia ? "Pregunta nueva generada por IA" : q.psico ? `Psicotécnico de práctica, factor ${TEMAS[q.tema].toLowerCase()}` : `${NOMBRE_OEP(q.oep)}${q.ej ? ", modelo " + q.ej : ""}, pregunta ${q.n}`;
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
    if (!q.ia) { const s = HIST.stats[q.id] || {vistas: 0, aciertos: 0}; s.vistas++; if (v === q.r) s.aciertos++; s.ultimo = v === null ? "bl" : v === q.r ? "ok" : "ko"; programar(s, v === q.r); HIST.stats[q.id] = s; }
    return v; });
  const neta = ok - ko / DIV, nota120 = ESC * neta / qs.length, seg = Math.round((Date.now() - CUR.inicio) / 1000);
  HIST.intentos.push({t: Date.now(), tipo: CUR.tipo, n: qs.length, ok, ko, bl, nota120}); saveHist(HIST);
  CUR.resp = resp; borrarCurso(); $("#ex-run").hidden = true; $("#ex-res").hidden = false;
  const porT = {}; qs.forEach((q, k) => { if (!TEMAS[q.tema]) return; const t = porT[q.tema] = porT[q.tema] || {n: 0, mal: 0}; t.n++; if (resp[k] !== q.r) t.mal++; });
  const malT = Object.entries(porT).filter(([, t]) => t.mal).sort((a, b) => b[1].mal - a[1].mal || b[1].n - a[1].n).slice(0, 6);
  if (!qs[0].ia) GANCHOS.alCorregir?.({hoy: hoyISO(), tipo: CUR.tipo, n: qs.length, ok, ko, bl, nota: Math.round(nota120 * 100) / 100, escala: ESC, segundos: seg, tarea: CUR.tarea || null,
    por_bloque: porB, por_tema: porT, respuestas: qs.map((q, k) => ({q: q.id, v: resp[k] === null ? "bl" : resp[k] === q.r ? "ok" : "ko"}))});
  const hi = Math.max(...CORTES.map(c => c[1])), lo = Math.min(...CORTES.map(c => c[1]));
  const corte = !CORTES.length ? null : nota120 >= hi ? [C.veredictos[0], "var(--good)"] : nota120 >= lo ? [C.veredictos[1], "var(--s4)"] : [C.veredictos[2], "var(--bad)"];
  $("#ex-score").innerHTML = `${porTiempo ? `<p class="note" style="margin-bottom:8px">Se acabó el tiempo: se ha corregido lo que llevabas.</p>` : ""}
    <div class="scorebig"><div><span class="eyebrow">Nota equivalente sobre ${ESC}</span><div class="n">${fmt(nota120, 1)}</div></div>
    <div style="display:grid;gap:4px"><span><span class="res-ok">✓ ${ok} aciertos</span>, <span class="res-ko">✗ ${ko} fallos</span>, <span class="res-bl">— ${bl} en blanco</span></span>
    <span class="ink2">${DIV === Infinity ? `Sin penalización: solo cuentan los aciertos (<b>${ok}</b> de ${qs.length})` : `Puntuación neta: ${fmt(ok, 0)} − ${fmt(ko, 0)}/${DIV} = <b>${fmt(neta, 2)}</b> sobre ${qs.length}`}. Tiempo: ${Math.floor(seg / 60)} min ${seg % 60} s</span>
    ${corte ? `<span class="verdict" style="color:${corte[1]}">${corte[0]}</span>` : ""}</div></div>
    ${CORTES.length ? `<p class="note" style="margin-top:10px">${C.cortesNota} ${CORTES.map(([o, c]) => `${o}: ${fmt(c, 2)}`).join("; ")}. La nota sobre ${ESC} escala tu puntuación neta al tamaño del examen real.</p>` : C.notaNota ? `<p class="note" style="margin-top:10px">${C.notaNota}</p>` : ""}
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
      ${extrasHTML(q, true)}${enunciadoHTML(q)}${q.o.map((o, j) => `<div class="opt ${j === q.r ? "ok" : j === v ? "ko" : ""}"><span class="l">${LET[j]}</span>${opcionHTML(q, j)}${j === q.r ? `<span class="mk">✓ Correcta</span>` : j === v ? `<span class="mk">✗ Tu respuesta</span>` : ""}</div>`).join("")}
      ${boeHTML(q.a)}${q.exp ? `<div class="explica">${esc(q.exp)}</div>` : `<button class="explain" data-k="${k}" style="margin-top:8px" hidden>Explícamela</button><div class="explica" id="exp${k}" hidden></div>`}</div>`; }).join("") ||
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

/* ================= TROPA Y MARINERÍA: calculadora de nota y pruebas físicas ================= */
if (!C.psico) document.querySelectorAll(".solo-psico").forEach(e => e.remove());
else {
  // sin exámenes oficiales no hay análisis, temario ni banco: fuera del menú y de la página
  document.querySelectorAll('nav.toc .nav-grupo, nav.toc [data-sec="temario"], nav.toc [data-sec="banco"]').forEach(e => e.remove());
  ["temas", "normas", "repetidas", "formato", "metodo", "temario", "banco"].forEach(id => document.getElementById(id)?.remove());
  $("nav.seguir").innerHTML = `<a href="#examenes"><b>Practica la prueba</b><span>Simulacros y tests de los siete factores, sin penalización</span></a>
    <a href="#nota"><b>Calcula tu nota</b><span>Tus méritos con el baremo oficial y tus aciertos</span></a>
    <a href="#fisicas"><b>Pruebas físicas</b><span>Comprueba si llegas a las marcas mínimas</span></a>`;
  document.querySelector('label.mode input[value="tema"] + span b').textContent = "Por factor";
  document.querySelector('label.mode input[value="tema"] + span small').textContent = "Céntrate en el que más te cuesta";
  $("#lb-tema").firstChild.textContent = "Factor";

  // --- tu nota: méritos (0–40 → 0–10) y prueba (aciertos → 0–10); ponderación 70/30 según las guías ---
  const LSN = () => LS + LS_SUF + "-nota", campos = ["nt-carne", "nt-ingles", "nt-titulo", "nt-deporte", "nt-empleo", "nt-recomp", "nt-misiones", "nt-anos", "nt-aciertos"];
  const val = id => { const e = $("#" + id); return e.type === "checkbox" ? (e.checked ? 3 : 0) : +e.value || 0; };
  function calcularNota() {
    const generales = Math.min(36, val("nt-carne") + val("nt-ingles") + val("nt-titulo") + val("nt-deporte"));
    const militares = Math.min(4, val("nt-empleo") + val("nt-recomp") + 0.5 * val("nt-misiones") + 0.25 * val("nt-anos"));
    const co = generales + militares, nco = co / 4, nop = val("nt-aciertos") / 10, pf = 0.7 * nop + 0.3 * nco;
    $("#nt-co").textContent = fmt(co, co % 1 ? 2 : 0); $("#nt-co10").textContent = `${fmt(nco, 2)} sobre 10`;
    $("#nt-op").textContent = fmt(nop, 2); $("#nt-pf").textContent = fmt(pf, 2); $("#nt-pct-v").textContent = `${val("nt-aciertos")} %`;
    $("#nt-aviso").textContent = generales === 36 && val("nt-carne") + val("nt-ingles") + val("nt-titulo") + val("nt-deporte") > 36 ? "Los méritos generales y académicos llegan al máximo de 36 puntos." : "";
    try { localStorage.setItem(LSN(), JSON.stringify(Object.fromEntries(campos.map(id => [id, $("#" + id).type === "checkbox" ? $("#" + id).checked : $("#" + id).value])))); } catch (e) { /* sin almacenamiento */ } }
  try { const g = JSON.parse(localStorage.getItem(LSN())) || {}; campos.forEach(id => { if (id in g) $("#" + id)[$("#" + id).type === "checkbox" ? "checked" : "value"] = g[id]; }); } catch (e) { /* sin datos guardados */ }
  campos.forEach(id => $("#" + id).addEventListener("input", calcularNota));
  // con simulacros hechos, su media de aciertos rellena la prueba
  function pintarMiMedia() { const ex = examenes().slice(-5); $("#nt-mi-media").hidden = !ex.length;
    if (ex.length) $("#nt-mi-media").textContent = `Usar mi media: ${fmt(100 * ex.reduce((a, x) => a + x.ok / x.n, 0) / ex.length)} % (últimos ${ex.length})`; }
  $("#nt-mi-media").onclick = () => { const ex = examenes().slice(-5); $("#nt-aciertos").value = Math.round(100 * ex.reduce((a, x) => a + x.ok / x.n, 0) / ex.length); calcularNota(); };
  $("#nt-form").addEventListener("submit", e => e.preventDefault());
  calcularNota(); pintarMiMedia();
  addEventListener("hashchange", () => { if (location.hash === "#nota") pintarMiMedia(); });

  // --- pruebas físicas: marcas mínimas de ingreso ---
  const FS = C.fisicas, LSF = () => LS + LS_SUF + "-fisicas";
  const mmss = s => `${Math.floor(s / 60)}:${String(Math.round(s % 60)).padStart(2, "0")}`;
  const leeMin = v => { const m = String(v).trim().match(/^(\d{1,2})(?:[:'.,](\d{1,2}))?$/); return m ? +m[1] * 60 + (+m[2] || 0) : NaN; };
  const sexo = () => document.querySelector('input[name="fs-sexo"]:checked').value;
  $("#fs-fuente").textContent = `Marcas de ingreso: ${FS.fuente}. Compruébalas en tu convocatoria antes de la prueba.`;
  let guardadas = {}; try { guardadas = JSON.parse(localStorage.getItem(LSF())) || {}; } catch (e) { /* sin datos guardados */ }
  if (guardadas.sexo) document.querySelector(`input[name="fs-sexo"][value="${guardadas.sexo}"]`).checked = true;
  function pintarFisicas() { const sx = sexo();
    $("#fs-lista").innerHTML = FS.pruebas.map(([k, nombre, desc, unidad, h, m, sentido]) => { const marca = sx === "h" ? h : m;
      const txt = unidad === "min" ? mmss(marca) : `${fmt(marca, marca % 1 ? 1 : 0)} ${unidad === "rep" ? "repeticiones" : "s"}`;
      return `<div class="fs-fila" data-k="${k}"><div><b>${nombre}</b><span class="note">${desc} Marca mínima: <b>${sentido === "mas" ? "al menos" : "como mucho"} ${txt}</b>.</span></div>
        <label for="fs-${k}" class="fs-in"><span class="fuera">Tu marca en ${nombre}</span><input id="fs-${k}" type="text" inputmode="${unidad === "min" ? "numeric" : "decimal"}" placeholder="${unidad === "min" ? "mm:ss" : "Tu marca"}" autocomplete="off" value="${esc(guardadas[k] ?? "")}"></label>
        <span class="fs-est" id="fs-est-${k}"></span></div>`; }).join("");
    $("#fs-lista").querySelectorAll("input").forEach(i => i.addEventListener("input", evaluarFisicas)); evaluarFisicas(); }
  function evaluarFisicas() { const sx = sexo(); let hechas = 0, aptas = 0; guardadas = {sexo: sx};
    FS.pruebas.forEach(([k, , , unidad, h, m, sentido]) => { const raw = $("#fs-" + k).value, marca = sx === "h" ? h : m, est = $("#fs-est-" + k); guardadas[k] = raw;
      const v = unidad === "min" ? leeMin(raw) : parseFloat(String(raw).replace(",", "."));
      if (!raw.trim() || isNaN(v)) { est.textContent = raw.trim() ? "Escríbela así: 11:30" : ""; est.className = "fs-est"; return; }
      const ok = sentido === "mas" ? v >= marca : v <= marca; hechas++; if (ok) aptas++;
      est.textContent = ok ? "Apto" : "No llegas"; est.className = "fs-est " + (ok ? "ok" : "ko"); });
    $("#fs-total").textContent = !hechas ? "" : hechas < FS.pruebas.length ? `Llevas ${aptas} de ${hechas} pruebas superadas.` : aptas === hechas ? "Con estas marcas superas las cuatro pruebas." : `No llegas a ${hechas - aptas === 1 ? "una prueba" : `${hechas - aptas} pruebas`}: con una sola, quedas fuera.`;
    $("#fs-total").className = "fs-total" + (hechas === FS.pruebas.length ? (aptas === hechas ? " ok" : " ko") : "");
    try { localStorage.setItem(LSF(), JSON.stringify(guardadas)); } catch (e) { /* sin almacenamiento */ } }
  document.querySelectorAll('input[name="fs-sexo"]').forEach(r => r.addEventListener("change", pintarFisicas));
  pintarFisicas();
}
// cuenta atrás hasta el próximo examen, si la convocatoria tiene fecha
if (C.fechaExamen) { const dias = diasHasta(C.fechaExamen);
  if (dias >= 0) { $("#h-cuenta").hidden = false; $("#h-cuenta").textContent = dias === 0 ? `El examen es hoy, ${C.fechaExamenTexto}.` : `Faltan ${dias} día${dias === 1 ? "" : "s"} para el examen (${C.fechaExamenTexto}).`; } }
(async () => { try { SAMPLE = window.claude ? await window.claude.use("sample") : null; } catch (e) { SAMPLE = null; }
  if (SAMPLE) { $("#mode-ia").hidden = false; bindExplain(); } })();



