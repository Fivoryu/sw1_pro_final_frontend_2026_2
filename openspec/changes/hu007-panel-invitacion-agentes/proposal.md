# Propuesta — HU-007 Invitación de agentes (panel-only)

## 1. Estado e identificación

- **Cambio:** `hu007-panel-invitacion-agentes`
- **Repositorio objetivo:** `D:/Universidad/Proyectos/2doSemestre2026/sw1/proyecto_final/panel`
- **Superficie:** panel Web React/TypeScript/Vite
- **Trazabilidad:** PB-007 · HU-007 · CU-007 · RF-004/RF-006
- **Estado:** propuesta inicializada; integración de panel ya presente; cobertura residual pendiente
- **Estrategia:** cierre independiente por superficie, autorizado por el usuario
- **Presupuesto:** solo panel; no se solicita excepción de tamaño

Esta propuesta no duplica los artefactos del cambio compartido `D:/Universidad/Proyectos/2doSemestre2026/sw1/proyecto_final/openspec/changes/hu007-invitacion-agentes/`. Se usaron como contexto para identificar las reglas del contrato y la partición ya autorizada, y se conserva aquí únicamente la evidencia observable del panel y lo que todavía falta verificar en esta superficie.

## 2. Intención

Registrar y verificar de forma independiente la partición Web de HU-007 que ya está integrada en `panel/`, sin reabrir la implementación backend ni convertir esta propuesta en un cierre de CP-006. El resultado esperado es que el panel consuma los contratos de invitación existentes en su seam HTTP, presente los estados de invitación de forma no sensible y permita la aceptación pública con contraseña condicional, manteniendo la membresía como pendiente.

## 3. Integración existente observada

### Composición y navegación

- `src/App.tsx` compone `ApiClient`, `SessionService`, `SubscriptionService` y `UserManagementService`.
- La ruta pública mínima se selecciona cuando no hay sesión y el fragmento comienza con `#token=`; renderiza `AgentInvitationAcceptancePage`.
- El flujo autenticado conserva el dashboard de suscripción y muestra `UserManagementPage` en modo de invitaciones.
- No se observó una mutación de `SubscriptionService`, login ni lógica de activación/RBAC para HU-007.

### Cliente API y seam de aplicación

- `src/data/apiClient.ts` define tipos para invitaciones, inspección y aceptación.
- Las operaciones administrativas usan:
  - `GET /api/v1/tenant/agent-invitations`
  - `POST /api/v1/tenant/agent-invitations`
- Las operaciones públicas usan:
  - `POST /api/v1/agent-invitations/inspect`
  - `POST /api/v1/agent-invitations/accept`
- El token se envía en el body; no se concatena a una URL.
- `UserManagementService` usa `SessionService.request` para listar/crear invitaciones y `ApiClient.request` público para inspeccionar/aceptar.
- El panel no envía `tenant_id` en la operación de creación.
- Los errores de red, enlace no utilizable, contraseña inválida, membresía existente, membresía pendiente y correo inválido se convierten en mensajes seguros para la UI.

### Superficie administrativa

`src/features/user-management/UserManagementPage.tsx` ya contiene el modo `InvitationManagement`, que:

- carga y lista invitaciones;
- representa `pending`, `accepted`, `invalidated` y `expired`;
- muestra fallo de entrega sin mostrar el enlace;
- permite emitir y reinvitar mediante la misma operación de creación;
- muestra estados de carga, vacío, error de red, reintento y conflicto de membresía;
- comunica que la aceptación produce una membresía pendiente;
- no presenta activación, desactivación, permisos ni RBAC.

Los artefactos locales de HU-03 (`domain/user.ts`, repositorio en memoria y fixtures) siguen siendo consumidores del modo legado y no se eliminan como parte de esta partición.

### Ruta pública de aceptación

`src/features/agent-invitations/AgentInvitationAcceptancePage.tsx` ya:

