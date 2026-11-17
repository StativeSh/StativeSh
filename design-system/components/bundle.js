/* Studio Ink: the system's behaviour as one dependency-free classic script. Assigns window.StudioInk. */
(function () {
  var NS = {};
  var reduced = function () { return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches); };

  /* Filters: #si-boil (hand-drawn line boil) and #si-rough (torn paper edge). defs() adds them once and
     marks <html class="si-fx">, which is what switches the filters on in bundle.css. */
  var DEFS = '<svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false" style="position:absolute;width:0;height:0;overflow:hidden">' +
    '<filter id="si-boil" x="-10%" y="-10%" width="120%" height="120%"><feTurbulence id="si-boil-t" type="fractalNoise" baseFrequency="0.035" numOctaves="2" seed="1"/>' +
    '<feDisplacementMap in="SourceGraphic" scale="3.4" xChannelSelector="R" yChannelSelector="G"/></filter>' +
    '<filter id="si-rough" x="-5%" y="-5%" width="110%" height="110%"><feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves="3" seed="7"/>' +
    '<feDisplacementMap in="SourceGraphic" scale="8" xChannelSelector="R" yChannelSelector="G"/></filter></svg>';
  NS.defs = function () {
    if (!document.getElementById('si-boil')) {
      var holder = document.createElement('div'); holder.innerHTML = DEFS;
      (document.body || document.documentElement).insertBefore(holder.firstChild, (document.body || document.documentElement).firstChild);
    }
    document.documentElement.classList.add('si-fx');
  };

  /* Line boil: re-seeds the boil filter 12 times a second so ink lines wobble like 2D animation. */
  var boilTimer = 0;
  NS.boil = function (fps) {
    NS.defs(); if (reduced() || boilTimer) return;
    var t = document.getElementById('si-boil-t'), s = 1;
    boilTimer = setInterval(function () { if (document.hidden) return; s = s % 5 + 1; t.setAttribute('seed', String(s)); }, 1000 / (fps || 12));
  };

  /* Torn edge: a rounded rectangle whose outline is ripped, as a responsive clip-path polygon.
     Give a panel and its shadow slab the same seed so they tear alike. */
  NS.tear = function (el, opts) {
    opts = opts || {};
    var seed = opts.seed || 5, r = opts.radius == null ? 34 : opts.radius, amp = opts.amp == null ? 5 : opts.amp;
    var s = (seed * 9973) % 2147483647 || 1;
    var rnd = function () { s = (s * 16807) % 2147483647; return s / 2147483647; };
    var j = function () { var v = rnd() * amp; if (rnd() < 0.07) v += amp * 2 * rnd(); return v; };
    var P = function (xp, xx, yp, yy) { return 'calc(' + xp + '% + ' + xx.toFixed(1) + 'px) calc(' + yp + '% + ' + yy.toFixed(1) + 'px)'; };
    var pts = [], N = 72, M = 40, C = 7, i, t, a, q;
    for (i = 0; i <= N; i++) { t = i / N; pts.push(P(t * 100, r - 2 * r * t, 0, j())); }
    for (i = 1; i < C; i++) { a = -Math.PI / 2 + i / C * Math.PI / 2; q = r - j(); pts.push(P(100, -r + Math.cos(a) * q, 0, r + Math.sin(a) * q)); }
    for (i = 0; i <= M; i++) { t = i / M; pts.push(P(100, -j(), t * 100, r - 2 * r * t)); }
    for (i = 1; i < C; i++) { a = i / C * Math.PI / 2; q = r - j(); pts.push(P(100, -r + Math.cos(a) * q, 100, -r + Math.sin(a) * q)); }
    for (i = 0; i <= N; i++) { t = i / N; pts.push(P(100 - t * 100, -r + 2 * r * t, 100, -j())); }
    for (i = 1; i < C; i++) { a = Math.PI / 2 + i / C * Math.PI / 2; q = r - j(); pts.push(P(0, r + Math.cos(a) * q, 100, -r + Math.sin(a) * q)); }
    for (i = 0; i <= M; i++) { t = i / M; pts.push(P(0, j(), 100 - t * 100, -r + 2 * r * t)); }
    for (i = 1; i < C; i++) { a = Math.PI + i / C * Math.PI / 2; q = r - j(); pts.push(P(0, r + Math.cos(a) * q, 0, r + Math.sin(a) * q)); }
    el.style.clipPath = 'polygon(' + pts.join(',') + ')';
  };
  NS.tearAll = function (root) {
    (root || document).querySelectorAll('[data-si-tear]').forEach(function (el) {
      NS.tear(el, { seed: +el.getAttribute('data-si-tear') || 5, radius: el.hasAttribute('data-si-radius') ? +el.getAttribute('data-si-radius') : 34 });
    });
  };

  /* Split a display title into word and letter spans so letters can rise into place. Keeps an aria-label. */
  NS.split = function (el) {
    var txt = el.textContent.trim(); el.setAttribute('aria-label', txt); el.textContent = '';
    txt.split(' ').forEach(function (w, i, arr) {
      var ws = document.createElement('span'); ws.className = 'si-w'; ws.setAttribute('aria-hidden', 'true');
      Array.prototype.forEach.call(w, function (c) { var cs = document.createElement('span'); cs.className = 'si-ch'; cs.textContent = c; ws.appendChild(cs); });
      el.appendChild(ws); if (i < arr.length - 1) el.appendChild(document.createTextNode(' '));
    });
    return el;
  };
  NS.rise = function (el, delayMs) {
    if (reduced() || !el.animate) return;
    el.querySelectorAll('.si-ch').forEach(function (c, i) {
      c.animate([{ transform: 'translateY(105%)' }, { transform: 'translateY(0%)' }], { duration: 800, delay: (delayMs || 0) + i * 35, easing: 'cubic-bezier(.2,.9,.2,1)', fill: 'both' });
    });
  };

  /* Ink draws itself: every <path pathLength="1"> inside .si-ink elements under root, in order. */
  NS.drawIn = function (root, delayMs, staggerMs) {
    if (reduced()) return;
    var paths = (root || document).querySelectorAll('.si-ink path');
    Array.prototype.forEach.call(paths, function (p, i) {
      if (!p.animate) return;
      p.animate([{ strokeDashoffset: 1 }, { strokeDashoffset: 0 }], { duration: 750, delay: (delayMs || 0) + i * (staggerMs == null ? 140 : staggerMs), easing: 'cubic-bezier(.6,0,.3,1)', fill: 'both' });
    });
  };

  /* Word ring: words on a 3D cylinder that turns slowly and with scroll. el = the .si-ring-in element. */
  NS.ring = function (el, words, opts) {
    opts = opts || {};
    var n = opts.count || 16, R = opts.radius || 980, lift = R * Math.sin(0.1), i;
    for (i = 0; i < n; i++) {
      var s = document.createElement('span'); s.innerHTML = words[i % words.length] + '<i>×</i>';
      s.style.transform = 'rotateY(' + (i * 360 / n) + 'deg) translateZ(' + R + 'px)'; el.appendChild(s);
    }
    var T = function (a) { return 'translateY(-' + lift + 'px) translateZ(-' + R + 'px) rotateX(-5.7deg) rotateY(' + a + 'deg)'; };
    el.style.transform = T(-8);
    if (reduced()) return;
    var ang = 0, t = 0, run = false;
    var loop = function () { if (!run) return; t += 0.06; ang += (window.scrollY * 0.09 + t - ang) * 0.08; el.style.transform = T((-ang).toFixed(2)); requestAnimationFrame(loop); };
    new IntersectionObserver(function (e) { var was = run; run = e[0].isIntersecting; if (run && !was) requestAnimationFrame(loop); }).observe(el.parentElement);
  };

  /* Particle figure: the portrait renderer. points = [[x, y, tone], ...] in a box of width × height
     (default 300 × 376), tone 0 (light) to 1 (dark). Each point springs to its home:
       v += 0.045·(home − x) + F_cursor,  v *= 0.85,  x += v
     and is drawn by tone: below 0.6 a warm halftone dot, 0.6 and up a bold ink dot, and points that
     opts.isHair(x, y, tone) accepts become brush-stroke hair strands that wrap the head. */
  NS.particleFigure = function (canvas, points, opts) {
    opts = opts || {};
    var BW = opts.width || 300, BH = opts.height || 376, ctx = canvas.getContext('2d'), still = reduced();
    var head = opts.head || { cx: BW * 0.477, cy: BH * 0.4, ax: BW * 0.327, ay: BH * 0.324 };
    var isHair = opts.isHair || function () { return false; };
    var lerp = function (a, b, t) { return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]; };
    var INK = [27, 20, 16], AC = [255, 59, 78], SK1 = [246, 140, 96], SK2 = [150, 52, 36], IK1 = [60, 30, 24], IND = [52, 40, 92], SHEEN = [153, 141, 206];
    var HC = [0, 1, 2, 3].map(function (i) { return lerp(INK, IND, i / 3 * 0.6); }).concat([SHEEN]);
    var hn = function (x, y) { return Math.sin(x * 0.11 + Math.sin(y * 0.07) * 2) * 0.5 + Math.sin(y * 0.13 + Math.cos(x * 0.05) * 2) * 0.5; };
    var rgba = function (c, a) { return 'rgba(' + (c[0] | 0) + ',' + (c[1] | 0) + ',' + (c[2] | 0) + ',' + a.toFixed(2) + ')'; };
    var P = [], W = 0, H = 0, f = 0, mx = -999, my = -999, run = true, k = 1;
    var prm = { k: 0.045, c: 0.85, r: 0 }; // spring k, damping c, push radius in px (0 = automatic)
    var hc = document.createElement('canvas'), hx = hc.getContext('2d'), dirty = true, glowWas = false;
    function strandGeo(p, x, y, d) {
      var u = (x - head.cx) / head.ax, v = (y - head.cy) / head.ay, q = Math.hypot(u, v), rx = u / head.ax, ry = v / head.ay, l = Math.hypot(rx, ry) || 1; rx /= l; ry /= l;
      var tx = -ry, ty = rx, lift = Math.max(0, Math.min(1, (1 - q) / 0.4)) * 0.55;
      var a = Math.atan2(ty * (1 - lift) + ry * lift, tx * (1 - lift) + rx * lift) + hn(x, y) * 0.22 + (Math.random() - 0.5) * 0.12;
      var L = (4.5 + 3.5 * d) * (0.8 + Math.random() * 0.45) * 1.3, w = (0.9 + d) * 1.5, bend = hn(y, x) * 2.2, ca = Math.cos(a), sa = Math.sin(a), nx = -sa, ny = ca, hw = w / 2;
      var ex = ca * L, ey = sa * L, mx2 = ex / 2 + nx * bend, my2 = ey / 2 + ny * bend;
      p.g = [mx2 + nx * hw, my2 + ny * hw, ex, ey, mx2 - nx * hw, my2 - ny * hw];
      var su = (x - (head.cx + 2)) / (head.ax * 0.9), sv = (y - (head.cy - head.ay * 0.31)) / (head.ay * 0.64), q2 = Math.hypot(su, sv);
      p.cb = (q2 > 0.74 && q2 < 0.85 && y < head.cy - head.ay * 0.45 && hn(x * 1.7, y) > -0.25) ? 4 : Math.round(Math.max(0, Math.min(1, (q - 0.5) / 0.5)) * 3);
    }
    points.forEach(function (pt) {
      var x = pt[0], y = pt[1], d = pt[2], hair = isHair(x, y, d);
      var p = { hx0: x, hy0: y, d: d, ph: Math.random() * 6.283, x: 0, y: 0, vx: 0, vy: 0, w: 0, hr: hair && d >= 0.45, hz: hair && d < 0.45 };
      if (p.hr) strandGeo(p, x, y, d); P.push(p);
    });
    var ORD = P.map(function (p, i) { return i; }).sort(function (a, b) { return P[a].d - P[b].d; });
    function strand(pa, p) { var g = p.g; pa.moveTo(p.x, p.y); pa.quadraticCurveTo(p.x + g[0] * k, p.y + g[1] * k, p.x + g[2] * k, p.y + g[3] * k); pa.quadraticCurveTo(p.x + g[4] * k, p.y + g[5] * k, p.x, p.y); pa.closePath(); }
    function layout() {
      var dpr = window.devicePixelRatio || 1, first = !W; W = canvas.clientWidth; H = canvas.clientHeight;
      canvas.width = hc.width = W * dpr; canvas.height = hc.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); hx.setTransform(dpr, 0, 0, dpr, 0, 0); dirty = true;
      var sc = Math.min(W / BW, H / BH), ox = (W - BW * sc) / 2, oy = H - BH * sc; k = Math.max(0.8, sc / 1.53);
      P.forEach(function (p) { p.tx = ox + p.hx0 * sc; p.ty = oy + p.hy0 * sc; });
      if (first) { if (still) P.forEach(function (p) { p.x = p.tx; p.y = p.ty; }); else scatter(); }
    }
    function scatter() {
      P.forEach(function (p) { var a = Math.random() * 6.283, r = W * 0.6 + Math.random() * W * 0.5; p.x = p.tx + Math.cos(a) * r; p.y = p.ty + Math.sin(a) * r; p.vx = p.vy = 0; p.w = Math.floor(Math.random() * 80); });
      f = 0; dirty = true;
    }
    function frame() {
      if (!run) return; f++; ctx.clearRect(0, 0, W, H);
      var R = prm.r || Math.max(46, W * 0.13), G = R * 1.6, hMove = false, hGlow = false;
      P.forEach(function (p) {
        if (f > p.w) {
          var s = (still || p.hr) ? 0 : 0.35, sx = p.tx + Math.sin(f * 0.025 + p.ph) * s, sy = p.ty + Math.cos(f * 0.025 + p.ph) * s;
          p.vx += (sx - p.x) * prm.k; p.vy += (sy - p.y) * prm.k;
          var dx = p.x - mx, dy = p.y - my, dd = dx * dx + dy * dy;
          if (dd < R * R && dd > 0.01) { var di = Math.sqrt(dd), kk = Math.pow(1 - di / R, 2) * 6; p.vx += dx / di * kk; p.vy += dy / di * kk; }
          p.vx *= prm.c; p.vy *= prm.c; p.x += p.vx; p.y += p.vy;
        }
        if (p.hr) { if (f <= p.w || Math.abs(p.vx) + Math.abs(p.vy) > 0.003) hMove = true; if (!hGlow) { var gx = p.x - mx, gy = p.y - my; if (gx * gx + gy * gy < G * G) hGlow = true; } }
      });
      ORD.forEach(function (i) {
        var p = P[i]; if (p.hr) return;
        var gx = p.x - mx, gy = p.y - my, gl = Math.max(0, 1 - Math.sqrt(gx * gx + gy * gy) / G), fade = Math.min(1, Math.max(0, (H - p.y) / (H * 0.16))), col, a, r;
        if (p.hz) { col = lerp(IND, AC, gl); a = 0.35; r = (0.6 + p.d) * k; }
        else if (p.d < 0.6) { var s = p.d / 0.6; col = lerp(SK1, SK2, Math.pow(s, 1.4)); a = 0.3 + 0.4 * s; r = (1.1 + 1.5 * s) * k; }
        else { var e = (p.d - 0.6) / 0.4; col = lerp(IK1, INK, e); a = Math.min(1, 0.8 + 0.2 * e); r = (1 + 0.9 * e) * k; }
        if (gl > 0 && !p.hz) col = lerp(col, AC, gl);
        ctx.fillStyle = rgba(col, Math.min(1, a + gl * 0.3) * fade); ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, 6.283); ctx.fill();
      });
      if (dirty || hMove || hGlow || glowWas) {
        hx.clearRect(0, 0, W, H); var HB = [0, 1, 2, 3, 4].map(function () { return new Path2D(); }), any = [0, 0, 0, 0, 0];
        P.forEach(function (p) {
          if (!p.hr) return; var gx = p.x - mx, gy = p.y - my, gl = hGlow ? Math.max(0, 1 - Math.sqrt(gx * gx + gy * gy) / G) : 0;
          if (gl > 0) { hx.fillStyle = rgba(lerp(HC[p.cb], AC, gl), 0.95); var pa = new Path2D(); strand(pa, p); hx.fill(pa); }
          else { strand(HB[p.cb], p); any[p.cb] = 1; }
        });
        for (var b = 0; b < 5; b++) if (any[b]) { hx.fillStyle = rgba(HC[b], 0.95); hx.fill(HB[b]); }
        dirty = false;
      }
      glowWas = hGlow; ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.drawImage(hc, 0, 0); ctx.restore();
      requestAnimationFrame(frame);
    }
    var host = canvas.parentElement || canvas;
    var setM = function (e) { var r = canvas.getBoundingClientRect(), t = e.touches ? e.touches[0] : e; mx = t.clientX - r.left; my = t.clientY - r.top; };
    var clr = function () { mx = my = -999; };
    host.addEventListener('mousemove', setM); host.addEventListener('touchstart', setM, { passive: true }); host.addEventListener('touchmove', setM, { passive: true });
    host.addEventListener('mouseleave', clr); host.addEventListener('touchend', clr);
    layout(); window.addEventListener('resize', layout);
    new IntersectionObserver(function (e) { var was = run; run = e[0].isIntersecting; if (run && !was) requestAnimationFrame(frame); }).observe(canvas);
    requestAnimationFrame(frame);
    return {
      count: P.length,
      /* Change the update rule live: {k, c, r}; r = 0 goes back to the automatic push radius. */
      set: function (o) { if (o.k != null) prm.k = +o.k; if (o.c != null) prm.c = +o.c; if (o.r != null) prm.r = +o.r; dirty = true; },
      get: function () { return { k: prm.k, c: prm.c, r: prm.r || Math.round(Math.max(46, W * 0.13)) }; },
      /* Throw every dot out so it springs home under the current constants. */
      scatter: scatter
    };
  };

  /* Lab controls: wires a .si-lab panel (range inputs data-si-lab="k|c|r", outputs data-si-out="k|c|r",
     buttons data-si-act="scatter|reset", optional [data-si-eq="k|c"] spans in the printed equation) to a figure. */
  NS.labControls = function (root, figure) {
    var inputs = {}, outs = {}, eqs = {}, def = { k: 0.045, c: 0.85 };
    root.querySelectorAll('[data-si-lab]').forEach(function (el) { inputs[el.getAttribute('data-si-lab')] = el; });
    root.querySelectorAll('[data-si-out]').forEach(function (el) { outs[el.getAttribute('data-si-out')] = el; });
    document.querySelectorAll('[data-si-eq]').forEach(function (el) { eqs[el.getAttribute('data-si-eq')] = el; });
    var fmt = { k: function (v) { return (+v).toFixed(3); }, c: function (v) { return (+v).toFixed(2); }, r: function (v) { return Math.round(v) + 'px'; } };
    function show() { Object.keys(inputs).forEach(function (n) { var v = inputs[n].value; if (outs[n]) outs[n].textContent = fmt[n](v); if (eqs[n]) eqs[n].textContent = fmt[n](v); }); }
    function sync() { var o = {}; Object.keys(inputs).forEach(function (n) { o[n] = +inputs[n].value; }); figure.set(o); show(); }
    if (inputs.r) inputs.r.value = figure.get().r;
    Object.keys(inputs).forEach(function (n) { inputs[n].addEventListener('input', sync); });
    show();
    var sc = root.querySelector('[data-si-act="scatter"]'), rs = root.querySelector('[data-si-act="reset"]');
    if (sc) { if (reduced()) sc.hidden = true; else sc.addEventListener('click', function () { figure.scatter(); }); }
    if (rs) rs.addEventListener('click', function () {
      if (inputs.k) inputs.k.value = def.k; if (inputs.c) inputs.c.value = def.c;
      figure.set({ k: def.k, c: def.c, r: 0 }); if (inputs.r) inputs.r.value = figure.get().r; show();
    });
  };

  var palette = { tan: [212, 174, 122], lavender: [168, 148, 255], red: [255, 59, 78], deep: '#050505' };
  var rgbaS = function (c, a) { return 'rgba(' + (c[0] | 0) + ',' + (c[1] | 0) + ',' + (c[2] | 0) + ',' + a.toFixed(3) + ')'; };
  var rot3 = function (x, y, z, a, b) { var c = Math.cos(a), s = Math.sin(a), x1 = x * c + z * s, z1 = z * c - x * s, c2 = Math.cos(b), s2 = Math.sin(b); return [x1, y * c2 - z1 * s2, z1 * c2 + y * s2]; };
  function fitCanvas(cv, cx) { var dpr = window.devicePixelRatio || 1, w = cv.clientWidth, h = cv.clientHeight; cv.width = w * dpr; cv.height = h * dpr; cx.setTransform(dpr, 0, 0, dpr, 0, 0); return [w, h]; }

  /* Hydrogen orbitals as point clouds sampled by rejection from the real |ψ|² (r in Bohr radii, θ from the
     vertical axis), coloured by the sign of ψ (tan +, lavender −), springing from shape to shape.
       1s: e^(−2r)   2p_z: r² e^(−r) cos²θ   3d_z²: r⁴ e^(−2r/3) (3cos²θ − 1)²
     Returns {set(name), mode}; names are '1s', '2p', '3d'. */
  NS.ORBITALS = {
    '1s': { R: 4.2, max: 1, eq: '|ψ 1s|² ∝ e^(−2r)', d: function (r) { return Math.exp(-2 * r); }, sign: function () { return 1; } },
    '2p': { R: 13, max: 0.55, eq: '|ψ 2p_z|² ∝ r² e^(−r) cos²θ', d: function (r, ct) { return r * r * Math.exp(-r) * ct * ct; }, sign: function (ct) { return ct > 0 ? 1 : -1; } },
    '3d': { R: 26, max: 96, eq: '|ψ 3d_z²|² ∝ r⁴ e^(−2r/3) (3cos²θ − 1)²', d: function (r, ct) { return Math.pow(r, 4) * Math.exp(-2 * r / 3) * Math.pow(3 * ct * ct - 1, 2); }, sign: function (ct) { return 3 * ct * ct - 1 > 0 ? 1 : -1; } }
  };
  NS.orbitals = function (canvas, opts) {
    opts = opts || {};
    var N = opts.points || 1400, ctx = canvas.getContext('2d'), still = reduced(), cache = {}, mode = null;
    var pos = new Float32Array(N * 3), vel = new Float32Array(N * 3), tgt = new Float32Array(N * 3), sg = new Int8Array(N);
    var W = 0, H = 0, t = 0, ax = 0, ay = 0, tax = 0, tay = 0, run = false;
    function sample(name) {
      if (cache[name]) return cache[name];
      var o = NS.ORBITALS[name], s = 17 + name.charCodeAt(0) * 101, pts = new Float32Array(N * 3), sgn = new Int8Array(N), sc = 125 / o.R;
      var rnd = function () { s = (s * 16807) % 2147483647; return s / 2147483647; };
      for (var n = 0, guard = 0; n < N && guard < 3e6; guard++) {
        var x = (rnd() * 2 - 1) * o.R, y = (rnd() * 2 - 1) * o.R, z = (rnd() * 2 - 1) * o.R, r = Math.hypot(x, y, z) || 1e-6, ct = -y / r;
        if (rnd() * o.max > o.d(r, ct)) continue;
        pts[n * 3] = x * sc; pts[n * 3 + 1] = y * sc; pts[n * 3 + 2] = z * sc; sgn[n] = o.sign(ct); n++;
      }
      return (cache[name] = { pts: pts, sg: sgn });
    }
    function draw() {
      ctx.clearRect(0, 0, W, H);
      var cx = W / 2, cy = H / 2, u = Math.min(W, H) / 300, F = 520, back = [], front = [];
      for (var i = 0; i < N; i++) { var v = rot3(pos[i * 3], pos[i * 3 + 1], pos[i * 3 + 2], ax + t * 0.15, ay + 0.25); (v[2] < 0 ? back : front).push([v, sg[i]]); }
      var dot = function (e) { var v = e[0], s = F / (F - v[2]), d = Math.max(0, Math.min(1, (v[2] + 130) / 260)); ctx.fillStyle = rgbaS(e[1] > 0 ? palette.tan : palette.lavender, 0.25 + 0.6 * d); ctx.beginPath(); ctx.arc(cx + v[0] * s * u, cy + v[1] * s * u, (1.1 + 1.4 * d) * u * s, 0, 6.283); ctx.fill(); };
      back.forEach(dot);
      ctx.fillStyle = palette.deep; ctx.beginPath(); ctx.arc(cx, cy, 6.6 * u, 0, 6.283); ctx.fill();
      ctx.fillStyle = rgbaS(palette.red, 1); ctx.beginPath(); ctx.arc(cx, cy, 5 * u, 0, 6.283); ctx.fill();
      front.forEach(dot);
    }
    function loop() {
      if (!run) return; t += 0.016; ax += (tax - ax) * 0.06; ay += (tay - ay) * 0.06;
      for (var i = 0; i < N * 3; i++) { vel[i] = (vel[i] + (tgt[i] - pos[i]) * 0.07) * 0.8; pos[i] += vel[i]; }
      draw(); requestAnimationFrame(loop);
    }
    function set(name) {
      var s = sample(name); tgt.set(s.pts); sg = s.sg; mode = name;
      if (still) { pos.set(tgt); draw(); }
      if (opts.onChange) opts.onChange(name, NS.ORBITALS[name].eq);
    }
    var wh = fitCanvas(canvas, ctx); W = wh[0]; H = wh[1];
    window.addEventListener('resize', function () { var d = fitCanvas(canvas, ctx); W = d[0]; H = d[1]; draw(); });
    set(opts.mode || '1s');
    if (!still) {
      var host = canvas.parentElement || canvas;
      host.addEventListener('pointermove', function (e) { var r = host.getBoundingClientRect(); tax = ((e.clientX - r.left) / r.width - 0.5) * 1.2; tay = ((e.clientY - r.top) / r.height - 0.5) * -0.9; });
      host.addEventListener('pointerleave', function () { tax = tay = 0; });
      new IntersectionObserver(function (e) { var was = run; run = e[0].isIntersecting; if (run && !was) requestAnimationFrame(loop); }).observe(canvas);
    }
    return { set: set, get mode() { return mode; } };
  };

  /* A live double slit: solves i∂ψ/∂t = −½∇²ψ + Vψ (ħ = m = 1) on a grid with Visscher's staggered
     scheme (R += dt·H·I, I −= dt·H·R), absorbing edges, a barrier with one or two slits, and a screen near
     the right edge that accumulates |ψ|² into fringes (drawn as tan bars). Returns {fire(y), slits(n)}. */
  NS.doubleSlit = function (canvas, opts) {
    opts = opts || {};
    var NX = 240, NY = 108, DT = 0.18, BX = 90, BW = 3, VB = 6, still = reduced(), ctx = canvas.getContext('2d');
    var R = new Float32Array(NX * NY), I = new Float32Array(NX * NY), V = new Float32Array(NX * NY), M = new Float32Array(NX * NY), ACC = new Float32Array(NY);
    var off = document.createElement('canvas'); off.width = NX; off.height = NY; var oc = off.getContext('2d'), img = oc.createImageData(NX, NY);
    var W = 0, H = 0, nSlits = opts.slits || 2, run = false, steps = 0, norm0 = 1, gain = 1, idle = 0, y0 = NY / 2;
    var CM = [[10, 8, 18], [52, 40, 92], [224, 69, 123], [247, 235, 210]];
    for (var y = 0; y < NY; y++) for (var x = 0; x < NX; x++) { var d = Math.min(x, NX - 1 - x, y, NY - 1 - y); M[y * NX + x] = d < 14 ? 1 - 0.06 * Math.pow((14 - d) / 14, 2) : 1; }
    function barrier() {
      V.fill(0); var c = NY / 2;
      for (var y = 0; y < NY; y++) {
        var open = nSlits === 2 ? (Math.abs(y - (c - 10)) < 3 || Math.abs(y - (c + 10)) < 3) : Math.abs(y - c) < 3;
        if (!open) for (var x = BX; x < BX + BW; x++) V[y * NX + x] = VB;
      }
    }
    function fire(yy) {
      y0 = yy == null ? NY / 2 : Math.max(18, Math.min(NY - 18, yy)); var n = 0;
      for (var y = 0; y < NY; y++) for (var x = 0; x < NX; x++) { var i = y * NX + x, e = Math.exp(-(Math.pow(x - 36, 2) / 98 + Math.pow(y - y0, 2) / 338)); R[i] = e * Math.cos(1.25 * x); I[i] = e * Math.sin(1.25 * x); n += e * e; }
      norm0 = n; steps = 0; idle = 0; ACC.fill(0);
    }
    function step() {
      var x, y, i;
      for (y = 1; y < NY - 1; y++) for (x = 1; x < NX - 1; x++) { i = y * NX + x; R[i] += DT * (-0.5 * (I[i - 1] + I[i + 1] + I[i - NX] + I[i + NX] - 4 * I[i]) + V[i] * I[i]); }
      for (y = 1; y < NY - 1; y++) for (x = 1; x < NX - 1; x++) { i = y * NX + x; I[i] -= DT * (-0.5 * (R[i - 1] + R[i + 1] + R[i - NX] + R[i + NX] - 4 * R[i]) + V[i] * R[i]); R[i] *= M[i]; I[i] *= M[i]; }
      var sx = NX - 26; for (y = 0; y < NY; y++) { i = y * NX + sx; ACC[y] += R[i] * R[i] + I[i] * I[i]; }
      steps++;
    }
    function view() { var s = Math.max(W / NX, H / NY); return { s: s, ox: (W - NX * s) / 2, oy: (H - NY * s) / 2 }; }
    function draw() {
      var mx = 1e-9, tot = 0, i, p;
      for (i = 0; i < NX * NY; i++) { p = R[i] * R[i] + I[i] * I[i]; tot += p; if (V[i] === 0 && p > mx) mx = p; }
      gain += (1 / Math.sqrt(mx) - gain) * (steps < 12 ? 1 : 0.15);
      for (i = 0; i < NX * NY; i++) {
        var o = i * 4;
        if (V[i] > 0) { img.data[o] = 236; img.data[o + 1] = 234; img.data[o + 2] = 233; img.data[o + 3] = 255; continue; }
        var v = Math.min(0.999, Math.pow(Math.sqrt(R[i] * R[i] + I[i] * I[i]) * gain, 0.85)) * 3, k = v | 0, f = v - k, a = CM[k], b = CM[k + 1];
        img.data[o] = a[0] + (b[0] - a[0]) * f; img.data[o + 1] = a[1] + (b[1] - a[1]) * f; img.data[o + 2] = a[2] + (b[2] - a[2]) * f; img.data[o + 3] = 255;
      }
      oc.putImageData(img, 0, 0); var vw = view(); ctx.clearRect(0, 0, W, H); ctx.imageSmoothingEnabled = true; ctx.drawImage(off, vw.ox, vw.oy, NX * vw.s, NY * vw.s);
      var am = 1e-9; for (var y = 0; y < NY; y++) am = Math.max(am, ACC[y]);
      var right = Math.min(W, vw.ox + (NX - 14) * vw.s), len = Math.min(W * 0.16, 90);
      ctx.fillStyle = 'rgba(212,174,122,.9)'; for (y = 0; y < NY; y++) { var w = ACC[y] / am * len; if (w > 0.5) ctx.fillRect(right - w, vw.oy + y * vw.s, w, Math.max(1, vw.s * 0.8)); }
      ctx.fillStyle = 'rgba(236,234,233,.35)'; ctx.fillRect(right, 0, 1.5, H);
      return tot / norm0;
    }
    function loop() {
      if (!run) return;
      if (idle > 0) { if (++idle > 70) fire(); } else { for (var k = 0; k < 6; k++) step(); if (steps > 1500) idle = 1; }
      var left = draw(); if (idle === 0 && steps > 200 && left < 0.02) idle = 1;
      requestAnimationFrame(loop);
    }
    function settle() { fire(y0); for (var k = 0; k < 470; k++) step(); draw(); }
    var wh = fitCanvas(canvas, ctx); W = wh[0]; H = wh[1]; barrier();
    window.addEventListener('resize', function () { var d = fitCanvas(canvas, ctx); W = d[0]; H = d[1]; draw(); });
    canvas.addEventListener('click', function (e) { var r = canvas.getBoundingClientRect(), vw = view(), gy = (e.clientY - r.top - vw.oy) / vw.s; if (still) { y0 = gy; settle(); } else fire(gy); });
    if (still) settle();
    else { fire(); new IntersectionObserver(function (e) { var was = run; run = e[0].isIntersecting; if (run && !was) requestAnimationFrame(loop); }).observe(canvas); }
    return {
      fire: function (yy) { if (still) { if (yy != null) y0 = yy; settle(); } else fire(yy); },
      slits: function (n) { nSlits = n === 1 ? 1 : 2; barrier(); if (still) settle(); else fire(); }
    };
  };

  /* Chips: wires a group of buttons with data-si-chip="<value>" so exactly one is aria-pressed, and calls onPick(value). */
  NS.chips = function (group, onPick) {
    var btns = group.querySelectorAll('[data-si-chip]');
    btns.forEach(function (b) { b.addEventListener('click', function () {
      btns.forEach(function (c) { c.setAttribute('aria-pressed', String(c === b)); }); onPick(b.getAttribute('data-si-chip'));
    }); });
  };

  /* One call for a page: filters on, boil running, every [data-si-tear] torn. */
  NS.init = function () { NS.defs(); NS.boil(); NS.tearAll(); };

  window.StudioInk = NS;
})();
