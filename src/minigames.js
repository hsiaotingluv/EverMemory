// All rewards change state synchronously, before animation or media playback.
export const RULES = Object.freeze({ maxEnergy: 100, drain: .5, lowEnergy: 25, slowSpeed: .75, teaEnergy: 20, cakeEnergy: 40, teaCost: 10, riddleCoins: 10 });

export const RIDDLES = [
  { id: 'lantern-light', x: 1.7, z: 15, place: 'The lantern gate', object: 'A riddle beneath the lantern', question: 'I wear a red coat and carry a little sun. What am I?', answers: ['A lantern', 'A teacup', 'A mountain'], answer: 0, hint: 'Look up. Something is lighting the lane.', explanation: 'A little sun, sheltered in red paper.' },
  { id: 'lantern-tea', x: 1.7, z: -2, place: 'The taro-ball lane', object: 'A tea-stained lantern riddle', question: 'I begin as a leaf. With warm water, I fill your cup with a story. What am I?', answers: ['Rain', 'Tea', 'A mooncake'], answer: 1, hint: 'A kettle and a handful of leaves will help.', explanation: 'Every cup begins with a leaf. Follow the ridge west to Rainlight Teahouse.' },
  { id: 'lantern-moon', x: -1.7, z: -23, place: 'The tea-house terrace', object: 'A moon-shaped lantern riddle', question: 'You can see me in a puddle, but you cannot scoop me into your hands. What am I?', answers: ['A pebble', 'A fallen leaf', 'The moon’s reflection'], answer: 2, hint: 'The answer is above you as well as below.', explanation: 'The moon visits every puddle without leaving the sky.' },
];

export const CUPS = [
  { id: 'blue', name: 'Blue rain cup', description: 'A little chip, just where your thumb rests.', colour: '#557f7c', x: 4, z: 20 },
  { id: 'clay', name: 'Clay mountain cup', description: 'Warm earth, worn smooth by many hands.', colour: '#a24932', x: -12, z: -24 },
];

export const TEAS = [
  { id: 'oolong', name: 'Mountain oolong', note: 'Floral, soft, familiar.', memory: 'A cup for the rain', chinese: '雨光', colour: '#557f7c', video: '/memories/rain.webm', lines: ['Rain gathered on the lanterns. Mum never hurried the tea.', 'You counted the boats until the windows fogged.', '“We can stay a little longer,” she said.'] },
  { id: 'black', name: 'Honey black tea', note: 'A little sweetness after the climb.', memory: 'The lantern walk', chinese: '燈火', colour: '#a24932', video: '/memories/lanterns.webm', lines: ['Dad lifted you high enough to see the whole street.', 'One lantern, then another. You counted each warm light.', 'For once, the way home felt too short.'] },
  { id: 'jasmine', name: 'Jasmine green tea', note: 'Fresh leaves and an evening breeze.', memory: 'Half a mooncake', chinese: '團圓', colour: '#626a55', video: '/memories/mooncake.webm', lines: ['At the window, your brother broke the last mooncake in two.', 'He gave you the larger half and pretended not to notice.', 'Outside, the moon was whole. Inside, so was everything.'] },
];

export const RITUAL = [
  { id: 'warm', text: 'Warm the brewing vessel' },
  { id: 'leaves', text: 'Add leaves' },
  { id: 'steep', text: 'Pour water and steep' },
  { id: 'taste', text: 'Pour, smell, and taste' },
];
export const TEA_TABLE = { id: 'tea-table', kind: 'table', x: -31, z: -68.6, place: 'Rainlight Teahouse', object: 'Choose a cup at the tea table' };
export const RITUAL_CARD = { id: 'ritual-card', kind: 'card', x: -35.1, z: -69.3, place: 'Rainlight Teahouse', object: 'Read the house tea ritual' };

function uniqueIds(value, catalogue) {
  const ids = new Set(Array.isArray(value) ? value : []);
  return [...ids].filter(id => catalogue.some(item => item.id === id));
}
function bounded(value, fallback, max) {
  if (typeof value !== 'number' || !Number.isFinite(value)) return fallback;
  return Math.min(max, Math.max(0, value));
}
const MAX_TASTING_ID = Number.MAX_SAFE_INTEGER - 1;
const validTastingId = value => Number.isSafeInteger(value) && value > 0 && value <= MAX_TASTING_ID;
export function normaliseGame(raw = {}) {
  if (!raw || typeof raw !== 'object') raw = {};
  const game = {
    version: 1,
    coins: Math.floor(bounded(raw.coins, 0, RIDDLES.length * RULES.riddleCoins)),
    energy: bounded(raw.energy, RULES.maxEnergy, RULES.maxEnergy),
    mooncakes: Math.floor(bounded(raw.mooncakes, 0, TEAS.length)),
    cups: uniqueIds(raw.cups, CUPS),
    solved: uniqueIds(raw.solved, RIDDLES),
    memories: uniqueIds(raw.memories, TEAS),
    freeUsed: raw.freeUsed === true,
    discovered: raw.discovered === true,
    active: null,
    nextTastingId: validTastingId(raw.nextTastingId) ? raw.nextTastingId : 1,
  };
  if (game.memories.length) game.freeUsed = true;
  const active = raw.active;
  if (active && TEAS.some(t => t.id === active.tea) && game.cups.includes(active.cup) && !game.memories.includes(active.tea) && ['puzzle', 'brewing', 'video'].includes(active.stage)) {
    const id = validTastingId(active.id) ? active.id : game.nextTastingId;
    game.active = { id, tea: active.tea, cup: active.cup, stage: active.stage, free: active.free === true, videoTime: active.stage === 'video' ? bounded(active.videoTime, 0, 3600) : 0 };
    game.nextTastingId = Math.min(MAX_TASTING_ID, Math.max(game.nextTastingId, id + 1));
    // A charged tasting has already reserved the one free tasting, if applicable.
    if (active.stage !== 'puzzle') game.freeUsed = true;
    else if (game.freeUsed || !game.active.free) game.active = null;
  }
  return game;
}

