// BlockQuest 1A – Aufbau der Blockwelten: Terme-Insel (te, Thema J) und Daten-Stadt (dd, Thema K)
// Bunte Kunststoff-Gebäude (Stationen), Level-Turm, Boss-Arena, Klassen-Turm und ein Hindernis-Parcours pro Welt.
import { World, B } from './engine.js';
import { BUILDINGS, WORLDS } from './tasks.js';

export const SIZE = 72, HEIGHT = 30, G = 4; // Bodenhöhe: Gras auf y = G

let seed = 12345;
const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;

// Stations-Standorte: Mittelpunkt (x,z), Tür nach Norden (N) oder Süden (S)
const SPOTS = {
  te: { glieder: [17, 27, 'S'], klammer: [27, 27, 'S'], distri: [46, 27, 'S'], flaeche: [27, 46, 'N'], wuerfel: [46, 46, 'N'], pruef: [56, 46, 'N'] },
  dd: { mittel: [17, 27, 'S'], klassen: [27, 27, 'S'], linsen: [46, 27, 'S'], diagramm: [27, 46, 'N'], screen: [46, 46, 'N'], fakten: [56, 46, 'N'] },
};
export const PLAZA = { x: 36, z: 36 };
export const LEVEL_TOWER = { id: 'level', name: 'Level-Turm', x: 36, z: 22, door: 'S' };
// Boss-Arena im Nordosten, Klassen-Turm im Südwesten, Parcours im Nordwesten
export const ARENA = { id: 'boss', name: 'Boss-Arena', x: 58, z: 14, r: 7 };
export const CLASS_TOWER = { id: 'klasse', name: 'Klassen-Turm', x: 14, z: 54 };
export const PARCOURS = { id: 'parcours', name: 'Parcours' };

// Parcours: Plattformen [x, z, Höhe über dem Boden, Grösse, Farbe]; die letzte ist das Ziel
const COURSE = {
  te: [[7, 16, 1, 3, 'LIME'], [11, 16, 2, 2, 'CYAN'], [15, 15, 3, 2, 'MAGENTA'], [19, 15, 3, 1, 'YELLOW'], [22, 13, 4, 2, 'ORANGE'], [25, 10, 5, 2, 'LIME'],
    [25, 6, 6, 2, 'CYAN'], [21, 6, 7, 2, 'MAGENTA'], [18, 6, 7, 1, 'YELLOW'], [14, 7, 8, 2, 'ORANGE'], [10, 7, 9, 2, 'LIME'], [6, 9, 10, 3, 'GOLD']],
  dd: [[7, 16, 1, 3, 'MAGENTA'], [11, 15, 2, 2, 'SKY'], [14, 13, 3, 1, 'YELLOW'], [17, 14, 4, 1, 'LIME'], [20, 14, 4, 2, 'MAGENTA'], [23, 12, 5, 1, 'SKY'],
    [24, 9, 6, 2, 'YELLOW'], [22, 7, 7, 1, 'LIME'], [19, 7, 8, 1, 'MAGENTA'], [15, 6, 8, 2, 'SKY'], [12, 8, 9, 1, 'YELLOW'], [8, 9, 10, 3, 'GOLD']],
};
export const courseGoal = (w) => { const c = COURSE[w][COURSE[w].length - 1]; return { x0: c[0], z0: c[1], x1: c[0] + c[3], z1: c[1] + c[3], y: G + c[2] + 1 }; };
export const courseStart = (w) => { const c = COURSE[w][0]; return { x: c[0] + c[3] / 2, z: c[1] + c[3] / 2, y: G + c[2] + 1 }; };

