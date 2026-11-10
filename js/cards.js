// BlockQuest 1A – Token-Karten als PDF (8 pro A4) mit QR-Code, ohne Bibliotheken.
// tokenCardsPdf(tokens, gameUrl) → Blob (application/pdf). tokens: [{ id, token }]
import { qrMatrix } from './qr.js';

const MM = 72 / 25.4;
// Text für Helvetica mit WinAnsi-Codierung (Umlaute, «», ·, –)
const WIN = { '–': 0x96, '—': 0x97, '’': 0x92, '…': 0x85, '€': 0x80 };
function pdfText(s) {
  let o = '';
  for (const ch of String(s)) {
    let c = WIN[ch] ?? ch.charCodeAt(0);
    if (c > 255) c = 63;   // «?»
    const t = String.fromCharCode(c);
    o += t === '(' || t === ')' || t === '\\' ? '\\' + t : t;
  }
  return `(${o})`;
}

function cardOps(x, y, w, h, t, url) {
  const ops = [];
  const txt = (font, size, tx, ty, s, gray = 0) => ops.push(`${gray} g BT /${font} ${size} Tf ${tx.toFixed(2)} ${ty.toFixed(2)} Td ${pdfText(s)} Tj ET`);
  ops.push('0.6 G [3 3] 0 d 0.5 w', `${x.toFixed(2)} ${y.toFixed(2)} ${w.toFixed(2)} ${h.toFixed(2)} re S`, '[] 0 d');
  // Kopfzeile in Neon-Violett
  ops.push('0.42 0.25 0.85 rg', `${x.toFixed(2)} ${(y + h - 11 * MM).toFixed(2)} ${w.toFixed(2)} ${(11 * MM).toFixed(2)} re f`);
  txt('F2', 14, x + 5 * MM, y + h - 7.5 * MM, 'BlockQuest 1A', 1);
  txt('F1', 6.5, x + w - 48 * MM, y + h - 7.2 * MM, 'persönlicher Zugang · nicht weitergeben', 1);
  txt('F2', 26, x + 5 * MM, y + h - 24 * MM, t.id);
  txt('F1', 8, x + 5 * MM, y + h - 29 * MM, 'Deine ID' + (t.id.endsWith('99') ? ' (Test Lehrperson)' : ''));
  txt('F3', 11, x + 5 * MM, y + h - 38 * MM, t.token);
  const lines = ['1. Spiel öffnen (QR-Code scannen) oder:', '   ' + url.replace(/^https?:\/\//, '').replace(/index\.html$/, ''), '2. Code eintippen', '3. Am Schluss der Lektion «Speichern»'];
  lines.forEach((l, j) => txt('F1', 7.2, x + 5 * MM, y + h - 45 * MM - j * 3.5 * MM, l));
  // QR-Code
  const M = qrMatrix(`${url}#t=${t.token}`), n = M.length, s = 38 * MM, m = s / (n + 2), qx = x + w - s - 3 * MM, qy = y + 4 * MM;
  ops.push('0 g');
  M.forEach((row, r) => row.forEach((c, k) => { if (c) ops.push(`${(qx + (k + 1) * m).toFixed(2)} ${(qy + s - (r + 2) * m).toFixed(2)} ${(m + 0.02).toFixed(2)} ${(m + 0.02).toFixed(2)} re f`); }));
  return ops.join('\n');
}

export function tokenCardsPdf(tokens, gameUrl) {
  const W = 595.28, H = 841.89, cw = 95 * MM, ch = 66 * MM, mx = (W - 2 * cw) / 2, my = (H - 4 * ch) / 2;
  const pages = [];
  for (let p = 0; p < tokens.length; p += 8) {
    pages.push(tokens.slice(p, p + 8).map((t, k) => cardOps(mx + (k % 2) * cw, H - my - (Math.floor(k / 2) + 1) * ch, cw, ch, t, gameUrl)).join('\n'));
  }
  // Objekte: 1 Katalog, 2 Seiten, 3–5 Schriften, danach je Seite: Seite + Inhalt
  const objs = [];
  const nPages = pages.length;
  objs[1] = '<< /Type /Catalog /Pages 2 0 R >>';
  objs[2] = `<< /Type /Pages /Count ${nPages} /Kids [${pages.map((_, i) => `${6 + i * 2} 0 R`).join(' ')}] >>`;
  objs[3] = '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>';
  objs[4] = '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>';
  objs[5] = '<< /Type /Font /Subtype /Type1 /BaseFont /Courier-Bold /Encoding /WinAnsiEncoding >>';
  pages.forEach((c, i) => {
    objs[6 + i * 2] = `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${W} ${H}] /Resources << /Font << /F1 3 0 R /F2 4 0 R /F3 5 0 R >> >> /Contents ${7 + i * 2} 0 R >>`;
    objs[7 + i * 2] = `<< /Length ${c.length} >>\nstream\n${c}\nendstream`;
  });
  let out = '%PDF-1.4\n%\xe2\xe3\xcf\xd3\n';
  const offs = [];
  for (let i = 1; i < objs.length; i++) { offs[i] = out.length; out += `${i} 0 obj\n${objs[i]}\nendobj\n`; }
  const xref = out.length;
  out += `xref\n0 ${objs.length}\n0000000000 65535 f \n` + offs.slice(1).map(o => String(o).padStart(10, '0') + ' 00000 n \n').join('');
  out += `trailer\n<< /Size ${objs.length} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
  const bytes = new Uint8Array(out.length); for (let i = 0; i < out.length; i++) bytes[i] = out.charCodeAt(i) & 0xff;
  return new Blob([bytes], { type: 'application/pdf' });
}
