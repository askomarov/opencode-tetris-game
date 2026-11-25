// HUD counters and the start/pause/game-over overlay.

import { game } from './state.js';
import { els, overlay, startBtn } from './dom.js';
import { resetGesture } from './input.js';

export function updateStats() {
  els.score.textContent = game.score.toLocaleString('en-US');
  els.lines.textContent = String(game.lines);
  els.level.textContent = String(game.level);
}

export function showOverlay(mode) {
  resetGesture();
  overlay.dataset.mode = mode;

  if (mode === 'start') {
    els.eyebrow.textContent = 'Classic';
    els.title.textContent = 'Tetris';
    els.text.textContent = 'Clear lines before the stack reaches the top.';
    startBtn.textContent = 'Start game';
    els.hint.style.display = '';
  } else if (mode === 'paused') {
    els.eyebrow.textContent = 'Paused';
    els.title.textContent = 'Paused';
    els.text.textContent = 'Take a breath. The stack will wait.';
    startBtn.textContent = 'Resume';
    els.hint.style.display = 'none';
  } else {
    els.eyebrow.textContent = 'Game over';
    els.title.textContent = 'Game over';
    const lineWord = game.lines === 1 ? 'line' : 'lines';
    els.text.textContent = `Score ${game.score.toLocaleString('en-US')} · ${game.lines} ${lineWord} cleared`;
    startBtn.textContent = 'Play again';
    els.hint.style.display = 'none';
  }

  overlay.classList.add('visible');
}

export function hideOverlay() {
  overlay.classList.remove('visible');
}