function building(w, cx, cz, door, wall, accent, roof, floor, h = 5, half = 4) {
  const x0 = cx - half, x1 = cx + half, z0 = cz - half, z1 = cz + half;
  w.fill(x0 - 1, G, z0 - 1, x1 + 1, G, z1 + 1, B.WHITE);         // Sockel
  w.fill(x0, G, z0, x1, G, z1, floor);                            // Boden
  w.fill(x0, G + 1, z0, x1, G + h, z1, wall);                     // Wände (danach aushöhlen)
  w.fill(x0 + 1, G + 1, z0 + 1, x1 - 1, G + h, z1 - 1, B.AIR);
  for (const [x, z] of [[x0, z0], [x1, z0], [x0, z1], [x1, z1]]) w.fill(x, G + 1, z, x, G + h, z, B.WHITE);
  // Fenster
  for (let k = x0 + 2; k <= x1 - 2; k += 3) { w.fill(k, G + 2, z0, k, G + 3, z0, B.GLASS); w.fill(k, G + 2, z1, k, G + 3, z1, B.GLASS); }
  for (let k = z0 + 2; k <= z1 - 2; k += 3) { w.fill(x0, G + 2, k, x0, G + 3, k, B.GLASS); w.fill(x1, G + 2, k, x1, G + 3, k, B.GLASS); }
  // Tür mit Rahmen
  const dz = door === 'S' ? z1 : z0;
  w.fill(cx - 1, G + 1, dz, cx + 1, G + 3, dz, B.AIR);
  w.fill(cx - 2, G + 4, dz, cx + 2, G + 4, dz, accent);
  w.fill(cx - 2, G + 1, dz, cx - 2, G + 3, dz, accent); w.fill(cx + 2, G + 1, dz, cx + 2, G + 3, dz, accent);
  // Dach: Rand + Stufen
  w.fill(x0 - 1, G + h + 1, z0 - 1, x1 + 1, G + h + 1, z1 + 1, B.WHITE);
  w.fill(x0, G + h + 2, z0, x1, G + h + 2, z1, roof);
  w.fill(x0 + 2, G + h + 3, z0 + 2, x1 - 2, G + h + 3, z1 - 2, accent);
  w.fill(cx - 1, G + h + 4, cz - 1, cx + 1, G + h + 4, cz + 1, roof);
  w.set(cx, G + h, cz, B.LAMP);
  // Weg vor der Tür
  const step = door === 'S' ? 1 : -1;
  for (let k = 1; k <= 6; k++) w.fill(cx - 1, G, dz + step * k, cx + 1, G, dz + step * k, w.pathBlock);
  return { x0, x1, z0, z1, dz, signY: G + h + 5.6 };
}

function tree(w, x, z) {
  const h = 4 + Math.floor(rnd() * 2);
  w.fill(x - 2, G + h - 1, z - 2, x + 2, G + h, z + 2, B.LEAVES);
  w.fill(x - 1, G + h + 1, z - 1, x + 1, G + h + 1, z + 1, B.LEAVES);
  w.set(x, G + h + 2, z, B.LEAVES);
  w.fill(x, G + 1, z, x, G + h, z, B.LOG);
}
// Säulendiagramm als Skulptur (Daten-Stadt)
function barSculpture(w, x, z) {
  const cols = [B.MAGENTA, B.SKY, B.YELLOW, B.LIME];
  w.fill(x - 1, G, z - 1, x + 4, G, z + 1, B.WHITE);
  for (let i = 0; i < 4; i++) w.fill(x + i, G + 1, z, x + i, G + 1 + Math.floor(rnd() * 4), z, cols[i]);
}

function arena(w) {
  const { x: ax, z: az, r } = ARENA;
  for (let z = az - r - 1; z <= az + r + 1; z++) for (let x = ax - r - 1; x <= ax + r + 1; x++) {
    const d = Math.hypot(x - ax, z - az);
    if (d <= r + 0.5) { w.fill(x, G + 1, z, x, HEIGHT - 1, z, B.AIR); w.set(x, G, z, d > r - 1.5 ? B.BLACK : (x + z) % 2 ? B.WHITE : B.BLACK); }
  }
  // Säulen mit Lichtern im Kreis, Lücke im Westen als Eingang
  for (let k = 0; k < 10; k++) {
    const a = k / 10 * Math.PI * 2; if (Math.abs(Math.cos(a) + 1) < 0.2) continue;
    const x = Math.round(ax + Math.cos(a) * r), z = Math.round(az + Math.sin(a) * r);
    w.fill(x, G + 1, z, x, G + 4, z, k % 2 ? B.MAGENTA : B.CYAN); w.set(x, G + 5, z, B.LAMP);
  }
  w.fill(ax - 1, G, az - 1, ax + 1, G, az + 1, B.GOLD);   // Sockel des Bosses
  w.fill(38, G, az - 1, ax - r, G, az + 1, w.pathBlock);    // Weg vom Hauptweg zur Arena
  return { x0: ax - r + 1, x1: ax + r, z0: az - r + 1, z1: az + r, cx: ax, cz: az, door: 'S', signY: G + 9 };
}

