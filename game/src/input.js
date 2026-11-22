// Input for a turn-based game: pointer position (for the hover highlight and click-to-play),
// clicks, and two keys — D discards to heal, P pauses. Coordinates are reported in stage space
// (1280x720) so hit-testing uses the renderer's own rectangles.

import { FIELD } from './config.js';

export const ACTION_NONE = 0;
export const ACTION_CONFIRM = 1;
export const ACTION_PAUSE = 2;

/** Map a client point into stage coordinates using the canvas's displayed size. */
function toStage(canvas, clientX, clientY) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: ((clientX - rect.left) / rect.width) * FIELD.width,
    y: ((clientY - rect.top) / rect.height) * FIELD.height,
  };
}

export function createInput(canvas) {
  const input = {
    hover: -1,
    clicked: -1,
    confirm: false,
    discard: false,
    pause: false,
  };

  canvas.addEventListener('pointermove', (event) => {
    const point = toStage(canvas, event.clientX, event.clientY);
    input.hover = cardIndexAt(point);
  });
  canvas.addEventListener('pointerdown', (event) => {
    const point = toStage(canvas, event.clientX, event.clientY);
    const index = cardIndexAt(point);
    if (index >= 0) input.clicked = index;
    else input.confirm = true;
  });
  window.addEventListener('keydown', (event) => {
    if (event.key === 'd' || event.key === 'D') input.discard = true;
    if (event.key === 'p' || event.key === 'P' || event.key === 'Escape') input.pause = true;
    if (event.key === 'Enter' || event.key === ' ') input.confirm = true;
  });

  /** Read and clear the one-shot actions; hover persists. */
  function take() {
    const out = { clicked: input.clicked, confirm: input.confirm, discard: input.discard, pause: input.pause, hover: input.hover };
    input.clicked = -1;
    input.confirm = false;
    input.discard = false;
    input.pause = false;
    return out;
  }

  return { take, get hover() { return input.hover; } };
}

/** Which player card (0..3) a stage point falls in, or -1. Rectangles mirror the renderer. */
export function cardIndexAt(point) {
  for (let i = 0; i < 4; i += 1) {
    const x = 430 + i * 168;
    const y = 486;
    if (point.x >= x && point.x <= x + 150 && point.y >= y && point.y <= y + 210) return i;
  }
  return -1;
}
