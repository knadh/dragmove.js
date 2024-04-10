// https://github.com/knadh/dragmove.js
// Kailash Nadh (c) 2020.
// MIT License.

const _t = window.ontouchstart !== undefined;
const _evStart = _t ? "touchstart" : "mousedown";
const _evMove = _t ? "touchmove" : "mousemove";
const _evStop = _t ? "touchend" : "mouseup";

// Current item, is moving on, map of items registered for dragging.
let _h = null, _on = false, _items = null;

export const dragmove = (target, handler, onStart, onEnd) => {
  // Register start/stop/move events globally once.
  if (!_items) {
    _items = new WeakMap();
    [_evStart, _evMove, _evStop].forEach((ev) => {
      document.addEventListener(ev, handle);
    });
  }

  // Record the item in the map to track it.
  _items.set(handler, { t: target, onStart, onEnd });

  return {
    remove: () => _items.delete(handler)
  }
}

// Handle the start/move/stop events on a registered handler.
const handle = (event) => {
  const ev = event.touches ? event.touches[0] : event;

  // Drag/drop handler DOM object.
  const handler = ev.target;

  // Check if the event is on an item already being dragged,
  // or if it's a handler that's registered, but isn't moving yet.
  const i = _items.get(_h || handler)
  if (!i) {
    return;
  }

  if (ev.type === _evStart) {
    // Dragging is starting with a click (and may not actually proceed).
    // It's only marked as starting
    ev.stopPropagation();
    ev.preventDefault();

    _on = true;

    // Record the starting position.
    i.sX = i.t.offsetLeft - ev.clientX;
    i.sY = i.t.offsetTop - ev.clientY;
  } else if (ev.type === _evMove) {
    // Moving has just started or is in progress.
    if (!_on) {
      return;
    }

    // Register the current handler being moved globally to keep track of it.
    // Only one handler ever moves at a time.
    if (!_h) {
      _h = handler;
      i.onStart && i.onStart(handler, i.x, i.y);
    }

    i.x = ev.clientX + i.sX;
    i.y = ev.clientY + i.sY;

    // If boundary checking is on, don't let the element cross the viewport.
    if (i.t.dataset.dragBoundary === "true") {
      i.x = Math.min(window.innerWidth - i.t.offsetWidth, Math.max(0, i.x));
      i.y = Math.min(window.innerHeight - i.t.offsetHeight, Math.max(0, i.y));
    }

    i.t.style.left = i.x + "px";
    i.t.style.top = i.y + "px";
  } else {
    // Dragging is ending with click release.
    if (i.onEnd && _h) {
      i.onEnd(i.t, i.x, i.y);
    }

    _on = false;
    _h = null;
  }
}

export { dragmove as default };
