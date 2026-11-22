// The screenshot scenes behind ?shot=start|play|end|loss. Each scene plays the real rules
// forward from a fresh deal: both sides follow the house policy, except the loss scene, where
// the player's side follows the hopeless policy — so every frame is a position the game itself
// can honestly reach, and the same seed always stages the same frame.

import { policyPick, worstPick, EVENT_OVER } from './world.js';
import { SCREEN_OVER, SCREEN_PLAY, SCREEN_TITLE } from './render.js';

const PLAY_TURNS = 5;
const MAX_TURNS = 40;

/** Play policy-vs-policy turns until `turns` clashes have happened or the duel ends. */
function playTurns(world, turns, playerPolicy) {
  for (let i = 0; i < turns; i += 1) {
    const pick = playerPolicy(world.state.player.hand, world.state.foe.hand);
    if (world.playTurn(pick) & EVENT_OVER) break;
  }
}

/** Play until the duel ends (bounded, so a stall can never hang the screenshot). */
function playToEnd(world, playerPolicy) {
  for (let i = 0; i < MAX_TURNS; i += 1) {
    const pick = playerPolicy(world.state.player.hand, world.state.foe.hand);
    if (world.playTurn(pick) & EVENT_OVER) break;
  }
}

/**
 * Set `world` to the named scene and return the screen to draw and the score to show.
 * start: the title over a fresh deal. play: five honest turns in, mid-duel.
 * end: a completed duel the player won. loss: a completed duel the player lost.
 */
export function stageShot(name, world) {
  world.reset();
  if (name === 'play') {
    playTurns(world, PLAY_TURNS, policyPick);
    return { screen: SCREEN_PLAY, best: world.score() };
  }
  if (name === 'end') {
    playToEnd(world, policyPick);
    return { screen: SCREEN_OVER, best: world.score() };
  }
  if (name === 'loss') {
    playToEnd(world, worstPick);
    return { screen: SCREEN_OVER, best: world.score() };
  }
  return { screen: SCREEN_TITLE, best: 0 };
}
