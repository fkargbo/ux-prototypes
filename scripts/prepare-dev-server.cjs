#!/usr/bin/env node
/**
 * Shared dev-server prep for `npm start` and `npm run start:dev` (same webpack command).
 * - Ensures ExP-Lab feedback bundle exists
 * - Warns when another process is already bound to the dev port (stale second server)
 * - Warns when a production `dist/` exists (use `npm run serve:dist` for that, not dev)
 */
const fs = require('fs');
const path = require('path');
const { spawnSync, execSync } = require('child_process');

const root = path.resolve(__dirname, '..');
const port = String(process.env.PORT || '3000').trim();
const distDir = path.join(root, 'dist');
const distIndex = path.join(distDir, 'index.html');
const distMainBundle = path.join(distDir, 'main.bundle.js');

function portInUse(p) {
  try {
    const pids = execSync(`lsof -ti:${p}`, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] }).trim();
    return pids.length > 0 ? pids.split('\n').filter(Boolean) : null;
  } catch {
    return null;
  }
}

function runEnsureExpLab() {
  const result = spawnSync('node', [path.join(__dirname, 'ensure-exp-lab-feedback.cjs')], {
    cwd: root,
    stdio: 'inherit',
  });
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

console.log('[dev] Preparing webpack dev server (npm start and npm run start:dev use the same config).');

const pids = portInUse(port);
if (pids) {
  console.warn(
    `\n[dev] WARNING: port ${port} is already in use (PID: ${pids.join(', ')}).\n` +
      '       A second dev server often looks like an "older build" (e.g. banner v2.0 vs v3.0 on a different port).\n' +
      `       Stop the other server (Ctrl+C in that terminal, or: kill ${pids.join(' ')}) before starting again.\n`,
  );
}

if (fs.existsSync(distMainBundle) || fs.existsSync(distIndex)) {
  console.warn(
    '[dev] NOTE: root dist/ contains a production build. Dev uses in-memory bundles from webpack.dev.js.\n' +
      '       Preview production output with: npm run serve:dist\n' +
      '       Remove stale dist with: npm run clean\n',
  );
}

runEnsureExpLab();

const aiHubPath = '/core/observe/ai-hub';
console.log(`[dev] After start, open: http://localhost:${port}${aiHubPath}`);
console.log('[dev] Banner version (v1/v2/v3) is stored in sessionStorage per port — use the Share banner picker.\n');
