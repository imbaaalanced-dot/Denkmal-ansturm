// Roguelite-Perks: Nach jeder 5. Welle waehlt der Spieler 1 aus 3 Staerken.
// Perks wirken sofort und stacken bis zu ihrer max-Stufe (Platzhalter-Balancing).

export const PERK_POOL = [
  { id: 'klinge', icon: '⚔️', name: 'Wächter-Klinge', desc: '+25 % Schaden aller Türme', max: 5,
    apply(g) { g.perk.dmgMul *= 1.25; } },
  { id: 'bolzen', icon: '🏹', name: 'Eiliger Bolzen', desc: '+20 % Feuerrate aller Türme', max: 5,
    apply(g) { g.perk.rateMul *= 1.2; } },
  { id: 'augen', icon: '👁️', name: 'Wachsame Augen', desc: '+20 % Reichweite aller Türme', max: 4,
    apply(g) { g.perk.rangeMul *= 1.2; } },
  { id: 'beute', icon: '💰', name: 'Kriegsbeute', desc: '+30 % Kopfgeld pro Gegner', max: 4,
    apply(g) { g.perk.bountyMul *= 1.3; } },
  { id: 'zins', icon: '⚡', name: 'Energiesegen', desc: '+8 Bonus-Energie pro geschaffter Welle', max: 4,
    apply(g) { g.perk.waveBonus += 8; } },
  { id: 'steinhaut', icon: '🛡️', name: 'Steinhaut', desc: 'Der Löwe heilt sofort 120 LP', max: 99,
    apply(g) { g.hp = Math.min(g.maxHp, g.hp + 120); } },
  { id: 'frost', icon: '❄️', name: 'Frosthauch', desc: 'Treffer verlangsamen Gegner im Umkreis 2 s (−25 % Tempo)', max: 2,
    apply(g) { g.perk.slow = Math.min(0.45, g.perk.slow + 0.25); g.perk.slowDur = 2; } },
  { id: 'splash', icon: '💥', name: 'Sprengbolzen', desc: 'Treffer wirken auf alle Gegner im Umkreis (Radius wächst)', max: 2,
    apply(g) { g.perk.splash = true; g.perk.splashRadius += 1.3; } },
  { id: 'krit', icon: '🎯', name: 'Schwachstelle', desc: '+20 % Chance auf doppelten Schaden', max: 2,
    apply(g) { g.perk.crit += 0.2; } },
];

// 3 zufaellige, unterschiedliche Optionen unter Beachtung der max-Stufen.
export function rollPerkOptions(chosen) {
  const counts = {};
  for (const id of chosen) counts[id] = (counts[id] || 0) + 1;
  const pool = PERK_POOL.filter((p) => (counts[p.id] || 0) < p.max);
  const options = [];
  while (options.length < 3 && pool.length > 0) {
    const i = Math.floor(Math.random() * pool.length);
    options.push(pool.splice(i, 1)[0]);
  }
  return options;
}
