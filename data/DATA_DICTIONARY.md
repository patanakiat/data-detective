# Data dictionary and provenance

**Everything in this folder is synthetic and fictional.** No real school, town, student, clinic or kiosk is described. The datasets were generated for this lesson by the deterministic code in `data.js` (seeded pseudo-random numbers, so every learner and every test sees identical values). The JSON files here are exports for inspection; the lesson reads `data.js` directly. Regenerate with `npm run export-data`.

## How the data were constructed

| Dataset | Generator | Seed | Design intent |
|---|---|---|---|
| `framing.json` | hand-authored constants in `data.js` (`framing`) | — | Two groups' term scores that differ by a small, honest amount (1.8 points by the final term) so the same numbers can look dramatic or flat depending on the vertical axis. |
| `population.json` | `buildPopulation()` — Mulberry32 PRNG + Box–Muller normal draws | `20260914` | 1,200 students. Each is a late-library user with probability 0.22 (realised share 25.2%). Sleep is drawn from a normal distribution with mean 6.4 h for late-library users and 7.6 h for others (sd 0.9), clamped to 3.5–10.5 h and rounded to 0.1 h. The sleep gap is what makes the convenience sample biased. |
| `weeks.json` | `buildWeeks()` — Mulberry32 + Box–Muller | `3141` | 52 weeks. Temperature follows a sine year (14 °C ± 9) plus noise (sd 2.2). Ice-cream tubs = 120 + 38·(temp − 14) + noise (sd 90); sunburn visits = 9 + 1.7·(temp − 14) + noise (sd 6); both floored at 0. Temperature is the common cause; season is derived from temperature. |

Sampling methods (`data.js` → `samplers`): **convenience** keeps every late-library student plus each other student with probability 1/4 (people leaving the library at 21:00 are mostly late-library users; the pool is about 525 students), then shuffles and takes *n*; **random** shuffles the whole register and takes *n*. Both are seeded from (method, size, draw index) in `model.js` → `drawSample`, so draw #1 of a random sample of 50 is always the same students.

## Fields

### framing.json
| Field | Type | Unit | Meaning |
|---|---|---|---|
| `terms[]` | string | — | Six school-term labels in one academic year |
| `series[].name` | string | — | Teaching group label (fictional) |
| `series[].values[]` | number | score out of 100 | Mean maths score for the group in that term |

### population.json → `students[]`
| Field | Type | Unit | Meaning |
|---|---|---|---|
| `id` | integer | — | Student ID, 1–1200 |
| `year` | integer | year group | 10–13 |
| `lateLibrary` | boolean | — | true if the student uses the library after 20:00 on school nights |
| `sleepHours` | number | hours (0.1) | Self-reported sleep on a school night |
| `commuteMin` | integer | minutes | Commute time — a distractor variable not used in the lesson |

### weeks.json → `weeks[]`
| Field | Type | Unit | Meaning |
|---|---|---|---|
| `week` | integer | — | Week number 1–52 of one fictional year |
| `tempC` | number | °C (0.1) | Mean weekly air temperature |
| `iceCreamTubs` | integer | tubs | Ice-cream tubs sold by the seafront kiosk that week |
| `sunburnVisits` | integer | visits | Sunburn-related visits to the town clinic that week |
| `season` | string | — | Derived from `tempC`: `warm` ≥ 20, `mild` 12–19.9, `cool` < 12 |

## Summary statistics shown in the lesson (computed by `model.js`, verified by `tests/`)

- Framing: Group A mean 72.5, Group B mean 71.4, final-term difference 1.8 points; the drawn gap is 4.7 px on a 0–100 axis and 117 px on a 70–74 axis (260 px plot).
- Population: mean sleep 7.30 h; 25.2% late-library; late-library mean 6.34 h vs 7.62 h for others.
- Correlation: r = 0.82 across 52 weeks; within seasons r = −0.01 (cool, 20 weeks), 0.23 (mild, 18), 0.26 (warm, 14); temperature correlates 0.90 with ice cream and 0.88 with sunburn.

These numbers are illustrations of statistical ideas. They must not be read as findings about real schools, sleep, ice cream or sunburn.
