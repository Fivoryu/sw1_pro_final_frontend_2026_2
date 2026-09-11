# Propuesta — HU-03 Gestión de usuarios

## 1. Identificación y decisión

- **Cambio:** `hu03-gestion-usuarios`
- **Historia seleccionada:** HU-03 del documento modelo, «Gestión de usuarios».
- **Historia excluida:** HU-003 canónica de verificación de correo. No son la misma historia y no se modifica su trazabilidad.
- **Actor:** administrador del sistema, según el documento modelo.
- **Superficie:** panel Web dentro de `panel/`.
- **Prioridad documental:** Alta.
- **Límite de integración confirmado:** `panel-local`.
- **Modalidad de artefactos:** híbrida, OpenSpec + Engram.

La propuesta toma como fuente los artefactos de exploración y prepropuesta del cambio, el contexto y la configuración SDD del repositorio `panel/`, y la evidencia documental del modelo. La ausencia de código, manifiesto, runner y contrato API en `panel/` se considera un hecho, no una autorización para completar datos por analogía.

## 2. Intención y problema de producto

El panel necesita una primera experiencia Web que permita recorrer y demostrar la gestión administrativa básica de usuarios definida por HU-03: consultar, crear, editar y desactivar registros. Actualmente `panel/` solo tiene una estructura inicial declarada como React + TypeScript + Vite; no existe una experiencia implementada ni una base local reutilizable.

El primer slice debe entregar valor demostrable sin convertir la falta de contrato backend en una integración ficticia. Por eso se propone una experiencia funcional respaldada por un repositorio/adaptador local explícito, con una frontera reemplazable para una futura integración autorizada.

## 3. Resultado de producto esperado

Al completar este slice, una persona que use el panel podrá:

1. visualizar una lista local de usuarios;
2. crear un usuario con nombre, correo, rol y estado;
3. editar los datos de un usuario existente;
4. desactivar un usuario sin eliminar su registro local;
5. recibir validaciones y mensajes de confirmación o error correspondientes.

La experiencia debe comunicar claramente que los datos pertenecen al slice local y no representan persistencia ni usuarios reales. El comportamiento será reproducible y verificable dentro de la sesión de la aplicación, pero no se presentará como una integración con RoomForge.

## 4. Alcance del primer slice

### Incluido

- Bootstrap mínimo de la aplicación Web en `panel/`, respetando React + TypeScript + Vite.
- Pantalla o superficie de gestión de usuarios.
- Listado de usuarios proveniente de un adaptador local en memoria.
- Formulario de alta con los campos respaldados por la HU: `name`, `email`, `role` y `status`.
- Edición de un registro existente.
- Desactivación no destructiva: el registro permanece disponible en el repositorio local y refleja un estado inactivo.
- Validación de campos obligatorios antes de crear o guardar cambios.
- Mensajes de confirmación y error para las operaciones locales.
- Separación entre la UI y el acceso a datos mediante un puerto/repositorio interno reemplazable.
- Pruebas automatizadas del slice, una vez que se confirme y configure un runner compatible.
- Documentación de los límites locales y de los gaps que requieren decisiones posteriores.

### Datos locales

El adaptador local podrá iniciar con fixtures controlados para hacer visible el flujo. Su estado será en memoria y se reiniciará al recargar o reiniciar la aplicación, salvo que una fase posterior autorice otra decisión. No se usará `localStorage`, IndexedDB, `fetch` ni otro mecanismo que pueda confundirse con persistencia o integración real.

Los campos `role` y `status` son parte de los datos básicos mencionados por el modelo, pero no existe un catálogo autorizado de valores. En consecuencia, sus valores locales serán datos de fixture o de presentación del slice, no una definición normativa del dominio. El catálogo, las transiciones y las reglas de autorización quedan abiertos.

## 5. No objetivos

Este cambio no incluye:

