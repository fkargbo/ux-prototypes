# ExP-Lab feedback layer (`exp-lab` submodule)

The **Prototype Feedback Layer** lives in **[github.com/fkargbo/exp-lab](https://github.com/fkargbo/exp-lab)** and is included here as a **git submodule** at **`exp-lab/`**.

## Clone this repo

```bash
git clone --recurse-submodules <HPUX-Prototypes-url>
cd HPUX-Prototypes
```

If you already cloned without submodules:

```bash
git submodule update --init --recursive
```

## Build the embed for local dev

Webpack dev server serves **`/feedback-layer.js`** from **`exp-lab/dist/`** (see `webpack.dev.js`). After pulling submodule updates:

```bash
cd exp-lab
npm install
npm run build
```

Restart **`npm start`** from the repo root if the dev server was already running.

## Supabase / secrets

Create **`exp-lab/.env`** from **`exp-lab/.env.example`** (file is gitignored). Rebuild after changing env vars.

## Bump the submodule pointer in HPUX-Prototypes

When `exp-lab` has new commits on GitHub:

```bash
cd exp-lab
git pull origin main
cd ..
git add exp-lab
git commit -m "chore: bump exp-lab submodule"
```
