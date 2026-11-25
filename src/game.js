// Game flow: actions, locking, line clears and the main loop.

import {
  COLS,
  COLORS,
  DROP_INTERVAL_BASE,
  HARD_DROP_POINTS_PER_ROW,
  LINES_PER_LEVEL,
  LINE_SCORES,
  ROWS,
  SOFT_DROP_POINTS,
  dropIntervalForLevel,
} from './config.js';
import { emptyBoard, game } from './state.js';
import { collides } from './board.js';
import { rotateCurrent, spawnPiece } from './pieces.js';
import { initCanvas, render, renderNext } from './render.js';
import { hideOverlay, showOverlay, updateStats } from './ui.js';
import { initInput, resetGesture } from './input.js';
import { animParams, initTweaks } from './tweaks.js';

// ---------- Actions ----------

function move(dir) {
  const piece = game.current;
  if (!piece) return;
  if (!collides(piece, dir, 0)) piece.x += dir;
}

function softDrop(lockOnBlock = true) {
  const piece = game.current;
  if (!piece) return;
  if (!collides(piece, 0, 1)) {
    piece.y += 1;
    game.score += SOFT_DROP_POINTS;
    updateStats();
    game.dropTimer = 0;
  } else if (lockOnBlock) {
    lockPiece();
  }
}

function hardDrop() {
  const piece = game.current;
  if (!piece) return;
  let distance = 0;
  while (!collides(piece, 0, 1)) {
    piece.y += 1;
    distance += 1;
  }
  game.score += distance * HARD_DROP_POINTS_PER_ROW;
  updateStats();
  lockPiece();
}

function tick() {
  const piece = game.current;
  if (!piece) return;
  if (!collides(piece, 0, 1)) {
    piece.y += 1;
  } else {
    lockPiece();
  }
}

// ---------- Locking & clearing ----------

function lockPiece() {
  const piece = game.current;
  if (!piece) return;

  for (let r = 0; r < piece.matrix.length; r++) {
    for (let c = 0; c < piece.matrix[r].length; c++) {
      if (!piece.matrix[r][c]) continue;
      const x = piece.x + c;
      const y = piece.y + r;
      if (y >= 0 && y < ROWS && x >= 0 && x < COLS) {
        game.board[y][x] = COLORS[piece.type];
      }
    }
  }

  game.current = null;
  clearLines();

  const spawned = spawnPiece();
  renderNext();
  if (!spawned) {
    game.status = 'over';
    showOverlay('over');
  }
}

function clearLines() {
  const kept = game.board.filter((row) => !row.every(Boolean));
  const cleared = ROWS - kept.length;
  if (!cleared) return;

  // Animate only cells from full lines being cleared (velocities in cells/s).
  for (let y = 0; y < ROWS; y++) {
    if (!game.board[y].every(Boolean)) continue;
    for (let x = 0; x < COLS; x++) {
      game.clearAnimations.push({
        x,
        y,
        color: game.board[y][x],
        vx: (Math.random() - 0.5) * animParams.scatter,
        vy: (Math.random() - 0.5) * animParams.scatter * 0.35 - animParams.lift,
        life: 1,
      });
    }
  }

  while (kept.length < ROWS) {
    kept.unshift(Array(COLS).fill(null));
  }
  game.board = kept;

  game.score += LINE_SCORES[cleared] * game.level;
  game.lines += cleared;
  game.level = Math.floor(game.lines / LINES_PER_LEVEL) + 1;
  game.dropInterval = dropIntervalForLevel(game.level);
  updateStats();
}

// ---------- Game flow ----------

function startGame() {
  resetGesture();
  game.board = emptyBoard();
  game.bag = [];
  game.nextType = null;
  game.current = null;
  game.clearAnimations.length = 0;

  game.score = 0;
  game.lines = 0;
  game.level = 1;
  game.dropInterval = DROP_INTERVAL_BASE;
  game.dropTimer = 0;

  updateStats();

  const spawned = spawnPiece();
  renderNext();
  if (!spawned) {
    game.status = 'over';
    showOverlay('over');
    return;
  }

  game.status = 'playing';
  hideOverlay();
  game.lastTime = performance.now();
}

function pauseGame() {
  if (game.status !== 'playing') return;
  game.status = 'paused';
  showOverlay('paused');
}

function resumeGame() {
  if (game.status !== 'paused') return;
  game.status = 'playing';
  hideOverlay();
  game.lastTime = performance.now();
}

function gameLoop(now) {
  requestAnimationFrame(gameLoop);

  if (!game.lastTime) game.lastTime = now;
  const dt = Math.min(now - game.lastTime, 100);
  game.lastTime = now;

  if (game.status === 'playing' && game.current) {
    game.dropTimer += dt;
    if (game.dropTimer >= game.dropInterval) {
      game.dropTimer = 0;
      tick();
    }
  }

  // Time-based particle motion, so speed is independent of refresh rate.
  const dtSec = dt / 1000;
  const duration = Math.max(0.05, animParams.duration);
  const particles = game.clearAnimations;
  for (let i = particles.length - 1; i >= 0; i--) {
    const part = particles[i];
    part.vy += animParams.gravity * dtSec;
    part.x += part.vx * dtSec;
    part.y += part.vy * dtSec;
    part.life -= dtSec / duration;

    if (part.life <= 0) {
      particles.splice(i, 1);
    }
  }

  render();
}

// ---------- Boot ----------

initCanvas();
updateStats();
showOverlay('start');
renderNext();

initInput({
  startGame,
  pauseGame,
  resumeGame,
  move,
  rotate: rotateCurrent,
  softDrop,
  hardDrop,
});

void initTweaks();

requestAnimationFrame(gameLoop);
