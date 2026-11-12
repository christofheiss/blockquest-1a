// BlockQuest 1A – Lernziele und Kriterienraster pro Thema (J und K), für die Lern-App und das Spiel.
// Quelle: Profilpraktikum Unterrichtsauftrag Mt1A, Kompetenzen (Lernziele, Performanz, Kriterienraster).
// goalsHtml(S, w, link) zeichnet die Seite im Spieldesign; link(stationId) liefert das HTML-Attribut zum Üben.
import { BUILDINGS, STAGES } from './tasks.js';
import * as C from './core.js';

const BYID = Object.fromEntries(BUILDINGS.map(b => [b.id, b]));
const esc = (s) => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

export const GOALS = {
  te: {
    code: 'J', name: 'Terme umformen', world: 'Terme-Insel', pages: 'mathbuch 1, S. 54–59',
    exam: 'Prüfung Thema J in Lektion 8 · Microsoft Forms · 5 Punkte',
    lz: [
      { lz: 'LZ1', ich: 'Ich kann einfache Terme vereinfachen, indem ich gleichartige Glieder addiere und subtrahiere.', bsp: '3x + 2y + 4x = 7x + 2y', st: ['glieder', 'klammer'] },
      { lz: 'LZ2', ich: 'Ich kann für Variablen Zahlen einsetzen und den Wert des Terms korrekt berechnen.', bsp: '3a + 2b mit a = 4, b = 5 → 22', st: ['wuerfel'] },
      { lz: 'LZ3', ich: 'Ich kann mit dem Distributivgesetz Klammern auflösen (ausmultiplizieren).', bsp: '3 · (a + 4) = 3a + 12', st: ['distri', 'flaeche'] },
      { lz: 'LZ4', ich: 'Ich kann Termumformungen mit einer Kontrollrechnung (Zahlen einsetzen) überprüfen.', bsp: '4(a + b) = 4a + 4b? Mit a = 2, b = 3: 20 = 20 ✓', st: ['pruef', 'klammer'] },
    ],
    raster: [
      { a: 'A1 + A2', t: 'Terme vereinfachen und Distributivgesetz', krit: 'Gleichartige Glieder werden fehlerfrei zusammengefasst. Das Ausmultiplizieren (Klammern auflösen) ist korrekt, alle Glieder werden beachtet.', p: 2, lz: ['LZ1', 'LZ3'], st: ['glieder', 'distri'] },
      { a: 'A3', t: 'Werte einsetzen', krit: 'Die Zahlen werden korrekt für die Variablen eingesetzt und die Rechnung stimmt.', p: 1, lz: ['LZ2'], st: ['wuerfel'] },
      { a: 'A4 + A5', t: 'Kontrollrechnung und Fehler finden', krit: 'Die Probe durch Einsetzen ist richtig gerechnet. Der Fehler beim Ausmultiplizieren wird genau erkannt und korrekt berichtigt.', p: 2, lz: ['LZ4'], st: ['pruef', 'klammer'] },
    ],
  },
  dd: {
    code: 'K', name: 'Daten und Diagramme', world: 'Daten-Stadt', pages: 'mathbuch 1, S. 60–65',
    exam: 'Prüfung Thema K in Lektion 19 · Microsoft Forms + A7 auf Papier · 5 Punkte',
    lz: [
      { lz: 'LZ5', ich: 'Ich kann Daten aus Säulen-, Balken-, Kreis- und Liniendiagrammen herauslesen und interpretieren.', bsp: 'Welche App wird am zweithäufigsten genutzt?', st: ['diagramm', 'mittel', 'screen'] },
      { lz: 'LZ6', ich: 'Ich kann aus Daten ein passendes Diagramm erstellen (auch digital).', bsp: 'Monatstemperaturen → Liniendiagramm mit sinnvoller Skalierung', st: ['klassen'] },
      { lz: 'LZ7', ich: 'Ich kann absolute und relative Häufigkeiten unterscheiden und vergleichen.', bsp: '4 von 16 = 25 % · 5 von 20 = 25 %', st: ['linsen'] },
      { lz: 'LZ8', ich: 'Ich kann zu Diagrammen eigene Fragen stellen und Aussagen auf ihre Richtigkeit prüfen.', bsp: '«Mehr als die Hälfte …» bei 45 % → stimmt nicht', st: ['fakten', 'screen'] },
    ],
    raster: [
      { a: 'A6', t: 'Diagramme lesen', krit: 'Die gesuchten Informationen und Werte werden genau aus dem Diagramm abgelesen.', p: 1, lz: ['LZ5'], st: ['diagramm'] },
      { a: 'A7', t: 'Diagramm erstellen (auf Papier)', krit: 'Das Diagramm ist sauber gezeichnet, die Achsen sind gleichmässig skaliert und beschriftet, die Punkte stimmen mit der Tabelle überein.', p: 1, lz: ['LZ6'], st: ['klassen'], paper: true },
      { a: 'A8', t: 'Absolut und relativ', krit: 'Absolute Zahlen und relativer Anteil werden unterschieden; die Rechnung führt zum richtigen Schluss.', p: 1, lz: ['LZ7'], st: ['linsen'] },
      { a: 'A9 + A10', t: 'Aussagen prüfen und Fragen stellen', krit: 'Aussagen werden mit den Daten logisch bestätigt oder widerlegt. Die eigene Frage zeigt ein kritisches Verständnis der Darstellung (z. B. Achse beginnt nicht bei 0).', p: 2, lz: ['LZ8'], st: ['fakten'] },
    ],
  },
};

