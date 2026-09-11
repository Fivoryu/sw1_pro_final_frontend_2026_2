# Informe de archivo — HU-007 Invitación de agentes

- **Estado:** PASS — cambio archivado.
- **Cambio:** `hu007-panel-invitacion-agentes`
- **Fecha:** 2026-09-11
- **Artifact store:** hybrid (persistencia filesystem realizada; Engram no disponible en esta sesión).
- **Status nativo:** `nextRecommended=archive`, `archive=ready`, `verify=all_done`, `tasks=20/20`, `blockers=0`.
- **actionContext:** `mode=repo-local`; workspace y raíz permitida: repositorio `panel`.

## Artefactos leídos

`proposal.md`, `specs/agent-invitations/spec.md`, `design.md`, `tasks.md`, `apply-progress.md`, `verify-report.md` y `openspec/config.yaml`. No existía `sync-report.md` al inicio; fue generado durante el fallback autorizado.

## Sincronización

Se creó `openspec/specs/agent-invitations/spec.md` como nueva especificación canónica, copiando íntegramente el delta del cambio. Requisitos **ADDED**:

1. El panel debe consumir el seam de invitaciones sin exponer autoridad ni secretos.
2. El panel debe mapear errores de invitación a mensajes seguros y accionables.
3. La gestión administrativa debe representar estados y reinvitación.
4. La ruta pública debe tratar expiración, reemplazo, uso e invalidez como enlace no utilizable.
5. La contraseña debe solicitarse y enviarse condicionalmente.
6. Estados de carga y evidencia del panel deben impedir doble envío y no declarar CP-006.

**MODIFIED:** ninguno. **REMOVED:** ninguno. No hubo merge destructivo ni advertencias de cambios activos del mismo dominio.

## Preconditions y límites

- Verify report: PASS, `blockers=0`, `requirements=6/6`, `scenarios=15/15`.
- No quedan marcadores de implementación `- [ ]` en `tasks.md`; tareas 20/20 completas.
- CP-006 no se ejecutó ni se declaró cumplido.
- No se modificó `src`, backend, mobile, worker 3D ni contracts.
- No se ejecutó CP-006. No se hizo commit ni push.
- La excepción de tamaño `size:exception` de 514 líneas queda registrada como autorización previa, restringida a panel-only; no se creó una nueva excepción.

## Archivo

El cambio fue movido a:

`openspec/changes/archive/2026-09-11-hu007-panel-invitacion-agentes/`

## Key Learnings

- El sync debe conservar íntegramente una especificación delta cuando no existe canonical previa.
- La puerta final debe comprobar el artefacto persistido de tareas inmediatamente antes del sync y del movimiento.
- La evidencia panel-only debe mantener CP-006 explícitamente fuera del cierre.
