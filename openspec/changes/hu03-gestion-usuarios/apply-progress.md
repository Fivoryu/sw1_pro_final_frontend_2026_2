# Apply progress — HU-03 Gestión de usuarios

## Estado de fase

- **Cambio:** `hu03-gestion-usuarios`
- **Repositorio autorizado:** `panel/` independiente
- **Slice:** `panel-local`
- **Estado:** `complete` — el bookkeeping final de apply quedó completado después de la aceptación explícita del conteo medido
- **Próxima acción:** `ready-for-verify` — todas las tareas de implementación están marcadas y la siguiente fase puede verificar el slice
- **Modo:** Strict TDD activo; esta continuación fue exclusivamente de bookkeeping y no ejecutó un nuevo ciclo TDD, pruebas ni build. El intento nativo permanece bajo responsabilidad del orquestador.
- **Review:** no se inició review; no se crearon receipts.
- **Entrega:** no hubo commit, push ni PR.

## Status consumido/producido

```yaml
schemaName: spec-driven
changeName: hu03-gestion-usuarios
artifactStore: hybrid
planningHome:
  root: D:/universidad/Proyectos/2doSemestre2026/sw1/proyecto_final/panel
  changesDir: openspec/changes
changeRoot: openspec/changes/hu03-gestion-usuarios
artifacts:
  proposal: done
  specs: done
  design: done
  tasks: done
  applyProgress: done
  verifyReport: missing
applyState: all_done
dependencies:
  apply: all_done
  verify: ready
  sync: not_applicable
  archive: blocked
taskProgress:
  total: 18
  complete: 18
  remaining: 0
deferredParentActions:
  total: 0
  complete: 0
  remaining: 0
actionContext:
  mode: repo-local
  workspaceRoot: D:/universidad/Proyectos/2doSemestre2026/sw1/proyecto_final/panel
  allowedEditRoots:
    - D:/universidad/Proyectos/2doSemestre2026/sw1/proyecto_final/panel
  warnings:
    - Parent retains native runtime attempt token and will settle it.
    - Untracked scope remains excluded from candidate review per parent context.
nextRecommended: verify
isNonAuthoritative: false
```

The native status consumed for this continuation was authoritative for the hybrid session because the panel-local `openspec/` directory exists: `applyState: ready`, `apply: ready`, `verify: blocked`, `taskProgress: 17/18`, `actionContext.mode: repo-local`, and the allowed edit root was the panel repository. The parent retains the active native runtime attempt token and will settle it. The post-update native status confirmed `applyState: all_done`, `apply: all_done`, `verify: ready`, `taskProgress: 18/18`, and `nextRecommended: verify`; no verify report exists yet. Engram search/read was initially unavailable, but the merged apply-progress artifact was saved under topic key `sdd/hu03-gestion-usuarios/apply-progress` after the file update.

## Completed implementation tasks and checkbox evidence

The following 18 implementation-owned rows were completed and marked `[x]` in `openspec/changes/hu03-gestion-usuarios/tasks.md`, preserving the terminal `<!-- sdd-owner: implementation -->` marker:

1. Bootstrap React/TypeScript/Vite and confirm Node `v22.23.0`, npm `10.9.8`, no prior manifest/lockfile/source, and no other package manager.
2. Configure Vitest, jsdom, Testing Library setup, scripts, and npm dependencies. `npm install` reported 161 packages added and 0 vulnerabilities.
3. RED domain/data tests written before their production imports.
4. GREEN domain/data implementation completed.
5. TRIANGULATE domain/data with fixture cloning, repeated emails, same-id update, missing-record rejection, and no destructive/storage methods.
6. Domain/data refactor gate completed with the focused suite green; no behavior-changing refactor was necessary.
7. RED service tests written before `userManagementService.ts` existed.
8. GREEN application service completed with validation before mutation and explicit four-operation API.
9. TRIANGULATE service with repository double and real in-memory adapter, including repeated email, update count, inactive status, and `UserNotFoundError`.
10. Service refactor gate completed with focused tests green and forbidden-boundary scan clean.
11. RED component tests written before `UserManagementPage.tsx` existed.
12. GREEN page/App/main implementation completed with stable service injection, CRUD flows, validation focus, loading/retry, and controlled errors.
13. Responsive/accessibility styles and Spanish local-scope notice completed.
14. UI TRIANGULATE completed through Testing Library behavior checks for loading, keyboard focus order, field ARIA attributes, success/error regions, create/edit/cancel/deactivate, controlled errors, and reload-safe local behavior; static boundary scan passed.
15. UI refactor gate completed while green; no scope-expanding refactor introduced.
16. Boundary tests/checks and static configuration checks completed; implementation has no HTTP, browser storage, auth/RBAC/audit, endpoint, or HU-003 verification implementation references.
17. Final test/build task completed with actual passing commands below.
18. Final diff/size review completed at 489 authorial lines after explicit user acceptance of the one-slice size exception; no scope expansion was found.

