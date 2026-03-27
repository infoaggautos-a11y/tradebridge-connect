# D1 Dependency Audit

Date: 2026-03-19

Scope: frontend workspace at repository root

Environment:
- Node.js `v22.17.1`
- npm `10.9.2`

Command status:

| Command | Result | Notes |
|--------|--------|-------|
| `npm install` | PASS | Required running via `cmd /c npm install` because PowerShell script execution is disabled on this machine. Installed 501 packages. |
| `npm run build` | PASS | Succeeds outside sandbox. Vite build completed and produced `dist/`. Warning: main JS chunk is ~1.4 MB and exceeds Vite's default chunk-size warning threshold. |
| `npm run lint` | FAIL | Existing repo lint violations: 175 findings total, including 164 errors. Dominant issues are `@typescript-eslint/no-explicit-any`, `@typescript-eslint/no-require-imports`, `@typescript-eslint/no-empty-object-type`, and a `no-case-declarations` error. Failures span `src/`, `server/`, `api/`, and `supabase/functions/`. |
| `npm run test` | PASS | Succeeds outside sandbox. Current suite contains 1 passing test file: `src/test/example.test.ts`. |

Audit findings:
- Dependency installation works after allowing registry access.
- Build is currently healthy, but bundle size should be reviewed later.
- Test wiring is functional, but coverage is minimal.
- Lint is the only blocking command for the standard validation path.

Known environment-specific blockers:
- Running `npm` directly in PowerShell fails on this workstation because script execution is disabled for `npm.ps1`.
- Running `build` and `test` inside the sandbox caused `esbuild` spawn `EPERM`; both commands succeeded once executed outside the sandbox, so that was environmental rather than a project defect.

Recommended next tickets:
- `D1-002` verify `/server` dependency install path separately.
- `D1-003` standardize command behavior and decide whether lint should scope to the frontend only or the whole monorepo-style workspace.
