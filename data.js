/* Data Detective — synthetic datasets and the deterministic generator that builds them.
   Everything here is FICTIONAL. Names of people, places, schools and organisations are invented.
   The generator is seeded so that every learner (and every automated test) sees identical data. */

(function (global) {
  'use strict';

  // Mulberry32: small, fast, seedable PRNG (32-bit). Same seed => same sequence in every browser.
  function mulberry32(seed) {
    let a = seed >>> 0;
    return function () {
      a = (a + 0x6D2B79F5) >>> 0;
      let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  // Box–Muller normal draw from a uniform PRNG
  function normal(rng, mean, sd) {
    let u = 0, v = 0;
    while (u === 0) u = rng();
    while (v === 0) v = rng();
    return mean + sd * Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  }
  const round1 = x => Math.round(x * 10) / 10;

  /* ---------- Activity 1: graph framing ----------
     "Bramblewick Academy" (fictional) — average maths score per term for two teaching groups.
     The two series differ by a small, honest amount. The same numbers are shown with two y-axis ranges. */
  const framing = {
    title: 'Bramblewick Academy — average maths score by term (fictional)',
    unit: 'score out of 100',
    terms: ['Autumn 1', 'Autumn 2', 'Spring 1', 'Spring 2', 'Summer 1', 'Summer 2'],
    series: [
      { name: 'Group A (new timetable)', values: [71.2, 71.8, 72.4, 72.9, 73.1, 73.6] },
      { name: 'Group B (old timetable)', values: [71.0, 71.1, 71.4, 71.3, 71.7, 71.8] }
    ],
    provenance: 'Hand-authored fictional values chosen so the true difference is about 1.8 points by the final term.'
  };

  /* ---------- Activity 2: sampling ----------
     "Harrowgate College" (fictional) — population of 1,200 students.
     Attributes: hours of sleep on a school night, whether the student uses the library after 20:00,
     and year group. Sleep is lower for late-library users; that link is what makes the biased sample biased. */
  function buildPopulation(seed) {
    const rng = mulberry32(seed);
    const students = [];
    for (let i = 0; i < 1200; i++) {
      const year = 10 + Math.floor(rng() * 4);            // years 10–13
      const lateLibrary = rng() < 0.22;                   // probability 0.22; the seeded realisation is 25.2%
      const base = lateLibrary ? 6.4 : 7.6;               // late users sleep less on average
      const sleep = Math.min(10.5, Math.max(3.5, round1(normal(rng, base, 0.9))));
      const commuteMin = Math.max(0, Math.round(normal(rng, 24, 12)));
      students.push({ id: i + 1, year, lateLibrary, sleepHours: sleep, commuteMin });
    }
    return students;
  }
  const population = buildPopulation(20260914);

  // Sampling methods. Both are deterministic for a given seed.
  const samplers = {
    // Biased convenience sample: "ask students leaving the library at 21:00".
    // Late-library users are 4x more likely to be encountered than everyone else (pool ~525 students).
    convenience: function (pop, n, seed) {
      const rng = mulberry32(seed);
      const pool = pop.filter(s => s.lateLibrary || rng() < 1 / 4);
      // shuffle pool then take n
      const arr = pool.slice();
      for (let i = arr.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [arr[i], arr[j]] = [arr[j], arr[i]]; }
      return arr.slice(0, Math.min(n, arr.length));
    },
    // Less biased: simple random sample by student ID (every student equally likely).
    random: function (pop, n, seed) {
      const rng = mulberry32(seed);
      const arr = pop.slice();
      for (let i = arr.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [arr[i], arr[j]] = [arr[j], arr[i]]; }
      return arr.slice(0, Math.min(n, arr.length));
    }
  };

  /* ---------- Activity 3: correlation ----------
     "Port Lumen" (fictional seaside town) — 52 weeks of ice-cream sales and sunburn clinic visits.
     Both are driven by weekly temperature (the third variable). Season is derived from temperature. */
  function buildWeeks(seed) {
    const rng = mulberry32(seed);
    const weeks = [];
    for (let w = 1; w <= 52; w++) {
      const seasonal = 14 + 9 * Math.sin((2 * Math.PI * (w - 12)) / 52); // °C, peaks mid-summer
      const temp = round1(seasonal + normal(rng, 0, 2.2));
      // Log-linear (multiplicative) responses: counts stay positive at every temperature, so nothing is ever floored.
      const iceCream = Math.round(Math.exp(5.0 + 0.10 * (temp - 14) + normal(rng, 0, 0.25)));   // tubs sold (≈148 at 14 °C)
      const sunburn = Math.round(Math.exp(2.2 + 0.09 * (temp - 14) + normal(rng, 0, 0.30)));    // clinic visits (≈9 at 14 °C)
      const season = temp >= 20 ? 'warm' : (temp >= 12 ? 'mild' : 'cool');
      weeks.push({ week: w, tempC: temp, iceCreamTubs: iceCream, sunburnVisits: sunburn, season });
    }
    return weeks;
  }
  const weeks = buildWeeks(3141);

  /* ---------- statistics helpers (used by the app AND by the automated tests) ---------- */
  const stats = {
    mean(xs) { return xs.reduce((a, b) => a + b, 0) / xs.length; },
    sd(xs) { const m = stats.mean(xs); return Math.sqrt(xs.reduce((a, b) => a + (b - m) ** 2, 0) / (xs.length - 1)); },
    pearson(xs, ys) {
      const mx = stats.mean(xs), my = stats.mean(ys);
      let num = 0, dx = 0, dy = 0;
      for (let i = 0; i < xs.length; i++) { num += (xs[i] - mx) * (ys[i] - my); dx += (xs[i] - mx) ** 2; dy += (ys[i] - my) ** 2; }
      return num / Math.sqrt(dx * dy);
    },
    proportion(items, pred) { return items.filter(pred).length / items.length; }
  };

  const dictionary = {
    framing: { term: 'School term label (six terms in one academic year)', values: 'Mean maths score out of 100 for the group in that term' },
    population: { id: 'Student ID 1–1200', year: 'Year group 10–13', lateLibrary: 'true if the student uses the library after 20:00 on school nights', sleepHours: 'Self-reported hours of sleep on a school night, to 0.1 h', commuteMin: 'Commute minutes (not used in the lesson; included as a distractor variable)' },
    weeks: { week: 'ISO-style week number 1–52 of one fictional year', tempC: 'Mean weekly air temperature, °C', iceCreamTubs: 'Ice-cream tubs sold by the seafront kiosk that week', sunburnVisits: 'Sunburn-related visits to the town clinic that week', season: 'Derived from tempC: warm ≥ 20, mild 12–19.9, cool < 12' }
  };

  global.DD_DATA = { mulberry32, normal, framing, population, samplers, weeks, stats, dictionary,
    seeds: { population: 20260914, weeks: 3141 } };
})(typeof window !== 'undefined' ? window : globalThis);
