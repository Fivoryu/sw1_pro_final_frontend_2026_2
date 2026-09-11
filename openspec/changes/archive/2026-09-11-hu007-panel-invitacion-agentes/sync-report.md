# Informe de sincronización — HU-007

- **Cambio:** `hu007-panel-invitacion-agentes`
- **Dominio:** `agent-invitations`
- **Fecha:** 2026-09-11
- **Resultado:** PASS
- **Modalidad:** archive-time fallback autorizado explícitamente por el usuario.

## Operación

La especificación delta de `openspec/changes/hu007-panel-invitacion-agentes/specs/agent-invitations/spec.md` se sincronizó como nueva especificación canónica en `openspec/specs/agent-invitations/spec.md`. No existía previamente una especificación canónica para este dominio, por lo que se copió íntegramente sin aplicar reemplazos ni eliminaciones.

## Requisitos

- **ADDED:** El panel debe consumir el seam de invitaciones sin exponer autoridad ni secretos.
- **ADDED:** El panel debe mapear errores de invitación a mensajes seguros y accionables.
- **ADDED:** La gestión administrativa debe representar estados y reinvitación.
- **ADDED:** La ruta pública debe tratar expiración, reemplazo, uso e invalidez como enlace no utilizable.
- **ADDED:** La contraseña debe solicitarse y enviarse condicionalmente.
- **ADDED:** Estados de carga y evidencia del panel deben impedir doble envío y no declarar CP-006.
- **MODIFIED:** ninguno.
- **REMOVED:** ninguno.

No se detectaron otros cambios activos que tocaran este dominio. No hubo merge destructivo.
