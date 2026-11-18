// Datengetriebene Wellen-Definition (Platzhalter-Balancing).
// Wird pro Level durch echte Definitionen ersetzt (docs/ARCHITECTURE.md).
// Fix: Boss jede 10. Welle, Perk-Wahl alle 5 Wellen, 100 Wellen pro Level.

export const MAX_WAVES = 100;
export const SPEED_STEPS = [1, 2, 3, 5];

export function generateWave(n) {
  const isBoss = n % 10 === 0;
  const enemies = [];
  const count = isBoss ? 16 + Math.floor(n / 6) : 6 + Math.floor(n * 0.7);
  const hp = 3 + Math.floor(n * 0.8);
  const speed = 1.4 + n * 0.012;
  const dmg = 5 + Math.floor(n * 0.3);
  for (let i = 0; i < count; i++) enemies.push({ hp, speed, dmg });
  if (isBoss) enemies.push({ hp: 80 + n * 5, speed: 1.0, dmg: 120, boss: true });
  return { n, isBoss, enemies };
}
