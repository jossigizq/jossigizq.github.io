/*
  Fondo animado: trazas de enrutado sobre la cuadrícula de puntos.
  Dibuja pequeños "árboles de Steiner" rectilíneos (un tronco + ramas
  perpendiculares, como las pistas de un chip o una PCB) que crecen
  entre los puntos y luego se difuminan hasta desaparecer.

  La cuadrícula del fondo son puntos cada 26px centrados en (13, 13),
  así que las trazas se alinean con esos mismos puntos.
*/
(function () {
  // Respeta la preferencia de reducir movimiento: sin animación.
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var SP = 26;   // separación de la cuadrícula
  var OFF = 13;  // offset del primer punto (centro de la celda)

  var canvas = document.createElement('canvas');
  canvas.setAttribute('aria-hidden', 'true');
  canvas.style.cssText =
    'position:fixed;inset:0;width:100%;height:100%;z-index:-1;pointer-events:none;';
  document.body.insertBefore(canvas, document.body.firstChild);
  var ctx = canvas.getContext('2d');

  var dpr = Math.max(1, window.devicePixelRatio || 1);
  var W = 0, H = 0, cols = 0, rows = 0;

  function resize() {
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = Math.floor(W * dpr);
    canvas.height = Math.floor(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    cols = Math.floor((W - OFF) / SP);
    rows = Math.floor((H - OFF) / SP);
  }
  resize();
  window.addEventListener('resize', resize);

  function node(i, j) { return { x: OFF + i * SP, y: OFF + j * SP }; }

  // Color de acento del tema actual (cambia en claro/oscuro).
  function accent() {
    var c = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim();
    return c || '#C8A26C';
  }

  // Genera un árbol de Steiner rectilíneo: tronco + ramas perpendiculares.
  function makeRoute() {
    var horizontal = Math.random() < 0.5;
    var span = 4 + Math.floor(Math.random() * 6);      // largo del tronco (en nodos)
    var branches = 3 + Math.floor(Math.random() * 4);  // nº de ramas
    var reach = 2 + Math.floor(Math.random() * 4);     // alcance de cada rama

    var i0 = Math.floor(Math.random() * Math.max(1, cols - span));
    var j0 = Math.floor(Math.random() * Math.max(1, rows - span));

    var segs = [], nodes = [], used = {};

    if (horizontal) {
      var a = node(i0, j0), b = node(i0 + span, j0);
      segs.push([a, b]);                 // tronco horizontal
      for (var k = 0; k < branches; k++) {
        var bi = i0 + Math.floor(Math.random() * (span + 1));
        if (used[bi]) continue; used[bi] = 1;
        var dir = Math.random() < 0.5 ? -1 : 1;
        var len = 1 + Math.floor(Math.random() * reach);
        var jj = Math.min(rows, Math.max(0, j0 + dir * len));
        if (jj === j0) continue;
        var leaf = node(bi, jj);
        segs.push([node(bi, j0), leaf]); // rama vertical
        nodes.push(leaf);
      }
      nodes.push(a, b);
    } else {
      var a2 = node(i0, j0), b2 = node(i0, j0 + span);
      segs.push([a2, b2]);               // tronco vertical
      for (var k2 = 0; k2 < branches; k2++) {
        var bj = j0 + Math.floor(Math.random() * (span + 1));
        if (used[bj]) continue; used[bj] = 1;
        var dir2 = Math.random() < 0.5 ? -1 : 1;
        var len2 = 1 + Math.floor(Math.random() * reach);
        var ii = Math.min(cols, Math.max(0, i0 + dir2 * len2));
        if (ii === i0) continue;
        var leaf2 = node(ii, bj);
        segs.push([node(i0, bj), leaf2]); // rama horizontal
        nodes.push(leaf2);
      }
      nodes.push(a2, b2);
    }

    // Longitudes acumuladas para revelar las trazas progresivamente.
    var total = 0;
    var lens = segs.map(function (s) {
      var d = Math.abs(s[1].x - s[0].x) + Math.abs(s[1].y - s[0].y);
      total += d;
      return d;
    });

    return {
      segs: segs, nodes: nodes, lens: lens, total: total,
      color: accent(), t0: performance.now(),
      draw: 1100, hold: 900, fade: 2600
    };
  }

  var routes = [];
  var lastSpawn = 0;
  var SPAWN_EVERY = 900;  // ms entre nuevas rutas
  var MAX = 6;            // rutas simultáneas

  // Suavizado (smoothstep) para que el crecimiento no sea lineal a secas.
  function smooth(t) { return t * t * (3 - 2 * t); }

  function frame(now) {
    ctx.clearRect(0, 0, W, H);

    if (now - lastSpawn > SPAWN_EVERY && routes.length < MAX && cols > 2 && rows > 2) {
      routes.push(makeRoute());
      lastSpawn = now;
    }

    for (var r = routes.length - 1; r >= 0; r--) {
      var rt = routes[r];
      var age = now - rt.t0;
      var life = rt.draw + rt.hold + rt.fade;
      if (age > life) { routes.splice(r, 1); continue; }

      var reveal = smooth(Math.min(1, age / rt.draw));
      var alpha;
      if (age < rt.draw) alpha = (age / rt.draw) * 0.85;
      else if (age < rt.draw + rt.hold) alpha = 0.85;
      else alpha = 0.85 * (1 - (age - rt.draw - rt.hold) / rt.fade);

      var revealLen = reveal * rt.total;

      ctx.strokeStyle = rt.color;
      ctx.lineWidth = 1.4;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.globalAlpha = alpha;

      var acc = 0;
      var reached = [];   // extremos a los que la traza ya ha llegado
      ctx.beginPath();
      for (var s = 0; s < rt.segs.length; s++) {
        if (acc >= revealLen) break;
        var seg = rt.segs[s], L = rt.lens[s];
        var frac = Math.min(1, (revealLen - acc) / (L || 1));
        ctx.moveTo(seg[0].x, seg[0].y);
        ctx.lineTo(
          seg[0].x + (seg[1].x - seg[0].x) * frac,
          seg[0].y + (seg[1].y - seg[0].y) * frac
        );
        if (acc + L <= revealLen) reached.push(seg[1]); // segmento completo: pad a la vista
        acc += L;
      }
      ctx.stroke();

      // Pads: solo donde la traza ya ha llegado (sin parpadeo previo).
      // El pad de origen aparece en cuanto empieza a dibujarse el tronco.
      ctx.fillStyle = rt.color;
      ctx.globalAlpha = alpha;
      if (revealLen > 0) reached.push(rt.segs[0][0]);
      for (var n = 0; n < reached.length; n++) {
        ctx.beginPath();
        ctx.arc(reached[n].x, reached[n].y, 2.1, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.globalAlpha = 1;
    requestAnimationFrame(frame);
  }

  requestAnimationFrame(frame);
})();
