# 📖 Initialize Nx

---

**[Next: Run Tasks and Task Pipelines →](./02-task-pipelines.md)**

---

✋ Raise your hand to show you've started the exercise. ✋
---

In this exercise, you'll learn how to add Nx to an existing TypeScript repository and explore the project graph that Nx constructs from analyzing your codebase.

## 1. Explore the Starting Repository

To get started, clone [the sample repository](https://github.com/nrwl/tuskydesign/fork) to your local machine:

```shell
git clone https://github.com/nrwl/tuskydesign.git
```

The repository has three TypeScript packages under `packages/animals`, `packages/names` and `packages/zoo`. The `zoo` package uses `animals` and `names` to generate a random message. The root `package.json` has a `workspaces` property that tells NPM how to find the projects in the repository.

```json {% fileName="package.json" %}
{
  "workspaces": ["packages/*"]
}
```

Because of this setting, when the install command is run at the root, the correct packages are installed for each project. NPM will create dedicated `node_modules` folders inside of each project folder where necessary.

```shell
npm install
```

Now let's try running some tasks. To build the `animals` package, use the `build` npm script:

```bash
npm run build -w @tuskdesign/animals
```

Which should output:

```text {% command="npm run build -w @tuskdesign/animals" path="~/tuskydesigns" %}
> @tuskdesign/animals@1.2.0 build
> tsc --build tsconfig.lib.json
```

The repository is set up using [TypeScript project references](https://www.typescriptlang.org/docs/handbook/project-references.html) so building the `zoo` package will automatically build all its dependencies.

```bash
npm run build -w @tuskdesign/zoo
```

Which should output:

```text {% command="npm run build -w @tuskdesign/zoo" path="~/tuskydesigns" %}
> @tuskdesign/zoo@1.2.0 build
> tsc --build tsconfig.lib.json
```

To run the `zoo` package use the `serve` script:

```bash
npm run serve -w @tuskdesign/zoo
```

Which should output:

```text {% command="npm run serve -w @tuskdesign/zoo" path="~/tuskydesigns" %}
> @tuskdesign/zoo@1.2.0 serve
> node dist/index.js

Bo the pig says oink!
```

Now that you have a basic understanding of the repository we're working with, let's see how Nx can help us.

## 2. Add Nx to Your Repository

Run a single command to start getting value out of Nx:

```bash
npx nx@latest init
```

This command will download the latest version of Nx and help set up your repository to take advantage of it.

### 2.1 Setup Questions

The script asks a series of questions to help set up caching for you:

- `Which scripts need to be run in order?` - Choose `build`
- `Which scripts are cacheable?` - Choose `build` and `typecheck`
- `Does the "build" script create any outputs?` - Enter `dist`
- `Does the "typecheck" script create any outputs?` - Enter nothing
- `Would you like remote caching to make your build faster?` - Choose `Skip for now`

### 2.2. Install Nx Globally

Throughout this workshop, we'll be running Nx commands. You can run them using the `npx` command like this:

```bash
npx nx --version
```

For our convenience, we'll install Nx globally and skip the `npx` utility.  Install Nx globally using `npm` with this command:

```bash
npm i -g nx@latest
```

Now you'll be able to view the installed version of Nx with the following command:

```bash
nx --version
```

## 3. Browse the Project Graph

Nx constructs a project graph by analyzing your codebase. This graph shows the dependencies between your projects and is invaluable for understanding your workspace architecture.

### 3.1 View the Full Project Graph

Run the following command to see the dependencies between your projects:

```bash
npx nx graph
```

This will open a browser window showing the project graph with all dependencies.

![Project graph with `zoo` depending on `animals` and `names`](images/intro-nx-graph.png)

If you click on the arrow that connects `@tuskdesign/zoo` to `@tuskdesign/names`, you can see what file is responsible for creating that dependency.

### 3.2 Edit Project Dependencies

Let's try to remove that dependency. In the `packages/zoo/package.json` file, remove the dependency on `@tuskdesign/names`:

```json
{
  "name": "@tuskdesign/zoo",
  // ...
  "dependencies": {
    "@tuskdesign/animals": "*"
  },
  // ...
}
```

Now if you run `nx graph` again, you'll see that the dependency is removed:

![Project graph with `zoo` depending on `animals`](images/intro-separated-nx-graph.png)

## 4. Plugins Extend the Graph

Even though we removed the dependency from the `package.json`, the `zoo` project still imports code from the `names` project in `packages/zoo/index.ts`. It would be better if Nx could calculate project dependencies based on the actual import statements, rather than completely relying on what is defined in the `package.json` files. Fortunately, the `@nx/js` plugin does exactly that. Let's add the plugin to see the more accurate project graph.

## 4.1. Add the `@nx/js` Plugin

Add the `@nx/js` plugin with the following command:

```bash
npx nx add @nx/js
```

The `nx add` command will install the package from npm (using the same version as your locally installed `nx` package) and run the package's `init` generator to automatically configure it.

## 4.2. View the Graph Again

Now run `nx graph` again to see the correctly calculated project graph.

![Project graph with `zoo` depending on `animals` and `names`](images/intro-nx-graph.png)

This time, if you click on the `zoo` to `names` dependency, you'll see that `packages/zoo/index.ts` is the file that created the dependency.

## 5. Understanding the Benefits

After completing this exercise, you should understand:

- How Nx can be added to any existing repository with minimal configuration
- How the project graph provides an accurate view of your workspace architecture

The project graph is one of Nx's most powerful features - it's derived directly from your codebase and helps you understand the relationships between your projects at a glance.

---
👏 Lower your hand to show you've finished the exercise. 👏
---

## 🏃‍♂️‍➡️ Action Steps

**👟 Next Step:**
- Run `nx init` on one of your repositories that is not using Nx
- Explore the project graph for your repository

**🧠 Discussion Topics:**
- Is there a project dependency that surprises you? Click on the line to see which files create that dependency.
- Are you happy with the overall shape of your graph? What development practices would lead to more horizontal graphs vs. more vertical graphs?

---

**[Next: Run Tasks and Task Pipelines →](./02-task-pipelines.md)**

---