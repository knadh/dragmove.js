// https://github.com/knadh/dragmove.js
// Kailash Nadh (c) 2020.
// MIT License.

export const dragmove = function (target, handler, onStart, onEnd) {
  let pId = null, hasStarted = false, captureTarget = handler;
  let offsetX = 0, offsetY = 0, lastX = 0, lastY = 0, downX = 0, downY = 0;
  const touchAction = handler.style.touchAction;

  // Record the pointer's offset inside the element and capture subsequent events.
  function onDown(e) {
    if (pId === null) hasStarted = false;
    if (pId !== null || e.button !== 0 || !e.isPrimary || target.dataset.dragEnabled === "false" ||
      e.target.closest("input, textarea, select") || e.target.isContentEditable) {
      return;
    }

    e.stopPropagation();
    e.preventDefault();
    pId = e.pointerId;
    downX = e.clientX;
    downY = e.clientY;
    offsetX = target.offsetLeft - downX;
    offsetY = target.offsetTop - downY;
    captureTarget = e.target;
    captureTarget.setPointerCapture(pId);
  }

  function onPointer(e) {
    if (pId === null || e.pointerId !== pId) return;

    if (e.type !== "pointermove") {
      pId = null;
      if (onEnd && hasStarted) onEnd(target, parseInt(target.style.left), parseInt(target.style.top));
      return;
    }

    if (!hasStarted && Math.hypot(e.clientX - downX, e.clientY - downY) < 3) {
      return;
    }

    if (!hasStarted) {
      hasStarted = true;
      if (onStart) onStart(target, lastX, lastY);
    }

    lastX = e.clientX + offsetX;
    lastY = e.clientY + offsetY;

    // If boundary checking is on, don't let the element cross the viewport.
    if (target.dataset.dragBoundary === "true") {
      lastX = Math.min(window.innerWidth - target.offsetWidth, Math.max(0, lastX));
      lastY = Math.min(window.innerHeight - target.offsetHeight, Math.max(0, lastY));
    }

    target.style.left = lastX + "px";
    target.style.top = lastY + "px";
  }

  function onClick(e) {
    if (hasStarted && e.detail) {
      e.preventDefault();
      e.stopImmediatePropagation();
    }
    hasStarted = false;
  }

  const events = { pointerdown: onDown, pointermove: onPointer, pointerup: onPointer, pointercancel: onPointer, lostpointercapture: onPointer, click: onClick };
  handler.style.touchAction = "none";
  for (const type in events) {
    handler.addEventListener(type, events[type], true);
  }

  function destroy() {
    for (const type in events) {
      handler.removeEventListener(type, events[type], true);
    }

    if (pId !== null && captureTarget.hasPointerCapture(pId)) {
      captureTarget.releasePointerCapture(pId);
    }

    pId = null;
    hasStarted = false;
    handler.style.touchAction = touchAction;
  }

  destroy.remove = destroy;
  return destroy;
}

export { dragmove as default };
