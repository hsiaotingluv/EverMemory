import { normaliseSave } from './story.js';
import { normaliseGame } from './minigames.js';

// Keep the existing key so pre-minigame journeys migrate without losing memories.
export const JOURNEY_SAVE_KEY = 'evermemory.jiufen.v1';

export function normaliseJourney(raw) {
  const profile = normaliseSave(raw);
  if (!profile) return null;
  profile.game = normaliseGame(raw.game);
  // Oolong also owns the original teahouse journal entry. Reconcile in the same
  // write as its reward so a reload between frontend callbacks cannot lose it.
  if (profile.game.memories.includes('oolong') && !profile.found.includes('tea')) {
    profile.found.push('tea');
  }
  return profile;
}

// Storage is supplied by the caller so browsers with blocked storage remain playable.
export function readJourney(storage) {
  try { return normaliseJourney(JSON.parse(storage.getItem(JOURNEY_SAVE_KEY))); }
  catch { return null; }
}

export function writeJourney(storage, profile) {
  try {
    const validated = normaliseJourney(profile);
    if (!validated) return false;
    // One atomic localStorage write saves payment, reward and progress together.
    storage.setItem(JOURNEY_SAVE_KEY, JSON.stringify(validated));
    return true;
  } catch { return false; }
}
