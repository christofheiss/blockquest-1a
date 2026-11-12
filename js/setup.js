// BlockQuest 1A – Einrichtung im Browser (setup.html): Schlüsselpaar, Codes, Dongle, Token-Karten und js/config.js.
// Läuft ohne Node und ohne Server-Kontakt. Nur lokal benutzen und die Ergebnisse privat ablegen.
import * as K from './crypto.js';
import { tokenCardsPdf } from './cards.js';
import { qrSvg } from './qr.js';

export async function makeSetup({ n = 16, prefix = '1A', pw, saveUrl = '', dataRepo = '' }) {
  if (!pw || pw.length < 10) throw new Error('Das Passwort braucht mindestens 10 Zeichen.');
  const { publicJwk, privateJwk } = await K.generateTeacherKeys();
  const ids = Array.from({ length: n }, (_, i) => prefix + String(i + 1).padStart(2, '0')).concat([prefix + '99']);
  const tokens = ids.map(id => ({ id, token: K.newToken(id) }));
  const hashes = [];
  for (const t of tokens) hashes.push(`    '${await K.tokenHash(t.token)}', // ${t.id}${t.id.endsWith('99') ? ' (Test Lehrperson)' : ''}`);
  const names = Object.fromEntries(ids.map(id => [id, id.endsWith('99') ? 'Test Lehrperson' : '']));
  const dongle = await K.makeDongle({ privateKey: privateJwk, tokens, names, created: Date.now() }, pw);
  const pub = { kty: publicJwk.kty, n: publicJwk.n, e: publicJwk.e, alg: publicJwk.alg, ext: true, key_ops: ['encrypt'] };
  const configText = `// BlockQuest 1A – öffentliche Einstellungen (darf auf GitHub liegen)
// Enthält KEINE Geheimnisse: nur den öffentlichen Schlüssel der Lehrperson und Prüfwerte (Hashes) der gültigen Codes.
// Erzeugt mit setup.html am ${new Date().toLocaleString('de-CH')}.
export const CONFIG = {
  className: '${prefix}',
  // Online-Speichern: Adresse des Cloudflare Workers (leer = nur Datei-Download) und privates Daten-Repo
  saveUrl: '${saveUrl}',
  dataRepo: '${dataRepo}',
  teacherPublicKey: ${JSON.stringify(pub)},
  // Freigabe, solange der Worker nichts anderes meldet (te = Terme-Insel Thema J, dd = Daten-Stadt Thema K)
  worlds: { te: true, dd: false },
  tokenHashes: [
${hashes.join('\n')}
  ]
};
`;
  const csv = 'ID;Code;Name\n' + tokens.map(t => `${t.id};${t.token};${names[t.id]}`).join('\n') + '\n';
  return { configText, dongle, tokens, csv };
}

function download(blob, name) {
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name;
  document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 3000);
}

// ---------- Seite ----------
const $ = (s) => document.querySelector(s);
if ($('#setupForm')) {
  let result = null;
  $('#gameUrl').value ||= new URL('index.html', location.href).href.replace(/^http:\/\/(localhost|127\.0\.0\.1)[^/]*\//, 'https://christofheiss.github.io/blockquest-1a/');
  $('#setupForm').onsubmit = async (e) => {
    e.preventDefault(); $('#err').textContent = '';
    if ($('#pw1').value !== $('#pw2').value) { $('#err').textContent = 'Die beiden Passwörter sind verschieden.'; return; }
    $('#go').disabled = true; $('#go').textContent = 'Erzeuge …';
    try {
      result = await makeSetup({ n: Number($('#n').value), prefix: $('#prefix').value.trim().toUpperCase().slice(0, 2), pw: $('#pw1').value, saveUrl: $('#saveUrl').value.trim(), dataRepo: $('#dataRepo').value.trim() });
      $('#pw1').value = ''; $('#pw2').value = '';
      $('#out').hidden = false;
      $('#codes').innerHTML = result.tokens.map(t => `<li><b>${t.id}</b> <code>${t.token}</code></li>`).join('');
      $('#qrTest').innerHTML = qrSvg(`${$('#gameUrl').value}#t=${result.tokens[result.tokens.length - 1].token}`, 3);
    } catch (er) { $('#err').textContent = er.message; }
    finally { $('#go').disabled = false; $('#go').textContent = 'Schlüssel und Codes erzeugen'; }
  };
  $('#dlConfig').onclick = () => download(new Blob([result.configText], { type: 'text/javascript' }), 'config.js');
  $('#dlDongle').onclick = () => download(new Blob([JSON.stringify(result.dongle)], { type: 'application/json' }), 'BlockQuest1A_Lehrer.dongle.bq1akey');
  $('#dlCsv').onclick = () => download(new Blob(['﻿' + result.csv], { type: 'text/csv' }), 'BlockQuest1A_Codeliste.csv');
  $('#dlCards').onclick = () => download(tokenCardsPdf(result.tokens, $('#gameUrl').value.trim()), 'BlockQuest1A_Token-Karten.pdf');
}
