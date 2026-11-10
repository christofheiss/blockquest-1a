# BlockQuest 1A – Kontext für Claude Code

Lernspiel für die Klasse 1A (Sek 1, Niveau A, 16 SuS), Schule Neuenkirch, Schulhaus Sonneweid, Profilpraktikum PH Luzern im Januar 2027 (PL Roger Behrens).
Autor/Lehrperson: Christof Heiss. Inhalt: **mathbuch 1 (Klett), LU 10 «Terme umformen» (J, S. 54–59) und LU 11 «Daten und Diagramme» (K, S. 60–65)**. Reihenfolge: LU 10 in L1–L8, LU 11 in L9–L17, Repetition L18, Abschlussprüfung L19 (Freigabeplan im README).
Sprache der Oberfläche: **Deutsch (Schweiz, kein ß)**, Dezimalpunkt wie im mathbuch. Zielgeräte: Laptops (Tastatur, Touchpad), auch iPad.
Übernommen und angepasst aus **MathWelt 3A** (`../../Mathe_3a/mathwelt-3a`): Speicherung, Codes, Masterview, Worker. Dort erprobt, nicht neu erfinden.

## Anforderungen der Lehrperson
- 3D-Welt mit eigenen, bunten Block-Figuren, Hindernis-Parcours, Kunststoff- und Neonfarben. **Keine fremden Marken oder Inhalte** (keine Namen, Logos, Figuren, Töne anderer Spiele). Alles prozedural gezeichnet.
- Stationen mit Aufgaben, Coins, Level, Shop nur fürs Aussehen, Boss pro Welt, Klassenbauwerk, keine Rangliste.
- Binnendifferenzierung (3 Niveaus), Lösungshilfe, Masterview mit digitalem Dongle, Token pro Kind, nur pseudonyme IDs.
- Hosting auf **GitHub Pages**, Speichern über Cloudflare Worker in privates Repo `blockquest-1a-daten`.

## Architektur (reines HTML/CSS/ES-Module, keine Abhängigkeiten, kein Build-Schritt)
| Datei | Inhalt |
|---|---|
| `index.html`, `css/style.css` | Spiel: Login, Weltauswahl, HUD, Aufgaben-Panel, Level-Turm/Shop, Karte, Hilfe, Tablet-Steuerung (`#touch`) |
| `js/engine.js` | WebGL-Block-Engine: Blocktypen `B` (inkl. LIME, MAGENTA, SKY, BLACK), prozeduraler Atlas mit Kunststoff-Optik, `Renderer` (`rebuild`, `drawBoxes`), `Player` (Kollision, Sprung, `camera(third)` mit 3.-Person-Kamera) |
| `js/models.js` | Figuren aus Quadern: `avatar(look, p)` (eigene Spielfigur mit Geh-Animation, Hüte), `defaultShirt(id)`, Bosse `golem` (Klammer-Koloss) und `oracle` (Zerr-Orakel), Begleiter `pet` |
| `js/world.js` | Zwei Welten 72×30×72: `te` Terme-Insel, `dd` Daten-Stadt. `SPOTS`, `COURSE` (Parcours, `courseGoal`, `courseStart`), `ARENA`, `CLASS_TOWER`, `LEVEL_TOWER`, `buildWorld`, `setFamePillar`, `setClassTower`, `buildingAt` |
| `js/tasks.js` | `BUILDINGS`: 12 Stationen mit `gen(stage)`. Aufgabe `{q, kind: 'num'|'mc'|'term'|'multi', …}`. `parseTerm`/`sameTerm` (Terme durch Einsetzen vergleichen), `checkPart` (bei `form: 'sum'` vereinfachte Form verlangt, Grund in `part._note`), Polynom-Helfer `P`, Diagramme `barImg`/`pieImg`/`lineImg`, Figuren `figSvg`, `WORLDS`, `STAGES` |
| `js/core.js` | Gemeinsame Regeln für Spiel und App: Level, Spielstand (`migrate`: badges, items, equip {pet, top, hat, shirt, pants}, parcours, probes, boss), `signIn`, Speichern, Freigabe, Empfehlung, `gradeTask` (liefert `note`), Kontroll-Bonus (`probe`/`probeAt`), `BADGES`, `SHOP`, `finishParcours`, `classInfo`. Regeln nur hier ändern |
| `js/game.js` | Spiel: Welt, Beschriftungen, HUD, Panels, Parcours-Erkennung, Kamera (V), Karte, Eingaben inkl. Touch. Auf localhost: `window.__bq` (player, S, teleport) für Tests |
| `js/boss.js` | `BOSSES` (te, dd), `Fight`, `mountFight`, `bossSvg` |
| `app.html`, `js/app.js`, `css/app.css` | Lern-App ohne 3D-Welt |
| `js/crypto.js` | Token, Hashes, PBKDF2, `sealSave`, `openSaveAs…`, Dongle, RSA |
| `js/config.js` | **öffentlich**: RSA-Public-Key, Token-Hashes, `saveUrl`, `dataRepo`, Standard-Freigabe `{ te: true, dd: false }` |
| `setup.html`, `js/setup.js`, `js/qr.js`, `js/cards.js` | Einrichtung im Browser ohne Node: `makeSetup` (Schlüssel, Codes, Dongle, config.js, CSV), eigener QR-Erzeuger (Byte-Modus, M, V1–10), Token-Karten als PDF (8 pro A4) |
| `lehrer.html`, `js/teacher.js`, `css/teacher.css` | Masterview |
| `worker/worker.js`, `worker/README.md` | Cloudflare Worker (`POST /`, `/load`, `GET /worlds`, `/worlds/challenge`, `POST /worlds`, `/reset`), `SWITCH_IDS` |
| `tools/check.html` | Prüft alle Generatoren im Browser (je Station und Niveau 300 Aufgaben) |

