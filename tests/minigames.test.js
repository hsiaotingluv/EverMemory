import test from 'node:test';
import assert from 'node:assert/strict';
import { RULES, CUPS, TEAS, RIDDLES, RITUAL, TEA_TABLE, RITUAL_CARD, normaliseGame, solveRiddle, collectCup, beginTasting, submitRitual, abandonPuzzle, drinkTea, checkpointVideo, finishTasting, eatMooncake, drainEnergy, speedMultiplier, nearestGameObject } from '../src/minigames.js';
import { JOURNEY_SAVE_KEY, normaliseJourney, readJourney, writeJourney } from '../src/journey-store.js';
import { isWalkable, insideTeahouse } from '../src/story.js';

const ritual = RITUAL.map(s => s.id);
const reload = game => normaliseGame(JSON.parse(JSON.stringify(game)));
function withCup() { const game = normaliseGame(); collectCup(game, CUPS[0].id); return game; }
function firstBrew(game = withCup()) {
  assert.equal(beginTasting(game, CUPS[0].id, TEAS[0].id), 'puzzle');
  assert(submitRitual(game, ritual, game.active.id)); return game;
}
function completeFirst(game = withCup()) {
  firstBrew(game); const id = game.active.id;
  assert(drinkTea(game, id)); assert.equal(finishTasting(game, id), TEAS[0].id); return game;
}
function storage() {
  const values = new Map();
  return { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value) };
}
const profile = game => ({ name: 'Rowan', gender: 'female', found: ['ticket'], position: { x: 0, z: 22 }, wishes: ['A quiet evening'], game });

test('new journeys start with full energy and no invented provisions or progress', () => {
  const game = normaliseGame();
  assert.equal(game.energy, 100); assert.equal(game.coins, 0); assert.equal(game.mooncakes, 0);
  assert.deepEqual(game.cups, []); assert.deepEqual(game.solved, []); assert.deepEqual(game.memories, []);
  assert.equal(game.freeUsed, false); assert.equal(game.active, null);
});

test('every riddle has three options, wrong attempts are free, and its reward is one-time', () => {
  const game = normaliseGame();
  for (const riddle of RIDDLES) {
    assert.equal(riddle.answers.length, 3);
    const before = structuredClone(game);
    assert.equal(solveRiddle(game, riddle.id, (riddle.answer + 1) % 3), 'wrong');
    assert.deepEqual(game, before);
    assert.equal(solveRiddle(game, riddle.id, riddle.answer), 'correct');
    const solved = structuredClone(game);
    for (let n = 0; n < 10; n++) assert.equal(solveRiddle(game, riddle.id, riddle.answer), 'solved');
    assert.deepEqual(game, solved);
  }
  assert.equal(game.coins, 30); assert.equal(game.solved.length, 3);
  assert.equal(solveRiddle(game, 'unknown', 0), 'invalid');
});

test('cups collect once and disappear from proximity results', () => {
  const game = normaliseGame(), cup = CUPS[0];
  assert.equal(nearestGameObject(game, cup.x, cup.z, false)?.id, cup.id);
  assert(collectCup(game, cup.id)); assert.equal(collectCup(game, cup.id), false);
  assert.equal(collectCup(game, 'unknown'), false); assert.deepEqual(game.cups, [cup.id]);
  assert.notEqual(nearestGameObject(game, cup.x, cup.z, false)?.id, cup.id);
});

test('no-cup tasting has no side effects and the table remains interactable', () => {
  const game = normaliseGame(), before = structuredClone(game);
  assert.equal(beginTasting(game, 'blue', 'oolong'), 'no-cup');
  assert.deepEqual(game, before);
  assert.equal(nearestGameObject(game, -31, -66.2, true)?.kind, 'table');
});

test('the first ritual is free for any cup and tea, with unlimited wrong retries', () => {
  for (const cup of CUPS) for (const tea of TEAS) {
    const game = normaliseGame(); collectCup(game, cup.id);
    assert.equal(beginTasting(game, cup.id, tea.id), 'puzzle');
    const before = structuredClone(game), id = game.active.id;
    for (const wrong of [[], null, {}, [...ritual].reverse(), ['warm', 'warm', 'warm', 'warm'], ritual.slice(0, 3), [...ritual, 'taste']]) {
      assert.equal(submitRitual(game, wrong, id), false); assert.deepEqual(game, before);
    }
    assert(submitRitual(game, ritual, id)); assert.equal(game.freeUsed, true);
    assert.equal(game.active.stage, 'brewing'); assert.equal(game.coins, 0);
  }
});

