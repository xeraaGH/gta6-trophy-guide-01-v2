// Progress storage for the Leonida Trophy Guide: earned trophies and 100% counters,
// saved in localStorage, with JSON export and import. A demo flag seeds progress in
// memory only (for screenshots) and never touches localStorage.
export const EARNED_KEY = 'leonida-trophy-guide-earned';
export const COUNTERS_KEY = 'leonida-trophy-guide-counters';
export const SPOILERS_KEY = 'leonida-trophy-guide-spoilers';

export function loadEarned() {
  try {
    const raw = localStorage.getItem(EARNED_KEY);
    return new Set(raw ? JSON.parse(raw) : []);
  } catch {
    return new Set();
  }
}

export function saveEarned(earned) {
  localStorage.setItem(EARNED_KEY, JSON.stringify([...earned]));
}

export function loadCounters() {
  try {
    const raw = localStorage.getItem(COUNTERS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveCounters(counters) {
  localStorage.setItem(COUNTERS_KEY, JSON.stringify(counters));
}

export function loadSpoilers() {
  return localStorage.getItem(SPOILERS_KEY) !== 'off';
}

export function saveSpoilers(on) {
  localStorage.setItem(SPOILERS_KEY, on ? 'on' : 'off');
}

export function exportProgress(earned, counters) {
  const blob = new Blob([JSON.stringify({ earned: [...earned], counters }, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'leonida-trophy-progress.json';
  a.click();
  URL.revokeObjectURL(a.href);
}

export async function importProgress(file) {
  const text = await file.text();
  const data = JSON.parse(text);
  const earned = new Set(Array.isArray(data) ? data : (data.earned ?? []));
  const counters = data.counters ?? {};
  saveEarned(earned);
  saveCounters(counters);
  return { earned, counters };
}

// Demo progress for screenshots: 13 of 55 earned, in memory only.
export const DEMO_EARNED = [
  'Just Like Paradise', 'Paradise Lost', 'Trust', 'Master of None',
  'Stick Fiddler', 'Baited My Tackle', 'Top Fun', 'Earn Cash, Not Kudos',
  'The Shootist', 'Hot Together', 'Gunslinger', 'Catch Me If You Can',
  'The Goodtime State',
];
