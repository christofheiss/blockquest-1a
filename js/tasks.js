// BlockQuest 1A – Aufgaben-Generatoren nach mathbuch 1 (Klett), Thema J «Terme umformen» (S. 54–59)
// und Thema K «Daten und Diagramme» (S. 60–65). Reihenfolge im Unterricht: zuerst J, dann K.
// Intern steht lu: 10 für J und lu: 11 für K (Zuordnung der Stationen zu den Welten); angezeigt wird THEMA.
// Jede Aufgabe gibt es auf drei Niveaus: 1 = Grundanspruch, 2 = Standard, 3 = Erweiterung.
// Eine Aufgabe: { q (HTML), kind: 'num'|'mc'|'term'|'multi', answer|options|parts, hint, sol, tol?, unit?, form?, n?, probe?, probeAt? }
// kind 'term': answer ist ein Term als Text; geprüft wird durch Einsetzen (gleichwertig). form: 'sum' verlangt
// zusätzlich eine vereinfachte Form ohne Klammern mit höchstens n Gliedern.
// probe/probeAt: Kontroll-Bonus (Wert des Terms bei probeAt), siehe core.js.

// ---------- Hilfsfunktionen ----------
const ri = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const shuffle = (arr) => { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const nz = (a, b) => { let v; do { v = ri(a, b); } while (v === 0); return v; };
const sum = (arr) => arr.reduce((a, b) => a + b, 0);

export function fmt(n) {
  if (typeof n === 'string') return n;
  const r = Math.round(n * 1000) / 1000;
  let s;
  if (Number.isInteger(r)) {
    s = Math.abs(r).toString();
    if (Math.abs(r) >= 10000) s = s.replace(/\B(?=(\d{3})+(?!\d))/g, '’');
  } else s = Math.abs(r).toString();
  return (r < 0 ? '−' : '') + s;
}
const pct = (n) => fmt(Math.round(n * 10) / 10) + ' %';

// ---------- Polynome (für Musterlösungen) ----------
// Ein Polynom ist ein Objekt { Schlüssel: Koeffizient }, Schlüssel z. B. '' (Zahl), 'a', 'a2b' (a²·b)
function monoKey(m) { return Object.keys(m).filter(v => m[v]).sort().map(v => v + (m[v] > 1 ? m[v] : '')).join(''); }
function keyMono(k) { const m = {}; for (const [, v, e] of k.matchAll(/([a-z])(\d*)/g)) m[v] = (m[v] || 0) + (e ? Number(e) : 1); return m; }
const P = {
  n: (c) => ({ '': c }),
  v: (name, c = 1) => ({ [name]: c }),
  add(...ps) { const o = {}; for (const p of ps) for (const [k, c] of Object.entries(p)) o[k] = (o[k] || 0) + c; for (const k in o) if (Math.abs(o[k]) < 1e-12) delete o[k]; return o; },
  scale(p, s) { return Object.fromEntries(Object.entries(p).map(([k, c]) => [k, c * s])); },
  sub(a, b) { return P.add(a, P.scale(b, -1)); },
  mul(a, b) {
    const o = {};
    for (const [ka, ca] of Object.entries(a)) for (const [kb, cb] of Object.entries(b)) {
      const m = keyMono(ka); for (const [v, e] of Object.entries(keyMono(kb))) m[v] = (m[v] || 0) + e;
      const k = monoKey(m); o[k] = (o[k] || 0) + ca * cb;
    }
    for (const k in o) if (Math.abs(o[k]) < 1e-12) delete o[k];
    return o;
  },
  // Text, z. B. «3a² + 2ab − 5»: höchster Grad zuerst, dann alphabetisch, Zahl am Schluss
  str(p) {
    const deg = (k) => sum(Object.values(keyMono(k)));
    const keys = Object.keys(p).filter(k => p[k]).sort((x, y) => (x === '') - (y === '') || deg(y) - deg(x) || x.localeCompare(y));
    if (!keys.length) return '0';
    return keys.map((k, i) => {
      const c = p[k], neg = c < 0, a = Math.abs(c);
      const body = k === '' ? fmt(a) : (a === 1 ? '' : fmt(a)) + k.replace(/([a-z])(\d)/g, (_, v, e) => v + (e === '2' ? '²' : e === '3' ? '³' : '^' + e));
      return i === 0 ? (neg ? '−' : '') + body : (neg ? ' − ' : ' + ') + body;
    }).join('');
  },
  count(p) { return Object.values(p).filter(Boolean).length; },
  ev(p, env) { return sum(Object.entries(p).map(([k, c]) => c * Object.entries(keyMono(k)).reduce((m, [v, e]) => m * env[v] ** e, 1))); },
};
// Ausdruck aus Liste [[Koeffizient, Variable], …] als Text, ohne Zusammenfassen («3a + 2b − a»)
function raw(list) {
  return list.map(([c, v], i) => {
    const a = Math.abs(c), body = v === '' ? fmt(a) : (a === 1 ? '' : fmt(a)) + v;
    return i === 0 ? (c < 0 ? '−' : '') + body : (c < 0 ? ' − ' : ' + ') + body;
  }).join('');
}
const polyOf = (list) => P.add(...list.map(([c, v]) => v === '' ? P.n(c) : P.v(v, c)));
const T = (s) => `<span class="term">${s}</span>`;
const nTerms = (s) => s.split(/ [+−] /).length;

// ---------- Terme der SuS einlesen ----------
// Erlaubt: Zahlen (Komma oder Punkt), Variablen a–z, + − · * × : /, Klammern, ^, ², ³, «2a» (mal), «a2» (= a²), «A = …»
export function parseTerm(str) {
  const s = String(str ?? '').trim()
    .replace(/[−–]/g, '-').replace(/[·×*•]/g, '*').replace(/[:÷]/g, '/').replace(/,/g, '.')
    .replace(/²/g, '^2').replace(/³/g, '^3').replace(/\[/g, '(').replace(/\]/g, ')').replace(/\s+/g, '')
    .replace(/^[a-zA-Z]=/, '').toLowerCase();
  if (!s || /[^0-9a-z.+\-*/^()]/.test(s)) return null;
  const tok = s.match(/\d+(\.\d+)?|\.\d+|[a-z]|[+\-*/^()]/g); if (!tok || tok.join('') !== s) return null;
  let i = 0, plusTop = 0, paren = false;
  const peek = () => tok[i], eat = () => tok[i++];
  function expr(top) {
    let node = term(); if (top) plusTop = 1;
    while (peek() === '+' || peek() === '-') { const o = eat(); const r = term(); const l = node; node = o === '+' ? (e) => l(e) + r(e) : (e) => l(e) - r(e); if (top) plusTop++; }
    return node;
  }
  function term() {
    let node = unary();
    for (;;) {
      const t = peek();
      if (t === '*' || t === '/') { eat(); const r = unary(); const l = node; node = t === '*' ? (e) => l(e) * r(e) : (e) => l(e) / r(e); }
      else if (t !== undefined && (/^[a-z(]$/.test(t) || /^[\d.]/.test(t))) { const r = power(); const l = node; node = (e) => l(e) * r(e); }
      else return node;
    }
  }
  function unary() { if (peek() === '-') { eat(); const f = unary(); return (e) => -f(e); } if (peek() === '+') { eat(); return unary(); } return power(); }
  function power() {
    const base = atom();
    if (peek() === '^') { eat(); const ex = unary(); return (e) => base(e) ** ex(e); }
    return base;
  }
  function atom() {
    const t = eat();
    if (t === undefined) throw 0;
    if (t === '(') { paren = true; const n = expr(false); if (eat() !== ')') throw 0; return n; }
    if (/^[\d.]/.test(t)) { const v = Number(t); return () => v; }
    if (/^[a-z]$/.test(t)) {
      if (peek() && /^[23]$/.test(peek())) { const ex = Number(eat()); return (e) => (t in e ? e[t] : NaN) ** ex; }   // a2 = a²
      return (e) => (t in e ? e[t] : NaN);
    }
    throw 0;
  }
  try {
    const f = expr(true); if (i !== tok.length) return null;
    return { f, summands: plusTop, paren, vars: [...new Set(tok.filter(t => /^[a-z]$/.test(t)))] };
  } catch { return null; }
}
// Gleichwertig? Beide Terme an mehreren Stellen auswerten.
export function sameTerm(a, b, vars) {
  const A = typeof a === 'string' ? parseTerm(a) : a, B = typeof b === 'string' ? parseTerm(b) : b;
  if (!A || !B) return false;
  const vs = vars || [...new Set([...A.vars, ...B.vars])];
  if (A.vars.some(v => !vs.includes(v))) return false;
  for (let k = 0; k < 6; k++) {
    const env = Object.fromEntries(vs.map((v, j) => [v, [1.37, 2.71, -0.83, 3.19, 0.55, -1.9, 4.3][(k + j * 3) % 7] + k * 0.11]));
    const x = A.f(env), y = B.f(env);
    if (!Number.isFinite(x) || Math.abs(x - y) > 1e-6 * Math.max(1, Math.abs(y))) return false;
  }
  return true;
}

// Zahl einlesen: «2,5», «−3», «7/3», «12 %», «x = 4», «72°», «208 min»
export function parseAnswer(str) {
  if (str == null) return NaN;
  const s = String(str).trim().toLowerCase()
    .replace(/[−–]/g, '-').replace(/\s|'|’| /g, '').replace(/(%|°|cm|min|kcal|kj|m)$/, '')
    .replace(/^[a-z]+=/, '').replace(',', '.');
  if (/^-?\d+(\.\d+)?\/-?\d+(\.\d+)?$/.test(s)) { const [p, q] = s.split('/').map(Number); return q === 0 ? NaN : p / q; }
  if (/^-?\d+(\.\d+)?$/.test(s) || /^-?\.\d+$/.test(s)) return Number(s);
  return NaN;
}

// ---------- Grafiken (Canvas → Bild) ----------
function canvasImg(w, h, drawFn, alt = 'Diagramm') {
  const c = document.createElement('canvas'); c.width = w * 2; c.height = h * 2;
  const g = c.getContext('2d'); g.scale(2, 2);
  g.fillStyle = '#fff'; g.fillRect(0, 0, w, h);
  g.font = '12px system-ui, sans-serif'; g.textBaseline = 'middle';
  drawFn(g);
  return `<img class="chart" src="${c.toDataURL('image/png')}" width="${w}" height="${h}" alt="${alt}">`;
}
const LENS = { Orange: '#e8913a', Grün: '#8cc46d', Gelb: '#f6df5b', Rot: '#d9663f', Braun: '#c9a05a', Violett: '#8a78bf', Blau: '#6fb3dc', Pink: '#df94c0' };
const ADJ = { Orange: 'orange', Grün: 'grüne', Gelb: 'gelbe', Rot: 'rote', Braun: 'braune', Violett: 'violette', Blau: 'blaue', Pink: 'pinke' };
const PALETTE = ['#4c8bf5', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#a3a3a3'];

// Säulendiagramm. opt: { title, yLabel, xLabel, max, step, start (y-Achse beginnt hier), colors, values (Werte anschreiben), w, h }
function barImg(labels, values, opt = {}) {
  const W = opt.w || 540, H = opt.h || 300, L = 54, R = 16, Tp = opt.title ? 34 : 14, Bt = 40;
  const step = opt.step || 1, lo = opt.start || 0, hi = opt.max ?? Math.ceil(Math.max(...values) / step) * step;
  const Y = (v) => Tp + (H - Tp - Bt) * (1 - (v - lo) / (hi - lo));
  const slot = (W - L - R) / labels.length;
  return canvasImg(W, H, (g) => {
    if (opt.title) { g.fillStyle = '#222'; g.font = 'bold 14px system-ui'; g.textAlign = 'center'; g.fillText(opt.title, W / 2, 15); }
    g.font = '11px system-ui';
    for (let v = lo; v <= hi + 1e-9; v += step) {
      g.strokeStyle = '#d4d4d4'; g.setLineDash([3, 3]); g.beginPath(); g.moveTo(L, Y(v)); g.lineTo(W - R, Y(v)); g.stroke(); g.setLineDash([]);
      g.fillStyle = '#555'; g.textAlign = 'right'; g.fillText(fmt(v), L - 6, Y(v));
    }
    g.strokeStyle = '#333'; g.beginPath(); g.moveTo(L, Tp - 4); g.lineTo(L, H - Bt); g.lineTo(W - R, H - Bt); g.stroke();
    labels.forEach((lb, i) => {
      const x = L + slot * i + slot * 0.18, bw = slot * 0.64, v = Math.max(lo, values[i]);
      g.fillStyle = opt.colors?.[i] || LENS[lb] || PALETTE[i % PALETTE.length];
      g.fillRect(x, Y(v), bw, H - Bt - Y(v)); g.strokeStyle = '#444'; g.strokeRect(x, Y(v), bw, H - Bt - Y(v));
      g.fillStyle = '#333'; g.textAlign = 'center'; g.font = '11px system-ui'; g.fillText(lb, x + bw / 2, H - Bt + 13);
      if (opt.values) { g.font = 'bold 11px system-ui'; g.fillText(fmt(values[i]), x + bw / 2, Y(v) - 9); }
    });
    if (opt.yLabel) { g.save(); g.translate(12, (Tp + H - Bt) / 2); g.rotate(-Math.PI / 2); g.textAlign = 'center'; g.fillStyle = '#444'; g.fillText(opt.yLabel, 0, 0); g.restore(); }
    if (opt.xLabel) { g.fillStyle = '#444'; g.textAlign = 'center'; g.fillText(opt.xLabel, (L + W - R) / 2, H - 10); }
  }, opt.title || 'Säulendiagramm');
}
// Kreisdiagramm mit Prozentangaben und Legende
function pieImg(labels, values, opt = {}) {
  const W = opt.w || 540, H = opt.h || 290, cx = 160, cy = H / 2 + (opt.title ? 10 : 0), r = 110, tot = sum(values);
  return canvasImg(W, H, (g) => {
    if (opt.title) { g.fillStyle = '#222'; g.font = 'bold 14px system-ui'; g.textAlign = 'left'; g.fillText(opt.title, 14, 15); }
    let a = -Math.PI / 2;
    values.forEach((v, i) => {
      const da = v / tot * Math.PI * 2;
      g.fillStyle = opt.colors?.[i] || LENS[labels[i]] || PALETTE[i % PALETTE.length];
      g.beginPath(); g.moveTo(cx, cy); g.arc(cx, cy, r, a, a + da); g.closePath(); g.fill(); g.strokeStyle = '#333'; g.stroke();
      if (v / tot > 0.04) { const m = a + da / 2; g.fillStyle = '#111'; g.font = '11px system-ui'; g.textAlign = 'center'; g.fillText(pct(v / tot * 100), cx + Math.cos(m) * r * 0.68, cy + Math.sin(m) * r * 0.68); }
      a += da;
    });
    labels.forEach((lb, i) => {
      const y = 44 + i * 24; g.fillStyle = opt.colors?.[i] || LENS[lb] || PALETTE[i % PALETTE.length]; g.fillRect(320, y - 8, 16, 16); g.strokeStyle = '#333'; g.strokeRect(320, y - 8, 16, 16);
      g.fillStyle = '#222'; g.font = '12px system-ui'; g.textAlign = 'left'; g.fillText(lb, 344, y);
    });
  }, opt.title || 'Kreisdiagramm');
}
// Liniendiagramm
function lineImg(xs, series, opt = {}) {
  const W = 540, H = 300, L = 56, R = 18, Tp = opt.title ? 40 : 18, Bt = 40;
  const all = series.flatMap(s => s.v);
  const step = opt.step || 5, lo = opt.min ?? Math.floor(Math.min(...all) / step) * step, hi = opt.max ?? Math.ceil(Math.max(...all) / step) * step;
  const X = (i) => L + (W - L - R) * (i / (xs.length - 1)), Y = (v) => Tp + (H - Tp - Bt) * (1 - (v - lo) / (hi - lo || 1));
  return canvasImg(W, H, (g) => {
    if (opt.title) { g.fillStyle = '#222'; g.font = 'bold 14px system-ui'; g.textAlign = 'center'; g.fillText(opt.title, W / 2, 15); }
    g.font = '11px system-ui';
    for (let v = lo; v <= hi + 1e-9; v += step) { g.strokeStyle = '#ddd'; g.beginPath(); g.moveTo(L, Y(v)); g.lineTo(W - R, Y(v)); g.stroke(); g.fillStyle = '#555'; g.textAlign = 'right'; g.fillText(fmt(v), L - 6, Y(v)); }
    xs.forEach((x, i) => { g.textAlign = 'center'; g.fillStyle = '#555'; g.fillText(x, X(i), H - Bt + 14); });
    if (opt.yLabel) { g.save(); g.translate(12, (Tp + H - Bt) / 2); g.rotate(-Math.PI / 2); g.textAlign = 'center'; g.fillStyle = '#444'; g.fillText(opt.yLabel, 0, 0); g.restore(); }
    const cols = ['#e4572e', '#2f6fd6', '#2e9d5a'];
    series.forEach((s, k) => {
      g.strokeStyle = cols[k]; g.fillStyle = cols[k]; g.lineWidth = 2.4; g.beginPath();
      s.v.forEach((v, i) => (i ? g.lineTo(X(i), Y(v)) : g.moveTo(X(i), Y(v)))); g.stroke(); g.lineWidth = 1;
      s.v.forEach((v, i) => { g.beginPath(); g.arc(X(i), Y(v), 3.5, 0, 7); g.fill(); });
    });
  }, opt.title || 'Liniendiagramm');
}
function table(head, rows) {
  return `<table class="data"><tr>${head.map(h => `<th>${h}</th>`).join('')}</tr>${rows.map(r => `<tr>${r.map(c => `<td>${typeof c === 'number' ? fmt(c) : c}</td>`).join('')}</tr>`).join('')}</table>`;
}
// Zusammengesetzte Figur (SVG). rects: [{x,y,w,h,fill}] in Einheiten, labels: [{x,y,t,a}]
function figSvg(rects, labels, unit = 26) {
  const maxX = Math.max(...rects.map(r => r.x + r.w)), maxY = Math.max(...rects.map(r => r.y + r.h));
  const ox = 56, oy = 28, W = maxX * unit + ox + 50, H = maxY * unit + oy + 30;
  const g = (x, y) => rects.some(r => x >= r.x && x < r.x + r.w && y >= r.y && y < r.y + r.h);
  const edges = [], st = 0.5;
  for (let y = 0; y <= maxY; y += st) for (let x = 0; x <= maxX; x += st) {
    const c = g(x + st / 2, y + st / 2);
    if (c !== g(x + st / 2, y - st / 2)) edges.push(`M${ox + x * unit} ${oy + y * unit}h${st * unit}`);
    if (c !== g(x - st / 2, y + st / 2)) edges.push(`M${ox + x * unit} ${oy + y * unit}v${st * unit}`);
  }
  return `<svg class="fig" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="Figur">
    ${rects.map(r => `<rect x="${ox + r.x * unit}" y="${oy + r.y * unit}" width="${r.w * unit}" height="${r.h * unit}" fill="${r.fill || '#f2b58f'}" stroke="#c97a4a" stroke-dasharray="3 3"/>`).join('')}
    <path d="${edges.join('')}" fill="none" stroke="#333" stroke-width="2.5"/>
    ${labels.map(l => `<text x="${ox + l.x * unit}" y="${oy + l.y * unit}" text-anchor="${l.a || 'middle'}" font-size="15" font-style="italic" fill="#222">${l.t}</text>`).join('')}
  </svg>`;
}

// ---------- Gebäude und Aufgaben ----------
const VAL = { a: 3, b: 2 };   // Zeichengrösse der Variablen in Figuren
export const BUILDINGS = [
  // ===== Thema J: Terme umformen (intern lu: 10) =====
  {
    id: 'glieder', lu: 10, name: 'Meter-Werkstatt', topic: 'Gleichartige Glieder zusammenfassen', lz: 'LZ1', color: 'ORANGE',
    goal: 'Terme vereinfachen, indem gleichartige Glieder addiert und subtrahiert werden',
    ref: 'mathbuch 1, S. 54 A1 B, C · Prüfung A1',
    gen(stage) {
      const hint = 'Gleichartige Glieder haben dieselbe Variable (z. B. 3a und 5a). Zähle ihre Zahlen zusammen. Glieder mit verschiedenen Variablen bleiben getrennt: 3a + 2b lässt sich nicht weiter zusammenfassen.';
      if (stage === 1) {
        if (Math.random() < 0.4) {   // Spielverlauf «Meter füllen» wie im Buch
          const vs = shuffle(['a', 'b', 'c', 'd', 'a', 'c', 'a', 'd', 'b']).slice(0, ri(6, 8));
          const p = polyOf(vs.map(v => [1, v]));
          return { q: `Lia und Neva spielen «Meter füllen». Der Spielverlauf ist<div class="eq">${vs.join(' + ')}</div>Notiere einen möglichst kurzen Term.`, kind: 'term', answer: P.str(p), form: 'sum', n: P.count(p), hint,
            sol: `Zähle, wie oft jede Variable vorkommt: ${T(P.str(p))}` };
        }
        const list = shuffle([[ri(2, 9), 'a'], [ri(1, 9), 'b'], [ri(2, 9), 'a'], [ri(1, 6), 'b']]);
        const p = polyOf(list);
        return { q: `Fasse so weit wie möglich zusammen:<div class="eq">${raw(list)}</div>`, kind: 'term', answer: P.str(p), form: 'sum', n: P.count(p), hint,
          sol: `a-Glieder und b-Glieder getrennt zusammenzählen: ${T(P.str(p))}`, probe: P.ev(p, { a: 2, b: 5 }), probeAt: 'a = 2 und b = 5' };
      }
      if (stage === 2) {
        const v = pick([['x', 'y'], ['a', 'b'], ['m', 'n']]);
        const list = shuffle([[ri(3, 9), v[0]], [nz(-6, 6), v[1]], [-ri(1, 8), v[0]], [ri(2, 12), ''], [-ri(1, 9), ''], [nz(-5, 7), v[1]]]);
        if (list[0][0] < 0) list[0][0] = -list[0][0];
        const p = polyOf(list);
        const env = { [v[0]]: ri(2, 5), [v[1]]: ri(1, 4) };
        return { q: `Vereinfache den Term:<div class="eq">${raw(list)}</div>`, kind: 'term', answer: P.str(p), form: 'sum', n: P.count(p), hint: hint + ' Achte auf das Vorzeichen vor jedem Glied: Es gehört zum Glied dahinter.',
          sol: T(P.str(p)), probe: P.ev(p, env), probeAt: `${v[0]} = ${env[v[0]]} und ${v[1]} = ${env[v[1]]}` };
      }
      if (Math.random() < 0.5) {
        const list = shuffle([[ri(2, 6), 'ab'], [ri(2, 5), 'a²'], [-ri(1, 4), 'ab'], [ri(1, 4), 'a²'], [ri(1, 9), 'b'], [-ri(1, 3), 'b']]);
        if (list[0][0] < 0) list[0][0] = -list[0][0];
        const p = P.add(...list.map(([c, v]) => P.scale(v === 'a²' ? P.mul(P.v('a'), P.v('a')) : v === 'ab' ? P.mul(P.v('a'), P.v('b')) : P.v(v), c)));
        return { q: `Vereinfache den Term:<div class="eq">${raw(list)}</div><p class="small">a² schreibst du als a^2 oder a2.</p>`, kind: 'term', answer: P.str(p), form: 'sum', n: P.count(p),
          hint: 'Nur Glieder mit genau denselben Variablen und Hochzahlen sind gleichartig: ab und ba schon, ab und a² nicht.', sol: T(P.str(p)) };
      }
      const k = ri(2, 5), m = ri(2, 4), c = ri(2, 6);
      const p = P.scale(P.mul(P.v('a'), P.v('b')), k * m + c);
      return { q: `Vereinfache den Term:<div class="eq">${k}a · ${m}b + ${c}ab</div>`, kind: 'term', answer: P.str(p), form: 'sum', n: 1,
        hint: `Zuerst das Produkt: ${k}a · ${m}b = ${k} · ${m} · a · b. Dann gleichartige Glieder addieren.`, sol: `${k}a · ${m}b = ${k * m}ab, dann ${k * m}ab + ${c}ab = ${T(P.str(p))}` };
    }
  },
  {
    id: 'klammer', lu: 10, name: 'Klammer-Brücke', topic: 'Klammerregeln bei Plus und Minus', lz: 'LZ1 · LZ4', color: 'BLUE',
    goal: 'Klammern bei Plus und Minus auflösen und mit Zahlen überprüfen',
    ref: 'mathbuch 1, S. 55 A2 A1–A3',
    gen(stage) {
      const hint = 'Plus vor der Klammer: Klammer weglassen, alles bleibt gleich. Minus vor der Klammer: Klammer weglassen und jedes Vorzeichen in der Klammer umkehren.';
      if (stage === 1) {
        if (Math.random() < 0.35) {
          const a = ri(8, 15), b = ri(4, 7), c = ri(1, 3), res = a - (b - c);
          return { q: `Überprüfe mit Zahlen wie im Buch: a = ${a}, b = ${b}, c = ${c}.<div class="eq">a − (b − c)</div>Welchen Wert hat der Term?`, kind: 'num', answer: res,
            hint: 'Zuerst die Klammer ausrechnen, dann subtrahieren.', sol: `${a} − (${b} − ${c}) = ${a} − ${b - c} = ${res}. Ohne Klammer: ${a} − ${b} + ${c} = ${res} ✓` };
        }
        const f = pick([
          ['a + (b + c)', 'a + b + c'], ['a + (b − c)', 'a + b − c'], ['a − (b + c)', 'a − b − c'], ['a − (b − c)', 'a − b + c'],
          ['x − (y + 4)', 'x − y − 4'], ['x + (5 − y)', 'x + 5 − y'], ['m − (n − 3)', 'm − n + 3'],
        ]);
        return { q: `Schreibe ohne Klammern:<div class="eq">${f[0]}</div>`, kind: 'term', answer: f[1], form: 'sum', n: nTerms(f[1]), hint, sol: `${f[0]} = ${T(f[1])}` };
      }
      if (stage === 2) {
        const a = ri(5, 12), b = ri(2, 6), c = ri(1, 9), s = pick([1, -1]);
        const inner = [[b, 'x'], [-s * c, '']];
        const p = P.sub(P.v('x', a), polyOf(inner));
        const env = { x: ri(2, 6) };
        return { q: `Löse die Klammer auf und vereinfache:<div class="eq">${a}x − (${raw(inner)})</div>`, kind: 'term', answer: P.str(p), form: 'sum', n: P.count(p), hint,
          sol: `${a}x − ${b}x ${s > 0 ? '+' : '−'} ${c} = ${T(P.str(p))}`, probe: P.ev(p, env), probeAt: `x = ${env.x}` };
      }
      const A = [[ri(4, 9), 'x'], [nz(-5, 5), 'y']], Bv = [[ri(1, 4), 'x'], [nz(-4, 4), 'y']], c = nz(-6, 6);
      const p = P.add(polyOf(A), P.scale(polyOf(Bv), -1), P.n(c));
      const env = { x: ri(1, 4), y: ri(1, 4) };
      return { q: `Löse die Klammern auf und vereinfache:<div class="eq">(${raw(A)}) − (${raw(Bv)}) ${c < 0 ? '−' : '+'} ${Math.abs(c)}</div>`, kind: 'term', answer: P.str(p), form: 'sum', n: P.count(p), hint,
        sol: `${raw([...A, ...Bv.map(([k, v]) => [-k, v]), [c, '']])} = ${T(P.str(p))}`, probe: P.ev(p, env), probeAt: `x = ${env.x} und y = ${env.y}` };
    }
  },
  {
    id: 'distri', lu: 10, name: 'Distributiv-Fabrik', topic: 'Ausmultiplizieren (Distributivgesetz)', lz: 'LZ3', color: 'GREEN',
    goal: 'Klammern mit dem Distributivgesetz ausmultiplizieren, z. B. 3 · (a + 4) = 3a + 12',
    ref: 'mathbuch 1, S. 55 A2 B, C · Prüfung A2',
    gen(stage) {
      const hint = 'Distributivgesetz: Jedes Glied in der Klammer wird mit dem Faktor vor der Klammer multipliziert: a · (b + c) = ab + ac. Achte auf Minus!';
      if (stage === 1) {
        const k = ri(2, 9), v = pick(['a', 'x', 'b', 'y']), c = ri(1, 9), s = pick([1, 1, -1]);
        const inner = [[1, v], [s * c, '']], p = P.scale(polyOf(inner), k);
        return { q: `Multipliziere aus:<div class="eq">${k} · (${raw(inner)})</div>`, kind: 'term', answer: P.str(p), form: 'sum', n: 2, hint,
          sol: `${k} · ${v} ${s > 0 ? '+' : '−'} ${k} · ${c} = ${T(P.str(p))}`, probe: P.ev(p, { [v]: 3 }), probeAt: `${v} = 3` };
      }
      if (stage === 2) {
        const t = pick(['neg', 'var', 'minus']);
        if (t === 'var') {
          const k = ri(2, 7);
          const f = pick([
            ['a', polyOf([[1, 'b'], [1, 'c']])], ['x', polyOf([[1, 'x'], [k, '']])], ['a', polyOf([[1, 'a'], [1, 'b']])], ['b', polyOf([[2, 'a'], [k, '']])],
          ]);
          const p = P.mul(P.v(f[0]), f[1]);
          return { q: `Multipliziere aus:<div class="eq">${f[0]} · (${P.str(f[1])})</div><p class="small">a · a schreibst du als a^2 oder a2.</p>`, kind: 'term', answer: P.str(p), form: 'sum', n: P.count(p), hint, sol: T(P.str(p)) };
        }
        const k = t === 'neg' ? -ri(2, 6) : ri(2, 8), a = ri(2, 6), c = ri(1, 9), s = pick([1, -1]);
        const inner = polyOf([[a, 'x'], [s * c, '']]), p = P.scale(inner, k);
        return { q: `Multipliziere aus:<div class="eq">${k < 0 ? `(${fmt(k)})` : k} · (${P.str(inner)})</div>`, kind: 'term', answer: P.str(p), form: 'sum', n: 2,
          hint: hint + (k < 0 ? ' Minus mal Minus gibt Plus.' : ' Vergiss nicht, auch die Zahl in der Klammer zu multiplizieren.'),
          sol: `${fmt(k)} · ${a}x = ${fmt(k * a)}x und ${fmt(k)} · ${fmt(s * c)} = ${fmt(k * s * c)}, also ${T(P.str(p))}`, probe: P.ev(p, { x: 2 }), probeAt: 'x = 2' };
      }
      if (Math.random() < 0.6) {
        const f = pick([
          [polyOf([[1, 'a'], [1, 'b']]), polyOf([[1, 'c'], [1, 'd']])],
          [polyOf([[1, 'x'], [ri(1, 6), '']]), polyOf([[1, 'x'], [nz(-5, 6), '']])],
          [polyOf([[1, 'a'], [ri(1, 5), '']]), polyOf([[1, 'b'], [ri(1, 5), '']])],
        ]);
        const p = P.mul(f[0], f[1]);
        return { q: `Multipliziere aus (wie das Rechteck mit den Seiten (a + b) und (c + d) im Buch):<div class="eq">(${P.str(f[0])}) · (${P.str(f[1])})</div>`, kind: 'term', answer: P.str(p), form: 'sum', n: P.count(p),
          hint: 'Jedes Glied der ersten Klammer mal jedes Glied der zweiten Klammer: (a + b)(c + d) = ac + ad + bc + bd. Danach gleichartige Glieder zusammenfassen.', sol: T(P.str(p)) };
      }
      const k = pick([2, 3, 4, 5, 6]), a = ri(1, 5), c = nz(-7, 7);
      const inner = polyOf([[a, 'x'], [c, '']]), outer = P.scale(inner, k);
      return { q: `Klammere den Faktor ${k} aus:<div class="eq">${P.str(outer)} = ${k} · ( ? )</div>Was steht in der Klammer?`, kind: 'term', answer: P.str(inner), form: 'sum', n: 2,
        hint: `Ausklammern ist das Umgekehrte von Ausmultiplizieren: Teile jedes Glied durch ${k}.`, sol: `${P.str(outer)} = ${k} · (${T(P.str(inner))})` };
    }
  },
  {
    id: 'flaeche', lu: 10, name: 'Flächen-Atelier', topic: 'Umfang und Fläche als Term', lz: 'LZ3', color: 'PINK',
    goal: 'Umfang und Flächeninhalt zusammengesetzter Rechtecke als Produkt- und Summenterm notieren',
    ref: 'mathbuch 1, S. 56 A3 · S. 57 A4 B, C',
    gen(stage) {
      const hintU = 'Umfang u: Gehe einmal rundherum und addiere alle Seitenlängen.', hintA = 'Flächeninhalt A: Länge · Breite. Zerlege die Figur in Rechtecke und addiere ihre Flächen.';
      const ask = pick(['u', 'A']);
      const what = ask === 'u' ? '<b>Umfang u</b>' : '<b>Flächeninhalt A</b>';
      if (stage === 1) {
        const sides = pick([[['a'], ['b']], [['a'], ['a', 'b']], [['b'], ['a', 'b']], [['a'], ['3']], [['2'], ['a', 'b']]]);
        const w = sides[1], h = sides[0];
        const term = (s) => polyOf(s.map(x => /^\d$/.test(x) ? [Number(x), ''] : [1, x]));
        const W = term(w), Hh = term(h);
        const wv = sum(w.map(x => VAL[x] ?? Number(x))), hv = sum(h.map(x => VAL[x] ?? Number(x)));
        const p = ask === 'u' ? P.scale(P.add(W, Hh), 2) : P.mul(W, Hh);
        const svg = figSvg([{ x: 0, y: 0, w: wv, h: hv }], [{ x: wv / 2, y: -0.3, t: P.str(W) }, { x: -0.3, y: hv / 2 + 0.2, t: P.str(Hh), a: 'end' }]);
        return { q: svg + `Notiere den ${what} des Rechtecks als Term.`, kind: 'term', answer: P.str(p), hint: ask === 'u' ? hintU + ' Beim Rechteck: u = 2 · Länge + 2 · Breite.' : hintA,
          sol: ask === 'u' ? `u = 2 · (${P.str(W)}) + 2 · (${P.str(Hh)}) = ${T(P.str(p))}` : `A = (${P.str(Hh)}) · (${P.str(W)}) = ${T(P.str(p))}` };
      }
      if (stage === 2) {
        // Puzzleteile aus dem Buch: Quadrat a × a (blau), Quadrat b × b (orange), Rechteck a × b (gelb); Zeichnung mit a = 3, b = 2
        const ab = () => P.mul(P.v('a'), P.v('b')), aa = () => P.mul(P.v('a'), P.v('a')), bb = () => P.mul(P.v('b'), P.v('b'));
        const s = pick([
          { r: [{ x: 0, y: 0, w: 2, h: 2, fill: '#e98a5a' }, { x: 2, y: 0, w: 3, h: 2, fill: '#f3d36b' }], top: 'b + a', left: 'b', u: polyOf([[2, 'a'], [4, 'b']]), A: P.add(bb(), ab()), prod: 'b · (a + b)' },
          { r: [{ x: 0, y: 0, w: 3, h: 3, fill: '#9fbdd0' }, { x: 3, y: 0, w: 2, h: 3, fill: '#f3d36b' }], top: 'a + b', left: 'a', u: polyOf([[4, 'a'], [2, 'b']]), A: P.add(aa(), ab()), prod: 'a · (a + b)' },
          { r: [{ x: 0, y: 0, w: 3, h: 2, fill: '#f3d36b' }, { x: 3, y: 0, w: 3, h: 2, fill: '#f3d36b' }], top: 'a + a', left: 'b', u: polyOf([[4, 'a'], [2, 'b']]), A: P.scale(ab(), 2), prod: 'b · 2a' },
          { r: [{ x: 0, y: 0, w: 3, h: 3, fill: '#9fbdd0' }, { x: 0, y: 3, w: 3, h: 2, fill: '#f3d36b' }, { x: 3, y: 0, w: 2, h: 3, fill: '#f3d36b' }, { x: 3, y: 3, w: 2, h: 2, fill: '#e98a5a' }], top: 'a + b', left: 'a + b', u: polyOf([[4, 'a'], [4, 'b']]), A: P.add(aa(), P.scale(ab(), 2), bb()), prod: '(a + b) · (a + b)' },
        ]);
        const maxX = Math.max(...s.r.map(r => r.x + r.w)), maxY = Math.max(...s.r.map(r => r.y + r.h));
        const svg = figSvg(s.r, [{ x: maxX / 2, y: -0.3, t: s.top }, { x: -0.3, y: maxY / 2 + 0.2, t: s.left, a: 'end' }]);
        const p = ask === 'u' ? s.u : s.A;
        return { q: svg + `Die Figur ist aus Puzzleteilen gelegt (Quadrat a × a, Quadrat b × b, Rechteck a × b).<br>Notiere den ${what} als Term.`,
          kind: 'term', answer: P.str(p), hint: ask === 'u' ? hintU : hintA + ' Produktterm (z. B. b · (a + b)) und Summenterm (z. B. ab + b²) sind beide richtig.',
          sol: ask === 'u' ? `u = ${T(P.str(p))}` : `A = ${s.prod} = ${T(P.str(p))}` };
      }
      // L-Figur wie S. 57 B (Figur 1): oben (a + k·b) breit und a hoch, rechts unten ein Teil k·b breit und a hoch
      const k = pick([1, 2]);
      const W = polyOf([[1, 'a'], [k, 'b']]), Hh = P.v('a', 2), bk = P.v('b', k);
      const rects = [{ x: 0, y: 0, w: 3 + 2 * k, h: 3 }, { x: 3, y: 3, w: 2 * k, h: 3 }];
      const svg = figSvg(rects, [{ x: (3 + 2 * k) / 2, y: -0.3, t: P.str(W) }, { x: -0.3, y: 1.7, t: 'a', a: 'end' }, { x: 3 + 2 * k + 0.25, y: 3.2, t: '2a', a: 'start' }, { x: 3 + k, y: 6.8, t: P.str(bk) }]);
      const A = P.add(P.mul(P.v('a'), W), P.mul(P.v('a'), bk)), u = P.add(P.scale(W, 2), P.scale(Hh, 2));
      const p = ask === 'u' ? u : A;
      return { q: svg + `Notiere den ${what} der Figur als <b>Summenterm</b> (ohne Klammern, zusammengefasst).`, kind: 'term', answer: P.str(p), form: 'sum', n: P.count(p),
        hint: ask === 'u' ? hintU + ' Tipp: Die waagrechten Stücke unten ergeben zusammen gleich viel wie die obere Seite, die senkrechten links zusammen gleich viel wie rechts (2a).' : hintA + ` Oben: a · (${P.str(W)}), unten: a · ${P.str(bk)}.`,
        sol: ask === 'u' ? `u = 2 · (${P.str(W)}) + 2 · 2a = ${T(P.str(p))}` : `A = a · (${P.str(W)}) + a · ${P.str(bk)} = ${T(P.str(p))}` };
    }
  },
  {
    id: 'wuerfel', lu: 10, name: 'Würfel-Arena', topic: 'Werte einsetzen', lz: 'LZ2', color: 'YELLOW',
    goal: 'Für Variablen Zahlen einsetzen und den Wert des Terms berechnen',
    ref: 'mathbuch 1, S. 58 A5 A, B «Terme würfeln» · Prüfung A3',
    gen(stage) {
      const hint = 'Ersetze jede Variable durch ihre Zahl (3a heisst 3 · a). Rechne dann: Klammern zuerst, dann Hochzahlen, dann Punkt vor Strich.';
      if (stage === 1) {
        const k = ri(2, 9), m = ri(1, 9), a = ri(1, 12), b = ri(1, 12), op = pick(['+', '−']);
        const res = op === '+' ? k * a + m * b : k * a - m * b;
        return { q: `Berechne den Wert des Terms für a = ${a} und b = ${b}.<div class="eq">${k}a ${op} ${m}b</div>`, kind: 'num', answer: res, hint,
          sol: `${k} · ${a} ${op} ${m} · ${b} = ${k * a} ${op} ${m * b} = ${fmt(res)}` };
      }
      const cards = [
        { t: 'a · b', f: (a, b) => a * b, s: (a, b) => `${a} · ${b}` },
        { t: '10(a − b)', f: (a, b) => 10 * (a - b), s: (a, b) => `10 · (${a} − ${b})` },
        { t: '(2a − b)²', f: (a, b) => (2 * a - b) ** 2, s: (a, b) => `(2 · ${a} − ${b})² = ${fmt(2 * a - b)}²` },
        { t: '2a² − 3b', f: (a, b) => 2 * a * a - 3 * b, s: (a, b) => `2 · ${a}² − 3 · ${b} = ${2 * a * a} − ${3 * b}` },
        { t: '(a + b)²', f: (a, b) => (a + b) ** 2, s: (a, b) => `(${a} + ${b})² = ${a + b}²` },
        { t: '24a : (b + 1)', f: (a, b) => 24 * a / (b + 1), s: (a, b) => `24 · ${a} : (${b} + 1) = ${24 * a} : ${b + 1}` },
        { t: 'a² + b²', f: (a, b) => a * a + b * b, s: (a, b) => `${a}² + ${b}² = ${a * a} + ${b * b}` },
        { t: '3(a + 2b)', f: (a, b) => 3 * (a + 2 * b), s: (a, b) => `3 · (${a} + 2 · ${b})` },
      ];
      if (stage === 2) {
        const c = pick(cards); let a, b;
        do { a = ri(1, 12); b = ri(1, 12); } while (!Number.isInteger(c.f(a, b)));
        return { q: `Termkarte «Terme würfeln»: Gewürfelt wurde a = ${a} und b = ${b}.<div class="eq">${c.t}</div>Welchen Wert hat der Term?`, kind: 'num', answer: c.f(a, b), hint,
          sol: `${c.s(a, b)} = ${fmt(c.f(a, b))}` };
      }
      if (Math.random() < 0.5) {
        const a = 8, b = 12, opts = shuffle(cards.slice(0, 7)).slice(0, 4);
        const vals = opts.map(c => c.f(a, b)), best = vals.indexOf(Math.max(...vals));
        return { q: `Gewürfelt werden a = ${a} und b = ${b}. Mit welcher Termkarte erreicht man das grösste Resultat?`, kind: 'mc', options: opts.map(c => c.t), answer: best,
          hint: 'Berechne jede Karte. Quadrate wachsen schnell!', sol: opts.map((c, i) => `${c.t} = ${fmt(vals[i])}`).join(' · ') };
      }
      const [c1, c2] = shuffle(cards).slice(0, 2); let a, b;
      do { a = ri(2, 10); b = ri(1, 10); } while (!Number.isInteger(c1.f(a, b)) || !Number.isInteger(c2.f(b, a)));
      const v1 = c1.f(a, b), v2 = c2.f(b, a), d = Math.abs(v1 - v2);
      return { q: `Spielrunde: Blau wählt ${T(c1.t)} mit a = ${a}, b = ${b}. Orange wählt ${T(c2.t)} mit a = ${b}, b = ${a}.<br>Wie gross ist die Differenz der beiden Werte?`, kind: 'num', answer: d, hint: hint + ' Differenz = grösserer Wert − kleinerer Wert.',
        sol: `Blau: ${c1.s(a, b)} = ${fmt(v1)}, Orange: ${c2.s(b, a)} = ${fmt(v2)}. Differenz: ${fmt(d)}` };
    }
  },
  {
    id: 'pruef', lu: 10, name: 'Prüf-Labor', topic: 'Gleichwertige Terme, Fehler finden', lz: 'LZ4', color: 'CYAN',
    goal: 'Termumformungen durch Einsetzen von Zahlen überprüfen und Fehler finden',
    ref: 'mathbuch 1, S. 57 A4 A · S. 59 A6 · Prüfung A4, A5',
    gen(stage) {
      if (stage === 1) {
        const f = pick([['4(a + b)', '4a + 4b', (a, b) => 4 * (a + b)], ['a(a + 2b)', 'a² + 2ab', (a, b) => a * (a + 2 * b)], ['2(2a + 2b)', '4a + 4b', (a, b) => 2 * (2 * a + 2 * b)], ['b(2a + b)', '2ab + b²', (a, b) => b * (2 * a + b)]]);
        const a = ri(2, 6), b = ri(1, 5), v = f[2](a, b);
        return { q: `Ist ${T(f[0])} gleichwertig zu ${T(f[1])}? Kontrolliere mit a = ${a} und b = ${b}.<br>Berechne beide Terme.`, kind: 'multi',
          parts: [{ kind: 'num', label: f[0] + ' =', answer: v }, { kind: 'num', label: f[1] + ' =', answer: v }],
          hint: 'Setze die Zahlen in jeden Term ein und rechne aus. Gleichwertige Terme ergeben für alle Zahlen denselben Wert.', sol: `Beide ergeben ${fmt(v)}. Die Terme sind gleichwertig.` };
      }
      if (stage === 2) {
        const base = pick([
          { t: 'a(a + 2b)', ok: 'a² + 2ab', bad: ['a² + 2b', '2a + 2ab', 'a² + ab'] },
          { t: '4(a + b)', ok: '4a + 4b', bad: ['4a + b', '4ab', '8ab'] },
          { t: '2(2a + 2b)', ok: '4a + 4b', bad: ['4a + 2b', '2a + 4b', '8ab'] },
          { t: 'b(2a + b)', ok: '2ab + b²', bad: ['2ab + b', '2a + b²', '3ab'] },
          { t: 'b + b + a + a + 2b + 2a', ok: '4a + 4b', bad: ['4ab', '6ab', '2a + 2b'] },
          { t: 'ab + ab + a · a', ok: 'a² + 2ab', bad: ['3ab', '2a²b', 'a + 2ab'] },
        ]);
        const opts = shuffle([base.ok, ...base.bad]);
        return { q: `Welcher Term ist <b>gleichwertig</b> zu ${T(base.t)}?`, kind: 'mc', options: opts, answer: opts.indexOf(base.ok),
          hint: 'Gleichwertige Terme ergeben für alle Zahlen denselben Wert. Setze z. B. a = 2 und b = 3 ein und vergleiche.', sol: `${base.t} = ${T(base.ok)}` };
      }
      if (Math.random() < 0.3) {   // Magisches Quadrat S. 59
        const m = ri(8, 15), x = ri(1, 3), y = ri(x + 1, 6);
        const sq = [[m + x, m - x - y, m + y], [m - x + y, m, m + x - y], [m - y, m + x + y, m - x]];
        const hide = pick([0, 1, 2, 3, 5, 6, 7, 8]), r = Math.floor(hide / 3), c = hide % 3;
        const cells = sq.map((row, i) => `<tr>${row.map((v, j) => `<td${i === 1 && j === 1 ? ' class="mid"' : ''}>${i === r && j === c ? '?' : v}</td>`).join('')}</tr>`).join('');
        return { q: `Ein magisches Quadrat: Jede Zeile, jede Spalte und beide Diagonalen haben dieselbe Summe.<table class="magic">${cells}</table>Welche Zahl gehört ins Feld mit «?»`, kind: 'num', answer: sq[r][c],
          hint: `Die magische Summe ist 3 · Mittelzahl = 3 · ${m} = ${3 * m}.`, sol: `Magische Summe ${3 * m}. Die fehlende Zahl ist ${sq[r][c]}.` };
      }
      const whyList = ['Die Zahl in der Klammer wurde nicht mitmultipliziert.', 'Beim Minus vor der Klammer wurde ein Vorzeichen nicht umgekehrt.', 'Verschiedene Variablen dürfen nicht zusammengefasst werden.', 'a · a ist a², und auch die Zahl muss mit a multipliziert werden.'];
      const e = pick([
        () => { const k = ri(3, 7), a = ri(2, 6), c = ri(2, 9); return { t: `${k} · (${a}x − ${c})`, wrong: `${k * a}x − ${c}`, right: `${k * a}x − ${k * c}`, why: 0 }; },
        () => { const a = ri(4, 9), b = ri(2, a - 1), c = ri(1, 8); return { t: `${a}x − (${b}x + ${c})`, wrong: `${a - b}x + ${c}`, right: `${a - b}x − ${c}`, why: 1 }; },
        () => { const a = ri(2, 6), b = ri(2, 6); return { t: `${a}a + ${b}b`, wrong: `${a + b}ab`, right: `${a}a + ${b}b`, why: 2 }; },
        () => { const k = ri(2, 5); return { t: `a · (${k}a + 3)`, wrong: `${k + 1}a + 3`, right: `${k}a² + 3a`, why: 3 }; },
      ])();
      const opts = shuffle(whyList);
      return { q: `Jemand hat umgeformt:<div class="eq">${e.t} = ${e.wrong}</div>Finde den Fehler und notiere das richtige Resultat.`, kind: 'multi',
        parts: [{ kind: 'mc', label: 'Was wurde falsch gemacht?', options: opts, answer: opts.indexOf(whyList[e.why]) }, { kind: 'term', label: 'Richtiges Resultat', answer: e.right, form: 'sum', n: nTerms(e.right) }],
        hint: 'Kontrolliere durch Einsetzen: Setze z. B. x = 1 (oder a = 1, b = 1) links und rechts ein. Kommen verschiedene Werte heraus, ist die Umformung falsch.', sol: `${whyList[e.why]} Richtig: ${e.t} = ${T(e.right)}` };
    }
  },
  // ===== Thema K: Daten und Diagramme (intern lu: 11) =====
  {
    id: 'mittel', lu: 11, name: 'Papierkugel-Stadion', topic: 'Mittelwert, Median, Minimum, Maximum', lz: 'LZ5', color: 'LIME',
    goal: 'Daten auswerten: Minimum, Maximum, Mittelwert und Median bestimmen',
    ref: 'mathbuch 1, S. 60 A1 (Papierkugeln)',
    gen(stage) {
      const ball = pick(['grossen', 'kleinen']);
      if (stage === 1) {
        const n = 5, mean = ri(28, 42) * 10;
        let vals; do { vals = Array.from({ length: n - 1 }, () => mean + ri(-80, 80)); vals.push(mean * n - sum(vals)); } while (vals[n - 1] < 150 || vals[n - 1] > 520 || new Set(vals).size < n);
        const t = pick(['mean', 'max', 'span']);
        const ans = t === 'mean' ? mean : t === 'max' ? Math.max(...vals) : Math.max(...vals) - Math.min(...vals);
        return { q: `Flugweiten der ${ball} Papierkugel in cm: ${vals.join(', ')}.<br>${t === 'mean' ? 'Berechne den <b>Mittelwert</b>.' : t === 'max' ? 'Wie gross ist die <b>maximale</b> Flugweite?' : 'Wie gross ist der Unterschied zwischen der grössten und der kleinsten Flugweite?'}`, kind: 'num', answer: ans, unit: 'cm',
          hint: t === 'mean' ? 'Mittelwert = Summe aller Werte : Anzahl Werte.' : 'Suche den grössten (und den kleinsten) Wert.', sol: t === 'mean' ? `(${vals.join(' + ')}) : ${n} = ${sum(vals)} : ${n} = ${mean} cm` : t === 'max' ? `Maximum: ${ans} cm` : `${Math.max(...vals)} − ${Math.min(...vals)} = ${ans} cm` };
      }
      if (stage === 2) {
        const n = pick([5, 6, 7]); let vals; do { vals = Array.from({ length: n }, () => ri(20, 50) * 10 + pick([0, 0, 5])); } while (new Set(vals).size < n);
        const s = vals.slice().sort((a, b) => a - b), med = n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2;
        return { q: `Flugweiten in cm: ${vals.join(', ')}.<br>Bestimme den <b>Median</b>.`, kind: 'num', answer: med, unit: 'cm',
          hint: 'Sortiere die Werte der Grösse nach. Bei ungerader Anzahl ist der Median die mittlere Zahl, bei gerader Anzahl der Mittelwert der beiden mittleren Zahlen.', sol: `Sortiert: ${s.join(', ')}. Median: ${fmt(med)} cm` };
      }
      if (Math.random() < 0.5) {
        const mean = ri(30, 40) * 10, vals = Array.from({ length: 4 }, () => mean + ri(-60, 60)), last = mean * 5 - sum(vals);
        return { q: `Bei fünf Würfen beträgt der Mittelwert ${mean} cm. Vier Würfe waren ${vals.join(' cm, ')} cm.<br>Wie weit flog der fünfte Wurf?`, kind: 'num', answer: last, unit: 'cm',
          hint: `Die Summe aller fünf Würfe ist 5 · ${mean}. Ziehe die vier bekannten Würfe ab.`, sol: `5 · ${mean} = ${5 * mean}, ${5 * mean} − ${sum(vals)} = ${last} cm` };
      }
      const base = ri(28, 36) * 10, vals = [base - 40, base - 20, base, base + 20, base + ri(25, 40) * 10];
      const mean = sum(vals) / 5;
      const opts = shuffle([`Der Median (${base} cm) beschreibt die typische Flugweite besser als der Mittelwert (${fmt(mean)} cm).`, `Der Mittelwert (${fmt(mean)} cm) beschreibt die typische Flugweite besser, weil er alle Werte benutzt.`, 'Mittelwert und Median sind hier gleich gross.', 'Der Ausreisser verändert den Median stark.']);
      return { q: `Flugweiten in cm: ${shuffle(vals).join(', ')}.<br>Ein Wurf ist ein Ausreisser. Welche Aussage stimmt?`, kind: 'mc', options: opts, answer: opts.findIndex(o => o.startsWith('Der Median')),
        hint: 'Berechne beide. Ein einzelner sehr grosser Wert zieht den Mittelwert nach oben, den Median aber kaum.', sol: `Median ${base} cm, Mittelwert ${fmt(mean)} cm. Der Ausreisser verzerrt den Mittelwert, darum ist hier der Median aussagekräftiger.` };
    }
  },
  {
    id: 'klassen', lu: 11, name: 'Sortier-Lager', topic: 'Daten ordnen und Diagramme erstellen', lz: 'LZ6', color: 'PURPLE',
    goal: 'Daten mit Strichliste und Häufigkeitstabelle ordnen und ein passendes Diagramm erstellen',
    ref: 'mathbuch 1, S. 61 A2 · S. 63 A4 B · Prüfung A7',
    gen(stage) {
      const KL = ['s < 2', '2 ≤ s < 2.5', '2.5 ≤ s < 3', '3 ≤ s < 3.5', '3.5 ≤ s < 4', '4 ≤ s'];
      const klasse = (v) => v < 2 ? 0 : v < 2.5 ? 1 : v < 3 ? 2 : v < 3.5 ? 3 : v < 4 ? 4 : 5;
      if (stage === 1) {
        const vals = Array.from({ length: ri(10, 14) }, () => Math.round((1.6 + Math.random() * 2.8) * 10) / 10);
        const k = ri(1, 4), n = vals.filter(v => klasse(v) === k).length;
        return { q: `Flugweiten in Metern: ${vals.map(v => fmt(v)).join(' · ')}<br>Wie viele Würfe gehören in die Klasse <b>${KL[k]}</b>?`, kind: 'num', answer: n,
          hint: 'Mache eine Strichliste: Gehe die Werte der Reihe nach durch. Achtung: Der linke Rand gehört zur Klasse (≤), der rechte nicht (<).', sol: `In der Klasse ${KL[k]}: ${vals.filter(v => klasse(v) === k).map(v => fmt(v)).join(', ') || 'keine'} → ${n}` };
      }
      if (stage === 2) {
        const labels = shuffle(['Fussball', 'Handball', 'Unihockey', 'Volley', 'Tanzen']).slice(0, 4);
        const vals = labels.map(() => ri(1, 9));
        while (vals[0] === vals[1]) vals[1] = ri(1, 9);
        const wrong1 = vals.slice(); [wrong1[0], wrong1[1]] = [wrong1[1], wrong1[0]];
        const wrong2 = vals.slice(); wrong2[2] = vals[2] < 9 ? vals[2] + 1 : vals[2] - 2;
        const order = shuffle([vals, wrong1, wrong2]);
        const imgs = order.map((v, i) => `<div class="chartbox"><b>Diagramm ${'ABC'[i]}</b>${barImg(labels, v, { w: 300, h: 200, max: 10, step: 1 })}</div>`).join('');
        return { q: table(['Lieblingssport', ...labels], [['Anzahl', ...vals]]) + `<div class="charts">${imgs}</div>Welches Säulendiagramm passt zur Tabelle?`, kind: 'mc', options: ['Diagramm A', 'Diagramm B', 'Diagramm C'], answer: order.indexOf(vals),
          hint: 'Vergleiche jede Säule mit der Tabelle. Lies an der y-Achse ab.', sol: `Richtig ist Diagramm ${'ABC'[order.indexOf(vals)]}.` };
      }
      if (Math.random() < 0.55) {
        const [tot, p, q] = pick([[20, 1, 4], [40, 1, 5], [30, 1, 3], [24, 1, 6], [40, 1, 10], [40, 3, 10], [20, 2, 5], [36, 1, 2], [60, 1, 4], [36, 1, 3]]);
        const n = tot * p / q, ang = 360 * p / q, col = pick(['orangen', 'grünen', 'blauen', 'roten']);
        return { q: `In einer Box hat es ${tot} Schokolinsen, ${n} davon sind ${col.replace(/n$/, '')}. Du zeichnest ein Kreisdiagramm.<br>Wie gross ist der Winkel des Kreisteils für die ${col} Linsen?`, kind: 'num', answer: ang, unit: '°',
          hint: 'Der ganze Kreis (360°) sind alle Linsen. Anteil = Teil : Ganzes, Winkel = Anteil · 360°.', sol: `${n} : ${tot} = ${fmt(n / tot)}, ${fmt(n / tot)} · 360° = ${fmt(ang)}°` };
      }
      const d = pick([
        { s: 'Die Monatstemperaturen von Balsthal über ein ganzes Jahr', ok: 'Liniendiagramm' },
        { s: 'Wie sich die Klasse auf die Lieblingsfächer verteilt (Anteile am Ganzen)', ok: 'Kreisdiagramm' },
        { s: 'Die Anzahl Schokolinsen pro Farbe in einer Box', ok: 'Säulendiagramm' },
        { s: 'Die Entwicklung deiner Körpergrösse seit der Geburt', ok: 'Liniendiagramm' },
        { s: 'Welcher Anteil des Taschengelds wofür ausgegeben wird', ok: 'Kreisdiagramm' },
      ]);
      const opts = ['Säulendiagramm', 'Kreisdiagramm', 'Liniendiagramm'];
      return { q: `Welches Diagramm eignet sich am besten für folgende Daten?<div class="quote">${d.s}</div>`, kind: 'mc', options: opts, answer: opts.indexOf(d.ok),
        hint: 'Liniendiagramm: Entwicklung über die Zeit. Kreisdiagramm: Anteile an einem Ganzen. Säulen- oder Balkendiagramm: Anzahlen vergleichen.', sol: `Am besten passt ein ${d.ok}.` };
    }
  },
  {
    id: 'linsen', lu: 11, name: 'Schokolinsen-Markt', topic: 'Absolute und relative Häufigkeit', lz: 'LZ7', color: 'RED',
    goal: 'Absolute und relative Häufigkeiten (Bruch, Dezimalzahl, Prozent) unterscheiden und berechnen',
    ref: 'mathbuch 1, S. 62 A3 · Prüfung A8',
    gen(stage) {
      const col = pick(['orange', 'blau', 'grün', 'rot', 'gelb']);
      if (stage === 1) {
        const [tot, p] = pick([[20, 10], [20, 25], [20, 40], [25, 20], [25, 40], [40, 10], [40, 20], [40, 25], [50, 10], [50, 20], [50, 40]]);
        const n = tot * p / 100;
        return { q: `In einer Box hat es ${tot} Schokolinsen. ${n} davon sind ${col}.<br>Wie gross ist die <b>relative Häufigkeit</b> der Farbe ${col} in Prozent?`, kind: 'num', answer: p, unit: '%',
          hint: 'Relative Häufigkeit = Anzahl : Gesamtzahl. Als Prozent: mal 100.', sol: `${n} von ${tot} = ${n}/${tot} = ${fmt(n / tot)} = ${p} %` };
      }
      if (stage === 2) {
        if (Math.random() < 0.5) {
          let A, B; do { A = [ri(3, 9), pick([16, 20, 24, 25, 30, 40])]; B = [ri(3, 12), pick([20, 25, 32, 36, 40, 48])]; } while (A[0] / A[1] === B[0] / B[1]);
          const bigger = A[0] / A[1] > B[0] / B[1] ? 0 : 1;
          return { q: table(['', 'orange Linsen', 'Linsen total'], [['Gruppe A', A[0], A[1]], ['Gruppe B', B[0], B[1]]]) + 'In welcher Gruppe ist der <b>Anteil</b> der orangen Linsen grösser?', kind: 'mc', options: ['Gruppe A', 'Gruppe B', 'Beide gleich'], answer: bigger,
            hint: 'Nicht die Anzahl vergleichen, sondern den Anteil: orange : total für beide Gruppen.', sol: `A: ${A[0]} : ${A[1]} = ${pct(A[0] / A[1] * 100)}, B: ${B[0]} : ${B[1]} = ${pct(B[0] / B[1] * 100)}. Grösser in Gruppe ${'AB'[bigger]}.` };
        }
        const k = pick([[1, 4], [1, 5], [3, 4], [2, 5], [1, 8], [3, 8], [1, 20], [7, 10]]);
        return { q: `Ein Anteil von ${k[0]}/${k[1]} der Linsen ist ${col}. Wie viel Prozent sind das?`, kind: 'num', answer: k[0] / k[1] * 100, unit: '%',
          hint: 'Bruch → Dezimalzahl (Zähler : Nenner) → mal 100.', sol: `${k[0]} : ${k[1]} = ${fmt(k[0] / k[1])} = ${fmt(k[0] / k[1] * 100)} %` };
      }
      if (Math.random() < 0.5) {
        const t1 = pick([40, 50, 60]), p1 = pick([10, 20, 30]), t2 = pick([40, 50, 60]), p2 = pick([10, 20, 40]);
        const n1 = t1 * p1 / 100, n2 = t2 * p2 / 100, p = (n1 + n2) / (t1 + t2) * 100;
        return { q: `Box 1: ${t1} Linsen, davon ${p1} % ${col}. Box 2: ${t2} Linsen, davon ${p2} % ${col}.<br>Du schüttest beide Boxen zusammen. Wie viel Prozent der Linsen sind jetzt ${col}? (auf 1 Dezimale runden)`, kind: 'num', answer: Math.round(p * 10) / 10, tol: 0.15, unit: '%',
          hint: 'Prozente darf man nicht einfach addieren oder mitteln. Berechne zuerst die Anzahlen (absolut), dann den neuen Anteil.', sol: `${n1} + ${n2} = ${n1 + n2} von ${t1 + t2} Linsen = ${pct(p)}` };
      }
      const v = pick([[[4, 16], [5, 20], 'ein Instrument'], [[6, 24], [8, 25], 'ein Instrument'], [[9, 18], [12, 30], 'ein Haustier'], [[3, 15], [5, 20], 'ein Velo']]);
      const a = v[0][0] / v[0][1], b = v[1][0] / v[1][1];
      const opts = ['Klasse 1A', 'Parallelklasse', 'Beide gleich'], ans = a > b ? 0 : a < b ? 1 : 2;
      return { q: `In der Klasse 1A (${v[0][1]} Kinder) haben ${v[0][0]} ${v[2]}. In der Parallelklasse (${v[1][1]} Kinder) sind es ${v[1][0]}.<br>Wo ist der Anteil (relativ) grösser?`, kind: 'mc', options: opts, answer: ans,
        hint: 'Anteil = Anzahl : Klassengrösse. Rechne beide in Prozent um.', sol: `1A: ${pct(a * 100)}, Parallelklasse: ${pct(b * 100)}. ${ans === 2 ? 'Die Anteile sind gleich gross.' : `Grösser in der ${opts[ans]}.`}` };
    }
  },
  {
    id: 'diagramm', lu: 11, name: 'Diagramm-Galerie', topic: 'Säulen- und Kreisdiagramme lesen', lz: 'LZ5', color: 'MAGENTA',
    goal: 'Werte aus Säulen-, Balken- und Kreisdiagrammen herauslesen und Aussagen prüfen',
    ref: 'mathbuch 1, S. 63 A4 A · Prüfung A6',
    gen(stage) {
      const cols = ['Orange', 'Grün', 'Gelb', 'Rot', 'Braun', 'Violett', 'Blau', 'Pink'];
      let vals; do { vals = cols.map(() => ri(2, 10)); } while (stage === 3 && ![20, 40, 50].includes(sum(vals)));
      const img = barImg(cols, vals, { title: 'Absolute Häufigkeiten in einer Box Schokolinsen', max: 10, step: 1 });
      if (stage === 1) {
        if (Math.random() < 0.5) {
          const i = ri(0, 7);
          return { q: img + `Wie viele <b>${ADJ[cols[i]]}</b> Schokolinsen hat es in der Box?`, kind: 'num', answer: vals[i], hint: 'Gehe von der Säule waagrecht zur y-Achse und lies die Zahl ab.', sol: `${cols[i]}: ${vals[i]}` };
        }
        const apps = shuffle(['ChatApp', 'FotoApp', 'VideoApp', 'GameApp', 'MusikApp']);
        let n; do { n = apps.map(() => ri(3, 18) * 5); } while (new Set(n).size < 5);
        const s = n.slice().sort((a, b) => b - a), first = n.indexOf(s[0]), second = n.indexOf(s[1]);
        return { q: barImg(apps, n, { title: 'Meistgenutzte Apps an der Schule', max: Math.ceil(s[0] / 10) * 10, step: 10, yLabel: 'Anzahl Personen' }) + 'Welche App wird am <b>zweithäufigsten</b> genutzt?', kind: 'mc', options: apps, answer: second,
          hint: 'Suche die höchste Säule und dann die zweithöchste.', sol: `${apps[first]} (${s[0]}) ist am häufigsten, ${apps[second]} (${s[1]}) am zweithäufigsten. Unterschied: ${s[0] - s[1]} Personen.` };
      }
      const total = sum(vals);
      if (stage === 2) {
        const t = pick(['mehr', 'gleich', 'total', 'fuenftel']);
        let claim, truth, sol;
        if (t === 'mehr') { const [i, j] = shuffle([0, 1, 2, 3, 4, 5, 6, 7]); claim = `In der Box hat es mehr ${ADJ[cols[i]]} als ${ADJ[cols[j]]} Schokolinsen.`; truth = vals[i] > vals[j]; sol = `${cols[i]}: ${vals[i]}, ${cols[j]}: ${vals[j]}.`; }
        else if (t === 'gleich') { const s3 = vals[3] + vals[2] + vals[1]; claim = 'Rote, gelbe und grüne Schokolinsen sind zusammen gleich viele wie braune.'; truth = s3 === vals[4]; sol = `Rot + Gelb + Grün = ${vals[3]} + ${vals[2]} + ${vals[1]} = ${s3}, Braun = ${vals[4]}.`; }
        else if (t === 'total') { const c = total + pick([-1, 0, 1]); claim = `Insgesamt hat es ${c} Schokolinsen in der Box.`; truth = c === total; sol = `Summe aller Säulen: ${total}.`; }
        else { claim = 'Mehr als ein Fünftel der Linsen ist orange.'; truth = vals[0] / total > 0.2; sol = `${vals[0]} von ${total} = ${pct(vals[0] / total * 100)}; ein Fünftel = 20 %.`; }
        return { q: img + `<div class="quote">${claim}</div>Wahr oder falsch?`, kind: 'mc', options: ['wahr', 'falsch'], answer: truth ? 0 : 1, hint: 'Lies die nötigen Säulen genau ab und rechne nach.', sol: `${sol} Die Aussage ist ${truth ? 'wahr' : 'falsch'}.` };
      }
      if (Math.random() < 0.5) {
        const i = ri(0, 7);
        return { q: pieImg(cols, vals, { title: 'Relative Häufigkeiten in einer Box Schokolinsen' }) + `In der Box hat es insgesamt ${total} Linsen. Wie viele davon sind <b>${cols[i].toLowerCase()}</b>?`, kind: 'num', answer: vals[i],
          hint: 'Lies den Prozentwert im Kreisdiagramm ab und berechne diesen Anteil von der Gesamtzahl.', sol: `${pct(vals[i] / total * 100)} von ${total} = ${vals[i]}` };
      }
      const st = pick([
        { s: 'Ein Fünftel der Linsen ist orange.', ok: 'Kreisdiagramm', w: 'Anteile am Ganzen sieht man im Kreisdiagramm direkt.' },
        { s: 'Es hat 3 rote Linsen mehr als violette.', ok: 'Säulendiagramm', w: 'Anzahlen und Unterschiede liest man im Säulendiagramm ab.' },
        { s: 'Insgesamt hat es 40 Linsen in der Box.', ok: 'Säulendiagramm', w: 'Das Kreisdiagramm zeigt nur Prozente, keine Anzahlen.' },
        { s: 'Braun macht ein Viertel aller Linsen aus.', ok: 'Kreisdiagramm', w: 'Ein Viertel ist ein Anteil: Das zeigt das Kreisdiagramm.' },
      ]);
      const opts = ['Säulendiagramm', 'Kreisdiagramm'];
      return { q: `<div class="quote">${st.s}</div>Mit welchem Diagramm lässt sich diese Aussage besser prüfen?`, kind: 'mc', options: opts, answer: opts.indexOf(st.ok), hint: 'Säulendiagramm: absolute Häufigkeiten (Anzahlen). Kreisdiagramm: relative Häufigkeiten (Anteile).', sol: `${st.ok}: ${st.w}` };
    }
  },
  {
    id: 'screen', lu: 11, name: 'Bildschirmzeit-Studio', topic: 'Diagramme vergleichen (Bildschirmzeit)', lz: 'LZ5 · LZ8', color: 'SKY',
    goal: 'Diagramme analysieren und vergleichen, Aussagen über Bildschirmzeit prüfen',
    ref: 'mathbuch 1, S. 64 A5 B, C',
    gen(stage) {
      const hm = (m) => `${Math.floor(m / 60)} h ${m % 60} min`;
      const cat = ['Unterhaltung', 'Spiele', 'Soziale Netze'], c3 = ['#d6456b', '#3b82c4', '#f2a33a'];
      const day = () => [ri(20, 95), ri(30, 90), ri(25, 215)];
      if (stage === 1) {
        const d = day(), tot = sum(d);
        return { q: barImg(cat, d, { title: 'Bildschirmzeit von Andrej an einem Tag', max: Math.ceil(Math.max(...d) / 30) * 30, step: 30, yLabel: 'Minuten', colors: c3, values: true }) + `${cat.map((c, i) => `${c}: ${hm(d[i])}`).join(' · ')}<br>Wie viele <b>Minuten</b> war Andrej insgesamt am Bildschirm?`, kind: 'num', answer: tot, unit: 'min',
          hint: '1 h = 60 min. Rechne alles in Minuten um und addiere.', sol: `${d.join(' + ')} = ${tot} min = ${hm(tot)}` };
      }
      if (stage === 2) {
        const d1 = day(), d2 = day(), k = ri(0, 2);
        const imgs = `<div class="charts"><div class="chartbox">${barImg(cat, d1, { title: 'Tag 1', w: 300, h: 210, max: 240, step: 60, colors: c3, values: true })}</div><div class="chartbox">${barImg(cat, d2, { title: 'Tag 2', w: 300, h: 210, max: 240, step: 60, colors: c3, values: true })}</div></div>`;
        return { q: imgs + `Um wie viele Minuten unterscheidet sich die Zeit für <b>${cat[k]}</b> an den beiden Tagen?`, kind: 'num', answer: Math.abs(d1[k] - d2[k]), unit: 'min',
          hint: 'Lies beide Werte ab und subtrahiere den kleineren vom grösseren.', sol: `Tag 1: ${d1[k]} min, Tag 2: ${d2[k]} min, Unterschied ${Math.abs(d1[k] - d2[k])} min` };
      }
      const days = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'], v = days.map(() => ri(2, 8) * 30);
      const mean = sum(v) / 7, we = v[5] + v[6], wd = (sum(v) - we) / 5;
      const st = pick([
        () => { const [i, j] = shuffle([0, 1, 2, 3, 4, 5, 6]); return [`Am ${days[i]} war die Bildschirmzeit mehr als doppelt so lang wie am ${days[j]}.`, v[i] > 2 * v[j], `${days[i]}: ${v[i]} min, ${days[j]}: ${v[j]} min.`]; },
        () => ['Im Durchschnitt war Andrej mehr als 2 Stunden pro Tag am Bildschirm.', mean > 120, `Mittelwert: ${sum(v)} : 7 ≈ ${fmt(Math.round(mean))} min.`],
        () => ['Am Wochenende (Sa, So) war die Bildschirmzeit pro Tag im Mittel höher als unter der Woche.', we / 2 > wd, `Wochenende: ${fmt(we / 2)} min pro Tag, Mo–Fr: ${fmt(Math.round(wd))} min pro Tag.`],
        () => { const j = ri(0, 6), mx = v.indexOf(Math.max(...v)); return [`Am ${days[j]} war die Bildschirmzeit am längsten.`, v[j] === v[mx], `Am längsten: ${days[mx]} mit ${v[mx]} min.`]; },
      ])();
      return { q: lineImg(days, [{ name: 'Bildschirmzeit', v }], { title: 'Bildschirmzeit in einer Woche', yLabel: 'Minuten', step: 30, min: 0, max: 240 }) + `<div class="quote">${st[0]}</div>Wahr oder falsch?`, kind: 'mc', options: ['wahr', 'falsch'], answer: st[1] ? 0 : 1,
        hint: 'Lies die Punkte genau ab: Von einer Rasterlinie zur nächsten sind es 30 min. Rechne nach, bevor du entscheidest.', sol: `Werte: ${days.map((d, i) => `${d} ${v[i]}`).join(', ')}. ${st[2]} Die Aussage ist ${st[1] ? 'wahr' : 'falsch'}.` };
    }
  },
  {
    id: 'fakten', lu: 11, name: 'Faktencheck-Redaktion', topic: 'Aussagen prüfen, irreführende Diagramme', lz: 'LZ8', color: 'WHITE',
    goal: 'Aussagen zu Diagrammen prüfen und kritische Fragen stellen (z. B. abgeschnittene Achsen)',
    ref: 'mathbuch 1, S. 65 A6 · Zusatz-AB irreführende Diagramme · Prüfung A9, A10',
    gen(stage) {
      if (stage === 1) {
        const items = ['Essen', 'Kleider', 'Ausgang', 'Sparen', 'Spiele'];
        const e = pick([38, 42, 45, 48, 50, 52, 55, 60]), rest = 100 - e, a = ri(10, rest - 25), b = ri(5, rest - a - 12), c = ri(3, rest - a - b - 3), d = rest - a - b - c;
        const vals = [e, a, b, c, d];
        const claim = pick([['Mehr als die Hälfte der Jugendlichen gibt ihr Taschengeld für Essen aus.', e > 50], ['Höchstens die Hälfte des Taschengelds geht für Essen weg.', e <= 50]]);
        return { q: pieImg(items, vals, { title: 'Wofür Jugendliche ihr Taschengeld ausgeben' }) + `<div class="quote">${claim[0]}</div>Stimmt die Aussage der Zeitung?`, kind: 'mc', options: ['Die Aussage stimmt.', 'Die Aussage stimmt nicht.'], answer: claim[1] ? 0 : 1,
          hint: '«Die Hälfte» sind genau 50 %. «Mehr als die Hälfte» heisst über 50 %.', sol: `Für Essen: ${e} %. ${claim[1] ? 'Die Aussage stimmt.' : 'Die Aussage stimmt nicht.'}` };
      }
      if (stage === 2) {
        const A = ri(50, 60), B = A - ri(2, 6), start = Math.floor(B / 5) * 5 - 5;
        const img = barImg(['Partei A', 'Partei B'], [A, B], { title: 'Umfrage: Stimmen in %', start, max: Math.ceil(A / 5) * 5 + 5, step: 5, w: 340, h: 260, colors: ['#e4572e', '#2f6fd6'], values: true });
        const r = (A - start) / (B - start);
        const good = `Nein: A hat ${A} %, B hat ${B} %. Die y-Achse beginnt nicht bei 0, darum wirkt der Unterschied grösser.`;
        const opts = shuffle(['Ja, die Säule A ist ja viel höher.', good, 'Das kann man nicht ablesen.', 'Nein, B hat mehr Stimmen als A.']);
        return { q: img + `<div class="quote">Partei A hat ${fmt(Math.round(r * 10) / 10)}-mal so viele Stimmen wie Partei B!</div>Stimmt die Schlagzeile?`, kind: 'mc', options: opts, answer: opts.indexOf(good),
          hint: 'Schau genau, bei welchem Wert die y-Achse beginnt. Lies die echten Werte ab und vergleiche sie.', sol: `A: ${A} %, B: ${B} %. A hat nur etwa ${fmt(Math.round(A / B * 100) / 100)}-mal so viele Stimmen. Die abgeschnittene Achse übertreibt.` };
      }
      if (Math.random() < 0.4) {
        const t = pick([
          () => { const kj = pick([285, 420, 630, 840]); return { q: `Eine Box Schokolinsen enthält ${kj} kJ Energie. 1 kcal = 4.1868 kJ.<br>Wie viele kcal sind das? (auf ganze kcal runden)`, a: Math.round(kj / 4.1868), u: 'kcal', h: 'kJ in kcal: durch 4.1868 teilen.', s: `${kj} : 4.1868 ≈ ${Math.round(kj / 4.1868)} kcal` }; },
          () => { const z = pick([280, 300, 350, 400]), x = Math.round(z * (0.6 + Math.random() * 0.35)); return { q: `Die Fitness-App zeigt: Bewegen ${x}/${z} kcal.<br>Wie viel Prozent des Tagesziels sind erreicht? (auf ganze % runden)`, a: Math.round(x / z * 100), u: '%', h: 'Anteil = erreicht : Ziel, dann mal 100.', s: `${x} : ${z} ≈ ${Math.round(x / z * 100)} %` }; },
          () => { const s = pick([8889, 10500, 7200, 12400]), km = pick([6.17, 7.5, 5.04, 8.9]); return { q: `Die App zeigt ${fmt(s)} Schritte und eine Strecke von ${fmt(km)} km.<br>Wie lang ist ein Schritt im Durchschnitt in cm? (auf ganze cm runden)`, a: Math.round(km * 100000 / s), u: 'cm', h: '1 km = 100 000 cm. Strecke in cm : Anzahl Schritte.', s: `${fmt(km * 100000)} cm : ${fmt(s)} ≈ ${Math.round(km * 100000 / s)} cm` }; },
        ])();
        return { q: t.q, kind: 'num', answer: t.a, tol: 1.01, unit: t.u, hint: t.h, sol: t.s };
      }
      const H = pick([
        { h: 'Bildschirmzeit der Jugendlichen explodiert!', good: 'Um wie viele Minuten pro Tag ist die Bildschirmzeit gestiegen, in welchem Zeitraum und bei wie vielen befragten Jugendlichen?', bad: ['Warum sind Handys so beliebt?', 'Ist zu viel Bildschirmzeit schlecht?', 'Welche App ist die beste?'] },
        { h: 'Balkendiagramm ohne Zahlen an der y-Achse: «Unsere Schule hat riesig mehr Velofahrende!»', good: 'Bei welchem Wert beginnt die y-Achse, und wie gross sind die tatsächlichen Anzahlen?', bad: ['Fahren Velofahrende gerne Velo?', 'Wer hat das Diagramm gezeichnet?', 'Welche Farbe haben die Balken?'] },
        { h: '3 von 4 Kindern lieben Schokolinsen!', good: 'Wie viele Kinder wurden befragt, und wie wurden sie ausgewählt?', bad: ['Welche Farbe ist am beliebtesten?', 'Sind Schokolinsen gesund?', 'Wie heisst die Firma?'] },
        { h: 'Rekord: Noch nie so viele Schritte gezählt!', good: 'Wie viele Schritte waren es im Vergleich zu früher, und wurde jedes Mal gleich gemessen?', bad: ['Ist Laufen gesund?', 'Welche Schuhe sind am besten?', 'Wer hält den Rekord?'] },
      ]);
      const opts = shuffle([H.good, ...H.bad]);
      return { q: `<div class="quote headline">${H.h}</div>Welche Frage ist eine <b>kritische, statistische</b> Frage, mit der man die Aussage mit Daten prüfen kann?`, kind: 'mc', options: opts, answer: opts.indexOf(H.good),
        hint: 'Eine statistische Frage fragt nach Zahlen, Anteilen, Zeiträumen, Achsen oder wie die Daten erhoben wurden, nicht nach Meinungen.', sol: `Gute Frage: «${H.good}»` };
    }
  },
];

export const STAGES = { 1: { name: 'Grundanspruch', stars: '★', coins: 5 }, 2: { name: 'Standard', stars: '★★', coins: 10 }, 3: { name: 'Erweiterung', stars: '★★★', coins: 20 } };

// Antwort prüfen. Bei Termen: gleichwertig (Einsetzen) und, wenn verlangt, vereinfacht. part._note erklärt den Grund.
export function checkPart(part, value) {
  part._note = '';
  if (part.kind === 'mc') return Number(value) === part.answer;
  if (part.kind === 'term') {
    const t = parseTerm(value);
    if (!t) { part._note = 'Dein Term ist nicht lesbar. Schreibe z. B. 3a + 2b, a^2 oder 4(a + b).'; return false; }
    const goal = parseTerm(part.answer);
    if (!sameTerm(t, goal, goal.vars)) return false;
    if (part.form === 'sum' && (t.paren || t.summands > (part.n || goal.summands))) { part._note = 'Dein Term ist gleichwertig, aber noch nicht fertig vereinfacht (Klammern auflösen, gleichartige Glieder zusammenfassen).'; return false; }
    return true;
  }
  const v = parseAnswer(value); if (Number.isNaN(v)) return false;
  return Math.abs(v - part.answer) <= (part.tol ?? 1e-6);
}

// Die zwei Welten: je eine Lernumgebung. Freigabe: siehe CONFIG.worlds und Masterview.
// Anzeige: Thema J und K im mathbuch 1
export const THEMA = { 10: 'J', 11: 'K' };
export const WORLDS = {   // Reihenfolge im Unterricht: zuerst J, dann K
  te: { id: 'te', name: 'Terme-Insel', lu: 10, sub: 'Thema J · Terme umformen (S. 54–59)', sky: [0.55, 0.82, 1.0] },
  dd: { id: 'dd', name: 'Daten-Stadt', lu: 11, sub: 'Thema K · Daten und Diagramme (S. 60–65)', sky: [0.98, 0.8, 0.93] },
};
