import './minigames.css';
import * as THREE from 'three';
import { icon } from './icons.js';
import { createBrewingPreview } from './tea-brewing.js';
import { insideTeahouse } from './story.js';
import { createMinigameObjects } from './minigame-world.js';
import { RULES, CUPS, TEAS, RIDDLES, RITUAL, normaliseGame, nearestGameObject, collectCup, solveRiddle, beginTasting, submitRitual, abandonPuzzle, drinkTea, finishTasting, checkpointVideo, eatMooncake, drainEnergy, speedMultiplier } from './minigames.js';

// A small adapter keeps minigames independent of the town and its camera controls.
export function createMinigames({ world, assets, getProfile, save, notify, openDialog, onMemory, onProgress = () => {} }) {
  const $ = id => document.getElementById(id);
  const objects = createMinigameObjects(world.scene);
  const dialog = document.createElement('dialog');
  dialog.id = 'minigame-dialog'; dialog.className = 'paper-dialog minigame-dialog';
  dialog.setAttribute('aria-labelledby', 'game-title');
  dialog.innerHTML = `<button class="close-button" aria-label="Leave this activity">${icon('close')}</button><div id="game-content"></div>`;
  document.body.append(dialog);
  const pouch = document.createElement('button');
  pouch.id = 'pouch-button'; pouch.className = 'pouch-button'; pouch.setAttribute('aria-label', 'Open cups, coins and mooncakes');
  $('hud').append(pouch);
  const thought = document.createElement('div');
  thought.className = 'energy-thought'; thought.hidden = true; thought.setAttribute('role', 'status'); $('hud').append(thought);
  let brewPreview=null;
  let current = null, selectedCup = null, sequence = [], shuffled = [], brewSeconds = 0, video = null, replay = false, lowReminder = -60, thoughtUntil = 0, lastSecond = -1;
  const game = () => getProfile()?.game;
  const persist = () => { updateHud(); objects.sync(game()); save(); onProgress(); };
  function show(markup, focusSelector) {
    if(brewPreview){brewPreview.dispose();brewPreview=null;}
    stopVideo(); $('game-content').innerHTML = markup;
    if (!dialog.open) openDialog(dialog.id);
    if (focusSelector) $('game-content').querySelector(focusSelector)?.focus();
  }
  function title(text, description) { return `<h2 id="game-title">${text}</h2>${description ? `<p class="game-intro">${description}</p>` : ''}`; }
  function button(label, id, primary = true) { return `<button id="${id}" class="${primary ? 'primary' : 'text-button'}">${label}${primary ? icon('arrowRight') : ''}</button>`; }
  function close() { dialog.close(); }
  dialog.querySelector('.close-button').onclick = close;
  dialog.addEventListener('close', () => { if(brewPreview){brewPreview.dispose();brewPreview=null;}stopVideo(); current = null; persist(); });
  dialog.addEventListener('click', e => {
    if (e.target !== dialog) return;
    const r = dialog.getBoundingClientRect();
    if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) close();
  });
  pouch.onclick = openPouch;
  const pauseFilm=()=>{if(video){video.pause();const button=$('play-video');if(button)button.hidden=false;if(!replay&&game()?.active){checkpointVideo(game(),video.currentTime,Number(video.dataset.tastingId));save();}}};
  document.addEventListener('visibilitychange',()=>{if(document.hidden)pauseFilm();});window.addEventListener('blur',pauseFilm);

  function updateHud() {
    const g = game(); if (!g) return;
    const energy = Math.ceil(g.energy);
    pouch.innerHTML = `<span class="pouch-energy">${energy}<small>energy</small></span><span>${g.coins}<small>coins</small></span><span>${g.mooncakes}<small>mooncakes</small></span><span class="pouch-open">${icon('tea')}</span>`;
    pouch.classList.toggle('low-energy', g.energy < RULES.lowEnergy);
    pouch.title = `${g.cups.length} ${g.cups.length === 1 ? 'cup' : 'cups'} · ${g.memories.length} of 3 tea memories · Open your pouch`;
  }
  function openPouch() {
    const g = game(); if (!g) return; current = 'pouch';
    show(title('Little provisions', 'A cup to keep. Something for the next climb.') +
      `<div class="pouch-summary"><span><b>${Math.ceil(g.energy)} / 100</b> energy</span><span><b>${g.coins}</b> coins</span><span><b>${g.mooncakes}</b> mooncakes</span></div>` +
      `<h3>Your cups <span>${g.cups.length} / 2</span></h3><div class="owned-cups">${g.cups.length ? CUPS.filter(c => g.cups.includes(c.id)).map(c => `<span style="--cup-colour:${c.colour}">${icon('tea')}${c.name}</span>`).join('') : 'Explore the street to find a tea cup.'}</div>` +
      `<p class="game-note">Cups are reusable. Each mooncake restores up to 40 energy.</p>` +
      button(g.energy >= 100 ? 'Your energy is full' : g.mooncakes ? 'Eat a mooncake · +40 energy' : 'No mooncakes yet', 'eat-cake') +
      `<h3>Tea memories <span>${g.memories.length} / 3</span></h3><div class="tea-memories">${TEAS.map(t => `<button class="tea-memory" data-replay="${t.id}" ${g.memories.includes(t.id) ? '' : 'disabled'}><span>${g.memories.includes(t.id) ? t.memory : 'A memory waiting'}</span><small>${t.name}${g.memories.includes(t.id) ? ' · Replay free' : ''}</small></button>`).join('')}</div>` +
      `<p class="game-note">${g.solved.length} / 3 lantern riddles solved. ${g.discovered ? 'Rainlight Teahouse is on the western ridge.' : 'A discreet tea sign waits beyond the banyan, along the western ridge.'}</p>`);
    $('eat-cake').disabled = !g.mooncakes || g.energy >= 100;
    $('eat-cake').onclick = () => { if (eatMooncake(g)) { persist(); openPouch(); } };
    for (const b of dialog.querySelectorAll('[data-replay]')) b.onclick = () => openVideo(b.dataset.replay, true);
  }
  function openRiddle(riddle) {
    current = riddle.id; const solved = game().solved.includes(riddle.id);
    show(title('A light, a little riddle', `${riddle.place} · ${solved ? 'Solved' : '10 coins for a correct answer'}`) +
      `<div class="riddle-mark">${icon('lantern')}</div><p class="riddle-question">${riddle.question}</p>` +
      (solved ? `<p class="game-feedback success">${riddle.explanation}<br>Your 10 coins have already been collected.</p>${button('Back to the street', 'riddle-done')}` :
        `<div class="riddle-answers">${riddle.answers.map((answer, i) => `<button data-answer="${i}">${answer}</button>`).join('')}</div><p id="riddle-feedback" class="game-feedback" role="status">Take your time. You can try again freely.</p>`));
    if (solved) { $('riddle-done').onclick = close; return; }
    for (const answer of dialog.querySelectorAll('[data-answer]')) answer.onclick = () => {
      const result = solveRiddle(game(), riddle.id, Number(answer.dataset.answer));
      if (result === 'wrong') { $('riddle-feedback').textContent = riddle.hint; return; }
      if (result !== 'correct') return;
      persist();
      for (const b of dialog.querySelectorAll('[data-answer]')) b.disabled = true;
      answer.classList.add('correct');
      $('riddle-feedback').classList.add('success');
      $('riddle-feedback').textContent = `${riddle.explanation} +10 coins, kept in your pouch.`;
      $('game-content').insertAdjacentHTML('beforeend', button('Back to the street', 'riddle-done'));
      $('riddle-done').onclick = close; $('riddle-done').focus();
    };
  }
  function openCard() {
    current = 'card'; show(title('The house ritual', 'A small card beside the tea table. Read it at your own pace.') +
      `<ol class="ritual-card">${RITUAL.map(s => `<li>${s.text}</li>`).join('')}</ol><p class="game-note">Warm first. Leaves next. Give them water and time. Then taste.</p>` + button('Keep it in mind', 'card-done'));
    $('card-done').onclick = close;
  }
  function openTable() {
    const g = game(); current = 'table';
    if (g.active) { resumeTasting(); return; }
    if (!g.cups.length) {
      show(title('A place at the table', 'You’ll need a tea cup. Explore the street to find one.') + `<div class="empty-tea">${icon('tea')}</div><p class="game-note">Look near the bus stop or the banyan courtyard. You can explore the teahouse freely.</p>` + button('Keep exploring', 'tea-leave'));
      $('tea-leave').onclick = close; return;
    }
    selectedCup = g.cups.includes(selectedCup) ? selectedCup : null;
    show(title('Choose your cup', 'Keep whichever feels familiar. Every cup can taste every tea.') +
      `<div class="cup-choices">${CUPS.filter(c => g.cups.includes(c.id)).map(c => `<button data-cup="${c.id}" style="--cup-colour:${c.colour}">${icon('tea')}<strong>${c.name}</strong><span>${c.description}</span><small>Reusable</small></button>`).join('')}</div>` +
      `<p class="game-note">${g.freeUsed ? `A new tea costs 10 coins. You have ${g.coins}.` : 'Your first tasting is on the house.'}</p>`);
    for (const b of dialog.querySelectorAll('[data-cup]')) b.onclick = () => { selectedCup = b.dataset.cup; objects.selectCup(selectedCup); openTeas(); };
  }
  function openTeas() {
    const g = game(), cup = CUPS.find(c => c.id === selectedCup); current = 'teas';
    show(title('What comes back?', `${cup.name} · ${g.coins} coins`) +
      `<div class="tea-choices">${TEAS.map(t => `<button data-tea="${t.id}"><span><strong>${t.name}</strong><small>${t.note}</small></span><span class="tea-price">${g.memories.includes(t.id) ? 'Replay memory · Free' : g.freeUsed ? '10 coins' : 'First tasting · Free'}</span></button>`).join('')}</div>` +
      `<p class="game-note">A new tasting restores 20 energy and brings back one memory and one mooncake.</p><p id="tea-feedback" class="game-feedback" role="status"></p>` + button('Choose a different cup', 'change-cup', false));
    $('change-cup').onclick = openTable;
    for (const b of dialog.querySelectorAll('[data-tea]')) b.onclick = () => {
      if (current !== 'teas') return;
      const result = beginTasting(g, selectedCup, b.dataset.tea);
      if (result === 'no-coins') { $('tea-feedback').textContent = 'You need 10 coins. Find an unsolved lantern riddle along the street.'; return; }
      if (result === 'replay') { openVideo(b.dataset.tea, true); return; }
      persist(); resumeTasting();
    };
  }
  function resumeTasting() {
    const active = game().active; if (!active) { openTable(); return; }
    objects.selectCup(active.cup);
    if (active.stage === 'puzzle') openPuzzle();
    else if (active.stage === 'brewing') openBrewing();
    else openVideo(active.tea, false);
  }
  function openPuzzle() {
    current = 'puzzle'; const tastingId=game().active.id; sequence = [];
    shuffled = [...RITUAL];
    for (let i = shuffled.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]; }
    if (shuffled.every((s, i) => s.id === RITUAL[i].id)) shuffled.push(shuffled.shift());
    show(title('A little patience', 'Choose the four steps in the order you would make tea.') +
      `<ol class="ritual-sequence" id="ritual-sequence" aria-label="Your tea ritual"></ol><div class="ritual-options">${shuffled.map(s => `<button data-step="${s.id}">${s.text}</button>`).join('')}</div>` +
      `<p id="ritual-feedback" class="game-feedback" role="status">The instruction card beside the table holds the house ritual.</p>` +
      `<div class="game-actions">${button('Brew this tea', 'check-ritual')}${button('Start again', 'reset-ritual', false)}</div>` + button('Leave the tasting', 'abandon-ritual', false));
    renderSequence();
    for (const b of dialog.querySelectorAll('[data-step]')) b.onclick = () => {
      if (current !== 'puzzle' || sequence.includes(b.dataset.step)) return;
      sequence.push(b.dataset.step); b.disabled = true; renderSequence();
      if (sequence.length === 4) $('check-ritual').focus();
    };
    $('reset-ritual').onclick = () => { sequence = []; for (const b of dialog.querySelectorAll('[data-step]')) b.disabled = false; renderSequence(); };
    $('abandon-ritual').onclick = () => { abandonPuzzle(game(),tastingId); persist(); close(); };
    $('check-ritual').onclick = () => {
      if (submitRitual(game(), sequence,tastingId)) { persist(); openBrewing(); return; }
      const wrong = RITUAL.findIndex((s, i) => sequence[i] !== s.id);
      $('ritual-feedback').textContent = `For step ${wrong + 1}: ${RITUAL[wrong].text.toLowerCase()}. Start again and take your time. Your first tasting is still free.`;
    };
  }
  function renderSequence() {
    $('ritual-sequence').innerHTML = Array.from({ length: 4 }, (_, i) => `<li class="${sequence[i] ? 'filled' : ''}"><span>${i + 1}</span>${sequence[i] ? RITUAL.find(s => s.id === sequence[i]).text : 'Choose a step'}</li>`).join('');
    $('check-ritual').disabled = sequence.length !== 4;
  }
  function openBrewing() {
    current = 'brewing'; brewSeconds = 0;
    const active = game().active, tastingId=active.id, cup = CUPS.find(c => c.id === active.cup), tea = TEAS.find(t => t.id === active.tea);
    show(title('Let it steep', `${tea.name} · ${cup.name}`) +
      `<canvas id="brewing-preview" class="brewing-preview" aria-label="A teapot warms, receives leaves, steeps and pours into your selected cup"></canvas>` +
      `<p id="brewing-step" class="brewing-step" role="status">Warming the vessel…</p><progress id="brew-progress" max="8" value="0" aria-label="Tea brewing"></progress>` +
      `<p class="game-note">A little time for the leaves to open. You can leave and resume this tasting without paying again.</p>` + button('Drink tea · +20 energy', 'drink-tea'));
    brewPreview=createBrewingPreview($('brewing-preview'),assets,cup.colour);
    $('drink-tea').disabled = true;
    $('drink-tea').onclick = () => { if (!drinkTea(game(),tastingId)) return; persist(); openVideo(game().active.tea, false); };
  }
  function stopVideo() {
    if (!video) return;
    const old = video; video = null;
    if (!replay && game()?.active?.stage === 'video') checkpointVideo(game(), old.currentTime || 0,Number(old.dataset.tastingId));
    old.onended = null; old.ontimeupdate = null; old.onerror = null; old.onloadedmetadata = null; old.pause();
  }
  function openVideo(id, isReplay) {
    const tea = TEAS.find(t => t.id === id); if (!tea) return;
    current = 'video';
    show(title(tea.memory, `${tea.name} · ${isReplay ? 'A memory to revisit' : 'Tea drunk. A memory returns.'}`) +
      `<div class="flashback"><video id="tea-video" playsinline controls preload="auto" aria-label="${tea.memory}"></video><p id="flashback-caption" class="flashback-caption">${tea.lines[0]}</p></div>` +
      `<p id="video-status" class="game-note" role="status">${isReplay ? 'Replay freely. Rewards are given only on your first tasting.' : 'Your place is saved if you leave. Skipping also keeps the memory.'}</p><div class="game-actions">${button('Play memory', 'play-video')}${button(isReplay ? 'Back to your pouch' : 'Skip and keep memory', 'finish-video', false)}</div>`);
    replay = isReplay; video = $('tea-video');
    const tastingId=isReplay?null:game().active.id;video.dataset.tastingId=tastingId;
    const player = video; player.src = window.__EVERMEMORY_MEDIA__?.[tea.video] || tea.video;
    let lastVideoSave=-1;
    const startAt = isReplay ? 0 : game().active?.videoTime || 0;
    player.onloadedmetadata = () => { player.currentTime = Math.min(startAt, Math.max(0, player.duration - .2)); };
    player.ontimeupdate = () => {
      if (video !== player) return;
      $('flashback-caption').textContent = tea.lines[Math.min(2, Math.floor(player.currentTime / Math.max(.1, player.duration / 3)))] || tea.lines[0];
      if (!isReplay && game().active?.tea === id) {checkpointVideo(game(), player.currentTime,tastingId);if(Math.floor(player.currentTime/2)!==lastVideoSave){lastVideoSave=Math.floor(player.currentTime/2);save();}}
    };
    player.onerror = () => {
      $('video-status').textContent = 'This film could not load. You can read the memory below, then keep it, or leave and try again.';
      $('flashback-caption').textContent = tea.lines.join(' ');
      $('play-video').disabled = true;
    };
    $('play-video').onclick = async () => {
      try { await player.play(); if (video === player) $('play-video').hidden = true; }
      catch { if (video === player) $('video-status').textContent = 'Playback paused. Use the video controls to try again, or keep the memory below.'; }
    };
    const complete = () => {
      if (current !== 'video' || video !== player) return;
      if (isReplay) { openPouch(); return; }
      const teaId = finishTasting(game(),tastingId); if (!teaId) return;
      current = 'reward'; persist(); onMemory(teaId);
      show(title('A little more like home', tea.memory) + `<div class="memory-reward">${icon('tea')}<p>One memory, kept.<br>One mooncake for the road.</p></div>` +
        `<p class="game-note">${game().memories.length} of 3 tea memories recovered. ${game().memories.length === 3 ? 'That night is yours again.' : 'Another tea holds another part of that night.'}</p>` + button('Stay for another cup', 'more-tea') + button('Back to exploring', 'tea-done', false));
      $('more-tea').onclick = openTable; $('tea-done').onclick = close;
    };
    player.onended = complete; $('finish-video').onclick = complete;
  }
  return {
    start() {
      const profile = getProfile(); profile.game = normaliseGame(profile.game);
      selectedCup = null; current = null; lowReminder = -60; thought.hidden = true;
      objects.selectCup(profile.game.active?.cup || null); objects.sync(profile.game); updateHud();
    },
    nearby(x, z) { return game() ? nearestGameObject(game(), x, z, insideTeahouse(x, z)) : null; },
    interact(item) {
      if (!item || !game()) return false;
      if (item.kind === 'riddle') openRiddle(item);
      else if (item.kind === 'cup') { if (collectCup(game(), item.id)) { persist(); notify(`${item.name}, kept. Take it to Rainlight Teahouse on the western ridge.`); } }
      else if (item.kind === 'table') openTable();
      else if (item.kind === 'card') openCard();
      else return false;
      return true;
    },
    table: openTable,
    speed() { return game() ? speedMultiplier(game()) : 1; },
    update(dt, time, position, moving, paused, reduced) {
      const g = game(); if (!g) return;
      drainEnergy(g, dt, moving, paused);
      if (!g.discovered && insideTeahouse(position.x, position.z)) { g.discovered = true; persist(); notify('Rainlight Teahouse. A quiet table, and a ritual card beside it.'); }
      if (dialog.open && current === 'brewing' && g.active?.stage === 'brewing') {
        brewSeconds = Math.min(8, brewSeconds + dt);brewPreview?.update(brewSeconds,reduced); $('brew-progress').value = brewSeconds;
        $('brewing-step').textContent = brewSeconds >= 8 ? 'Your tea is ready.' : ['Warming the vessel…', 'Adding the leaves…', 'Pouring water. Letting it steep…', 'Pouring a cup, just for you…'][Math.floor(brewSeconds / 2)];
        $('drink-tea').disabled = brewSeconds < 8;
      }
      objects.update(time, dialog.open && current === 'brewing', reduced);
      if (g.energy < RULES.lowEnergy && moving && !paused && time - lowReminder > 35) {
        thought.textContent = g.mooncakes ? 'I should eat a mooncake…' : 'Some tea and a mooncake would help…';
        thoughtUntil = time + 5; lowReminder = time;
      }
      thought.hidden = time > thoughtUntil || paused || g.energy >= RULES.lowEnergy;
      if (!thought.hidden) { const point = new THREE.Vector3(position.x, position.y + 2.5, position.z).project(world.camera); thought.style.left = `${(point.x + 1) * innerWidth / 2}px`; thought.style.top = `${(1 - point.y) * innerHeight / 2}px`; }
      if (Math.floor(time) !== lastSecond) { updateHud(); lastSecond = Math.floor(time); }
    },
  };
}