- persistencia real en base de datos ni conservación de datos entre sesiones;
- endpoints, payloads, servicios, migraciones o contratos backend inventados;
- modificaciones en `backend/`, Flutter o la raíz del monorepo;
- autenticación, autorización o comprobación efectiva de que el operador es administrador;
- implementación de RBAC, permisos, membresías o auditoría;
- definición canónica de roles, estados o sus transiciones;
- garantía de unicidad de correo en una autoridad persistente;
- búsqueda, filtros, paginación, ordenamiento o carga incremental no exigidos por la evidencia disponible;
- integración con usuarios reales o servicios externos;
- validación end-to-end de la prueba CP-03 del modelo;
- sustitución, renombrado o modificación de HU-003 canónica;
- diseño visual definitivo, librería de componentes o sistema de diseño no evidenciado en `panel/`.

## 6. Reglas respaldadas y decisiones propuestas

### Reglas respaldadas por HU-03 del modelo

1. El actor de la gestión es el administrador del sistema.
2. La consulta debe permitir visualizar la lista de usuarios registrados.
3. El alta contempla nombre, correo, rol y estado como datos básicos.
4. La edición modifica la información de un usuario existente.
5. La desactivación no elimina definitivamente el registro ni sus datos asociados.
6. Los campos obligatorios deben validarse antes de guardar.
7. El sistema debe informar el resultado mediante mensajes de confirmación o error.

### Decisiones técnicas propuestas para este slice

1. **Repositorio local explícito:** definir un puerto interno `UserRepository` y un adaptador en memoria, por ejemplo `InMemoryUserRepository`, sin presentarlo como contrato backend.
2. **Modelo interno mínimo:** representar únicamente la identidad técnica local y los campos necesarios para HU-03. El identificador será local y no tendrá significado fuera de la sesión.
3. **Estado de desactivación:** conservar el registro y marcarlo como inactivo en el estado local; no ejecutar una operación de borrado físico.
4. **Frontera reemplazable:** concentrar las operaciones de consulta, alta, edición y desactivación detrás del repositorio para permitir una futura integración solo cuando exista un contrato autorizado.
5. **Sin persistencia accidental:** mantener el adaptador en memoria y evitar APIs de almacenamiento del navegador.
6. **Transparencia de alcance:** indicar en la superficie Web que se trabaja con datos locales de demostración, evitando que la UI sugiera persistencia o control de acceso real.
7. **Runner de pruebas propuesto:** evaluar Vitest con React Testing Library por compatibilidad esperada con React/Vite. Esta es una decisión técnica propuesta; no existe todavía un manifiesto, runner configurado ni evidencia de ejecución.

Las decisiones sobre catálogos, reglas de correo repetido, permisos, estados adicionales, errores de concurrencia y contrato remoto no se resuelven en esta propuesta porque no están respaldadas por evidencia disponible.

## 7. Criterios de aceptación observables

Los siguientes criterios definen el comportamiento esperado del primer slice local. No implican persistencia ni integración backend.

- **AC-01 — Consulta:** al abrir la superficie de gestión, se muestra una lista de registros provistos por el adaptador local, con los datos necesarios para identificar nombre, correo, rol y estado.
- **AC-02 — Alta válida:** al completar nombre, correo, rol y estado con valores no vacíos y confirmar, se crea un nuevo registro en el repositorio local y el registro aparece en la lista.
- **AC-03 — Validación obligatoria:** si falta cualquiera de los campos requeridos, la operación de alta o guardado se bloquea y la UI muestra un error asociado a la validación.
- **AC-04 — Edición:** al seleccionar un usuario existente, modificar sus datos y confirmar, la lista refleja los valores actualizados sin crear un registro duplicado por la edición.
- **AC-05 — Desactivación no destructiva:** al desactivar un usuario, el registro continúa disponible en el estado/listado local y se muestra como inactivo; no se elimina físicamente del repositorio.
- **AC-06 — Resultado de operación:** una operación local exitosa muestra confirmación y una operación rechazada por validación o error controlado muestra un mensaje de error comprensible.
- **AC-07 — Límite local verificable:** las operaciones no realizan llamadas a endpoints ni declaran éxito de persistencia, autenticación o autorización real.
- **AC-08 — Distinción de historias:** la implementación y su documentación identifican el cambio como HU-03 del modelo y no incorporan el flujo de verificación de correo de HU-003 canónica.

