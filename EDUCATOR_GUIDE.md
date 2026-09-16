# Educator guide — Data Detective: Can You Trust This Claim?

**Audience:** learners around age 15 (UK Year 10–11, US grade 9–10), allowing for individual differences. **Session:** one focused 10–15 minute investigation, with optional deeper exploration (the data tables and the headline builder). **Format:** self-paced, individual or paired, phone/tablet/laptop, no accounts.

## Learning objectives

By the end, a learner can:

1. Explain how the choice of vertical-axis range changes the *perceived* size of an effect while every statistic stays identical — and judge when zooming is legitimate (labelled scale, meaningful change) rather than deceptive.
2. Identify a sampling limitation: describe how a convenience sample over-represents one group, and explain why a larger biased sample does not remove the bias.
3. Distinguish correlation from causal evidence: use stratification by a third variable (temperature/season) to show that an association can be produced by a common cause, and state what evidence *would* support a causal claim.
4. Assemble a cautious, evidence-based conclusion in the form *claim → supporting observation → limitation*, avoiding over-claiming language.

The through-line is **scrutiny, not blanket distrust**: the lesson explicitly teaches that a non-zero axis can be fine, that a real association is still real after you reject the causal story, and that a conclusion should claim only what the evidence supports.

## Prerequisites

- Reading a line graph and a scatter plot; knowing what a mean is.
- Helpful but not required: having met the words *sample*, *population*, *correlation*. Each is defined in context on first use.
- No prior knowledge of the Pearson coefficient is assumed; *r* is defined on the Correlation screen, before the first statistic appears, as "how tightly two things move together in a straight line … from −1 to 1", with the reminder that it says how strong a link is, never why it exists.

## Walkthrough (what the learner does, what they should notice)

**Start (1 min).** Framing story, plan of the three checks, the evidence notebook, the privacy statement (nothing leaves the device), Reset.

**1 · Graph framing (3–4 min).** Two fictional teaching groups' maths scores over six terms (a legend names the two lines). The learner changes the vertical axis with presets or sliders; the axis controls cannot push any data point off the chart. A statistics box shows the means, the final-term difference (1.8 points) and the *gap as drawn, as a share of the axis height* (1.8 % at 0–100, 45 % at 70–74); only the last one moves. The check button refuses to mark an answer until at least two axis ranges have been tried. The learner ticks what changed; feedback names any confusion between the picture and the data. A follow-up asks whether the zoomed chart is dishonest; the accepted answer is "it depends — labelled scale, meaningful change", and both extremes get specific counter-examples (a hospital temperature chart; the gap's share of the axis height at their widest zoom, up to 25× taller at 70–74).

**2 · Sampling (4–5 min).** A fictional college of 1,200 students; the population's true values are shown because we generated it. The learner designs samples — convenience (leaving the library at 21:00) or simple random (by ID) — at sizes 10/50/200/500, draws repeatedly, and compares each draw with the population line. The question cannot be answered until at least one sample of each method has been drawn. The table makes the mechanism visible: convenience draws land near the library-door share of 57.4% late-library users (against the true 25.2%) with a mean sleep about 0.4 h below the population's 7.30 h at every size — 300 seeded draws at n = 500 run roughly 53–63% late-library and 0.30–0.49 h low, while n = 10 draws scatter widely (about 10–90% late-library; means from about 0.8 h above to 1.3 h below the truth). The shortfall does not shrink as n grows; random draws wobble at n = 10 and converge by n = 500. The question "why doesn't a bigger convenience sample fix it?" has the bias answer keyed; the noise answer and the "500 is plenty" answer each get a pointed correction.

