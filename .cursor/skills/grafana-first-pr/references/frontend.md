# Frontend contribution checks

Read this only for frontend changes. These are review footguns, not a substitute
for the nearest scoped instructions.

| # | Check | Source |
|---|---|---|
| 1 | Title a panel PR `<PanelName>Panel: <Summary>`; otherwise use `<Area>: <Summary>`. | `contribute/create-pull-request.md:113` |
| 2 | Bug fixes use `Fixes #<n>` and include a test reproducing the bug. Features without an issue do not invent one. | `contribute/create-pull-request.md:27` |
| 3 | A behavior test must fail without the change and pass with it. For a new feature, the red test proves the affordance is absent. | `.claude/skills/frontend-testing-strategy/SKILL.md:255` |
| 4 | Do not add DOM snapshot tests. | `contribute/create-pull-request.md:49` |
| 5 | Freeze expected values as literals; never recompute them with production collaborators. | `.claude/skills/frontend-testing-strategy/SKILL.md:64` |
| 6 | Bare existence, type, no-throw, and mirrored-length assertions do not establish behavior. | `.claude/skills/frontend-testing-strategy/SKILL.md:46` |
| 7 | Type mocks with `jest.mocked(fn)`, not a cast to `jest.MockedFunction`. | `.claude/skills/frontend-testing-strategy/SKILL.md:160` |
| 8 | Use `setTestFlags` or `testWithFeatureToggles`; never mock runtime internals for feature flags. | `.claude/skills/frontend-testing-strategy/SKILL.md:173` |
| 9 | Set up `userEvent`, await its methods, and prefer accessible role queries. | `contribute/style-guides/testing.md:7` |
| 10 | If fixed lint violations leave stale bulk suppressions, run `yarn lint:prune`. | `contribute/create-pull-request.md:65` |
| 11 | Use function declarations for React components, not `React.FC` or arrow component declarations. | `contribute/style-guides/frontend.md:345` |
| 12 | Prefer named exports and co-locate tests with their subject. | `contribute/style-guides/frontend.md:313` |
| 13 | Use Redux Toolkit `createSlice` and selectors. The legacy factory guidance in the PR guide is stale. | `contribute/style-guides/frontend.md:360`, `contribute/style-guides/redux.md:3` |
| 14 | `yarn test` watches by default. Use `yarn jest <path> --watchAll=false`. | `package.json` |
| 15 | Monorepo `yarn typecheck` is expensive. Run it when selector signatures, casts, or public types require it—not by reflex. | `.claude/skills/add-e2e-selectors/SKILL.md:320`, `.claude/skills/panel-testing-strategy/SKILL.md:197` |
| 16 | User-facing strings use `t()` or `Trans`; run `yarn i18n-extract` and commit generated locale output. | `.github/workflows/i18n-verify.yml`, `package.json` |
| 17 | Jest uses the English default string without extracted resources, so passing unit tests do not prove i18n output is current. | `public/test/setupTests.ts:29` |
| 18 | `CI=true` turns console output and React warnings into failures. Let debounced and asynchronous work settle. | `public/test/setupTests.ts:17` |

## Styling and accessibility

- Use Emotion and `useStyles2`; do not grow Sass.
- Prefer semantic controls over clickable icons.
- Use an existing selector or accessible query before adding a new versioned
  selector.
- Do not unit-test browser layout with class or style-string assertions. Use a
  focused Playwright test or walkthrough for actual layout behavior.

Sources: `contribute/style-guides/styling.md`,
`contribute/style-guides/accessibility.md`, and
`.claude/skills/add-e2e-selectors/SKILL.md`.
