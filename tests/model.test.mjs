// Run: node --test tests/
// Loads the browser modules into Node's global scope (they attach to globalThis when `window` is undefined).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
require('../data.js');
require('../model.js');
const D = globalThis.DD_DATA, M = globalThis.DD_MODEL;

// ---------- Activity 1: axis changes the drawing, never the data ----------
test('framing: statistics are identical for every axis range', () => {
  const s = M.framingStats();
  assert.equal(s.finalDiff, 1.8);
  assert.equal(s.meanA, 72.5); assert.equal(s.meanB, 71.4);
  // the stats function does not even take an axis argument — but prove the projection is what changes
  const gapFull = M.apparentGapPx(0, 100), gapZoom = M.apparentGapPx(70, 74);
  assert.ok(gapZoom > gapFull * 10, `zoomed gap ${gapZoom}px should dwarf full-scale gap ${gapFull}px`);
});
test('framing: projection is monotone and maps bounds to plot edges', () => {
  assert.equal(M.project(0, 0, 100, 0, 260), 260);
  assert.equal(M.project(100, 0, 100, 0, 260), 0);
  assert.ok(M.project(73.6, 70, 74, 0, 260) < M.project(71.8, 70, 74, 0, 260), 'higher value drawn higher (smaller y)');
});
test('framing: answer key — only appearance and axis labels change', () => {
  assert.deepEqual(M.evaluateFramingChecks(['gap-look', 'axis']), { correct: true, missed: [], wrong: [] });
  const r = M.evaluateFramingChecks(['gap-look', 'means']);
  assert.equal(r.correct, false); assert.deepEqual(r.wrong, ['means']); assert.deepEqual(r.missed, ['axis']);
});

// ---------- Activity 2: sampling is reproducible and the bias is real ----------
test('sampling: population is fixed and documented', () => {
  const p = M.populationSummary();
  assert.equal(p.n, 1200);
  assert.ok(p.meanSleepLate < p.meanSleepOther - 1, 'late-library students sleep at least an hour less on average');
  assert.equal(D.seeds.population, 20260914);
});
test('sampling: same method, size and draw index give the identical sample every time', () => {
  const a = M.drawSample('convenience', 50, 1), b = M.drawSample('convenience', 50, 1);
  assert.deepEqual(a, b);
  const c = M.drawSample('convenience', 50, 2);
  assert.notDeepEqual(a.meanSleep + a.pctLate, c.meanSleep + c.pctLate, 'different draw index gives a different sample');
});
test('sampling: convenience sample over-represents late-library users and stays biased at n=500', () => {
  const p = M.populationSummary();
  const conv500 = M.drawSample('convenience', 500, 1);
  assert.ok(conv500.pctLate > p.pctLate + 20, `convenience %late ${conv500.pctLate} should exceed population ${p.pctLate} by >20 pts`);
  assert.ok(conv500.meanSleep < p.meanSleep - 0.3, `convenience mean ${conv500.meanSleep} should sit well below population ${p.meanSleep}`);
});
test('sampling: random sample of 500 lands close to the population', () => {
  const p = M.populationSummary();
  const rnd500 = M.drawSample('random', 500, 1);
  assert.ok(Math.abs(rnd500.meanSleep - p.meanSleep) < 0.15, `random mean ${rnd500.meanSleep} vs ${p.meanSleep}`);
  assert.ok(Math.abs(rnd500.pctLate - p.pctLate) < 5, `random %late ${rnd500.pctLate} vs ${p.pctLate}`);
});
test('sampling: fixed test cases (regression values shown in the lesson)', () => {
  assert.equal(M.drawSample('convenience', 50, 1).n, 50);
  assert.equal(M.drawSample('random', 10, 1).n, 10);
  assert.equal(M.drawSample('random', 5000, 1).n, 1200, 'cannot sample more than the population');
});

// ---------- Activity 3: correlation collapses within seasons ----------
test('correlation: strong across the year, weak within each season', () => {
  const c = M.correlationSummary();
  assert.ok(c.all > 0.7, `overall r ${c.all}`);
  for (const s of ['cool', 'mild', 'warm']) assert.ok(Math.abs(c.bySeason[s].r) < 0.5, `within ${s} r ${c.bySeason[s].r} should be weak`);
  assert.ok(c.rTempIce > 0.8 && c.rTempSun > 0.8, 'temperature drives both variables');
});
test('correlation: pearson helper matches a hand calculation', () => {
  assert.equal(Math.round(D.stats.pearson([1, 2, 3, 4], [2, 4, 6, 8]) * 1000) / 1000, 1);
  assert.equal(Math.round(D.stats.pearson([1, 2, 3, 4], [8, 6, 4, 2]) * 1000) / 1000, -1);
});
test('correlation: headline builder requires two tricks, a headline and a caption', () => {
  assert.equal(M.evaluateHeadline(['axis', 'corr'], 'SUNBURN EPIDEMIC LINKED TO ICE CREAM', 'zoomed axis plus correlation as cause').ok, true);
  assert.deepEqual(M.evaluateHeadline(['axis'], 'short', '').problems, ['tricks', 'headline', 'caption']);
});

// ---------- Case file review: structure only, never pretends to grade prose ----------
test('conclusion review flags missing parts, evidence and overclaiming', () => {
  const r = M.reviewConclusion('Ice cream is linked to sunburn', 'Within each season r fell to about 0.2', 'Only one fictional year');
  assert.equal(r.complete, true); assert.equal(r.mentionsEvidence, true); assert.equal(r.overclaims, false);
  const r2 = M.reviewConclusion('This proves ice cream causes sunburn', 'It just does', '');
  assert.equal(r2.complete, false); assert.deepEqual(r2.missing, ['limitation']); assert.equal(r2.overclaims, true);
});

// ---------- data hygiene ----------
test('data: every dataset field has a dictionary entry', () => {
  for (const key of Object.keys(D.population[0])) assert.ok(D.dictionary.population[key], `population.${key} documented`);
  for (const key of Object.keys(D.weeks[0])) assert.ok(D.dictionary.weeks[key], `weeks.${key} documented`);
});