test('abandoning a failed or untouched first puzzle does not consume the free tasting', () => {
  const game = withCup(); beginTasting(game, 'blue', 'black');
  const oldId = game.active.id; assert(abandonPuzzle(game, oldId));
  assert.equal(game.freeUsed, false); assert.equal(game.active, null);
  assert.equal(beginTasting(game, 'blue', 'jasmine'), 'puzzle');
  assert.notEqual(game.active.id, oldId); assert.equal(game.coins, 0);
  assert.equal(submitRitual(game, ritual, oldId), false);
  assert.equal(abandonPuzzle(game, oldId), false);
});

test('repeat begin clicks reserve only one tasting and cannot change its cup or tea', () => {
  const game = withCup(); collectCup(game, 'clay'); beginTasting(game, 'blue', 'oolong');
  const before = structuredClone(game);
  for (let n = 0; n < 10; n++) assert.equal(beginTasting(game, 'clay', 'black'), 'resume');
  assert.deepEqual(game, before);
});

test('tea restores energy once, before video, and memory/mooncake only at completion', () => {
  const game = withCup(); game.energy = 30; firstBrew(game); const id = game.active.id;
  assert.equal(finishTasting(game, id), null); assert.equal(game.energy, 30);
  assert(drinkTea(game, id)); assert.equal(game.energy, 50); assert.equal(game.active.stage, 'video');
  assert.equal(game.mooncakes, 0); assert.equal(game.memories.length, 0);
  assert.equal(drinkTea(game, id), false); assert.equal(game.energy, 50);
  assert.equal(finishTasting(game, id), 'oolong'); assert.equal(game.mooncakes, 1);
  assert.deepEqual(game.memories, ['oolong']); assert.equal(finishTasting(game, id), null);
  assert.equal(game.mooncakes, 1); assert.equal(game.energy, 50);
});

test('further tastings cost ten coins, skip the puzzle, and reuse the same cup', () => {
  const game = completeFirst(); solveRiddle(game, RIDDLES[0].id, RIDDLES[0].answer);
  assert.equal(beginTasting(game, 'blue', 'black'), 'brewing'); assert.equal(game.coins, 0);
  const id = game.active.id;
  assert.equal(submitRitual(game, ritual, id), false);
  assert.equal(beginTasting(game, 'blue', 'black'), 'resume'); assert.equal(game.coins, 0);
  assert(drinkTea(game, id)); assert.equal(finishTasting(game, id), 'black');
  assert.deepEqual(game.cups, ['blue']); assert.equal(game.mooncakes, 2);
});

test('insufficient coins cannot purchase a tea or consume energy', () => {
  const game = completeFirst(), before = structuredClone(game);
  assert.equal(beginTasting(game, 'blue', 'black'), 'no-coins'); assert.deepEqual(game, before);
});

test('every pair of riddles funds all three memories in any tea order', () => {
  const orders = [[0,1,2],[0,2,1],[1,0,2],[1,2,0],[2,0,1],[2,1,0]];
  for (const omitted of [0, 1, 2]) for (const order of orders) {
    let game = withCup(); game.energy = 0;
    for (const [i, riddle] of RIDDLES.entries()) if (i !== omitted) solveRiddle(game, riddle.id, riddle.answer);
    for (const [index, teaIndex] of order.entries()) {
      assert.equal(beginTasting(game, 'blue', TEAS[teaIndex].id), index === 0 ? 'puzzle' : 'brewing');
      if (index === 0) assert(submitRitual(game, ritual));
      game = reload(game); assert(drinkTea(game)); game = reload(game); assert(finishTasting(game));
    }
    assert.equal(game.coins, 0); assert.equal(game.memories.length, 3); assert.equal(game.mooncakes, 3);
    assert.equal(game.energy, 60);
  }
});

test('completed teas replay freely with no purchase, extra energy, or mooncake', () => {
  const game = completeFirst(); game.energy = 10;
  const before = structuredClone(game);
  for (let n = 0; n < 10; n++) {
    assert.equal(beginTasting(game, 'blue', 'oolong'), 'replay');
    assert.equal(drinkTea(game), false); assert.equal(finishTasting(game), null);
  }
  assert.deepEqual(game, before);
});

test('saved first puzzle resumes with its original free entitlement', () => {
  let game = withCup(); beginTasting(game, 'blue', 'black'); const id = game.active.id;
  game = reload(game); assert.equal(game.active.stage, 'puzzle'); assert.equal(game.active.id, id);
  assert.equal(game.freeUsed, false); assert.equal(beginTasting(game, 'blue', 'oolong'), 'resume');
  assert(submitRitual(game, ritual, id));
});

