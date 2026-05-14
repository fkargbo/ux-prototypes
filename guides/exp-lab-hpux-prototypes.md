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

## Production: load the embed from your own Pages URL (optional)

By default, the production bundle loads **`feedback-layer.js` from the same GitHub Pages site** as HPUX-Prototypes (`window.location.origin` + basename). To use a separately hosted build (e.g. **`https://fkargbo.github.io/exp-lab/feedback-layer.js`** with Supabase baked in on **`fkargbo/exp-lab`**):

1. Set webpack env **`EXP_LAB_FEEDBACK_SCRIPT_URL`** to that full URL at **root `npm run build`** time.
2. **Local:** add to repo root **`.env`** (gitignored):  
   `EXP_LAB_FEEDBACK_SCRIPT_URL=https://fkargbo.github.io/exp-lab/feedback-layer.js`
3. **GitHub Actions:** on the repo that builds HPUX-Prototypes → **Settings → Secrets and variables → Actions → Variables** → add variable **`EXP_LAB_FEEDBACK_SCRIPT_URL`** with the same URL. The **Deploy to GitHub Pages** workflow passes it into the **Build** step.

If unset, behavior stays **same-origin** (kuklas-style hosting).

## Bump the submodule pointer in HPUX-Prototypes

When `exp-lab` has new commits on GitHub:

```bash
cd exp-lab
git pull origin main
cd ..
git add exp-lab
git commit -m "chore: bump exp-lab submodule"
```
