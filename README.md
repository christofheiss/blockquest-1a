# BlockQuest 1A

Ein Lernspiel in einer bunten 3D-Blockwelt für die 1. Sek (Klasse 1A, Niveau A, 16 SuS), aufgebaut auf **mathbuch 1, Thema J «Terme umformen» (S. 54–59)** und **Thema K «Daten und Diagramme» (S. 60–65)**. Praktikum Januar 2027, 4 Wochen, 19 Lektionen, Abschlussprüfung in L19.

Die Schülerinnen und Schüler steuern eine eigene Block-Figur durch zwei Welten, betreten Stationen und lösen dort Aufgaben. Für richtige Lösungen gibt es Coins. Damit kaufen sie im Level-Turm ein höheres Level oder im Shop etwas fürs Aussehen der Figur. Pro Welt gibt es einen Hindernis-Parcours und einen Boss, der nur mit Aufgaben besiegt wird.

- **Spiel:** `index.html`
- **Lern-App ohne 3D-Welt:** `app.html` (gleiche Aufgaben und gleiches Konto, als Web-App installierbar)
- **Masterview für die Lehrperson:** `lehrer.html` (nur mit Dongle-Datei und Passwort)
- **Einrichtung:** `setup.html` (Schlüssel, Codes, Dongle, Token-Karten; nur lokal benutzen)

Alle Figuren, Grafiken und Welten sind selbst gezeichnet (prozedural). Es gibt keine Namen, Logos, Figuren oder Inhalte aus anderen Spielen.

## Welten und Stationen

| Thema | Welt | Station | Lernziel | mathbuch 1 |
|---|---|---|---|---|
| J | Terme-Insel | Meter-Werkstatt | LZ1 gleichartige Glieder zusammenfassen | S. 54 A1 B, C · Prüfung A1 |
| J | Terme-Insel | Klammer-Brücke | LZ1 · LZ4 Klammerregeln bei + und −, mit Zahlen prüfen | S. 55 A2 A |
| J | Terme-Insel | Distributiv-Fabrik | LZ3 ausmultiplizieren, (a + b)(c + d), ausklammern | S. 55 A2 B, C · Prüfung A2 |
| J | Terme-Insel | Flächen-Atelier | LZ3 Umfang und Fläche als Produkt- und Summenterm | S. 56 A3, S. 57 A4 B, C |
| J | Terme-Insel | Würfel-Arena | LZ2 Werte einsetzen (Termkarten «Terme würfeln») | S. 58 A5 · Prüfung A3 |
| J | Terme-Insel | Prüf-Labor | LZ4 gleichwertige Terme, Fehler finden, magisches Quadrat | S. 57 A4 A, S. 59 A6 · Prüfung A4, A5 |
| K | Daten-Stadt | Papierkugel-Stadion | LZ5 Minimum, Maximum, Mittelwert, Median | S. 60 A1 |
| K | Daten-Stadt | Sortier-Lager | LZ6 Strichliste, Klassen, passendes Diagramm, Kreiswinkel | S. 61 A2, S. 63 A4 B · Prüfung A7 |
| K | Daten-Stadt | Schokolinsen-Markt | LZ7 absolute und relative Häufigkeit | S. 62 A3 · Prüfung A8 |
| K | Daten-Stadt | Diagramm-Galerie | LZ5 Säulen- und Kreisdiagramme lesen, Aussagen prüfen | S. 63 A4 A · Prüfung A6 |
| K | Daten-Stadt | Bildschirmzeit-Studio | LZ5 · LZ8 Diagramme vergleichen | S. 64 A5 B, C |
| K | Daten-Stadt | Faktencheck-Redaktion | LZ8 irreführende Diagramme, kritische Fragen, kcal/kJ | S. 65 A6 · Zusatz-AB · Prüfung A9, A10 |

Lernziele: LZ1 gleichartige Glieder, LZ2 Werte einsetzen, LZ3 Distributivgesetz, LZ4 Umformungen durch Einsetzen prüfen, LZ5 Diagramme lesen und auswerten, LZ6 Daten ordnen und Diagramme erstellen, LZ7 absolut und relativ, LZ8 Aussagen prüfen und kritische Fragen stellen.

**Terme eintippen:** `3a + 2b`, `a^2` oder `a2` für a², `4(a + b)`. Das Spiel prüft durch Einsetzen, ob der Term gleichwertig ist. Steht «vereinfache» oder «Summenterm», braucht es zusätzlich die kürzeste Form ohne Klammern. Sonst meldet das Spiel «gleichwertig, aber noch nicht vereinfacht».

