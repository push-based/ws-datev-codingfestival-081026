# Exercise: project setup

This exercise is here to make sure your setup is properly configured so that you don't run into any issues
when doing the actual coding exercises.

## 0. Make sure you have correct `node` & `npm` version

* `node ^22.22.3 || ^24.15.0 || >=26`
* `npm >= 10`
* `git`

e.g.
```bash
node -v
v24.15.0

npm -v
11.6.2
```

## 1. Open Project in IDE

> [!NOTE]
> If you use `vscode` you can open it directly from the terminal by executing `code ./path-to-project`.

Install the recommended extensions when your IDE asks for them (`.vscode/extensions.json`: Nx Console, Angular
Language Service, ESLint, Prettier). JetBrains IDEs: install the **Nx Console** plugin.

## 2. Install dependencies

```bash
npm install
```

> [!NOTE]
> The workspace uses the local Nx installation, run every command with `npx nx ...`.
> Optionally install Nx globally (`npm i -g nx`) to drop the `npx`.

## 3. Serve application

```bash
npx nx serve movies
```

The application will be served at `localhost:4200` as default and redirects to `/list/popular`.

> [!TIP]
> You can let Nx open your browser with the `--open` argument

```bash
npx nx serve movies --open
```

Check that movie posters show up on `/list/popular` — that means the TMDB API (`api.themoviedb.org`) and its images
(`image.tmdb.org`) are reachable from your network.

## 4. Check the Nx workspace

```bash
npx nx graph
```

The project graph opens in your browser: the `movies` app and its libraries under `libs/movies` and `libs/shared`.

## 5. Prepare your AI agent (block 4)

Block 4 uses an AI agent with MCP support (Copilot in VS Code, Claude Code, Cursor, Gemini CLI, Codex, …) and the
Chrome DevTools MCP server. Make sure your agent runs, and that the MCP server can be downloaded:

```bash
npx -y chrome-devtools-mcp@latest --version
```

It prints a version number (e.g. `1.10.1`). If it fails, the npm registry is blocked — tell the trainer.

> [!NOTE]
> Optional: `docker info` — Docker is only needed for the bonus of the Nx task pipelines exercise.