La mención de correo repetido en la prueba CP-03 se registra como gap. No se convierte en criterio obligatorio hasta que exista una regla de unicidad y una autoridad definida.

## 8. Arquitectura de alto nivel

```text
UsersPage / user-management UI
            |
     application actions
            |
      UserRepository port
            |
   InMemoryUserRepository
            |
       local fixtures
```

- **Presentación:** una superficie Web para listado, alta, edición, desactivación, validación y mensajes.
- **Aplicación:** acciones explícitas para `listUsers`, `createUser`, `updateUser` y `deactivateUser`.
- **Dominio/tipos:** tipos internos en inglés para los datos mínimos de la HU, sin afirmar que sean el esquema backend.
- **Persistencia/adaptación:** `InMemoryUserRepository` con fixtures controlados y estado de sesión.
- **Integración futura:** el puerto podrá recibir un adaptador remoto en otra propuesta cuando exista contrato; este cambio no diseña endpoints ni payloads.

No se fija todavía una estructura concreta de carpetas, librería visual, router o catálogo de valores. Esas decisiones pertenecen al diseño y deben respetar la evidencia y la raíz de edición autorizada.

## 9. Estrategia de pruebas

Strict TDD está activo y debe seguir el ciclo **RED → GREEN → TRIANGULATE → REFACTOR** en las fases de implementación y verificación.

La estrategia propuesta es:

1. validar primero las reglas de campos obligatorios y la conservación del registro al desactivar;
2. probar el repositorio local de forma aislada para listar, crear, editar y desactivar;
3. probar la superficie de gestión para verificar criterios observables, mensajes y actualización de la lista;
4. comprobar que la UI usa el repositorio local y no depende de llamadas HTTP o almacenamiento persistente;
5. ejecutar las pruebas con un runner compatible con Vite, preferentemente Vitest + React Testing Library, solo después de confirmar la configuración real del proyecto.

En esta fase **no se ejecutaron pruebas**: el repositorio no tiene aún `package.json`, configuración de pruebas, runner ni comando detectable. Tampoco se intentará probar autenticación, autorización efectiva, persistencia backend o integración end-to-end, porque quedan fuera del slice y no tienen contrato disponible.

## 10. Áreas afectadas

Las fases posteriores podrán afectar únicamente a superficies dentro de `panel/`:

- configuración mínima de React/TypeScript/Vite y dependencias de desarrollo;
- componentes y composición de la pantalla de gestión de usuarios;
- tipos y validadores locales;
- puerto y adaptador de repositorio en memoria;
- fixtures controlados;
- configuración y pruebas del runner;
- documentación local del cambio.

Quedan expresamente fuera `backend/`, Flutter y cualquier archivo de la raíz del monorepo. Esta propuesta no implementa ninguno de esos cambios.

## 11. Gaps y decisiones pendientes

| ID | Gap o decisión | Consecuencia | Momento sugerido |
| --- | --- | --- | --- |
| GAP-001 | `panel/` no tiene estructura de aplicación ni fuente. | Debe definirse el bootstrap mínimo antes de implementar. | Diseño/tareas |
| GAP-002 | No hay runner ni comando de pruebas. | Strict TDD no puede ejecutarse todavía. | Diseño/tareas, antes de aplicar |
| GAP-003 | No existe contrato API o modelo remoto de usuarios. | El slice debe permanecer local y no puede afirmar integración. | Antes de una futura integración |
| GAP-004 | No hay catálogo de roles, estados ni reglas de autorización. | Los valores locales no son autoridad de dominio. | Requisito funcional posterior |
| GAP-005 | CP-03 menciona correo repetido sin regla formal. | No se exige unicidad en este slice. | Decisión de negocio posterior |
| GAP-006 | La consulta solo está definida como visualización de lista. | Búsqueda, filtros y paginación quedan fuera. | Refinamiento posterior |
| GAP-007 | No hay evidencia de ejecución del panel ni de CP-03. | No se pueden declarar resultados históricos como pruebas actuales. | Verificación del slice |
| GAP-008 | HU-03 modelo y HU-003 canónica tienen significados distintos. | La trazabilidad debe conservar ambas identidades separadas. | Todas las fases |

