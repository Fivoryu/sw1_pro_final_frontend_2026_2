# Prepropuesta pendiente — HU-03 Gestión de usuarios

## Estado

- **Cambio:** `hu03-gestion-usuarios`.
- **Fase:** prepropuesta confirmada; habilita la fase `proposal`.
- **Historia seleccionada:** HU-03 del documento modelo, no HU-003 canónica.
- **Superficie:** `panel/` Web.
- **Artefactos:** híbridos OpenSpec + Engram.
- **Ejecución:** automática.
- **Restricción:** no modificar backend, Flutter ni la raíz del monorepo; no realizar commits ni pushes.
- **Strict TDD:** RED → GREEN → TRIANGULATE → REFACTOR.

## Hechos confirmados

La HU-03 del modelo respalda que un administrador pueda consultar la lista de usuarios, crear usuarios con nombre, correo, rol y estado, editar usuarios existentes, desactivar sin eliminar definitivamente los registros, validar campos obligatorios y recibir mensajes de confirmación o error.

El repositorio `panel/` solo contiene una estructura inicial React + TypeScript + Vite y no tiene código, contrato API, modelo de datos, autenticación, catálogo de roles/estados, manifiesto de paquetes ni runner de pruebas. La documentación del monorepo menciona FastAPI/PostgreSQL/RBAC como arquitectura prevista, pero no aporta un contrato de integración autorizado para este panel. El modelo registra una prueba CP-03 documental, pero no constituye evidencia de ejecución en `panel/`.

## Decisión requerida antes de `proposal`

Debe definirse el límite de integración del primer slice. No se puede afirmar persistencia real ni inventar endpoints/payloads mientras el cambio esté restringido a `panel/` y no exista un contrato verificable.

### Opción `panel-local`

Implementar en `panel/` un slice Web funcional y verificable con un repositorio/adaptador local explícito (estado en memoria o fixture controlado), CRUD de usuarios, desactivación no destructiva, validaciones respaldadas y mensajes de resultado. La arquitectura dejará una frontera reemplazable para una integración futura, pero el artefacto declarará que no hay persistencia, autenticación o autorización real. Se añadirá un runner de pruebas para ejecutar Strict TDD.

**Consecuencia:** permite completar una experiencia panel-only sin tocar backend, pero no prueba integración ni persistencia real.

### Opción `api-contract`

No implementar todavía. Continuar únicamente cuando el usuario proporcione o autorice un contrato API verificable (endpoints, payloads, respuestas, errores y reglas de autorización) existente, manteniendo prohibido modificar backend. La propuesta y las fases posteriores se limitarían a consumir ese contrato.

**Consecuencia:** permite una integración real sin inventar contratos, pero el flujo automático no puede completar `apply → verify → archive` hasta recibir la evidencia contractual.

### Opción `shell-only`

Implementar solo la estructura visual y los estados de formulario/listado, sin repositorio local ni persistencia simulada; las acciones de datos quedarían explícitamente como no implementadas y documentadas como gap.

**Consecuencia:** reduce el riesgo de simular capacidades inexistentes, pero no satisface por sí sola las operaciones CRUD de la HU y probablemente dejaría la verificación incompleta.

## Decisión confirmada

El usuario seleccionó `panel-local`. El primer slice implementará CRUD Web con un repositorio/adaptador local explícito, sin afirmar persistencia, autenticación o autorización reales. La ausencia de integración backend seguirá registrada como límite y gap.

## Regla de continuación

La decisión `panel-local` habilita el lanzamiento de `sdd-proposal`. Las opciones no seleccionadas (`api-contract` y `shell-only`) no forman parte del alcance actual.
