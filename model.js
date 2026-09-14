/* Data Detective — pure model functions. No DOM. Loaded by the browser (after data.js) and by the Node tests.
   Everything a judge might want to verify numerically lives here so it can be tested in isolation. */

(function (global) {
  'use strict';
  const D = global.DD_DATA;
  const { stats } = D;
  const r1 = x => Math.round(x * 10) / 10;
  const r2 = x => Math.round(x * 100) / 100;

  /* ---------- Activity 1: graph framing ---------- */
  function framingStats() {
    const [a, b] = D.framing.series;
    const last = a.values.length - 1;
    return {
      meanA: r1(stats.mean(a.values)), meanB: r1(stats.mean(b.values)),
      finalA: a.values[last], finalB: b.values[last],
      finalDiff: r1(a.values[last] - b.values[last]),
      riseA: r1(a.values[last] - a.values[0]), riseB: r1(b.values[last] - b.values[0])
    };
  }
  // Pixel-space projection for a given axis range; used by the chart and by the tests to prove that the
  // axis changes the *drawing* but never the *data*.
  function project(value, axisMin, axisMax, plotTop, plotBottom) {
    const t = (value - axisMin) / (axisMax - axisMin);
    return plotBottom - t * (plotBottom - plotTop);
  }
  // How many pixels tall the final-term gap looks for an axis range (chart plot height 260px by default)
  function apparentGapPx(axisMin, axisMax, plotHeight = 260) {
    const s = framingStats();
    return r1(Math.abs(project(s.finalA, axisMin, axisMax, 0, plotHeight) - project(s.finalB, axisMin, axisMax, 0, plotHeight)));
  }
  const FRAMING_CHANGED = new Set(['gap-look', 'axis']);   // what changes when you zoom the axis
  const FRAMING_SAME = new Set(['values', 'means', 'diff']); // what does not
  function evaluateFramingChecks(selected) {
    const sel = new Set(selected);
    const missed = [...FRAMING_CHANGED].filter(k => !sel.has(k));
    const wrong = [...FRAMING_SAME].filter(k => sel.has(k));
    return { correct: missed.length === 0 && wrong.length === 0, missed, wrong };
  }

  /* ---------- Activity 2: sampling ---------- */
  function populationSummary() {
    const pop = D.population;
    return {
      n: pop.length,
      meanSleep: r2(stats.mean(pop.map(s => s.sleepHours))),
      pctLate: r1(100 * stats.proportion(pop, s => s.lateLibrary)),
      meanSleepLate: r2(stats.mean(pop.filter(s => s.lateLibrary).map(s => s.sleepHours))),
      meanSleepOther: r2(stats.mean(pop.filter(s => !s.lateLibrary).map(s => s.sleepHours)))
    };
  }
  // Deterministic: draw k of method m with size n gives the same sample for the same (method, n, drawIndex).
  function drawSample(method, n, drawIndex) {
    const seed = (method === 'random' ? 1000003 : 2000003) + n * 97 + drawIndex;
    const sample = D.samplers[method](D.population, n, seed);
    return {
      method, n: sample.length, drawIndex, seed,
      meanSleep: r2(stats.mean(sample.map(s => s.sleepHours))),
      pctLate: r1(100 * stats.proportion(sample, s => s.lateLibrary))
    };
  }
  const SAMPLING_ANSWER = 'bias';

  /* ---------- Activity 3: correlation ---------- */
  function correlationSummary() {
    const w = D.weeks;
    const all = r2(stats.pearson(w.map(x => x.iceCreamTubs), w.map(x => x.sunburnVisits)));
    const bySeason = {};
    for (const season of ['cool', 'mild', 'warm']) {
      const ws = w.filter(x => x.season === season);
      bySeason[season] = {
        n: ws.length,
        r: ws.length > 2 ? r2(stats.pearson(ws.map(x => x.iceCreamTubs), ws.map(x => x.sunburnVisits))) : null,
        meanTemp: r1(stats.mean(ws.map(x => x.tempC))),
        meanIce: Math.round(stats.mean(ws.map(x => x.iceCreamTubs))),
        meanSun: r1(stats.mean(ws.map(x => x.sunburnVisits)))
      };
    }
    const rTempIce = r2(stats.pearson(w.map(x => x.tempC), w.map(x => x.iceCreamTubs)));
    const rTempSun = r2(stats.pearson(w.map(x => x.tempC), w.map(x => x.sunburnVisits)));
    return { all, bySeason, rTempIce, rTempSun };
  }
  const CORRELATION_ANSWER = 'third';
  const HEADLINE_MIN_TRICKS = 2;
  function evaluateHeadline(tricks, headline, caption) {
    const problems = [];
    if ((tricks || []).length < HEADLINE_MIN_TRICKS) problems.push('tricks');
    if (!headline || headline.trim().length < 12) problems.push('headline');
    if (!caption || caption.trim().length < 12) problems.push('caption');
    return { ok: problems.length === 0, problems };
  }

  /* ---------- Case file: conclusion review (presence/shape only — never pretends to grade prose) ---------- */
  function reviewConclusion(claim, observation, limitation) {
    const notes = [];
    const has = s => s && s.trim().length >= 8;
    if (!has(claim)) notes.push('claim');
    if (!has(observation)) notes.push('observation');
    if (!has(limitation)) notes.push('limitation');
    const obs = (observation || '').toLowerCase();
    const mentionsEvidence = /\b(r\s*[=≈]|correlation|season|within|split|sample|axis|mean|per cent|percent|%|\d)/.test(obs);
    const overclaims = /\b(prove[sd]?|proof|definitely|certainly|always|never)\b/i.test(`${claim} ${observation}`);
    return { complete: notes.length === 0, missing: notes, mentionsEvidence, overclaims };
  }

  global.DD_MODEL = { framingStats, project, apparentGapPx, evaluateFramingChecks, FRAMING_CHANGED, FRAMING_SAME,
    populationSummary, drawSample, SAMPLING_ANSWER, correlationSummary, CORRELATION_ANSWER, evaluateHeadline, reviewConclusion, r1, r2 };
})(typeof window !== 'undefined' ? window : globalThis);
