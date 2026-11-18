// Datengetriebene Wellen-Definition (Platzhalter-Balancing).
// Jede Welle ist eine Liste von Gegner-Typschluesseln (src/enemies.js).
// Fix: Boss jede 10. Welle (Mech-Drache), Perk-Wahl alle 5 Wellen, 100 Wellen pro Level.

export const MAX_WAVES = 100;
export const SPEED_STEPS = [1, 2, 3, 5];

// Fruehere Typen im Pool bleiben haeufiger ( sinkende Gewichte nach hinten).
function weightedPick(pool) {
  const total = (pool.length * (pool.length + 1)) / 2;
  let r = Math.random() * total;
  for (let i = 0; i < pool.length; i++) {
    r -= pool.length - i;
    if (r <= 0) return pool[i];
  }
  return pool[pool.length - 1];
}

export function generateWave(n) {
  const isBoss = n % 10 === 0;
  const enemies = [];
  const total = isBoss ? 16 + Math.floor(n / 6) : 6 + Math.floor(n * 0.7);

  // progressive Freischaltung des Rosters
  const pool = ['skelett'];
  if (n >= 12) pool.push('pirat');
  if (n >= 20) pool.push('ritter');
  if (n >= 25) pool.push('geist');
  if (n >= 30) pool.push('krieger');
  if (n >= 40) pool.push('hammer');
  if (n >= 50) pool.push('golem');

  for (let i = 0; i < total; i++) {
    enemies.push(weightedPick(pool));
  }
  if (isBoss) {
    enemies.push('drache');
    // ab Boss-Wellen 40+ ziehen mehrere Drachen ins Feld
    if (n >= 40) enemies.push('drache');
  }
  return { n, isBoss, enemies };
}
