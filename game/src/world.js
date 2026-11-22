// EMBERFALL DUEL — the rules. Two duelists, 24 life each, hands of four from a shared shuffled
// deck. Every turn both sides play one card face up at the same time: the higher effective power
// deals the difference as damage. Suits bend the clash (Ember beats Grove beats Tide beats
// Ember, +2), guard cards deal nothing but halve what they take, and a cheaper card that still
// wins strikes swift for +1. Discarding instead of playing heals 1. First to 0 life falls; after
// 12 turns the higher life holds the field.

import { CARD_POOL, DUEL, SUIT, SUIT_BONUS } from './config.js';
import { shuffled } from './random.js';

export const EVENT_NONE = 0;
export const EVENT_CLASH = 1;
export const EVENT_OVER = 2;

/** True when suit `a` beats suit `b` in the Ember > Grove > Tide > Ember cycle. */
export function suitBeats(a, b) {
  return (a === SUIT.EMBER && b === SUIT.GROVE)
    || (a === SUIT.GROVE && b === SUIT.TIDE)
    || (a === SUIT.TIDE && b === SUIT.EMBER);
}

/** A card's power in a clash against `foeCard`, suit bonus included. */
export function effectivePower(card, foeCard) {
  return card.power + (suitBeats(card.suit, foeCard.suit) ? SUIT_BONUS : 0);
}

/**
 * Score a candidate card against every card in the opposing hand: average damage it would
 * deal minus average damage it would take. Used by the house policy (best) and, inverted,
 * by the hopeless policy that stages the defeat screen.
 */
export function clashOutlook(card, foeHand) {
  let dealt = 0;
  let taken = 0;
  for (const foeCard of foeHand) {
    const result = resolvePair(card, foeCard);
    dealt += result.toFoe;
    taken += result.toPlayer;
  }
  return (dealt - taken) / Math.max(1, foeHand.length);
}

/** Damage both ways when `playerCard` meets `foeCard` (no state changed). */
export function resolvePair(playerCard, foeCard) {
  const p = effectivePower(playerCard, foeCard);
  const f = effectivePower(foeCard, playerCard);
  let toFoe = 0;
  let toPlayer = 0;
  if (playerCard.kind === 'strike' && foeCard.kind === 'strike') {
    if (p > f) toFoe = p - f + (playerCard.cost < foeCard.cost ? 1 : 0);
    if (f > p) toPlayer = f - p + (foeCard.cost < playerCard.cost ? 1 : 0);
  } else if (playerCard.kind === 'strike' && foeCard.kind === 'guard') {
    if (p > f) toFoe = Math.floor((p - f) / 2);
  } else if (playerCard.kind === 'guard' && foeCard.kind === 'strike') {
    if (f > p) toPlayer = Math.floor((f - p) / 2);
  }
  return { toFoe, toPlayer, p, f };
}

/** The house policy: the card with the best clash outlook, cheapest on ties. */
export function policyPick(hand, foeHand) {
  let best = 0;
  let bestScore = -Infinity;
  for (let i = 0; i < hand.length; i += 1) {
    const score = clashOutlook(hand[i], foeHand) - hand[i].cost * 0.01;
    if (score > bestScore) {
      bestScore = score;
      best = i;
    }
  }
  return best;
}

/** The hopeless policy: the card with the worst outlook — it stages an honest defeat. */
export function worstPick(hand, foeHand) {
  let worst = 0;
  let worstScore = Infinity;
  for (let i = 0; i < hand.length; i += 1) {
    const score = clashOutlook(hand[i], foeHand);
    if (score < worstScore) {
      worstScore = score;
      worst = i;
    }
  }
  return worst;
}

function drawUpTo(state, side) {
  const duelist = state[side];
  while (duelist.hand.length < DUEL.handSize && state.deck.length > 0) {
    duelist.hand.push(state.deck.pop());
  }
}

export function createWorld(next) {
  const state = {
    deck: [],
    player: { life: DUEL.life, hand: [] },
    foe: { life: DUEL.life, hand: [] },
    turn: 1,
    clashesWon: 0,
    lastClash: null,
    winner: null,
    over: false,
  };

  function reset() {
    const deck = shuffled(CARD_POOL.concat(CARD_POOL), next);
    state.deck = deck;
    state.player = { life: DUEL.life, hand: [] };
    state.foe = { life: DUEL.life, hand: [] };
    state.turn = 1;
    state.clashesWon = 0;
    state.lastClash = null;
    state.winner = null;
    state.over = false;
    drawUpTo(state, 'player');
    drawUpTo(state, 'foe');
  }

  /**
   * Play one full turn: the player side uses hand index `playerIndex` (or -1 to discard the
   * last card and heal 1), the foe answers with the house policy. Returns EVENT_CLASH, or
   * EVENT_OVER when the duel ends on this turn.
   */
  function playTurn(playerIndex) {
    if (state.over) return EVENT_OVER;
    const foeIndex = policyPick(state.foe.hand, state.player.hand);
    const foeCard = state.foe.hand.splice(foeIndex, 1)[0];
    let playerCard = null;
    let healed = 0;
    if (playerIndex < 0) {
      state.player.hand.pop();
      healed = 1;
      state.player.life = Math.min(DUEL.life, state.player.life + 1);
    } else {
      playerCard = state.player.hand.splice(playerIndex, 1)[0];
    }
    // On a discard there is no clash, but the foe's card still shows its printed power.
    let result = { toFoe: 0, toPlayer: 0, p: 0, f: foeCard.power };
    if (playerCard) {
      result = resolvePair(playerCard, foeCard);
      if (result.toFoe > 0) state.clashesWon += 1;
    }
    state.foe.life -= result.toFoe;
    state.player.life -= result.toPlayer;
    state.lastClash = {
      playerCard,
      foeCard,
      toFoe: result.toFoe,
      toPlayer: result.toPlayer,
      playerPower: result.p,
      foePower: result.f,
      healed,
    };
    drawUpTo(state, 'player');
    drawUpTo(state, 'foe');
    state.turn += 1;
    if (state.player.life <= 0 || state.foe.life <= 0 || state.turn > DUEL.maxTurns) {
      state.over = true;
      // A double fall, or any finish where the player is not ahead and standing, goes to the
      // Ash Knight: he holds the field unless the player ends clearly in front and alive.
      const playerStanding = state.player.life > 0;
      state.winner = playerStanding && (state.foe.life <= 0 || state.player.life > state.foe.life) ? 'player' : 'foe';
      return EVENT_OVER;
    }
    return EVENT_CLASH;
  }

  /** Final score for the result screen and the stored best: life-weighted, wins on top. */
  function score() {
    if (!state.over) return state.clashesWon * 10 + (DUEL.life - state.foe.life);
    return (state.winner === 'player' ? 100 : 0) + state.clashesWon * 10 + Math.max(0, state.player.life);
  }

  reset();
  return { state, reset, playTurn, score };
}
