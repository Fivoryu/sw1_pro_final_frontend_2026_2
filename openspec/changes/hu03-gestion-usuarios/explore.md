# Notas de exploración — HU-03 Gestión de usuarios

## Estado de la exploración

- **Cambio:** `hu03-gestion-usuarios`.
- **Repositorio objetivo:** `panel/`, repositorio Git independiente.
- **Superficie:** panel Web administrativo y de agente.
- **Alcance seleccionado:** HU-03 del documento modelo: crear, editar, desactivar y consultar usuarios.
- **Fase:** `explore`.
- **Modalidad de artefactos:** híbrida; este documento es la copia OpenSpec.
- **Restricción respetada:** solo se escribe dentro de `panel/openspec/changes/hu03-gestion-usuarios/`. No se modifican backend, Flutter ni la raíz del monorepo.

Estas notas describen evidencia observada, dependencias, gaps y riesgos. No constituyen una propuesta de implementación ni definen contratos no respaldados.

## Fuentes inspeccionadas

| Fuente | Evidencia observada | Uso |
| --- | --- | --- |
| `panel/README.md` | Declara React + TypeScript + Vite, panel administrativo y de agente de RoomForge, y estado de estructura inicial sin código. | Estado real del repositorio objetivo. |
| `panel/openspec/project-context.md` | Confirma repositorio independiente, rama `main` limpia durante la inicialización, ausencia de fuente, manifiesto, configuración de pruebas y runner. | Contexto local y gaps iniciales. |
| `panel/openspec/config.yaml` | Declara stack React/TypeScript/Vite, artefactos híbridos, Strict TDD, runner nulo y raíz de edición `panel/`. | Convenciones y límites de la fase. |
| `docs/modelo_doc/extracto-sprints-p85-150.txt` | Registra `HU-03` del modelo como “Gestión de usuarios”, rol Administrador, prioridad Alta, sprint 1 y plataformas Web/Desktop/Web/Web. | Identidad de la HU seleccionada en el modelo. |
| `docs/modelo_doc/extracto-capitulo2-p151-373.txt` | Detalla descripción, criterios de aceptación y prueba CP-03 de la HU-03 del modelo. | Requisitos funcionales documentales y evidencia histórica del modelo. |
| `docs/sprint-0/ids-trazabilidad.md` | Registro canónico actual `HU-003` corresponde a verificación de correo, con `PB-003`, `RF-033` y `CU-003`; el catálogo de plataformas asigna Web a otros PB de administración, no a la HU-003. | Comparación y prevención de colisión de IDs. |
| `docs/scrum/sprint-0-requerimientos/09-infraestructura.md` | Declara React + TypeScript + Vite para panel web y FastAPI/PostgreSQL/RBAC como arquitectura prevista de otras superficies. | Dependencias arquitectónicas documentadas, sin asumir contratos. |

No se tomó como evidencia de capacidades del panel ningún código de backend, Flutter u otro repositorio. La documentación externa se usó únicamente como referencia de requisitos y trazabilidad.

## Estado real de `panel`

La inspección disponible confirma que `panel` es un repositorio React/TypeScript/Vite vacío o de estructura inicial:

- Solo se encontró `README.md` como evidencia de producto en la inicialización y no se observó código fuente.
- No se observaron `package.json`, lockfile, configuración de Vite o TypeScript, configuración de pruebas, componentes, rutas, servicios, modelos, fixtures ni datos de prueba.
- No existe un runner de pruebas o comando de pruebas detectable; el contexto local lo registra como `runner: null`, `command: null`, `status: unavailable`.
- Por lo tanto, no hay implementación existente del flujo de gestión de usuarios en el panel que pueda reutilizarse, extenderse o verificarse.

La ausencia de `.codegraph/` en el repositorio objetivo impidió usar un índice CodeGraph local; se continuó con lectura documental y búsqueda acotada de fuentes, sin modificar ni inicializar artefactos fuera de la superficie autorizada.

## HU-03 del modelo seleccionada

La selección funcional se conserva explícitamente: **HU-03 del documento modelo**, no la HU-003 canónica actual.

### Identidad y objetivo documental

El modelo presenta:

- **ID del modelo:** `HU-03`.
- **Título:** Gestión de usuarios.
- **Actor:** administrador del sistema.
- **Descripción:** crear, editar, desactivar y consultar usuarios para mantener actualizada la información de trabajadores, supervisores y administradores registrados.
- **Prioridad:** Alta.
- **Estimación documental:** 8 PHU.
- **Desarrollador a cargo en el modelo:** Ardaya Campos Nathalia.
- **Plataformas indicadas en el extracto de Sprint 0:** Web/Desktop/Web/Web; para este cambio se restringe la implementación a la superficie Web del panel.

### Criterios de aceptación observados en el modelo

