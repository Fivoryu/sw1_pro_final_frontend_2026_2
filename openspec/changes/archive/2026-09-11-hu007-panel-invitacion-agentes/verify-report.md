```yaml
schema: gentle-ai.verify-result/v1
evidence_revision: sha256:c18f99e69a6bdeec97eb2c1309500da3df44ce6816fe6031ad8160ad4472fd6a
verdict: pass
blockers: 0
critical_findings: 0
requirements: 6/6
scenarios: 15/15
test_command: npm run test:run
test_exit_code: 0
test_output_hash: sha256:38a73ff4273f6d873841fde2b069519af373531bc7f55841bdd7bcc482c66f99
build_command: npm run build
build_exit_code: 0
build_output_hash: sha256:c290c7317091a3d17cb42c6f2a3a90d7ee53e85acbed9f0dec2d1f2c4ebaf31b
```

# Informe de verificación independiente — HU-007 Invitación de agentes

**Cambio:** `hu007-panel-invitacion-agentes`  
**Fecha:** 2026-09-11 19:07 (-04:00)  
**Repositorio:** `D:/Universidad/Proyectos/2doSemestre2026/sw1/proyecto_final/panel`  
**Veredicto:** **PASS**

## Resumen ejecutivo

La remediación queda verificada independientemente. La tabla `TDD Cycle Evidence` de `apply-progress.md` identifica las cinco pruebas residuales como escritas (`Written`) y registra su ejecución real mediante la focused suite: 5 archivos y 22 tests aprobados. La evidencia no inventa una ejecución RED histórica: documenta únicamente que las pruebas están escritas y que fueron ejecutadas posteriormente con resultado verde.

`src/application/userManagementService.test.ts` ya inspecciona `Object.keys(requestOptions)` y, cuando corresponde, `Object.keys(body)` para comprobar la ausencia de `tenant_id`; no usa `flat()`.

No quedan tareas de implementación sin marcar (20/20). Las pruebas focused, la suite completa, el build y `git diff --check` pasan. El resultado cubre exclusivamente el panel Web; CP-006 no se ejecutó.

## Artefactos y estado estructurado

Se leyeron `proposal.md`, la especificación compartida `../openspec/changes/hu007-invitacion-agentes/specs/agent-invitations/spec.md`, `design.md`, `tasks.md`, `apply-progress.md`, el verify-report previo y `openspec/config.yaml`.

- El status nativo identifica inequívocamente el cambio y reporta `tasks: 20/20 complete`.
- `actionContext.mode`: `repo-local`.
- `workspaceRoot`: repositorio `panel`.
- `allowedEditRoots`: repositorio `panel`.
- La selección de ownership y archivos es demostrable dentro del workspace.
- El status nativo todavía muestra `next: remediate`, `verify: blocked` y `remediationState.complete: false` por la revisión pendiente de la evidencia fallida `sha256:64bc33d1d7031c135e33070b3409541efa76a7562ad6aa5e1922c4d413c9f88f`. Esto es estado operativo pendiente de settle por el parent, no un blocker de esta nueva ejecución: este informe tiene `blockers: 0`.

## Cobertura de requisitos y escenarios

La cobertura panel-scoped es **6/6 requisitos y 15/15 escenarios**. Se verificó por inspección y pruebas:

1. Separación administrativa autenticada/pública, paths, payloads y ausencia de `tenant_id` aportado por el cliente.
2. Token únicamente en body, nunca en URL, UI ni mensajes de error; aceptación condicional de credenciales.
3. Estados `pending`, `accepted`, `invalidated` y `expired`, fechas, fallo de entrega y reinvitación segura.
4. Ruta pública sin sesión, inspección, enlace no utilizable y reintento.
5. Aceptación para cuenta nueva/existente, membresía `pending`, sin login automático, activación ni permisos.
6. Errores seguros, reintentos explícitos y bloqueo de doble envío durante emisión/reinvitación/aceptación.

Las garantías backend-only de persistencia, hashing, transacciones, concurrencia, SMTP y autorización server-side no se declaran probadas por este cambio panel-only; se mantienen como límites documentados. CP-006 queda fuera de ejecución y no se declara cumplido.

## Estado de tareas

`tasks.md` contiene 20/20 tareas completas. La búsqueda de marcadores de implementación `^\s*- \[ \].*sdd-owner: implementation` no devolvió líneas. No hay tareas de implementación pendientes ni scope creep observado.

## Strict TDD

Strict TDD está activo en `openspec/config.yaml` y en la evidencia de apply.