test('interruptions at every tasting stage never charge or reward a second time', () => {
  let game = completeFirst(); solveRiddle(game, RIDDLES[0].id, RIDDLES[0].answer);
  beginTasting(game, 'blue', 'black'); const id = game.active.id; game.energy = 10;
  game = reload(game); assert.equal(game.coins, 0); assert.equal(game.active.stage, 'brewing');
  assert.equal(abandonPuzzle(game, id), false);
  assert.equal(beginTasting(game, 'blue', 'black'), 'resume'); assert(drinkTea(game, id));
  assert(checkpointVideo(game, 4.75, id)); game = reload(game);
  assert.equal(game.active.videoTime, 4.75); assert.equal(game.energy, 30);
  assert.equal(drinkTea(game, id), false); assert.equal(game.mooncakes, 1);
  assert.equal(finishTasting(game, id), 'black'); game = reload(game);
  assert.equal(game.mooncakes, 2); assert.equal(game.energy, 30);
  assert.equal(finishTasting(game, id), null); assert.equal(game.coins, 0);
});

test('late callbacks from an old film cannot complete, drink or seek a new tasting', () => {
  const game = firstBrew(), oldId = game.active.id;
  drinkTea(game, oldId); finishTasting(game, oldId);
  solveRiddle(game, RIDDLES[0].id, RIDDLES[0].answer); beginTasting(game, 'blue', 'black');
  assert.equal(drinkTea(game, oldId), false); drinkTea(game, game.active.id);
  const before = structuredClone(game);
  assert.equal(finishTasting(game, oldId), null); assert.equal(checkpointVideo(game, 6, oldId), false);
  assert.deepEqual(game, before);
});

test('invalid playback times are rejected; an intentional backwards seek is saved', () => {
  const game = firstBrew(); drinkTea(game); const id = game.active.id;
  for (const value of [-1, NaN, Infinity, null, '4']) assert.equal(checkpointVideo(game, value, id), false);
  assert(checkpointVideo(game, 8, id)); assert(checkpointVideo(game, 2, id));
  assert.equal(game.active.videoTime, 2);
});

test('energy drains only with actual movement and no paused activity', () => {
  const game = normaliseGame(); drainEnergy(game, 10, true, false); assert.equal(game.energy, 95);
  drainEnergy(game, 10, false, false); drainEnergy(game, 10, true, true); drainEnergy(game, 10, false, true);
  for (const time of [NaN, Infinity, -5, 0]) drainEnergy(game, time, true, false);
  assert.equal(game.energy, 95);
  drainEnergy(game, 1000, true, false); assert.equal(game.energy, 0);
});

test('low and zero energy retain movement and every progression action', () => {
  const game = normaliseGame(); game.energy = 25; assert.equal(speedMultiplier(game), 1);
  game.energy = 24.99; assert.equal(speedMultiplier(game), .75);
  game.energy = 0; assert.equal(speedMultiplier(game), .75);
  assert(collectCup(game, 'blue')); assert.equal(solveRiddle(game, RIDDLES[0].id, RIDDLES[0].answer), 'correct');
  firstBrew(game); assert(drinkTea(game)); assert.equal(game.energy, 20); assert(finishTasting(game));
  assert(eatMooncake(game)); assert.equal(game.energy, 60); assert.equal(speedMultiplier(game), 1);
});

test('tea and mooncake restoration cap at 100; an absent or unneeded cake is not consumed', () => {
  const game = firstBrew(); game.energy = 95; drinkTea(game); assert.equal(game.energy, 100);
  finishTasting(game); assert.equal(eatMooncake(game), false); assert.equal(game.mooncakes, 1);
  game.energy = 90; assert(eatMooncake(game)); assert.equal(game.energy, 100); assert.equal(game.mooncakes, 0);
  game.energy = 20; assert.equal(eatMooncake(game), false); assert.equal(game.energy, 20);
});

test('game save validation clamps invalid resources and removes duplicate or unknown inventory', () => {
  const game = normaliseGame({ energy: -1, coins: Infinity, mooncakes: 999, cups: ['blue', 'blue', 'no'], solved: ['lantern-light', 'no', 'lantern-light'], memories: ['black', 'black', 'no'], freeUsed: 'true', nextTastingId: -1 });
  assert.equal(game.energy, 0); assert.equal(game.coins, 0); assert.equal(game.mooncakes, 3);
  assert.deepEqual(game.cups, ['blue']); assert.deepEqual(game.solved, ['lantern-light']); assert.deepEqual(game.memories, ['black']);
  assert.equal(game.freeUsed, true); assert.equal(game.nextTastingId, 1);
  for (const malformed of [null, false, 4, 'bad']) assert.deepEqual(normaliseGame(malformed), normaliseGame());
});