## 12. Riesgos y mitigaciones

| Riesgo | Impacto | Mitigación propuesta |
| --- | --- | --- |
| Confundir HU-03 con HU-003 | Se implementaría verificación de correo en lugar de gestión de usuarios. | Repetir la distinción en nombres, artefactos, pruebas y criterios de aceptación. |
| Simular persistencia o integración | Las personas podrían interpretar datos locales como datos reales. | Adaptador en memoria, sin almacenamiento del navegador ni HTTP, y aviso explícito de alcance local. |
| Inventar roles, estados o permisos | Se fijaría una regla de negocio no autorizada. | Tratar valores como fixtures locales y registrar GAP-004; no implementar RBAC. |
| Desactivación destructiva | Se perdería el registro que la HU exige conservar. | Probar que el repositorio conserva el registro y cambia solo su estado local. |
| Falta de runner | Strict TDD quedaría sin evidencia ejecutable. | Resolver la configuración del runner antes de los tests; no declarar pruebas pasadas mientras no exista. |
| Crecimiento hacia backend o seguridad | El primer slice se volvería no entregable o excedería la raíz autorizada. | Mantener límites de archivo y no objetivos; cualquier integración requiere nuevo contrato y cambio. |
| Diseño UI arbitrario | Se introducirían decisiones visuales sin base existente. | Mantener el diseño mínimo, accesible y coherente con la evidencia; diferir sistema visual definitivo. |

## 13. Rollback y recuperación

El slice no modifica datos externos porque no tendrá persistencia ni integración backend. Si la implementación posterior debe revertirse, el rollback consiste en retirar de `panel/` la pantalla de gestión, el repositorio/adaptador local, fixtures, validadores, pruebas y configuración agregada, restaurando la estructura previa del panel. No se requiere rollback en backend, Flutter, bases de datos, endpoints ni autenticación.

Si durante la implementación aparece un contrato real o una necesidad de seguridad no cubierta, se debe detener la integración local adicional y registrar un nuevo cambio o una decisión explícita; no se debe ampliar este slice silenciosamente.

## 14. Criterios de éxito del cambio

El cambio podrá considerarse exitoso cuando:

1. el panel Web permita observar los cuatro flujos de HU-03 —consultar, crear, editar y desactivar— usando exclusivamente el adaptador local;
2. se cumplan AC-01 a AC-08 mediante pruebas y verificación manual documentada, sin presentar como evidencia la CP-03 histórica del modelo;
3. el registro desactivado permanezca disponible localmente y no se elimine;
4. los campos obligatorios y mensajes de resultado sean observables;
5. el runner propuesto esté confirmado, configurado y sus pruebas puedan ejecutarse bajo Strict TDD;
6. no existan llamadas a endpoints inventados, persistencia real, autenticación/autorización efectiva ni cambios fuera de `panel/`;
7. los gaps de contrato, roles, estados, unicidad y permisos permanezcan visibles para una futura decisión de producto;
8. la documentación preserve la separación entre HU-03 del modelo y HU-003 canónica.

Estos criterios describen el objetivo futuro del slice. En la fase actual solo se entrega esta propuesta; no se implementó código ni se ejecutaron pruebas.

## 15. Próximo paso

Continuar con la especificación y el diseño del cambio, manteniendo `panel-local` como límite de integración, el repositorio/adaptador local como seam explícito y todos los gaps no respaldados como decisiones pendientes. La siguiente fase debe convertir los criterios observables en requisitos verificables sin ampliar el alcance a backend, Flutter, autenticación o contratos no disponibles.

## Key Learnings

- El producto seleccionado es HU-03 del documento modelo, no HU-003 canónica.
- `panel-local` permite una experiencia CRUD Web verificable sin inventar una integración backend.
- La desactivación debe conservar el registro; la persistencia real, la autorización y la unicidad de correo no están respaldadas para este slice.
- Vitest + React Testing Library es una propuesta técnica compatible con el stack declarado, no evidencia de runner existente ni de pruebas ejecutadas.
- La ausencia de catálogo de roles/estados y de contrato API debe permanecer como gap explícito.
