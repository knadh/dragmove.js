// https://github.com/knadh/dragmove.js
// Kailash Nadh (c) 2020.
// MIT License.

// Pixels the pointer must move before a press turns into a drag.
const _threshold = 3;

let _loaded = false;

// Only one item can be dragged at a time.
let _active = null, _pointerId = null, _hasStarted = false;
let _downX = 0, _downY = 0, _dragOffsetX = 0, _dragOffsetY = 0;

export const dragmove = function(target, handler, onStart, onEnd) {
  if (!_loaded) {
    _loaded = true;
    document.addEventListener("pointermove", onMove);
    document.addEventListener("pointerup", onUp);
    document.addEventListener("pointercancel", onUp);
  }

  const item = { target, handler, onStart, onEnd, lastX: 0, lastY: 0 };

  // On the first click and hold, record the offset of the pointer in relation
  // to the point of click inside the element.
  function onDown(e) {
    // Ignore right-clicks and a second finger on the screen.
    if (e.button !== 0 || !e.isPrimary) {
      return;
    }

    // Form fields need press-and-move for selecting text and sliding sliders.
    if (e.target.closest("input, textarea, select") || e.target.isContentEditable) {
      return;
    }

    e.stopPropagation();
    e.preventDefault();
    if (target.dataset.dragEnabled === "false") {
      return;
    }

    // A drag whose pointerup never arrived must still get its onEnd.
    stop();

    _active = item;
    _pointerId = e.pointerId;
    _downX = e.clientX;
    _downY = e.clientY;
    // Horizontal and vertical gaps from the pointer to the target's top left corner.
    _dragOffsetX = target.offsetLeft - e.clientX;
    _dragOffsetY = target.offsetTop - e.clientY;
  }

  // Stops the page from scrolling instead of dragging on touch screens.
  handler.style.touchAction = "none";
  handler.addEventListener("pointerdown", onDown);

  return function destroy() {
    handler.removeEventListener("pointerdown", onDown);
    if (_active === item) {
      _active = null;
      _hasStarted = false;
    }
  };
}

function onMove(e) {
  if (!_active || e.pointerId !== _pointerId) {
    return;
  }

  const item = _active;
  if (!_hasStarted) {
    if (Math.hypot(e.clientX - _downX, e.clientY - _downY) < _threshold) {
      return;
    }

    _hasStarted = true;

    // Keep receiving movement and release events over iframes.
    item.handler.setPointerCapture(e.pointerId);

    if (item.onStart) {
      item.onStart(item.target, item.lastX, item.lastY);
    }
  }

  item.lastX = e.clientX + _dragOffsetX;
  item.lastY = e.clientY + _dragOffsetY;

  // If boundary checking is on, don't let the element cross the viewport.
  if (item.target.dataset.dragBoundary === "true") {
    item.lastX = Math.min(window.innerWidth - item.target.offsetWidth, Math.max(0, item.lastX));
    item.lastY = Math.min(window.innerHeight - item.target.offsetHeight, Math.max(0, item.lastY));
  }

  item.target.style.left = item.lastX + "px";
  item.target.style.top = item.lastY + "px";
}

function onUp(e) {
  if (e.pointerId === _pointerId) {
    stop();
  }
}

function stop() {
  if (!_active) {
    return;
  }

  const item = _active;
  if (item.onEnd && _hasStarted) {
    item.onEnd(item.target, parseInt(item.target.style.left), parseInt(item.target.style.top));
  }

  // Releasing a drag can trigger the handle's click action, such as activating a button. Swallow that click.
  if (_hasStarted) {
    window.addEventListener("click", swallowClick, { capture: true, once: true });
    window.addEventListener("pointerdown", () => {
      window.removeEventListener("click", swallowClick, true);
    }, { capture: true, once: true });
  }

  _active = null;
  _hasStarted = false;
}

function swallowClick(e) {
  e.stopPropagation();
}

export { dragmove as default };
