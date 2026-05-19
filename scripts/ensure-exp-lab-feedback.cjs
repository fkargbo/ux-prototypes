#!/usr/bin/env node
/**
 * Ensures exp-lab/dist/feedback-layer.js exists (builds submodule if needed).
 * When root dist/ exists, copies the bundle there for serve:dist and deploy.
 */
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const root = path.resolve(__dirname, '..');
const expLabDir = path.join(root, 'exp-lab');
const bundlePath = path.join(expLabDir, 'dist', 'feedback-layer.js');
const appDistDir = path.join(root, 'dist');
const appDistBundle = path.join(appDistDir, 'feedback-layer.js');

function runNpmInExpLab(args, label) {
  const result = spawnSync('npm', args, {
    cwd: expLabDir,
    stdio: 'inherit',
    shell: true,
  });
  if (result.status !== 0) {
    console.error(`[exp-lab] ${label} failed (exit ${result.status ?? 'unknown'}).`);
    process.exit(result.status ?? 1);
  }
}

function runExpLabBuild() {
  if (!fs.existsSync(path.join(expLabDir, 'package.json'))) {
    console.warn(
      '[exp-lab] Submodule missing — run: git submodule update --init --recursive',
    );
    process.exit(1);
  }
  const hasNodeModules = fs.existsSync(path.join(expLabDir, 'node_modules'));
  if (!hasNodeModules) {
    console.log('[exp-lab] Installing dependencies (npm ci)…');
    runNpmInExpLab(['ci'], 'npm ci');
  }
  console.log('[exp-lab] Building feedback-layer.js…');
  runNpmInExpLab(['run', 'build'], 'npm run build');
}

if (!fs.existsSync(bundlePath)) {
  // GitHub Actions builds exp-lab in a dedicated workflow step after `npm run build`.
  if (process.env.CI === 'true') {
    console.log('[exp-lab] Skipping build in postbuild on CI — workflow step will build exp-lab.');
  } else {
    runExpLabBuild();
  }
}

if (!fs.existsSync(bundlePath)) {
  if (process.env.CI === 'true') {
    console.log('[exp-lab] feedback-layer.js not present yet — CI workflow will build and copy it.');
    process.exit(0);
  }
  console.error('[exp-lab] Build did not produce dist/feedback-layer.js');
  process.exit(1);
}

if (fs.existsSync(appDistDir)) {
  fs.copyFileSync(bundlePath, appDistBundle);
  console.log('[exp-lab] Copied feedback-layer.js → dist/');
}
