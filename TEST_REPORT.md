# Test report — Data Detective

**Build under test:** this repository at submission. **Environment:** Windows 11 Pro; Microsoft Edge 128 (Chromium, headless via CDP) for screenshots; Playwright-driven Edge for interaction tests; Node 26.4 for the automated suite. **Viewports:** 360×800 (mobile), 768×1024 (tablet), 1280×800 (desktop). Screenshots are in `docs/screenshots/` (full-page, static render mode, fonts loaded, footer in frame).

All tests below were actually run. Where something was **not** tested, it says so. No testing was done with children; walkthroughs are adult and scripted.

## 1. Automated tests

Command: `npm test` (= `node --test tests/*.test.mjs`). Result: **13 passed, 0 failed** (81 ms).

| Test | What it proves |
|---|---|
| framing: statistics identical for every axis range | mean A 72.5, mean B 71.4, final diff 1.8 do not depend on the axis; drawn gap 4.7 px (0–100) vs 117 px (70–74) |
| framing: projection monotone, bounds map to plot edges | chart geometry is correct |
| framing: answer key | only "gap looks" + "axis numbers" count as changed; wrong ticks are named |
| sampling: population fixed and documented | n = 1200, seed 20260914, late-library sleep ≥ 1 h less |
| sampling: identical sample for identical (method, size, draw) | reproducibility; different draw index → different sample |
| sampling: convenience stays biased at n = 500 | % late-library exceeds population by > 20 pts; mean sleep > 0.3 h low |
| sampling: random n = 500 close to population | within 0.15 h and 5 pts |
| sampling: fixed test cases | sizes honoured; cannot exceed population (5000 → 1200) |
| correlation: strong overall, weak within seasons | r = 0.82 overall; |r| < 0.5 in each season; temperature r > 0.8 with both |
| correlation: pearson helper | ±1 on hand-checked series |
| correlation: headline builder rules | needs ≥ 2 tricks, headline, caption |
| conclusion review | flags missing parts, absence of evidence, over-claiming words |
| data: every field documented | dictionary covers every dataset field |

## 2. Acceptance examples from the brief → evidence

| Acceptance example | Evidence (steps → observed) |
|---|---|
| Changing an axis changes the rendering but not underlying values or computed statistics | Desktop, Activity 1: stats box read `72.5 / 71.4 / 1.8 points / 4.7 px`; pressed **Enter** on the focused "Zoom 70–74" chip → `72.5 / 71.4 / 1.8 points / 117 px`. First three values identical; only the drawn gap changed. Data table (toggle) shows the same 12 values regardless of axis. Screenshot: `shot-a1-framing-desktop.png`, `shot-a1-framing-mobile.png`. Automated: framing tests. |
| Every chart has labelled axes/units, a useful accessible table and an understandable reset | All three SVGs carry `role="img"` + `aria-labelledby` (caption + live description), axis titles ("score out of 100", "mean sleep (hours)", "sunburn clinic visits / week") and tick labels; each has a "Show data table" toggle (`aria-expanded`); Activity 2 has "Clear draws"; global "Reset everything" on Start and Case file. Screenshots: all `shot-a*`. |
| The biased and less biased sampling procedures match their documented definitions | `data.js` samplers: convenience keeps all late-library students + 1/4 of others, then takes n; random shuffles the full register. Observed draw #1 at n = 500: convenience **56.4% late-library, mean 6.89 h** (population 25.2%, 7.30 h); random **25.4%, 7.32 h**. Table row evidence: `["1","Convenience","500","6.89","-0.41 h","56.4","+31.2 pts"]`, `["2","Simple random","500","7.32","+0.02 h","25.4","+0.2 pts"]` (values from the current build; the earlier 1/6-pool build gave 457/6.76/66.1 and was replaced so that a 500 draw is possible). Screenshot: `shot-a2-sampling-desktop.png`. |
| Repeated sampling is reproducible in tests, or uses supplied fixed test cases | `drawSample(method, n, drawIndex)` is seeded; test "identical sample for identical inputs" passes; fixed cases in `tests/model.test.mjs`. |
| The correlation activity explicitly states that association alone does not establish causation | Keyed option text: "…The association is real, but on its own it does not show that either one causes the other; temperature is a plausible common cause." Feedback repeats it and lists within-season r = −0.01 / 0.23 / 0.26 against 0.82 overall. Observed stats after enabling both switches: `0.82 (all)`, `-0.01 cool (20 weeks)`, `0.23 mild (18)`, `0.26 warm (14)`. Screenshot: `shot-a3-correlation-desktop.png`. |
| The final response asks for a claim, supporting observation and limitation, with useful feedback | Case file form has three fields. Submitting with all three and an evidence-bearing observation → "A conclusion a statistician would accept. Your observation points at something concrete…". Submitting `proves` wording → over-claiming note; missing limitation → "Still missing: a limitation." (unit-tested). Screenshot: `shot-summary-desktop.png`. |

