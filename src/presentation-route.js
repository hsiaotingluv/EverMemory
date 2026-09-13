import { MEMORIES, LANTERN_TERRACE } from './story.js';
import { CUPS, RIDDLES } from './minigames.js';

const ticket = MEMORIES.find(memory => memory.id === 'ticket');
const blueCup = CUPS.find(cup => cup.id === 'blue');
const firstRiddle = RIDDLES.find(riddle => riddle.id === 'lantern-light');

export const PRESENTATION_START = Object.freeze({ x: 0, z: 22 });

export const PRESENTATION_STOPS = Object.freeze([
  Object.freeze({
    id: 'arrival-memory',
    x: ticket.x,
    z: ticket.z,
    title: 'Begin with the journey',
    hint: 'A folded bus ticket waits to the left of the old stop.',
    complete: profile => profile?.found?.includes(ticket.id),
  }),
  Object.freeze({
    id: 'collect-cup',
    x: blueCup.x,
    z: blueCup.z,
    title: 'Find something familiar',
    hint: 'The blue rain cup rests across the lane.',
    complete: profile => Boolean(profile?.game?.cups?.length),
  }),
  Object.freeze({
    id: 'solve-riddle',
    x: firstRiddle.x,
    z: firstRiddle.z,
    title: 'Follow the lanterns',
    hint: 'A riddle hangs beneath the first lantern gate.',
    complete: profile => Boolean(profile?.game?.solved?.length),
  }),
  Object.freeze({
    id: 'find-teahouse',
    x: -31,
    z: -65.5,
    title: 'Find Rainlight Teahouse',
    hint: 'Descend the lantern stairway, then turn west along the ridge.',
    complete: profile => profile?.game?.discovered === true,
  }),
  Object.freeze({
    id: 'taste-tea',
    x: -31,
    z: -66.2,
    title: 'Let the tea remember',
    hint: 'Read the ritual card, then brew your first cup.',
    complete: profile => Boolean(profile?.game?.memories?.length),
  }),
  Object.freeze({
    id: 'release-wish',
    x: LANTERN_TERRACE.x,
    z: LANTERN_TERRACE.z,
    title: 'Give the memory to the sky',
    hint: 'Cross the ridge to the wishing terrace and release a lantern.',
    complete: profile => Boolean(profile?.wishes?.length),
  }),
]);

export function nextPresentationStop(profile) {
  const index = PRESENTATION_STOPS.findIndex(stop => !stop.complete(profile));
  if (index >= 0) return { ...PRESENTATION_STOPS[index], index, total: PRESENTATION_STOPS.length };
  return {
    id: 'story-walk-complete',
    title: 'Open what you kept',
    hint: 'Your memory and wish are waiting in the journal.',
    index: PRESENTATION_STOPS.length,
    total: PRESENTATION_STOPS.length,
  };
}
