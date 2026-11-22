// Boot and the turn loop. EMBERFALL DUEL is turn-based: the renderer paints the current state,
// input is polled each animation frame, and a click on a player card (or D to discard and
// heal) plays one full turn — the foe answers in the same instant, inside world.playTurn.
//
// ?seed=N fixes the deal. ?shot=start|play|end|loss (with &seed=N) stages that scene instead
// of running the loop, paints it twice and sets window.__shotReady for a screenshot.

import { BEST_KEY } from './config.js';
import { createRandom } from './random.js';
import { createWorld, EVENT_OVER } from './world.js';
import { createInput } from './input.js';
import { createRenderer, SCREEN_OVER, SCREEN_PLAY, SCREEN_TITLE } from './render.js';
import { stageShot } from './shots.js';

const params = new URLSearchParams(window.location.search);
const shot = params.get('shot');
const seedParam = Number.parseInt(params.get('seed') ?? '', 10);
const seed = Number.isInteger(seedParam) ? seedParam : Math.floor(Math.random() * 4294967296);

const canvas = document.getElementById('game');
const status = document.getElementById('status');
const world = createWorld(createRandom(seed));
const renderer = createRenderer(canvas);
const input = createInput(canvas);

let screen = SCREEN_TITLE;
let best = readBest();

function readBest() {
  try {
    return Number.parseInt(window.localStorage.getItem(BEST_KEY) ?? '0', 10) || 0;
  } catch {
    return 0;
  }
}

function saveBest(value) {
  try {
    window.localStorage.setItem(BEST_KEY, String(value));
  } catch {
    // Storage can be off (private windows): the best score then lasts this visit only.
  }
}

function announce(message) {
  if (status) status.textContent = message;
}

function runShot(name) {
  const scene = stageShot(name, world);
  let painted = 0;
  function paint() {
    renderer.draw(world.state, scene.screen, scene.best, null);
    painted += 1;
    if (painted < 2) requestAnimationFrame(paint);
    else window.__shotReady = true;
  }
  requestAnimationFrame(paint);
}

function finishDuel() {
  screen = SCREEN_OVER;
  const score = world.score();
  if (score > best) {
    best = score;
    saveBest(best);
  }
  announce(world.state.winner === 'player' ? `Victory. Score ${score}.` : `Defeat. Score ${score}.`);
}

function frame() {
  const actions = input.take();
  if (screen === SCREEN_TITLE) {
    if (actions.confirm || actions.clicked >= 0) {
      world.reset();
      screen = SCREEN_PLAY;
      announce('Duel started. Click a card to play it.');
    }
  } else if (screen === SCREEN_PLAY) {
    let event = 0;
    if (actions.clicked >= 0 && actions.clicked < world.state.player.hand.length) {
      event = world.playTurn(actions.clicked);
    } else if (actions.discard) {
      event = world.playTurn(-1);
    }
    if (event & EVENT_OVER) finishDuel();
    else if (event) {
      const clash = world.state.lastClash;
      if (clash && clash.toFoe > 0) announce(`Your card dealt ${clash.toFoe} damage. Foe life ${Math.max(0, world.state.foe.life)}.`);
      else if (clash && clash.toPlayer > 0) announce(`Kael's card dealt ${clash.toPlayer} damage. Your life ${Math.max(0, world.state.player.life)}.`);
      else announce('Even clash, no damage.');
    }
  } else if (screen === SCREEN_OVER) {
    if (actions.confirm || actions.clicked >= 0) {
      world.reset();
      screen = SCREEN_PLAY;
      announce('New duel. Click a card to play it.');
    }
  }
  renderer.draw(world.state, screen, best, { hover: input.hover });
  requestAnimationFrame(frame);
}

if (shot) runShot(shot);
else requestAnimationFrame(frame);
