# AI: Chrome DevTools MCP

In this exercise you give your own agent a browser: you add the Chrome DevTools MCP server, let the agent look at
the movies app, and then let it record a performance trace from a flow you describe in plain words.

You need an agent with MCP support (Copilot in VS Code, Claude Code, Cursor, Gemini CLI, Codex, …) and Chrome.
No agent? Pair up with your neighbour.

> [!IMPORTANT]
> What the agent finds depends heavily on the model, the reasoning effort and on what the agent can read. Started in
> this repo, it can simply search the code — and the `exercises/` folder contains the solutions. So run this exercise
> in a session **without access to the repo**: start your agent in an empty folder (VS Code: open that folder).
>
> ```bash
> mkdir ~/devtools-mcp-playground && cd ~/devtools-mcp-playground
> ```

Serve the app first (in the repo, in its own terminal):

```bash
npx nx serve movies
```

## 1. Add the DevTools MCP to your agent

Every agent takes the same server definition — only the place where you put it differs:

```json
{
  "mcpServers": {
    "chrome-devtools": {
      "command": "npx",
      "args": ["-y", "chrome-devtools-mcp@latest"]
    }
  }
}
```

> [!IMPORTANT]
> **Windows**: if the server does not start (`Connection closed`), wrap `npx` in `cmd /c`:
>
> ```json
> "command": "cmd",
> "args": ["/c", "npx", "-y", "chrome-devtools-mcp@latest"]
> ```
>
> **WSL**: the server cannot start the Windows Chrome from inside WSL. Run your agent in PowerShell / Git Bash
> instead, or see the [WSL notes](https://github.com/ChromeDevTools/chrome-devtools-mcp/blob/main/docs/troubleshooting.md#wsl).
>
> `~` below is your home folder — on Windows `%USERPROFILE%` (e.g. `C:\Users\you`).

First decide **who gets the server**:

| Scope | Who gets it | Typical use |
|---|---|---|
| **project** | everybody working on this repo — the config file is committed | tools the whole team needs for this repo |
| **user** | you, in all your projects | your personal toolbox |
| **local** (project × user) | only you, only in this repo — not committed | trying something out, personal setup for one repo |

Not every agent has all three. For this workshop use **user**: your agent runs in the playground folder, not in the
repo. In a real project, **project** is the one your team would use.

<details>
  <summary>Claude Code</summary>

```bash
claude mcp add chrome-devtools --scope project npx chrome-devtools-mcp@latest  # .mcp.json in the repo
claude mcp add chrome-devtools --scope user npx chrome-devtools-mcp@latest     # ~/.claude.json, all projects
claude mcp add chrome-devtools npx chrome-devtools-mcp@latest                  # default: local
```

`local` is the default: only you, only this repo (stored in `~/.claude.json` under the project path).

Windows (not WSL) — add `cmd /c` in front of `npx`:

```powershell
claude mcp add chrome-devtools --scope project -- cmd /c npx -y chrome-devtools-mcp@latest
```

</details>

<details>
  <summary>Copilot / VS Code</summary>

**Project** — create `.vscode/mcp.json` (note: VS Code uses `servers`, not `mcpServers`):

```json
{
  "servers": {
    "chrome-devtools": {
      "command": "npx",
      "args": ["-y", "chrome-devtools-mcp@latest"]
    }
  }
}
```

**User** — Command Palette → **MCP: Add Server…** → **Command (stdio)** → `npx -y chrome-devtools-mcp@latest` →
**Global**. Or from the terminal:

```bash
# macOS / Linux
code --add-mcp '{"name":"chrome-devtools","command":"npx","args":["-y","chrome-devtools-mcp@latest"]}'
```

```powershell
# Windows (PowerShell)
code --add-mcp '{"""name""":"""chrome-devtools""","""command""":"""npx""","""args""":["""-y""","""chrome-devtools-mcp@latest"""]}'
```

No local scope — closest is a `.vscode/mcp.json` you do not commit.

</details>

<details>
  <summary>Cursor</summary>

**Project**: `.cursor/mcp.json` in the repo. **User**: `~/.cursor/mcp.json`, or `Cursor Settings` → `MCP` →
`New MCP Server`. Both take the config from above.

</details>

<details>
  <summary>Gemini CLI / Codex</summary>

```bash
gemini mcp add chrome-devtools npx chrome-devtools-mcp@latest          # project: .gemini/settings.json
gemini mcp add -s user chrome-devtools npx chrome-devtools-mcp@latest  # user
codex mcp add chrome-devtools -- npx chrome-devtools-mcp@latest        # user: ~/.codex/config.toml
```

</details>

> [!NOTE]
> Other agents: see the [client configuration guide](https://github.com/ChromeDevTools/chrome-devtools-mcp/blob/main/docs/client-configurations.md).

## 2. Is it connected?

Adding the config is not enough — the server has to start, and your agent has to see its tools. Check it in your agent:

- Claude Code: `/mcp` → `chrome-devtools` shows **connected**.
- VS Code: Command Palette → **MCP: List Servers** → `chrome-devtools` is **running** (start it there if not); the
  tools list (🔧) in Agent mode contains the `chrome-devtools` tools.
- Cursor: `Cursor Settings` → `MCP` → green dot next to `chrome-devtools`.

Then ask the agent itself:

```
Which tools of the chrome-devtools MCP server do you have?
```

It should list tools like `navigate_page`, `take_screenshot`, `performance_start_trace`, …

<details>
  <summary>Not connected? Let your agent help</summary>

Your agent can read its own config and run commands — let it debug the setup:

```
The chrome-devtools MCP server does not show up. Check my MCP config, try to start the server
with `npx -y chrome-devtools-mcp@latest --help` and tell me what is wrong.
```

Usual suspects:

- **Agent not restarted** — most agents load MCP servers only at start / in a new chat.
- **`npx` not found** — an IDE started from the dock / start menu does not see the `node` of your shell (nvm, nvm-windows, fnm,
  …). Use the full path to `npx` in the config, or start the IDE from the terminal (`code .`).
- **Windows: `Connection closed`** — wrap `npx` in `cmd /c` (see step 1).
- **No access to the npm registry** (proxy, firewall) — `npx -y chrome-devtools-mcp@latest --help` in a terminal fails too.
- **Server not trusted / not started** — VS Code asks before the first start, check **MCP: List Servers**.

More: [troubleshooting guide](https://github.com/ChromeDevTools/chrome-devtools-mcp/blob/main/docs/troubleshooting.md).

</details>

## 3. What can the agent do?

Give your agent these prompts, one by one. Name the server in the prompt:

```
Use the chrome-devtools MCP: open http://localhost:4200/list/popular and take a screenshot.
```

```
Are there any errors or warnings in the console?
```

```
Which requests go to image.tmdb.org? How many are there and how large are they?
```

> [!IMPORTANT]
> Many agents ship their own browser tools — a built-in browser, a browser extension, Playwright. Without
> "use the chrome-devtools MCP" the agent may pick one of those, and you end up in a different browser without
> DevTools traces. A **new Chrome window** must open. If it does not, stop the agent and send the prompt again.

The chat shows every tool call — they must come from the `chrome-devtools` server (`navigate_page`,
`take_screenshot`, …).

<details>
  <summary>What you see</summary>

- The MCP server starts its **own Chrome** with a separate profile (not your browser) — on the first tool call that
  needs a browser.
- Tools used: `new_page` / `navigate_page`, `take_screenshot`, `list_console_messages`, `list_network_requests` /
  `get_network_request`.
- The posters: one request per card to `image.tmdb.org/t/p/w780/…` — all of them requested on load, also the ones
  far below the fold.

The full tool list (input, navigation, emulation, performance, network, Lighthouse, memory, …):
[tool reference](https://github.com/ChromeDevTools/chrome-devtools-mcp/blob/main/docs/tool-reference.md).

</details>

## 4. Find the performance problems

In the [performance tab exercise](performance-tab-flame-charts.md) you recorded and analysed a trace by hand. Now
describe the flow and let the agent do both — one prompt, no further instructions:

```
Use the chrome-devtools MCP. Open http://localhost:4200/list/popular, resize the page to 1440x900
and set 4x CPU throttling.
Record a performance trace that starts with a reload of the page (reload, no auto-stop), then do this flow:
scroll down once until the next page of movies has loaded, click "Top Rated" in the side menu,
open the first movie.
Save the trace as tmp/desktop.json.gz.
Then tell me about the performance problems of this app.
```

Then open the trace yourself: Performance panel → **Load profile** (↑ icon) →
`tmp/desktop.json.gz` in your playground folder.

Check that the trace starts with the page load and shows the flow. The findings are reviewed in step 6.

- **The agent does not find "Top Rated"?** The side menu is hidden behind the burger button on narrow pages — tell
  the agent to open it.
- **`Access denied: … not within any of the configured workspace roots`?** Add
  `"--workspace=/absolute/path/to/your/playground"` to the server args (step 1) and restart the server.

<details>
  <summary>Solution</summary>

**What the agent does**: `resize_page` → `emulate` → `performance_start_trace` (`reload: true`) → scroll / `click` →
`performance_stop_trace` (`filePath`), then it reads the trace's insights (`performance_analyze_insight`).

Compare with your neighbours: the ranking, the wording and even the findings differ — with the model and the reasoning
effort, and because the agent improvises the analysis every time.

</details>

## 5. The same flow on a phone

Same flow, different device:

```
Do the same flow again as a mobile user: emulate a phone (390x844, device pixel ratio 3, mobile, touch)
with a mobile Chrome user agent, a Fast 4G network and 4x CPU throttling.
Start the trace with a reload of the page again (reload, no auto-stop).
Save the trace as tmp/mobile.json.gz.
Then tell me about the performance problems on mobile.
```

On a phone the side menu is behind the burger button. The emulation stays active for the page — when the report is
done, reset it:

```
Reset the emulation: call emulate without any options.
```

You review the findings together with the desktop findings in step 6.

<details>
  <summary>What you see</summary>

- One `emulate` call with viewport, user agent, `Fast 4G` and `cpuThrottlingRate: 4`.
- A worse LCP: the w780 posters now load over a throttled network.

</details>

## 6. Review the findings

Now you are the reviewer. Pick one finding from the agent's report in step 4 and check it yourself in the trace
(Performance panel: Network track, Main track, Insights). You find the evidence — or the finding is a claim without
evidence.

Then open the solution below and compare it with the agent's reports from step 4 and 5: the real problems it found,
the ones it missed, and its findings that are wrong.

Keep this chat open — you compare it with the next exercise.

<details>
  <summary>Solution: the problems the app actually has</summary>

| Problem | Where you see it | Code |
|---|---|---|
| Slow nav click (INP) | long task on the "Top Rated" click: `trackEvent` | `TrackingService.trackEvent` — a 10-million-iteration loop, called from `AppShellComponent.trackNavigation` (`libs/shared/utils/src/lib/tracking.service.ts`) |
| LCP poster without priority | LCP insights: the first poster is the LCP element; it is discovered late (only after the API response) and loads without high priority | `movie-card` `<img>` has no `fetchpriority="high"` |
| All posters eager and too large | Network track: every card requests `w780`, also the ones below the fold | `movie-card` `<img>`: no `loading="lazy"`, `movieImage: 780` |
| No connection hints | Network track: connection setup to `api.themoviedb.org`, `image.tmdb.org`, Google Fonts | `index.html` has no `preconnect` |
| Fonts | render-blocking Google Fonts CSS, Poppins arrives late and text re-renders | `index.html`: stylesheet in `<head>` |
| Genres requested late | Network track: the genre request starts only after the app shell rendered | `AppShellComponent`: `genres$ = getGenres()` + `async` in the template |

**Watch out for** findings that look right but are not:

- **Dev-server artefacts** — `nx serve` serves a development build: unminified JS, source maps, Angular dev-mode
  checks. Real in the trace, but not in production.
- **Generic advice** — SSR, CDN, cache headers, TTFB: true in general, but TTFB on `localhost` says nothing.
- **Claims without evidence** — a finding without a trace event, a request or a line of code is a guess.

**The agent proposes, the trace decides.** In the next exercise you give the agent a process and context.

</details>

## Bonus: connect to your own Chrome

By default the MCP server starts a fresh Chrome. With `--autoConnect` it uses the Chrome you already have open
(Chrome 144+): you click around, the agent watches the same tabs.

1. Open `chrome://inspect/#remote-debugging` and allow remote debugging.
2. Add `--autoConnect` to the server args:

   ```json
   "args": ["-y", "chrome-devtools-mcp@latest", "--autoConnect"]
   ```

3. Restart the server, ask the agent `Which pages are open in my browser?` and confirm the permission dialog in Chrome.

> [!WARNING]
> The agent sees everything in that browser profile — every tab, every logged-in session. Use a profile without
> sensitive sessions, or stay with the default (separate profile) or `--isolated` (temporary profile, cleared on close).

Other useful flags: `--headless`, `--viewport=1280x720`, `--no-usage-statistics` (usage statistics are on by default),
`--no-performance-crux` (trace URLs are sent to the CrUX API by default). All flags:
[configuration guide](https://github.com/ChromeDevTools/chrome-devtools-mcp/blob/main/docs/configuration.md).
