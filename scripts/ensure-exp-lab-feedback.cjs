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

function runExpLabBuild() {
  if (!fs.existsSync(path.join(expLabDir, 'package.json'))) {
    console.warn(
      '[exp-lab] Submodule missing — run: git submodule update --init --recursive',
    );
    process.exit(1);
  }
  console.log('[exp-lab] Building feedback-layer.js…');
  const result = spawnSync('npm', ['run', 'build'], {
    cwd: expLabDir,
    stdio: 'inherit',
    shell: true,
  });
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

if (!fs.existsSync(bundlePath)) {
  runExpLabBuild();
}

if (!fs.existsSync(bundlePath)) {
  console.error('[exp-lab] Build did not produce dist/feedback-layer.js');
  process.exit(1);
}

if (fs.existsSync(appDistDir)) {
  fs.copyFileSync(bundlePath, appDistBundle);
  console.log('[exp-lab] Copied feedback-layer.js → dist/');
}