## Completed final diff/size-review task (persisted checkbox)

The exact remaining implementation-owned line was completed and is now persisted as:

```text
- [x] Revisar `git diff --stat` y las rutas modificadas del repositorio independiente `panel/`, contar adiciones y eliminaciones autorales separando el lockfile generado, y detenerse para decisión `ask-on-risk` si se supera el presupuesto o aparece una necesidad fuera de HU-03; rollback: retirar solo el slice de `panel/` y sus pruebas/configuración. <!-- sdd-owner: implementation -->
```

The review measured **489 authorial lines**: **412 under `src/` plus 77 bootstrap/configuration lines**, excluding generated `package-lock.json`, `node_modules`, and `dist`. This exceeds the forecast/native 425-line bound by 64 lines. No scope expansion was found. The user explicitly accepted continuing with the measured 489-line authorial candidate in one slice, so the size exception is recorded as a delivery decision rather than hidden by the checkbox. No source code changed in this continuation.

## Files changed inside allowed surfaces

- `package.json`
- `package-lock.json` (npm-generated; not manually edited)
- `index.html`
- `tsconfig.json`
- `tsconfig.app.json`
- `tsconfig.node.json`
- `vite.config.ts`
- `src/main.tsx`
- `src/App.tsx`
- `src/styles.css`
- `src/test/setup.ts`
- `src/domain/user.ts`
- `src/domain/user.test.ts`
- `src/data/UserRepository.ts`
- `src/data/InMemoryUserRepository.ts`
- `src/data/InMemoryUserRepository.test.ts`
- `src/data/fixtures/users.ts`
- `src/application/userManagementService.ts`
- `src/application/userManagementService.test.ts`
- `src/features/user-management/UserManagementPage.tsx`
- `src/features/user-management/UserManagementPage.test.tsx`
- `openspec/changes/hu03-gestion-usuarios/tasks.md`
- `openspec/changes/hu03-gestion-usuarios/apply-progress.md`

No files under `backend/`, Flutter, the monorepo root, or outside `panel/` were edited. `dist/` and `node_modules/` were generated only for verification and are not implementation surfaces.

## Verification evidence

The evidence in this section is historical apply evidence from the prior implementation run. This bookkeeping-only continuation did not rerun tests or build and claims no new test or build result.

### Toolchain/bootstrap

- `node --version` → `v22.23.0`
- `npm --version` → `10.9.8`
- `npm install` → `added 161 packages, and audited 162 packages`; `found 0 vulnerabilities`
- `npm run build` after bootstrap → Vite production build passed (`vite v6.4.3`)
- `npm run test:run -- --passWithNoTests` → Vitest `v3.2.7`, no test files found, exit code 0

### Strict TDD RED → GREEN → TRIANGULATE → REFACTOR

| Task group | Test file(s) | Layer | Safety net | RED | GREEN | TRIANGULATE | REFACTOR |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Domain/data | `src/domain/user.test.ts`, `src/data/InMemoryUserRepository.test.ts` | Unit/adaptor | N/A (new) | Import resolution failed before production files existed | 6 focused tests passed | 6 tests passed with clones, duplicate emails, same-id update, missing record, and destructive-method absence | Green gate passed; no behavior-changing refactor needed |
| Application | `src/application/userManagementService.test.ts` | Service unit + real adapter | N/A (new) | Import resolution failed before service existed | 4 focused tests passed | Double + real adapter, repeated email, update count, inactive state, controlled error, and `UserNotFoundError` passed | Green gate passed; explicit injection and boundary scan retained |
| UI | `src/features/user-management/UserManagementPage.test.tsx` | React/jsdom component | N/A (new) | Import resolution failed before page existed | 5 component tests passed | Real adapter + controlled doubles, create/edit/cancel/deactivate, validation, ARIA/focus, load retry, mutation error passed | Green gate passed; no scope-expanding refactor |

