# Data Detective: Can You Trust This Claim?

An interactive statistics lesson for learners around age 15. In 10–15 minutes the learner runs three investigations — **graph framing**, **sampling bias**, and **correlation vs causation** — on fictional, bundled datasets, keeps an evidence notebook, writes a deliberately misleading headline, and finishes with a cautious, evidence-based conclusion.

- **Live preview:** https://patanakiat.github.io/data-detective/ (static, no login, no tracking)
- **Educator guide:** [EDUCATOR_GUIDE.md](EDUCATOR_GUIDE.md) · **Test report:** [TEST_REPORT.md](TEST_REPORT.md) · **Data:** [data/DATA_DICTIONARY.md](data/DATA_DICTIONARY.md)
- **Licence:** MIT for the code (see [LICENSE](LICENSE)); font under the SIL OFL 1.1 (see [THIRD_PARTY.md](THIRD_PARTY.md)).

## Run it locally

No build step and no dependencies. Any static file server works.

```bash
# Option A — Node ≥ 20 (bundled tiny server)
node serve.mjs 5178          # then open http://localhost:5178/

# Option B — Python 3
python -m http.server 5178   # then open http://localhost:5178/

# Option C — npm scripts (no install needed; package.json has no dependencies)
npm start                    # serves on :5178
npm test                     # runs the automated tests (node --test tests/*.test.mjs)
npm run export-data          # regenerates data/*.json from data.js
```

Opening `index.html` directly from disk also works in Chromium-based browsers and Firefox, but a server is recommended so the `fonts/` and `data/` paths behave identically to the hosted version.

## Deploy

Copy the folder to any static host. For GitHub Pages: push to a repository and enable Pages from the `main` branch root. There is nothing to compile.

## Direct links (useful for teachers)

`?screen=start` · `?screen=a1` (graph framing) · `?screen=a2` (sampling) · `?screen=a3` (correlation) · `?screen=summary` (case file). Progress is stored in the browser's `localStorage` under the key `dd_state_v1`; the **Reset everything** button clears it.

## Project layout

```
index.html        five screens + evidence notebook (semantic HTML, ARIA, skip link, landmarks)
styles.css        type system, authored focus states, responsive layout, reduced-motion and static-mode rules
data.js           seeded synthetic datasets and statistics helpers (fictional; see data/DATA_DICTIONARY.md)
model.js          pure functions: statistics, sampling, answer keys, conclusion review (no DOM) — unit-tested
app.js            rendering, SVG charts, interaction, persistence
fonts/            Atkinson Hyperlegible woff2 (self-hosted, OFL) + OFL.txt
data/             exported JSON + DATA_DICTIONARY.md
tests/            node --test suite for the model
scripts/          export-data.mjs
serve.mjs         zero-dependency static server
```

## Architecture note

- **Content vs UI:** all numbers come from `data.js` (data) and `model.js` (calculations, answer keys, review rules); `app.js` only renders and wires events. Charts and statistics read the same arrays, so they cannot disagree.
- **Activity state:** one `state` object (`screen`, `notebook[]`, per-activity progress) is saved to `localStorage` after every change and reloaded on start; corrupt or missing storage falls back to defaults. Reset rebuilds the DOM state without a page reload.
- **Scoring:** multiple-choice and checkbox tasks are keyed in `model.js`. Free-text answers are never auto-graded; the app checks only presence, mention of evidence, and over-claiming words, and says so.
- **Determinism:** sampling uses a seeded PRNG keyed by (method, size, draw number), so results are reproducible and testable.
- **Accessibility:** skip link, `header/nav/main/footer` landmarks, `:focus-visible` on every control, labels and `aria-live` feedback, keyboard access to every action (no drag anywhere), a data table behind every chart, `prefers-reduced-motion` honoured.

## Supported browsers / runtime

Tested in Microsoft Edge 128 (Chromium) headless at 360, 768 and 1280 px widths; expected to work in current Chrome, Edge, Firefox and Safari (ES2020, CSS `clamp()`, `:focus-visible`). Node 20+ for the optional server, tests and data export.

## Known limitations

- Free-text responses are stored locally and reviewed for structure only; a teacher still needs to read them.
- One fictional year of weekly data and one fictional cohort: enough to teach the ideas, not to make any claim about real ice cream, sunburn or sleep.
- Within-season correlations are small but not zero (−0.01, 0.23, 0.26); the lesson says "much weaker", not "gone".
- No audio, no offline manifest (the site is small enough to cache normally, but is not a PWA).
- The lesson has not been tested with children; the test report records adult walkthroughs and simulated learner journeys only.
