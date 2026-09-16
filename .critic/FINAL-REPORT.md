# Final report — "Data Detective: Can You Trust This Claim?" — a 10–15 minute investigation for ~15-year-olds that teaches three checks (graph framing, sampling bias, correlation vs causation) through manipulable synthetic data, ending with the learner writing a cautious evidence-based conclusion. Built for a Taskmarket bounty (task 0x95c8e16d…317fe, 4 USDC, one winner, judged on a 100-point rubric: educational correctness & clarity 25, age suitability 25, interactive learning & feedback 25, usability & accessibility 15, technical quality & reproducibility 10).

## Summary

**Outcome: BUDGET** after 4 critique round(s) of 4. maxRounds 4 exhausted. Final min score 7.0.

The primary goal is met: all three activities are genuine gated experiments, feedback names each misconception, the case file accepts a claim + observation + limitation, and 16/16 tests pass. Two critics reached the 8 bar; the staff engineer's only remaining item was deploy parity, which was closed after the round — the fixes were committed and pushed (a1a62e3) and `npm run verify-deploy` now confirms the live GitHub Pages build matches the archive. The loop stopped on BUDGET (4/4 rounds) before that fix could be re-judged, so the honest final state is: 8/8/7 as judged, with the 7's sole blocker resolved and verified outside the loop.

Final scores (threshold 8): Statistics Educator & Learning Scientist **8.0** · Year 11 Learner Advocate & UX/Accessibility Lead **8.0** · Staff Engineer & Bounty Compliance Reviewer **7.0**

Open items: **1** · won't-fix: **0** · resolved over the run: **18**

## Score table

| Critic | R1 | R2 | R3 | R4 |
|---|---|---|---|---|
| Statistics Educator & Learning Scientist | 4.0 | 7.0 | 7.0 | 8.0 |
| Year 11 Learner Advocate & UX/Accessibility Lead | 4.0 | 7.0 | 7.0 | 8.0 |
| Staff Engineer & Bounty Compliance Reviewer | 4.0 | 5.0 | 8.0 | 7.0 |
| **min** | **4.0** | **5.0** | **7.0** | **7.0** |
| new blocking | 9 | 5 | 4 | 1 |
| unresolved carry-over | 0 | 0 | 0 | 0 |

## Open items

### R4-SC-1 — The live GitHub Pages preview serves an older revision than the submitted archive, so the brief's Definition of Done #5 ('the GitHub Pages preview matches the submitted archive') is not met.
- critic: Staff Engineer & Bounty Compliance Reviewer · raised round 4 · status **open**
- where: `https://patanakiat.github.io/data-detective/ fetched 2026-09-16: start screen reads 'you'll finish by writing a headline that fails all three on purpose' while index.html:46 reads 'fails at least two of the three on purpose'; the A2 hint reads 'The population value is about 25%. Which method gets close, and does size help the other one?' while app.js:231 renders 'The population value is 25.2%. Which method gets close — and does making the other one bigger help?'`
- why it caps the score: A required deliverable (public preview) does not match the tested artifact, so the package cannot be merged or judged as one revision.
- critic's proposed fix:

```
From the project root (or wherever the Pages source lives), publish exactly the tested tree, then hard-verify the two strings against the live URL:

git add -A; git commit -m "Data Detective: deploy the round-4 build"; git push

$live = (Invoke-WebRequest -UseBasicParsing https://patanakiat.github.io/data-detective/).Content
$app  = (Invoke-WebRequest -UseBasicParsing https://patanakiat.github.io/data-detective/app.js).Content
$live -match 'at least two of the three'    # must print True
$app  -match 'population value is 25\.2%'   # must print True

If the Pages source is a separate copy of the folder, replace it with this archive first; if scripts/verify-deploy.mjs already fetches the live site, make it assert these two strings so the deploy cannot drift again.
```
- <!-- ORCHESTRATOR: why this is still open -->
  Closed after the round, outside the loop: the working tree was committed and pushed (`a1a62e3`), GitHub Pages rebuilt, and `npm run verify-deploy` (added this round) confirms the live site serves the tested build — index.html contains 'at least two of the three' and app.js serves the runtime-derived 25.2%. The ledger status is still `open` because only `merge.mjs` may change statuses and the loop had already stopped; no further code changes were made to address it.

