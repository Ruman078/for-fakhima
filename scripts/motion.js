export const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
export const lerp = (a, b, t) => a + (b - a) * t;
export const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
export const smooth = t => t * t * (3 - 2 * t);
export const oscillate = (t, phase) => Math.sin(t + phase) + 0.38 * Math.sin(1.72 * t - phase);
// Closed-form critically damped spring. It settles without overshooting or
// depending on how frequently pointer events arrive.
export function settle(state, target, seconds) {
  const rate=9, decay=Math.exp(-rate*seconds), gap=state.value-target;
  const impulse=state.velocity+rate*gap;
  state.value=target+(gap+impulse*seconds)*decay;
  state.velocity=(state.velocity-rate*impulse*seconds)*decay;
}
export function flowerArc(t, dx, dy, lift) {
  const arc=Math.sin(Math.PI*t);
  return { x:dx*t, y:dy*t-arc*lift, angle:(dx>0?-1:1)*arc*19, scale:lerp(.62,1.04,smooth(t)) };
}
export function random(seed) {
  return () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 4294967296;
  };
}
// Keep chapter choreography in visible time when the reader switches apps.
export function timeline() {
  const events = new Set();
  function arm(event) {
    if (document.hidden) return;
    event.start = performance.now();
    event.id = setTimeout(() => { events.delete(event); event.run(); }, event.left);
  }
  function visibility() {
    for (const event of events) {
      if (!document.hidden) arm(event);
      else if (event.id !== null) {
        clearTimeout(event.id);
        event.left = Math.max(0, event.left - (performance.now() - event.start));
        event.id = null;
      }
    }
  }
  document.addEventListener('visibilitychange', visibility);
  return {
    after(left, run) { const event = {left, run, id: null}; events.add(event); arm(event); },
    cancel() { events.forEach(event => clearTimeout(event.id)); events.clear(); document.removeEventListener('visibilitychange', visibility); }
  };
}