| Check | Resultado | Evidencia |
|---|---|---|
| Tabla TDD Cycle Evidence | PASS | Existe en `apply-progress.md`. |
| Cinco pruebas residuales Written | PASS | Se enumeran los cinco archivos residuales en la fila RED y las cinco tareas están marcadas. |
| Ejecución real | PASS | Focused suite actual: 5 archivos/22 tests; suite completa actual: 14 archivos/64 tests. |
| RED histórico | Conforme | No se inventa un fallo RED previo; la evidencia distingue pruebas escritas de ejecución posterior. |
| GREEN | PASS | Focused y suite completa permanecen verdes. |
| TRIANGULATE/REFACTOR | PASS | Se inspeccionaron seams, consumidores, payloads, estados, mensajes, alcance y regresión; build y diff check pasan. |

### Archivos de pruebas cruzados

- `src/data/agentInvitations.test.ts`: payload de cuenta nueva con `token`, `password`, `password_confirmation`; cuenta existente con solo `token`.
- `src/application/userManagementService.test.ts`: dobles de `SessionService`/`InvitationApi`, rutas administrativas/públicas y claves de opciones/body sin `tenant_id`.
- `src/App.test.tsx`: hash público sin sesión y ausencia del token en texto visible.
- `src/features/user-management/UserManagementPage.test.tsx`: estados, errores, reinvitación y promesa diferida que bloquea doble envío.
- `src/features/agent-invitations/AgentInvitationAcceptancePage.test.tsx`: credenciales condicionales, estados no utilizables, retry y promesa diferida que bloquea doble aceptación.
- `src/data/apiClient.test.ts`: códigos HU-007, errores seguros y no exposición en URLs/mensajes.

## Calidad de aserciones

No se detectaron tautologías, ghost loops, pruebas smoke-only, aserciones únicamente de tipos ni aserciones sin llamada significativa a producción. La corrección remediada inspecciona explícitamente las claves de `requestOptions` y `body`, por lo que elimina la debilidad previa de `request.mock.calls.flat()`.

Las expectativas verifican resultados observables: paths, métodos, bodies, llamadas a seams, texto visible, estados ARIA, botones deshabilitados, reintentos y cantidad de llamadas. No se encontraron aserciones CSS de detalle de implementación.

## Validación ejecutada

Ejecutado desde `panel/` el 2026-09-11:

```text
npx vitest run src/App.test.tsx src/data/agentInvitations.test.ts src/application/userManagementService.test.ts src/features/user-management/UserManagementPage.test.tsx src/features/agent-invitations/AgentInvitationAcceptancePage.test.tsx
```

- Exit code: `0`.
- Vitest `v3.2.7`.
- Resultado: **5 test files passed; 22 tests passed**.

```text
npm run test:run
```

- Exit code: `0`.
- Resultado: **14 test files passed; 64 tests passed**.
- Output hash: `sha256:38a73ff4273f6d873841fde2b069519af373531bc7f55841bdd7bcc482c66f99`.

```text
npm run build
```

- Exit code: `0`.
- Ejecutó `tsc --noEmit && vite build`.
- Resultado: TypeScript correcto, Vite transformó 40 módulos y produjo el build.
- Output hash: `sha256:c290c7317091a3d17cb42c6f2a3a90d7ee53e85acbed9f0dec2d1f2c4ebaf31b`.

```text
git diff --check
```

- Exit code: `0`; sin salida.

No se ejecutó CP-006, integración backend, SMTP ni pruebas E2E. No hay métrica de cobertura porcentual configurada.

## Alcance y review workload

El alcance observado es panel-only. Los cambios de trabajo actuales son únicamente `openspec/changes/hu007-panel-invitacion-agentes/apply-progress.md` y `src/application/userManagementService.test.ts`, además de este verify-report; no se modificó código de producto fuera del test corregido. No hubo backend, mobile, worker 3D, contracts, HU-006, HU-008 ni HU-009.

El forecast original era 100–180 líneas y no recomendaba cadena. Apply documenta un conteo de 514 líneas y una decisión explícita `size:exception`, autorizada por el usuario y restringida a panel-only. Se confirma esa frontera, sin inventar una nueva excepción ni una cadena PR. No se hizo commit ni push.

## Blockers exactos

Ninguno. El status nativo conserva un bloqueo operativo anterior hasta que el parent haga settle de la remediación con la revisión de evidencia indicada; no se reabre ni se adquiere otra remediación.

## Key Learnings

- La evidencia TDD debe decir explícitamente `Written` y separar esa condición de cualquier RED histórica no observada.
- Para verificar exclusiones dentro de requests, deben inspeccionarse las claves de las opciones y del body, no aplanar valores con `flat()`.
- El panel puede cerrarse con evidencia verde independiente sin convertir CP-006 ni la integración backend/SMTP en alcance implícito.
