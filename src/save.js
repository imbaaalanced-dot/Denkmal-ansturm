// Persistenz: Checkpoint-System via localStorage (WebView-tauglich).
// Gespeichert wird nach jeder geschafften Welle und nach jeder Kauf-/Wahl-Aktion.
// Gegner mitten in einer Welle werden NICHT gespeichert: Restore startet sauber
// am Anfang der naechsten Welle (robust, kein halbfertiger Zustand).

const SAVE_KEY = 'denkmal-ansturm-save';
const SAVE_VERSION = 1;

export function saveRun(data) {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(data));
  } catch (err) {
    // localStorage blockiert (z.B. Privater Modus): Spiel laeuft ohne Persistenz weiter.
  }
}

export function loadRun() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (!data || data.v !== SAVE_VERSION || typeof data.wave !== 'number') return null;
    return data;
  } catch (err) {
    return null; // korrupter Speicher: frisch starten
  }
}

export function clearRun() {
  try {
    localStorage.removeItem(SAVE_KEY);
  } catch (err) {
    // ignorieren
  }
}
