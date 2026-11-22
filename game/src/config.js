// EMBERFALL DUEL — shared constants: field size, duelist stats, the four suits and the card pool.
// Everything visual derives from these numbers so the table, the cards and the banners stay
// proportional when the 1280x720 canvas is shrunk to the judge's 768x480 contact sheet.

export const FIELD = { width: 1280, height: 720 };

/** Fixed simulation step for shot staging (the live game is turn-based, no reflexes needed). */
export const STEP = 1 / 60;

export const DUEL = {
  life: 24,
  handSize: 4,
  energyPerTurn: 3,
  maxTurns: 12,
};

/** Suit ids in advantage order: each suit beats the next one in the cycle, gilt stands apart. */
export const SUIT = { EMBER: 0, GROVE: 1, TIDE: 2, GILT: 3 };

export const SUITS = [
  { id: SUIT.EMBER, name: 'Ember', color: '#e2483a', dark: '#8f2318', glyph: '▲' },
  { id: SUIT.GROVE, name: 'Grove', color: '#3f9e4d', dark: '#1f6129', glyph: '◆' },
  { id: SUIT.TIDE, name: 'Tide', color: '#3a7bd5', dark: '#1d4e89', glyph: '●' },
  { id: SUIT.GILT, name: 'Gilt', color: '#d9a514', dark: '#8a6508', glyph: '★' },
];

/** Power bonus when a card's suit beats the opposing card's suit. */
export const SUIT_BONUS = 2;

/**
 * The 16-card pool both duelists draw from (two copies of the deck are shuffled together).
 * kind 'strike' deals clash damage; kind 'guard' halves incoming damage and never deals any.
 */
export const CARD_POOL = [
  { name: 'Cinder Jab', suit: SUIT.EMBER, cost: 1, power: 3, kind: 'strike' },
  { name: 'Flame Arc', suit: SUIT.EMBER, cost: 2, power: 5, kind: 'strike' },
  { name: 'Pyre Lord', suit: SUIT.EMBER, cost: 3, power: 8, kind: 'strike' },
  { name: 'Ember Wall', suit: SUIT.EMBER, cost: 1, power: 4, kind: 'guard' },
  { name: 'Thorn Snap', suit: SUIT.GROVE, cost: 1, power: 3, kind: 'strike' },
  { name: 'Vine Lash', suit: SUIT.GROVE, cost: 2, power: 5, kind: 'strike' },
  { name: 'Old Oak Fist', suit: SUIT.GROVE, cost: 3, power: 8, kind: 'strike' },
  { name: 'Bark Shield', suit: SUIT.GROVE, cost: 1, power: 4, kind: 'guard' },
  { name: 'Rill Cut', suit: SUIT.TIDE, cost: 1, power: 3, kind: 'strike' },
  { name: 'Wave Crash', suit: SUIT.TIDE, cost: 2, power: 5, kind: 'strike' },
  { name: 'Deep Leviathan', suit: SUIT.TIDE, cost: 3, power: 8, kind: 'strike' },
  { name: 'Reef Guard', suit: SUIT.TIDE, cost: 1, power: 4, kind: 'guard' },
  { name: 'Coin Flick', suit: SUIT.GILT, cost: 1, power: 4, kind: 'strike' },
  { name: 'Gilded Lance', suit: SUIT.GILT, cost: 2, power: 6, kind: 'strike' },
  { name: 'Sun Herald', suit: SUIT.GILT, cost: 3, power: 9, kind: 'strike' },
  { name: 'Vault Door', suit: SUIT.GILT, cost: 2, power: 6, kind: 'guard' },
];

export const BEST_KEY = 'emberfall-duel-best';
