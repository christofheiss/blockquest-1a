// BlockQuest 1A – Beispiel-Klasse für Vorführungen (z. B. Gespräch mit der Dozentin).
// ERFUNDENE Daten: 16 pseudonyme IDs, Stand nach Lektion 7 (Thema J). Keine echten Spielstände, nichts wird gespeichert.
// Aufruf: lehrer.html?demo (Masterview ohne Dongle) und app.html?demo=1A05 (Sicht eines Kindes).
import { BUILDINGS, STAGES } from './tasks.js';
import * as C from './core.js';

export const DEMO_NOTE = 'Erfundene Daten und Namen (16 Kinder, Stand nach Lektion 7). Nichts wird gespeichert oder übertragen.';
const BY = Object.fromEntries(BUILDINGS.map(b => [b.id, b]));
const hit = (i, r) => Math.floor((i + 1) * r + 1e-9) > Math.floor(i * r + 1e-9);   // genau Anteil r der Aufgaben
const T = (s) => new Date(s).getTime();
const START = { glieder: '2027-01-04T10:55', klammer: '2027-01-06T09:05', distri: '2027-01-07T10:10', flaeche: '2027-01-07T11:00', pruef: '2027-01-11T10:10', wuerfel: '2027-01-11T11:00' };

// Profile pro Station: [Anzahl Aufgaben, Trefferquote, Anteil ab ★★, Anteil ★★★, Anteil mit Lösungshilfe]; boss: [richtig pro Phase, falsch pro Phase]
const P = {
  stark:   { glieder: [10, .9, .9, .4, 0], klammer: [9, .89, .9, .3, 0], distri: [10, .9, .9, .4, .1], flaeche: [7, .86, .7, .2, .1], wuerfel: [6, 1, .8, .3, 0], pruef: [6, .83, .8, .3, .1], boss: [[7, 6, 6], [0, 1, 1]] },
  solide:  { glieder: [9, .89, .6, 0, .1], klammer: [8, .75, .5, 0, .13], distri: [8, .88, .5, 0, .13], flaeche: [5, .8, .4, 0, .2], wuerfel: [5, .8, .6, 0, .2], pruef: [4, .75, .25, 0, .25], boss: [[5, 4, 3], [1, 2, 2]] },
  klammer: { glieder: [9, .78, .3, 0, .2], klammer: [8, .38, 0, 0, .63], distri: [7, .43, 0, 0, .57], flaeche: [3, .67, 0, 0, .33], wuerfel: [4, .75, .25, 0, .25], pruef: [3, .33, 0, 0, .67], boss: [[4, 1, 1], [1, 5, 4]] },
  wenig:   { glieder: [4, .75, 0, 0, .25], klammer: [2, .5, 0, 0, .5], distri: [1, 1, 0, 0, 0], flaeche: [0], wuerfel: [1, 1, 0, 0, 0], pruef: [0], boss: null },
  pruef:   { glieder: [9, .89, .7, .2, 0], klammer: [7, .86, .6, 0, .14], distri: [8, .88, .6, .2, .13], flaeche: [5, .8, .6, 0, .2], wuerfel: [5, 1, .6, 0, 0], pruef: [6, .33, .2, 0, .5], boss: [[6, 5, 1], [0, 1, 4]] },
};
export const DEMO_WHO = { '1A01': 'solide', '1A02': 'wenig', '1A03': 'stark', '1A04': 'pruef', '1A05': 'klammer', '1A06': 'solide', '1A07': 'pruef', '1A08': 'stark', '1A09': 'klammer', '1A10': 'solide', '1A11': 'wenig', '1A12': 'stark', '1A13': 'klammer', '1A14': 'solide', '1A15': 'stark', '1A16': 'solide' };
// Erfundene Namen (9 Mädchen, 7 Knaben wie in der Klasse). Im echten Betrieb stehen Namen nur im Dongle.
export const DEMO_NAMES = { '1A01': 'Lea S.', '1A02': 'Luca B.', '1A03': 'Mia K.', '1A04': 'Noah F.', '1A05': 'Elena W.', '1A06': 'Jonas H.', '1A07': 'Lara M.', '1A08': 'Elias R.',
  '1A09': 'Nina G.', '1A10': 'Alina T.', '1A11': 'Levin Z.', '1A12': 'Sara P.', '1A13': 'Nico A.', '1A14': 'Jana L.', '1A15': 'Tim D.', '1A16': 'Leonie B.' };
