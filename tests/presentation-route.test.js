import test from 'node:test';
import assert from 'node:assert/strict';
import { findRoute, isWalkable } from '../src/story.js';
import { normaliseGame } from '../src/minigames.js';
import { PRESENTATION_START, PRESENTATION_STOPS, nextPresentationStop } from '../src/presentation-route.js';

const profile = () => ({ name: 'Rowan', gender: 'female', found: [], wishes: [], game: normaliseGame() });

test('the presentation route is one uninterrupted walk from arrival to the wishing terrace', () => {
  const anchors = [PRESENTATION_START, ...PRESENTATION_STOPS];
  for (const anchor of anchors) assert(isWalkable(anchor.x, anchor.z), `${anchor.id || 'start'} must be walkable`);
  for (let index = 1; index < anchors.length; index++) {
    const from = anchors[index - 1], to = anchors[index];
    assert(findRoute(from.x, from.z, to.x, to.z).length, `${from.id || 'start'} must connect to ${to.id}`);
  }
});

test('the story walk advances through memory, cup, riddle, tea and wish in order', () => {
  const journey = profile();
  assert.equal(nextPresentationStop(journey).id, 'arrival-memory');
  journey.found.push('ticket');
  assert.equal(nextPresentationStop(journey).id, 'collect-cup');
  journey.game.cups.push('blue');
  assert.equal(nextPresentationStop(journey).id, 'solve-riddle');
  journey.game.solved.push('lantern-light');
  assert.equal(nextPresentationStop(journey).id, 'find-teahouse');
  journey.game.discovered = true;
  assert.equal(nextPresentationStop(journey).id, 'taste-tea');
  journey.game.memories.push('oolong');
  assert.equal(nextPresentationStop(journey).id, 'release-wish');
  journey.wishes.push('May we remember this night.');
  assert.equal(nextPresentationStop(journey).id, 'story-walk-complete');
});