- obtiene el token desde el fragmento y lo mantiene fuera del texto visible;
- ejecuta inspección pública;
- solicita contraseña y confirmación solo cuando `requires_password` es verdadero;
- acepta sin credenciales cuando la cuenta global ya existe según la inspección;
- muestra un mensaje no sensible para enlaces inválidos, expirados, reemplazados o utilizados;
- permite reintentar la inspección y la aceptación;
- informa que la membresía queda pendiente y no inicia sesión automáticamente.

## 4. Alcance de esta partición

### Incluido

1. Documentar la integración de panel ya existente descrita en esta propuesta.
2. Consolidar la cobertura Vitest existente de:
   - requests y payloads del cliente API;
   - token en body y ausencia del token en URL/UI;
   - mapeo de errores seguros;
   - seam autenticado/público del flujo de invitaciones;
   - estados administrativos, reinvitación y fallo de red;
   - inspección, contraseña condicional, aceptación pendiente y conflicto de membresía.
3. Identificar y cerrar únicamente la cobertura residual del panel que sea necesaria para verificar esos comportamientos.
4. Registrar evidencia reproducible del build y de la suite del panel cuando se ejecute en la fase de verificación.

### No incluido

- Cambios en `backend/`, migraciones, modelos, notificador o PostgreSQL.
- Cambios en mobile, worker 3D, contratos o raíz del monorepo.
- HU-006, HU-008 o HU-009.
- Ejecución o cierre de CP-006.
- Activación, desactivación, revocación, reactivación, cuotas, permisos o RBAC.
- Modificación de la lógica de autenticación o suscripción existente.
- Nuevos contratos HTTP: el panel solo verifica el seam ya integrado.
- Commits o push.

## 5. Cobertura y evidencia residual del panel

### Evidencia observable existente

Los siguientes archivos contienen cobertura específica de HU-007 y fueron inspeccionados en el repositorio panel:

| Área | Evidencia existente |
|---|---|
| Cliente y errores | `src/data/apiClient.test.ts`: mapeo de códigos, mensajes seguros, errores HTTP/red/respuesta malformada y ausencia de secretos en URLs. |
| Requests de invitación | `src/data/agentInvitations.test.ts`: inspección con token en body, paths públicos y requests administrativos. |
| Servicio | `src/application/userManagementService.ts`: separación de operaciones autenticadas y públicas; convive con el adaptador local legado. |
| Gestión administrativa | `src/features/user-management/UserManagementPage.test.tsx`: cuatro estados, reinvitación, entrega fallida, vacío, reintento, red y conflicto de membresía. |
| Aceptación pública | `src/features/agent-invitations/AgentInvitationAcceptancePage.test.tsx`: contraseña para cuenta nueva, cuenta existente, enlace no utilizable, reintento y conflicto. |
| Build y runner | `package.json`: `npm run build` y `npm run test:run` están configurados; no hay script de cobertura configurado. |

Esta tabla es inventario de pruebas presentes, no una declaración de que se hayan ejecutado durante esta inicialización.

### Residual a verificar o cubrir

1. Probar explícitamente el body de `acceptAgentInvitation`, incluyendo omisión de credenciales cuando no corresponden y `password_confirmation` cuando sí corresponden.
2. Probar directamente que `UserManagementService` envía las operaciones administrativas por `SessionService` y mantiene inspección/aceptación en el cliente público, sin `tenant_id`.
3. Añadir una prueba de composición en `App` para la separación entre hash público sin sesión y superficie autenticada, si el arnés existente permite montarla sin introducir otro router.
4. Confirmar estados de carga/bloqueo para evitar doble envío en emisión, reinvitación y aceptación.
5. Confirmar que los mensajes de todos los errores HU-007 no hacen eco de token, contraseña, JWT, detalles internos ni identificadores de tenant.
6. Registrar el resultado real de `npm run test:run` y `npm run build` en verificación; no inferirlo desde artefactos del cambio compartido.
7. No presentar una métrica porcentual de cobertura: el proyecto no tiene herramienta ni script de cobertura configurado. Si se requiere una métrica, deberá autorizarse como decisión posterior y permanecer dentro de panel.

La ausencia de pruebas de integración real contra backend es una limitación deliberada de esta partición, no un gap que se resuelva aquí.

