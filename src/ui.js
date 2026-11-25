// HUD-Bindung: reine DOM-Anzeige, keine Spiellogik.

export function createHud() {
  const waveChip = document.getElementById('wave-chip');
  const energyChip = document.getElementById('energy-chip');
  const perkChip = document.getElementById('perk-chip');
  const towerChip = document.getElementById('tower-chip');
  const towerBar = document.getElementById('tower-bar');
  const monumentBar = document.getElementById('monument-bar');
  const hpFill = document.getElementById('hp-fill');
  const hpText = document.getElementById('hp-text');
  const stateBtn = document.getElementById('state-btn');
  const bannerEl = document.getElementById('banner');
  const perkOverlay = document.getElementById('perk-overlay');
  const perkCards = document.getElementById('perk-cards');
  const monumentOverlay = document.getElementById('monument-overlay');
  const monumentRows = document.getElementById('monument-rows');
  const monumentClose = document.getElementById('monument-close');
  let bannerTimer = 0;
  let gameRef = null;

  return {
    sync(game) {
      waveChip.textContent = game.ngPlus > 0 ? 'NG+' + game.ngPlus + ' Welle ' + game.displayWave() + '/100' : 'Welle ' + game.wave + '/100';
      energyChip.textContent = 'Energie ' + Math.floor(game.energy);
      perkChip.textContent = 'Staerke ' + game.chosenPerks.length;
      towerChip.textContent = 'Tuerme ' + game.towers.length + '/' + (game.maxTowerSlots || 4);
      hpFill.style.width = Math.max(0, (game.hp / game.maxHp) * 100) + '%';
      hpText.textContent = 'Loewe ' + Math.ceil(game.hp) + ' / ' + game.maxHp;
    },
    setState(state) {
      const labels = { ready: 'Start', running: 'Pause', paused: 'Weiter', perk: 'Waehle Staerke', monument: 'Weiter', lost: 'Neustart', won: 'New Game+' };
      stateBtn.textContent = labels[state] || 'Start';
      // Turm-Leiste auch mitten im Run zeigen, solange der Ehrenplatz (Perk) offen ist
      const extraOpen = !!(gameRef && gameRef.hasOpenExtraPad());
      const showTowers = state === 'ready' || (extraOpen && (state === 'running' || state === 'paused'));
      towerBar.hidden = !showTowers;
      towerChip.hidden = !showTowers;
      perkChip.hidden = state === 'ready';
      monumentBar.hidden = !(state === 'ready' || state === 'running' || state === 'paused');
    },
    bindGame(game) {
      gameRef = game; // fuer setState-Entscheidungen (Ehrenplatz offen?)
    },
    banner(text, ms) {
      bannerEl.textContent = text;
      bannerEl.hidden = false;
      clearTimeout(bannerTimer);
      bannerTimer = setTimeout(() => { bannerEl.hidden = true; }, ms || 2400);
    },
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
    // Denkmal-Upgrade-Panel (pausiert das Spiel)
    showMonument(offers, onBuy, onClose) {
      monumentRows.innerHTML = '';
      for (const off of offers) {
        const row = document.createElement('button');
        row.className = 'monument-row';
        row.type = 'button';
        row.disabled = off.disabled;
        const icon = document.createElement('span');
        icon.className = 'perk-icon';
        icon.textContent = off.icon;
        const text = document.createElement('span');
        text.className = 'perk-text';
        const name = document.createElement('span');
        name.className = 'perk-name';
        name.textContent = off.name;
        const desc = document.createElement('span');
        desc.className = 'perk-desc';
        desc.textContent = off.desc;
        text.append(name, desc);
        const cost = document.createElement('span');
        cost.className = 'monument-cost';
        cost.textContent = off.maxed ? 'MAX' : (off.cant ? 'Voll' : Math.floor(off.cost) + ' ⚡');
        row.append(icon, text, cost);
        row.addEventListener('click', () => onBuy(off.key));
        monumentRows.appendChild(row);
      }
      monumentClose.onclick = () => onClose();
      monumentOverlay.hidden = false;
    },
    hideMonument() {
      monumentOverlay.hidden = true;
      monumentRows.innerHTML = '';
    },
  };
}
