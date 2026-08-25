# Backend contribution checks

Read this only for Go/backend changes. The backend currently has no repository
skill equivalent to `frontend-testing-strategy`; this reference captures test
mechanics, not squad-specific test-quality judgment.

| # | Check | Source |
|---|---|---|
| 1 | Use `require` when failure must stop the test, especially for errors; use `assert` for soft checks. | `contribute/backend/style-guide.md:78` |
| 2 | Packages should define `TestMain` calling `testsuite.Run(m)` once; database tests require it. | `contribute/backend/style-guide.md:38` |
| 3 | Integration tests start with `TestIntegration` and skip in short mode. | `contribute/backend/style-guide.md:63`, `pkg/util/testutil/testutil.go:36` |
| 4 | Use `t.Run` for test cases, not to group assertions. | `contribute/backend/style-guide.md:86` |
| 5 | Prefer `t.Cleanup` to `defer` so helpers can register cleanup safely. | `contribute/backend/style-guide.md:91` |
| 6 | Testify mocks use `Once` or `Times` and `AssertExpectations`; use mockery for large interfaces. | `contribute/backend/style-guide.md:95` |
| 7 | Do not add globals merely because existing code contains them. | `contribute/backend/style-guide.md:186` |
| 8 | Prefer values; use pointers only for a concrete reason. | `contribute/backend/style-guide.md:192` |
| 9 | Do not add database foreign-key constraints; add uniqueness in migrations. | `contribute/backend/style-guide.md:206` |
| 10 | XORM `Insert` and `InsertOne` return affected-row counts, not generated primary keys. | `contribute/backend/style-guide.md:216` |
| 11 | Use `encoding/json` for new code; `simplejson` is legacy. | `contribute/backend/style-guide.md:224` |
| 12 | Run targeted tests, then the appropriate Go lint command. | `contribute/backend/style-guide.md:16` |
| 13 | Service initialization changes require Wire regeneration with `make gen-go`. | `AGENTS.md` |
| 14 | Unified storage clients and servers deploy separately; preserve compatibility in both directions. | `pkg/storage/unified/AGENTS.md` |

## Evidence expectations

- Assert concrete returned values and errors; do not stop at `NoError` or
  `NotNil`.
- Use a targeted package and `-run` expression during development.
- Run generation before the final commit when the changed subsystem requires
  it.
- Treat integration databases and build tags as contract assumptions, not
  invisible local setup.
