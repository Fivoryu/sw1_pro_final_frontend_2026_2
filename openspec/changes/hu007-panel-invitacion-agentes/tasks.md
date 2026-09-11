# Tareas — HU-007: invitación de agentes en el panel

**Cambio:** `hu007-panel-invitacion-agentes`  
**Trazabilidad:** PB-007 · HU-007 · CU-007 · RF-004/RF-006  
**Superficie:** `panel/` — React + TypeScript + Vite  
**Alcance:** exclusivamente panel Web. No se planifican cambios en backend, mobile, HU-006, HU-008 ni HU-009.

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | 100–180 líneas autorales (pruebas residuales y, solo si fallan, ajustes mínimos); 0 líneas de producto previstas por la implementación ya existente |
| 400-line budget risk | Low |
| Chained PRs recommended | No |
| Suggested split | Single PR: slice panel-only HU-007 |
| Delivery strategy | ask-on-risk |
| Chain strategy | pending |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: pending
400-line budget risk: Low

## Evidencia ya realizada (no repetir como implementación)

La integración funcional ya está presente y fue inspeccionada en estos archivos; estas tareas registran el estado, no solicitan reimplementarla:

- [x] Conservar la composición pública/autenticada de `src/App.tsx`, incluyendo `#token=` sin sesión y `AgentInvitationAcceptancePage`. <!-- sdd-owner: implementation -->
- [x] Conservar en `src/data/apiClient.ts` los paths administrativos y públicos, el token en body y la aceptación condicional de credenciales. <!-- sdd-owner: implementation -->
- [x] Conservar en `src/application/userManagementService.ts` la separación entre `SessionService` para gestión administrativa y `ApiClient` público para inspección/aceptación. <!-- sdd-owner: implementation -->
- [x] Conservar en `src/features/user-management/UserManagementPage.tsx` los cuatro estados, fechas, fallo de entrega, emisión/reinvitación y mensaje de membresía pendiente. <!-- sdd-owner: implementation -->
- [x] Conservar en `src/features/agent-invitations/AgentInvitationAcceptancePage.tsx` la inspección, contraseña condicional, reintentos, estado no utilizable y aceptación sin login automático. <!-- sdd-owner: implementation -->
- [x] Conservar la cobertura existente en `src/data/apiClient.test.ts`, `src/data/agentInvitations.test.ts`, `src/features/user-management/UserManagementPage.test.tsx` y `src/features/agent-invitations/AgentInvitationAcceptancePage.test.tsx`; su existencia no equivale todavía a ejecución en esta fase. <!-- sdd-owner: implementation -->

## Implementación y verificación residual (orden RED → GREEN → TRIANGULATE → REFACTOR)

### RED — demostrar las brechas residuales

- [x] Añadir pruebas fallantes focalizadas en `src/data/agentInvitations.test.ts` para `acceptAgentInvitation`: body con `token`, `password` y `password_confirmation` para cuenta nueva, y body únicamente con `token` para cuenta existente; verificar ausencia de campos vacíos. <!-- sdd-owner: implementation -->
- [x] Añadir pruebas fallantes en `src/application/userManagementService.test.ts` con dobles de `SessionService` y `InvitationApi`: listar/crear deben pasar por la sesión, inspeccionar/aceptar por el cliente público y ninguna petición debe incluir `tenant_id`. <!-- sdd-owner: implementation -->
- [x] Añadir, si el arnés actual lo permite sin introducir otro router, una prueba de composición en `src/App.test.tsx` para hash público sin sesión frente a superficie autenticada. Si el montaje no es viable, documentar la limitación concreta en la evidencia de verificación. <!-- sdd-owner: implementation -->
- [x] Ampliar las pruebas de componentes en `src/features/user-management/UserManagementPage.test.tsx` y `src/features/agent-invitations/AgentInvitationAcceptancePage.test.tsx` con promesas diferidas: emisión, reinvitación y aceptación deben bloquear doble envío mientras están pendientes; verificar retry posterior sin llamada concurrente ni reintento automático. <!-- sdd-owner: implementation -->
- [x] Completar casos de mensajes seguros en `src/data/apiClient.test.ts` y/o pruebas de componentes para los códigos HU-007, comprobando que nunca aparecen token, contraseña, JWT, detalle interno ni `tenant_id` en texto visible o errores presentados. <!-- sdd-owner: implementation -->

