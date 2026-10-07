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

  /* Hero: a dot field read like an eye tracker. The gaze follows your pointer
     (or wanders on its own), lights a heatmap, and a heartbeat ripples out from it. */
  const canvas = document.querySelector('.hero-fx');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    const bpmLabel = document.querySelector('[data-bpm]');
    const PULSE = [255, 122, 69];
    let width = 0, height = 0, dpr = 1, gap = 14, dots = [];
    let gaze = { x: 0, y: 0 }, target = { x: 0, y: 0 }, pointerAt = 0, start = performance.now();
    let heat = null, cols = 0, rows = 0, visible = true, raf = 0, bpm = 66;
    const fixations = [];

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width; height = rect.height;
      canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      gap = width < 700 ? 12 : 14;
      cols = Math.ceil(width / gap) + 1; rows = Math.ceil(height / gap) + 1;
      heat = new Float32Array(cols * rows);
      dots = [];
      for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) dots.push(c * gap + (r % 2 ? gap / 2 : 0), r * gap);
      const home = restPoint();
      gaze.x = target.x = home.x; gaze.y = target.y = home.y;
      if (!moving) draw(performance.now());
    };
    const restPoint = () => width < 980 ? { x: width * 0.62, y: height * 0.8 } : { x: width * 0.74, y: height * 0.46 };

    const wander = t => {
      const home = restPoint(), s = t / 1000;
      const rx = width < 980 ? width * 0.28 : width * 0.16, ry = width < 980 ? height * 0.1 : height * 0.24;
      return { x: home.x + Math.sin(s * 0.53) * rx + Math.sin(s * 1.7) * rx * 0.18, y: home.y + Math.sin(s * 0.37 + 1) * ry + Math.cos(s * 2.3) * ry * 0.12 };
    };

    const draw = now => {
      const t = now - start;
      if (moving && now - pointerAt > 2600) {
        // Saccade-like motion: jump to a new wander point every ~420 ms.
        if (!draw.next || now > draw.next) { const w = wander(t); target.x = w.x; target.y = w.y; draw.next = now + 380 + Math.random() * 260; }
      }
      const k = moving ? 0.22 : 1;
      gaze.x += (target.x - gaze.x) * k; gaze.y += (target.y - gaze.y) * k;

      // Accumulate gaze heat, decay slowly.
      const gc = Math.round(gaze.x / gap), gr = Math.round(gaze.y / gap), R = 6;
      for (let i = 0; i < heat.length; i++) heat[i] *= moving ? 0.985 : 0;
      for (let r = gr - R; r <= gr + R; r++) for (let c = gc - R; c <= gc + R; c++) {
        if (r < 0 || c < 0 || r >= rows || c >= cols) continue;
        const d2 = (r - gr) ** 2 + (c - gc) ** 2;
        heat[r * cols + c] = Math.min(1, heat[r * cols + c] + Math.exp(-d2 / 7) * (moving ? 0.06 : 1));
      }
      if (moving && (!fixations.length || Math.hypot(fixations[fixations.length - 1].x - gaze.x, fixations[fixations.length - 1].y - gaze.y) > 70)) {
        fixations.push({ x: gaze.x, y: gaze.y }); if (fixations.length > 7) fixations.shift();
      }

      const period = 60000 / bpm, phase = (t % period) / period;
      const ripple = moving ? phase * Math.max(width, height) * 0.5 : -1;
      const beatGlow = moving ? Math.max(0, 1 - phase * 5) : 0.6;

      ctx.clearRect(0, 0, width, height);
      for (let i = 0, n = 0; i < dots.length; i += 2, n++) {
        const x = dots[i], y = dots[i + 1];
        const h = heat[n] || 0;
        const dist = Math.hypot(x - gaze.x, y - gaze.y);
        const ring = ripple > 0 ? Math.max(0, 1 - Math.abs(dist - ripple) / 22) * (1 - phase) : 0;
        const base = 0.1 + 0.05 * Math.sin(x * 0.013 + y * 0.021);
        if (h > 0.04 || ring > 0.02) {
          const a = Math.min(1, base + h * 0.85 + ring * 0.55);
          ctx.fillStyle = `rgba(${PULSE[0]},${PULSE[1] + (1 - h) * 60 | 0},${PULSE[2] + (1 - h) * 80 | 0},${a})`;
          const s = 1.3 + h * 1.5 + ring;
          ctx.fillRect(x - s / 2, y - s / 2, s, s);
        } else {
          ctx.fillStyle = `rgba(255,255,255,${base})`;
          ctx.fillRect(x - 0.6, y - 0.6, 1.2, 1.2);
        }
      }
      // Scanpath between recent fixations.
      if (fixations.length > 1) {
        ctx.strokeStyle = 'rgba(255,255,255,.22)'; ctx.lineWidth = 1; ctx.setLineDash([3, 4]);
        ctx.beginPath(); fixations.forEach((f, i) => i ? ctx.lineTo(f.x, f.y) : ctx.moveTo(f.x, f.y)); ctx.stroke(); ctx.setLineDash([]);
        fixations.forEach((f, i) => { ctx.strokeStyle = `rgba(255,255,255,${0.1 + i * 0.05})`; ctx.strokeRect(f.x - 3, f.y - 3, 6, 6); });
      }
      // Gaze reticle.
      ctx.strokeStyle = `rgba(${PULSE.join(',')},${0.55 + beatGlow * 0.45})`; ctx.lineWidth = 1.25;
      ctx.beginPath(); ctx.arc(gaze.x, gaze.y, 13 + beatGlow * 4, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(gaze.x - 22, gaze.y); ctx.lineTo(gaze.x - 8, gaze.y); ctx.moveTo(gaze.x + 8, gaze.y); ctx.lineTo(gaze.x + 22, gaze.y);
      ctx.moveTo(gaze.x, gaze.y - 22); ctx.lineTo(gaze.x, gaze.y - 8); ctx.moveTo(gaze.x, gaze.y + 8); ctx.lineTo(gaze.x, gaze.y + 22); ctx.stroke();
      ctx.fillStyle = `rgb(${PULSE.join(',')})`; ctx.fillRect(gaze.x - 2, gaze.y - 2, 4, 4);
      ctx.font = '10px "Geist Mono", ui-monospace, monospace'; ctx.fillStyle = 'rgba(255,255,255,.55)';
      ctx.fillText(`GAZE ${Math.round(gaze.x)},${Math.round(gaze.y)}`, gaze.x + 18, gaze.y - 16);
    };

    const loop = now => { draw(now); raf = moving && visible ? requestAnimationFrame(loop) : 0; };
    const kick = () => { if (!raf && moving && visible) raf = requestAnimationFrame(loop); if (!moving) draw(performance.now()); };

    canvas.addEventListener('pointermove', event => {
      const rect = canvas.getBoundingClientRect();
      target.x = event.clientX - rect.left; target.y = event.clientY - rect.top; pointerAt = performance.now();
      bpm = Math.min(96, bpm + 0.6);
      if (bpmLabel) bpmLabel.textContent = Math.round(bpm);
      if (!moving) { gaze.x = target.x; gaze.y = target.y; draw(performance.now()); }
    });
    setInterval(() => { if (bpm > 66) { bpm = Math.max(66, bpm - 1); if (bpmLabel) bpmLabel.textContent = Math.round(bpm); } }, 400);
    observe([canvas], entry => { visible = entry.isIntersecting; kick(); });
    window.addEventListener('resize', () => { resize(); kick(); });
    motionListeners.push(() => kick());
    resize(); kick();
  }
})();