1. El administrador puede visualizar la lista de usuarios registrados.
2. Puede crear un usuario con datos básicos como nombre, correo, rol y estado.
3. Puede editar la información de un usuario existente.
4. Puede desactivar usuarios sin eliminar definitivamente sus registros asociados.
5. El sistema valida campos obligatorios antes de guardar.
6. El sistema muestra mensajes de confirmación o error según el resultado.

El documento del modelo también registra una prueba CP-03 con operaciones de lista, alta válida, validaciones para correo repetido o campos vacíos, edición y desactivación conservando registros. Esa sección es evidencia documental del modelo, no evidencia de que el panel actual la haya ejecutado.

## Comparación con la HU-003 canónica actual

| Aspecto | HU-03 del modelo seleccionada | HU-003 canónica actual |
| --- | --- | --- |
| Tema | Gestión administrativa de usuarios. | Verificación de correo real con enlace de activación. |
| Actor | Administrador del sistema. | Cliente. |
| Capacidades | Consultar, crear, editar y desactivar usuarios; validar y notificar resultado. | Verificar el correo mediante un enlace. |
| Trazabilidad | El extracto del modelo usa referencias de su propio documento, incluyendo PB-03 en la prueba del modelo. No se reasigna automáticamente a IDs canónicos. | `PB-003`, `RF-033`, `CU-003`; prioridad Must y sprint propuesto 3 en `docs/sprint-0/ids-trazabilidad.md`. |
| Superficie | Selección del usuario: solo Web/panel para este cambio. | El registro canónico asigna la HU-003 a cliente/backend, no a gestión de usuarios del panel. |
| Decisión | Se implementará posteriormente como cambio `hu03-gestion-usuarios`. | No se sustituye, renombra ni modifica la HU-003 canónica. |

La similitud numérica entre `HU-03` y `HU-003` no implica identidad. El ID canónico `HU-003` queda fuera del alcance funcional de este cambio.

## Capacidades y requisitos respaldados

### Respaldados directamente por la fuente del modelo

- Lista/consulta de usuarios.
- Alta de usuario con nombre, correo, rol y estado como datos básicos.
- Edición de usuario existente.
- Desactivación no destructiva, conservando registros asociados.
- Validación de campos obligatorios.
- Mensajes de confirmación o error.
- Actor administrador y prioridad Alta.

### Respaldados como contexto de plataforma, no como contrato implementable

- El panel Web está previsto con React + TypeScript + Vite.
- La documentación de infraestructura prevé un backend FastAPI, PostgreSQL y RBAC, pero no aporta para este cambio un contrato de API, esquema exacto, nombres de endpoints, payloads ni modelo de usuario consumible por `panel`.
- La trazabilidad canónica distingue autenticación, membresías y permisos (`HU-002`, `HU-007`, `HU-008`, `HU-009`) de la HU-003 canónica. No deben incorporarse por analogía a HU-03 del modelo.

### No respaldados todavía

No hay evidencia en `panel` ni en las fuentes inspeccionadas para fijar:

- campos adicionales, tipos, formatos o reglas de unicidad más allá de los datos básicos mencionados;
- estados válidos y transiciones concretas;
- roles disponibles o permisos detallados del administrador;
- paginación, búsqueda, filtros, ordenamiento o carga incremental;
- contrato de persistencia o API del panel;
- manejo de sesiones, autenticación o autorización en la UI;
- formato, canal o contenido exacto de mensajes;
- estrategia de errores de red, reintentos, concurrencia u optimismo;
- diseño visual, rutas, librería de componentes o estándares de accesibilidad;
- usuarios de prueba, fixtures, endpoints, comandos de ejecución o métricas.

Estos puntos deben permanecer como decisiones abiertas o gaps en fases posteriores, no como supuestos de implementación.

## Dependencias

1. **Bootstrap de aplicación Web:** el panel no tiene estructura de aplicación observable. Antes de implementar la HU será necesario decidir la estructura mínima React/Vite/TypeScript.
2. **Contrato de datos y persistencia:** las operaciones de consulta, alta, edición y desactivación requieren un contrato respaldado por el backend o, si se decide un slice aislado, un límite explícito que no simule una integración inexistente.
3. **Identidad y autorización:** el modelo presupone un administrador, pero `panel` no contiene autenticación ni autorización verificable.
4. **Roles y estados:** la HU requiere mostrar/guardar rol y estado, mientras que el catálogo válido y sus reglas no están definidos en el panel.
5. **Pruebas:** Strict TDD está activo, pero no hay runner ni configuración. La selección del runner y la forma de probar la superficie deben resolverse antes de aplicar.
6. **Decisiones de diseño de UI:** no hay componentes, rutas ni convención visual existente que sirvan como base.

La infraestructura documentada menciona backend FastAPI/PostgreSQL/RBAC, pero esa referencia no permite inventar la integración ni garantiza que exista un contrato listo para el panel.

## Gaps abiertos

