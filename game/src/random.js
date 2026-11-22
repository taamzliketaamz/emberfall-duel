// Deterministic randomness: a mulberry32 generator plus a Fisher-Yates shuffle driven by it.
// The same seed always deals the same decks, which is what makes the screenshot states and
// every staged duel reproducible byte for byte.

/** Create a generator function returning floats in [0, 1) from a 32-bit seed. */
export function createRandom(seed) {
  let state = seed >>> 0;
  return function next() {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Shuffle a copy of `items` with the given generator and return the copy. */
export function shuffled(items, next) {
  const out = items.slice();
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(next() * (i + 1));
    const tmp = out[i];
    out[i] = out[j];
    out[j] = tmp;
  }
  return out;
}

/** Pick an integer in [0, bound) from the generator. */
export function pickIndex(next, bound) {
  return Math.floor(next() * bound);
}
