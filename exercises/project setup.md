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
> If you use `vscode` you can run it directly from the terminal by executing `code ./path-to-project`.

```bash
code ./path-to-project
```

Install the **Nx Console** extension for your IDE (VSCode: `nrwl.angular-console`, also available for JetBrains IDEs).

## 2. Install dependencies

```bash
npm install
```

> [!NOTE]
> The workspace uses the local Nx installation, run every command with `npx nx ...`.
> Optionally install Nx globally (`npm i -g nx`) to drop the `npx`.

## 3. serve application

```bash
npx nx serve movies
```

application will be served at `localhost:4200` as default and redirects to `/list/popular`

> [!TIP]
> you can let Nx open your browser with the `--open` argument

```bash
npx nx serve movies --open
```

## 4. Make sure the IDE, eslint & prettier are set up correctly

### 4.1 VSCode

```bash
CTRL + P

ext install esbenp.prettier-vscode

ext install dbaeumer.vscode-eslint

```
// .vscode/settings.json

```json

{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "eslint.format.enable": true,
}
```