## What changed per round

### Round 1
- raised: R1-ED-1, R1-ED-2, R1-ED-3, R1-LA-1, R1-LA-2, R1-LA-3, R1-SC-1, R1-SC-2, R1-SC-3

### Round 2
- ✔ R1-ED-1 resolved — a2 'bias' feedback quotes M.populationSummary().pctLateAtDoor (57.4%) computed in model.js:59 from sampler design; new test; a1-min max=70 + setAxis clamps to M.AXIS_MIN_MAX/AXIS_MAX_MIN (model.js); a1-desc uses fmt() so no float residue; s-limit placeholder replaced with a true limitation (one town/year, season bands chosen, 14-20 weeks per stratum) — app.js:270, app.js:179, index.html:81
- ✔ R1-ED-2 resolved — a1-check gates on state.a1.rangesSeen.length>=2 ('Run the experiment first.' app.js:179); a2-check gates on both methods drawn ('Draw first, then decide.' app.js:268); a3-check gates on state.a3.withinSeen ('Look inside the seasons first.' app.js:326) and keyed answer needs >=15-char justification (app.js:327); radio options rewritten to similar lengths
- ✔ R1-ED-3 resolved — renderA1Chart appends legend <p id=a1-legend> with Group A/Group B swatches (app.js:146-148); index.html:194 adds 'What r means' paragraph (-1 to 1, strength not why) before the Activity 3 chart; stat label now 'Correlation r, all 52 weeks (scale -1 to 1)' (app.js:305); EDUCATOR_GUIDE prerequisite line rewritten
- ✔ R1-LA-1 resolved — Charts set viewBox to measured width via chartWidth() (app.js:53) so 1 SVG unit = 1 CSS px, 14-16px text at all viewports; title band T=40, R=60 end labels inside viewBox; .chart polyline { fill:none } fixes CSS wedge (styles.css:126); .chart-wrap single-column with axis controls beneath >=720px; legend added
- ✔ R1-LA-2 resolved — :focus-visible is a two-colour ring — 3px var(--focus) outline with 3px #fff box-shadow on paper (styles.css:51), inverting to white outline + navy-deep shadow inside .top (styles.css:52); --focus var repurposed
- ✔ R1-LA-3 resolved — a3-check no longer marks answered without justification: keyed answer with <15 chars returns 'Right idea — now say why.' and focuses #a3-justify (app.js:327); a2-check gates on both methods drawn (app.js:268)
- ✔ R1-SC-1 resolved — T=40 title band in all three charts (app.js:116,218,287), R=60 end labels, collision-free labels; 'Gap as drawn' replaced by M.apparentGapPct (model.js:30) used in stat card, announcement, notebook and a1-desc; apparentGapPx kept only as test helper; a1-min max=70 and setAxis clamps
- ✔ R1-SC-2 resolved — data.js buildWeeks now uses log-linear responses exp(5.0+0.10*(t-14)+N(0,0.25)) tubs (data.js:92) and exp(2.2+0.09*(t-14)+N(0,0.30)) visits (data.js:93), no Math.max floor; new test 'no week is floored to zero' passes (16/16); data/*.json regenerated
- ✔ R1-SC-3 resolved — populationSummary().pctLateAtDoor (57.4) feeds a2 feedback (model.js:59, app.js:270); static hint now 'about 25%' (index.html:178); r defined on Correlation screen before any statistic (index.html:194); EDUCATOR_GUIDE prerequisite and walkthrough updated
- raised: R2-ED-1, R2-ED-2, R2-LA-1, R2-LA-2, R2-SC-1

### Round 3
- ✔ R2-ED-1 resolved — index.html:106 hint rewritten: names the first three tiles as data properties and the 'gap as drawn' fourth tile as deliberately a picture property (1.8-point gap vs chosen axis); no longer states the false universal
- ✔ R2-ED-2 resolved — app.js:202-206 'Too relaxed.' branch now computes tallest from state.a1.rangesSeen (the ranges the learner actually tried) and quotes fmt(tallest) and the real ratio, plus the 1.8-point gap value; no hard-coded 25x
- ✔ R2-LA-1 resolved — all three .table-wrap regions now have tabindex=0 role=region aria-label (index.html:88,164,210); styles.css:148-151 adds .table-wrap:focus-visible ring and hides a2 table columns 5 and 7 below 640px so it fits at 360; app.js:243 sets wrap.hidden when no draws
- ✔ R2-LA-2 resolved — app.js:186-188 sets tabindex=-1 on the reflection h3, focuses it and announces the new question; app.js:268 focuses #a2-draw on the Draw first exit; app.js:330 focuses #a3-strat on the Look inside the seasons first exit
- ✔ R2-SC-1 resolved — committed 172d671 and pushed to origin/main (076beef..172d671); GitHub Pages rebuilt at commit 172d671 (build 1218157491, status built); verified live: data.js serves Math.exp(5.0 log-linear, index.html serves 'about 25%' and the new hint; docs/screenshots/*.png replaced with round-3 captures so TEST_REPORT evidence matches the shipped build
- raised: R3-ED-1, R3-ED-2, R3-LA-1, R3-LA-2

### Round 4
- ✔ R3-ED-1 resolved — The educator guide's sampling paragraph quotes ranges the bundled data do not support: at n = 10 convenience draws scatter from about 10–90% late-library (not 'roughly 55–68%') and can sit above the population mean, so 'their mean sleep sits about 0.4–0.65 h low regardless of size' is false as written for sizes the learner is offered.
- ✔ R3-ED-2 resolved — The case-file wording check flags the lesson's own cautious phrasing as over-claiming: 'never'/'always' and any 'proves' match even inside negated statements, so a learner who writes 'correlation never proves a cause' — the exact habit the lesson teaches — is told their wording claims too much.
- ✔ R3-LA-1 resolved — The boundary that identifies an unselected chip (and an unselected header step pill) is below WCAG 2.2 1.4.11's 3:1, so the controls the learner must operate in activities 1 and 2 are not reliably identifiable.
- ✔ R3-LA-2 resolved — 'Reset everything' erases the notebook and every answer with a single tap, no confirmation and no undo, and it is the button directly beneath the primary CTA on the start screen.
- raised: R4-SC-1

## Keep list (what critics said works — untouched)

- [stats-educator, R1] The 'It depends' reflection feedback at app.js:175 — 'A zoomed axis is a tool, not a lie. Doctors zoom in on a temperature chart because a 1 °C change matters… read the axis numbers, then ask how big the change is in real terms' — and the 'Too strict' counter-example at app.js:178. This is exactly the nuance GAISE asks for and most lessons get wrong.
- [stats-educator, R1] The three teal-bordered invariant statistic cards in Activity 1 (72.5 / 71.4 / 1.8 points) sitting beside one un-bordered card that moves — the visual argument that the data are fixed and only the picture changes.
- [stats-educator, R1] Honest handling of prose: index.html:222-230 self-review checklist plus exemplar, and the sentence at app.js:349 'This review checks structure and wording only; it does not judge whether your reasoning is right — that is for you and your teacher to discuss.'
- [stats-educator, R1] Deterministic sampling keyed by (method, n, drawIndex) in model.js:54-62 with the reproducibility and bias-at-n=500 tests in tests/model.test.mjs — a learner and a teacher on different devices see the same draw #1.
- [stats-educator, R1] The 'Next practice' closing copy at index.html:283: 'a chart can pass all three and still be wrong — and fail one and still be honest. Scrutiny, not blanket distrust.'
- [learner-advocate, R1] The three-way reflection question 'So is the zoomed chart dishonest?' (index.html:110-120) with its two specific counter-examples in app.js:174-181 — the hospital temperature chart for 'Too strict' and the computed 25× taller gap for 'Too relaxed' — teaches the non-zero-axis nuance honestly instead of the usual 'always start at zero'.
- [learner-advocate, R1] Feedback labels and voice: 'Not yet — have another look.', 'The other way round.', 'Check the table.', 'Almost.', 'That's the expert view.' — no scores, no attempt counters, no timers, unlimited retry; a 15-year-old is corrected without being shamed.
- [learner-advocate, R1] Focus management in go() (app.js:88-91): after every navigation focus lands on the new screen's h2 (tabindex=-1) and the page scrolls to top, with the skip link first in tab order and a body-level visually-hidden role=status announcer (app.js:64-66) reporting every state change ('Axis now 70 to 74…', 'Activity 1 complete. Next: Sampling is now available.').
- [learner-advocate, R1] The case-file review's honesty (model.js:95-105, app.js:349): it checks structure, evidence words and over-claiming words ('proves', 'definitely', 'never') and states plainly 'This review checks structure and wording only; it does not judge whether your reasoning is right — that is for you and your teacher to discuss.'
- [learner-advocate, R1] Start-screen privacy copy (index.html:52-53): 'stays in this browser only (nothing is sent anywhere). Use Reset at any time to wipe it' plus 'Every school, town, person and dataset here is fictional' — verified live: zero non-localhost requests, localStorage key removed on Reset.
- [staff-engineer, R1] model.js and data.js attach to globalThis when window is absent (data.js:121, model.js:109) so `node --test tests/*.test.mjs` runs the exact code the browser runs — no build, no mocks, one command, 13/13 verified.
- [staff-engineer, R1] scripts/export-data.mjs regenerates data/*.json byte-identically from data.js (verified by diff after `npm run export-data`) — provenance a bounty judge can check in one command.
- [staff-engineer, R1] reviewConclusion (model.js:95-105) plus the on-screen sentence 'This review checks structure and wording only' (app.js:349): presence / evidence / over-claim feedback that never pretends to grade prose.
- [staff-engineer, R1] The 'always' counter-example (app.js:178, hospital temperature chart) and the keyed 'it depends' option (index.html:115) — teaches that a non-zero axis is not automatically deceptive, the exact nuance the definition of done demands.
- [staff-engineer, R1] TEST_REPORT only reports observed values: 13/13 tests, 56.4% / 6.89 h / 25.4% / 7.32 h reproduce exactly from the code, and every cited screenshot is byte-identical to the capture of record.
- [stats-educator, R2] The 'gap as drawn (share of the axis height)' tile: the same 1.8-point gap reported as 1.8% at 0-100 and 45% at 70-74 turns 'the picture changed' into a number the learner can watch move while every data statistic stays frozen (app.js:160, model.js:30).
- [stats-educator, R2] The experiment gates: a1 refuses to mark until two axis ranges have been tried, a2 until one draw of each method exists, a3 until the within-season toggle has been used plus a >=15-character justification (app.js:179, 268, 326-327).
- [stats-educator, R2] The sampling model: one 1,200-student population shown beside every draw, deterministic seeded draws keyed by (method, size, draw number), and the 57.4% door-pool share computed in model.js:59 so learner copy cannot drift from the sampler.
- [stats-educator, R2] The correlation stratification: r = 0.81 across the year collapsing to 0.26/0.10/0.31 within seasons, with the association explicitly kept real ('it does not, by itself, tell you the direction or existence of a cause') and a line on what evidence would support a causal claim (app.js:332).
- [stats-educator, R2] Honest free-text handling: the a3 self-review checklist with exemplar and the case-file review that checks structure, evidence words and over-claiming while saying plainly it does not judge whether the reasoning is right (index.html:223-231, app.js:380).
- [learner-advocate, R2] The chart rendering system: viewBox set to the measured width (app.js:53, 116-117) so 1 SVG unit = 1 CSS px and the authored 14–16 px text is the real size at every viewport, with collision-pushed end labels, a title band and a legend (app.js:129-148, styles.css:126-138) — verified in shot-a1-framing-mobile/tablet/desktop.
- [learner-advocate, R2] The two-colour authored focus ring with documented ratios (styles.css:21, 50-52): navy-deep outline + white halo on light surfaces, white outline + navy-deep halo inside .top, with the numbers in TEST_REPORT.md:75 — the exact pattern GOV.UK uses.
- [learner-advocate, R2] Feedback that names the misconception in the learner's own numbers and never shames: 'The zoomed view didn't invent a difference; it magnified a real, small one' (app.js:184), 'A bigger convenience sample just estimates that group more precisely' (app.js:270), and 'there's no limit' on retries (app.js:191).
- [learner-advocate, R2] The experiment gates that make each activity real: two axis ranges before the A1 check (app.js:179), both sample methods drawn before the A2 answer (app.js:266-268), the within-season view before the A3 answer (app.js:326) plus the ≥15-character justification (app.js:327) and finish gated on answered && headlineSaved (app.js:395).
- [learner-advocate, R2] The accessibility foundation: skip link first in tab order (index.html:20), header/nav/main/footer landmarks, a body-level role=status announcer for every state change (app.js:67-69, 173, 258, 319), and prefers-reduced-motion switching off all animation and transition (styles.css:186).
- [staff-engineer, R2] model.js: the answer keys and review rules are pure, exported and tested — evaluateFramingChecks, SAMPLING_ANSWER, CORRELATION_ANSWER, evaluateHeadline, reviewConclusion — and copy-critical numbers are computed from the data (apparentGapPct, pctLateAtDoor 57.4), so learner text cannot drift from the code.
- [staff-engineer, R2] data.js: the seeded Mulberry32/Box–Muller generator with documented seeds (20260914, 3141) and log-linear formulas; the JSON exports match a fresh run and the suite proves draws are reproducible for identical (method, size, drawIndex).
- [staff-engineer, R2] app.js:149-160 — the 'Gap as drawn (share of the axis height)' stat: one viewport-independent number that moves while 72.5 / 71.4 / 1.8 points stay frozen; exactly what Activity 1 must teach.
- [staff-engineer, R2] app.js:116 and 139-148 — the Activity 1 chart geometry: T=40 title band, end labels pushed apart, legend built from F.series, staggered abbreviated term labels on phones; legible and collision-free at all three captured widths.
- [staff-engineer, R2] app.js:179, 266, 326-327 — the refusal gates: no grading before the learner has run the experiment (two axis ranges, one draw of each method, the within-season switch) and focus moved to the justification box when it is too short; real guided practice, not a quiz.
- [stats-educator, R3] The a1 statistics box: three invariant tiles (means, final-term difference) plus the deliberately dynamic 'gap as drawn (share of the axis height)' tile — the picture/data distinction is manipulable, numbered, and correctly named by the hint.
- [stats-educator, R3] The a1 reflect step: a three-way choice whose accepted answer is 'it depends', with a hospital-temperature counter-example for 'always' and a computed counter for 'never' — scrutiny taught, not blanket distrust.
- [stats-educator, R3] The a2 design: population truths shown up front, a dashed population line on the chart, and a table whose 'vs population' columns make bias visible — gated so the question cannot be answered until one sample of each method exists.
- [stats-educator, R3] The a3 investigation sequence: r defined before the first statistic appears, season colouring → within-season r, and a check that refuses the keyed answer until the learner has seen the within-season values.
- [stats-educator, R3] The headline builder (≥2 tricks + caption naming them) and the next-practice box ('a chart can pass all three and still be wrong — and fail one and still be honest. Scrutiny, not blanket distrust.') — genuine transfer tasks.
- [learner-advocate, R3] The feedback contract in every activity: a wrong answer names the specific misconception in plain words and invites another try with no penalty, never shaming (app.js:279-284, 342-346, 203-209).
- [learner-advocate, R3] Every chart is an authored accessible object — figcaption plus a live visually-hidden description used as the SVG's accessible name, plus a real data table behind a labelled toggle (index.html:67-90, 159-164, 196-210; app.js:152, 247, 315).
- [learner-advocate, R3] The two-colour authored focus ring (navy on paper, white on the navy header) via :focus-visible, including .table-wrap:focus-visible on the sideways-scrolling data regions (styles.css:51-52, 149).
- [learner-advocate, R3] The A1 axis interaction is a real experiment: the sliders are clamped so no data point can ever leave the plot, and 'Gap as drawn' is the only number that moves (app.js:117-162; model.js AXIS_MIN_MAX / AXIS_MAX_MIN).
- [learner-advocate, R3] Motion is a blanket kill switch under prefers-reduced-motion and in static mode, with no autoplay audio and no forced animation anywhere (styles.css:188-189).
- [staff-engineer, R3] Seeded generator with published seeds (20260914 / 3141), a design-intent data dictionary and an export script — reproducible synthetic data at a level most published teaching datasets never reach.
- [staff-engineer, R3] Experiment gates: every check refuses to grade until the experiment has been run ('Run the experiment first.', 'Draw first, then decide.', 'Look inside the seasons first.') — app.js:180, 275, 333.
- [staff-engineer, R3] Misconception-naming wrong-answer branches ('The other way round.', 'Too strict.' / 'Too relaxed.', 'That reads cause into a correlation.') instead of generic right/wrong.
- [staff-engineer, R3] Evidence integrity now holds: docs/screenshots are byte-identical to the round-3 captures and the live Pages files text-match the archive (verified this round).
- [staff-engineer, R3] Authored control layer: min-height 44 px on every interactive control, two-colour :focus-visible rings, aria-live feedback regions, per-chart data tables, and a prefers-reduced-motion kill-switch — styles.css:51-52, 87, 111, 188; index.html:88, 164, 210.
- [stats-educator, R4] Activity 1's statistics box: three statistics that provably never move (means 72.5 / 71.4, final difference 1.8 points) beside the single number that does ('gap as drawn', 1.8 % → 45 % of axis height), with the axis controls hard-clamped (model.js AXIS_MIN_MAX / AXIS_MAX_MIN) so no data point can leave the chart.
- [stats-educator, R4] The three misconception-specific wrong-answer branches: A1's 'any non-zero axis is deceptive' gets the hospital temperature chart; A2's 'bigger samples are noisier' gets corrected with the learner's own random draws; A3's 'just noise' is told the association is real but unexplained.
- [stats-educator, R4] A3's correct-answer feedback: affirms the association is real (r = 0.81), shows the within-season collapse (0.26 / 0.10 / 0.31), then states what evidence would support a cause — nuance without nihilism.
- [stats-educator, R4] The case-file review's honesty: it checks structure and wording only and says so in the feedback, and its evidence nudge quotes a concrete example ('within each season r fell to about 0.2') rather than pretending to grade prose.
- [stats-educator, R4] The educator guide's limitations section: synthetic data disclosed, population-known-because-generated explained, residual within-season correlations (14–20 weeks per season) flagged as a stretch discussion, and 'not evaluated for learning gains' stated plainly.
- [learner-advocate, R4] The authored two-colour focus system (styles.css:50-51): 3px navy outline plus white halo (13.3:1 on paper, 15.3:1 on white) inverting to white-on-navy inside the dark header — visible on every control at every viewport, with a matching authored ring on the scrollable table regions (styles.css:148).
- [learner-advocate, R4] The three experiment gates that refuse to grade until the learner has manipulated something: 'Run the experiment first.' (app.js:191), 'Draw first, then decide.' (app.js:288), 'Look inside the seasons first.' (app.js:346).
- [learner-advocate, R4] Feedback that names the misconception instead of right/wrong — 'Bigger samples are less noisy… The convenience sample's problem isn't noise, it's who gets picked.' (app.js:294) and 'The zoomed view didn't invent a difference; it magnified a real, small one.' (app.js:196).
- [learner-advocate, R4] The chart package on all three charts: role=img with aria-labelledby caption and description, axis titles with units, text legends, and a labelled scrollable data table (index.html:67-72, index.html:159-161, index.html:196-210; tables built at app.js:174-177, app.js:262-267, app.js:330-333).
- [learner-advocate, R4] The no-pressure stance at ladder level: 'nothing is scored against you' (index.html:52), 'Not yet — have another look.' / 'Almost.' feedback labels, unlimited retry, no attempt counter and no timer anywhere in the lesson.
- [staff-engineer, R4] Seeded generators as the single source of truth — mulberry32 + Box-Muller with documented seeds (data.js:9-25, 46-59, 85-99; seeds 20260914 and 3141), with every displayed number recomputed by pure model.js functions; I re-ran it and 1.8%/45%, 56.4% vs 25.2% and r 0.81 to 0.26/0.10/0.31 all match the copy and TEST_REPORT exactly.
- [staff-engineer, R4] The honest answer keys and nuance copy — FRAMING_CHANGED/FRAMING_SAME (model.js:40-41), SAMPLING_ANSWER = 'bias' (model.js:74), CORRELATION_ANSWER = 'third' (model.js:95), with feedback that says a non-zero axis is not automatically deceptive (app.js:214), a bigger biased sample measures the wrong group more precisely (app.js:290), and association alone shows neither cause (app.js:352).
- [staff-engineer, R4] The framing metric that cannot lie — 'gap as drawn (share of the axis height)' (model.js:30-32) plus axis limits that provably cannot clamp a data point (AXIS_MIN_MAX/AXIS_MAX_MIN, model.js:39, asserted in tests/model.test.mjs:21-24).
- [staff-engineer, R4] Honest handling of free text — reviewConclusion checks presence, evidence words and over-claiming and states it does not judge reasoning (model.js:106-119, index.html:278), and the A3 justification is required before the keyed answer is accepted (app.js:347-350).
- [staff-engineer, R4] State handling that survives real use — localStorage load with corrupt-JSON fallback (app.js:21-29), two-click confirm reset with no reload (app.js:107-119), ?screen= URL routing (app.js:83), and notebook entries keyed by id so re-checking never duplicates them (app.js:70-72).

## Decisions

Every "you decide" call and every conflict resolution, one bullet each: what was decided, why, what lost.

## How to run

```
# serve locally (no install, no build step)
npm start                 # → http://localhost:5178

# run the automated suite (Node built-in test runner, zero dependencies)
npm test                  # 16/16 pass

# regenerate data/*.json from data.js (byte-identical provenance check)
npm run export-data

# verify the live GitHub Pages build matches this archive
npm run verify-deploy

# capture evidence screenshots (Critic Loop toolkit)
node "C:\Users\Patanakiat\AI\Critic Loop\tools\capture.mjs" --project "C:/Users/Patanakiat/AI/EA/agent-economy/work/edu/data-detective"
```

Requires Node ≥ 20. No dependencies to install. Plain HTML/CSS/JS; any static server works (`python -m http.server` also documented in README.md).

Final screenshots: `C:\Users\Patanakiat\AI\EA\agent-economy\work\edu\data-detective\.critic\round-4`

## Known limitations

**Resolved after the loop (not re-judged):** deploy parity (R4-SC-1) — committed `a1a62e3`, Pages rebuilt, `npm run verify-deploy` passes.

**Open non-blocking items, in the order a round 5 would attack them:**

1. **Interaction depth** — all three critics converged here. Activity 2 plots one dot per button press against a dashed population line, so bias-vs-variance is read off a table rather than witnessed; a single control that draws hundreds of samples and lets the learner watch the random cloud tighten while the biased cloud stays put would carry the idea by itself (Seeing Theory's Sampling Distributions chapter). Activity 3's common cause is a toggle plus numbers, not a manipulable model. Activity 1's axis change is before/after rather than a continuous transformation. This is the gap between 8 and the 10 rung, and it is an interaction-design project, not a fix.
2. **Notebook placement** — at 360px and 768px the evidence notebook sits below a ~3,000px card; a sticky jump link with a note count was proposed but not applied.
3. **Disabled Next buttons** explain nothing — a learner who taps a greyed 'Finish: Case file' gets no response and no next action; visible unlock reasons were proposed.
4. **Notebook clear is still one tap** — 'Clear notebook' has no confirm-in-place pattern, unlike Reset.
5. **Chart tables start hidden** in learner mode (toggles are labelled and keyboard-operable, but the alternative is not visible on first look).
6. **Interaction test driver is not archived** — TEST_REPORT §2–4 claims (tab order, computed focus styles, 44px scan, reload restore) come from ad-hoc Playwright runs that are not in the repo; committing `scripts/verify-ui.mjs` would make them reproducible.
7. **Contrast table arithmetic** — one pair ('white on navy #173a5e') is stated as 9.4:1 where the WCAG formula gives ~11.6:1; the pass conclusion is unaffected but the table should be re-derived by script.
8. **Colour-only series distinction in Activity 1** — Group A/B lines differ by hue alone; a dash pattern for Group B was proposed.
9. **`:focus { outline: none }` removed this round**, but no automated check enforces the focus ring against future edits.

**What the artifact does not do** (by design, per the bounty brief): no backend, no accounts, no analytics, no runtime network requests, no generative-AI grading, no claims of validated learning gains.

---
_Generated by Critic Loop v3 · 2026-09-16T03:02:42.465Z · state: budget @ round 4_
