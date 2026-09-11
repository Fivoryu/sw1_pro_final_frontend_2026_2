# Diseño — HU-007: invitaciones de agentes en el panel

**Cambio:** `hu007-panel-invitacion-agentes`  
**Trazabilidad:** PB-007 · HU-007 · CU-007 · RF-004/RF-006  
**Superficie:** `panel/` — React + TypeScript + Vite  
**Estado:** diseño completado; la integración ya existe y la cobertura residual queda delimitada para `tasks`/`verify`.

## Decisión principal

Se conserva la implementación de panel existente y se verifica mediante seams explícitos, sin rediseñar autenticación, suscripción ni el dominio local legado. El panel tiene dos recorridos aislados:

1. **Administrativo autenticado:** lista y emite invitaciones mediante `SessionService`.
2. **Aceptación pública:** obtiene el token del fragmento, lo envía en el body mediante `ApiClient` y acepta sin crear una sesión automáticamente.

La aceptación exitosa se presenta siempre como **membresía pendiente**. No se implementa activación, permisos, RBAC, revocación ni ninguna operación de HU-008/HU-009.

## Contexto compartido utilizado selectivamente

Se consultó `D:/Universidad/Proyectos/2doSemestre2026/sw1/proyecto_final/openspec/changes/hu007-invitacion-agentes/design.md` únicamente para alinear el seam HTTP y el resultado funcional que el panel consume:

- `GET/POST /api/v1/tenant/agent-invitations` para la superficie administrativa.
- `POST /api/v1/agent-invitations/inspect` y `POST /api/v1/agent-invitations/accept` para la superficie pública.
- Token en el body, sin `tenant_id` aportado por el cliente.
- Aceptación con `membership_status: pending` y credenciales solo para cuenta global nueva.

No se trasladan a este diseño modelos, migraciones, locks, notifier, reglas de persistencia ni pruebas backend del documento compartido. El contrato observable aquí se deriva de `src/data/apiClient.ts`, `src/application/userManagementService.ts` y sus consumidores.

## Flujo y seams

```text
App
├─ sin sesión + location.hash comienza por #token=
│  └─ AgentInvitationAcceptancePage
│     └─ UserManagementService.inspectInvitation/acceptInvitation
│        └─ ApiClient (público; token en body)
└─ con sesión
   ├─ SubscriptionDashboard (sin cambios)
   └─ UserManagementPage
      └─ UserManagementService.listInvitations/createInvitation
         └─ SessionService.request (protegido; renovación de sesión existente)
            └─ ApiClient (Authorization Bearer)
```

| Seam | Implementación existente | Contrato de panel |
|---|---|---|
| Composición | `src/App.tsx` crea una instancia de `ApiClient`, `SessionService` y `UserManagementService(api, session)`. | La rama pública solo se selecciona sin sesión y con `#token=`; la rama autenticada conserva dashboard y gestión. |
| Administrativo | `UserManagementService.listInvitations` y `createInvitation` delegan en `session.request`. | `GET` sin body; `POST` con `{ email }`; nunca `{ tenant_id }`. La página recorta el correo antes de emitir o reinvitar. |
| Público | `UserManagementService.inspectInvitation` y `acceptInvitation` delegan en el puerto `InvitationApi` de `ApiClient`. | No pasa por `SessionService`; el token solo integra el body del request. |
| Transporte | `ApiClient.request` serializa JSON, agrega `Authorization` solo cuando recibe `accessToken` y convierte fallos de red/respuesta. | No se interpolan secretos en paths ni se propagan detalles de `Response`. |
| Compatibilidad | `UserManagementService` aún conserva el puerto `UserRepository` y el modo HU-03 local. | El modo local no se elimina: se selecciona cuando no existe sesión de invitaciones. |

El doble uso del nombre `UserManagementService` es deliberado para no romper la pantalla existente. Las pruebas residuales deben comprobar que el modo de invitaciones usa el seam autenticado/público correcto, sin exigir una refactorización del servicio local.

## Estados y transiciones observables

### Gestión administrativa

Hay dos niveles de estado que no deben confundirse:

- **Solicitud de la pantalla:** `loading` al listar; `saving` al emitir o reinvitar; `error`/`message` para resultado. `aria-busy` refleja `loading || saving`.
- **Invitación recibida:** `pending`, `accepted`, `invalidated`, `expired`. `delivery_status` es independiente y puede ser `pending`, `delivered` o `failed`.

| Estado de invitación | Etiqueta | Acción disponible |
|---|---|---|
| `pending` | Pendiente | Reinvitar |
| `accepted` | Aceptada | Ninguna; no se sugiere duplicar la aceptación |
| `invalidated` | Invalidada | Reinvitar |
| `expired` | Expirada | Reinvitar |

`delivery_status: failed` solo muestra que el correo no pudo entregarse; nunca muestra ni reconstruye el enlace secreto. La aceptación pendiente se comunica en el encabezado y en el mensaje de éxito; no se presenta como acceso activo.