// Ampel pro Lernziel: grün = Abzeichen, gelb = schon richtig gelöst, rot = noch nicht geübt
export function lzStatus(S, g) {
  const p = C.badgeProgress(S, g.lz), have = S.badges?.[g.lz] || {};
  const right = g.st.reduce((n, id) => n + [1, 2, 3].reduce((m, k) => m + (S.stats[id]?.[k]?.c || 0), 0), 0);
  const level = have.gold ? 'gold' : have.silver ? 'gruen' : right ? 'gelb' : 'rot';
  return { level, p, right, have };
}
const AMPEL = { gold: ['Gold!', 'Du bist bereit.'], gruen: ['Bereit', 'Abzeichen geschafft.'], gelb: ['Unterwegs', 'Übe weiter ab ★★.'], rot: ['Start', 'Noch nicht geübt.'] };
const RANK = { rot: 0, gelb: 1, gruen: 2, gold: 3 };

export function goalsHtml(S, w, link) {
  const G = GOALS[w], tabs = Object.entries(GOALS).map(([k, x]) => `<a class="gl-tab ${k === w ? 'on' : ''}" ${link('#tab:' + k)}>Thema ${x.code}</a>`).join('');
  const lzStat = Object.fromEntries(G.lz.map(g => [g.lz, lzStatus(S, g)]));
  const ready = G.lz.filter(g => RANK[lzStat[g.lz].level] >= 2).length;
  const stBtn = (id) => `<a class="gl-st" ${link(id)}>${esc(BYID[id].name)}</a>`;
  return `<div class="gl gl-${w}">
    <div class="gl-tabs">${tabs}</div>
    <header class="gl-head">
      <span class="gl-code">${G.code}</span>
      <div><span class="gl-eyebrow">${esc(G.world)} · ${esc(G.pages)}</span><h2>${esc(G.name)}</h2><p>${esc(G.exam)}</p></div>
      <div class="gl-meter" title="Lernziele mit Abzeichen"><b>${ready} / ${G.lz.length}</b><span>Lernziele bereit</span></div>
    </header>
    <h3 class="gl-h">🎯 Meine Lernziele</h3>
    <ol class="gl-lz">${G.lz.map(g => {
      const s = lzStat[g.lz], [t1, t2] = AMPEL[s.level];
      return `<li class="gl-card a-${s.level}">
        <div class="gl-lamp" aria-label="${t1}"><i></i><i></i><i></i></div>
        <div class="gl-body"><span class="gl-tag">${g.lz}</span><p class="gl-ich">${esc(g.ich)}</p><p class="gl-bsp">${esc(g.bsp)}</p>
          <div class="gl-prog"><div class="bar"><div style="width:${s.p.silver / C.BADGE_NEED.silver * 100}%"></div></div><span>${t1}: ${s.have.silver ? (s.have.gold ? 'Gold-Abzeichen' : `Gold ${s.p.gold} / ${C.BADGE_NEED.gold} auf ★★★`) : `${s.p.silver} / ${C.BADGE_NEED.silver} Aufgaben ab ★★ ohne Hilfe`} · ${t2}</span></div>
          <div class="gl-sts">Üben: ${g.st.map(stBtn).join('')}</div></div>
      </li>`;
    }).join('')}</ol>
    <h3 class="gl-h">📋 Kriterienraster der Prüfung</h3>
    <p class="gl-note">So wird die Prüfung bewertet. Für jede Aufgabe gibt es die Punkte, wenn das Kriterium ganz erfüllt ist.</p>
    <div class="gl-raster">${G.raster.map(r => {
      const lv = r.lz.map(l => lzStat[l].level).reduce((a, b) => RANK[a] <= RANK[b] ? a : b);
      return `<div class="gl-row a-${lv}">
        <div class="gl-a"><b>${r.a}</b><span>${'■'.repeat(r.p)}${'□'.repeat(Math.max(0, 2 - r.p))} ${r.p} ${r.p === 1 ? 'Punkt' : 'Punkte'}</span></div>
        <div class="gl-k"><b>${esc(r.t)}</b> <span class="gl-tag">${r.lz.join(' · ')}</span><p>${esc(r.krit)}</p>${r.paper ? '<p class="gl-paper">✏️ Diese Aufgabe zeichnest du von Hand auf ein gehäuseltes Blatt. Übe sie auch auf Papier.</p>' : ''}<div class="gl-sts">Üben: ${r.st.map(stBtn).join('')}</div></div>
        <div class="gl-me"><i></i><span>${AMPEL[lv][0]}</span></div>
      </div>`;
    }).join('')}
      <div class="gl-row gl-total"><div class="gl-a"><b>Total</b></div><div class="gl-k"><b>${G.raster.reduce((a, r) => a + r.p, 0)} Punkte</b></div><div class="gl-me"></div></div>
    </div>
    <p class="gl-note"><a href="ziele.html" target="_blank" rel="noopener">Alle Lernziele und den Kriterienkatalog auf einer Seite ansehen oder drucken</a></p>
    <p class="gl-note">Die Ampel zeigt deinen Stand in BlockQuest: <b>grün</b> = Abzeichen geschafft (5 Aufgaben ab ${STAGES[2].stars} im ersten Versuch ohne Lösungshilfe), <b>gelb</b> = schon geübt, <b>rot</b> = noch nicht geübt. Sie ersetzt keine Note.</p>
  </div>`;
}