## 6. Áreas afectadas

Las fases posteriores pueden tocar únicamente:

- `panel/src/App.tsx` y, si resulta imprescindible, su prueba de composición;
- `panel/src/data/apiClient.ts` y pruebas de contratos del cliente;
- `panel/src/application/userManagementService.ts` y sus pruebas;
- `panel/src/features/user-management/UserManagementPage.tsx` y pruebas;
- `panel/src/features/agent-invitations/AgentInvitationAcceptancePage.tsx` y pruebas;
- artefactos OpenSpec bajo `panel/openspec/changes/hu007-panel-invitacion-agentes/`.

No se autoriza copiar o modificar la especificación, diseño o tareas del cambio compartido. Esos documentos son referencias de contexto y trazabilidad únicamente.

## 7. Riesgos y mitigaciones

| Riesgo | Mitigación dentro de panel-only |
|---|---|
| Deriva entre el contrato backend y el cliente | Verificar paths, métodos, bodies y códigos ya consumidos; no inventar endpoints ni cambiar el contrato desde este cambio. |
| Exposición accidental del token en URL o UI | Mantenerlo en body/memoria, probar que no aparece en URL, texto visible ni mensajes de error. |
| Doble envío o reintento ambiguo | Verificar estados `loading`/`saving` y documentar el comportamiento observable, sin prometer idempotencia backend. |
| Confusión entre membresía pendiente y activación | Mantener mensajes y criterios explícitos: HU-007 no activa ni asigna permisos. |
| Mezcla del modo local HU-03 con invitaciones | Conservar ambos seams y probar la selección por sesión; no eliminar consumidores locales sin evidencia de que dejaron de existir. |
| Evidencia histórica no reproducida | Etiquetar como pendiente todo resultado no ejecutado en esta partición; CP-006 permanece fuera de este cierre. |
| Token persistente en el fragmento del navegador | Verificar el comportamiento actual y registrar cualquier decisión de limpieza del hash como riesgo de seguridad para una fase posterior, sin ampliar el alcance silenciosamente. |

## 8. Rollback

El rollback de esta partición consiste en revertir únicamente cambios de código o pruebas del panel asociados a HU-007 y retirar este directorio OpenSpec si se cancela antes del cierre. No se borran datos, invitaciones, cuentas ni membresías porque esta superficie no administra persistencia.

No se modifican backend, mobile, HU-006, HU-008, HU-009 ni la lógica de autenticación/suscripción fuera del seam de consumo. No se realizan commits ni push durante esta inicialización.

## 9. Criterios de éxito

1. La integración administrativa del panel usa los paths y payloads existentes, con sesión, sin `tenant_id` aportado por el cliente.
2. La integración pública inspecciona y acepta usando token en body, sin exponerlo en URL, UI o errores.
3. La UI representa los cuatro estados de invitación, reinvitación, expiración/no disponibilidad, fallo de red y conflicto de membresía sin prometer activación.
4. La ruta de aceptación solicita credenciales solo cuando corresponde y muestra membresía pendiente tras éxito.
5. La cobertura residual priorizada queda probada o marcada explícitamente como pendiente, sin declarar cobertura porcentual inexistente.
6. El build y la suite Vitest del panel cuentan con evidencia fechada y reproducible en la fase de verificación.
7. El expediente mantiene fuera backend, mobile, HU-006/HU-008/HU-009 y CP-006.

## 10. Ronda de preguntas de propuesta

La decisión de superficie, la separación del cierre, los no objetivos y la ausencia de ejecución de CP-006 fueron indicados explícitamente por el usuario. Por ello no se abre una decisión adicional para crear esta propuesta. La fase siguiente debe confirmar únicamente los detalles de cobertura residual del panel y no ampliar el alcance funcional.

## 11. Siguiente fase recomendada

`spec` en `panel/openspec/changes/hu007-panel-invitacion-agentes/`, limitado a requisitos verificables de integración y evidencia residual del panel. Después: `design` → `tasks` → `apply` solo si se requieren ajustes de cobertura → `verify`.