export const DEMO_WORLDS = { te: true, dd: false, boss_te: true, klasse: 4800 };

function plainQ(q) { return q.replace(/<img[^>]*>|<svg[\s\S]*?<\/svg>|<table[\s\S]*?<\/table>/g, '[Grafik] ').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 140); }

export function demoStudent(id) {
  const prof = P[DEMO_WHO[id]]; if (!prof) return null;
  const S = C.newState(id); S.created = T('2027-01-04T10:05');
  for (const sid of ['glieder', 'klammer', 'distri', 'flaeche', 'pruef', 'wuerfel']) {
    const [n, rate = 0, hi = 0, top = 0, hint = 0] = prof[sid];
    let t = T(START[sid]) + (id.charCodeAt(3) % 7) * 20000;
    for (let i = 0; i < n; i++) {
      const s = hit(i, top) && i >= 3 ? 3 : hit(i, hi) ? 2 : 1, ok = hit(i, rate), h = hit(i, hint), tries = ok ? 1 : 2;
      let coins = ok ? STAGES[s].coins : 0; if (ok && h) coins = Math.ceil(coins / 2);
      S.stats[sid][s][ok ? 'c' : 'w']++; S.stats[sid].recent.push({ s, ok }); if (S.stats[sid].recent.length > 10) S.stats[sid].recent.shift();
      const ms = (ok ? 70000 : 150000) + i * 3000; t += ms + 15000;
      S.log.push({ t, b: sid, s, ok, tries, hint: h, ms, coins, q: plainQ(BY[sid].gen(s).q), a: [ok ? '(richtige Antwort)' : '(falsche Antwort)'], via: i % 5 === 4 ? 'app' : 'spiel' });
      S.coins += coins; S.earned += coins; if (h) S.hints++;
      for (const b of C.checkBadges(S, 'spiel')) { const l = S.log[S.log.length - 1]; if (l.b === 'badge') l.t = t; }
    }
  }
  if (prof.boss) {
    const st = S.boss.te, [right, wrong] = prof.boss, won = right.reduce((a, b) => a + b) >= 17;
    Object.assign(st, { fights: 1, wins: won ? 1 : 0, right, wrong, best: won ? 9 * 60000 : null, last: { t: T('2027-01-11T11:30'), hp: won ? 0 : 40, won } });
    if (won) { S.coins += 50; S.earned += 50; S.log.push({ t: T('2027-01-11T11:30'), b: 'boss', s: 0, ok: true, tries: 0, hint: false, ms: 9 * 60000, coins: 50, q: 'Boss besiegt: Klammer-Koloss', a: [], via: 'spiel', boss: 'te' }); }
  }
  while (S.coins >= C.levelCost(S.level)) {   // Aufstiege wie im Spiel, mit festen Zeitpunkten
    const cost = C.levelCost(S.level); S.coins -= cost; S.level++;
    S.log.push({ t: T('2027-01-11T11:35'), b: 'level', s: 0, ok: true, tries: 0, hint: false, ms: 0, coins: -cost, q: `Aufstieg auf Level ${S.level}`, a: [], via: 'spiel' });
  }
  S.log.sort((a, b) => a.t - b.t);
  S.lastSave = T('2027-01-11T11:38'); S.sessions = [{ start: S.created, end: S.lastSave }]; S.unsavedSince = 0;
  return S;
}
export const demoClass = () => Object.keys(DEMO_WHO).map(demoStudent);