function course(w, id) {
  const list = COURSE[id];
  for (const [x, z, y, s, c] of list) w.fill(x, G + y, z, x + s - 1, G + y, z + s - 1, B[c]);
  const g = list[list.length - 1];
  w.fill(g[0] + 1, G + g[2] + 1, g[1] + 1, g[0] + 1, G + g[2] + 3, g[1] + 1, B.WHITE);   // Fahnenstange
  w.set(g[0] + 2, G + g[2] + 3, g[1] + 1, B.RED);
  w.set(g[0] + 1, G + g[2] + 4, g[1] + 1, B.LAMP);
  const st = list[0];
  w.fill(st[0] - 1, G, st[1] - 1, st[0] + st[3], G, st[1] + st[3], B.WHITE);           // Startfeld am Boden
  w.fill(st[0] + 1, G, st[1] + st[3] + 1, st[0] + 2, G, 35, w.pathBlock);            // Weg nach Süden zum Hauptweg
  return { x0: st[0] - 2, x1: st[0] + st[3] + 1, z0: st[1] - 2, z1: st[1] + st[3] + 2, cx: st[0] + 1, cz: st[1] + 1, door: 'S', signY: G + st[2] + 4, b: PARCOURS };
}

export function buildWorld(level = 1, worldId = 'te', opts = {}) {
  seed = worldId === 'dd' ? 54321 : 12345;
  const w = new World(SIZE, HEIGHT, SIZE);
  const isle = worldId === 'te';
  w.pathBlock = isle ? B.SANDSTONE : B.BLACK;
  // Gelände: Insel mit Wasser rundherum bzw. Stadt mit Neon-Hügeln am Rand
  for (let z = 0; z < SIZE; z++) for (let x = 0; x < SIZE; x++) {
    const edge = Math.min(x, z, SIZE - 1 - x, SIZE - 1 - z);
    w.fill(x, 0, z, x, 1, z, B.STONE); w.fill(x, 2, z, x, G - 1, z, B.DIRT);
    if (isle) { if (edge < 3) w.set(x, G - 1, z, B.WATER); else w.set(x, G, z, edge < 5 ? B.SANDSTONE : B.GRASS); }
    else { const top = edge < 4 ? G + (4 - edge) : G; w.fill(x, G, z, x, top - 1, z, B.DIRT); w.set(x, top, z, edge < 4 ? B.LIME : B.GRASS); }
  }
  // Hauptwege (in der Stadt mit weissen Mittelstreifen)
  w.fill(4, G, 35, SIZE - 5, G, 37, w.pathBlock);
  w.fill(35, G, 4, 37, G, SIZE - 5, w.pathBlock);
  if (!isle) for (let k = 5; k < SIZE - 5; k += 3) { w.set(k, G, 36, B.WHITE); w.set(36, G, k, B.WHITE); }
  // Platz mit Schachbrett und Brunnen
  for (let z = 32; z <= 40; z++) for (let x = 32; x <= 40; x++) w.set(x, G, z, (x + z) % 2 ? B.WHITE : isle ? B.SKY : B.PINK);
  w.fill(34, G + 1, 34, 38, G + 1, 38, B.WHITE); w.fill(35, G + 1, 35, 37, G + 1, 37, B.WATER);

  const meta = {};
  for (const b of BUILDINGS.filter(x => x.lu === WORLDS[worldId].lu)) {
    const [cx, cz, door] = SPOTS[worldId][b.id];
    const col = B[b.color] ?? B.WHITE, accent = col === B.WHITE ? B.BLACK : B.WHITE;
    const r = building(w, cx, cz, door, col, accent, isle ? B.SKY : B.MAGENTA, isle ? B.WHITE : B.SKY);
    // Pult mit Aufgabenkarte
    const tz = door === 'S' ? r.z0 + 2 : r.z1 - 2, side = col === B.WHITE ? B.BLACK : col;
    w.set(cx, G + 1, tz, B.GOLD); w.set(cx - 1, G + 1, tz, side); w.set(cx + 1, G + 1, tz, side);
    meta[b.id] = { ...r, cx, cz, door, b };
  }
  {
    const { x, z } = LEVEL_TOWER;
    const r = building(w, x, z, 'S', B.GOLD, B.WHITE, B.YELLOW, B.WHITE, 9, 3);
    meta.level = { ...r, cx: x, cz: z, door: 'S', b: LEVEL_TOWER };
  }
  setFamePillar(w, level, opts.top);
  meta.boss = { ...arena(w), b: ARENA };
  {
    const { x, z } = CLASS_TOWER;
    w.fill(x - 3, G, z - 3, x + 3, G, z + 3, B.WHITE); w.fill(x - 2, G + 1, z - 2, x + 2, G + 1, z + 2, B.SKY);
    w.fill(x, G, z - 4, x + 1, G, 38, w.pathBlock);
    const top = setClassTower(w, opts.classStage || 0);
    meta.klasse = { x0: x - 4, x1: x + 3, z0: z - 4, z1: z + 3, cx: x, cz: z, door: 'S', signY: top + 2, b: CLASS_TOWER };
  }
  meta.parcours = course(w, worldId);
  if (isle) { w.fill(60, G, 58, 66, G, 63, B.WATER); w.fill(61, G, 57, 65, G, 57, B.WATER); }
  // Bäume bzw. Diagramm-Skulpturen
  const busy = (x, z) => {
    if (Math.abs(x - 36) < 9 && Math.abs(z - 36) < 9) return true;
    if (Math.abs(z - 36) < 4 || Math.abs(x - 36) < 4) return true;
    for (const m of Object.values(meta)) if (x > m.x0 - 4 && x < m.x1 + 4 && z > m.z0 - 4 && z < m.z1 + 4) return true;
    if (x < 31 && z < 23) return true;
    if (x < 13 && z < 36) return true;                                                                       // Weg zum Parcours                                                                       // Parcours
    if (x > 57 && z > 54 && x < 69 && z < 66) return true;
    if (x > ARENA.x - ARENA.r - 3 && z > ARENA.z - ARENA.r - 3 && z < ARENA.z + ARENA.r + 3) return true;
    if (x > 36 && Math.abs(z - ARENA.z) < 4) return true;
    if (Math.abs(x - CLASS_TOWER.x) < 7 && Math.abs(z - CLASS_TOWER.z) < 7) return true;
    if (Math.abs(x - CLASS_TOWER.x) < 4 && z > 36 && z < CLASS_TOWER.z) return true;
    return x < 7 || z < 7 || x > SIZE - 8 || z > SIZE - 8;
  };
  for (let i = 0; i < (isle ? 70 : 45); i++) {
    const x = 6 + Math.floor(rnd() * (SIZE - 12)), z = 6 + Math.floor(rnd() * (SIZE - 12));
    if (busy(x, z) || w.get(x, G + 1, z) !== B.AIR) continue;
    if (isle || i % 3) tree(w, x, z); else if (!busy(x + 4, z)) barSculpture(w, x, z);
  }
  // Lampen entlang der Wege
  for (let k = 8; k < SIZE - 8; k += 8) {
    if (Math.abs(k - 36) < 8) continue;
    w.fill(k, G + 1, 34, k, G + 2, 34, B.WHITE); w.set(k, G + 3, 34, B.LAMP);
    if (k < 15 || k > 28) { w.fill(34, G + 1, k, 34, G + 2, k, B.WHITE); w.set(34, G + 3, k, B.LAMP); }
  }
  return { world: w, meta };
}

