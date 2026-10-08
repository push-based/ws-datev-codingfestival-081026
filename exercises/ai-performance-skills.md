# AI: performance skills

In the [DevTools MCP exercise](ai-devtools-mcp.md) the agent improvised the analysis — every run, every attendee got a
different report. In this exercise a **skill** gives the agent a process: how to measure, what counts as evidence,
how to prioritise and how to verify a fix. You install public skills, read one, run the same audit again and compare
it with the solution and the agent's report from the last exercise.

You need the agent with the DevTools MCP from the previous exercise — for steps 1–3 again in the playground folder,
without access to the repo. Results still depend on the model and the reasoning effort.

Stop the dev server from the last exercise (both use port 4200) and serve the production build — closer to what users
get:

```bash
npx nx serve movies --configuration=production
```

## 1. Install the skills

[web-quality-skills](https://github.com/addyosmani/web-quality-skills) by Addy Osmani — skills for performance,
Core Web Vitals, accessibility, SEO, built on Lighthouse and the DevTools Performance Insights. You need two of them:

- `performance` — an evidence-led performance audit: measure, prioritise, fix, re-measure
- `core-web-vitals` — LCP, INP and CLS: causes and fixes per metric

```bash
npx skills add addyosmani/web-quality-skills --skill performance -g
npx skills add addyosmani/web-quality-skills --skill core-web-vitals -g
```

The CLI asks which agent(s) you use. `-g` installs globally — the skills are there in the playground folder and in the
repo (step 4). Restart your agent
(or open a new chat) and check that the skills are listed:

- Claude Code: `/skills`
- Copilot / VS Code: type `/` in the chat — `performance` and `core-web-vitals` are in the list
- other agents: ask `Which skills do you have?`

<details>
  <summary>Alternative: install as a plugin</summary>

**Claude Code**:

```
/plugin marketplace add addyosmani/web-quality-skills
/plugin install web-quality-skills@addy-web-quality-skills
```

Restart, check with `/skills`. The skills are namespaced: `web-quality-skills:performance`.

Codex, Gemini CLI, …: see the [README](https://github.com/addyosmani/web-quality-skills#installation).

</details>

## 2. What is in a skill?

Open the installed `performance/SKILL.md` and `performance/references/MEASUREMENT.md` (find the folder the CLI
printed, e.g. `~/.claude/skills/` or `~/.agents/skills/`; installed as a plugin, read them
[on GitHub](https://github.com/addyosmani/web-quality-skills/tree/main/skills/performance)).

Read these parts, then open the explanation below:

1. `SKILL.md`: the frontmatter between the `---` lines at the top
2. `SKILL.md`: `## How it works` — the steps the agent follows
3. `SKILL.md`: `## Starting performance budget`
4. `MEASUREMENT.md`: the rules for measuring — your prompt in the last exercise said nothing about them

<details>
  <summary>Explanation</summary>

- **Frontmatter**: `name`, `description`, `license`, `metadata`. The agent loads only `name` and `description` at the
  start. The `description` is the trigger: it says _when_ to use the skill ("speed up my site", "optimize
  performance", "performance audit", …). The rest of the file is loaded only when a task matches — progressive
  disclosure. `references/` is read only when the skill points there.
- **How it works**:
  1. establish a baseline before editing — field data (CrUX) plus a lab trace ([MEASUREMENT.md](https://github.com/addyosmani/web-quality-skills/blob/main/skills/performance/references/MEASUREMENT.md))
  2. prioritise by Core Web Vitals; find the cause with a trace and its insights (`performance_start_trace`,
     `performance_analyze_insight`)
  3. change only code connected to a measured bottleneck
  4. re-measure under the same conditions, report before / after
- **Budgets** (`SKILL.md`): starting values for page weight, JS, CSS, above-the-fold images, fonts, third party —
  guardrails, not pass / fail criteria.
- **What your prompt did not say** (`MEASUREMENT.md`): measured vs. hypothesis, the conditions of every number
  (viewport, throttling, cache; mobile by default), at least 3 runs (median and range), no CrUX for `localhost`
  (_unavailable_, not _passing_), token efficiency (traces in files, drill only into relevant insights).

</details>

## 3. Run the audit with the skill

Same flow as in the last exercise. This time the prompt tells the agent to use the skill — and nothing about how to
analyse:

```
Use the performance skill and the chrome-devtools MCP.
Do a performance audit of the movies app on http://localhost:4200.
User flow: open /list/popular, scroll down once until the next page of movies has loaded, click "Top Rated" in the
side menu, open the first movie. On mobile, the side menu opens with the burger button.
Start each trace with a reload of the page.
Save the traces as tmp/skill-<name>.json.gz.
```

Check in the chat that the agent used the skill before it started (Claude Code: a `Skill(performance)` call; other
agents: a read of `performance/SKILL.md`). If it did not, stop it and send the prompt again.

Compare the report with the [solution of the last exercise](ai-devtools-mcp.md#6-review-the-findings) and with the
agent's report from there (still in your old chat).

<details>
  <summary>What you see</summary>

- The agent follows the skill's steps: trace → insights → only then the code. It measures as a phone by default.
- The report states the conditions, reports CrUX as unavailable for `localhost` and separates measured findings from
  hypotheses.
- Production build: no dev-server artefacts, and the Angular build inlines the Google Fonts CSS and preconnects to
  `fonts.gstatic.com` — those findings from the last exercise are gone.

</details>

## 4. Fix the LCP poster — and prove it

Fixing needs the code: start your agent **in the repo** for this step. Now it can also read the solutions in
`exercises/` — judge the diff and the measurement, not the explanation.

```
Use the performance skill and the chrome-devtools MCP.
Fix the LCP image of /list/popular — the first movie poster. Keep the change minimal.
Before the change, record 3 reload traces of /list/popular as tmp/skill-lcp-before-1.json.gz … -3.
After the change, record 3 more under the same conditions as tmp/skill-lcp-after-1.json.gz … -3.
Report the median and range of LCP before / after.
```

Check the diff before you accept it. Then load `tmp/skill-lcp-before-1.json.gz` and `tmp/skill-lcp-after-1.json.gz`
in the Performance panel and compare the LCP breakdown of the poster.

<details>
  <summary>Solution</summary>

`MovieCardComponent` already has an `index` input — use it:

```diff
// libs/movies/ui-movie-list/src/lib/movie-card/movie-card.component.ts

      <img
        tilt
        [tiltDegree]="5"
        class="movie-image"
        [alt]="movie.title"
        [src]="movie.poster_path | movieImage: 780"
+       [attr.loading]="index === 0 ? 'eager' : 'lazy'"
+       [attr.fetchpriority]="index === 0 ? 'high' : null"
      />
```

The **resource load delay** of the poster shrinks: it gets high priority and no longer competes with the other
posters, which are now only requested in or near the viewport.

Bigger alternative: `NgOptimizedImage` (`ngSrc` + `priority` for the first card, `width` / `height`, a TMDB image
loader for `ngSrcset`) — see [ng-optimized-images](ng-optimized-images.md).

</details>

**The agent proposes, the trace decides.**

## Bonus: fix the slow nav click

```
Use the performance skill and the chrome-devtools MCP.
Fix the slow interaction on the "Top Rated" click in the side menu. Keep the change minimal.
Then record the flow again under the same conditions and compare INP before / after.
```

<details>
  <summary>Solution</summary>

`TrackingService.trackEvent` (`libs/shared/utils/src/lib/tracking.service.ts`) burns a 10-million-iteration loop
inside the click handler. The real fix is to remove it — deferring it (`setTimeout` / `requestIdleCallback`) still
blocks the main thread right after the click.

</details>

## Bonus: a performance analyst sub-agent

Traces, network lists and console output fill the agent's context quickly. A custom agent with its own context does the
analysis and only returns the findings.

Create a "performance analyst" with your agent's format — instructions, only the DevTools MCP tools, the performance
skills preloaded — and let your main agent delegate to it:

```
Ask the performance analyst to audit http://localhost:4200/list/popular.
```

<details>
  <summary>Claude Code: <code>.claude/agents/performance-analyst.md</code></summary>

```markdown
---
name: performance-analyst
description: Audits the runtime performance of a web page with the Chrome DevTools MCP. Use for LCP, INP, CLS, slow page loads and long tasks.
tools: mcp__chrome-devtools__*
skills:
  - performance
  - core-web-vitals
---

You audit web performance. Always measure with a trace, never guess.
Report: the conditions, the metric values, the bottlenecks ranked by impact, the evidence (insight, request,
call stack) and one proposed fix each. Do not change code.
```

Installed as a plugin? Use `web-quality-skills:performance` / `web-quality-skills:core-web-vitals`.

</details>

<details>
  <summary>Copilot / VS Code: <code>.github/agents/performance-analyst.agent.md</code></summary>

```markdown
---
name: performance-analyst
description: Audits the runtime performance of a web page with the Chrome DevTools MCP. Use for LCP, INP, CLS, slow page loads and long tasks.
tools: ['chrome-devtools/*']
---

You audit web performance. Always measure with a trace, never guess.
Use the performance and core-web-vitals skills.
Report: the conditions, the metric values, the bottlenecks ranked by impact, the evidence (insight, request,
call stack) and one proposed fix each. Do not change code.
```

`chrome-devtools` is the server name from your MCP config. Pick the agent in the agent dropdown of the chat, or let the
main agent call it as a sub-agent.

</details>
