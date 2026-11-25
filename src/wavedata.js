// Datengetriebene Wellen-Definition v2 (Balancing-Pass).
// Jede Welle ist eine Liste von Gegner-Typschluesseln (src/enemies.js).
// Fix: Boss jede 10. Welle (Mech-Drache), Perk-Wahl alle 5 Wellen, 100 Wellen pro Level.
//
// Kern-Idee v2: Jede Welle folgt einem WELLEN-BILD (Schwarm / Jagdtrupp /
// Elite-Vorstoss / Boss-Welle) im 10er-Rhythmus. So bleiben die 100 Wellen
// fuehlbar verschieden, statt eine Zufallssuppe mit wachsender Menge zu sein.
// Rollen: chaff = Masse, fast = Flanker, elite = Tank (siehe ROSTER).
// Kurve + Zahlen: docs/BALANCING.md

import { ENEMY_TYPES } from './enemies.js';

export const MAX_WAVES = 100;
export const SPEED_STEPS = [1, 2, 3, 5];

// Rolle + Freischaltwelle + Gewichtung im Pool
const ROSTER = {
  skelett:       { role: 'chaff', unlock: 1,  weight: 1.0 },
  schattenwolf:  { role: 'fast',  unlock: 10, weight: 0.7 },
  pirat:         { role: 'chaff', unlock: 12, weight: 0.9 },
  gargoyle:      { role: 'fast',  unlock: 18, weight: 0.6 },
  ritter:        { role: 'elite', unlock: 20, weight: 0.5 },
  geist:         { role: 'fast',  unlock: 25, weight: 0.8 },
  krieger:       { role: 'elite', unlock: 30, weight: 0.5 },
  hammer:        { role: 'elite', unlock: 40, weight: 0.4 },
  golem:         { role: 'elite', unlock: 50, weight: 0.3 },
  knochenkoloss: { role: 'elite', unlock: 65, weight: 0.25 },
};

// Debuet-Wellen: ein neuer Typ erscheint garantiert in nennbarer Zahl
const DEBUTS = {
  10: 'schattenwolf', 12: 'pirat', 18: 'gargoyle', 20: 'ritter', 25: 'geist',
  30: 'krieger', 40: 'hammer', 50: 'golem', 65: 'knochenkoloss',
};

// Pool zu einer Welle: nur Typen der gewuenschten Rollen (Fallback: alle freigeschalteten)
function poolFor(n, roles) {
  let pool = [];
  for (const key of Object.keys(ROSTER)) {
    const cfg = ROSTER[key];
    if (n >= cfg.unlock && roles.includes(cfg.role)) pool.push(key);
  }
  if (pool.length === 0) {
    pool = Object.keys(ROSTER).filter((k) => n >= ROSTER[k].unlock);
  }
  return pool;
}

function weightedPick(pool) {
  let total = 0;
  for (const k of pool) total += ROSTER[k].weight;
  let r = Math.random() * total;
  for (let i = 0; i < pool.length; i++) {
    r -= ROSTER[pool[i]].weight;
    if (r <= 0) return pool[i];
  }
  return pool[pool.length - 1];
}

export function generateWave(n) {
  const isBoss = n % 10 === 0;
  const enemies = [];
  let label = '';
  let spawnInterval = 0.5;

  if (isBoss) {
    // Boss-Welle: kleine Begleitung aus Massen-Flankern, der Drache ist die Show
    const escort = Math.min(24, 6 + Math.floor(n / 8));
    label = 'Boss-Welle';
    spawnInterval = 0.6;
    const pool = poolFor(n, ['chaff', 'fast']);
    for (let i = 0; i < escort; i++) enemies.push(weightedPick(pool));
    // Drachen-Eskalation: 1 ab W10, 2 ab W40, 3 ab W80, 4 ab NG+ W80 (Welle 180)
    const dragons = n >= 180 ? 4 : (n >= 80 ? 3 : (n >= 40 ? 2 : 1));
    for (let i = 0; i < dragons; i++) enemies.push('drache');
    return { n, isBoss, label, spawnInterval, enemies };
  }

  // Wellen-Bild im 10er-Rhythmus: 1-2 Schwarm, 3-4 Jagd, 5 Perk-Welle,
  // 6-7 gemischt, 8-9 Elite, 10 Boss
  const t = n % 10;
  let total = 5 + Math.floor(n * 0.55);
  let roles = ['chaff', 'fast', 'elite'];
  if (t === 1 || t === 2) {
    total = Math.round(total * 1.2); roles = ['chaff']; label = 'Schwarm-Ansturm'; spawnInterval = 0.45;
  } else if (t === 3 || t === 4) {
    total = Math.round(total * 0.9); roles = ['fast']; label = 'Jagdtrupp'; spawnInterval = 0.35;
  } else if (t === 8 || t === 9) {
    total = Math.round(total * 0.6); roles = ['elite', 'chaff']; label = 'Elite-Vorstoss'; spawnInterval = 0.7;
  } else {
    label = 'Gemischter Trupp';
  }
  total = Math.min(total, 52); // Performance-Obergrenze (80-Gegner-Budget, Rest ist Puffer)

  const pool = poolFor(n, roles);
  for (let i = 0; i < total; i++) enemies.push(weightedPick(pool));

  // Debuet: neuer Typ erscheint garantiert, damit man die Freischaltung ERLEBT
  const debut = DEBUTS[n];
  if (debut) {
    const extra = Math.max(3, Math.floor(total * 0.3));
    for (let i = 0; i < extra; i++) enemies.push(debut);
    label = 'Debuet: ' + (ENEMY_TYPES[debut] ? ENEMY_TYPES[debut].name : debut);
  }

  if (n >= 96 && !isBoss) label = 'Endspiel vor dem Endboss';

  return { n, isBoss, label, spawnInterval, enemies };
}
