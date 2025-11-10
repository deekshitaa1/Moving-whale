// script.js — module
const whaleWrap = document.getElementById('whaleWrap');
const speedInput = document.getElementById('speed');
const directionBtn = document.getElementById('directionBtn');
const resetBtn = document.getElementById('resetBtn');

let speed = Number(speedInput.value) || 1;   // multiplier for swim speed
let direction = 1;                           // 1 -> left-to-right, -1 -> right-to-left
let position = -0.35;                        // normalized position (-1 left, +1 right)
let lastTs = null;
let rafId = null;

// movement bounds (percent of viewport width)
const minX = -0.5;   // fully left off-screen
const maxX = 0.6;    // fully right off-screen

function setTranslateFromPosition(posNormalized) {
  // posNormalized in [-1, 1] mapped to minX .. maxX (viewport width fraction)
  const vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
  const frac = (posNormalized - (-1)) / (2); // 0..1
  const xPercent = minX + (maxX - minX) * frac;
  // convert to translateX using vw units
  whaleWrap.style.transform = `translateX(${xPercent * 100}vw)`;
  // also flip whale horizontally based on direction
  const whale = whaleWrap.querySelector('.whale');
  if (direction === -1) {
    whale.style.transform = 'scaleX(-1)'; // flip
  } else {
    whale.style.transform = 'scaleX(1)';
  }
}

// animation loop (updates position)
function animate(ts) {
  if (!lastTs) lastTs = ts;
  const delta = (ts - lastTs) / 1000; // seconds
  lastTs = ts;

  // base velocity in normalized units per second
  const baseVelocity = 0.12; // base speed across the scene
  const deltaPos = baseVelocity * speed * direction * delta;
  position = position + deltaPos;

  // wrap-around logic: when out of bounds, loop to other side smoothly
  const leftBound = -1.0;
  const rightBound = 1.0;
  if (position > rightBound + 0.15) {
    position = leftBound - 0.15;
  } else if (position < leftBound - 0.15) {
    position = rightBound + 0.15;
  }

  setTranslateFromPosition(position);
  rafId = requestAnimationFrame(animate);
}

// controls
speedInput.addEventListener('input', (e) => {
  speed = Number(e.target.value);
});

directionBtn.addEventListener('click', () => {
  direction = -direction;
  // visually flip immediately
  const whale = whaleWrap.querySelector('.whale');
  whale.style.transition = 'transform 0.24s ease';
  whale.style.transform = direction === -1 ? 'scaleX(-1)' : 'scaleX(1)';
  setTimeout(() => whale.style.transition = '', 260);
});

resetBtn.addEventListener('click', () => {
  position = -0.35;
  direction = 1;
  speed = 1;
  speedInput.value = '1';
  setTranslateFromPosition(position);
});

// start
setTranslateFromPosition(position);
rafId = requestAnimationFrame(animate);

// keep scene responsive when resizing
window.addEventListener('resize', () => setTranslateFromPosition(position));
