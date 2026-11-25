# Türme (L01)

## Aufstellung

- Vor Welle 1 werden die 4 festen Plätze N/O/S/W besetzt (je genau ein Turm, danach fest).
- Ehrenplatz-Perk: 5. Platz im Nordost, auch mitten im Run bebaubar.
- **Kosten sind gestaffelt** – die Aufbau-Phase ist eine Wirtschafts-Entscheidung (Start: 60 Energie).

## Turmtypen (src/towers.js)

| Turm | Kosten | Schaden | Schüsse/s | Reichweite | Effekt |
|---|---|---|---|---|---|
| 🏹 Bolzenturm | 10 | 5 | 1/0.6 s | 8.5 | Einzelschuss, schnell |
| ❄️ Frostturm | 12 | 2 | 1/0.9 s | 6.5 | Slow 30 % für 1.5 s (Flug/schwere Elites nur halb so stark, `slowResist`) |
| 💥 Splitterturm | 14 | 6 | 1/1.2 s | 7 | 70 % Flächenschaden, Radius 1.8 |
| ⚡ Kettenblitz | 16 | 4 | 1/1.4 s | 7.5 | springt auf bis zu 2 weitere Ziele (Radius 3.2), je Sprung 70 % Schaden |

## Ausbau mitten im Run (Turm antippen)

- Panel pausiert die Simulation (Zustand `tower`), bezahlt wird mit Energie.
- 3 Upgrade-Werte, je max. 3 Stufen; Kosten = `Basis-Kosten × 1.8^Stufe`:
  - 🔥 Geschärft: +35 % Schaden pro Stufe
  - ⚡ Schnellfeuer: Feuerrate ×0.85 pro Stufe
  - 🎯 Weitsicht: +0.8 Reichweite pro Stufe
- **Verkauf:** 70 % (`SELL_REFUND`) der investierten Energie (Bau + Upgrades) zurück, Platz wird frei.
- Upgrades werden zur Schusszeit mit den globalen Perk-Multiplikatoren verrechnet und im Checkpoint gespeichert (`lv`, `spent` je Turm).

## Zielwahl

- Umschaltbar per 🎯-Button (oben): **Erster** am Denkmal (Standard, leak-sicher) → **Stärkster** (max. HP) → **Nächster** am Turm.
- Gespeichert im Checkpoint (`targetMode`).

## Technik

- `TOWER_TYPES` / `TOWER_UPGRADES` / `SELL_REFUND` in `src/towers.js` (datengetrieben).
- `Game.openTower/refreshTowerPanel/towerOffers/buyTowerUpgrade/sellTower` in `src/game.js`; HUD rendert nur DOM (`ui.js` `showTower`).
- Kettenblitz: Projektil trägt `chain`/`chainRadius`, der Treffer verteilt in `Game.update` weiteren Schaden auf die nächsten Gegner im Umkreis.