### Sicherheitsmodell (wie MathWelt 3A, IDs angepasst)
- Token `1A07-K7QM-X2PD-9HTR`, erste 4 Zeichen = ID. Hash `blockquest-1a|<normalisiert>` in `config.js`.
- Spielstand `.bq1a`: AES-GCM, Schlüssel einmal PBKDF2(Token), einmal RSA-OAEP. Klartext nur `app, v, id, saved, born`.
- Dongle `.bq1akey`: privater Schlüssel, Codes, Namen, Lese-Token, PBKDF2(Passwort, 150 000) + AES-GCM.
- Speicher-Schlüssel `blockquest1a_…`, `app: 'blockquest-1a'`. Nicht austauschbar mit MathWelt.

### Freigabe (`worlds.json`)
`te`, `dd`, Stationen (`glieder`, `klammer`, `distri`, `flaeche`, `wuerfel`, `pruef`, `mittel`, `klassen`, `linsen`, `diagramm`, `screen`, `fakten`), `boss_te`, `boss_dd`, `klasse`, `reset`. Neue Station → in `SWITCH_IDS` ergänzen.

### Spielregeln
Wie MathWelt 3A (Niveaus 5/10/20, halbe Coins mit Hilfe/2. Versuch, 40 % unter Empfehlung, Abzeichen 5 ab ★★ / Gold 3 auf ★★★, Boss 90 LP). Neu: Kontroll-Bonus +2 nach vereinfachtem Term; Parcours gibt pro Welt einmal einen Hut (`hat_te`, `hat_dd`, Log `b: 'parcours'`), keine Coins.

## Lokal starten und testen
```bash
python3 -m http.server 8765      # im Ordner blockquest-1a; dann /index.html, /app.html, /lehrer.html, /setup.html
```
- `http://localhost:8765/tools/check.html` → muss «Alle 10800 Aufgaben ok» zeigen.
- Der Browser hält `config.js` gern im Cache: nach Änderungen hart neu laden.
- Getestet (November 2026): Login, Aufgaben inkl. Term-Rückmeldung und Kontroll-Bonus, Diagramme, Parcours (Sprünge per Physik-Simulation erreichbar, Ziel-Erkennung), Shop, Boss-Kampf, Daten-Stadt, App, Masterview mit Test-Dongle, setup.html, QR-Code (mit BarcodeDetector gelesen) und PDF.

## Schlüssel und Codes
- Die aktuelle `js/config.js` (setup.html, 10.11.2026) ist die **produktive** Konfiguration und passt zu Christofs Dongle in OneDrive (`2_PRIVAT_nicht_hochladen`). **Nicht überschreiben.** Für Tests ein eigenes Set mit `makeSetup` im Browser erzeugen und die Datei danach zurücksetzen (`git checkout js/config.js`).
- Dongle, Codeliste, Token-Karten gehören in OneDrive `2_PRIVAT_nicht_hochladen`, nie ins Repo (`.gitignore`: `private/`, `*.bq1akey`, `*.bq1a`, Token-PDF).
- Node ist auf Christofs Mac nicht installiert: alles läuft im Browser.

## Offene Punkte
- GitHub-Repos `blockquest-1a` (öffentlich, Pages) und `blockquest-1a-daten` (privat) anlegen, Worker `blockquest-1a-save` einrichten (Vorlage Teil B). Vor dem Pushen Christof fragen.
- Datenschutz mit der Schule klären.
- Optional: Sound, gemeinsamer Klassen-Boss.