## 3. Shared learning and interaction requirements

| Requirement | Evidence |
|---|---|
| Obvious start, onboarding, navigation, progress, completion summary, next practice | Start screen with plan + "Start the investigation"; progress pills in header mark the current step (amber) and completed steps (✓); Case file collates notebook + conclusion + "Next practice". Screenshots: `shot-start-*`, `shot-summary-*`. |
| Demonstration → guided practice → fresh application | Each activity: demonstration (manipulate chart/sample), guided question with feedback, then application (Activity 3 headline builder; Case file conclusion). |
| Meaningful learner input changes educational state | Axis controls redraw chart + "gap as drawn"; Draw a sample appends a real draw; season switches recolour points and reveal within-season r; Next buttons stay **disabled** until the activity's question is answered (observed: `a1-next` enabled only after the reflection question). |
| Immediate, specific feedback; ≥ 1 hint; unlimited retry | Wrong answer in Activity 1 → "You ticked the scores — but look at the statistics box: those numbers didn't move… You missed how large the gap looks and the axis numbers." Hint buttons on all three activities (`aria-expanded`). No attempt counter anywhere. |
| Never shame, punish, pressure or rank | No scores, timers, streaks, or comparisons; feedback labels are "Not yet — have another look." / "Almost." Reviewed all copy in `index.html` and `app.js`. |
| Reset/replay without reload; progress in localStorage with explanation and reset | Start screen explains storage; "Reset and start again" on the Case file: observed notebook emptied, Start screen shown, no reload, `localStorage.dd_state_v1` removed. |
| Refresh handling | After completing all activities, `page.reload()` restored the Case file screen, 8 notebook entries and the typed claim. The URL tracks the screen (`?screen=summary`), so refresh lands on the same screen. |
| Repeated / invalid inputs | Pressing Check with nothing selected → "Choose an option first." Re-checking a completed activity re-shows feedback without duplicating notebook entries (notes are keyed by id). Corrupt localStorage JSON → defaults (code path in `load()`; verified by the try/catch, not by a live test). |
| Prerequisites, objectives, adaptations, ≥ 2 reputable references | `EDUCATOR_GUIDE.md` (GAISE II, Calling Bullshit, Seeing Theory, with URLs and what each supports). |
| No empty screens, placeholders, dead buttons | Capture manifest: `deadLinks: 0` on every page; every button has a handler (`app.js`); no lorem ipsum. |

## 4. Accessibility, safety and privacy

