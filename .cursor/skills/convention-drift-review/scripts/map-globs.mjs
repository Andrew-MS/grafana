// Shared by the drift collectors. Standard glob semantics: `**` crosses `/`,
// `*` does not, `{a,b}` alternates, anchored at both ends.
//
// Deliberately NOT shared with check-bounds.mjs. That one implements bash `[[ ]]`
// semantics, where `*` does cross `/`, because a Change-Bounds trailer is written
// by hand and `dir/*` there is expected to cover the subtree. Unifying them would
// silently change what a declared bound covers.

export function globToRegExp(glob) {
  let out = '';
  for (let i = 0; i < glob.length; i += 1) {
    const char = glob[i];
    if (char === '*') {
      if (glob[i + 1] === '*') {
        out += '.*';
        i += 1;
      } else {
        out += '[^/]*';
      }
    } else if (char === '{') {
      const close = glob.indexOf('}', i);
      if (close === -1) {
        out += '\\{';
      } else {
        const alternatives = glob.slice(i + 1, close).split(',');
        out += `(${alternatives.map((alt) => alt.replace(/[.+^${}()|[\]\\?*]/g, '\\$&')).join('|')})`;
        i = close;
      }
    } else if ('.+^$()|[]\\?'.includes(char)) {
      out += `\\${char}`;
    } else {
      out += char;
    }
  }
  return new RegExp(`^${out}$`);
}

// Column 1 of the routing table holds one or more backticked globs. Rows only:
// the map also has backticked paths in its prose, and reading those as routing
// globs would quietly widen apparent coverage. An `except` clause names a nested
// override that has its own earlier row, so only the text before it is routing.
export function mapGlobs(mapText) {
  const globs = [];
  for (const line of mapText.split('\n')) {
    if (!line.startsWith('| `')) {
      continue;
    }
    const firstColumn = line.split('|')[1].split(' except ')[0];
    for (const match of firstColumn.matchAll(/`([^`]+)`/g)) {
      globs.push(match[1]);
    }
  }
  return globs;
}

export function selfTestGlobs() {
  let failed = false;
  const expect = (expected, glob, filePath) => {
    const actual = globToRegExp(glob).test(filePath) ? 'yes' : 'no';
    if (actual !== expected) {
      console.error(`  expected ${expected}, got ${actual}: ${glob} vs ${filePath}`);
      failed = true;
    }
  };

  expect('yes', 'public/app/plugins/panel/**', 'public/app/plugins/panel/barchart/module.tsx');
  expect('no', 'public/app/plugins/panel/**', 'public/app/plugins/datasource/x.ts');
  expect('yes', 'public/app/features/{canvas,geo}/**', 'public/app/features/geo/utils.ts');
  expect('no', 'public/app/features/{canvas,geo}/**', 'public/app/features/alerting/x.ts');
  expect('yes', '**/*.cue', 'kinds/dashboard/dashboard.cue');
  expect('yes', 'conf/defaults.ini', 'conf/defaults.ini');
  expect('no', 'conf/defaults.ini', 'conf/custom.ini');
  // `*` must not cross a separator, or every row would look like it covers
  // everything beneath it and the coverage gap would always read as zero.
  expect('no', 'packages/*', 'packages/grafana-ui/src/index.ts');
  expect('yes', 'packages/**', 'packages/grafana-ui/src/index.ts');

  // The prose line matters: the map has backticked paths in its Known limits and
  // Maintenance protocol sections. The `except` cell matters too: its exclusion
  // is documentation, and reading it as a glob invents a row that owns nothing.
  const globs = mapGlobs(
    [
      '| `a/**` | x |',
      '| `b/*`, `c.ini` | y |',
      '| `d/**` except `d/e/` | z |',
      '| not a row |',
      '- `.cursor/skills/x/scripts/y.mjs` catches moved paths',
    ].join('\n')
  );
  if (globs.join(',') !== 'a/**,b/*,c.ini,d/**') {
    console.error(`  map glob extraction returned: ${globs.join(',')}`);
    failed = true;
  }

  return !failed;
}