### Aceptación pública

La página implementa este recorrido:

1. `loading`: lee el token del fragmento en memoria e inspecciona.
2. `inspected`: habilita el formulario solo si la inspección es utilizable.
3. `requires_password: true`: muestra contraseña y confirmación, ambas con `minLength=8` y requeridas por la UI.
4. `requires_password: false`: no muestra credenciales y llama a aceptación sin esos argumentos.
5. `saving`: bloquea el botón de aceptación.
6. Éxito: oculta el formulario, informa membresía pendiente y no toca `SessionService`.
7. Fallo de inspección: muestra estado no utilizable y permite `Reintentar validación`.
8. Fallo de aceptación: mantiene el formulario disponible y cambia la acción a `Reintentar aceptación`.

El estado no utilizable agrupa token inválido, expirado, reemplazado o consumido. La UI no intenta distinguir esas causas.

## Manejo seguro de errores

`ApiClient` traduce códigos backend reconocidos o status HTTP a `ApiClientError` estable. `messageForAgentInvitationError` convierte esos códigos a mensajes accionables y usa un mensaje genérico para errores desconocidos. La capa de componentes no renderiza `error.message` arbitrario.

| Código | Mensaje observable esperado |
|---|---|
| `NETWORK_ERROR` | No se pudo conectar; se permite reintentar. |
| `NO_SESSION` | La sesión administrativa no está disponible; iniciar sesión nuevamente. |
| `TENANT_ADMIN_REQUIRED` | Solo un administrador puede gestionar invitaciones. |
| `INVALID_EMAIL` / `REQUEST_SCHEMA_INVALID` | Corregir los datos de la invitación. |
| `INVITATION_UNAVAILABLE` | El enlace no es válido, expiró, fue reemplazado o ya fue utilizado. |
| `INVITATION_PASSWORD_REQUIRED` | La contraseña o confirmación no cumple la política. |
| `AGENT_MEMBERSHIP_EXISTS` | El agente ya pertenece al tenant; la resolución queda fuera de HU-007. |
| `AGENT_MEMBERSHIP_PENDING` | Ya existe una membresía pendiente. |
| `AGENT_INVITATION_FAILED` y desconocidos | No se pudo completar la operación de invitación. |

La respuesta pública no se interpreta para enumerar usuarios o invitaciones. Los mensajes no deben contener token, contraseña, JWT, `tenant_id`, detalles internos ni el texto de una excepción de red. `ApiClient` tampoco incorpora el token a la URL HTTP.

**Límite explícito:** el token de entrada permanece en `window.location.hash` porque ese es el enlace que abre la página. El diseño garantiza que no se concatena a la URL del endpoint, no se renderiza en el DOM y no entra en mensajes; no promete limpiar el fragmento del navegador en esta partición. La limpieza del hash es un endurecimiento posterior, no una modificación silenciosa del alcance.

## Emisión, reinvitación y retry

- La emisión usa el mismo comando `createInvitation(email)` que la reinvitación; no se añade un endpoint ni una operación de revocación en el panel.
- La página normaliza la entrada visible con `trim()` y el backend conserva la responsabilidad contractual de la normalización definitiva.
- Una invitación `accepted` no muestra `Reinvitar`. Para `pending`, `invalidated` y `expired`, la acción vuelve a emitir para el correo mostrado.
- `saving` deshabilita el submit y las acciones de reinvitación mientras la solicitud y la recarga de lista están pendientes; no se promete idempotencia del backend.
- Un error de listado muestra `Reintentar`, que vuelve a consultar la lista.
- Un error de emisión/reinvitación conserva el formulario y habilita una nueva interacción; la operación no se repite automáticamente. La verificación debe comprobar que esa semántica no produce doble envío.
- Un error de inspección ofrece `Reintentar validación`; solo una inspección exitosa vuelve a habilitar aceptación.
- Un error de aceptación mantiene el formulario y ofrece `Reintentar aceptación`; no se muestra éxito parcial.

La prueba de doble envío debe usar promesas diferidas, no depender únicamente de la rapidez de `userEvent`, para demostrar que el segundo click no inicia una segunda llamada mientras `saving` es verdadero.

## Contratos de payload en el cliente

| Operación | Método/path | Body del panel | Resultado usado |
|---|---|---|---|
| Listar | `GET /api/v1/tenant/agent-invitations` | ninguno | `AgentInvitation[]` |
| Emitir/reinvitar | `POST /api/v1/tenant/agent-invitations` | `{ email }` | invitación con estado, expiración y entrega |
| Inspeccionar | `POST /api/v1/agent-invitations/inspect` | `{ token }` | `requires_password`, `expires_at` |
| Aceptar cuenta nueva | `POST /api/v1/agent-invitations/accept` | `{ token, password, password_confirmation }` | aceptación y membresía pendiente |
| Aceptar cuenta existente | mismo path | `{ token }` | aceptación y membresía pendiente |

