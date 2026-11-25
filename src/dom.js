// Single place where the markup is queried. Renaming an id in index.html
// only requires updating this file.

export const canvas = document.getElementById('board');
export const ctx = canvas.getContext('2d');

export const nextCanvas = document.getElementById('next');
export const nextCtx = nextCanvas.getContext('2d');

export const overlay = document.getElementById('overlay');
export const startBtn = document.getElementById('startBtn');

export const els = {
  score: document.getElementById('score'),
  lines: document.getElementById('lines'),
  level: document.getElementById('level'),
  eyebrow: document.getElementById('ovEyebrow'),
  title: document.getElementById('ovTitle'),
  text: document.getElementById('ovText'),
  hint: document.getElementById('ovHint'),
};
