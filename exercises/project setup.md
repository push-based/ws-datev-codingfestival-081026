# Exercise: project setup

This exercise is here to make sure your setup is properly configured so that you don't run into any issues
when doing the actual coding exercises.

## 0. Make sure you have correct `node` & `npm` version

* `node ^22.22.3 || ^24.15.0 || >=26`
* `npm >= 10`

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
