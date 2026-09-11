# Delta para Invitaciones de agentes — panel Web

Este delta limita HU-007 a la superficie React/TypeScript/Vite del repositorio `panel`. Reutiliza como contrato de contexto la especificación compartida de `hu007-invitacion-agentes`, sin duplicar requisitos de backend, mobile ni persistencia.

## ADDED Requirements

### Requirement: El panel debe consumir el seam de invitaciones sin exponer autoridad ni secretos

El panel MUST enviar las operaciones administrativas mediante la sesión autenticada a `GET /api/v1/tenant/agent-invitations` y `POST /api/v1/tenant/agent-invitations`, sin enviar `tenant_id`. La inspección y aceptación públicas MUST usar el cliente público en `POST /api/v1/agent-invitations/inspect` y `POST /api/v1/agent-invitations/accept`; el token MUST viajar únicamente en el body y no en la URL, texto visible ni mensajes de error.

#### Scenario: Separación entre superficie autenticada y pública

- GIVEN una sesión administrativa o una URL pública con `#token=`
- WHEN el panel carga la superficie correspondiente
- THEN las operaciones administrativas usan la sesión y las operaciones de inspección/aceptación usan el seam público, sin seleccionar un tenant desde el cliente

#### Scenario: Aceptación sin exposición del token

- GIVEN un token presente en el fragmento de la URL
- WHEN el panel inspecciona o acepta la invitación
- THEN envía el token en el body y no lo muestra en la URL construida, la interfaz ni los mensajes presentados al usuario

### Requirement: El panel debe mapear errores de invitación a mensajes seguros y accionables

El panel MUST convertir errores de red, sesión ausente, autorización administrativa, correo inválido, solicitud inválida, invitación no utilizable, contraseña inválida, membresía existente, membresía pendiente y fallo general de invitación en mensajes comprensibles. Los mensajes MUST NOT incluir tokens, contraseñas, JWT, detalles internos ni identificadores de tenant.

#### Scenario: Error de red con reintento

- GIVEN que una solicitud administrativa o pública no alcanza el servicio
- WHEN el cliente informa `NETWORK_ERROR`
- THEN el panel muestra un error de conexión y ofrece reintentar sin duplicar silenciosamente la operación

#### Scenario: Conflicto de membresía

- GIVEN que el servicio informa una membresía `active`, `inactive`, `revoked` o equivalente como existente, o una membresía `pending`
- WHEN el panel recibe el conflicto
- THEN muestra un mensaje específico que no promete activación, reactivación ni permisos y permite corregir o reintentar según corresponda

#### Scenario: Error no reconocido o respuesta inválida

- GIVEN una respuesta malformada, un error HTTP no mapeado o un fallo inesperado
- WHEN el panel procesa el resultado
- THEN muestra un mensaje genérico seguro sin propagar el detalle técnico ni secretos

### Requirement: La gestión administrativa debe representar estados y reinvitación

El panel MUST mostrar los estados `pending`, `accepted`, `invalidated` y `expired`, junto con la fecha de expiración y el fallo de entrega cuando exista. MUST permitir reinvitar una invitación `pending`, `invalidated` o `expired` mediante la operación de creación existente; una invitación `accepted` MUST NOT ofrecer reinvitación desde esta superficie. El panel MUST comunicar que la aceptación produce una membresía pendiente.

#### Scenario: Consulta de estados

- GIVEN una lista administrativa con invitaciones en cualquiera de los cuatro estados soportados
- WHEN se renderiza la gestión de invitaciones
- THEN cada invitación muestra una etiqueta de estado comprensible y no muestra su enlace secreto

#### Scenario: Reinvitación segura

- GIVEN una invitación `pending`, `invalidated` o `expired`
- WHEN el administrador solicita reinvitar
- THEN el panel repite la operación administrativa para el correo normalizado, informa que la invitación anterior fue reemplazada y bloquea envíos concurrentes mientras espera la respuesta

#### Scenario: Invitación aceptada

- GIVEN una invitación con estado `accepted`
- WHEN se renderiza su fila
- THEN se muestra como aceptada y no se ofrece una acción de reinvitación que sugiera duplicar el flujo

### Requirement: La ruta pública debe tratar expiración, reemplazo, uso e invalidez como enlace no utilizable

El panel MUST mostrar un estado no sensible y no exitoso cuando la inspección o aceptación indique que el enlace es inválido, expiró, fue reemplazado o ya fue utilizado. No MUST presentar esos resultados como activación ni crear una sesión automáticamente. La inspección fallida MUST ofrecer reintento cuando el resultado pueda cambiar por una nueva solicitud.

#### Scenario: Token no utilizable

- GIVEN un token expirado, invalidado por reinvitación, consumido o inválido
- WHEN se inspecciona o acepta desde la ruta pública
- THEN se muestra un mensaje común de enlace no disponible, no se revela la causa sensible y no se muestra confirmación de aceptación

#### Scenario: Reintento de inspección

- GIVEN que una inspección falla transitoriamente o devuelve un error de disponibilidad
- WHEN el usuario selecciona `Reintentar validación`
- THEN el panel vuelve a inspeccionar el token sin incluirlo en texto visible y solo habilita la aceptación si la inspección resulta utilizable

### Requirement: La contraseña debe solicitarse y enviarse condicionalmente

El panel MUST solicitar contraseña y confirmación únicamente cuando la inspección indique `requires_password: true`. Para una cuenta global existente MUST aceptar sin mostrar credenciales. Al aceptar una cuenta nueva, MUST enviar `password` y `password_confirmation`; cuando no corresponda, MUST omitir ambos campos. Tras una aceptación válida MUST informar que la membresía queda `pending` y MUST NOT iniciar sesión automáticamente.

#### Scenario: Cuenta nueva

- GIVEN una inspección utilizable con `requires_password: true`
- WHEN el agente completa y envía el formulario
- THEN se muestran ambos campos y la aceptación envía el token, la contraseña y su confirmación

#### Scenario: Cuenta global existente

- GIVEN una inspección utilizable con `requires_password: false`
- WHEN el agente abre la aceptación
- THEN no se muestran campos de contraseña y la aceptación omite las credenciales del body

#### Scenario: Aceptación pendiente

- GIVEN una aceptación exitosa con `membership_status: pending`
- WHEN el panel recibe la respuesta
- THEN muestra el resultado pendiente, no muestra activación exitosa y no modifica la sesión autenticada

### Requirement: Estados de carga y evidencia del panel deben impedir doble envío y no declarar CP-006

El panel MUST bloquear el botón o acción en curso durante carga, emisión, reinvitación, inspección y aceptación, y MUST conservar una opción explícita de reintento tras un fallo recuperable. La evidencia de esta partición MUST distinguir pruebas preparadas de pruebas ejecutadas y MUST NOT declarar ejecutado CP-006.

#### Scenario: Prevención de doble envío

- GIVEN una emisión, reinvitación o aceptación en curso
- WHEN el usuario intenta activar nuevamente la misma acción
- THEN el panel mantiene la acción deshabilitada hasta resolver la solicitud y no dispara una segunda solicitud desde esa interacción

#### Scenario: Estado de evidencia

- GIVEN el cierre documental del cambio panel-only
- WHEN se reportan pruebas o cobertura
- THEN se reportan únicamente resultados realmente ejecutados en el panel y CP-006 permanece fuera de ejecución y sin declaración de cumplimiento