## Lernziele und Kriterienraster

In der Lern-App unter **Ziele** und im Spiel mit dem Knopf **Ziele** (Taste <kbd>Z</kbd>) gibt es pro Thema (J und K) eine eigene Seite: die vier Lernziele als «Ich kann …»-Sätze mit Beispiel, das Kriterienraster der Prüfung (Aufgaben, Kriterium, Punkte) und zu jedem Punkt die passenden Stationen zum Üben. Eine Ampel zeigt den eigenen Stand: grün = Abzeichen geschafft, gelb = schon geübt, rot = noch nicht geübt. Quelle: Unterrichtsauftrag Mt1A (Kompetenzen, Kriterienraster). Inhalte in `js/goals.js`.

## Binnendifferenzierung

Jede Station hat drei Niveaus: ★ Grundanspruch (5 Coins), ★★ Standard (10 Coins), ★★★ Erweiterung (20 Coins). Die Erweiterung öffnet sich nach 3 richtig gelösten Standard-Aufgaben. Das Spiel empfiehlt ein Niveau: nach 3 richtigen Aufgaben eines höher, nach 2 falschen eines tiefer. Lösungshilfen und zweite Versuche geben die halbe Belohnung. Die Aufgaben werden zufällig erzeugt, es gibt also beliebig viele.

## Belohnungen

- **Coins** wie oben. Wer auf ★ bleibt, obwohl das Spiel schon ★★ empfiehlt, bekommt nur 40 %.
- **Kontroll-Bonus (LZ4):** Nach einem richtig vereinfachten Term setzt man Zahlen ein und gibt den Wert an: +2 Coins.
- **Abzeichen pro Lernziel:** 5 Aufgaben ab ★★ im ersten Versuch ohne Lösungshilfe (+15 Coins). Gold: 3 davon auf ★★★ (+25 Coins).
- **Shop:** nur fürs Aussehen der Figur (Shirts, Hosen, Hüte, Begleiter, Spitze der goldenen Säule).
- **Parcours:** Wer in einer Welt bis zur Fahne springt, bekommt einen Hut, den man nicht kaufen kann (Terme-Helm bzw. Daten-Antenne). Coins gibt es dort keine.
- **Klassen-Turm:** Alle verdienten Coins der Klasse bauen gemeinsam an einem Turm (10 Stufen à 800 Coins). Die Lehrperson überträgt die Summe in der Masterview. Eine Rangliste gibt es bewusst nicht.

## Boss-Kampf

| Boss | Phase 1 | Phase 2 | Phase 3 |
|---|---|---|---|
| Klammer-Koloss (Terme-Insel) | Glieder-Lawine: Meter-Werkstatt, Würfel-Arena | Klammer-Panzer: Klammer-Brücke, Distributiv-Fabrik | Trick-Spiegel: Flächen-Atelier, Prüf-Labor |
| Zerr-Orakel (Daten-Stadt) | Zahlen-Nebel: Papierkugel-Stadion, Sortier-Lager | Anteil-Strudel: Schokolinsen-Markt, Diagramm-Galerie | Zerr-Diagramme: Bildschirmzeit-Studio, Faktencheck-Redaktion |

90 Lebenspunkte, Schaden ★ 10 / ★★ 15 / ★★★ 20 (halb mit Hilfe oder im 2. Versuch). Eine falsche Antwort gibt dem Boss einen Schild (+5). Niemand verliert etwas. Sieg: 50 Coins beim ersten Mal, danach 10. Der Boss erwacht, wenn die Lehrperson ihn weckt, oder für ein Kind ab 3 Abzeichen der Welt. Die Masterview zeigt richtig/falsch pro Phase und Kind, das hilft bei der Repetition in L18.

## Freigabeplan nach Lektionen

Die Übungen laufen in BlockQuest, die Prüfungen in Microsoft Forms: **Prüfung Thema J in L8**, **Prüfung Thema K in L19** (A7 Liniendiagramm auf Papier). Die Verbindung Lektion → mathbuch → Station steht auch in `Mathbuch_Zuordnung_Mt1A_BlockQuest.docx`.

Vor L1 in der Masterview: «Alles zurücksetzen», Terme-Insel offen mit nur der Meter-Werkstatt (übrige Stationen sperren), Daten-Stadt gesperrt, beide Bosse schlafen. Token-Karten austeilen.

