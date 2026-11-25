// Keyboard, pointer gestures and on-screen touch buttons.
// Game logic is injected via initInput() to keep this module free of
// dependencies on the game flow.

import { GESTURE } from './config.js';
import { game } from './state.js';
import { canvas, startBtn } from './dom.js';

let api = null;

function haptic() {
  if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
    navigator.vibrate(8);
  }
}

export function resetGesture() {
  if (!game.gesture) return;
  try {
    const id = game.gesture.id;
    if (canvas.hasPointerCapture && canvas.hasPointerCapture(id)) {
      canvas.releasePointerCapture(id);
    }
  } catch (err) {
    /* ignore */
  }
  game.gesture = null;
}

function doAction(action) {
  if (game.status !== 'playing') return;
  switch (action) {
    case 'left':
      api.move(-1);
      break;
    case 'right':
      api.move(1);
      break;
    case 'down':
      api.softDrop();
      break;
    case 'rotate':
      api.rotate(1);
      haptic();
      break;
    case 'drop':
      api.hardDrop();
      haptic();
      break;
  }
}

// ---------- Board pointer gestures ----------

function onBoardPointerDown(event) {
  if (game.status !== 'playing' || !game.current) return;
  if (event.isPrimary === false) return;
  if (event.pointerType === 'mouse' && event.button !== 0) return;
  if (game.gesture) return;

  event.preventDefault();
  try {
    canvas.setPointerCapture(event.pointerId);
  } catch (err) {
    /* ignore */
  }

  game.gesture = {
    id: event.pointerId,
    startX: event.clientX,
    startY: event.clientY,
    anchorX: event.clientX,
    anchorY: event.clientY,
    axis: null,
    moved: false,
    startedAt: performance.now(),
  };
}

function onBoardPointerMove(event) {
  const gesture = game.gesture;
  if (!gesture || event.pointerId !== gesture.id) return;
  if (game.status !== 'playing' || !game.current) {
    resetGesture();
    return;
  }

  if (!gesture.axis) {
    const dx = event.clientX - gesture.startX;
    const dy = event.clientY - gesture.startY;
    if (Math.max(Math.abs(dx), Math.abs(dy)) < GESTURE.AXIS_LOCK) return;
    gesture.axis = Math.abs(dx) >= Math.abs(dy) ? 'x' : 'y';
  }

  if (gesture.axis === 'x') {
    const steps = Math.trunc((event.clientX - gesture.anchorX) / GESTURE.STEP_X);
    if (!steps) return;
    const dir = Math.sign(steps);
    for (let i = 0; i < Math.abs(steps); i++) api.move(dir);
    gesture.anchorX += steps * GESTURE.STEP_X;
    gesture.moved = true;
    return;
  }

  const steps = Math.trunc((event.clientY - gesture.anchorY) / GESTURE.STEP_Y);
  if (steps <= 0) return;
  for (let i = 0; i < steps; i++) api.softDrop(false);
  gesture.anchorY += steps * GESTURE.STEP_Y;
  gesture.moved = true;
}

function onBoardPointerUp(event) {
  const gesture = game.gesture;
  if (!gesture || event.pointerId !== gesture.id) return;

  game.gesture = null;
  if (game.status !== 'playing' || !game.current) return;

  const dx = event.clientX - gesture.startX;
  const dy = event.clientY - gesture.startY;
  const distance = Math.hypot(dx, dy);
  const elapsed = performance.now() - gesture.startedAt;

  if (!gesture.moved && distance <= GESTURE.TAP_MAX_MOVE && elapsed <= GESTURE.TAP_MAX_MS) {
    api.rotate(1);
    haptic();
  }
}

function onBoardPointerCancel(event) {
  if (!game.gesture || event.pointerId !== game.gesture.id) return;
  resetGesture();
}

// ---------- Keyboard ----------

function onKeyDown(event) {
  const key = event.key;

  if (['ArrowLeft', 'ArrowRight', 'ArrowDown', 'ArrowUp', ' '].includes(key)) {
    event.preventDefault();
  }

  if (key === 'Enter' && (game.status === 'idle' || game.status === 'over')) {
    api.startGame();
    return;
  }

  if (key === 'r' || key === 'R') {
    api.startGame();
    return;
  }

  if (key === 'p' || key === 'P' || key === 'Escape') {
    if (game.status === 'playing') api.pauseGame();
    else if (game.status === 'paused') api.resumeGame();
    return;
  }

  if (game.status !== 'playing') return;

  switch (key) {
    case 'ArrowLeft':
      api.move(-1);
      break;
    case 'ArrowRight':
      api.move(1);
      break;
    case 'ArrowDown':
      api.softDrop();
      break;
    case 'ArrowUp':
    case 'x':
    case 'X':
      if (!event.repeat) api.rotate(1);
      break;
    case 'z':
    case 'Z':
      if (!event.repeat) api.rotate(-1);
      break;
    case ' ':
      if (!event.repeat) api.hardDrop();
      break;
  }
}

// ---------- Touch buttons ----------

function bindTouchButtons() {
  document.querySelectorAll('[data-action]').forEach((button) => {
    const action = button.dataset.action;
    let delayId = null;
    let repeatId = null;

    const fire = () => doAction(action);

    const stop = () => {
      if (delayId !== null) clearTimeout(delayId);
      if (repeatId !== null) clearInterval(repeatId);
      delayId = null;
      repeatId = null;
    };

    button.addEventListener('pointerdown', (event) => {
      event.preventDefault();
      try {
        button.setPointerCapture(event.pointerId);
      } catch (err) {
        /* ignore */
      }
      fire();

      if (action === 'left' || action === 'right' || action === 'down') {
        delayId = setTimeout(() => {
          repeatId = setInterval(fire, 55);
        }, 150);
      }
    });

    button.addEventListener('pointerup', stop);
    button.addEventListener('pointercancel', stop);
    button.addEventListener('lostpointercapture', stop);
    button.addEventListener('contextmenu', (event) => event.preventDefault());
  });
}

// ---------- Public setup ----------

export function initInput(actions) {
  if (api) return;
  api = actions;

  window.addEventListener('keydown', onKeyDown);

  startBtn.addEventListener('click', () => {
    startBtn.blur();
    if (game.status === 'paused') api.resumeGame();
    else api.startGame();
  });

  canvas.addEventListener('pointerdown', onBoardPointerDown);
  window.addEventListener('pointermove', onBoardPointerMove);
  window.addEventListener('pointerup', onBoardPointerUp);
  window.addEventListener('pointercancel', onBoardPointerCancel);
  canvas.addEventListener('lostpointercapture', (event) => {
    if (game.gesture && event.pointerId === game.gesture.id) game.gesture = null;
  });
  canvas.addEventListener('contextmenu', (event) => event.preventDefault());

  bindTouchButtons();

  document.addEventListener('visibilitychange', () => {
    if (document.hidden && game.status === 'playing') api.pauseGame();
  });
}