test('only valid outstanding tastings survive save normalisation', () => {
  const valid = firstBrew(); const id = valid.active.id;
  assert.equal(reload(valid).active.id, id);
  for (const patch of [{ tea: 'unknown' }, { cup: 'unowned' }, { stage: 'finished' }]) {
    const raw = structuredClone(valid); Object.assign(raw.active, patch); assert.equal(reload(raw).active, null);
  }
  const completed = structuredClone(valid); completed.memories = [completed.active.tea]; assert.equal(reload(completed).active, null);
  const impossiblePuzzle = structuredClone(valid); impossiblePuzzle.active.stage = 'puzzle'; assert.equal(reload(impossiblePuzzle).active, null);
});

test('old story saves migrate without losing name, memories, position or wishes', () => {
  const old = profile(undefined), migrated = normaliseJourney(old);
  assert.equal(migrated.name, old.name); assert.deepEqual(migrated.found, old.found);
  assert.deepEqual(migrated.position, old.position); assert.deepEqual(migrated.wishes, old.wishes);
  assert.deepEqual(migrated.game, normaliseGame()); assert.equal(normaliseJourney(null), null);
});

test('storage round trips coins, cups, energy, discoveries, rewards and an interrupted film together', () => {
  const store = storage(), game = firstBrew(); game.energy = 40; game.discovered = true;
  solveRiddle(game, RIDDLES[0].id, RIDDLES[0].answer); drinkTea(game); checkpointVideo(game, 5.25);
  assert(writeJourney(store, profile(game)));
  assert.deepEqual(readJourney(store), normaliseJourney(profile(game)));
  const restored = readJourney(store); finishTasting(restored.game, restored.game.active.id);
  assert(writeJourney(store, restored)); assert.equal(readJourney(store).game.mooncakes, 1);
  assert.equal(readJourney(store).game.active, null);
});

test('a reload between tea reward and journal callbacks retains the original tea memory exactly once', () => {
  const store = storage(), game = completeFirst();
  const pendingFrontend = profile(game);
  assert.equal(pendingFrontend.found.includes('tea'), false);
  assert(writeJourney(store, pendingFrontend));
  const restored = readJourney(store);
  assert.equal(restored.found.filter(id => id === 'tea').length, 1);
  assert.equal(restored.game.mooncakes, 1);
  assert(writeJourney(store, restored));
  assert.equal(readJourney(store).found.filter(id => id === 'tea').length, 1);
  // Other teas do not reveal oolong's story; old story-only saves keep a free tasting.
  const otherTea = normaliseGame({ memories: ['black'] });
  assert.equal(normaliseJourney(profile(otherTea)).found.includes('tea'), false);
  const legacy = normaliseJourney({ ...profile(undefined), found: ['tea'] });
  assert.equal(legacy.game.freeUsed, false);
});

test('invalid JSON and blocked or full storage fail safely without changing the live game', () => {
  const store = storage(); store.setItem(JOURNEY_SAVE_KEY, '{broken'); assert.equal(readJourney(store), null);
  const game = firstBrew(), before = structuredClone(game);
  const blocked = { getItem() { throw new Error('blocked'); }, setItem() { throw new Error('quota'); } };
  assert.equal(readJourney(blocked), null); assert.equal(writeJourney(blocked, profile(game)), false);
  assert.equal(writeJourney(store, { name: '' }), false); assert.deepEqual(game, before);
});

test('all riddle, cup, table and instruction-card interaction zones are reachable on foot', () => {
  const queue = [{ x: 0, z: 22 }], seen = new Set(['0,22']);
  for (let i = 0; i < queue.length; i++) {
    const p = queue[i];
    for (const [dx, dz] of [[.5, 0], [-.5, 0], [0, .5], [0, -.5]]) {
      const x = p.x + dx, z = p.z + dz, key = `${x},${z}`;
      if (!seen.has(key) && isWalkable(x, z)) { seen.add(key); queue.push({ x, z }); }
    }
  }
  const game = normaliseGame();
  for (const item of [...RIDDLES, ...CUPS, TEA_TABLE, RITUAL_CARD]) {
    assert(queue.some(p => nearestGameObject(game, p.x, p.z, insideTeahouse(p.x, p.z))?.id === item.id), `${item.id} is not reachable`);
  }
});
