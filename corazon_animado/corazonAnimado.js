// heart-animation.js
window.requestAnimationFrame =
  window.__requestAnimationFrame ||
  window.requestAnimationFrame ||
  window.webkitRequestAnimationFrame ||
  window.mozRequestAnimationFrame ||
  window.oRequestAnimationFrame ||
  window.msRequestAnimationFrame ||
  (function () {
    return function (cb, el) {
      let last = el.__lastTime || 0;
      let now  = Date.now();
      let dt   = Math.max(1, 33 - (now - last));
      el.__lastTime = now + dt;
      return setTimeout(cb, dt);
    };
  })();
  const isDevice = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i
  .test(navigator.userAgent.toLowerCase());

let canvas = document.getElementById('heart'),
    ctx    = canvas.getContext('2d'),
    width, height;

function resize() {
  const k = isDevice ? 0.5 : 1;
  width  = canvas.width  = k * innerWidth;
  height = canvas.height = k * innerHeight;
  ctx.fillStyle = 'rgba(0,0,0,1)';
  ctx.fillRect(0, 0, width, height);
}
window.addEventListener('resize', resize);
resize();
// Función paramétrica del corazón
function heartPosition(t) {
    return [
      Math.pow(Math.sin(t), 3),
      -(15 * Math.cos(t)
        - 5 * Math.cos(2*t)
        - 2 * Math.cos(3*t)
        -     Math.cos(4*t))
    ];
  }
  
  // Generamos tres anillos de puntos (r = 210, 150, 90)
  const dr = isDevice ? 0.3 : 0.1;
  let pointsOrigin = [];
  for (let r of [210, 150, 90]) {
    for (let t = 0; t < 2*Math.PI; t += dr) {
      let [hx, hy] = heartPosition(t);
      pointsOrigin.push([hx * r, hy * (r/15)]);
    }
  }
  const pointsPerRing = Math.ceil(2*Math.PI / dr);
const heartPointsCount = pointsOrigin.length;

// targetPoints con pulso
let targetPoints = new Array(heartPointsCount);
function pulse(k) {
  for (let i = 0; i < heartPointsCount; i++) {
    targetPoints[i] = [
      k * pointsOrigin[i][0] + width / 2,
      k * pointsOrigin[i][1] + height / 2
    ];
  }
}

// Partículas
const traceCount = isDevice ? 20 : 50;
let particles = [];
for (let i = 0; i < heartPointsCount; i++) {
  let x = Math.random()*width,
      y = Math.random()*height;
  particles.push({
    trace: Array.from({length: traceCount}, ()=> ({x,y})),
    vx:    0, vy: 0,
    speed: Math.random()+5,
    q:     ~~(Math.random()*heartPointsCount),
    D:     2*(i%2)-1,
    force: 0.2*Math.random()+0.7,
    f: "rgba(255,0,0,0.6)",
  });
}
let time = 0;
const cfg = { traceK: 0.4, timeDelta: 0.01 };

function loop() {
  // factor de pulso (mismo en X e Y)
  let n  = -Math.cos(time),
      k  = (1 + n) * .5;
  pulse(k);

  // fondo semitransparente
  ctx.fillStyle = 'rgba(0,0,0,0.1)';
  ctx.fillRect(0, 0, width, height);

  // ——— dibujo de partículas ———
  particles.forEach(u => {
    let [qx, qy] = targetPoints[u.q],
        dx = u.trace[0].x - qx,
        dy = u.trace[0].y - qy,
        L  = Math.hypot(dx, dy) || 1;

    if (L < 10) {
      if (Math.random() > 0.95) u.q = ~~(Math.random()*heartPointsCount);
      else {
        if (Math.random() > 0.99) u.D *= -1;
        u.q = (u.q + u.D + heartPointsCount) % heartPointsCount;
      }
    }

    u.vx += -dx/L * u.speed;
    u.vy += -dy/L * u.speed;
    u.trace[0].x += u.vx;
    u.trace[0].y += u.vy;
    u.vx *= u.force;
    u.vy *= u.force;

    for (let j = 1; j < u.trace.length; j++) {
      let T = u.trace[j-1], N = u.trace[j];
      N.x += cfg.traceK * (T.x - N.x);
      N.y += cfg.traceK * (T.y - N.y);
    }
    ctx.fillStyle = u.f;
    u.trace.forEach(p => ctx.fillRect(p.x, p.y, 1, 1));
  });

  // actualizar tiempo
  time += ((Math.sin(time) < 0 ? 9 : (n > 0.8 ? 0.2 : 1)) * cfg.timeDelta);

  // ——— contorno EXTERNO de puntitos blancos (sólo r = 210) ———
  ctx.fillStyle = 'rgba(255,255,255,1)';
  for (let i = 0; i < pointsPerRing; i++) {
    let [x, y] = targetPoints[i];
    ctx.fillRect(x, y, 2, 2);
  }

  requestAnimationFrame(loop, canvas);
}

loop();