### TDD Cycle Evidence

| Task group | Test file(s) | RED | GREEN | TRIANGULATE | SAFETY NET | REFACTOR |
| --- | --- | --- | --- | --- | --- | --- |
| Domain/data | `src/domain/user.test.ts`, `src/data/InMemoryUserRepository.test.ts` | ✅ Written | ✅ Passed | ✅ 6 cases | N/A (new) | ✅ Green gate passed |
| Application | `src/application/userManagementService.test.ts` | ✅ Written | ✅ Passed | ✅ 4 cases | N/A (new) | ✅ Green gate passed |
| UI | `src/features/user-management/UserManagementPage.test.tsx` | ✅ Written | ✅ Passed | ✅ 5 cases | N/A (new) | ✅ Green gate passed |

### Actual test commands

- `npm run test:run -- src/domain/user.test.ts src/data/InMemoryUserRepository.test.ts` → 2 files, 6 tests passed.
- `npm run test:run -- src/application/userManagementService.test.ts` → 1 file, 4 tests passed.
- `npm run test:run -- src/features/user-management/UserManagementPage.test.tsx` → 1 file, 5 tests passed.
- Final `npm run test:run` → **4 files passed, 15 tests passed**.
- Final `npm run build` → **passed**, TypeScript check and Vite production bundle completed.

### Boundary/manual checks

- Static scan over `src/application`, `src/data`, and `src/features` for `fetch`, browser storage, HTTP/API paths, authorization, RBAC, and audit terms → `PASS: no forbidden HTTP/storage/auth/RBAC/audit implementation references.`
- Dev-server smoke check: `npm run dev -- --host 127.0.0.1` plus `curl http://127.0.0.1:5173/` → Spanish HTML entry served with `lang="es"`, HU-03 title, and `/src/main.tsx` entry.
- Component tests exercised loading/retry, keyboard focus order, `aria-required`, `aria-invalid`, `aria-describedby`, `aria-busy`, `role=status`, `role=alert`, responsive class structure, create/edit/cancel/deactivate, and local-only messaging.
- No browser automation or visual viewport tool was available; 375px/768px/orientation behavior is represented by responsive CSS and remains a verify-phase manual check.

## Deviations from design

- The implementation remains entirely local and in-memory as designed; no HTTP, storage, persistence, authentication, authorization, RBAC, audit, formal email validation/uniqueness, catalog, search, filter, pagination, delete, reactivation, or HU-003 verification was added.
- `status` is displayed as its local value except the required local `inactive` marker, which is presented as `Inactivo`; role/status remain unconstrained strings.
- The design's expected 395-line target was exceeded by the complete TDD/tooling/UI evidence set. The measured authorial candidate is 489 lines (412 under `src/` plus 77 bootstrap/configuration lines), excluding generated `package-lock.json`, `node_modules`, and `dist`. The user explicitly accepted the 489-line one-slice continuation; this does not expand HU-03 or the `panel-local` boundary.

## TDD Test Summary

- **Total tests written:** 15
- **Total tests passing:** 15
- **Layers:** unit/adaptor (10), React/jsdom component (5)
- **Approval tests:** none; this was a new implementation
- **Pure functions created:** `validateUserDraft`, `normalizeUserDraft`, `cloneUser`

## Key Learnings

- The panel had no pre-existing toolchain; establishing npm/Vitest/jsdom first made strict TDD executable without touching other repositories.
- The local repository seam kept the UI independent from unapproved backend/API assumptions while still allowing real-adapter triangulation.
- Controlled Spanish feedback and explicit local-scope copy prevent the demo from implying persistence or real authorization.
- The complete test/tooling surface is larger than the planned 425-line native bound even without generated lockfile lines; the accepted 489-line exception is delivery-size governance, not a functional correctness claim.