| Woche / Lektion | Unterricht (mathbuch 1) | Übung in BlockQuest · Masterview |
|---|---|---|
| W1 Mo L1–L2 | S. 54 A1 Meter füllen, gleichartige Glieder | Anmeldung testen · Meter-Werkstatt |
| W1 Mi L3 | S. 55 A2 A Klammerregeln | Klammer-Brücke öffnen |
| W1 Do L4–L5 | S. 55 A2 B Distributivgesetz · S. 56 A3 Flächen | Distributiv-Fabrik · Flächen-Atelier öffnen |
| W2 Mo L6–L7 | S. 57 A4 gleichwertige Terme · S. 58 A5 Terme würfeln, Repetition J | Prüf-Labor · Würfel-Arena öffnen, **Klammer-Koloss wecken** |
| W2 Mi L8 | **Prüfung Thema J (Forms)** | vorher Terme-Insel sperren, danach öffnen; CSV sichern |
| W2 Do L9–L10 | S. 60 A1 Papierkugeln, Mittelwert, Median | nach L9 Welt **Daten-Stadt** öffnen: Papierkugel-Stadion |
| W3 Mo L11–L12 | S. 61 A2 Klassieren · S. 62 A3 Schokolinsen | Sortier-Lager · Schokolinsen-Markt öffnen |
| W3 Mi L13 | S. 63 A4 A Diagramme interpretieren | Diagramm-Galerie öffnen |
| W3 Do L14–L15 | S. 63 A4 B Diagramme erstellen · Zusatz-AB Linien-/Balkendiagramm | Sortier-Lager ★★–★★★ (Kreiswinkel, Diagrammtyp) |
| W4 Mo L16–L17 | S. 64 A5 Bildschirmzeit · S. 65 A6 + irreführende Diagramme | Bildschirmzeit-Studio · Faktencheck-Redaktion öffnen, **Zerr-Orakel wecken** |
| W4 Mi L18 | Repetition Thema K, Übungsprüfung | Boss-Statistik → Stationen zuteilen |
| W4 Do L19 | **Prüfung Thema K (Forms + A7 Papier)** | vorher Daten-Stadt sperren; CSV exportieren |
| W4 Do L20 | Besprechung Prüfung J, Reflexion, Feedback | beide Welten offen; nach dem Praktikum «Alles zurücksetzen» |

Nach jeder Lektion: «Online-Spielstände laden» → «Klassen-Coins übertragen».

## Datenschutz und Sicherheit

- Anmeldung nur mit **ID** (z. B. 1A07) und persönlichem Code. Namen gibt es nur im Dongle der Lehrperson.
- Der Spielstand ist verschlüsselt: lokal im Browser und beim Klick auf «Speichern» über einen Cloudflare Worker in einem privaten GitHub-Repo (`worker/README.md`). Bei einem Fehler wird er als Datei (`.bq1a`) heruntergeladen.
- Jede Datei ist zweimal lesbar: mit dem Code des Kindes und mit dem öffentlichen Schlüssel der Lehrperson. Nur mit **Dongle-Datei und Passwort** öffnet die Masterview die Daten.
- Im Repo liegen nur der öffentliche Schlüssel und Prüfwerte der Codes (`js/config.js`). Dongle, Codeliste und Token-Karten **nie** hochladen.

## Einrichtung (kurz)

1. Lokal starten: `python3 -m http.server 8765` im Ordner `blockquest-1a`, dann `http://localhost:8765/setup.html`.
2. Passwort wählen, erzeugen, alle vier Dateien herunterladen. `config.js` ersetzt `js/config.js`. Dongle, Codeliste und Token-Karten nach OneDrive `2_PRIVAT_nicht_hochladen`.
3. GitHub-Repos und Cloudflare Worker: siehe `worker/README.md` und die Vorlage `Prompt_Neues_Lernspiel_Speicherung_Verwaltung.md`, Teil B.

Die aktuelle `js/config.js` (erzeugt am 10.11.2026) passt zum Dongle in OneDrive. **Nicht überschreiben**, sonst funktionieren die verteilten Karten nicht mehr.

## Technik

Reines HTML, CSS und JavaScript (ES-Module), keine externen Bibliotheken, kein Build-Schritt: eigene WebGL-Blockgrafik, eigener QR-Code- und PDF-Erzeuger, Web Crypto API. Läuft in aktuellen Browsern auf Laptops (Tastatur, Touchpad) und auf dem iPad (Joystick und Springen-Knopf). Prüfung aller Aufgaben-Generatoren im Browser: `tools/check.html`.
