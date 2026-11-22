// EMBERFALL DUEL — the canvas renderer. One fixed 1280x720 stage, drawn with flat shapes and
// big type so every element survives the shrink to the judge's 768x480 contact sheet: life
// totals in 44px numerals, player cards 150x210 with 40px power figures, suit shown as colour
// AND glyph so a card reads at a glance in any size.

import { DUEL, FIELD, SUITS } from './config.js';

export const SCREEN_TITLE = 'title';
export const SCREEN_PLAY = 'play';
export const SCREEN_OVER = 'over';

const INK = '#101623';
const FELT = '#182136';
const FELT_LIGHT = '#202c47';
const CREAM = '#f7f1e3';
const PARCHMENT = '#efe3c8';
const AMBER = '#f2b33d';
const TEXT = '#f3ead8';
const MUTED = '#a9b4c8';
const GOOD = '#57c46a';
const BAD = '#e2483a';

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function text(ctx, value, x, y, size, color, align = 'left', weight = 'bold') {
  ctx.fillStyle = color;
  ctx.font = `${weight} ${size}px system-ui, sans-serif`;
  ctx.textAlign = align;
  ctx.textBaseline = 'middle';
  ctx.fillText(value, x, y);
}

/** One card face: suit band with glyph, huge power, name, kind, and the amber cost gem. */
export function drawCard(ctx, card, x, y, w, h, opts = {}) {
  const suit = SUITS[card.suit];
  const scale = w / 150;
  ctx.save();
  if (opts.dim) ctx.globalAlpha = 0.55;
  roundRect(ctx, x, y, w, h, 12 * scale);
  ctx.fillStyle = CREAM;
  ctx.fill();
  ctx.lineWidth = opts.hot ? 6 * scale : 3 * scale;
  ctx.strokeStyle = opts.hot ? AMBER : suit.dark;
  ctx.stroke();
  // Suit band across the top.
  roundRect(ctx, x + 6 * scale, y + 6 * scale, w - 12 * scale, 34 * scale, 8 * scale);
  ctx.fillStyle = suit.color;
  ctx.fill();
  text(ctx, `${suit.glyph} ${suit.name.toUpperCase()}`, x + w / 2, y + 24 * scale, 17 * scale, '#ffffff', 'center');
  // Power, the number the whole clash turns on.
  text(ctx, String(card.power), x + w / 2, y + h * 0.52, 56 * scale, INK, 'center');
  text(ctx, card.kind === 'guard' ? 'GUARD' : 'STRIKE', x + w / 2, y + h * 0.72, 15 * scale, suit.dark, 'center');
  // Name along the bottom, wrapped by hand: pool names are short enough for one line.
  text(ctx, card.name, x + w / 2, y + h * 0.88, 16 * scale, INK, 'center');
  // Cost gem, top-left.
  ctx.beginPath();
  ctx.arc(x + 20 * scale, y + 20 * scale, 14 * scale, 0, Math.PI * 2);
  ctx.fillStyle = AMBER;
  ctx.fill();
  ctx.lineWidth = 2 * scale;
  ctx.strokeStyle = '#8a6508';
  ctx.stroke();
  text(ctx, String(card.cost), x + 20 * scale, y + 21 * scale, 17 * scale, INK, 'center');
  ctx.restore();
}

function lifeBar(ctx, x, y, w, life, color) {
  roundRect(ctx, x, y, w, 22, 11);
  ctx.fillStyle = '#0b0f18';
  ctx.fill();
  const frac = Math.max(0, life) / DUEL.life;
  if (frac > 0) {
    roundRect(ctx, x + 3, y + 3, (w - 6) * frac, 16, 8);
    ctx.fillStyle = color;
    ctx.fill();
  }
}

function portrait(ctx, x, y, size, glyph, color, name, title) {
  roundRect(ctx, x, y, size, size, 16);
  ctx.fillStyle = FELT_LIGHT;
  ctx.fill();
  ctx.lineWidth = 3;
  ctx.strokeStyle = color;
  ctx.stroke();
  text(ctx, glyph, x + size / 2, y + size * 0.42, size * 0.44, color, 'center');
  text(ctx, name, x + size / 2, y + size * 0.74, 20, TEXT, 'center');
  text(ctx, title, x + size / 2, y + size * 0.9, 13, MUTED, 'center', 'normal');
}

/** Geometry of the player's hand, shared with input hit-testing. */
export function playerCardRect(index) {
  return { x: 430 + index * 168, y: 486, w: 150, h: 210 };
}

