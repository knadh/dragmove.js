<a href="https://zerodha.tech"><img src="https://zerodha.tech/static/images/github-badge.svg" align="right" /></a>

# dragmove.js

A super tiny Javascript library to make DOM elements draggable and movable. Has touch screen support. Zero dependencies and 500 bytes Gzipped. [Demo here](https://knadh.github.io/dragmove.js/docs/).

## Usage

```shell
npm install @knadh/dragmove
```

```javascript
import { dragmove } from @knadh/dragmove;

// (target, handler, onStart(target, x, y), onEnd(target, x, y)).
// onStart and onEnd are optional callbacks that receive target element, and x, y coordinates.

dragmove(document.querySelector("#box"), document.querySelector("#box .drag-handle"));
```

Licensed under the MIT License.
