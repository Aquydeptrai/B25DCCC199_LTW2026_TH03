const MATCHES_KEY = 'ltw_bongda_matches';

const isMatch = (m) =>
  m !== null &&
  typeof m === 'object' &&
  ['id', 'round', 'home', 'away', 'homeGoals', 'awayGoals'].every((k) => Number.isFinite(m[k]));

export function loadSaved() {
  try {
    const raw = window.localStorage.getItem(MATCHES_KEY);
    if (raw === null) {
      return null;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.every(isMatch) ? parsed : null;
  } catch (err) {
    return null;
  }
}

export function saveMatches(matches) {
  try {
    window.localStorage.setItem(MATCHES_KEY, JSON.stringify(matches));
  } catch (err) {
    
  }
}