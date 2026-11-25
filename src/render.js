// Canvas setup and all drawing.

import { BLOCK, COLS, COLORS, NEXT_CELL, NEXT_SIZE, ROWS, SHAPES } from './config.js';
import { game } from './state.js';
import { ghostY } from './board.js';
import { animParams } from './tweaks.js';
import { canvas, ctx, nextCanvas, nextCtx } from './dom.js';

function setupCanvas(element, context, w, h) {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  element.width = Math.round(w * dpr);
  element.height = Math.round(h * dpr);
  context.setTransform(dpr, 0, 0, dpr, 0, 0);
}

export function initCanvas() {
  setupCanvas(canvas, ctx, COLS * BLOCK, ROWS * BLOCK);
  setupCanvas(nextCanvas, nextCtx, NEXT_SIZE, NEXT_SIZE);
}

function roundRectPath(c, x, y, w, h, r) {
  const rr = Math.max(0, Math.min(r, w / 2, h / 2));
  c.beginPath();
  c.moveTo(x + rr, y);
  c.arcTo(x + w, y, x + w, y + h, rr);
  c.arcTo(x + w, y + h, x, y + h, rr);
  c.arcTo(x, y + h, x, y, rr);
  c.arcTo(x, y, x + w, y, rr);
  c.closePath();
}

function hexToRgba(hex, alpha) {
  const n = parseInt(hex.slice(1), 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function drawCell(c, px, py, size, color) {
  const pad = Math.max(1, size * 0.045);
  const r = size * 0.18;
  const x = px + pad;
  const y = py + pad;
  const s = size - pad * 2;

  roundRectPath(c, x, y, s, s, r);
  c.fillStyle = color;
  c.fill();

  const g = c.createLinearGradient(px, py, px + size, py + size);
  g.addColorStop(0, 'rgba(255, 255, 255, 0.35)');
  g.addColorStop(0.45, 'rgba(255, 255, 255, 0.05)');
  g.addColorStop(1, 'rgba(0, 0, 0, 0.28)');
  roundRectPath(c, x, y, s, s, r);
  c.fillStyle = g;
  c.fill();
}

function drawGhostCell(c, px, py, size, color) {
  const pad = Math.max(1, size * 0.045);
  const r = size * 0.18;
  roundRectPath(c, px + pad, py + pad, size - pad * 2, size - pad * 2, r);
  c.fillStyle = hexToRgba(color, 0.08);
  c.fill();
  c.strokeStyle = hexToRgba(color, 0.42);
  c.lineWidth = 1.5;
  c.stroke();
}

function drawGrid() {
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.035)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let x = 1; x < COLS; x++) {
    ctx.moveTo(x * BLOCK + 0.5, 0);
    ctx.lineTo(x * BLOCK + 0.5, ROWS * BLOCK);
  }
  for (let y = 1; y < ROWS; y++) {
    ctx.moveTo(0, y * BLOCK + 0.5);
    ctx.lineTo(COLS * BLOCK, y * BLOCK + 0.5);
  }
  ctx.stroke();
}

export function render() {
  ctx.clearRect(0, 0, COLS * BLOCK, ROWS * BLOCK);
  drawGrid();

  for (let y = 0; y < ROWS; y++) {
    for (let x = 0; x < COLS; x++) {
      const color = game.board[y][x];
      if (color) drawCell(ctx, x * BLOCK, y * BLOCK, BLOCK, color);
    }
  }

  // Cleared-line particles (eased fade; soft scale-down).
  for (const part of game.clearAnimations) {
    const t = Math.max(0, Math.min(1, part.life));
    const fade = Math.pow(t, animParams.fadePower);
    const scale = 0.55 + 0.45 * t;
    const size = BLOCK * scale;
    const ox = part.x * BLOCK + (BLOCK - size) / 2;
    const oy = part.y * BLOCK + (BLOCK - size) / 2;
    ctx.save();
    ctx.globalAlpha = fade;
    drawCell(ctx, ox, oy, size, part.color);
    ctx.restore();
  }

  const piece = game.current;
  if (!piece) return;

  const color = COLORS[piece.type];

  // Ghost projection.
  const gy = ghostY(piece);
  if (gy !== piece.y) {
    for (let r = 0; r < piece.matrix.length; r++) {
      for (let c = 0; c < piece.matrix[r].length; c++) {
        if (!piece.matrix[r][c]) continue;
        const x = piece.x + c;
        const y = gy + r;
        if (y >= 0) drawGhostCell(ctx, x * BLOCK, y * BLOCK, BLOCK, color);
      }
    }
  }

  // Active piece.
  for (let r = 0; r < piece.matrix.length; r++) {
    for (let c = 0; c < piece.matrix[r].length; c++) {
      if (!piece.matrix[r][c]) continue;
      const x = piece.x + c;
      const y = piece.y + r;
      if (y >= 0) drawCell(ctx, x * BLOCK, y * BLOCK, BLOCK, color);
    }
  }
}

export function renderNext() {
  nextCtx.clearRect(0, 0, NEXT_SIZE, NEXT_SIZE);
  if (!game.nextType) return;

  const matrix = SHAPES[game.nextType];
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;

  for (let y = 0; y < matrix.length; y++) {
    for (let x = 0; x < matrix[y].length; x++) {
      if (!matrix[y][x]) continue;
      minX = Math.min(minX, x);
      maxX = Math.max(maxX, x);
      minY = Math.min(minY, y);
      maxY = Math.max(maxY, y);
    }
  }

  const w = (maxX - minX + 1) * NEXT_CELL;
  const h = (maxY - minY + 1) * NEXT_CELL;
  const ox = (NEXT_SIZE - w) / 2;
  const oy = (NEXT_SIZE - h) / 2;

  for (let y = minY; y <= maxY; y++) {
    for (let x = minX; x <= maxX; x++) {
      if (!matrix[y][x]) continue;
      drawCell(
        nextCtx,
        ox + (x - minX) * NEXT_CELL,
        oy + (y - minY) * NEXT_CELL,
        NEXT_CELL,
        COLORS[game.nextType]
      );
    }
  }
}
