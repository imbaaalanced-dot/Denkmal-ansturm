// HUD-Bindung: reine DOM-Anzeige, keine Spiellogik.

export function createHud() {
  const waveChip = document.getElementById('wave-chip');
  const energyChip = document.getElementById('energy-chip');
  const hpFill = document.getElementById('hp-fill');
  const hpText = document.getElementById('hp-text');
  const stateBtn = document.getElementById('state-btn');
  const bannerEl = document.getElementById('banner');
  let bannerTimer = 0;

  return {
    sync(game) {
      waveChip.textContent = 'Welle ' + game.wave + '/100';
      energyChip.textContent = 'Energie ' + Math.floor(game.energy);
      hpFill.style.width = Math.max(0, (game.hp / game.maxHp) * 100) + '%';
      hpText.textContent = 'Denkmal ' + Math.ceil(game.hp) + ' / ' + game.maxHp;
    },
    setState(state) {
      const labels = { ready: 'Start', running: 'Pause', paused: 'Weiter', lost: 'Neustart', won: 'Neustart' };
      stateBtn.textContent = labels[state] || 'Start';
    },
    banner(text, ms) {
      bannerEl.textContent = text;
      bannerEl.hidden = false;
      clearTimeout(bannerTimer);
      bannerTimer = setTimeout(() => { bannerEl.hidden = true; }, ms || 2400);
    },
  };
}
