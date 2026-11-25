// Collision detection and ghost projection.

import { COLS, ROWS } from './config.js';
import { game } from './state.js';

export function collidesAt(piece, x, y) {
  const m = piece.matrix;
  for (let r = 0; r < m.length; r++) {
    for (let c = 0; c < m[r].length; c++) {
      if (!m[r][c]) continue;
      const nx = x + c;
      const ny = y + r;
      if (nx < 0 || nx >= COLS || ny >= ROWS) return true;
      if (ny >= 0 && game.board[ny][nx]) return true;
    }
  }
  return false;
}

export function collides(piece, dx = 0, dy = 0) {
  return collidesAt(piece, piece.x + dx, piece.y + dy);
}

export function ghostY(piece) {
  let y = piece.y;
  while (!collidesAt(piece, piece.x, y + 1)) y += 1;
  return y;
}
