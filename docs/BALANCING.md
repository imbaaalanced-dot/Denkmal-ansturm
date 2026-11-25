# Balancing v2 - Wellen (L01)

Stand: 22.11.2026, Umsetzung in src/wavedata.js + src/game.js.

## Wellen-Bilder (10er-Rhythmus)

| Wellen modulo 10 | Bild | Rolle im Pool | Menge | Spawn-Abstand |
| --- | --- | --- | --- | --- |
| 1-2 | Schwarm-Ansturm | chaff | x1.2 | 0.45 s |
| 3-4 | Jagdtrupp | fast | x0.9 | 0.35 s (schnelle Dauerbelastung) |
| 5 | (Perk-Welle, gemischt) | alle | x1.0 | 0.50 s |
| 6-7 | Gemischter Trupp | alle | x1.0 | 0.50 s |
| 8-9 | Elite-Vorstoss | elite + chaff | x0.6 | 0.70 s |
| 0 | Boss-Welle | chaff + fast (Begleitung) | 6 + n/8, max 24 | 0.60 s |

Basis-Menge: 5 + floor(n x 0.55), Deckel bei 52 (Performance-Budget: 80 Gegner geplant).

## Gegner-Rollen (src/wavedata.js ROSTER)

- chaff: skelett (W1), pirat (W12), geist (W25)
- fast: schattenwolf (W10), gargoyle (W18), geist (W25)
- elite: ritter (W20), krieger (W30), hammer (W40), golem (W50), knochenkoloss (W65)
- Gewichte im Pool sinken mit der Staerke des Typs (Koloss 0.25 vs. Skelett 1.0).

## Debuet-Garantie

An der Freischalt-Welle (10/12/18/20/25/30/40/50/65) erscheint der neue Typ
garantiert in nennbarer Zahl (min. 3, bzw. 30 % der Welle) und das Banner nennt
das Debuet. Der Spieler ERLEBT die Freischaltung, statt sie zufaellig zu verpassen.

## Boss-Eskalation

- 1 Mech-Drache: Welle 10-30
- 2 Mech-Drachen: Welle 40-70
- 3 Mech-Drachen: Welle 80-100 (Endboss-Gauntlet)
- Begleitung absichtlich klein (6 + n/8, max 24): Der Boss ist die Show.
- Wellen 96-99 heissen "Endspiel vor dem Endboss".

## Tuning-Massnahmen dieser Pass

- Schattenwolf: Kopfgeld 2 -> 3 (schnell + frueh = hoher Druck, belohnt Frostturm)
- Nebel-Geist: HP 3/0.4 -> 5/0.5 (war reines Gratis-Energie-Geschenk)
- Spawn-Abstand je Wellen-Bild statt fest 0.5 s: Jagdtrupps fuehlen sich schnell an,
  Eliten bedrohlich langsam wuchtig.

## Offene Balancing-Fragen (naechste Pass)

- HP-Kurve ist rein linear: Pruefen, ob Wellen 60+ mit gestapelten Perks zu leicht werden
  (Kandidat: sanfter HP-Multiplikator ab W40 in game.js spawnEnemy)
- Energie-Ersparnis pruefen: Wellen-Belohnung 12 + n/2 wirkt grosszuegig gegenueber
  Denkmal-Upgrade-Kosten x1.6 je Stufe
- Boss-Begleitung bei fuenf Rollover-Runs messen (Laufzeiten, Leaks, LP-Verlust je Welle)
- Wellen 1-5: gefuehlte Dauer checken (Ziel: unter 45 s bei x1)


## New Game+ (implementiert)

- Nach jedem vollen Zyklus (100 Wellen) erreicht der Run den Zustand 'won'.
  Der bisherige Sieg-Checkpoint bleibt liegen (kein clearRun mehr).
- Der State-Button zeigt 'New Game+' und startet den naechsten Zyklus:
  Wellenzaehler laeuft weiter (101, 102 ...), ANGEZEIGT wird die Welle im Zyklus
  (displayWave = wave - 100 x ngPlus), z. B. 'NG+1 Welle 23/100'.
- Skalierung PRO Zyklus (multiplikativ, stapelt sich bei weiteren Durchgaengen):
  - Gegner-HP: x2
  - Gegner-Tempo: +15 %
  - Gegner-Schaden am Denkmal: x1.5
  - Wellen-Belohnung, Kopfgeld und Welle-100-Loesung: unverstaerkt (bewusst: NG+
    ist Prestige, kein Faehigkeits-Grind)
- Bosse: bossIndex bleibt auf 10 gecappt (Wachstum, HP- und Schadens-Bonus des
  Bosses stoppen bei<GamepadEvent>tueglichem Maximum); dafuer erscheinen ab NG+ W80
  (Welle 180) vier Mech-Drachen pro Boss-Welle.
- Perk-Wahl laeuft weiter (alle 5 Wellen im Zyklus), Ehrenplatz-Perk bleibt
  einmalig ueber alle Zyklen (max 1 gilt run-global).