| ID | Gap | Impacto | Acción posterior sugerida |
| --- | --- | --- | --- |
| GAP-001 | El panel no contiene implementación web, fuente ni estructura de aplicación. | La HU no puede extender componentes existentes. | Definir el primer slice de estructura y límites en propuesta/diseño. |
| GAP-002 | No existe runner, comando ni configuración de pruebas detectables. | Strict TDD no puede ejecutarse todavía. | Seleccionar y documentar runner antes de aplicar; no declarar pruebas ejecutadas. |
| GAP-003 | No existe contrato de datos/API para usuarios del panel. | Las operaciones CRUD no tienen integración verificable. | Confirmar contrato autorizado o delimitar un seam sin inventar endpoints. |
| GAP-004 | El catálogo de roles, estados y reglas de autorización no está especificado para HU-03. | No se puede validar completamente alta, edición ni desactivación. | Obtener decisión funcional y trazabilidad antes de tareas de implementación. |
| GAP-005 | El modelo menciona “correo repetido” en la prueba CP-03, pero no define la autoridad ni la regla completa de unicidad. | No se debe convertir esa mención en contrato técnico sin decisión. | Confirmar regla y capa responsable. |
| GAP-006 | No se define el comportamiento de consulta más allá de visualizar la lista. | Búsqueda, filtros, paginación y estados de carga quedan indeterminados. | Mantenerlos fuera hasta decisión explícita. |
| GAP-007 | No hay evidencia de ejecución actual del panel ni de CP-03 en esta superficie. | El resultado del modelo no prueba el estado del repositorio. | Planificar pruebas propias cuando exista runner y aplicación. |
| GAP-008 | La HU-03 del modelo no tiene correspondencia automática con la HU-003 canónica. | Riesgo de trazabilidad y alcance incorrectos. | Mantener el cambio con nombre propio y documentar la selección explícita, sin reutilizar IDs canónicos. |

## Riesgos

- **Riesgo de alcance:** confundir `HU-03` del modelo con `HU-003` canónica incorporaría verificación de correo en lugar de gestión administrativa de usuarios.
- **Riesgo de contrato inventado:** implementar servicios, endpoints, modelos o estados no respaldados produciría una integración ficticia.
- **Riesgo de dependencia:** un panel funcional requiere identidad, autorización y persistencia, pero ninguna de esas capacidades está implementada u observable en `panel`.
- **Riesgo de verificabilidad:** sin runner ni configuración de pruebas, cualquier afirmación de pruebas pasadas sería infundada.
- **Riesgo de destrucción de datos:** la desactivación debe ser no destructiva según el modelo; una implementación posterior no debe tratarla como eliminación física.
- **Riesgo de permisos:** permitir el flujo sin resolver la autoridad del administrador podría dejar una UI sin control de acceso efectivo.
- **Riesgo de sobrecarga del primer slice:** incorporar roles/permisos, autenticación, auditoría o membresías por analogía excedería HU-03 del modelo y sus evidencias actuales.

## Límites de una implementación solo-panel

Una implementación limitada a `panel/` puede preparar la estructura y la experiencia Web únicamente hasta el límite de contratos autorizados. No puede, sin modificar otras superficies o inventar contratos:

- garantizar persistencia real de usuarios;
- crear o modificar endpoints, esquemas, migraciones o reglas backend;
- demostrar autenticación o autorización efectiva;
- confirmar consistencia, unicidad o conservación de registros en una base de datos;
- declarar integración con usuarios reales o servicios externos;
- validar CP-03 de extremo a extremo.

Si las fases posteriores autorizan un slice exclusivamente de panel, deberán declarar qué comportamiento es local/presentacional y qué queda diferido por dependencia backend. Cualquier integración con backend deberá usar un contrato existente y verificable; no se infieren rutas ni payloads desde la documentación de arquitectura.

## Recomendación para la siguiente fase

Continuar con `propose`, manteniendo como decisión de producto la HU-03 del modelo y como no-objetivo la HU-003 canónica de verificación de correo. La propuesta debería resolver primero el límite del slice Web, el contrato de integración disponible o su ausencia, los datos mínimos respaldados, el alcance de roles/estados, y una estrategia de pruebas compatible con Strict TDD sin presentar evidencia inexistente.

## Key Learnings

- `HU-03` del documento modelo y `HU-003` del registro canónico son historias distintas; la primera es la seleccionada.
- `panel` está en estado inicial y no contiene una implementación React/TypeScript/Vite verificable ni runner de pruebas.
- La HU seleccionada respalda consultar, crear, editar y desactivar usuarios, con validación básica y mensajes de resultado.
- La documentación de arquitectura aporta contexto de stack y dependencias, pero no un contrato de API o modelo utilizable por el panel.
- Una implementación solo-panel no puede afirmar persistencia, autorización efectiva ni pruebas end-to-end sin evidencia adicional.