**3 · Correlation (4–5 min).** *r* is defined in one short paragraph before any statistic appears. 52 fictional weeks of ice-cream sales and sunburn clinic visits (r = 0.81). The learner colours points by season, then shows the correlation within each season (0.26 cool, 0.10 mild, 0.31 warm); the check button asks for this step first. Four conclusions of similar length are offered; the keyed one says warm weeks push both up and the association by itself shows neither causes the other. A written justification (at least a short sentence) is required before the keyed answer is accepted, with a self-review checklist and an exemplar; the justification is copied into the case file. Then the **headline builder**: choose at least two of the three problems and write a fictional misleading headline plus a caption naming the tricks — naming the technique is the transfer task.

**Case file (2 min).** Everything recorded, plus the conclusion form: claim, one supporting observation, one limitation. Feedback checks structure, whether the observation cites evidence (a number, *r*, a season, a sample), and over-claiming words ("proves", "definitely"). It states plainly that it does not judge whether the reasoning is right. Ends with a next-practice suggestion (three questions to ask of any chart in this week's news).

## Differentiation and co-play

- **Support:** every activity has a *Hint* button and unlimited retries; the data tables give a non-chart route; the exemplar justification can be discussed before writing.
- **Stretch:** ask learners to find the axis range at which the gap "looks fair"; to predict the % late-library before drawing a convenience sample of 500; to propose a *fourth* variable that could confound ice cream and sunburn (e.g. school holidays, tourist numbers) and how they would test it.
- **Pairs:** one learner drives, one keeps the notebook; swap between activities. The headline builder works well as a pair task, then swap headlines and diagnose each other's tricks.
- **Whole class:** project a learner's misleading headline and vote on which checks it fails.
- **Adaptations:** works with keyboard only, with screen readers (feedback is announced; charts have tables), and with reduced motion. Text is set in Atkinson Hyperlegible for readability. Reading burden is kept to short paragraphs; the lead sentences carry the idea.

## Content sources and what each supports

- **GAISE II — Guidelines for Assessment and Instruction in Statistics Education, Pre-K–12 Report** (American Statistical Association, 2020). https://www.amstat.org/education/guidelines-for-assessment-and-instruction-in-statistics-education-(gaise)-reports — supports the investigative cycle used here (question → data → analysis → interpretation), the emphasis on sampling design and on distinguishing association from causation at Level B/C, and the stance of scrutiny rather than distrust.
- **Calling Bullshit: Data Reasoning in a Digital World** (Bergstrom & West, University of Washington course). https://www.callingbullshit.org/ — supports the graph-framing unit (misleading axes and "the axis need not start at zero — ask what change is meaningful") and the correlation unit (common-cause explanations, what would count as causal evidence).
- **Seeing Theory** (Brown University) — https://seeing-theory.brown.edu/ — an interaction model reference for manipulable statistics; informed the decision that every activity changes a visible state.

**What is not claimed:** this lesson has not been evaluated for learning gains, is not diagnostic, and is not asserted to suit every 15-year-old. It was checked in adult walkthroughs and simulated learner journeys only (see TEST_REPORT.md).

## Model and data limitations (say these out loud)

- All data are synthetic (see `data/DATA_DICTIONARY.md`). The sleep, library, ice-cream and sunburn numbers illustrate statistical ideas and say nothing about the real world.
- The "population" is known only because we generated it; in real research you never see it — that is the point of the sampling unit.
- Within-season correlations (0.26, 0.10, 0.31) are much weaker than the year-round 0.81 but not zero, because temperature still varies inside a season and each season has only 14–20 weeks; a sharper analysis would stratify by temperature bands or model temperature directly. This is a good stretch discussion.
- The framing example uses a 100-point scale; whether 1.8 points "matters" is a judgement about context, which is exactly the habit being taught.

## Offline follow-up

**Chart clippings.** Each learner brings one chart from a newspaper, website or social feed. In pairs they annotate it with the three questions — *Where does the axis start and is it labelled? Who was in the sample and how were they chosen? Could a third thing explain the link?* — and decide whether each answer makes the chart misleading, careless, or fine. Finish by writing the honest headline the chart *should* have had.
