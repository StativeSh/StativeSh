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
      if (first) P.forEach(function (p) {
        if (still) { p.x = p.tx; p.y = p.ty; return; }
        var a = Math.random() * 6.283, r = W * 0.6 + Math.random() * W * 0.5; p.x = p.tx + Math.cos(a) * r; p.y = p.ty + Math.sin(a) * r; p.w = Math.floor(Math.random() * 80);
      });
    }
    function frame() {
      if (!run) return; f++; ctx.clearRect(0, 0, W, H);
      var R = Math.max(46, W * 0.13), G = R * 1.6, hMove = false, hGlow = false;
      P.forEach(function (p) {
        if (f > p.w) {
          var s = (still || p.hr) ? 0 : 0.35, sx = p.tx + Math.sin(f * 0.025 + p.ph) * s, sy = p.ty + Math.cos(f * 0.025 + p.ph) * s;
          p.vx += (sx - p.x) * 0.045; p.vy += (sy - p.y) * 0.045;
          var dx = p.x - mx, dy = p.y - my, dd = dx * dx + dy * dy;
          if (dd < R * R && dd > 0.01) { var di = Math.sqrt(dd), kk = Math.pow(1 - di / R, 2) * 6; p.vx += dx / di * kk; p.vy += dy / di * kk; }
          p.vx *= 0.85; p.vy *= 0.85; p.x += p.vx; p.y += p.vy;
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
    return { count: P.length };
  };

  /* One call for a page: filters on, boil running, every [data-si-tear] torn. */
  NS.init = function () { NS.defs(); NS.boil(); NS.tearAll(); };

  window.StudioInk = NS;
})();