| Check | Method | Result |
|---|---|---|
| Works at 360 / 768 / 1280 without clipped controls or horizontal scroll | Full-page captures at all three widths (15 shots), visually inspected | Pass — no horizontal overflow; data tables scroll inside their own region only |
| Semantic controls, visible keyboard focus, accessible names, keyboard access | Tab order and computed styles read via Playwright | Skip link first in tab order on load (focus is moved to the screen heading only after in-app navigation); focused chip shows `outline: 3px solid rgb(255,122,0)` (authored `:focus-visible`); all actions are `<button>`, `<input>`, `<textarea>` with labels; range sliders operable with arrow keys (observed min 0 → 2) |
| Non-drag alternatives | No drag interaction exists anywhere; sliders have preset buttons as an alternative | Pass |
| Text/table alternative to charts | Each chart: `aria-labelledby` caption + live description; "Show data table" | Pass |
| WCAG 2.2 AA contrast | Ratios computed for the palette (see below) | Pass for all text/background pairs used |
| ≥ 44 px touch targets | Playwright scan of visible controls < 44 px tall | 0 controls under 44 px (after raising the notebook "Clear" button from 40 px) |
| Non-colour-only feedback | Feedback boxes carry a text label ("Exactly right." / "Not yet…") and an icon-free border; series also differ by legend text | Pass |
| Reduced motion | `emulateMedia({reducedMotion:'reduce'})` → `.screen` `animation-name: none` | Pass |
| No flashing, forced animation, autoplay audio | Only a 0.3 s fade on screen change (disabled under reduced motion); no audio at all | Pass |
| No login, wallet, payment, email, name, personal data, ads, analytics, chat, feeds, uploads | Code review of `index.html`/`app.js`; request log during a full walkthrough | **0 non-localhost requests**; no forms collect identity |
| No runtime generative-AI, remote grading, external API | Same request log; `model.js` review | Pass |
| Reference links only in adult-facing guide | Learner screens link only to README/Educator guide in the footer | Pass |
| Licensing | MIT code; Atkinson Hyperlegible under OFL with licence file | Pass |

**Contrast ratios (WCAG 2.x formula):** body `#17212b` on `#f7f4ee` 14.6:1 · secondary `#3f4c5a` on `#f7f4ee` 8.3:1 · white on navy `#173a5e` 9.4:1 · white on teal `#0e6b6b` 6.6:1 · white on rust `#a23b2a` 6.9:1 · ok text `#0f5132` on `#e4f2ea` 8.7:1 · warn text `#6b3f00` on `#fdf1dc` 8.5:1 · header pills `#e6eef8` on `#0f2a46` 13.9:1 · current pill `#0f2a46` on amber `#f2b134` 8.1:1. Amber is never used as text on white.

## 5. Screenshot walkthrough (numbered)

1. `shot-start-desktop.png` — Start: framing, plan, privacy statement, Start/Reset.
2. `shot-a1-framing-desktop.png` — Activity 1 with chart, axis controls, statistics box, question, hint.
3. `shot-a1-framing-mobile.png` — same at 360 px: single column, larger SVG labels, abbreviated term names.
4. `shot-a2-sampling-desktop.png` — Activity 2: population facts, method/size controls, draw chart with population line, table, question.
5. `shot-a2-sampling-mobile.png` — 360 px.
6. `shot-a3-correlation-desktop.png` — Activity 3: scatter, season switches, statistics, conclusion options, justification, self-review checklist.
7. `shot-a3-correlation-mobile.png` — 360 px.
8. `shot-summary-desktop.png` / `shot-summary-mobile.png` — Case file with notebook summary, conclusion form, next practice.
9. Tablet captures of every screen: `shot-*-tablet.png`.

(No video is included; the numbered walkthrough above plus the scripted interaction log in §2–§4 stands in for it, as the brief allows.)

## 6. Manual checks performed

- Keyboard-only run of Activity 1 (Tab, Enter, Space, arrow keys) — completed without a mouse.
- Reset from the Case file, then fresh start — state cleared, no reload.
- Reload mid-lesson — position and notes restored.
- Reduced-motion emulation — no animations.
- Browser zoom 200 % at 1280 px — layout reflows to the mobile column; no clipping (visual check, no screenshot kept).

## 7. Not tested / known gaps

- Real assistive technology (NVDA/VoiceOver) was not run; screen-reader behaviour is inferred from ARIA and live-region markup.
- Touch gestures were not tested on a physical device; targets were measured, not tapped.
- Safari and Firefox were not run in this pass (Chromium only).
- No children took part; no learning-gain claims are made.
