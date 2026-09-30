// https://github.com/knadh/dragmove.js
// Kailash Nadh (c) 2020.
// MIT License.

let _loaded = false;
let _callbacks = [];
const _isTouch = window.ontouchstart !== undefined;
const _downEvent = _isTouch ? "touchstart" : "mousedown";
const _upEvent = _isTouch ? "touchend" : "mouseup";

export const dragmove = function(target, handler, onStart, onEnd) {
  // Register a global event to capture mouse moves (once).
  if (!_loaded) {
    document.addEventListener(_isTouch ? "touchmove" : "mousemove", function(e) {
      let c = e;
      if (e.touches) {
        c = e.touches[0];
      }

      // On mouse move, dispatch the coords to all registered callbacks.
      for (var i = 0; i < _callbacks.length; i++) {
        _callbacks[i](c.clientX, c.clientY);
      }
    });
  }

  _loaded = true;
  let isMoving = false, hasStarted = false;
  let startX = 0, startY = 0, lastX = 0, lastY = 0;

  // On the first click and hold, record the offset of the pointer in relation
  // to the point of click inside the element.
  function onDown(e) {
    e.stopPropagation();
    e.preventDefault();
    if (target.dataset.dragEnabled === "false") {
      return;
    }

    let c = e;
    if (e.touches) {
      c = e.touches[0];
    }

    isMoving = true;
    startX = target.offsetLeft - c.clientX;
    startY = target.offsetTop - c.clientY;
  }

  // On leaving click, stop moving.
  function onUp() {
    if (onEnd && hasStarted) {
      onEnd(target, parseInt(target.style.left), parseInt(target.style.top));
    }

    isMoving = false;
    hasStarted = false;
  }

  // Mouse-move callback to move the element.
  function move(x, y) {
    if (!isMoving) {
      return;
    }

    if (!hasStarted) {
      hasStarted = true;
      if (onStart) {
        onStart(target, lastX, lastY);
      }
    }

    lastX = x + startX;
    lastY = y + startY;

    // If boundary checking is on, don't let the element cross the viewport.
    if (target.dataset.dragBoundary === "true") {
      lastX = Math.min(window.innerWidth - target.offsetWidth, Math.max(0, lastX));
      lastY = Math.min(window.innerHeight - target.offsetHeight, Math.max(0, lastY));
    }

    target.style.left = lastX + "px";
    target.style.top = lastY + "px";
  }

  handler.addEventListener(_downEvent, onDown);
  document.addEventListener(_upEvent, onUp);
  _callbacks.push(move);

  // Removes the listeners so the element can be garbage collected.
  return function destroy() {
    handler.removeEventListener(_downEvent, onDown);
    document.removeEventListener(_upEvent, onUp);

    const i = _callbacks.indexOf(move);
    if (i !== -1) {
      _callbacks.splice(i, 1);
    }
  };
}

export { dragmove as default };