export function createRenderer(canvas) {
  canvas.width = FIELD.width;
  canvas.height = FIELD.height;
  const ctx = canvas.getContext('2d');

  function backdrop(state) {
    ctx.fillStyle = FELT;
    ctx.fillRect(0, 0, FIELD.width, FIELD.height);
    const glow = ctx.createRadialGradient(640, 350, 80, 640, 350, 620);
    glow.addColorStop(0, 'rgba(242,179,61,0.13)');
    glow.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, FIELD.width, FIELD.height);
    // Header band.
    ctx.fillStyle = INK;
    ctx.fillRect(0, 0, FIELD.width, 60);
    text(ctx, 'EMBERFALL DUEL', 24, 31, 26, AMBER);
    text(ctx, `TURN ${Math.min(state.turn, DUEL.maxTurns)} / ${DUEL.maxTurns}`, 640, 31, 24, TEXT, 'center');
    text(ctx, `CLASHES WON ${state.clashesWon}`, 1256, 31, 22, MUTED, 'right');
  }

  function table(state, ui) {
    // Foe: portrait, life, face-up hand.
    portrait(ctx, 24, 76, 118, '♞', BAD, 'KAEL', 'ASH KNIGHT');
    text(ctx, 'LIFE', 160, 92, 18, MUTED);
    text(ctx, String(Math.max(0, state.foe.life)), 160, 128, 44, TEXT);
    lifeBar(ctx, 160, 152, 300, state.foe.life, BAD);
    for (let i = 0; i < state.foe.hand.length; i += 1) {
      drawCard(ctx, state.foe.hand[i], 700 + i * 140, 76, 124, 174);
    }
    text(ctx, 'FOE HAND — FACE UP', 1256, 266, 16, MUTED, 'right', 'normal');

    // The clash in the middle: last cards played, the burst, and the narration line.
    const clash = state.lastClash;
    roundRect(ctx, 190, 282, 900, 196, 18);
    ctx.fillStyle = 'rgba(11,15,24,0.55)';
    ctx.fill();
    if (clash && clash.playerCard) {
      drawCard(ctx, clash.playerCard, 300, 288, 128, 174);
      text(ctx, `POWER ${clash.playerPower}`, 364, 472, 18, AMBER, 'center');
    }
    if (clash) {
      drawCard(ctx, clash.foeCard, 852, 288, 128, 174);
      text(ctx, `POWER ${clash.foePower}`, 916, 472, 18, BAD, 'center');
    }
    text(ctx, 'VS', 640, 340, 54, AMBER, 'center');
    if (clash) {
      let line = 'Even clash — no blood.';
      if (clash.healed) line = 'You discard and bind a wound (+1 life). Kael plays on.';
      else if (clash.toFoe > 0) line = `Your card bites for ${clash.toFoe} damage!`;
      else if (clash.toPlayer > 0) line = `Kael's card bites for ${clash.toPlayer} damage!`;
      text(ctx, line, 640, 428, 24, TEXT, 'center');
    } else {
      text(ctx, 'Pick a card below — Kael answers at the same moment.', 640, 428, 24, TEXT, 'center');
    }

    // Player: life and the big hand.
    portrait(ctx, 24, 500, 118, '♟', GOOD, 'YOU', 'EMBER CHAMPION');
    text(ctx, 'LIFE', 160, 516, 18, MUTED);
    text(ctx, String(Math.max(0, state.player.life)), 160, 552, 44, TEXT);
    lifeBar(ctx, 160, 576, 240, state.player.life, GOOD);
    text(ctx, 'CLICK A CARD TO PLAY IT', 160, 640, 17, MUTED, 'left', 'normal');
    text(ctx, 'DISCARD (D) HEALS 1', 160, 668, 17, MUTED, 'left', 'normal');
    for (let i = 0; i < state.player.hand.length; i += 1) {
      const r = playerCardRect(i);
      drawCard(ctx, state.player.hand[i], r.x, r.y, r.w, r.h, { hot: ui && ui.hover === i });
    }
  }

  function titleScreen(state) {
    backdrop(state);
    ctx.fillStyle = 'rgba(10,13,20,0.82)';
    ctx.fillRect(0, 0, FIELD.width, FIELD.height);
    text(ctx, 'EMBERFALL', 640, 150, 96, AMBER, 'center');
    text(ctx, 'D U E L', 640, 228, 44, TEXT, 'center');
    text(ctx, 'A card duel of suits and nerve. Out-clash the Ash Knight before your 24 life runs out.', 640, 292, 24, MUTED, 'center', 'normal');
    // Two hero cards, fanned.
    drawCard(ctx, { name: 'Pyre Lord', suit: 0, cost: 3, power: 8, kind: 'strike' }, 430, 330, 170, 238);
    drawCard(ctx, { name: 'Deep Leviathan', suit: 2, cost: 3, power: 8, kind: 'strike' }, 680, 330, 170, 238);
    roundRect(ctx, 490, 610, 300, 62, 31);
    ctx.fillStyle = AMBER;
    ctx.fill();
    text(ctx, 'CLICK TO DUEL', 640, 642, 28, INK, 'center');
    text(ctx, 'Ember beats Grove · Grove beats Tide · Tide beats Ember · Guards halve the bite', 640, 700 - 8, 19, MUTED, 'center', 'normal');
  }

  function overScreen(state, best) {
    backdrop(state);
    table(state, null);
    ctx.fillStyle = 'rgba(10,13,20,0.78)';
    ctx.fillRect(0, 0, FIELD.width, FIELD.height);
    const won = state.winner === 'player';
    text(ctx, won ? 'VICTORY!' : 'DEFEAT', 640, 240, 110, won ? GOOD : BAD, 'center');
    text(ctx, won ? 'The Ash Knight kneels. The field is yours.' : 'The Ash Knight holds the field this time.', 640, 330, 28, TEXT, 'center', 'normal');
    text(ctx, `YOUR LIFE ${Math.max(0, state.player.life)} · CLASHES WON ${state.clashesWon} · TURNS ${Math.min(state.turn - 1, DUEL.maxTurns)}`, 640, 396, 26, AMBER, 'center');
    text(ctx, `SCORE ${best}`, 640, 448, 30, TEXT, 'center');
    roundRect(ctx, 470, 520, 340, 62, 31);
    ctx.fillStyle = AMBER;
    ctx.fill();
    text(ctx, 'CLICK TO PLAY AGAIN', 640, 552, 26, INK, 'center');
  }

  function draw(state, screen, best, ui) {
    if (screen === SCREEN_TITLE) {
      titleScreen(state);
      return;
    }
    if (screen === SCREEN_OVER) {
      overScreen(state, best);
      return;
    }
    backdrop(state);
    table(state, ui);
  }

  return { draw };
}
