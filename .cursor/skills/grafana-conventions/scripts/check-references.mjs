#!/usr/bin/env node

// Verify that every repository path cited by a Cursor skill or agent still
// exists, and that any `path:line` citation still has that many lines.
//
// Node rather than bash + python3: Node is already a hard dependency of this
// repository, while python3 is absent from stock Windows and from macOS without
// Xcode CLT. Pure bash would need `grep -P` and `realpath`, both GNU-only, so it
// would break on macOS. This runs identically on Windows, macOS, and Linux.
//
// Ceiling: detects moved or deleted paths. It cannot detect semantic drift, a
// citation that still resolves but no longer says what the citing file claims.

import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const SYNTHETIC = 'missing/reference.md:999';
const SYNTHETIC_LINE = 'AGENTS.md:999999';

const args = process.argv.slice(2);
const selfTest = args[0] === '--self-test';
if (args.length > 1 || (args.length === 1 && !selfTest)) {
  console.error('Usage: check-references.mjs [--self-test]');
  process.exit(2);
}

let root;
try {
  root = execFileSync('git', ['rev-parse', '--show-toplevel'], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'ignore'],
  }).trim();
} catch {
  console.error('Run this script inside a Git repository.');
  process.exit(2);
}

function markdownFilesIn(dir, recursive) {
  if (!fs.existsSync(dir)) {
    return [];
  }
  const found = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (recursive) {
        found.push(...markdownFilesIn(full, true));
      }
    } else if (entry.name.endsWith('.md')) {
      found.push(full);
    }
  }
  return found.sort();
}

const files = markdownFilesIn(path.join(root, '.cursor'), true);

const LINK = /\[[^\]]*\]\(([^)#]+)(?:#[^)]+)?\)/g;
const CODE = /`([^`\n]+)`/g;
const PATHISH =
  /(?<path>(?:\.\.?\/)?(?:[A-Za-z0-9_.-]+\/)*[A-Za-z0-9_.-]+\.(?:md|tsx|ts|go|yaml|yml|json|ini|cue|sh|mjs))(?::(?<line>[0-9]+))?/g;
const BARE_ALLOWED = new Set(['AGENTS.md', 'package.json', 'playwright.config.ts']);

const citations = [];
for (const citing of files) {
  const text = fs.readFileSync(citing, 'utf8');
  text.split('\n').forEach((line, index) => {
    const lineNo = index + 1;

    for (const match of line.matchAll(LINK)) {
      const target = match[1];
      if (!target.includes('://') && !target.includes('<') && !target.includes('>')) {
        citations.push({ citing, lineNo, raw: target });
      }
    }

    for (const codeMatch of line.matchAll(CODE)) {
      const code = codeMatch[1];
      if (code.includes('<') || code.includes('>') || code.includes('://')) {
        continue;
      }
      for (const match of code.matchAll(PATHISH)) {
        const raw = match.groups.line ? `${match.groups.path}:${match.groups.line}` : match.groups.path;
        const bare = raw.split(':')[0];
        if (!bare.includes('/') && !BARE_ALLOWED.has(bare)) {
          continue;
        }
        citations.push({ citing, lineNo, raw });
      }
    }
  });
}

if (selfTest) {
  const synthetic = path.join(root, '.cursor', 'skills', 'synthetic.md');
  citations.push({ citing: synthetic, lineNo: 1, raw: SYNTHETIC });
  citations.push({ citing: synthetic, lineNo: 2, raw: SYNTHETIC_LINE });
}

const relative = (file) => path.relative(root, file).split(path.sep).join('/');

const seen = new Set();
let failures = [];
let syntheticDetected = false;
let syntheticLineDetected = false;

for (const { citing, lineNo, raw } of citations) {
  const key = `${citing}\u0000${lineNo}\u0000${raw}`;
  if (seen.has(key)) {
    continue;
  }
  seen.add(key);

  let target = raw.replace(/[.,;)]+$/, '');
  let expectedLine = null;
  const withLine = /^(.*):([0-9]+)$/.exec(target);
  if (withLine) {
    target = withLine[1];
    expectedLine = Number(withLine[2]);
  }

  const candidates =
    target.startsWith('../') || target.startsWith('./')
      ? [path.resolve(path.dirname(citing), target)]
      : [path.resolve(root, target), path.resolve(path.dirname(citing), target)];

  const resolved = candidates.find((candidate) => {
    try {
      return fs.statSync(candidate).isFile();
    } catch {
      return false;
    }
  });

  if (!resolved) {
    failures.push(`${relative(citing)}:${lineNo} -> ${raw}`);
    syntheticDetected ||= raw === SYNTHETIC;
    continue;
  }

  if (expectedLine !== null) {
    const lines = fs.readFileSync(resolved, 'utf8').split('\n');
    if (lines.at(-1) === '') {
      lines.pop();
    }
    if (lines.length < expectedLine) {
      failures.push(`${relative(citing)}:${lineNo} -> ${raw} (file has ${lines.length} lines)`);
      syntheticLineDetected ||= raw === SYNTHETIC_LINE;
    }
  }
}

if (selfTest) {
  if (!syntheticDetected) {
    console.error('Self-test failed: the synthetic missing reference was not detected.');
    process.exit(1);
  }
  if (!syntheticLineDetected) {
    console.error('Self-test failed: the synthetic out-of-range line citation was not detected.');
    process.exit(1);
  }
  failures = failures.filter((failure) => !failure.includes(SYNTHETIC) && !failure.includes(SYNTHETIC_LINE));
  if (failures.length === 0) {
    console.log('Reference guard self-test passed.');
    process.exit(0);
  }
}

if (failures.length > 0) {
  console.error('Unresolved repository references:');
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log(`Checked ${seen.size} repository references across ${files.length} files.`);
