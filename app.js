/* Data Detective — UI layer. Rendering, interaction, persistence. All learning content that can be
   computed lives in model.js; all data in data.js. No network requests are made anywhere in this file. */
(function () {
  'use strict';
  const D = window.DD_DATA, M = window.DD_MODEL;
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
  const STORAGE_KEY = 'dd_state_v1';
  const SCREENS = ['start', 'a1', 'a2', 'a3', 'summary'];
  const STATIC = document.documentElement.classList.contains('static-mode');

  /* ---------------- state & persistence ---------------- */
  const defaultState = () => ({
    screen: 'start', notebook: [],
    a1: { axis: [0, 100], rangesSeen: ['0,100'], checksOk: false, reflectOk: false },
    a2: { draws: [], size: 50, method: 'convenience', answered: false },
    a3: { strat: false, within: false, withinSeen: false, answered: false, justify: '', tricks: [], headline: '', caption: '', headlineSaved: false },
    summary: { claim: '', obs: '', limit: '' }
  });
  let state = load();
  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return defaultState();
      const parsed = JSON.parse(raw);
      return Object.assign(defaultState(), parsed, { a1: Object.assign(defaultState().a1, parsed.a1), a2: Object.assign(defaultState().a2, parsed.a2), a3: Object.assign(defaultState().a3, parsed.a3), summary: Object.assign(defaultState().summary, parsed.summary) });
    } catch (e) { return defaultState(); }   // corrupted storage: start clean rather than crash
  }
  function save() { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (e) { /* storage unavailable: lesson still works in memory */ } }
  function resetAll() {
    state = defaultState();
    try { localStorage.removeItem(STORAGE_KEY); } catch (e) { /* ignore */ }
    $$('input[type=checkbox], input[type=radio]').forEach(i => { i.checked = false; });
    $$('input[type=text], textarea').forEach(i => { i.value = ''; });
    $$('.feedback').forEach(f => { f.innerHTML = ''; });
    $('#a1-reflect').hidden = true; $('#a3-headline').hidden = true;
    renderAll(); go('start');
    try { localStorage.removeItem(STORAGE_KEY); } catch (e) { /* ignore */ }   // go() saved a default state; leave storage empty until the learner acts
    announce('Everything has been reset. You are back at the start.');
  }

  /* ---------------- helpers ---------------- */
  // Labels are flex rows of [control][text]; wrap the loose text/em nodes in one span so inline emphasis never splits into columns.
  $$('.checks label, .radios label, fieldset label, .switch').forEach(lab => {
    const input = lab.querySelector('input'); if (!input) return;
    const span = document.createElement('span');
    [...lab.childNodes].forEach(n => { if (n !== input) span.append(n); });
    lab.append(span);
  });
  const compact = () => window.innerWidth < 640;   // narrow phones: fewer ticks, short labels
  // Charts are drawn at the width they occupy, so 1 SVG unit = 1 CSS px and text is the authored size at every viewport.
  // A chart inside a hidden screen measures 0 and falls back to 640; go() redraws it when the screen is shown.
  const chartWidth = svg => { const w = svg.getBoundingClientRect().width || 0; return Math.round(Math.min(900, Math.max(280, w || 640))); };
  const fmt = (x, d = 1) => Number(x).toFixed(d);
  function el(tag, attrs = {}, ...children) {
    const n = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) { if (k === 'class') n.className = v; else if (k === 'html') n.innerHTML = v; else n.setAttribute(k, v); }
    for (const c of children) n.append(c);
    return n;
  }
  function svgEl(tag, attrs = {}) { const n = document.createElementNS('http://www.w3.org/2000/svg', tag); for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, v); return n; }
  function feedback(target, kind, label, html) {
    const box = el('div', { class: `box ${kind}` });
    box.append(el('span', { class: 'lbl' }, label), el('div', { html }));
    target.innerHTML = ''; target.append(box);
  }
  const liveRegion = el('div', { class: 'visually-hidden', role: 'status', 'aria-live': 'polite' });
  document.body.append(liveRegion);
  function announce(text) { liveRegion.textContent = ''; setTimeout(() => { liveRegion.textContent = text; }, 30); }
  function addNote(id, text) {
    if (!state.notebook.some(n => n.id === id)) { state.notebook.push({ id, text, at: new Date().toISOString() }); save(); renderNotebook(); }
  }
  function niceTicks(min, max, count = 5) {
    const span = max - min, raw = span / count, pow = Math.pow(10, Math.floor(Math.log10(raw)));
    const step = [1, 2, 2.5, 5, 10].map(m => m * pow).find(s => span / s <= count + 1) || pow * 10;
    const ticks = []; for (let v = Math.ceil(min / step) * step; v <= max + 1e-9; v += step) ticks.push(+v.toFixed(6)); return ticks;
  }

  /* ---------------- routing ---------------- */
  function go(screen, opts = {}) {
    if (!SCREENS.includes(screen)) screen = 'start';
    state.screen = screen; save();
    try { const u = new URL(location.href); u.searchParams.set('screen', screen); history.replaceState(null, '', u); } catch (e) { /* file:// or restricted contexts: ignore */ }
    $$('.screen').forEach(s => { s.hidden = s.dataset.screen !== screen; });
    if (screen === 'a1') renderA1Chart(); else if (screen === 'a2') renderA2(); else if (screen === 'a3') renderA3();   // redraw at the width now visible
    $$('.step').forEach(b => {
      const isCur = b.dataset.go === screen;
      if (isCur) b.setAttribute('aria-current', 'step'); else b.removeAttribute('aria-current');
      b.classList.toggle('done', isDone(b.dataset.go) && !isCur);
    });
    if (screen === 'summary') renderSummary();
    if (opts.focusHeading !== false && !STATIC) {
      const h = $(`#screen-${screen} h2`); if (h) { h.setAttribute('tabindex', '-1'); h.focus({ preventScroll: false }); }
      window.scrollTo({ top: 0, behavior: 'auto' });
    }
  }
  function isDone(s) {
    if (s === 'a1') return state.a1.checksOk && state.a1.reflectOk;
    if (s === 'a2') return state.a2.answered;
    if (s === 'a3') return state.a3.answered && state.a3.headlineSaved;
    return false;
  }
  document.addEventListener('click', e => {
    const b = e.target.closest('[data-go]'); if (b && !b.disabled) go(b.dataset.go);
  });
  $('#btn-reset-all').addEventListener('click', resetAll);
  $('#btn-reset-all-2').addEventListener('click', resetAll);
  $('#nb-clear').addEventListener('click', () => { state.notebook = []; save(); renderNotebook(); announce('Notebook cleared.'); });

  /* ================= ACTIVITY 1: graph framing ================= */
  const F = D.framing, FS = M.framingStats();
  function renderA1Chart() {
    const [min, max] = state.a1.axis;
    const svg = $('#a1-chart'); svg.innerHTML = '';
    // T is a title band above the plot so the axis title never sits on the top tick; R leaves room for the end-of-line labels.
    const W = chartWidth(svg), H = compact() ? 340 : 380, L = 60, R = 60, T = 40, B = 60, PB = H - B, PT = T;
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    const g = svgEl('g', { class: 'grid' }), ax = svgEl('g', { class: 'axis' }), tk = svgEl('g', { class: 'tick' });
    const ticks = niceTicks(min, max, compact() ? 4 : 5);
    for (const v of ticks) {
      const y = M.project(v, min, max, PT, PB);
      g.append(svgEl('line', { x1: L, x2: W - R, y1: y, y2: y }));
      const t = svgEl('text', { x: L - 10, y: y + 5, 'text-anchor': 'end' }); t.textContent = fmt(v, ticks.some(x => x % 1) ? 1 : 0); tk.append(t);
    }
    ax.append(svgEl('line', { x1: L, x2: L, y1: PT, y2: PB }), svgEl('line', { x1: L, x2: W - R, y1: PB, y2: PB }));
    const xs = F.terms.map((_, i) => L + 24 + i * ((W - R - L - 48) / (F.terms.length - 1)));
    // Narrow screens: short term names on two staggered rows so neighbouring labels never touch.
    F.terms.forEach((term, i) => { const t = svgEl('text', { x: xs[i], y: PB + (compact() && i % 2 ? 42 : 24), 'text-anchor': 'middle' }); t.textContent = compact() ? term.replace('Autumn', 'Aut').replace('Spring', 'Spr').replace('Summer', 'Sum') : term; tk.append(t); });
    const yt = svgEl('text', { class: 'axis-title', x: L, y: 24 }); yt.textContent = F.unit; tk.append(yt);
    svg.append(g, ax, tk);
    // Values are plotted where they fall — never clamped. The axis controls cannot exclude a data point (model.js AXIS_MIN_MAX / AXIS_MAX_MIN).
    F.series.forEach((s, si) => {
      const cls = si === 0 ? 'series-a' : 'series-b';
      const pts = s.values.map((v, i) => [xs[i], M.project(v, min, max, PT, PB)]);
      svg.append(svgEl('polyline', { class: cls, points: pts.map(p => p.join(',')).join(' '), fill: 'none', 'stroke-width': 3.5, 'stroke-linejoin': 'round' }));
      pts.forEach(([x, y]) => svg.append(svgEl('circle', { class: cls, cx: x, cy: y, r: 6 })));
    });
    // End-of-line value labels: pushed apart when they would overlap, always inside the viewBox.
    const ends = F.series.map(s => ({ v: s.values.at(-1), y: M.project(s.values.at(-1), min, max, PT, PB) }));
    const minGap = compact() ? 24 : 20;   // one text line plus breathing room at the authored font sizes
    if (Math.abs(ends[0].y - ends[1].y) < minGap) {
      const mid = (ends[0].y + ends[1].y) / 2, hi = ends[0].y <= ends[1].y ? ends[0] : ends[1], lo = hi === ends[0] ? ends[1] : ends[0];
      hi.y = mid - minGap / 2; lo.y = mid + minGap / 2;
    }
    ends.forEach(e => { const lab = svgEl('text', { class: 'end-label', x: xs.at(-1) + 12, y: e.y + 5 }); lab.textContent = fmt(e.v); svg.append(lab); });
    const legend = $('#a1-legend') || el('p', { class: 'legend', id: 'a1-legend' });
    legend.innerHTML = F.series.map((s, si) => `<span class="${si === 0 ? 'la' : 'lb'}">${s.name}</span>`).join('');
    svg.after(legend);
    const gapPct = M.apparentGapPct(min, max);
    $('#a1-range-label').textContent = `${min} to ${max}`;
    $('#a1-desc').textContent = `Line chart. Vertical axis from ${min} to ${max}. Group A rises from ${fmt(F.series[0].values[0])} to ${fmt(FS.finalA)}; Group B from ${fmt(F.series[1].values[0])} to ${fmt(FS.finalB)}. On this axis the final-term gap of ${fmt(FS.finalDiff)} points fills ${fmt(gapPct)}% of the axis height.`;
    $('#a1-min-out').textContent = min; $('#a1-max-out').textContent = max;
    $('#a1-min').value = min; $('#a1-max').value = max;
    $$('#screen-a1 .chip[data-axis]').forEach(c => c.setAttribute('aria-pressed', String(c.dataset.axis === `${min},${max}`)));
    $('#a1-stats').innerHTML = '';
    const stat = (label, val, same) => el('div', { class: 'stat' + (same ? ' same' : '') }, el('b', {}, val), el('span', {}, label));
    $('#a1-stats').append(
      stat('Group A mean (all terms)', fmt(FS.meanA), true), stat('Group B mean (all terms)', fmt(FS.meanB), true),
      stat('Final-term difference (A − B)', `${fmt(FS.finalDiff)} points`, true),
      stat('Gap as drawn (share of the axis height)', `${fmt(gapPct)} %`, false)
    );
    const tbl = el('table', {}, el('caption', {}, 'The data behind the chart (identical for every axis setting)'));
    const thead = el('thead', {}, el('tr', {}, el('th', {}, 'Term'), ...F.series.map(s => el('th', { class: 'num' }, s.name))));
    const tbody = el('tbody'); F.terms.forEach((t, i) => tbody.append(el('tr', {}, el('td', {}, t), ...F.series.map(s => el('td', { class: 'num' }, fmt(s.values[i]))))));
    tbl.append(thead, tbody); $('#a1-table').innerHTML = ''; $('#a1-table').append(tbl);
  }
  function setAxis(min, max) {
    min = Math.min(Math.max(0, +min), M.AXIS_MIN_MAX); max = Math.max(Math.min(100, +max), M.AXIS_MAX_MIN);
    state.a1.axis = [min, max];
    const key = `${min},${max}`; if (!state.a1.rangesSeen.includes(key)) state.a1.rangesSeen.push(key);
    save(); renderA1Chart();
  }
  $$('#screen-a1 .chip[data-axis]').forEach(c => c.addEventListener('click', () => { const [a, b] = c.dataset.axis.split(',').map(Number); setAxis(a, b); announce(`Axis now ${a} to ${b}. The ${fmt(FS.finalDiff)}-point gap now fills ${fmt(M.apparentGapPct(a, b))}% of the axis height; data unchanged.`); }));
  $('#a1-min').addEventListener('input', e => setAxis(e.target.value, state.a1.axis[1]));
  $('#a1-max').addEventListener('input', e => setAxis(state.a1.axis[0], e.target.value));
  $('#a1-table-toggle').addEventListener('click', e => { const t = $('#a1-table'); t.hidden = !t.hidden; e.target.setAttribute('aria-expanded', String(!t.hidden)); e.target.textContent = t.hidden ? 'Show data table' : 'Hide data table'; });
  $('#a1-hint').addEventListener('click', e => { const t = $('#a1-hint-text'); t.hidden = !t.hidden; e.target.setAttribute('aria-expanded', String(!t.hidden)); });
  $('#a1-check').addEventListener('click', () => {
    if (state.a1.rangesSeen.length < 2) { feedback($('#a1-feedback'), 'try', 'Run the experiment first.', '<p>Try at least one other axis range — a preset or a slider — and watch which boxes above change and which stay put. Then tick and check.</p>'); return; }
    const sel = $$('#a1-checks input:checked').map(i => i.value);
    const r = M.evaluateFramingChecks(sel);
    const names = { 'gap-look': 'how large the gap looks', axis: 'the axis numbers', values: 'the scores', means: 'the means', diff: 'the final-term difference' };
    if (r.correct) {
      feedback($('#a1-feedback'), 'ok', 'Exactly right.', `<p>Only the <em>picture</em> changed: the axis numbers and how big the gap looks. Every statistic — means ${fmt(FS.meanA)} vs ${fmt(FS.meanB)}, final difference ${fmt(FS.finalDiff)} points — is identical on every axis. The zoomed view didn't invent a difference; it magnified a real, small one (${fmt(FS.finalDiff)} points on a 100-point scale).</p>`);
      state.a1.checksOk = true; save(); addNote('a1-checks', `Framing: zooming the axis changed how the ${fmt(FS.finalDiff)}-point gap looked (${fmt(M.apparentGapPct(0, 100))}% of the axis height at 0–100 vs ${fmt(M.apparentGapPct(70, 74))}% at 70–74) but not a single number.`);
      $('#a1-reflect').hidden = false;
      const h = $('#a1-reflect h3'); h.setAttribute('tabindex', '-1'); h.focus();
      announce('Correct. A follow-up question has appeared below: is the zoomed chart dishonest?');
    } else {
      const parts = [];
      if (r.wrong.length) parts.push(`You ticked ${r.wrong.map(k => names[k]).join(' and ')} — but look at the statistics box: those numbers didn't move when the axis did.`);
      if (r.missed.length) parts.push(`You missed ${r.missed.map(k => names[k]).join(' and ')} — that <em>did</em> change. Try the 0–100 and 70–74 presets and watch the “gap as drawn” value.`);
      feedback($('#a1-feedback'), 'try', 'Not yet — have another look.', `<p>${parts.join(' ')}</p><p>Untick or tick and check again; there's no limit.</p>`);
    }
  });
  $('#a1-reflect-check').addEventListener('click', () => {
    const v = $('input[name=a1r]:checked')?.value;
    if (!v) { feedback($('#a1-reflect-feedback'), 'try', 'Choose an option first.', '<p>Pick the statement you agree with, then check.</p>'); return; }
    if (v === 'depends') {
      feedback($('#a1-reflect-feedback'), 'ok', 'That’s the expert view.', `<p>A zoomed axis is a tool, not a lie. Doctors zoom in on a temperature chart because a 1 °C change matters. It becomes misleading when the scale is hidden or when a tiny, meaningless change is dressed up as dramatic. The habit to build: <strong>read the axis numbers, then ask how big the change is in real terms.</strong></p>`);
      state.a1.reflectOk = true; save(); addNote('a1-reflect', 'A non-zero axis is not automatically deceptive; context and labelled scales decide.'); $('#a1-next').disabled = false; announce('Activity 1 complete. Next: Sampling is now available.');
    } else if (v === 'always') {
      feedback($('#a1-reflect-feedback'), 'try', 'Too strict.', `<p>If that were true, every hospital temperature chart would be “deceptive”. Zooming is legitimate when the scale is labelled and the change is meaningful. The question is whether the <em>impression</em> matches the <em>size of the real change</em>. Choose again.</p>`);
    } else {
      const tallest = Math.max(...state.a1.rangesSeen.map(k => { const [a, b] = k.split(',').map(Number); return M.apparentGapPct(a, b); }));
      const ratio = Math.round(tallest / M.apparentGapPct(0, 100));
      feedback($('#a1-reflect-feedback'), 'try', 'Too relaxed.', `<p>The numbers didn't change, but your <em>impression</em> did — on the widest zoom you tried, the same ${fmt(FS.finalDiff)}-point gap filled ${fmt(tallest)}% of the axis height instead of ${fmt(M.apparentGapPct(0, 100))}%, about ${ratio}× taller. Impressions drive decisions, so the framing matters. Choose again.</p>`);
    }
  });

  /* ================= ACTIVITY 2: sampling ================= */
  const P = M.populationSummary();
  function renderA2Pop() {
    $('#a2-pop').innerHTML = '';
    const stat = (label, val) => el('div', { class: 'stat' }, el('b', {}, val), el('span', {}, label));
    $('#a2-pop').append(stat('Students in the population', P.n), stat('True mean sleep (school night)', `${fmt(P.meanSleep, 2)} h`), stat('True share using library after 20:00', `${fmt(P.pctLate)} %`), stat('Mean sleep: late-library users', `${fmt(P.meanSleepLate, 2)} h`), stat('Mean sleep: everyone else', `${fmt(P.meanSleepOther, 2)} h`));
    $('#a2-hint-text').innerHTML = `Look at the “% late-library” column for the two methods. The population value is ${fmt(P.pctLate)}%. Which method gets close — and does making the other one bigger help?`;
  }
  function renderA2() {
    const draws = state.a2.draws;
    const svg = $('#a2-chart'); svg.innerHTML = '';
    const W = chartWidth(svg), H = 320, L = 60, R = 20, T = 40, B = 56, PB = H - B, PT = T;
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    const ymin = 6.0, ymax = 8.0;
    const g = svgEl('g', { class: 'grid' }), ax = svgEl('g', { class: 'axis' }), tk = svgEl('g', { class: 'tick' });
    for (const v of niceTicks(ymin, ymax, 4)) { const y = M.project(v, ymin, ymax, PT, PB); g.append(svgEl('line', { x1: L, x2: W - R, y1: y, y2: y })); const t = svgEl('text', { x: L - 10, y: y + 5, 'text-anchor': 'end' }); t.textContent = fmt(v); tk.append(t); }
    ax.append(svgEl('line', { x1: L, x2: L, y1: PT, y2: PB }), svgEl('line', { x1: L, x2: W - R, y1: PB, y2: PB }));
    const yt = svgEl('text', { class: 'axis-title', x: L, y: 24 }); yt.textContent = 'mean sleep (hours)'; tk.append(yt);
    const xt = svgEl('text', { class: 'axis-title', x: (L + W - R) / 2, y: H - 12, 'text-anchor': 'middle' }); xt.textContent = 'draw number'; tk.append(xt);
    const py = M.project(P.meanSleep, ymin, ymax, PT, PB);
    svg.append(g, ax, tk, svgEl('line', { class: 'pop-line', x1: L, x2: W - R, y1: py, y2: py }));
    const pl = svgEl('text', { x: W - R - 4, y: py - 8, 'text-anchor': 'end', class: 'end-label' }); pl.textContent = `population ${fmt(P.meanSleep, 2)} h`; svg.append(pl);
    const slots = Math.max(8, draws.length);
    draws.forEach((d, i) => {
      const x = L + 30 + i * ((W - R - L - 60) / Math.max(1, slots - 1));
      const y = M.project(Math.min(Math.max(d.meanSleep, ymin), ymax), ymin, ymax, PT, PB);
      const r = 5 + Math.log10(d.n) * 4;
      svg.append(svgEl('circle', { class: d.method === 'random' ? 'series-b' : 'series-a', cx: x, cy: y, r, opacity: 0.85 }));
      const t = svgEl('text', { x, y: PB + 20, 'text-anchor': 'middle' }); t.textContent = i + 1; tk.append(t);
    });
    const legend = $('#a2-legend') || el('p', { class: 'legend', id: 'a2-legend' });
    legend.innerHTML = '<span class="la">convenience (library door)</span><span class="lb">simple random (ID register)</span><span>dot size = sample size</span>';
    $('#a2-chart').after(legend);
    $('#a2-desc').textContent = draws.length ? `${draws.length} draws so far. Latest: ${draws.at(-1).method} sample of ${draws.at(-1).n}, mean sleep ${fmt(draws.at(-1).meanSleep, 2)} h (population ${fmt(P.meanSleep, 2)} h), ${fmt(draws.at(-1).pctLate)}% late-library (population ${fmt(P.pctLate)}%).` : 'No draws yet. Choose a method and size, then press Draw a sample.';
    const wrap = $('#a2-table'); wrap.innerHTML = ''; wrap.hidden = draws.length === 0;
    if (draws.length) {
      const tbl = el('table', {}, el('caption', {}, 'Your draws compared with the population'));
      tbl.append(el('thead', {}, el('tr', {}, el('th', {}, '#'), el('th', {}, 'Method'), el('th', { class: 'num' }, 'n'), el('th', { class: 'num' }, 'Mean sleep (h)'), el('th', { class: 'num' }, 'vs population'), el('th', { class: 'num' }, '% late-library'), el('th', { class: 'num' }, 'vs population'))));
      const tb = el('tbody');
      draws.forEach((d, i) => { const dm = d.meanSleep - P.meanSleep, dp = d.pctLate - P.pctLate; tb.append(el('tr', {}, el('td', {}, i + 1), el('td', {}, d.method === 'random' ? 'Simple random' : 'Convenience'), el('td', { class: 'num' }, d.n), el('td', { class: 'num' }, fmt(d.meanSleep, 2)), el('td', { class: 'num' }, (dm >= 0 ? '+' : '') + fmt(dm, 2) + ' h'), el('td', { class: 'num' }, fmt(d.pctLate)), el('td', { class: 'num' }, (dp >= 0 ? '+' : '') + fmt(dp) + ' pts'))); });
      tbl.append(tb); wrap.append(tbl);
    }
    $$('#a2-sizes .chip').forEach(c => c.setAttribute('aria-pressed', String(+c.dataset.n === state.a2.size)));
    const m = $(`input[name=a2m][value=${state.a2.method}]`); if (m) m.checked = true;
  }
  $$('#a2-sizes .chip').forEach(c => c.addEventListener('click', () => { state.a2.size = +c.dataset.n; save(); renderA2(); }));
  $$('input[name=a2m]').forEach(r => r.addEventListener('change', e => { state.a2.method = e.target.value; save(); }));
  $('#a2-draw').addEventListener('click', () => {
    const idx = state.a2.draws.filter(d => d.method === state.a2.method && d.n === state.a2.size).length + 1;
    const d = M.drawSample(state.a2.method, state.a2.size, idx);
    state.a2.draws.push(d); save(); renderA2();
    announce(`${d.method === 'random' ? 'Random' : 'Convenience'} sample of ${d.n}: mean sleep ${fmt(d.meanSleep, 2)} hours, ${fmt(d.pctLate)} percent late-library.`);
    const conv = state.a2.draws.filter(x => x.method === 'convenience'), rnd = state.a2.draws.filter(x => x.method === 'random');
    if (conv.length && rnd.length) addNote('a2-compare', `Sampling: convenience draws averaged ${fmt(D.stats.mean(conv.map(x => x.meanSleep)), 2)} h sleep and ${fmt(D.stats.mean(conv.map(x => x.pctLate)))}% late-library; random draws averaged ${fmt(D.stats.mean(rnd.map(x => x.meanSleep)), 2)} h and ${fmt(D.stats.mean(rnd.map(x => x.pctLate)))}% (population ${fmt(P.meanSleep, 2)} h, ${fmt(P.pctLate)}%).`);
  });
  $('#a2-clear').addEventListener('click', () => { state.a2.draws = []; save(); renderA2(); announce('Draws cleared.'); });
  $('#a2-hint').addEventListener('click', e => { const t = $('#a2-hint-text'); t.hidden = !t.hidden; e.target.setAttribute('aria-expanded', String(!t.hidden)); });
  $('#a2-check').addEventListener('click', () => {
    const v = $('input[name=a2q]:checked')?.value;
    const tried = state.a2.draws.some(d => d.method === 'convenience') && state.a2.draws.some(d => d.method === 'random');
    if (!v) { feedback($('#a2-feedback'), 'try', 'Choose an option first.', '<p>Draw at least one sample of each method, then pick an answer.</p>'); return; }
    if (!tried) { feedback($('#a2-feedback'), 'try', 'Draw first, then decide.', `<p>Draw at least one <strong>Convenience</strong> and one <strong>Simple random</strong> sample — try 500 of each — and compare the “% late-library” column with the population's ${fmt(P.pctLate)}%. The answer is in that table.</p>`); $('#a2-draw').focus(); return; }
    if (v === M.SAMPLING_ANSWER) {
      feedback($('#a2-feedback'), 'ok', 'Yes — that is bias, and size cannot cure it.', `<p>Late-library students are ${fmt(P.pctLate)}% of the college but about ${fmt(P.pctLateAtDoor, 0)}% of the people leaving the library at 21:00 (your draws vary around that), and they sleep about ${fmt(P.meanSleepOther - P.meanSleepLate, 1)} h less. A bigger convenience sample just estimates <em>that group</em> more precisely — the gap to the true ${fmt(P.meanSleep, 2)} h stays. Random sampling by ID wobbles when small but homes in on the truth as n grows, because everyone had the same chance of being picked.</p>`);
      state.a2.answered = true; save(); addNote('a2-answer', 'A larger biased sample is a more precise estimate of the wrong group; bias comes from the selection method, not the size.'); $('#a2-next').disabled = false; announce('Activity 2 complete. Next: Correlation is now available.');
    } else if (v === 'noise') {
      const evidence = state.a2.draws.some(d => d.method === 'random' && d.n >= 200) ? 'your random draws of 200–500 sit closer to the dashed line than draws of 10 would' : 'draw a random sample of 10 and then one of 500 and watch the dots settle toward the dashed line';
      feedback($('#a2-feedback'), 'try', 'The other way round.', `<p>Bigger samples are <em>less</em> noisy — ${evidence}. The convenience sample's problem isn't noise, it's <em>who gets picked</em>. Look at its % late-library column and choose again.</p>`);
    } else {
      feedback($('#a2-feedback'), 'try', 'Check the table.', `<p>Draw a convenience sample of 500. Its % late-library will still be far above ${fmt(P.pctLate)}%, and its mean sleep still below ${fmt(P.meanSleep, 2)} h. More of a skewed group is still a skewed group. Choose again.</p>`);
    }
  });

  /* ================= ACTIVITY 3: correlation ================= */
  const C = M.correlationSummary();
  const SEASON_LABEL = { cool: 'cool (< 12 °C)', mild: 'mild (12–19.9 °C)', warm: 'warm (≥ 20 °C)' };
  function renderA3() {
    const strat = state.a3.strat, within = state.a3.within && strat;
    $('#a3-strat').checked = strat; $('#a3-within').checked = within; $('#a3-within').disabled = !strat;
    const svg = $('#a3-chart'); svg.innerHTML = '';
    const W = chartWidth(svg), H = compact() ? 360 : 400, L = 56, R = 24, T = 40, B = 60, PB = H - B, PT = T;
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    const xs = D.weeks.map(w => w.iceCreamTubs), ys = D.weeks.map(w => w.sunburnVisits);
    const xmin = 0, xmax = Math.ceil(Math.max(...xs) / 100) * 100, ymin = 0, ymax = Math.ceil(Math.max(...ys) / 5) * 5;
    const px = v => L + ((v - xmin) / (xmax - xmin)) * (W - R - L), py = v => M.project(v, ymin, ymax, PT, PB);
    const g = svgEl('g', { class: 'grid' }), ax = svgEl('g', { class: 'axis' }), tk = svgEl('g', { class: 'tick' });
    for (const v of niceTicks(ymin, ymax, 5)) { g.append(svgEl('line', { x1: L, x2: W - R, y1: py(v), y2: py(v) })); const t = svgEl('text', { x: L - 10, y: py(v) + 5, 'text-anchor': 'end' }); t.textContent = v; tk.append(t); }
    for (const v of niceTicks(xmin, xmax, compact() ? 3 : 6)) { const t = svgEl('text', { x: px(v), y: PB + 22, 'text-anchor': 'middle' }); t.textContent = v; tk.append(t); }
    ax.append(svgEl('line', { x1: L, x2: L, y1: PT, y2: PB }), svgEl('line', { x1: L, x2: W - R, y1: PB, y2: PB }));
    const yt = svgEl('text', { class: 'axis-title', x: L, y: 24 }); yt.textContent = 'sunburn clinic visits / week'; tk.append(yt);
    const xt = svgEl('text', { class: 'axis-title', x: (L + W - R) / 2, y: H - 14, 'text-anchor': 'middle' }); xt.textContent = 'ice-cream tubs sold / week'; tk.append(xt);
    svg.append(g, ax, tk);
    D.weeks.forEach(w => svg.append(svgEl('circle', { class: strat ? `dot-${w.season}` : 'dot-all', cx: px(w.iceCreamTubs), cy: py(w.sunburnVisits), r: 6.5 })));
    const legend = $('#a3-legend') || el('p', { class: 'legend', id: 'a3-legend' });
    legend.innerHTML = strat ? `<span style="color:var(--rust)">warm</span><span style="color:var(--amber-ink)">mild</span><span style="color:var(--teal)">cool</span>` : `<span style="color:var(--navy)">all 52 weeks</span>`;
    $('#a3-chart').after(legend);
    const st = $('#a3-stats'); st.innerHTML = '';
    const stat = (label, val, cls = '') => el('div', { class: 'stat ' + cls }, el('b', {}, val), el('span', {}, label));
    st.append(stat('Correlation r, all 52 weeks (scale −1 to 1)', fmt(C.all, 2)));
    if (within) for (const s of ['cool', 'mild', 'warm']) st.append(stat(`r within ${SEASON_LABEL[s]} · ${C.bySeason[s].n} weeks`, C.bySeason[s].r === null ? 'n/a' : fmt(C.bySeason[s].r, 2), 'same'));
    if (strat && !within) st.append(stat('Correlation of temperature with ice cream / sunburn', `${fmt(C.rTempIce, 2)} / ${fmt(C.rTempSun, 2)}`));
    $('#a3-desc').textContent = `Scatter plot of 52 weeks. Overall correlation ${fmt(C.all, 2)}.` + (strat ? ` Points coloured by season; warm weeks cluster top-right, cool weeks bottom-left.` : '') + (within ? ` Within seasons: cool r ${fmt(C.bySeason.cool.r, 2)}, mild r ${fmt(C.bySeason.mild.r, 2)}, warm r ${fmt(C.bySeason.warm.r, 2)}.` : '');
    const wrap = $('#a3-table'); wrap.innerHTML = '';
    const tbl = el('table', {}, el('caption', {}, 'Port Lumen weekly data (fictional)'));
    tbl.append(el('thead', {}, el('tr', {}, el('th', {}, 'Week'), el('th', { class: 'num' }, 'Temp (°C)'), el('th', {}, 'Season'), el('th', { class: 'num' }, 'Ice-cream tubs'), el('th', { class: 'num' }, 'Sunburn visits'))));
    const tb = el('tbody'); D.weeks.forEach(w => tb.append(el('tr', {}, el('td', {}, w.week), el('td', { class: 'num' }, fmt(w.tempC)), el('td', {}, w.season), el('td', { class: 'num' }, w.iceCreamTubs), el('td', { class: 'num' }, w.sunburnVisits))));
    tbl.append(tb); wrap.append(tbl);
    $('#a3-justify').value = state.a3.justify; $('#a3-head').value = state.a3.headline; $('#a3-caption').value = state.a3.caption;
    $$('#a3-tricks input').forEach(i => { i.checked = state.a3.tricks.includes(i.value); });
    if (state.a3.answered) $('#a3-headline').hidden = false;
  }
  $('#a3-strat').addEventListener('change', e => { state.a3.strat = e.target.checked; if (!state.a3.strat) state.a3.within = false; save(); renderA3(); announce(state.a3.strat ? 'Points now coloured by season.' : 'Season colouring off.'); });
  $('#a3-within').addEventListener('change', e => { state.a3.within = e.target.checked; if (state.a3.within) state.a3.withinSeen = true; save(); renderA3(); if (state.a3.within) { announce(`Within-season correlations shown: cool ${fmt(C.bySeason.cool.r, 2)}, mild ${fmt(C.bySeason.mild.r, 2)}, warm ${fmt(C.bySeason.warm.r, 2)}.`); addNote('a3-within', `Correlation: r = ${fmt(C.all, 2)} across the year, but only ${fmt(C.bySeason.cool.r, 2)} / ${fmt(C.bySeason.mild.r, 2)} / ${fmt(C.bySeason.warm.r, 2)} within cool / mild / warm weeks — temperature explains most of the link.`); } });
  $('#a3-table-toggle').addEventListener('click', e => { const t = $('#a3-table'); t.hidden = !t.hidden; e.target.setAttribute('aria-expanded', String(!t.hidden)); e.target.textContent = t.hidden ? 'Show data table' : 'Hide data table'; });
  $('#a3-hint').addEventListener('click', e => { const t = $('#a3-hint-text'); t.hidden = !t.hidden; e.target.setAttribute('aria-expanded', String(!t.hidden)); });
  $('#a3-justify').addEventListener('input', e => { state.a3.justify = e.target.value; save(); });
  $('#a3-check').addEventListener('click', () => {
    const v = $('input[name=a3q]:checked')?.value; const just = $('#a3-justify').value.trim();
    if (!v) { feedback($('#a3-feedback'), 'try', 'Choose a conclusion first.', '<p>Pick one option and write a sentence of justification.</p>'); return; }
    if (!state.a3.withinSeen) { feedback($('#a3-feedback'), 'try', 'Look inside the seasons first.', '<p>Turn on “Colour the points by season”, then “Show the correlation within each season”, and watch what happens to r. Then choose.</p>'); $('#a3-strat').focus(); return; }
    if (v === M.CORRELATION_ANSWER && just.length < 15) {
      feedback($('#a3-feedback'), 'try', 'Right idea — now say why.', '<p>You chose the careful conclusion. Before it goes in your case file, write one or two sentences of reasoning: what happened to the correlation <em>within</em> each season, and what third thing could be moving both numbers? Nothing is graded — it just has to be your own reasoning.</p>');
      $('#a3-justify').focus(); return;
    }
    if (v === M.CORRELATION_ANSWER) {
      feedback($('#a3-feedback'), 'ok', 'Careful and correct.', `<p>The association is real (r = ${fmt(C.all, 2)}) but it does not, by itself, tell you the direction or existence of a cause. Colouring by season shows warm weeks push <em>both</em> numbers up, and inside each season the link is much weaker (r = ${fmt(C.bySeason.cool.r, 2)}, ${fmt(C.bySeason.mild.r, 2)}, ${fmt(C.bySeason.warm.r, 2)}). To claim a cause you would need something like an experiment, or the link surviving after accounting for temperature.</p><p>Your justification is saved in your case file. Use the self-review checklist to strengthen it; a strong answer mentions what happened within seasons and names temperature as a plausible common cause.</p>`);
      state.a3.answered = true; save(); addNote('a3-answer', 'Association alone does not establish causation; a plausible third variable (temperature) drives both ice-cream sales and sunburn.'); addNote('a3-justify', `My reasoning: “${just}”`);
      $('#a3-headline').hidden = false; announce('Correct. Headline builder is now available below.');
    } else if (v === 'none') {
      feedback($('#a3-feedback'), 'try', 'There is a relationship — it just isn’t what the headline claims.', `<p>r = ${fmt(C.all, 2)} across the year is a strong association. The question is what explains it. Turn on the season colouring and look again.</p>`);
    } else {
      feedback($('#a3-feedback'), 'try', 'That reads cause into a correlation.', `<p>Ask: what else rises in the same weeks? Turn on “colour by season”, then “within each season”. If the link is much weaker inside each season than across the whole year, warmth was moving both numbers. Choose again.</p>`);
    }
  });
  $$('#a3-tricks input').forEach(i => i.addEventListener('change', () => { state.a3.tricks = $$('#a3-tricks input:checked').map(x => x.value); save(); }));
  $('#a3-head').addEventListener('input', e => { state.a3.headline = e.target.value; save(); });
  $('#a3-caption').addEventListener('input', e => { state.a3.caption = e.target.value; save(); });
  $('#a3-head-check').addEventListener('click', () => {
    const r = M.evaluateHeadline(state.a3.tricks, state.a3.headline, state.a3.caption);
    if (r.ok) {
      feedback($('#a3-head-feedback'), 'ok', 'Saved to your case file.', `<p>You've named the tricks in your own words — that is the skill. Notice how reasonable it sounds; that is exactly why these checks have to be a habit rather than a feeling.</p>`);
      state.a3.headlineSaved = true; save(); addNote('a3-headline', `My misleading headline: “${state.a3.headline.trim()}” — ${state.a3.caption.trim()}`); $('#a3-next').disabled = false; announce('Headline saved. You can now open the case file.');
    } else {
      const msgs = { tricks: 'tick at least two of the three problems', headline: 'write a headline of at least a few words', caption: 'write a one-line caption naming the tricks' };
      feedback($('#a3-head-feedback'), 'try', 'Almost.', `<p>Please ${r.problems.map(p => msgs[p]).join(', and ')}.</p>`);
    }
  });

  /* ================= SUMMARY / CASE FILE ================= */
  function renderSummary() {
    const box = $('#summary-notes'); box.innerHTML = '';
    const grid = el('div', { class: 'notes-grid' });
    const items = [
      ['Graph framing', state.a1.checksOk && state.a1.reflectOk, state.notebook.filter(n => n.id.startsWith('a1')).map(n => n.text)],
      ['Sampling', state.a2.answered, state.notebook.filter(n => n.id.startsWith('a2')).map(n => n.text)],
      ['Correlation', state.a3.answered && state.a3.headlineSaved, state.notebook.filter(n => n.id.startsWith('a3')).map(n => n.text)]
    ];
    for (const [title, done, notes] of items) {
      const n = el('div', { class: 'note' + (done ? '' : ' pending') }, el('h4', {}, `${done ? '✓' : '○'} ${title}`));
      if (notes.length) notes.forEach(t => n.append(el('p', {}, t))); else n.append(el('p', {}, done ? 'Completed.' : 'Not finished yet — go back to this activity to complete it. Your progress here is kept.'));
      grid.append(n);
    }
    box.append(grid);
    $('#s-claim').value = state.summary.claim; $('#s-obs').value = state.summary.obs; $('#s-limit').value = state.summary.limit;
  }
  ['claim', 'obs', 'limit'].forEach(k => $(`#s-${k}`).addEventListener('input', e => { state.summary[k] = e.target.value; save(); }));
  $('#s-check').addEventListener('click', () => {
    const r = M.reviewConclusion(state.summary.claim, state.summary.obs, state.summary.limit);
    const names = { claim: 'the claim', observation: 'a supporting observation', limitation: 'a limitation' };
    if (!r.complete) { feedback($('#s-feedback'), 'try', 'Fill in all three parts.', `<p>Still missing: ${r.missing.map(m => names[m]).join(', ')}. A conclusion without a limitation is a slogan; a conclusion without evidence is an opinion.</p>`); return; }
    const notes = [];
    notes.push(r.mentionsEvidence ? 'Your observation points at something concrete in the data — good.' : 'Your observation doesn’t yet name anything from the data (a number, r, a season, a sample). Quote the evidence, e.g. “within each season r fell to about 0.2”.');
    notes.push(r.overclaims ? '<strong>Watch the wording:</strong> words like “proves”, “definitely” or “never” claim more than one fictional year of data can support. Try “suggests” or “is consistent with”.' : 'Your wording is suitably cautious — you claim what the evidence supports and no more.');
    feedback($('#s-feedback'), r.mentionsEvidence && !r.overclaims ? 'ok' : 'try', r.mentionsEvidence && !r.overclaims ? 'A conclusion a statistician would accept.' : 'Good structure — one more pass.', `<p>${notes.join('</p><p>')}</p><p>This review checks structure and wording only; it does not judge whether your reasoning is “right” — that is for you and your teacher to discuss.</p>`);
    addNote('summary', `Conclusion drafted: “${state.summary.claim.trim()}”`); announce('Conclusion reviewed.');
  });

  /* ================= notebook & boot ================= */
  function renderNotebook() {
    const list = $('#nb-list'); list.innerHTML = '';
    if (!state.notebook.length) { list.append(el('li', { class: 'empty' }, 'Nothing recorded yet. Findings appear here as you complete each check.')); return; }
    state.notebook.forEach(n => list.append(el('li', {}, n.text)));
  }
  function renderAll() {
    renderA1Chart(); renderA2Pop(); renderA2(); renderA3(); renderNotebook();
    $('#a1-next').disabled = !(state.a1.checksOk && state.a1.reflectOk);
    $('#a1-reflect').hidden = !state.a1.checksOk;
    $('#a2-next').disabled = !state.a2.answered;
    $('#a3-next').disabled = !(state.a3.answered && state.a3.headlineSaved);
  }
  renderAll();
  let resizeTimer = null;
  window.addEventListener('resize', () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(() => { renderA1Chart(); renderA2(); renderA3(); }, 150); });
  const wanted = new URLSearchParams(location.search).get('screen');
  go(wanted && SCREENS.includes(wanted) ? wanted : (state.screen || 'start'), { focusHeading: false });
})();
