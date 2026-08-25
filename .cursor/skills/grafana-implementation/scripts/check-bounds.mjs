#!/usr/bin/env node

// Compare the tip commit's declared Change-Bounds against the files this branch
// actually touched. The declaration is made after implementation, not predicted
// before it: widening is always allowed and costs one `git commit --amend`.
// What this prevents is widening *silently*.
//
// Node rather than bash so the pre-push hook works on Windows without git-bash,
// and on macOS without GNU coreutils. Node is already a hard dependency here.
//
// Ceiling: path globs only. This detects file-level drift. It cannot see
// behaviour drift inside a file that was always in bounds.

import { execFileSync } from 'node:child_process';

// `*` spans `/`, matching bash `[[ ]]`, so "dir/*" already covers the whole
// subtree. Anchored, so "docs/*" never matches "public/docs/x".
function globToRegExp(glob) {
  const escaped = glob.replace(/[.+^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`^${escaped.replace(/\*/g, '.*').replace(/\?/g, '.')}$`);
}

function covered(filePath, globs) {
  return globs.some((glob) => globToRegExp(glob).test(filePath));
}

function git(args, allowFailure = false) {
  try {
    return execFileSync('git', args, {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
  } catch (error) {
    if (allowFailure) {
      return null;
    }
    throw error;
  }
}

function selfTest() {
  let failed = false;
  const expect = (expected, filePath, globs) => {
    const actual = covered(filePath, globs) ? 'yes' : 'no';
    if (actual !== expected) {
      console.error(`  expected ${expected}, got ${actual}: ${filePath}`);
      failed = true;
    }
  };

  const picker = ['public/app/core/components/NestedFolderPicker/*'];
  expect('yes', 'public/app/core/components/NestedFolderPicker/NestedFolderPicker.tsx', picker);
  expect('yes', 'public/app/core/components/NestedFolderPicker/deep/nested/File.tsx', picker);
  expect('no', 'public/app/core/components/NestedFolderPicker.tsx', picker);
  expect('no', 'public/app/core/components/Other/Thing.tsx', picker);
  expect('yes', 'public/locales/en-US/grafana.json', ['docs/*', 'public/locales/*']);
  expect('no', 'lefthook.yml', ['public/locales/*']);
  expect('no', 'public/docs/readme.md', ['docs/*']);
  expect('yes', 'a.b.c/file.ts', ['a.b.c/*']);
  expect('no', 'axbxc/file.ts', ['a.b.c/*']);

  if (failed) {
    console.error('Change-bounds self-test failed.');
    process.exit(1);
  }
  console.log('Change-bounds self-test passed.');
  process.exit(0);
}

const args = process.argv.slice(2);
if (args[0] === '--self-test' && args.length === 1) {
  selfTest();
} else if (args.length > 0) {
  console.error('Usage: check-bounds.mjs [--self-test]');
  process.exit(2);
}

if (git(['rev-parse', '--git-dir'], true) === null) {
  console.error('Run this script inside a Git repository.');
  process.exit(2);
}

const dirty = git(['status', '--porcelain']);
if (dirty) {
  console.error('pre-push: the working tree is not clean.');
  console.error('The pushed SHA must be the SHA that was verified. Commit or stash first.');
  console.error(git(['status', '--short']));
  process.exit(1);
}

const baseRef = ['origin/main', 'main'].find(
  (candidate) => git(['rev-parse', '--verify', '--quiet', candidate], true) !== null
);

if (!baseRef) {
  console.error('pre-push: no origin/main or main to compare against; fetch first.');
  process.exit(2);
}

const base = git(['merge-base', baseRef, 'HEAD']);
const changed = git(['diff', '--name-only', `${base}..HEAD`])
  .split('\n')
  .filter(Boolean);

if (changed.length === 0) {
  process.exit(0);
}

const bounds = git(['log', '-1', '--format=%(trailers:key=Change-Bounds,valueonly)', 'HEAD'])
  .split(/\s+/)
  .filter(Boolean);

if (bounds.length === 0) {
  console.error('pre-push: the tip commit has no Change-Bounds: trailer.');
  console.error('Declare the paths this branch touches, for example:');
  console.error('');
  console.error('  Change-Bounds: public/app/core/components/NestedFolderPicker/* public/locales/*');
  console.error('');
  console.error('Git only parses the last paragraph as trailers, so keep it in the');
  console.error('same block as Co-authored-by with no blank line between them.');
  process.exit(1);
}

const undeclared = changed.filter((filePath) => !covered(filePath, bounds));

if (undeclared.length === 0) {
  console.log(`Change-bounds: ${changed.length} changed files, all declared.`);
  process.exit(0);
}

console.error('pre-push: files changed outside the declared Change-Bounds:');
for (const filePath of undeclared) {
  console.error(`- ${filePath}`);
}
console.error('');
console.error(`Declared: ${bounds.join(' ')}`);
console.error("Revert them, or 'git commit --amend' to widen the trailer and say why in");
console.error('the PR. Widening is allowed. Widening silently is not.');
process.exit(1);