La composición de `acceptAgentInvitation` omite ambos campos cuando `password` no está definido y usa `password_confirmation` cuando corresponde. Debe existir una prueba directa del body para evitar que una refactorización futura envíe credenciales vacías o campos de autoridad.

## Plan de pruebas y evidencia

### Cobertura ya presente para conservar

- `src/data/apiClient.test.ts`: errores HTTP/red/respuesta inválida, códigos HU-007 y mensajes sin secretos.
- `src/data/agentInvitations.test.ts`: path público, token en body y requests administrativos.
- `src/features/user-management/UserManagementPage.test.tsx`: cuatro estados, entrega fallida, reinvitación, vacío, error de red, retry y conflicto de membresía.
- `src/features/agent-invitations/AgentInvitationAcceptancePage.test.tsx`: credenciales condicionales en UI, cuenta existente, enlace no utilizable, retry y conflicto.
- `src/application/userManagementService.test.ts`: contrato del adaptador local que no debe romperse al conservar el modo dual.

Esta es evidencia de código de pruebas inspeccionado, no un resultado de ejecución de esta fase.

### Cobertura residual priorizada

En `tasks`/`apply`, solo si sigue siendo necesaria, se deben añadir pruebas focalizadas para:

1. `acceptAgentInvitation`: body con ambas credenciales y body sin ambas credenciales.
2. `UserManagementService`: listado/emisión vía `SessionService` y `inspect`/`accept` vía `ApiClient` público, sin `tenant_id`.
3. `App`: hash público sin sesión frente a superficie autenticada, sin introducir otro router.
4. Bloqueo durante emisión, reinvitación y aceptación con requests pendientes.
5. Mensajes para cada código HU-007 y ausencia de token, contraseña, JWT, detalle interno o tenant en el texto visible.
6. Retry posterior a fallo sin reintento automático ni llamada concurrente.

No se configura herramienta ni métrica porcentual de cobertura.

### Evidencia Vitest/build

El manifiesto existente define:

```text
npm run test:run  -> vitest run
npm run build     -> tsc --noEmit && vite build
```

La ejecución reproducible de ambas órdenes pertenece a `verify`. En esta fase no se ejecutaron comandos y, por tanto, no se declara PASS, cantidad de tests ni hash de salida. La evidencia de verificación deberá registrar fecha, comando, código de salida y resumen real; no se reutilizarán resultados del cambio compartido. CP-006 no se ejecutará ni se presentará como cumplido.

## Archivos y límites de cambio

| Archivo | Uso en fases posteriores |
|---|---|
| `src/App.tsx` | Solo prueba de composición o ajuste mínimo si una prueba evidencia una falla del seam. |
| `src/data/apiClient.ts` | Pruebas de payload/mapeo; cambio mínimo solo si contradice el contrato ya integrado. |
| `src/application/userManagementService.ts` | Prueba del aislamiento autenticado/público; conservar el adaptador local. |
| `src/features/user-management/UserManagementPage.tsx` | Pruebas de estados, reinvitación y bloqueo; no añadir membresías/RBAC. |
| `src/features/agent-invitations/AgentInvitationAcceptancePage.tsx` | Pruebas de inspección, credenciales, retry y aceptación pendiente. |
| `src/**/*.test.{ts,tsx}` | Cobertura residual estrictamente panel-only. |
| `panel/openspec/changes/hu007-panel-invitacion-agentes/` | Artefactos SDD de este cambio. |

Quedan fuera `backend/`, `mobile`, `worker3d`, `contracts/`, la raíz del monorepo, HU-006, HU-008, HU-009 y cualquier contrato nuevo. No se modifican `SessionService`, `SubscriptionService` ni el dominio local HU-03 salvo que una prueba de regresión demuestre una necesidad estrictamente relacionada con la composición ya existente.

## Rollback y límites operativos

El rollback consiste en retirar únicamente pruebas o ajustes del panel asociados a HU-007 y, si se cancela antes del cierre, este directorio OpenSpec. El panel no posee persistencia: no se borran invitaciones, cuentas o membresías. No se alteran datos ni componentes de otras superficies.

Limitaciones deliberadas:

- no hay prueba de integración real contra backend;
- no se valida SMTP ni la entrega real del correo;
- no se prueba concurrencia backend ni idempotencia de emisión;
- el fragmento del navegador no se limpia;
- no se mide cobertura porcentual;
- CP-006 queda fuera de ejecución y de cualquier declaración de cumplimiento.

## Criterio de salida de diseño

El diseño queda listo para `tasks` porque identifica la implementación existente, sus seams, estados, errores, reintentos, aceptación condicional, evidencia requerida y límites. La fase siguiente no debe ampliar funcionalidad: solo puede preparar pruebas residuales y, si una prueba falla, aplicar el ajuste mínimo dentro de `panel/` antes de `verify`.
