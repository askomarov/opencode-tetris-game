// Static game data and tuning constants.

export const COLS = 10;
export const ROWS = 20;
export const BLOCK = 30;
export const NEXT_SIZE = 120;
export const NEXT_CELL = 22;

export const COLORS = {
  I: '#22d3ee',
  J: '#4f7cff',
  L: '#fb923c',
  O: '#facc15',
  S: '#34d399',
  T: '#c084fc',
  Z: '#f87171',
};

export const SHAPES = {
  I: [
    [0, 0, 0, 0],
    [1, 1, 1, 1],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ],
  J: [
    [1, 0, 0],
    [1, 1, 1],
    [0, 0, 0],
  ],
  L: [
    [0, 0, 1],
    [1, 1, 1],
    [0, 0, 0],
  ],
  O: [
    [1, 1],
    [1, 1],
  ],
  S: [
    [0, 1, 1],
    [1, 1, 0],
    [0, 0, 0],
  ],
  T: [
    [0, 1, 0],
    [1, 1, 1],
    [0, 0, 0],
  ],
  Z: [
    [1, 1, 0],
    [0, 1, 1],
    [0, 0, 0],
  ],
};

// SRS wall kicks. [dx, dy] where dy is positive upwards.
export const KICKS_JLSTZ = {
  '0>1': [[0, 0], [-1, 0], [-1, 1], [0, -2], [-1, -2]],
  '1>0': [[0, 0], [1, 0], [1, -1], [0, 2], [1, 2]],
  '1>2': [[0, 0], [1, 0], [1, -1], [0, 2], [1, 2]],
  '2>1': [[0, 0], [-1, 0], [-1, 1], [0, -2], [-1, -2]],
  '2>3': [[0, 0], [1, 0], [1, 1], [0, -2], [1, -2]],
  '3>2': [[0, 0], [-1, 0], [-1, -1], [0, 2], [-1, 2]],
  '3>0': [[0, 0], [-1, 0], [-1, -1], [0, 2], [-1, 2]],
  '0>3': [[0, 0], [1, 0], [1, 1], [0, -2], [1, -2]],
};

export const KICKS_I = {
  '0>1': [[0, 0], [-2, 0], [1, 0], [-2, -1], [1, 2]],
  '1>0': [[0, 0], [2, 0], [-1, 0], [2, 1], [-1, -2]],
  '1>2': [[0, 0], [-1, 0], [2, 0], [-1, 2], [2, -1]],
  '2>1': [[0, 0], [1, 0], [-2, 0], [1, -2], [-2, 1]],
  '2>3': [[0, 0], [2, 0], [-1, 0], [2, 1], [-1, -2]],
  '3>2': [[0, 0], [-2, 0], [1, 0], [-2, -1], [1, 2]],
  '3>0': [[0, 0], [1, 0], [-2, 0], [1, -2], [-2, 1]],
  '0>3': [[0, 0], [-1, 0], [2, 0], [-1, 2], [2, -1]],
};

export const LINE_SCORES = [0, 100, 300, 500, 800];

export const LINES_PER_LEVEL = 10;
export const DROP_INTERVAL_BASE = 800;
export const DROP_INTERVAL_MIN = 110;
export const DROP_INTERVAL_STEP = 65;

export function dropIntervalForLevel(level) {
  return Math.max(DROP_INTERVAL_MIN, DROP_INTERVAL_BASE - (level - 1) * DROP_INTERVAL_STEP);
}

// Touch gesture tuning (CSS pixels).
export const GESTURE = {
  STEP_X: 22,
  STEP_Y: 24,
  AXIS_LOCK: 8,
  TAP_MAX_MOVE: 10,
  TAP_MAX_MS: 250,
};

// Soft-drop / hard-drop scoring.
export const SOFT_DROP_POINTS = 1;
export const HARD_DROP_POINTS_PER_ROW = 2;
