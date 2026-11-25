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
  { id: 'steinhaut', icon: '🛡️', name: 'Steinhaut', desc: 'Der Löwe heilt sofort 120 LP', max: 5,
    apply(g) { g.hp = Math.min(g.maxHp, g.hp + 120); } },
  { id: 'frost', icon: '❄️', name: 'Frosthauch', desc: 'Treffer verlangsamen Gegner im Umkreis 2 s (−25 % Tempo)', max: 2,
    apply(g) { g.perk.slow = Math.min(0.45, g.perk.slow + 0.25); g.perk.slowDur = 2; } },
  { id: 'splash', icon: '💥', name: 'Sprengbolzen', desc: 'Treffer wirken auf alle Gegner im Umkreis (Radius wächst)', max: 2,
    apply(g) { g.perk.splash = true; g.perk.splashRadius += 1.3; } },
  { id: 'krit', icon: '🎯', name: 'Schwachstelle', desc: '+20 % Chance auf doppelten Schaden', max: 2,
    apply(g) { g.perk.crit += 0.2; } },
  { id: 'platz', icon: '🗼', name: 'Ehrenplatz', desc: 'Öffnet einen 5. Turmplatz (Nordost). Nur dort darfst du auch mitten im Run bauen (10 Energie). Einmalig!', max: 1,
    apply(g) { g.addExtraPad(); } },
];

// 3 zufaellige, unterschiedliche Optionen unter Beachtung der max-Stufen.
// Ungesehene Perks werden mit Gewicht 2.5 gezogen (neue Optionen bevorzugt),
// damit nicht ab Mitte des Runs nur noch Wiederholungen kommen.
export function rollPerkOptions(chosen) {
  const counts = {};
  for (const id of chosen) counts[id] = (counts[id] || 0) + 1;
  const pool = PERK_POOL.filter((p) => (counts[p.id] || 0) < p.max);
  const weight = (p) => ((counts[p.id] || 0) === 0 ? 2.5 : 1);
  const options = [];
  while (options.length < 3 && pool.length > 0) {
    let total = 0;
    for (const p of pool) total += weight(p);
    let r = Math.random() * total;
    let idx = pool.length - 1;
    for (let i = 0; i < pool.length; i++) {
      r -= weight(pool[i]);
      if (r <= 0) { idx = i; break; }
    }
    options.push(pool.splice(idx, 1)[0]);
  }
  return options;
}
