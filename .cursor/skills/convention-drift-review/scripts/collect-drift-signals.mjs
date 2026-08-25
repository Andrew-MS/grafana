#!/usr/bin/env node

// Collect evidence that the convention index has fallen behind the repository.
// This half is deterministic on purpose: it reports signals and never draws
// conclusions. Deciding whether a signal is real drift, and what the routing row
// should say, is the job of the convention-drift-review skill.
//
// Stateless. Dedupe is the skill's job, using the open pull requests GitHub
// already tracks, rather than a state file this would have to keep correct.

import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

import { globToRegExp, mapGlobs, selfTestGlobs } from './map-globs.mjs';

const MAP = '.cursor/skills/grafana-conventions/references/convention-map.md';

function git(args) {
  return execFileSync('git', args, {
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
    // Rename detection over a long window prints a renameLimit warning that is
    // noise in an automated report. The call still throws on real failure.
    stdio: ['ignore', 'pipe', 'ignore'],
  }).trim();
}

function selfTest() {
  if (!selfTestGlobs()) {
    console.error('Drift-signal self-test failed.');
    process.exit(1);
  }
  console.log('Drift-signal self-test passed.');
  process.exit(0);
}

const args = process.argv.slice(2);
if (args.includes('--self-test')) {
  selfTest();
}

const sinceArg = args.indexOf('--since');
const since = sinceArg === -1 ? '30 days ago' : args[sinceArg + 1];
if (sinceArg !== -1 && !since) {
  console.error('Usage: collect-drift-signals.mjs [--since <git date>]');
  process.exit(2);
}

const root = git(['rev-parse', '--show-toplevel']);
const mapPath = path.join(root, MAP);
if (!fs.existsSync(mapPath)) {
  console.error(`Convention map not found at ${MAP}.`);
  process.exit(2);
}

const mapText = fs.readFileSync(mapPath, 'utf8');

const range = git(['log', `--since=${since}`, '--format=%H', '--first-parent'])
  .split('\n')
  .filter(Boolean);
if (range.length === 0) {
  console.log(`No commits since ${since}. Nothing to review.`);
  process.exit(0);
}

const oldest = range.at(-1);
// A root commit has no `~1`, and a long --since window or a shallow clone can
// reach one. Diff against git's empty tree rather than aborting the report.
const EMPTY_TREE = '4b825dc642cb6eb9a060e54bf8d69288fbee4904';
const base = git(['log', '-1', '--format=%P', oldest]) ? `${oldest}~1` : EMPTY_TREE;
const changes = git(['diff', '--name-status', base, 'HEAD'])
  .split('\n')
  .filter(Boolean)
  .map((line) => {
    const [status, ...paths] = line.split('\t');
    return { status: status[0], path: paths.at(-1), from: paths.length > 1 ? paths[0] : null };
  });

const globs = mapGlobs(mapText).map((glob) => globToRegExp(glob));
const covered = (filePath) => globs.some((re) => re.test(filePath));

const signals = [];
const add = (title, why, items) => {
  if (items.length > 0) {
    signals.push({ title, why, items: [...new Set(items)] });
  }
};

add(
  'Scoped AGENTS.md added, moved, or deleted',
  'A convention the map has never heard of fails no check.',
  changes
    .filter((change) => change.path.endsWith('AGENTS.md') && change.status !== 'M')
    .map((change) => `${change.status} ${change.path}${change.from ? ` (from ${change.from})` : ''}`)
);

add(
  'Skill or agent added, moved, or deleted',
  'Routing rows may name something that no longer exists, or miss something new.',
  changes
    .filter(
      (change) =>
        /^\.cursor\/(skills|agents)\//.test(change.path) && change.path.endsWith('.md') && change.status !== 'M'
    )
    .map((change) => `${change.status} ${change.path}${change.from ? ` (from ${change.from})` : ''}`)
);

add(
  'CODEOWNERS changed',
  'The Ownership column may be stale. Confirm per affected row.',
  changes.filter((change) => change.path.endsWith('CODEOWNERS')).map((change) => change.path)
);

// Every workflow file churns constantly in a repository this size. Only the ones
// the map actually cites are actionable; the rest is a count so the reviewer can
// judge whether a wider sweep is due.
const workflowChanges = changes.filter(
  (change) => change.path.startsWith('.github/workflows/') || change.path.includes('change-detection')
);
const citedWorkflows = workflowChanges.filter((change) => mapText.includes(change.path));

add(
  'Workflows the map cites by name changed',
  `The "Likely checks to confirm" column may be stale. ${workflowChanges.length - citedWorkflows.length} other workflow files also changed.`,
  citedWorkflows.map((change) => change.path)
);

const uncoveredDirs = new Map();
for (const change of changes) {
  if (change.status === 'D' || change.path.startsWith('.cursor/') || covered(change.path)) {
    continue;
  }
  const dir = change.path.split('/').slice(0, 3).join('/');
  uncoveredDirs.set(dir, (uncoveredDirs.get(dir) ?? 0) + 1);
}

add(
  'Active directories no routing row covers',
  'The map admits it does not cover every path. These are where that costs the most.',
  [...uncoveredDirs.entries()]
    .filter(([, count]) => count >= 5)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([dir, count]) => `${dir} (${count} changed files)`)
);

console.log(`Convention drift signals since ${since}`);
console.log(`Range: ${oldest.slice(0, 12)}..HEAD, ${range.length} commits, ${changes.length} changed files`);
console.log('');

if (signals.length === 0) {
  console.log('No signals. Propose nothing.');
  process.exit(0);
}

for (const signal of signals) {
  console.log(`## ${signal.title}`);
  console.log(signal.why);
  for (const item of signal.items) {
    console.log(`- ${item}`);
  }
  console.log('');
}

console.log('These are signals, not conclusions. Verify each against the merged');
console.log('pull request before proposing any routing change.');