### GREEN — cerrar únicamente las brechas del panel

- [x] Implementar solo los ajustes mínimos dentro de `panel/src/` necesarios para que las pruebas RED pasen; no crear endpoints, cambiar contratos, tocar `SessionService`/`SubscriptionService` sin regresión demostrada ni eliminar consumidores locales. <!-- sdd-owner: implementation -->

### TRIANGULATE — comprobar seams y límites

- [x] Triangular los escenarios con dobles de transporte/servicio y consumidores reales (`src/App.tsx`, `src/application/userManagementService.ts`, ambas páginas): confirmar métodos, paths, payloads, estados, mensajes seguros y membresía `pending` sin activación, permisos, RBAC o login automático. <!-- sdd-owner: implementation -->
- [x] Buscar y registrar consumidores legacy de `UserRepository`, `InMemoryUserRepository`, fixtures de `domain/user.ts` y el modo local HU-03 en `panel/src/`; demostrar que siguen aislados y no se eliminan ni se mezclan con el modo de invitaciones. <!-- sdd-owner: implementation -->
- [x] Revisar estáticamente el alcance de cambios para confirmar que no hay referencias ni modificaciones en backend, mobile, worker 3D, contracts, HU-006, HU-008 o HU-009. Mantener explícitamente CP-006 fuera de ejecución y sin declaración de cumplimiento. <!-- sdd-owner: implementation -->

### REFACTOR — dejar el slice verificable

- [x] Simplificar o ajustar únicamente las pruebas residuales de `panel/src/**/*.test.{ts,tsx}` y cualquier cambio mínimo de `panel/src/` sin alterar el comportamiento ya integrado; mantener nombres y mensajes en español donde corresponda y código en inglés. <!-- sdd-owner: implementation -->
- [x] Ejecutar desde `panel/` `npm run test:run` (Vitest) y `npm run build` (`tsc --noEmit && vite build`), registrar fecha, comandos, códigos de salida, archivos/pruebas ejecutados y resumen real; no reutilizar evidencia histórica ni declarar resultados no ejecutados. <!-- sdd-owner: implementation -->
- [x] Revisar el diff final y contar adiciones + eliminaciones autorales; detenerse y solicitar decisión únicamente si el cambio real se aproxima o supera 400 líneas o exige salir de panel-only. No usar una excepción de tamaño no autorizada. <!-- sdd-owner: implementation -->

## Acciones de cierre y revisión

- [x] Iniciar o reutilizar una revisión acotada del slice panel-only y comprobar que la evidencia distingue pruebas preparadas de pruebas ejecutadas. Se reutilizó la revisión nativa `review-b47331e83d4fbc24`; el cierre `approved` fue reconocido y la autoridad quedó consumida. La revisión reportó R3-001 y R3-002 como hallazgos no bloqueantes; no se confundieron pruebas preparadas con pruebas ejecutadas. <!-- sdd-owner: parent -->
- [x] Mantener CP-006 sin ejecutar y sin declararlo cumplido en cualquier reporte de apply/verify/archive; el resultado de esta partición solo cubre evidencia reproducida del panel. CP-006 permanece explícitamente fuera de alcance y no ejecutado. <!-- sdd-owner: parent -->

## Límites, rollback y salida

El rollback de cualquier ajuste consiste en revertir solo pruebas o cambios mínimos de `panel/src/` asociados a HU-007 y retirar este directorio OpenSpec si se cancela. No se borran datos ni se modifican backend, mobile, otras HU o contratos. No se configuran métricas porcentuales de cobertura, no se ejecuta integración real contra backend/SMTP y no se promete limpieza del hash del navegador.

La salida queda lista para `verify` cuando las tareas de implementación estén marcadas, la búsqueda de consumidores legacy esté registrada, la suite Vitest y el build tengan evidencia real, y CP-006 permanezca explícitamente fuera del cierre.
