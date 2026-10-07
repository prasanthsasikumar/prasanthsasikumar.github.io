(() => {
  'use strict';
  const root = document.documentElement;
  root.classList.add('js');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  const hasIO = 'IntersectionObserver' in window;
  const motionListeners = [];
  let saved = null;
  try { saved = localStorage.getItem('ps-motion'); } catch {}
  let moving = saved === 'off' ? false : saved === 'on' ? true : !reduce.matches;

  const observe = (elements, callback, options) => {
    if (!hasIO) { elements.forEach(target => callback({ target, isIntersecting: true })); return null; }
    const observer = new IntersectionObserver(entries => entries.forEach(callback), options);
    elements.forEach(element => observer.observe(element));
    return observer;
  };

  /* Motion on / off. Remembered per browser; follows reduced-motion until you choose. */
  function setMotion(on, save = false) {
    moving = on;
    root.dataset.motion = moving ? 'on' : 'off';
    document.querySelectorAll('.motion-toggle').forEach(button => {
      button.textContent = moving ? 'Motion on' : 'Motion off';
      button.setAttribute('aria-pressed', String(moving));
      button.title = moving ? 'Turn animations off' : 'Turn animations on';
    });
    if (save) { saved = moving ? 'on' : 'off'; try { localStorage.setItem('ps-motion', saved); } catch {} }
    motionListeners.forEach(listener => listener(moving));
  }
  document.querySelectorAll('.motion-toggle').forEach(button => button.addEventListener('click', () => setMotion(!moving, true)));
  reduce.addEventListener?.('change', () => { if (saved === null) setMotion(!reduce.matches); });
  setMotion(moving);

  /* Navigation: mobile menu and the section in view. */
  const nav = document.querySelector('[data-nav]');
  const menuButton = nav?.querySelector('.menu-btn');
  if (menuButton) {
    const setOpen = open => {
      nav.classList.toggle('is-open', open);
      menuButton.setAttribute('aria-expanded', String(open));
      menuButton.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    };
    menuButton.addEventListener('click', () => setOpen(!nav.classList.contains('is-open')));
    nav.querySelectorAll('.mobile-menu a').forEach(link => link.addEventListener('click', () => setOpen(false)));
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && nav.classList.contains('is-open')) { setOpen(false); menuButton.focus(); }
    });
  }
  const tabs = [...document.querySelectorAll('.nav-tabs a[data-section]')];
  if (tabs.length && hasIO) {
    const inView = new Set();
    const sections = tabs.map(tab => document.getElementById(tab.dataset.section)).filter(Boolean);
    observe(sections, entry => {
      if (entry.isIntersecting) inView.add(entry.target.id); else inView.delete(entry.target.id);
      const current = sections.filter(section => inView.has(section.id)).pop()?.id;
      tabs.forEach(tab => tab.classList.toggle('is-active', tab.dataset.section === current));
    }, { rootMargin: '-40% 0px -55% 0px' });
  }

  /* Scroll reveals. */
  observe([...document.querySelectorAll('[data-reveal]')], entry => {
    if (entry.isIntersecting) entry.target.classList.add('is-in');
  }, { rootMargin: '0px 0px -6% 0px', threshold: 0.06 });

  /* Typed terminal: types the command, cycles who it is for, settles on the last. */
  const typed = document.querySelector('.typed[data-type]');
  if (typed) {
    const command = typed.dataset.type, targets = (typed.dataset.cycle || '').split(',').filter(Boolean);
    const last = targets[targets.length - 1] || '';
    const commandText = document.createTextNode(''), target = document.createElement('span');
    target.className = 'domain';
    typed.replaceChildren(commandText, target);
    let timers = [];
    const show = (head, tail) => { commandText.data = head; target.textContent = tail; };
    const finish = () => { timers.forEach(clearTimeout); timers = []; show(command, last); };
    if (!moving) finish();
    else {
      let at = 900;
      const queue = (head, tail, wait) => { timers.push(setTimeout(() => show(head, tail), at)); at += wait; };
      for (let i = 1; i <= command.length; i++) queue(command.slice(0, i), '', 26 + Math.random() * 34);
      targets.forEach((value, index) => {
        for (let i = 1; i <= value.length; i++) queue(command, value.slice(0, i), 58 + Math.random() * 40);
        if (index === targets.length - 1) return;
        at += 1150;
        for (let i = value.length - 1; i >= 0; i--) queue(command, value.slice(0, i), 24);
        at += 200;
      });
    }
    motionListeners.push(on => { if (!on) finish(); });
  }

  /* Figures only animate while on screen (CSS for keyframes, SMIL via pauseAnimations). */
  const figures = [...document.querySelectorAll('.act-fig')];
  const syncFigure = figure => {
    const svg = figure.querySelector('svg');
    if (!svg?.pauseAnimations) return;
    if (moving && figure.classList.contains('is-playing')) svg.unpauseAnimations(); else svg.pauseAnimations();
  };
  observe(figures, entry => { entry.target.classList.toggle('is-playing', entry.isIntersecting); syncFigure(entry.target); }, { rootMargin: '60px' });
  motionListeners.push(() => figures.forEach(syncFigure));

  /* Story: six key chapters first, the rest behind a button (and opened by any link into them). */
  const actsBox = document.querySelector('.acts');
  const more = document.querySelector('.more-btn');
  if (actsBox && more) {
    const total = actsBox.children.length;
    const setOpen = open => {
      actsBox.classList.toggle('is-collapsed', !open);
      more.setAttribute('aria-expanded', String(open));
      more.firstChild.textContent = open ? 'Show fewer chapters ' : `Show all ${total} chapters `;
      more.lastElementChild.textContent = open ? '−' : '+';
    };
    more.addEventListener('click', () => setOpen(actsBox.classList.contains('is-collapsed')));
    const openFor = id => { const el = id ? document.getElementById(id) : null; if (el && el.classList.contains('is-extra')) setOpen(true); };
    document.querySelectorAll('a[href^="#"]').forEach(link => link.addEventListener('click', () => openFor(link.getAttribute('href').slice(1))));
    openFor(location.hash.slice(1));
  }

  /* Story direction: forward from the start, or rewind from now. */
  const acts = document.querySelector('.acts');
  const flip = document.querySelector('.story-flip');
  if (acts && flip) {
    const lead = document.querySelector('#story-title .lead-text');
    const sub = document.querySelector('#story-title .sub-text');
    const label = flip.querySelector('.flip-label');
    const glyphs = '01<>/#%&*+=';
    const scramble = (element, text) => {
      if (!moving) { element.textContent = text; return; }
      const start = performance.now(), length = text.length;
      const tick = now => {
        const done = Math.min(1, (now - start) / 520), fixed = Math.floor(done * length);
        let out = text.slice(0, fixed);
        for (let i = fixed; i < length; i++) out += text[i] === ' ' ? ' ' : glyphs[(Math.random() * glyphs.length) | 0];
        element.textContent = out;
        if (done < 1) requestAnimationFrame(tick); else element.textContent = text;
      };
      requestAnimationFrame(tick);
    };
    let rewound = false, busy = false;
    const reorder = () => {
      [...acts.children].reverse().forEach(card => acts.appendChild(card));
      [...acts.children].forEach((card, index) => card.style.setProperty('--k', index));
    };
    [...acts.children].forEach((card, index) => card.style.setProperty('--k', index));
    flip.addEventListener('click', () => {
      if (busy) return;
      rewound = !rewound;
      flip.setAttribute('aria-pressed', String(rewound));
      const key = rewound ? 'rewind' : 'forward';
      scramble(lead, lead.dataset[key]);
      scramble(sub, sub.dataset[key]);
      label.textContent = rewound ? 'Play from the start' : 'Rewind from now';
      if (!moving) { reorder(); return; }
      busy = true;
      acts.classList.add('is-turning');
      const count = acts.children.length;
      setTimeout(() => {
        acts.classList.remove('is-turning');
        reorder();
        acts.classList.add('is-landing');
        setTimeout(() => { acts.classList.remove('is-landing'); busy = false; }, 640 + count * 40);
      }, 360 + count * 40);
    });
  }

  /* Hero: a dot-matrix map of the route so far. Routes draw in order and carry
     packets, wearables blink online and stream home to Singapore, the pointer
     acts as a gaze reticle that lights the land, and a click adds you. */
  const fx = document.querySelector('.hero-fx');
  const base = document.querySelector('.hero-base');
  const focus = document.querySelector('.map-focus');
  if (fx && base && focus) heroMap();

  function heroMap() {
    const hero = fx.closest('.hero');
    const bctx = base.getContext('2d'), ctx = fx.getContext('2d');
    const LAT_TOP = 84, RES = 0.5;
    // Everything personal lives in assets/config.js (window.SITE.map).
    const MAP = (window.SITE && window.SITE.map) || {};
    let AREA = MAP.area || { lon0: -14, lon1: 292, lat0: 62, lat1: -48 };
    const PULSE = '255,122,69';
    const PLACES = MAP.places || {};
    const ROUTES = MAP.routes || [];
    const TRIPS = (MAP.trips || []).filter(trip => PLACES[trip.from]);
    const hash = (a, b) => { let h = Math.imul(a, 374761393) + Math.imul(b, 668265263); h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; };
    let mask = null, mw = 0, mh = 0;
    let width = 0, height = 0, ratio = 1, k = 1, ox = 0, oy = 0, gap = 7, dot = 2;
    let dots = [], cols = [], routes = [], blips = [], trips = [], region = null, avoid = null;
    let pointer = null, gaze = null, frame = 0, visible = true, started = performance.now(), lastBlip = 0;
    const project = (lon, lat) => [ox + ((lon < AREA.lon0 ? lon + 360 : lon) - AREA.lon0) * k, oy + (AREA.lat0 - lat) * k];
    const home = () => project(PLACES.sg.lon, PLACES.sg.lat);

    function layout() {
      const hb = hero.getBoundingClientRect(), fb = focus.getBoundingClientRect();
      width = hb.width; height = hb.height;
      AREA = (width < 980 && MAP.areaMobile) || MAP.area || AREA;
      ratio = Math.min(window.devicePixelRatio || 1, 2);
      for (const c of [base, fx]) { c.width = Math.round(width * ratio); c.height = Math.round(height * ratio); }
      const spanLon = AREA.lon1 - AREA.lon0, spanLat = AREA.lat0 - AREA.lat1;
      const bw = Math.max(120, fb.width), bh = Math.max(120, fb.height);
      k = Math.min(bw / spanLon, bh / spanLat);
      ox = fb.left - hb.left + (bw - spanLon * k) / 2;
      oy = fb.top - hb.top + (bh - spanLat * k) / 2;
      region = { x0: ox, x1: ox + spanLon * k, y0: oy, y1: oy + spanLat * k };
      const copy = hero.querySelector('.hero-copy')?.getBoundingClientRect();
      avoid = copy ? { x0: copy.left - hb.left - 10, x1: copy.right - hb.left + 10, y0: copy.top - hb.top - 10, y1: copy.bottom - hb.top + 10 } : null;
      gap = width < 700 ? 5 : width < 1200 ? 6 : 7;
      dot = gap < 6 ? 1.6 : 2;
      buildDots(); drawBase();
      routes = ROUTES.map(([a, b, remote]) => ({ remote: !!remote, points: arc(PLACES[a], PLACES[b]) }));
      const inside = ([x, y]) => x >= region.x0 - 2 && x <= region.x1 + 2 && y >= region.y0 - 2 && y <= region.y1 + 2;
      trips = TRIPS.map(trip => ({ ...trip, xy: project(trip.lon, trip.lat), points: arc(PLACES[trip.from], trip) })).filter(trip => inside(trip.xy));
      blips = blips.filter(b => b.you);
      draw(performance.now()); start();
    }

    function buildDots() {
      dots = []; cols = [];
      const nc = Math.ceil(width / gap), nr = Math.ceil(height / gap);
      for (let i = 0; i < nc; i++) {
        const list = [], x = i * gap + gap / 2;
        const lon = ((AREA.lon0 + (x - ox) / k + 180) % 360 + 360) % 360 - 180;
        const col = Math.min(mw - 1, Math.floor((lon + 180) / RES));
        for (let j = 0; j < nr; j++) {
          const y = j * gap + gap / 2;
          const row = Math.floor((LAT_TOP - (AREA.lat0 - (y - oy) / k)) / RES);
          if (row < 0 || row >= mh || !mask[row * mw + col]) continue;
          list.push(dots.length);
          dots.push({ x, y, a: 0.14 + hash(i, j) * 0.18 });
        }
        cols.push(list);
      }
    }

    function drawBase() {
      bctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      bctx.clearRect(0, 0, width, height);
      const buckets = new Map();
      for (const d of dots) { const key = Math.round(d.a * 40) / 40; if (!buckets.has(key)) buckets.set(key, []); buckets.get(key).push(d); }
      for (const [a, list] of buckets) {
        bctx.fillStyle = `rgba(255,255,255,${a})`; bctx.beginPath();
        for (const d of list) bctx.rect(d.x - dot / 2, d.y - dot / 2, dot, dot);
        bctx.fill();
      }
    }

    function arc(a, b) {
      const [x1, y1] = project(a.lon, a.lat), [x2, y2] = project(b.lon, b.lat);
      const dx = x2 - x1, dy = y2 - y1, dist = Math.hypot(dx, dy) || 1;
      let nx = -dy / dist, ny = dx / dist;
      if (ny > 0) { nx = -nx; ny = -ny; }
      const lift = Math.min(dist * 0.28, 130);
      const cx = (x1 + x2) / 2 + nx * lift, cy = (y1 + y2) / 2 + ny * lift;
      const n = Math.max(10, Math.round(dist / 6));
      return Array.from({ length: n + 1 }, (_, i) => { const t = i / n, u = 1 - t; return [u * u * x1 + 2 * u * t * cx + t * t * x2, u * u * y1 + 2 * u * t * cy + t * t * y2]; });
    }
    const along = (pts, t) => {
      const p = Math.max(0, Math.min(pts.length - 1, t * (pts.length - 1))), i = Math.floor(p), f = p - i, a = pts[i], b = pts[Math.min(pts.length - 1, i + 1)];
      return [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f];
    };
    const sq = (x, y, s) => ctx.fillRect(x - s / 2, y - s / 2, s, s);

    function nearestDot(x, y, max) {
      let best = null, bd = max;
      const c0 = Math.max(0, Math.floor((x - max) / gap)), c1 = Math.min(cols.length - 1, Math.ceil((x + max) / gap));
      for (let c = c0; c <= c1; c++) for (const i of cols[c]) { const d = dots[i], dd = Math.hypot(d.x - x, d.y - y); if (dd < bd) { best = d; bd = dd; } }
      return best;
    }
    function addBlip(x, y, now, you = false) {
      blips.push({ x, y, born: now, life: you ? 16000 : 4200 + Math.random() * 3000, you, phase: Math.random() });
      if (blips.length > 26) blips.splice(0, blips.length - 26);
    }
    function label(x, y, name, note, side, dy, alpha) {
      ctx.font = '500 10.5px "Geist Mono", ui-monospace, monospace';
      ctx.textBaseline = 'middle';
      const text = name.toUpperCase(), extra = note ? ` · ${String(note).toUpperCase()}` : '';
      const lw = ctx.measureText(text).width, bw = lw + ctx.measureText(extra).width;
      const spots = [[side, dy], [-side, dy], [side, -dy], [-side, -dy]].map(([sd, d]) => [sd > 0 ? x + 10 : x - 10 - bw, y + d]);
      const [lx, ly] = spots.find(([sx, sy]) => sx > 4 && sx + bw < width - 4 && !(avoid && sx - 4 < avoid.x1 && sx + bw + 4 > avoid.x0 && sy - 8 < avoid.y1 && sy + 8 > avoid.y0)) ?? spots[0];
      ctx.fillStyle = `rgba(0,0,0,${0.72 * alpha})`; ctx.fillRect(lx - 4, ly - 8, bw + 8, 16);
      ctx.fillStyle = `rgba(255,255,255,${0.92 * alpha})`; ctx.fillText(text, lx, ly);
      ctx.fillStyle = `rgba(${PULSE},${alpha})`; ctx.fillText(extra, lx + lw, ly);
    }

    function draw(now) {
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      ctx.clearRect(0, 0, width, height);
      if (!dots.length) return;
      const t = now - started, still = !moving;

      // A heartbeat that ripples out from home across the land.
      if (!still) {
        const [hx, hy] = home(), beat = (t % 1700) / 1700, r = beat * Math.max(width, height) * 0.55;
        const c0 = Math.max(0, Math.floor((hx - r - 40) / gap)), c1 = Math.min(cols.length - 1, Math.ceil((hx + r + 40) / gap));
        for (let c = c0; c <= c1; c++) for (const i of cols[c]) {
          const d = dots[i], s = 1 - Math.abs(Math.hypot(d.x - hx, d.y - hy) - r) / 26;
          if (s <= 0) continue;
          ctx.fillStyle = `rgba(255,255,255,${(s * 0.3 * (1 - beat)).toFixed(3)})`;
          sq(d.x, d.y, dot);
        }
      }

      // Gaze reticle: the pointer lights the land beneath it.
      if (pointer) {
        gaze = gaze ? { x: gaze.x + (pointer.x - gaze.x) * (still ? 1 : 0.25), y: gaze.y + (pointer.y - gaze.y) * (still ? 1 : 0.25) } : { ...pointer };
        const R = 80, c0 = Math.max(0, Math.floor((gaze.x - R) / gap)), c1 = Math.min(cols.length - 1, Math.ceil((gaze.x + R) / gap));
        for (let c = c0; c <= c1; c++) for (const i of cols[c]) {
          const d = dots[i], dd = Math.hypot(d.x - gaze.x, d.y - gaze.y);
          if (dd >= R) continue;
          ctx.fillStyle = `rgba(${PULSE},${(Math.pow(1 - dd / R, 1.4) * 0.95).toFixed(3)})`;
          sq(d.x, d.y, dot + 0.8);
        }
        ctx.strokeStyle = `rgba(${PULSE},.9)`; ctx.lineWidth = 1.2;
        ctx.beginPath(); ctx.arc(gaze.x, gaze.y, 12, 0, Math.PI * 2);
        ctx.moveTo(gaze.x - 20, gaze.y); ctx.lineTo(gaze.x - 7, gaze.y); ctx.moveTo(gaze.x + 7, gaze.y); ctx.lineTo(gaze.x + 20, gaze.y);
        ctx.moveTo(gaze.x, gaze.y - 20); ctx.lineTo(gaze.x, gaze.y - 7); ctx.moveTo(gaze.x, gaze.y + 7); ctx.lineTo(gaze.x, gaze.y + 20); ctx.stroke();
      }

      // Trips: every visited place is a hollow square; a replay flies them in order.
      ctx.lineWidth = 1;
      const seen = new Set();
      for (const trip of trips) {
        if (seen.has(trip.name)) continue; seen.add(trip.name);
        ctx.strokeStyle = 'rgba(255,255,255,.3)';
        ctx.strokeRect(trip.xy[0] - 2, trip.xy[1] - 2, 4, 4);
      }
      // Several trips fly at once, each leaving from where home was at the time.
      const replayAt = t - 4200, SLOT = 1300, SPAN = 4;
      if (!still && trips.length && replayAt > 0) {
        const head = Math.floor(replayAt / SLOT);
        for (let m = 0; m < SPAN; m++) {
          const idx = head - m;
          if (idx < 0) continue;
          const trip = trips[idx % trips.length], ph = (replayAt - idx * SLOT) / (SLOT * SPAN);
          const env = Math.min(1, ph / 0.06, (1 - ph) / 0.3);
          const drawn = Math.min(1, ph / 0.5), last = Math.floor((trip.points.length - 1) * drawn);
          ctx.fillStyle = `rgba(255,255,255,${(0.42 * env).toFixed(3)})`;
          for (let j = 0; j <= last; j += 2) sq(trip.points[j][0], trip.points[j][1], 1.3);
          if (drawn < 1) { const [px, py] = along(trip.points, drawn); ctx.fillStyle = `rgba(255,255,255,${env.toFixed(3)})`; sq(px, py, 3.2); }
          else {
            const g = Math.min(1, (ph - 0.5) / 0.3);
            ctx.strokeStyle = `rgba(255,255,255,${(0.6 * (1 - g)).toFixed(3)})`;
            ctx.beginPath(); ctx.arc(trip.xy[0], trip.xy[1], 4 + g * 12, 0, Math.PI * 2); ctx.stroke();
            ctx.fillStyle = `rgba(255,255,255,${(0.9 * env).toFixed(3)})`; sq(trip.xy[0], trip.xy[1], 4.5);
          }
        }
      }
      // The gaze reveals what is under it.
      if (gaze) for (const trip of trips) {
        if (Math.hypot(trip.xy[0] - gaze.x, trip.xy[1] - gaze.y) > 28) continue;
        ctx.fillStyle = '#fff'; sq(trip.xy[0], trip.xy[1], 5);
        label(trip.xy[0], trip.xy[1], trip.name, trip.note, trip.side || 1, trip.dy || -14, 1);
        break;
      }

      // You, if you clicked the map.
      if (!still) blips = blips.filter(b => now - b.born < b.life);
      const [hx, hy] = home();
      for (const b of blips) {
        const age = still ? 1000 : now - b.born, env = still ? 1 : Math.min(1, age / 400, (b.life - age) / 800);
        const reveal = Math.min(1, age / 700), ex = b.x + (hx - b.x) * reveal, ey = b.y + (hy - b.y) * reveal;
        const steps = Math.max(2, Math.round(Math.hypot(ex - b.x, ey - b.y) / 7));
        ctx.fillStyle = `rgba(${PULSE},${(0.5 * env).toFixed(3)})`;
        for (let s = 0; s <= steps; s++) sq(b.x + (ex - b.x) * s / steps, b.y + (ey - b.y) * s / steps, 1.2);
        if (reveal === 1 && !still) { const p = ((t / 1500) + b.phase) % 1; ctx.fillStyle = `rgba(${PULSE},${(0.95 * env).toFixed(3)})`; sq(b.x + (hx - b.x) * p, b.y + (hy - b.y) * p, 3); }
        ctx.fillStyle = `rgba(${PULSE},${env})`; sq(b.x, b.y, 6);
        ctx.font = '500 11px "Geist Mono", ui-monospace, monospace'; ctx.fillText('YOU', b.x + 9, b.y - 7);
      }

      // The route: legs draw in order, then carry packets.
      routes.forEach((r, i) => {
        const prog = still ? 1 : Math.max(0, Math.min(1, (t - 500 - i * 900) / 1100));
        if (prog <= 0) return;
        ctx.fillStyle = `rgba(${PULSE},${r.remote ? 0.45 : 0.85})`;
        const last = Math.floor((r.points.length - 1) * prog);
        for (let j = 0; j <= last; j += r.remote ? 2 : 1) sq(r.points[j][0], r.points[j][1], 1.6);
        if (!still && prog === 1) {
          const c = ((t + i * 700) % 3400) / 3400, p = r.remote && Math.floor((t + i * 700) / 3400) % 2 ? 1 - c : c;
          const [px, py] = along(r.points, p);
          ctx.fillStyle = `rgb(${PULSE})`; sq(px, py, 3.6);
        }
      });

      // Places lived, with labels kept clear of the headline copy.
      Object.values(PLACES).forEach((pl, i) => {
        const appear = still ? 1 : Math.max(0, Math.min(1, (t - 300 - i * 700) / 500));
        if (appear <= 0) return;
        const [x, y] = project(pl.lon, pl.lat);
        if (pl.home) {
          const beat = still ? 0.4 : (t % 1700) / 1700;
          ctx.strokeStyle = `rgba(${PULSE},${((1 - beat) * 0.8 * appear).toFixed(3)})`; ctx.lineWidth = 1.2;
          ctx.beginPath(); ctx.arc(x, y, 5 + beat * 18, 0, Math.PI * 2); ctx.stroke();
        }
        ctx.fillStyle = `rgba(${PULSE},${appear})`; sq(x, y, 6);
        ctx.fillStyle = '#000'; sq(x, y, 2);
        label(x, y, pl.name, pl.note, pl.side, pl.dy, appear);
      });
    }

    function loop(now) { frame = 0; draw(now); if (moving && visible && !document.hidden) frame = requestAnimationFrame(loop); }
    function start() { if (!frame && moving && visible && !document.hidden) frame = requestAnimationFrame(loop); }
    function stop() { if (frame) cancelAnimationFrame(frame); frame = 0; }

    const local = e => { const b = fx.getBoundingClientRect(); return { x: e.clientX - b.left, y: e.clientY - b.top }; };
    fx.addEventListener('pointermove', e => { if (e.pointerType === 'mouse') { pointer = local(e); if (!moving) draw(performance.now()); } });
    // On touch, a tap points the reticle there so trip names show without hover.
    fx.addEventListener('pointerdown', e => { if (e.pointerType !== 'mouse') { pointer = local(e); gaze = null; draw(performance.now()); start(); } });
    fx.addEventListener('pointerleave', () => { pointer = null; gaze = null; if (!moving) draw(performance.now()); });
    motionListeners.push(on => { if (on) { started = performance.now() - 6000; start(); } else { stop(); draw(performance.now()); } });
    document.addEventListener('visibilitychange', () => { if (document.hidden) stop(); else start(); });
    observe([hero], entry => { visible = entry.isIntersecting; if (visible) start(); else stop(); });
    let timer = 0;
    new ResizeObserver(() => { clearTimeout(timer); timer = setTimeout(() => { if (mask) layout(); }, 140); }).observe(hero);
    document.fonts?.ready.then(() => { if (mask) draw(performance.now()); });

    const img = new Image();
    img.decoding = 'async';
    img.onload = () => {
      const s = document.createElement('canvas');
      s.width = mw = img.naturalWidth; s.height = mh = img.naturalHeight;
      const sc = s.getContext('2d', { willReadFrequently: true });
      sc.drawImage(img, 0, 0);
      const px = sc.getImageData(0, 0, mw, mh).data;
      mask = new Uint8Array(mw * mh);
      for (let i = 0; i < mask.length; i++) mask[i] = px[i * 4] > 127 ? 1 : 0;
      started = performance.now();
      layout();
    };
    img.src = 'assets/world.png';
  }
  /* Footer: dot-matrix lettering. A light sweep runs across it; the pointer lights it in the pulse colour. */
  const lettering = document.getElementById('dot-text');
  if (lettering) dotText(lettering);

  function dotText(canvas) {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const lines = (canvas.dataset.lines || '').split('|');
    const noise = (a, b) => { let h = Math.imul(a, 374761393) + Math.imul(b, 668265263); h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; };
    let width = 0, height = 0, ratio = 1, cell = 6, points = [], pointer = null, frame = 0, visible = false;
    function layout() {
      const box = canvas.getBoundingClientRect();
      width = box.width; height = box.height;
      if (!width || !height) return;
      ratio = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * ratio); canvas.height = Math.round(height * ratio);
      cell = Math.max(4, Math.round(height / 30));
      const cols = Math.floor(width / cell), rows = Math.floor(height / cell);
      const scratch = document.createElement('canvas');
      scratch.width = cols; scratch.height = rows;
      const sc = scratch.getContext('2d', { willReadFrequently: true });
      const lineH = Math.floor(rows / lines.length);
      let size = Math.floor(lineH * 0.86);
      sc.font = `500 ${size}px "Geist Mono", ui-monospace, monospace`;
      const widest = Math.max(...lines.map(line => sc.measureText(line).width));
      if (widest > cols - 1) size = Math.floor(size * (cols - 1) / widest);
      sc.font = `500 ${size}px "Geist Mono", ui-monospace, monospace`;
      sc.fillStyle = '#fff';
      lines.forEach((line, i) => sc.fillText(line, 0, (i + 1) * lineH - Math.round(lineH * 0.18)));
      const px = sc.getImageData(0, 0, cols, rows).data;
      points = [];
      for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) {
        if (px[(y * cols + x) * 4 + 3] > 100) points.push({ x: x * cell + cell / 2, y: y * cell + cell / 2, n: noise(x, y) });
      }
      draw(performance.now());
    }
    function draw(now) {
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      ctx.clearRect(0, 0, width, height);
      const size = Math.max(2, cell * 0.56);
      const wave = moving ? ((now % 7000) / 7000) * (width + height) * 1.3 - height : -1e6;
      for (const p of points) {
        let glow = 0;
        if (pointer) { const d = Math.hypot(p.x - pointer.x, p.y - pointer.y); if (d < 96) glow = Math.pow(1 - d / 96, 1.3); }
        if (glow > 0.03) ctx.fillStyle = `rgba(255,122,69,${(0.3 + glow * 0.7).toFixed(3)})`;
        else {
          const off = Math.abs(p.x + p.y * 0.55 - wave);
          ctx.fillStyle = `rgba(255,255,255,${(0.18 + p.n * 0.08 + (off < 70 ? (1 - off / 70) * 0.3 : 0)).toFixed(3)})`;
        }
        ctx.fillRect(p.x - size / 2, p.y - size / 2, size, size);
      }
    }
    function loop(now) { frame = 0; draw(now); if (moving && visible && !document.hidden) frame = requestAnimationFrame(loop); }
    const start = () => { if (!frame && moving && visible && !document.hidden) frame = requestAnimationFrame(loop); };
    const stop = () => { if (frame) cancelAnimationFrame(frame); frame = 0; };
    canvas.addEventListener('pointermove', e => { const b = canvas.getBoundingClientRect(); pointer = { x: e.clientX - b.left, y: e.clientY - b.top }; if (!moving) draw(performance.now()); });
    canvas.addEventListener('pointerleave', () => { pointer = null; if (!moving) draw(performance.now()); });
    observe([canvas], entry => { visible = entry.isIntersecting; if (visible) start(); else stop(); }, { rootMargin: '40px' });
    motionListeners.push(on => { if (on) start(); else { stop(); draw(performance.now()); } });
    let timer = 0;
    new ResizeObserver(() => { clearTimeout(timer); timer = setTimeout(layout, 120); }).observe(canvas);
    (document.fonts ? document.fonts.ready : Promise.resolve()).then(layout);
  }
})();