// Spitze der Säule aus dem Shop
const TOPS = { top_kristall: B.CYAN, top_flamme: B.ORANGE };
export function setFamePillar(w, level, top = null) {
  const x = 36, z = 36;
  w.fill(x, G + 2, z, x, HEIGHT - 1, z, B.AIR);
  const h = Math.min(level, HEIGHT - G - 4);
  w.fill(x, G + 2, z, x, G + 1 + h, z, B.GOLD);
  w.set(x, G + 2 + h, z, TOPS[top] ?? B.LAMP);
}

// Klassen-Turm: wächst um 2 Blöcke pro Stufe (0–10), bunt gestreift, ganz oben ein Licht
export function setClassTower(w, stage) {
  const { x, z } = CLASS_TOWER;
  const cols = [B.MAGENTA, B.CYAN, B.YELLOW, B.LIME, B.ORANGE];
  w.fill(x - 1, G + 2, z - 1, x + 1, HEIGHT - 1, z + 1, B.AIR);
  for (let k = 0; k < stage; k++) w.fill(x - 1, G + 2 + 2 * k, z - 1, x + 1, G + 3 + 2 * k, z + 1, cols[k % cols.length]);
  const top = G + 2 + 2 * stage;
  if (stage >= 10) { w.fill(x - 1, top - 1, z - 1, x + 1, top - 1, z + 1, B.GOLD); w.set(x, top - 1, z, B.LAMP); }
  else w.set(x, top, z, B.LAMP);
  return top;
}

// In welchem Gebäude steht die Spielfigur?
export function buildingAt(meta, px, pz) {
  for (const [id, m] of Object.entries(meta)) {
    if (px > m.x0 + 1 && px < m.x1 && pz > m.z0 + 1 && pz < m.z1) return id;
  }
  return null;
}