export function solveRiddle(game, id, answer) {
  const riddle = RIDDLES.find(r => r.id === id);
  if (!riddle) return 'invalid';
  if (game.solved.includes(id)) return 'solved';
  if (answer !== riddle.answer) return 'wrong';
  game.solved.push(id);
  game.coins += RULES.riddleCoins;
  return 'correct';
}
export function collectCup(game, id) {
  if (!CUPS.some(c => c.id === id) || game.cups.includes(id)) return false;
  game.cups.push(id);
  return true;
}
export function beginTasting(game, cup, tea) {
  if (game.active) return 'resume';
  if (!game.cups.includes(cup)) return 'no-cup';
  if (!TEAS.some(t => t.id === tea)) return 'invalid';
  if (game.memories.includes(tea)) return 'replay';
  const free = !game.freeUsed;
  if (!free && game.coins < RULES.teaCost) return 'no-coins';
  // Refuse exhausted/corrupt counters rather than reusing a transaction identity.
  if (!validTastingId(game.nextTastingId) || game.nextTastingId === MAX_TASTING_ID) return 'invalid';
  if (!free) game.coins -= RULES.teaCost;
  game.active = { id: game.nextTastingId++, cup, tea, free, stage: free ? 'puzzle' : 'brewing', videoTime: 0 };
  return game.active.stage;
}
export function submitRitual(game, sequence, tastingId = game.active?.id) {
  if (game.active?.stage !== 'puzzle' || game.active.id !== tastingId) return false;
  if (!Array.isArray(sequence) || sequence.length !== RITUAL.length || !RITUAL.every((step, i) => step.id === sequence[i])) return false;
  game.freeUsed = true;
  game.active.stage = 'brewing';
  return true;
}
export function abandonPuzzle(game, tastingId = game.active?.id) {
  if (game.active?.stage !== 'puzzle' || game.active.id !== tastingId) return false;
  game.active = null;
  return true;
}
export function drinkTea(game, tastingId = game.active?.id) {
  if (game.active?.stage !== 'brewing' || game.active.id !== tastingId) return false;
  game.energy = Math.min(RULES.maxEnergy, game.energy + RULES.teaEnergy);
  game.active.stage = 'video';
  return true;
}
export function checkpointVideo(game, seconds, tastingId = game.active?.id) {
  if (game.active?.stage !== 'video' || game.active.id !== tastingId || !Number.isFinite(seconds) || seconds < 0) return false;
  game.active.videoTime = Math.min(3600, seconds);
  return true;
}
export function finishTasting(game, tastingId = game.active?.id) {
  if (game.active?.stage !== 'video' || game.active.id !== tastingId) return null;
  const tea = game.active.tea;
  if (!game.memories.includes(tea)) {
    game.memories.push(tea);
    game.mooncakes++;
  }
  game.active = null;
  return tea;
}
export function eatMooncake(game) {
  if (game.mooncakes < 1 || game.energy >= RULES.maxEnergy) return false;
  game.mooncakes--;
  game.energy = Math.min(RULES.maxEnergy, game.energy + RULES.cakeEnergy);
  return true;
}
export function drainEnergy(game, seconds, moving, paused) {
  if (moving && !paused && Number.isFinite(seconds) && seconds > 0) game.energy = Math.max(0, game.energy - seconds * RULES.drain);
}
export function speedMultiplier(game) { return game.energy < RULES.lowEnergy ? RULES.slowSpeed : 1; }
export function nearestGameObject(game, x, z, interior) {
  const objects = interior ? [TEA_TABLE, RITUAL_CARD] : [
    ...CUPS.filter(c => !game.cups.includes(c.id)).map(c => ({ ...c, kind: 'cup', place: 'The old street', object: `Collect the ${c.name.toLowerCase()}` })),
    ...RIDDLES.map(r => ({ ...r, kind: 'riddle', object: game.solved.includes(r.id) ? 'A solved lantern riddle' : r.object })),
  ];
  return objects.map(object => ({ object, distance: Math.hypot(x - object.x, z - object.z) }))
    .filter(item => item.distance < (item.object.kind === 'table' ? 2.5 : 1.9))
    .sort((a, b) => a.distance - b.distance)[0]?.object ?? null;
}
