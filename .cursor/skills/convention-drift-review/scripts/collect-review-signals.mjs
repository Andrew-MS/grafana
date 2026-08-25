#!/usr/bin/env node

// Mine merged pull request review comments for things our context should have
// prevented. A human reviewer comment is, by definition, something the agent did
// not get right the first time: BugBot did not catch it, the conventions index
// did not route to it, and a round trip was spent explaining it.
//
// Deterministic half only. It groups and counts; it never decides what a comment
// means. That is the convention-drift-review skill's job.
//
// Uses one repository-level endpoint rather than fanning out per pull request,
// so a week of a large repository costs a handful of paginated calls.

import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

import { globToRegExp, mapGlobs, selfTestGlobs } from './map-globs.mjs';

const MAP = '.cursor/skills/grafana-conventions/references/convention-map.md';

function isBot(login) {
  return login.endsWith('[bot]') || /^(bugbot|copilot|dependabot|renovate)/i.test(login);
}

// A comment on a file that the same pull request changed again afterwards is
// evidence the comment caused rework, not just discussion.
function causedRework(comment, laterCommitPaths) {
  return laterCommitPaths.has(comment.path);
}

function selfTest() {
  let failed = false;
  const check = (label, actual, expected) => {
    if (actual !== expected) {
      console.error(`  ${label}: expected ${expected}, got ${actual}`);
      failed = true;
    }
  };

  check('bot suffix', isBot('some-thing[bot]'), true);
  check('bugbot', isBot('BugBot'), true);
  check('copilot', isBot('copilot-pull-request-reviewer[bot]'), true);
  check('human', isBot('torkelo'), false);
  check('human containing bot', isBot('robotnik'), false);

  check('rework yes', causedRework({ path: 'a/b.ts' }, new Set(['a/b.ts'])), true);
  check('rework no', causedRework({ path: 'a/b.ts' }, new Set(['c/d.ts'])), false);

  if (!selfTestGlobs()) {
    failed = true;
  }

  if (failed) {
    console.error('Review-signal self-test failed.');
    process.exit(1);
  }
  console.log('Review-signal self-test passed.');
  process.exit(0);
}

const args = process.argv.slice(2);
if (args.includes('--self-test')) {
  selfTest();
}

const sinceArg = args.indexOf('--since');
const sinceDays = sinceArg === -1 ? 7 : Number(args[sinceArg + 1]);
if (!Number.isFinite(sinceDays) || sinceDays <= 0) {
  console.error('Usage: collect-review-signals.mjs [--since <days>] [--self-test]');
  process.exit(2);
}
const since = new Date(Date.now() - sinceDays * 86400000).toISOString();

function gh(endpoint) {
  return execFileSync('gh', ['api', '--paginate', endpoint], {
    encoding: 'utf8',
    maxBuffer: 256 * 1024 * 1024,
    stdio: ['ignore', 'pipe', 'pipe'],
  });
}

try {
  execFileSync('gh', ['auth', 'status'], { stdio: 'ignore' });
} catch {
  console.error('collect-review-signals.mjs needs an authenticated `gh` CLI.');
  console.error('Run `gh auth login`, or skip this collector and use');
  console.error('collect-drift-signals.mjs, which needs only git.');
  process.exit(2);
}

const root = execFileSync('git', ['rev-parse', '--show-toplevel'], { encoding: 'utf8' }).trim();
const mapPath = path.join(root, MAP);
if (!fs.existsSync(mapPath)) {
  console.error(`Convention map not found at ${MAP}.`);
  process.exit(2);
}

let comments;
try {
  // `--paginate` concatenates JSON arrays, so join them before parsing.
  const raw = gh(`repos/{owner}/{repo}/pulls/comments?since=${since}&sort=created&direction=desc&per_page=100`);
  comments = JSON.parse(raw.replaceAll('][', ','));
} catch (error) {
  console.error(`Could not read review comments: ${error.message.split('\n')[0]}`);
  process.exit(2);
}

if (comments.length === 0) {
  console.log(`No review comments in the last ${sinceDays} days. Propose nothing.`);
  process.exit(0);
}

const globs = mapGlobs(fs.readFileSync(mapPath, 'utf8')).map((glob) => ({ glob, re: globToRegExp(glob) }));
const rowFor = (filePath) => globs.find(({ re }) => re.test(filePath))?.glob ?? null;

const human = [];
const bot = [];
for (const comment of comments) {
  const login = comment.user?.login ?? 'unknown';
  (isBot(login) ? bot : human).push({
    path: comment.path ?? '(outdated)',
    body: (comment.body ?? '').replace(/\s+/g, ' ').trim(),
    login,
    pr: Number(comment.pull_request_url?.split('/').at(-1)),
    url: comment.html_url,
    topLevel: !comment.in_reply_to_id,
  });
}

const topLevelHuman = human.filter((comment) => comment.topLevel);

// Group by the routing row that owns the file, so a proposal has somewhere to go.
const byRow = new Map();
for (const comment of topLevelHuman) {
  const key = rowFor(comment.path) ?? `(no routing row) ${comment.path.split('/').slice(0, 3).join('/')}`;
  if (!byRow.has(key)) {
    byRow.set(key, []);
  }
  byRow.get(key).push(comment);
}

console.log(`Review signals for the last ${sinceDays} days (since ${since.slice(0, 10)})`);
console.log(
  `${comments.length} review comments: ${topLevelHuman.length} top-level human, ` +
    `${human.length - topLevelHuman.length} human replies, ${bot.length} bot.`
);
console.log('');
console.log('Bot comments were already caught before human review; they are counted');
console.log('but not proposed on. Human comments are the ones our context missed.');
console.log('');

if (topLevelHuman.length === 0) {
  console.log('No human review comments. Propose nothing.');
  process.exit(0);
}

const ranked = [...byRow.entries()].sort((a, b) => b[1].length - a[1].length).slice(0, 8);

for (const [row, group] of ranked) {
  if (group.length < 2) {
    continue;
  }
  const files = new Set(group.map((comment) => comment.path));
  console.log(`## ${row}`);
  console.log(`${group.length} comments across ${files.size} files.`);
  for (const comment of group.slice(0, 6)) {
    const excerpt = comment.body.length > 140 ? `${comment.body.slice(0, 140)}…` : comment.body;
    console.log(`- ${comment.path} — "${excerpt}" (#${comment.pr}, @${comment.login})`);
  }
  if (group.length > 6) {
    console.log(`- …and ${group.length - 6} more`);
  }
  console.log('');
}

console.log('One comment is an opinion. A repeated comment on the same routing row is');
console.log('a context gap. Read the linked threads before proposing anything, and');
console.log('propose only where the repository already agrees on the answer.');
