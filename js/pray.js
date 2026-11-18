/*! The Holy Rosary — guided prayer, bead by bead */
(function () {
  'use strict';

  const R = window.ROSARY;
  const A = window.RosaryApp;
  if (!R || !A) return;

  const doc = document;
  const $ = (s) => doc.querySelector(s);
  const ORD = R.ordinals;
  const OPTS_KEY = 'rosary.options';

  const views = { setup: $('#setup'), session: $('#session'), done: $('#done') };

  let state = null;   // { set, opts, step, intention, updated }
  let steps = [];
  let wakeLock = null;

  const params = new URLSearchParams(location.search);
  const todayInfo = A.mysteriesFor(A.today());
  let chosenSet = R.mysteries[params.get('set')] ? params.get('set') : todayInfo.key;
  let opts = Object.assign(A.defaultOptions(), A.store.get(OPTS_KEY, {}));

  /* ---------------- Rosary diagrams ---------------- */
  const rosMain = A.createRosary({ onPick: jumpToBead });
  $('#rosary-main').appendChild(rosMain.svg);
  const rosMini = A.createRosary({ haloExtra: 8 });
  $('#rosary-mini').appendChild(rosMini.svg);

  /* ---------------- Views ---------------- */
  function show(name) {
    Object.keys(views).forEach((k) => { views[k].hidden = k !== name; });
  }

  /* ---------------- Setup ---------------- */
  function toggleHTML(o) {
    return '<label class="toggle"><span class="t-text"><strong>' + o.title + '</strong><small>' + o.desc + '</small></span>' +
      '<span class="switch"><input type="checkbox" name="opt" value="' + o.key + '"' + (opts[o.key] ? ' checked' : '') + '><span></span></span></label>';
  }

  function renderSetup() {
    $('#setup-date').textContent = 'Today · ' + A.fmtDate(A.today());

    $('#set-options').innerHTML = R.order.map((k) => {
      const s = R.mysteries[k];
      return '<label class="set-option"><input type="radio" name="set" value="' + k + '"' + (k === chosenSet ? ' checked' : '') + '>' +
        '<span class="opt-body"><span class="set-icon">' + A.icon(A.SET_ICON[k]) + '</span>' +
        '<span><strong>' + s.short + '</strong><small>' + s.days + '</small></span>' +
        (k === todayInfo.key ? '<span class="badge">Today</span>' : '') + '</span></label>';
    }).join('');

    const group = (g) => A.OPTIONS.filter((o) => o.group === g).map(toggleHTML).join('');
    $('#toggles').innerHTML =
      '<div class="toggle-group-label">During each decade</div>' + group('decade') +
      '<div class="toggle-group-label">After the five decades</div>' +
      '<div class="toggle fixed"><span class="t-text"><strong>Hail, Holy Queen &amp; concluding prayer</strong>' +
        '<small>Always prayed after the fifth decade</small></span><span class="always">Always</span></div>' +
      group('after');

    const s = A.loadSession();
    if (s) {
      const info = A.describeSession(s);
      $('#resume-title').textContent = info.title;
      $('#resume-sub').textContent = info.sub;
      $('#resume').hidden = false;
    } else {
      $('#resume').hidden = true;
    }
  }

  $('#set-options').addEventListener('change', (e) => {
    if (e.target.name === 'set') chosenSet = e.target.value;
  });
  $('#toggles').addEventListener('change', (e) => {
    if (e.target.name !== 'opt') return;
    opts[e.target.value] = e.target.checked;
    A.store.set(OPTS_KEY, opts);
  });

  $('#setup-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const intention = $('#intention').value.trim().slice(0, 140);
    start({ set: chosenSet, opts: Object.assign({}, opts), step: 0, intention: intention }, true);
  });

  $('#resume-btn').addEventListener('click', () => {
    const s = A.loadSession();
    if (s) start(s, true);
  });
  $('#discard-btn').addEventListener('click', () => {
    A.store.del(A.SESSION_KEY);
    $('#resume').hidden = true;
  });

  /* ---------------- Session ---------------- */
  function start(s, pushHistory) {
    state = { set: s.set, opts: Object.assign(A.defaultOptions(), s.opts || {}), step: s.step || 0, intention: s.intention || '' };
    steps = A.buildSteps(state.opts);
    if (state.step < 0 || state.step >= steps.length) state.step = 0;

    const set = R.mysteries[state.set];
    $('#side-set').textContent = set.name;
    $('#side-list').innerHTML = set.items.map((m, d) =>
      '<li data-d="' + d + '"><button type="button" data-decade="' + d + '"><span class="n">' + (d + 1) + '</span><span>' + m.title + '</span></button></li>').join('');
    const si = $('#side-intention');
    if (state.intention) { si.innerHTML = '<b>Offered for</b>' + A.esc(state.intention); si.hidden = false; }
    else si.hidden = true;

    show('session');
    doc.body.classList.add('in-session');
    if (pushHistory && location.hash !== '#praying') history.pushState({ praying: true }, '', '#praying');
    requestWakeLock();
    renderStep(false);
    window.scrollTo(0, 0);
  }

  function mysteryCardHTML(set, m, d) {
    return '<section class="mystery-card">' +
      '<p class="eyebrow mc-eyebrow">The ' + ORD[d] + ' ' + set.short + ' Mystery</p>' +
      '<h2>' + m.title + '</h2>' +
      '<blockquote class="scripture"><p style="margin:0">“' + m.quote + '”</p><cite>' + m.quoteRef + '</cite></blockquote>' +
      '<p class="med">' + m.med + '</p>' +
      '<p class="fruit"><b>Fruit</b> ' + m.fruit + '</p>' +
    '</section>';
  }

  function bannerHTML(set, m, d) {
    return '<div class="mystery-banner"><span class="mb-ico">' + A.icon(A.SET_ICON[set.key]) + '</span>' +
      '<div><div class="mb-title">' + m.title + '</div>' +
      '<div class="mb-fruit">' + ORD[d] + ' ' + set.short + ' Mystery · Fruit: ' + m.fruit + '</div></div></div>';
  }

  function renderStep(animate) {
    const st = steps[state.step];
    const set = R.mysteries[state.set];
    const lang = A.settings.lang;
    const m = st.d != null ? set.items[st.d] : null;

    // Header
    $('#step-sec').innerHTML = A.esc(st.sec) + (st.d != null ? '<span class="sec-set"> · ' + set.short + ' Mysteries</span>' : '');
    $('#step-title').innerHTML = A.esc(st.title) +
      (st.count ? ' <span class="count">' + st.count[0] + ' of ' + st.count[1] + '</span>' : '');
    $('#step-title').classList.toggle('long', st.title.length > 24);

    const dots = $('#step-dots');
    if (st.count) {
      const first = state.step - (st.count[0] - 1);
      let h = '';
      for (let i = 0; i < st.count[1]; i++) {
        const cls = i < st.count[0] - 1 ? 'done' : (i === st.count[0] - 1 ? 'cur' : '');
        h += '<button type="button" class="' + cls + '" data-step="' + (first + i) + '" aria-label="Go to Hail Mary ' + (i + 1) + '"></button>';
      }
      dots.innerHTML = h;
      dots.hidden = false;
    } else {
      dots.innerHTML = '';
      dots.hidden = true;
    }

    // Body
    let h = '';
    if (state.step === 0 && state.intention) {
      h += '<p class="step-intention"><b>Offered for</b>' + A.esc(state.intention) + '</p>';
    }
    if (m && st.announce) h += mysteryCardHTML(set, m, st.d);
    else if (m) h += bannerHTML(set, m, st.d);
    if (st.intent) h += '<p class="step-intent">' + st.intent + '</p>';
    if (st.hint) h += '<p class="step-hint">' + st.hint + '</p>';
    st.body.forEach((k, i) => {
      const p = R.prayers[k];
      const label = lang === 'la' ? p.title.la : (p.short || p.title.en);
      const needLabel = st.announce || (st.body.length > 1 && !(i === 0 && p.title.en === st.title));
      if (needLabel) h += '<h3 class="sub-prayer">' + label + '</h3>';
      h += A.renderPrayer(k, lang);
    });

    const card = $('#step-card');
    card.innerHTML = h;
    if (animate) {
      card.classList.remove('fade-in');
      void card.offsetWidth; // restart the animation
      card.classList.add('fade-in');
    }

    // Rosary diagrams
    const done = new Set();
    for (let i = 0; i < state.step; i++) done.add(steps[i].bead);
    rosMain.set(st.bead, done);
    rosMini.set(st.bead, done);

    // Mysteries list
    const concluding = st.d == null && state.step > 6;
    doc.querySelectorAll('#side-list li').forEach((li) => {
      const d = Number(li.dataset.d);
      li.classList.toggle('is-cur', st.d === d);
      li.classList.toggle('is-done', concluding || (st.d != null && d < st.d));
    });

    // Progress
    const pct = ((state.step + 1) / steps.length) * 100;
    $('#nav-progress').style.width = pct + '%';
    $('#side-bar').style.width = pct + '%';
    $('#side-count').textContent = 'Step ' + (state.step + 1) + ' of ' + steps.length;
    $('#side-pct').textContent = Math.round(pct) + '%';
    $('#step-count').textContent = (state.step + 1) + ' / ' + steps.length;

    // Buttons
    $('#prev-btn').disabled = state.step === 0;
    const last = state.step === steps.length - 1;
    $('#next-btn').innerHTML = last ? A.icon('check') + ' Amen' : 'Next ' + A.icon('arrowRight');
    $('#next-btn').setAttribute('aria-label', last ? 'Finish the Rosary' : 'Next prayer');

    // Screen readers
    $('#live').textContent = st.sec + '. ' + st.title + (st.count ? ', ' + st.count[0] + ' of ' + st.count[1] : '') + '.';

    save();
  }

  function save() {
    if (!state) return;
    A.store.set(A.SESSION_KEY, {
      set: state.set, opts: state.opts, step: state.step, intention: state.intention, updated: Date.now()
    });
  }

  function go(i) {
    if (!state || i < 0) return;
    if (i >= steps.length) { finish(); return; }
    state.step = i;
    renderStep(true);
    window.scrollTo(0, 0);
  }
  const next = () => go(state.step + 1);
  const prev = () => go(state.step - 1);

  function jumpToBead(id) {
    if (!state) return;
    // From the end of the Rosary, the crucifix means the closing Sign of the Cross
    if (id === 'cross' && steps[state.step].sec === 'Concluding Prayers') { go(steps.length - 1); return; }
    const i = steps.findIndex((s) => s.bead === id);
    if (i >= 0) go(i);
  }

  $('#next-btn').addEventListener('click', next);
  $('#prev-btn').addEventListener('click', prev);
  $('#step-dots').addEventListener('click', (e) => {
    const b = e.target.closest('[data-step]');
    if (b) go(Number(b.dataset.step));
  });
  $('#side-list').addEventListener('click', (e) => {
    const b = e.target.closest('[data-decade]');
    if (!b) return;
    const d = Number(b.dataset.decade);
    go(steps.findIndex((s) => s.d === d && s.announce));
  });

  // Keyboard: → / Space for next, ← / Shift+Space for back
  doc.addEventListener('keydown', (e) => {
    if (views.session.hidden || !state) return;
    if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey) return;
    const t = e.target;
    const tag = (t.tagName || '').toLowerCase();
    if (tag === 'input' || tag === 'textarea' || tag === 'select' || t.isContentEditable) return;
    if (doc.querySelector('dialog[open]')) return;
    const onControl = t.closest && t.closest('button, a, summary, [role="button"]');
    if (e.key === 'ArrowRight' || e.key === 'PageDown' || (e.key === ' ' && !e.shiftKey && !onControl)) {
      e.preventDefault(); next();
    } else if (e.key === 'ArrowLeft' || e.key === 'PageUp' || (e.key === ' ' && e.shiftKey && !onControl)) {
      e.preventDefault(); prev();
    }
  });

  // Swipe left / right on touch screens
  (function () {
    const area = $('#pray-main');
    let x = 0, y = 0, t = 0;
    area.addEventListener('touchstart', (e) => {
      if (e.touches.length !== 1) { t = 0; return; }
      x = e.touches[0].clientX; y = e.touches[0].clientY; t = Date.now();
    }, { passive: true });
    area.addEventListener('touchend', (e) => {
      if (!t) return;
      const p = e.changedTouches[0];
      const dx = p.clientX - x, dy = p.clientY - y, dt = Date.now() - t;
      t = 0;
      if (dt < 700 && Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.6) {
        if (dx < 0) next(); else prev();
      }
    }, { passive: true });
  })();

  /* ---------------- Exit, finish, history ---------------- */
  function exitSession() {
    releaseWakeLock();
    state = null;
    doc.body.classList.remove('in-session');
    renderSetup();
    show('setup');
    window.scrollTo(0, 0);
  }

  $('#exit-btn').addEventListener('click', () => {
    if (location.hash === '#praying' && history.state && history.state.praying) history.back();
    else {
      history.replaceState(null, '', location.pathname + location.search);
      exitSession();
    }
  });

  window.addEventListener('popstate', () => {
    if (location.hash === '#praying') {
      if (views.session.hidden) {
        const s = A.loadSession();
        if (s) start(s, false);
      }
    } else if (!views.session.hidden) {
      exitSession();
    }
  });

  function finish() {
    const intention = state.intention;
    A.store.del(A.SESSION_KEY);
    A.store.set('rosary.last', { set: state.set, at: Date.now() });
    state = null;
    releaseWakeLock();
    doc.body.classList.remove('in-session');
    const di = $('#done-intention');
    if (intention) { di.innerHTML = '<b>Offered for</b> ' + A.esc(intention); di.hidden = false; }
    else di.hidden = true;
    if (location.hash === '#praying') history.replaceState(null, '', location.pathname + location.search);
    show('done');
    window.scrollTo(0, 0);
    const h = $('#done h1');
    if (h) h.focus({ preventScroll: true });
  }

  $('#again-btn').addEventListener('click', () => {
    renderSetup();
    show('setup');
    window.scrollTo(0, 0);
  });

  /* ---------------- Keep the screen awake while praying ---------------- */
  async function requestWakeLock() {
    try {
      if ('wakeLock' in navigator && doc.visibilityState === 'visible' && !wakeLock) {
        wakeLock = await navigator.wakeLock.request('screen');
        wakeLock.addEventListener('release', () => { wakeLock = null; });
      }
    } catch (e) { wakeLock = null; }
  }
  function releaseWakeLock() {
    try { if (wakeLock) wakeLock.release(); } catch (e) { /* ignore */ }
    wakeLock = null;
  }
  doc.addEventListener('visibilitychange', () => {
    if (doc.visibilityState === 'visible' && state && !views.session.hidden) requestWakeLock();
  });

  // Re-render when the language or text size changes
  doc.addEventListener('rosary:settings', () => {
    if (state && !views.session.hidden) renderStep(false);
  });

  /* ---------------- Boot ---------------- */
  renderSetup();
  show('setup');

  const wantResume = params.get('resume') === '1';
  if (wantResume || location.hash === '#praying') {
    const s = A.loadSession();
    if (wantResume) {
      params.delete('resume');
      const q = params.toString();
      history.replaceState(null, '', location.pathname + (q ? '?' + q : ''));
    }
    if (s) start(s, true);
    else if (location.hash === '#praying') history.replaceState(null, '', location.pathname + location.search);
  }
})();
