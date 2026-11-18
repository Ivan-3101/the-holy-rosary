/*! The Holy Rosary — shared script (settings, calendar, rendering, rosary diagram, pages) */
(function () {
  'use strict';

  const R = window.ROSARY;
  const doc = document;
  const root = doc.documentElement;
  const $ = (sel, ctx) => (ctx || doc).querySelector(sel);

  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  /* ---------------------------------------------------------------
     Storage (never throws — private windows may block it)
     --------------------------------------------------------------- */
  const store = {
    get(key, fallback) {
      try { const v = localStorage.getItem(key); return v == null ? fallback : JSON.parse(v); } catch (e) { return fallback; }
    },
    set(key, value) { try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) { /* ignore */ } },
    del(key) { try { localStorage.removeItem(key); } catch (e) { /* ignore */ } }
  };

  /* ---------------------------------------------------------------
     Icons
     --------------------------------------------------------------- */
  const PATHS = {
    cross: '<path d="M10.6 2h2.8v5.6H19v2.8h-5.6V22h-2.8V10.4H5V7.6h5.6z" fill="currentColor" stroke="none"/>',
    settings: '<path d="M4 7h9M17 7h3M4 17h3M11 17h9"/><circle cx="15" cy="7" r="2.2"/><circle cx="9" cy="17" r="2.2"/>',
    close: '<path d="M6 6l12 12M18 6L6 18"/>',
    arrowRight: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    arrowLeft: '<path d="M19 12H5M11 6l-6 6 6 6"/>',
    check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
    star: '<path d="M12 3.2l2.5 5.4 5.9.6-4.4 4 1.3 5.8L12 16.1 6.7 19l1.3-5.8-4.4-4 5.9-.6z"/>',
    sun: '<circle cx="12" cy="12" r="3.6"/><path d="M12 2.8v2.6M12 18.6v2.6M2.8 12h2.6M18.6 12h2.6M5.5 5.5l1.8 1.8M16.7 16.7l1.8 1.8M5.5 18.5l1.8-1.8M16.7 7.3l1.8-1.8"/>',
    crossLine: '<path d="M12 2.8v18.4M6.6 8.2h10.8"/>',
    crown: '<path d="M4.6 17L3.5 8.3l4.6 3.6L12 5.3l3.9 6.6 4.6-3.6-1.1 8.7z"/><path d="M5.2 20.3h13.6"/>',
    play: '<path d="M8 5.5v13l10.5-6.5z" fill="currentColor"/>',
    refresh: '<path d="M20 11a8 8 0 1 0-2.3 5.7M20 4.5V11h-6.5"/>'
  };
  const SET_ICON = { joyful: 'star', luminous: 'sun', sorrowful: 'crossLine', glorious: 'crown' };

  function icon(name) {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' + (PATHS[name] || '') + '</svg>';
  }

  /* ---------------------------------------------------------------
     Settings: theme, text size, prayer language
     --------------------------------------------------------------- */
  const SIZES = [0.9, 1, 1.1, 1.2, 1.35, 1.5];
  const settings = Object.assign({ theme: 'auto', scale: 1, lang: 'en' }, store.get('rosary.settings', {}));
  if (!['light', 'dark', 'auto'].includes(settings.theme)) settings.theme = 'auto';
  if (!['en', 'la', 'both'].includes(settings.lang)) settings.lang = 'en';
  if (!SIZES.includes(settings.scale)) settings.scale = 1;

  const darkQuery = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;

  function applySettings() {
    if (settings.theme === 'auto') root.removeAttribute('data-theme');
    else root.setAttribute('data-theme', settings.theme);
    root.style.setProperty('--scale', String(settings.scale));
    const dark = settings.theme === 'dark' || (settings.theme === 'auto' && darkQuery && darkQuery.matches);
    const meta = doc.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', dark ? '#0c1220' : '#f7f2e7');
  }

  function updateSettings(patch) {
    Object.assign(settings, patch);
    store.set('rosary.settings', settings);
    applySettings();
    syncSettingsForm();
    doc.dispatchEvent(new CustomEvent('rosary:settings', { detail: Object.assign({}, settings) }));
  }

  if (darkQuery) {
    const onChange = () => applySettings();
    if (darkQuery.addEventListener) darkQuery.addEventListener('change', onChange);
    else if (darkQuery.addListener) darkQuery.addListener(onChange);
  }

  let dialog = null;

  function seg(name, items) {
    return items.map(([value, label]) =>
      '<label><input type="radio" name="' + name + '" value="' + value + '"><span>' + label + '</span></label>').join('');
  }

  function buildSettingsDialog() {
    dialog = doc.createElement('dialog');
    dialog.className = 'sheet';
    dialog.id = 'settings-dialog';
    dialog.setAttribute('aria-labelledby', 'settings-title');
    dialog.innerHTML =
      '<form method="dialog" class="sheet-inner">' +
        '<div class="sheet-head"><h2 id="settings-title">Settings</h2>' +
          '<button class="icon-btn" value="close" aria-label="Close settings">' + icon('close') + '</button></div>' +
        '<fieldset><legend>Appearance</legend><div class="seg">' +
          seg('theme', [['light', 'Light'], ['dark', 'Dark'], ['auto', 'Automatic']]) + '</div></fieldset>' +
        '<fieldset><legend>Text size</legend><div class="size-ctrl">' +
          '<button type="button" class="btn" data-size="-1" aria-label="Smaller text">A−</button>' +
          '<output id="size-out" aria-live="polite">100%</output>' +
          '<button type="button" class="btn" data-size="1" aria-label="Larger text">A+</button></div>' +
          '<p class="size-preview">Hail Mary, full of grace…</p></fieldset>' +
        '<fieldset><legend>Prayer language</legend><div class="seg">' +
          seg('lang', [['en', 'English'], ['la', 'Latin'], ['both', 'Both']]) + '</div>' +
          '<p class="hint">Show the prayers in English, in Latin, or side by side.</p></fieldset>' +
      '</form>';
    doc.body.appendChild(dialog);

    dialog.addEventListener('change', (e) => {
      const t = e.target;
      if (t.name === 'theme') updateSettings({ theme: t.value });
      if (t.name === 'lang') updateSettings({ lang: t.value });
    });
    dialog.addEventListener('click', (e) => {
      if (e.target === dialog) { dialog.close(); return; }
      const b = e.target.closest('[data-size]');
      if (!b) return;
      const i = SIZES.indexOf(settings.scale);
      const next = SIZES[Math.min(SIZES.length - 1, Math.max(0, i + Number(b.dataset.size)))];
      updateSettings({ scale: next });
    });
    syncSettingsForm();
  }

  function syncSettingsForm() {
    if (!dialog) return;
    dialog.querySelectorAll('input[name="theme"]').forEach((i) => { i.checked = i.value === settings.theme; });
    dialog.querySelectorAll('input[name="lang"]').forEach((i) => { i.checked = i.value === settings.lang; });
    const out = dialog.querySelector('#size-out');
    if (out) out.textContent = Math.round(settings.scale * 100) + '%';
    const idx = SIZES.indexOf(settings.scale);
    dialog.querySelector('[data-size="-1"]').disabled = idx <= 0;
    dialog.querySelector('[data-size="1"]').disabled = idx >= SIZES.length - 1;
  }

  function openSettings() {
    if (!dialog) buildSettingsDialog();
    syncSettingsForm();
    if (typeof dialog.showModal === 'function') dialog.showModal();
    else dialog.setAttribute('open', '');
  }

  /* ---------------------------------------------------------------
     Calendar: which mysteries are prayed today
     Mon & Sat Joyful · Tue & Fri Sorrowful · Wed & Sun Glorious · Thu Luminous
     (Rosarium Virginis Mariae, 38). By custom, the Joyful Mysteries are prayed
     on Sundays of Advent and Christmastide, the Sorrowful on Sundays of Lent.
     --------------------------------------------------------------- */
  const WEEK = ['glorious', 'joyful', 'sorrowful', 'glorious', 'luminous', 'sorrowful', 'joyful'];
  const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  function today() {
    // ?date=YYYY-MM-DD lets you preview another day
    const m = /[?&]date=(\d{4})-(\d{2})-(\d{2})/.exec(location.search);
    if (m) {
      const d = new Date(+m[1], +m[2] - 1, +m[3]);
      if (!isNaN(d)) return d;
    }
    const n = new Date();
    return new Date(n.getFullYear(), n.getMonth(), n.getDate());
  }

  function addDays(d, n) { const x = new Date(d.getFullYear(), d.getMonth(), d.getDate()); x.setDate(x.getDate() + n); return x; }

  function easterSunday(y) { // Anonymous Gregorian algorithm
    const a = y % 19, b = Math.floor(y / 100), c = y % 100, d = Math.floor(b / 4), e = b % 4;
    const f = Math.floor((b + 8) / 25), g = Math.floor((b - f + 1) / 3);
    const h = (19 * a + b - d - g + 15) % 30, i = Math.floor(c / 4), k = c % 4;
    const l = (32 + 2 * e + 2 * i - h - k) % 7, m = Math.floor((a + 11 * h + 22 * l) / 451);
    const month = Math.floor((h + l - 7 * m + 114) / 31), day = ((h + l - 7 * m + 114) % 31) + 1;
    return new Date(y, month - 1, day);
  }

  function seasonOf(date) {
    const y = date.getFullYear();
    const easter = easterSunday(y);
    if (date >= addDays(easter, -46) && date < easter) return 'lent';
    const christmas = new Date(y, 11, 25);
    const dow = christmas.getDay();
    const advent = addDays(christmas, -(dow === 0 ? 28 : 21 + dow));
    if (date >= advent && date < christmas) return 'advent';
    if (date >= christmas) return 'christmas';
    if (date.getMonth() === 0 && date.getDate() <= 13) return 'christmas'; // until the Baptism of the Lord
    return 'ordinary';
  }

  function mysteriesFor(date) {
    const dow = date.getDay();
    if (dow === 0) {
      const s = seasonOf(date);
      if (s === 'advent') return { key: 'joyful', note: 'On the Sundays of Advent, the Joyful Mysteries are customarily prayed.' };
      if (s === 'christmas') return { key: 'joyful', note: 'During Christmastide, the Joyful Mysteries are customarily prayed on Sundays.' };
      if (s === 'lent') return { key: 'sorrowful', note: 'On the Sundays of Lent, the Sorrowful Mysteries are customarily prayed.' };
    }
    return { key: WEEK[dow], note: '' };
  }

  function fmtDate(d) {
    const loc = (navigator.language || 'en-US').toLowerCase().startsWith('en') ? navigator.language : 'en-US';
    try { return new Intl.DateTimeFormat(loc, { weekday: 'long', month: 'long', day: 'numeric' }).format(d); }
    catch (e) { return d.toDateString(); }
  }

  /* ---------------------------------------------------------------
     Prayer rendering
     --------------------------------------------------------------- */
  function paraHTML(p) {
    if (typeof p === 'string') return '<p>' + p + '</p>';
    if (p.resp) return '<p class="resp">' + p.resp + '</p>';
    if (p.v) return '<p class="vr"><span class="vr-mark" aria-label="Versicle">V.</span>' + p.v + '</p>';
    if (p.r) return '<p class="vr"><span class="vr-mark" aria-label="Response">R.</span><span class="vr-r">' + p.r + '</span></p>';
    if (p.say) return '<p class="say">' + p.say + '</p>';
    if (p.note) return '<p class="rubric">' + p.note + '</p>';
    return '';
  }

  function litanyHTML(pr, L) {
    let h = '<div class="litany">';
    pr.litany[L].forEach((group) => {
      h += '<div class="lit-group">';
      group.forEach((row) => {
        h += '<p class="lit-row"><span class="lit-call">' + row[0] + '</span> <span class="lit-resp">' + row[1] + '</span></p>';
      });
      h += '</div>';
    });
    h += '</div>';
    return h + pr.after[L].map(paraHTML).join('');
  }

  function bodyHTML(pr, L) {
    if (pr.litany) return litanyHTML(pr, L);
    return (pr[L] || pr.en).map(paraHTML).join('');
  }

  function renderPrayer(key, lang) {
    const pr = R.prayers[key];
    if (!pr) return '';
    lang = lang || settings.lang;
    if (lang === 'both') {
      return '<div class="prayer-block"><div class="bilingual">' +
        '<div class="col en" lang="en"><p class="col-label">English</p>' + bodyHTML(pr, 'en') + '</div>' +
        '<div class="col la" lang="la"><p class="col-label">Latin</p>' + bodyHTML(pr, 'la') + '</div>' +
        '</div></div>';
    }
    const L = lang === 'la' ? 'la' : 'en';
    return '<div class="prayer-block"><div class="prayer-text" lang="' + L + '">' + bodyHTML(pr, L) + '</div></div>';
  }

  function prayerTitle(key, lang) {
    const t = R.prayers[key].title;
    return (lang || settings.lang) === 'la' ? t.la : t.en;
  }

  /* ---------------------------------------------------------------
     Guided Rosary: options and the sequence of steps
     --------------------------------------------------------------- */
  const OPTIONS = [
    { key: 'fatima', group: 'decade', title: 'O My Jesus (the Fatima Prayer)', desc: 'After the Glory Be of each decade', def: true },
    { key: 'litany', group: 'after', title: 'Litany of the Blessed Virgin Mary', desc: 'The Litany of Loreto', def: true },
    { key: 'subTuum', group: 'after', title: 'We Fly to Thy Protection', desc: 'Sub Tuum Praesidium', def: false },
    { key: 'michael', group: 'after', title: 'Prayer to Saint Michael the Archangel', desc: 'Saint Michael the Archangel, defend us in battle…', def: true },
    { key: 'memorare', group: 'after', title: 'The Memorare', desc: 'Remember, O most gracious Virgin Mary…', def: false },
    { key: 'pope', group: 'after', title: 'For the intentions of the Holy Father', desc: 'An Our Father, Hail Mary and Glory Be', def: false }
  ];

  function defaultOptions() {
    const o = {};
    OPTIONS.forEach((x) => { o[x.key] = x.def; });
    return o;
  }

  function buildSteps(o) {
    const ORD = R.ordinals;
    const OPEN = 'Opening Prayers', CLOSE = 'Concluding Prayers';
    const S = [];
    S.push({ sec: OPEN, bead: 'cross', title: 'The Sign of the Cross', body: ['sign'], hint: 'Holding the crucifix, make the Sign of the Cross.' });
    S.push({ sec: OPEN, bead: 'cross', title: 'The Apostles’ Creed', body: ['creed'], hint: 'Still holding the crucifix.' });
    S.push({ sec: OPEN, bead: 'O', title: 'Our Father', body: ['ourFather'], hint: 'On the first large bead.' });
    ['faith', 'hope', 'charity'].forEach((v, i) => {
      S.push({ sec: OPEN, bead: 'h' + i, title: 'Hail Mary', count: [i + 1, 3], intent: 'For an increase of ' + v, body: ['hailMary'] });
    });
    S.push({ sec: OPEN, bead: 'g0', title: 'Glory Be', body: ['gloryBe'] });
    for (let d = 0; d < 5; d++) {
      const sec = ORD[d] + ' Decade';
      S.push({ sec: sec, d: d, bead: 'P' + d, title: 'Our Father', announce: true, body: ['ourFather'],
        hint: d === 0 ? 'Announce the mystery, then pray the Our Father on the large bead.' : '' });
      for (let i = 0; i < 10; i++) {
        S.push({ sec: sec, d: d, bead: 'd' + d + 'h' + i, title: 'Hail Mary', count: [i + 1, 10], body: ['hailMary'] });
      }
      S.push({ sec: sec, d: d, bead: 'd' + d + 'g', title: o.fatima ? 'Glory Be & O My Jesus' : 'Glory Be',
        body: o.fatima ? ['gloryBe', 'fatima'] : ['gloryBe'] });
    }
    S.push({ sec: CLOSE, bead: 'center', title: 'Hail, Holy Queen', body: ['hailHolyQueen', 'rosaryPrayer'], hint: 'After the fifth decade, on the centerpiece.' });
    if (o.litany) S.push({ sec: CLOSE, bead: 'center', title: 'Litany of the Blessed Virgin Mary', body: ['litany'], hint: 'The leader prays each invocation; all respond.' });
    if (o.subTuum) S.push({ sec: CLOSE, bead: 'center', title: 'We Fly to Thy Protection', body: ['subTuum'] });
    if (o.michael) S.push({ sec: CLOSE, bead: 'center', title: 'Prayer to Saint Michael', body: ['michael'] });
    if (o.memorare) S.push({ sec: CLOSE, bead: 'center', title: 'The Memorare', body: ['memorare'] });
    if (o.pope) S.push({ sec: CLOSE, bead: 'center', title: 'For the Intentions of the Holy Father', body: ['pope', 'ourFather', 'hailMary', 'gloryBe'] });
    S.push({ sec: CLOSE, bead: 'cross', title: 'The Sign of the Cross', body: ['sign'], last: true });
    return S;
  }

  /* Saved session (a Rosary in progress) */
  const SESSION_KEY = 'rosary.session';
  function loadSession() {
    const s = store.get(SESSION_KEY, null);
    if (!s || !R.mysteries[s.set] || typeof s.step !== 'number') return null;
    if (Date.now() - (s.updated || 0) > 1000 * 60 * 60 * 24 * 3) return null; // older than 3 days
    s.opts = Object.assign(defaultOptions(), s.opts || {});
    const steps = buildSteps(s.opts);
    if (s.step < 0 || s.step >= steps.length) return null;
    s.steps = steps;
    return s;
  }
  function describeSession(s) {
    const st = s.steps[s.step];
    const set = R.mysteries[s.set];
    return {
      title: set.name + ' — ' + st.sec,
      sub: st.title + (st.count ? ' ' + st.count[0] + ' of ' + st.count[1] : '') + ' · Step ' + (s.step + 1) + ' of ' + s.steps.length
    };
  }

  /* ---------------------------------------------------------------
     The rosary diagram (inline SVG)
     --------------------------------------------------------------- */
  const SVGNS = 'http://www.w3.org/2000/svg';
  function svgEl(tag, attrs, parent) {
    const e = doc.createElementNS(SVGNS, tag);
    for (const k in attrs) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  }

  const LAYOUT = (function () {
    const cx = 110, cy = 100, rx = 88, ry = 93;
    const seq = [];
    for (let d = 0; d < 5; d++) {
      for (let i = 0; i < 10; i++) seq.push({ id: 'd' + d + 'h' + i, kind: 'small' });
      seq.push({ id: 'd' + d + 'g', kind: 'chain' });
      if (d < 4) seq.push({ id: 'P' + (d + 1), kind: 'large' });
    }
    const W = { small: 1, chain: 1.05, large: 1.7 };
    const total = seq.reduce((a, it) => a + W[it.kind], 0);
    const gap = 0.16;
    const start = Math.PI / 2 - gap, span = 2 * Math.PI - 2 * gap;
    let acc = 0;
    seq.forEach((it) => {
      const w = W[it.kind];
      const th = start - ((acc + w / 2) / total) * span;
      acc += w;
      it.x = cx + rx * Math.cos(th);
      it.y = cy + ry * Math.sin(th);
      it.loop = true;
    });
    const pend = [
      { id: 'P0', kind: 'large', y: 220 },
      { id: 'g0', kind: 'chain', y: 233 },
      { id: 'h2', kind: 'small', y: 243 },
      { id: 'h1', kind: 'small', y: 253.5 },
      { id: 'h0', kind: 'small', y: 264 },
      { id: 'O', kind: 'large', y: 279 }
    ].map((p) => Object.assign(p, { x: cx }));
    return { cx: cx, cy: cy, rx: rx, ry: ry, W: 220, H: 336, items: seq.concat(pend), medal: { x: cx, y: cy + ry + 4 }, crossTop: 292 };
  })();

  const RADIUS = { small: 3.7, large: 5.6, chain: 1.6 };

  function createRosary(opts) {
    opts = opts || {};
    const L = LAYOUT;
    const pad = opts.pad || 0;
    const svg = svgEl('svg', {
      viewBox: (-pad) + ' 0 ' + (L.W + 2 * pad) + ' ' + L.H,
      class: 'rosary-svg' + (opts.className ? ' ' + opts.className : ''),
      'aria-hidden': 'true', focusable: 'false'
    });
    svgEl('ellipse', { cx: L.cx, cy: L.cy, rx: L.rx, ry: L.ry, class: 'cord' }, svg);
    svgEl('line', { x1: L.cx, y1: L.medal.y + 8, x2: L.cx, y2: L.crossTop + 2, class: 'cord' }, svg);
    const halo = opts.decor ? null : svgEl('circle', { class: 'halo', cx: -50, cy: -50, r: 8 }, svg);
    const nodes = {};

    L.items.forEach((it) => {
      const r = RADIUS[it.kind];
      const el = svgEl('circle', { cx: it.x.toFixed(2), cy: it.y.toFixed(2), r: r, class: it.kind === 'chain' ? 'chain' : 'bead', 'data-id': it.id }, svg);
      if (it.kind !== 'chain') {
        svgEl('circle', { cx: (it.x - r * 0.34).toFixed(2), cy: (it.y - r * 0.36).toFixed(2), r: (r * 0.36).toFixed(2), class: 'shine' }, svg);
      }
      nodes[it.id] = { el: el, x: it.x, y: it.y, r: r, loop: !!it.loop };
    });

    const mg = svgEl('g', { class: 'medal', 'data-id': 'center', transform: 'translate(' + L.medal.x + ' ' + L.medal.y + ')' }, svg);
    svgEl('ellipse', { rx: 7.4, ry: 9.4, class: 'medal-body' }, mg);
    svgEl('ellipse', { rx: 5.2, ry: 7.1, class: 'medal-ring' }, mg);
    svgEl('path', { d: 'M0-3.8L1-1 3.8 0 1 1 0 3.8-1 1-3.8 0-1-1Z', class: 'medal-star' }, mg);
    nodes.center = { el: mg, x: L.medal.x, y: L.medal.y, r: 9.6 };

    const cg = svgEl('g', { class: 'crucifix', 'data-id': 'cross', transform: 'translate(' + L.cx + ' ' + L.crossTop + ')' }, svg);
    svgEl('rect', { x: -2.4, y: 0, width: 4.8, height: 40, rx: 1.2 }, cg);
    svgEl('rect', { x: -11.5, y: 9.2, width: 23, height: 4.8, rx: 1.2 }, cg);
    nodes.cross = { el: cg, x: L.cx, y: L.crossTop + 15, r: 14 };

    function set(curId, doneIds) {
      Object.keys(nodes).forEach((id) => {
        const n = nodes[id];
        n.el.classList.toggle('cur', id === curId);
        n.el.classList.toggle('done', id !== curId && !!doneIds && doneIds.has(id));
      });
      if (!halo) return;
      const n = nodes[curId];
      if (n) {
        halo.setAttribute('cx', n.x.toFixed(2));
        halo.setAttribute('cy', n.y.toFixed(2));
        halo.setAttribute('r', (Math.max(n.r, 3) + (opts.haloExtra || 5)).toFixed(2));
        halo.style.display = '';
      } else {
        halo.style.display = 'none';
      }
    }

    function marker(num, id, dx, dy) {
      const n = nodes[id];
      if (!n) return;
      if (dx == null) {
        const vx = n.x - L.cx, vy = n.y - L.cy, len = Math.hypot(vx, vy) || 1;
        dx = (vx / len) * 20; dy = (vy / len) * 20;
      }
      const mx = n.x + dx, my = n.y + dy;
      const g = svgEl('g', { class: 'marker' }, svg);
      const len = Math.hypot(dx, dy) || 1;
      const ux = dx / len, uy = dy / len;
      svgEl('line', { x1: (n.x + ux * (n.r + 1.4)).toFixed(2), y1: (n.y + uy * (n.r + 1.4)).toFixed(2), x2: (mx - ux * 6.5).toFixed(2), y2: (my - uy * 6.5).toFixed(2) }, g);
      svgEl('circle', { cx: mx.toFixed(2), cy: my.toFixed(2), r: 7 }, g);
      const t = svgEl('text', { x: mx.toFixed(2), y: (my + 0.4).toFixed(2) }, g);
      t.textContent = String(num);
    }

    if (opts.onPick) {
      svg.classList.add('interactive');
      svg.addEventListener('click', (e) => {
        const t = e.target.closest('[data-id]');
        if (t) opts.onPick(t.getAttribute('data-id'));
      });
    }
    return { svg: svg, set: set, marker: marker, nodes: nodes };
  }

  /* ---------------------------------------------------------------
     Pages
     --------------------------------------------------------------- */
  function scrollToHash() {
    if (!location.hash) return;
    let el = null;
    try { el = doc.querySelector(location.hash); } catch (e) { el = null; }
    if (el) requestAnimationFrame(() => el.scrollIntoView());
  }

  function setCard(key, isToday) {
    const s = R.mysteries[key];
    return '<a class="card set-card" href="pray.html?set=' + key + '">' +
      (isToday ? '<span class="badge">Today</span>' : '') +
      '<span class="set-icon">' + icon(SET_ICON[key]) + '</span>' +
      '<h3>' + s.short + '</h3>' +
      '<p class="days">' + s.days + '</p>' +
      '<ol>' + s.items.map((m) => '<li>' + m.title.replace(/^The /, '') + '</li>').join('') + '</ol>' +
      '<span class="go">Pray now ' + icon('arrowRight') + '</span>' +
      '</a>';
  }

  function initHome() {
    const d = today();
    const t = mysteriesFor(d);
    const set = R.mysteries[t.key];

    const art = $('#hero-art');
    if (art) art.appendChild(createRosary({ decor: true, className: 'decor' }).svg);

    const box = $('#today');
    if (box) {
      box.innerHTML =
        '<div>' +
          '<p class="eyebrow">Today · ' + esc(fmtDate(d)) + '</p>' +
          '<h2 class="today-title">' + set.name + '</h2>' +
          '<p class="today-days">Prayed on ' + set.days + '</p>' +
          (t.note ? '<p class="season-note">' + t.note + '</p>' : '') +
          '<ol class="today-list">' + set.items.map((m, i) =>
            '<li><span class="num">' + (i + 1) + '</span><span><strong>' + m.title + '</strong><small>Fruit of the mystery: ' + m.fruit + '</small></span></li>').join('') +
          '</ol>' +
        '</div>' +
        '<div class="today-actions">' +
          '<a class="btn btn-primary btn-lg" href="pray.html?set=' + t.key + '">' + icon('play') + ' Pray today’s Rosary</a>' +
          '<a class="btn" href="mysteries.html#' + t.key + '">Read the meditations</a>' +
          '<a class="btn" href="prayers.html#litany">Litany of Loreto</a>' +
        '</div>';
    }

    const slot = $('#resume-slot');
    const s = loadSession();
    if (slot && s) {
      const info = describeSession(s);
      slot.innerHTML =
        '<div class="card resume-card">' +
          '<div><p class="eyebrow">Continue praying</p><p class="resume-title">' + esc(info.title) + '</p><p class="resume-sub">' + esc(info.sub) + '</p></div>' +
          '<div class="resume-actions"><a class="btn btn-primary" href="pray.html?resume=1">' + icon('play') + ' Resume</a></div>' +
        '</div>';
      slot.hidden = false;
    }

    const sets = $('#sets');
    if (sets) sets.innerHTML = R.order.map((k) => setCard(k, k === t.key)).join('');
  }

  const PRAYER_SECTIONS = [
    {
      id: 'rosary-prayers',
      title: 'The Prayers of the Rosary',
      intro: 'The prayers said on the crucifix and beads, in the order in which they are first prayed.',
      items: ['sign', 'creed', 'ourFather', 'hailMary', 'gloryBe', 'fatima']
    },
    {
      id: 'concluding',
      title: 'After the Five Decades',
      intro: 'The Rosary concludes with the Hail, Holy Queen and its prayer. Many also pray the Litany of Loreto and the prayers that follow it, ending with the Sign of the Cross.',
      items: ['hailHolyQueen', 'rosaryPrayer', 'litany', 'subTuum', 'michael', 'memorare', 'pope']
    }
  ];

  function initPrayers() {
    const toc = $('#toc');
    const list = $('#prayer-list');
    if (!list) return;

    if (toc) {
      toc.innerHTML = PRAYER_SECTIONS.map((sec) => sec.items.map((k) => {
        const p = R.prayers[k];
        const label = k === 'litany' ? 'Litany of Loreto' : (p.short || p.title.en);
        return '<a href="#' + k + '"' + (k === 'litany' ? ' class="key"' : '') + '>' + label + '</a>';
      }).join('')).join('');
    }

    function render() {
      const lang = settings.lang;
      list.innerHTML = PRAYER_SECTIONS.map((sec) =>
        '<section class="prayer-section" id="' + sec.id + '" aria-labelledby="' + sec.id + '-h">' +
          '<h2 class="section-title" id="' + sec.id + '-h">' + sec.title + '</h2>' +
          '<p class="section-intro">' + sec.intro + '</p>' +
          sec.items.map((k) => {
            const p = R.prayers[k];
            const main = lang === 'la' ? p.title.la : p.title.en;
            const alt = lang === 'la' ? p.title.en : p.title.la;
            return '<article class="card prayer-card' + (k === 'litany' ? ' feature litany-card' : '') + '" id="' + k + '">' +
              '<header class="prayer-head"><h3>' + main + '</h3><p class="prayer-la">' + alt + '</p>' +
              (p.subtitle ? '<p class="prayer-sub">' + p.subtitle + '</p>' : '') + '</header>' +
              (p.about ? '<p class="prayer-about">' + p.about + '</p>' : '') +
              renderPrayer(k, lang) +
              '</article>';
          }).join('') +
        '</section>').join('');
    }
    render();
    doc.addEventListener('rosary:settings', render);
    scrollToHash();
  }

  function mysteryHTML(m, i) {
    return '<article class="card mystery">' +
      '<div class="mystery-num" aria-hidden="true">' + (i + 1) + '</div>' +
      '<div>' +
        '<h3>' + m.title + '</h3>' +
        '<p class="ref">' + R.ordinals[i] + ' Mystery · ' + m.ref + '</p>' +
        '<blockquote class="scripture"><p style="margin:0">“' + m.quote + '”</p><cite>' + m.quoteRef + '</cite></blockquote>' +
        '<p class="med">' + m.med + '</p>' +
        '<p class="fruit"><b>Fruit</b> ' + m.fruit + '</p>' +
      '</div>' +
    '</article>';
  }

  function initMysteries() {
    const d = today();
    const strip = $('#schedule-strip');
    if (strip) {
      const order = [0, 1, 2, 3, 4, 5, 6];
      strip.innerHTML = order.map((dow) => {
        const key = WEEK[dow];
        return '<a class="day' + (dow === d.getDay() ? ' is-today' : '') + '" href="#' + key + '">' +
          '<span class="d">' + DAY_NAMES[dow].slice(0, 3) + '</span>' +
          '<span class="m">' + R.mysteries[key].short + '</span></a>';
      }).join('');
    }
    const list = $('#set-list');
    if (list) {
      list.innerHTML = R.order.map((k) => {
        const s = R.mysteries[k];
        return '<section class="set-section" id="' + k + '" aria-labelledby="' + k + '-h">' +
          '<div class="set-head">' +
            '<span class="set-icon">' + icon(SET_ICON[k]) + '</span>' +
            '<div><h2 id="' + k + '-h">' + s.name + '</h2><p class="days">' + s.days + (s.season ? ' · ' + s.season : '') + '</p></div>' +
            '<a class="btn btn-primary" href="pray.html?set=' + k + '">' + icon('play') + ' Pray</a>' +
          '</div>' +
          '<p class="set-intro">' + s.intro + '</p>' +
          s.items.map(mysteryHTML).join('') +
        '</section>';
      }).join('');
    }
    scrollToHash();
  }

  function initHowTo() {
    const fig = $('#howto-diagram');
    if (fig) {
      const r = createRosary({ pad: 14, className: 'diagram' });
      fig.appendChild(r.svg);
      r.marker(1, 'cross', -28, 0);
      r.marker(2, 'O', 24, 0);
      r.marker(3, 'h1', 24, 0);
      r.marker(4, 'g0', -24, 0);
      r.marker(5, 'P0', 24, 0);
      r.marker(6, 'd0h5');
      r.marker(7, 'd0g', 20, 14);
      r.marker(8, 'P1', 22, -6);
      r.marker(9, 'center', -34, 13);
      r.set('', new Set());
    }
    const body = $('#schedule-body');
    if (body) {
      const t = mysteriesFor(today()).key;
      const rows = [
        ['joyful', 'Monday & Saturday', 'Sundays of Advent & Christmastide'],
        ['luminous', 'Thursday', ''],
        ['sorrowful', 'Tuesday & Friday', 'Sundays of Lent'],
        ['glorious', 'Wednesday & Sunday', '']
      ];
      body.innerHTML = rows.map((r) =>
        '<tr' + (r[0] === t ? ' class="is-today"' : '') + '><td><a href="mysteries.html#' + r[0] + '">' + R.mysteries[r[0]].name + '</a></td><td>' + r[1] +
        (r[2] ? '<br><span class="note">By custom, also ' + r[2] + '</span>' : '') + '</td></tr>').join('');
    }
  }

  /* ---------------------------------------------------------------
     Boot
     --------------------------------------------------------------- */
  applySettings();

  const btn = $('#settings-btn');
  if (btn) btn.addEventListener('click', openSettings);
  doc.querySelectorAll('[data-open-settings]').forEach((b) => b.addEventListener('click', openSettings));

  const yr = $('#year');
  if (yr) yr.textContent = String(new Date().getFullYear());

  const page = doc.body.getAttribute('data-page');
  if (page === 'home') initHome();
  if (page === 'prayers') initPrayers();
  if (page === 'mysteries') initMysteries();
  if (page === 'howto') initHowTo();

  if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) {
    window.addEventListener('load', () => { navigator.serviceWorker.register('sw.js').catch(() => {}); });
  }

  window.RosaryApp = {
    settings: settings,
    store: store,
    esc: esc,
    icon: icon,
    SET_ICON: SET_ICON,
    OPTIONS: OPTIONS,
    defaultOptions: defaultOptions,
    buildSteps: buildSteps,
    loadSession: loadSession,
    describeSession: describeSession,
    SESSION_KEY: SESSION_KEY,
    renderPrayer: renderPrayer,
    prayerTitle: prayerTitle,
    createRosary: createRosary,
    mysteriesFor: mysteriesFor,
    today: today,
    fmtDate: fmtDate,
    openSettings: openSettings
  };
})();
