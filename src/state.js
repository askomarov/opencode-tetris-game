// Mutable game state. Kept in one plain object so any module can read/write
// it without threading a dozen references through function arguments.

import { COLS, ROWS } from './config.js';

export function emptyBoard() {
  return Array.from({ length: ROWS }, () => Array(COLS).fill(null));
}

export const game = {
  board: emptyBoard(),
  current: null,
  nextType: null,
  bag: [],

  score: 0,
  lines: 0,
  level: 1,

  dropInterval: 800,
  dropTimer: 0,
  lastTime: 0,

  // 'idle' | 'playing' | 'paused' | 'over'
  status: 'idle',

  // Particles for cleared lines.
  clearAnimations: [],

  // Active touch gesture, or null.
  gesture: null,
};