// ---------- Eigene Seite ziele.html: Lernziele und Kriterienkatalog ohne Anmeldung ----------
export function catalogHtml(w) {
  const G = GOALS[w];
  const st = (id) => `<span class="gl-st">${esc(BYID[id].name)}</span>`;
  return `<section class="gl gl-${w} gl-cat" id="thema-${G.code}">
    <header class="gl-head">
      <span class="gl-code">${G.code}</span>
      <div><span class="gl-eyebrow">${esc(G.world)} · ${esc(G.pages)}</span><h2>${esc(G.name)}</h2><p>${esc(G.exam)}</p></div>
      <div class="gl-meter"><b>${G.lz.length}</b><span>Lernziele</span></div>
    </header>
    <h3 class="gl-h">🎯 Lernziele</h3>
    <ol class="gl-lz">${G.lz.map(g => `<li class="gl-card">
      <div class="gl-check" aria-hidden="true"></div>
      <div class="gl-body"><span class="gl-tag">${g.lz}</span><p class="gl-ich">${esc(g.ich)}</p><p class="gl-bsp">${esc(g.bsp)}</p>
        <div class="gl-sts">Üben in BlockQuest: ${g.st.map(st).join('')}</div></div></li>`).join('')}</ol>
    <h3 class="gl-h">📋 Kriterienkatalog der Prüfung</h3>
    <table class="gl-table">
      <thead><tr><th>Aufgabe</th><th>Lernziel</th><th>Kriterium für die volle Punktzahl</th><th>Punkte</th><th>Üben</th></tr></thead>
      <tbody>${G.raster.map(r => `<tr><td><b>${r.a}</b><br><span class="gl-sub">${esc(r.t)}</span></td><td>${r.lz.map(l => `<span class="gl-tag">${l}</span>`).join(' ')}</td>
        <td>${esc(r.krit)}${r.paper ? '<br><span class="gl-paper">✏️ von Hand auf Papier</span>' : ''}</td><td class="gl-pts">${r.p}</td><td>${r.st.map(st).join(' ')}</td></tr>`).join('')}</tbody>
      <tfoot><tr><td colspan="3"><b>Total</b></td><td class="gl-pts">${G.raster.reduce((a, r) => a + r.p, 0)}</td><td></td></tr></tfoot>
    </table>
  </section>`;
}
