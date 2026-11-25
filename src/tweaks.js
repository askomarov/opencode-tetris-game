// Live-tweakable clear-line animation params (cells / seconds).
// Tweakpane is development-only and imported dynamically: the production
// bundle neither ships the library nor creates the panel's DOM.

export const animParams = {
  duration: 0.9,
  scatter: 2.2,
  lift: 3.5,
  gravity: 14,
  fadePower: 1.4,
};

function createContainer() {
  const container = document.createElement('div');
  container.className = 'tweaks';
  document.body.appendChild(container);
  return container;
}

let pane = null;

// Vite replaces import.meta.env during build; optional chaining keeps the
// module safe if the files are served raw without a bundler.
const isDev = import.meta.env?.DEV === true;

export async function initTweaks() {
  if (pane) return pane;
  if (!isDev) return null;

  let Pane;
  try {
    ({ Pane } = await import('tweakpane'));
  } catch (err) {
    console.warn('[tweaks] Tweakpane unavailable, using defaults.', err);
    return null;
  }

  pane = new Pane({
    title: 'Tetris Animation',
    container: createContainer(),
    expanded: false,
  });

  pane.addBinding(animParams, 'duration', {
    label: 'Duration (s)',
    min: 0.25,
    max: 2.5,
    step: 0.05,
  });
  pane.addBinding(animParams, 'scatter', {
    label: 'Scatter',
    min: 0,
    max: 10,
    step: 0.1,
  });
  pane.addBinding(animParams, 'lift', {
    label: 'Lift',
    min: 0,
    max: 12,
    step: 0.1,
  });
  pane.addBinding(animParams, 'gravity', {
    label: 'Gravity',
    min: 0,
    max: 40,
    step: 0.5,
  });
  pane.addBinding(animParams, 'fadePower', {
    label: 'Fade Ease',
    min: 0.5,
    max: 3,
    step: 0.1,
  });

  return pane;
}
