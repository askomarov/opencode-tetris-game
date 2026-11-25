// Piece bag, spawning and rotation.

import { COLS, KICKS_I, KICKS_JLSTZ, SHAPES } from './config.js';
import { game } from './state.js';
import { collidesAt } from './board.js';

function refillBag() {
  const types = Object.keys(SHAPES);
  for (let i = types.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [types[i], types[j]] = [types[j], types[i]];
  }
  game.bag.push(...types);
}

function nextFromBag() {
  if (game.bag.length === 0) refillBag();
  return game.bag.shift();
}

/**
 * Spawns the next piece at the top of the board.
 * Returns false when the spawn position is blocked (top out).
 */
export function spawnPiece() {
  const type = game.nextType || nextFromBag();
  game.nextType = nextFromBag();

  const matrix = SHAPES[type].map((row) => row.slice());
  let top = 0;
  while (top < matrix.length && !matrix[top].some(Boolean)) top++;

  const piece = {
    type,
    matrix,
    rotation: 0,
    x: Math.floor((COLS - matrix[0].length) / 2),
    y: -top,
  };

  if (collidesAt(piece, piece.x, piece.y)) {
    game.current = null;
    return false;
  }

  game.current = piece;
  game.dropTimer = 0;
  return true;
}

function rotateMatrix(matrix, dir) {
  const n = matrix.length;
  const out = Array.from({ length: n }, () => Array(n).fill(0));
  for (let y = 0; y < n; y++) {
    for (let x = 0; x < n; x++) {
      if (matrix[y][x]) {
        if (dir > 0) out[x][n - 1 - y] = matrix[y][x];
        else out[n - 1 - x][y] = matrix[y][x];
      }
    }
  }
  return out;
}

/**
 * Rotates the active piece with SRS wall kicks.
 * Collision must be checked against the rotated matrix, not the current one.
 */
export function rotateCurrent(dir) {
  const piece = game.current;
  if (!piece) return;

  const from = piece.rotation;
  const to = (from + (dir > 0 ? 1 : 3)) % 4;
  const rotated = rotateMatrix(piece.matrix, dir);
  const table = piece.type === 'I' ? KICKS_I : KICKS_JLSTZ;
  const kicks = table[`${from}>${to}`] || [[0, 0]];

  for (const [dx, dy] of kicks) {
    if (!collidesAt({ matrix: rotated }, piece.x + dx, piece.y - dy)) {
      piece.matrix = rotated;
      piece.rotation = to;
      piece.x += dx;
      piece.y -= dy;
      return;
    }
  }
}
