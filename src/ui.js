// HUD-Bindung: reine DOM-Anzeige, keine Spiellogik.

export function createHud() {
  const waveChip = document.getElementById('wave-chip');
  const energyChip = document.getElementById('energy-chip');
  const perkChip = document.getElementById('perk-chip');
  const hpFill = document.getElementById('hp-fill');
  const hpText = document.getElementById('hp-text');
  const stateBtn = document.getElementById('state-btn');
  const bannerEl = document.getElementById('banner');
  const perkOverlay = document.getElementById('perk-overlay');
  const perkCards = document.getElementById('perk-cards');
  let bannerTimer = 0;

  return {
    sync(game) {
      waveChip.textContent = 'Welle ' + game.wave + '/100';
      energyChip.textContent = 'Energie ' + Math.floor(game.energy);
      perkChip.textContent = 'Staerke ' + game.chosenPerks.length;
      hpFill.style.width = Math.max(0, (game.hp / game.maxHp) * 100) + '%';
      hpText.textContent = 'Loewe ' + Math.ceil(game.hp) + ' / ' + game.maxHp;
    },
    setState(state) {
      const labels = { ready: 'Start', running: 'Pause', paused: 'Weiter', perk: 'Waehle Staerke', lost: 'Neustart', won: 'Neustart' };
      stateBtn.textContent = labels[state] || 'Start';
    },
    banner(text, ms) {
      bannerEl.textContent = text;
      bannerEl.hidden = false;
      clearTimeout(bannerTimer);
      bannerTimer = setTimeout(() => { bannerEl.hidden = true; }, ms || 2400);
    },
    // Stärken-Wahl (Roguelite): 1 aus 3 Karten
    showPerks(options, onPick) {
      perkCards.innerHTML = '';
      for (const perk of options) {
        const card = document.createElement('button');
        card.className = 'perk-card';
        card.type = 'button';
        const icon = document.createElement('span');
        icon.className = 'perk-icon';
        icon.textContent = perk.icon;
        const text = document.createElement('span');
        text.className = 'perk-text';
        const name = document.createElement('span');
        name.className = 'perk-name';
        name.textContent = perk.name;
        const desc = document.createElement('span');
        desc.className = 'perk-desc';
        desc.textContent = perk.desc;
        text.append(name, desc);
        card.append(icon, text);
        card.addEventListener('click', () => onPick(perk));
        perkCards.appendChild(card);
      }
      perkOverlay.hidden = false;
    },
    hidePerks() {
      perkOverlay.hidden = true;
      perkCards.innerHTML = '';
    },
  };
}
