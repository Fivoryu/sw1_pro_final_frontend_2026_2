# Tareas de implementación — HU-03 Gestión de usuarios

## Contexto y límites

- Alcance: `panel-local`, dentro de `panel/` exclusivamente.
- Historia: HU-03 del documento modelo, Gestión de usuarios; no implementar HU-003 de verificación de correo.
- Datos: únicamente en memoria durante la sesión, sin `fetch`, APIs HTTP, `localStorage`, `sessionStorage`, IndexedDB ni servicios externos.
- Campos: `name`, `email`, `role` y `status`; validar solo presencia después de recortar espacios. No agregar formato o unicidad formal de correo, catálogos normativos, autenticación, autorización, RBAC, auditoría, búsqueda, filtros, paginación, eliminación ni reactivación dedicada.
- Idioma: documentación y mensajes en español profesional; identificadores técnicos en inglés.

## Review Workload Forecast

| Field | Value |
| ------- | ------- |
| Estimated changed lines | 395–425 líneas autorales; el lockfile generado, si corresponde, se reporta aparte |
| 400-line budget risk | Medium |
| Chained PRs recommended | No |
| Suggested split | Un único slice con excepción de tamaño confirmada |
| Delivery strategy | ask-on-risk |
| Chain strategy | size-exception |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: size-exception
400-line budget risk: Medium

El diseño estima 395 líneas, pero el bootstrap vacío, la configuración del runner y la prueba completa de accesibilidad pueden llevar el cambio apenas por encima del presupuesto de 400 líneas. El usuario confirmó `size-exception` para mantener un único slice. La excepción cubre únicamente el presupuesto de tamaño; no autoriza ampliar el alcance ni ocultar el conteo autoral. El lockfile no se usa para reducir artificialmente el conteo, aunque debe permanecer dentro de `panel/` si npm lo genera.

## Decisión de entrega confirmada

- **Decisión:** `size-exception`.
- **Aplicación:** un único slice de implementación, sin commits, pushes ni PRs automáticos.
- **Límite:** si el diff real supera sustancialmente la estimación o aparece trabajo fuera de HU-03/panel-local, detenerse y solicitar una nueva decisión; la excepción no autoriza scope creep.

## Secuencia de trabajo

### Unidad 0 — Bootstrap y confirmación del toolchain

- [x] Confirmar en `panel/` el estado inicial, la disponibilidad de Node/npm, el gestor y cualquier lockfile o convención existente; si no existe una convención, crear únicamente `panel/package.json`, `panel/index.html`, `panel/tsconfig.json`, `panel/vite.config.ts`, `panel/src/main.tsx`, `panel/src/App.tsx` y `panel/src/styles.css` con React + TypeScript + Vite mínimo, scripts `dev`, `build`, `test` y `test:run`, y sin modificar la raíz. <!-- sdd-owner: implementation -->
  - Inicio: solo `panel/README.md`, configuración OpenSpec y artefactos del cambio.
  - Fin: el panel tiene bootstrap compilable pendiente de verificación, sin funcionalidad de usuarios ni dependencias externas inventadas.
  - Verificación: inspección de manifiesto y configuración; ejecutar después, como evidencia de apply, `npm run build` únicamente cuando las dependencias estén confirmadas.
  - Rollback: retirar los archivos de bootstrap agregados dentro de `panel/`; no tocar `backend/`, Flutter ni la raíz.

### Unidad 1 — Configuración de Vitest y Testing Library

- [x] Configurar en `panel/vite.config.ts` el entorno `jsdom` y `setupFiles: ['./src/test/setup.ts']`, crear `panel/src/test/setup.ts` con `@testing-library/jest-dom`, y agregar solo las dependencias necesarias de Vitest, React Testing Library, `@testing-library/user-event` y `jsdom` en `panel/package.json`; si npm produce `panel/package-lock.json`, mantenerlo como efecto generado y no editarlo para ocultar líneas. <!-- sdd-owner: implementation -->
  - Inicio: bootstrap confirmado y gestor/lockfile documentado; no declarar runner existente antes de este paso.
  - Fin: `npm run test:run` puede descubrir una suite vacía o mínima en `panel/` sin tocar superficies externas.
  - Verificación: comprobar scripts, configuración, setup y que no haya configuración de pruebas fuera de `panel/`; registrar el resultado real, sin afirmar ejecución previa.
  - Rollback: revertir `package.json`, lockfile generado, `vite.config.ts` y `src/test/setup.ts` agregados por esta unidad.

### Unidad 2 — Dominio y repositorio en memoria (Strict TDD)

#### RED

- [x] Escribir primero en `panel/src/domain/user.test.ts` las pruebas de `validateUserDraft` y `normalizeUserDraft` para los cuatro campos vacíos o con espacios, recorte de valores y ausencia de reglas de formato/unicidad; escribir en `panel/src/data/InMemoryUserRepository.test.ts` las pruebas de lista inicial, alta, edición sin aumentar la cantidad y desactivación que conserva el registro y sus datos. <!-- sdd-owner: implementation -->

#### GREEN

- [x] Implementar el mínimo en `panel/src/domain/user.ts`, `panel/src/data/UserRepository.ts`, `panel/src/data/InMemoryUserRepository.ts` y `panel/src/data/fixtures/users.ts`: tipos internos `User`, `UserDraft`, `UserField`, `ValidationErrors`, `INACTIVE_STATUS`, validación/normalización, puerto asíncrono, clonado de fixtures, IDs locales, mutaciones seguras y desactivación no destructiva; mantener `role` y `status` como `string` y aceptar correos repetidos. <!-- sdd-owner: implementation -->

#### TRIANGULATE

- [x] Contrastar el dominio y el adaptador en `panel/src/domain/user.test.ts` y `panel/src/data/InMemoryUserRepository.test.ts` con copias devueltas, conservación del mismo `id`, rechazo de registros inexistentes y ausencia de métodos de borrado/reactivación/storage; usar solo pruebas locales y registrar cualquier fallo controlado observado. <!-- sdd-owner: implementation -->

#### REFACTOR

- [x] Refactorizar únicamente después de mantener verde el grupo de dominio/datos: simplificar tipos, nombres y clonación sin alterar el contrato definido en `panel/src/data/UserRepository.ts`; confirmar que el diff sigue dentro del presupuesto y que el rollback de la unidad elimina solo dominio, fixtures, puerto, adaptador y sus pruebas. <!-- sdd-owner: implementation -->

### Unidad 3 — Servicio de aplicación y puerto (Strict TDD)

#### RED

- [x] Escribir en `panel/src/application/userManagementService.test.ts` pruebas para `listUsers`, `createUser`, `updateUser` y `deactivateUser`, incluyendo validación antes del repositorio, normalización, `UserValidationError`, `UserNotFoundError`, propagación de errores controlados y preservación de datos cuando una operación falla; usar un doble de `UserRepository`. <!-- sdd-owner: implementation -->

#### GREEN

- [x] Implementar `panel/src/application/userManagementService.ts` como frontera de aplicación que coordine el puerto de `panel/src/data/UserRepository.ts`, valide todos los borradores antes de mutar y exponga solo las cuatro operaciones autorizadas, sin HTTP, almacenamiento, catálogo de roles/estados ni autorización. <!-- sdd-owner: implementation -->

#### TRIANGULATE

- [x] Triangular el servicio con `InMemoryUserRepository` real y con el doble de repositorio desde `panel/src/application/userManagementService.test.ts`: verificar alta, edición sin duplicación, desactivación a `inactive`, correos repetidos aceptados y errores sin actualización optimista; ejecutar el grupo focalizado con `npm run test:run -- panel/src/application/userManagementService.test.ts`. <!-- sdd-owner: implementation -->

#### REFACTOR

- [x] Refactorizar servicio y errores solo con la suite verde, conservando inyección explícita y contratos internos; confirmar que ninguna importación de `fetch`, storage, auth o RBAC aparezca en `panel/src/application/` o `panel/src/data/`. <!-- sdd-owner: implementation -->

### Unidad 4 — Superficie accesible y responsive (Strict TDD)

#### RED

- [x] Escribir en `panel/src/features/user-management/UserManagementPage.test.tsx` pruebas de Testing Library para render inicial con los cuatro datos, aviso local, alta válida, validación asociada por campo, edición sin duplicación, desactivación visible y no destructiva, cancelación, mensajes de éxito/error, estados de carga/error y ausencia de verificación de correo; probar con el servicio real en memoria y dobles controlados para fallos. <!-- sdd-owner: implementation -->

#### GREEN

- [x] Implementar `panel/src/features/user-management/UserManagementPage.tsx`, `panel/src/App.tsx` y `panel/src/main.tsx` para inyectar una instancia estable del servicio, cargar la lista, reutilizar el formulario de alta/edición, enfocar el primer campo inválido, conservar borradores ante error, recargar la lista después de éxito y mostrar exclusivamente operaciones locales de HU-03. <!-- sdd-owner: implementation -->

- [x] Completar `panel/src/styles.css` y `panel/index.html` con interfaz content-first mobile-first, viewport sin bloquear zoom, layout de una columna y dos áreas desde aproximadamente 768px, lista sin scroll horizontal, labels visibles, foco de alto contraste, controles de al menos 44px, separación de 8px, estados textuales y soporte de `prefers-reduced-motion`; no incorporar librería visual, gradientes, emojis ni iconos aislados. <!-- sdd-owner: implementation -->

#### TRIANGULATE

- [x] Triangular la UI en `panel/src/features/user-management/UserManagementPage.test.tsx` y mediante recorrido manual del panel: teclado y orden de foco, `aria-required`, `aria-invalid`, `aria-describedby`, `aria-busy`, regiones `role="status"`/error, mensajes comprensibles, viewport aproximado de 375px y 768px, orientación horizontal, alta, edición, desactivación y reinicio de fixtures; revisar estáticamente que no existan HTTP ni storage. <!-- sdd-owner: implementation -->

#### REFACTOR

- [x] Refactorizar composición, estado y CSS solo después de la triangulación verde, sin introducir routing, filtros, paginación, confirmación de borrado, persistencia o seguridad efectiva; mantener el aviso visible de datos locales y el encabezado `HU-03 — Gestión de usuarios`. <!-- sdd-owner: implementation -->

### Unidad 5 — Build y límites estáticos

- [x] Agregar o ajustar pruebas de frontera dentro de `panel/src/` y verificaciones de configuración para asegurar que `panel/` no importa `fetch`, APIs de almacenamiento, endpoints, backend, auth, RBAC, auditoría ni flujo de HU-003; conservar únicamente fixtures locales y valores no normativos de `role`/`status`. <!-- sdd-owner: implementation -->
- [x] Ejecutar y registrar en la evidencia de apply, sin modificar archivos después de la comprobación, `npm run test:run` y `npm run build` desde `panel/`; comprobar que el build estático incluye la entrada React y que los errores de consulta/mutación no se presentan como éxito. <!-- sdd-owner: implementation -->
- [x] Revisar `git diff --stat` y las rutas modificadas del repositorio independiente `panel/`, contar adiciones y eliminaciones autorales separando el lockfile generado, y detenerse para decisión `ask-on-risk` si se supera el presupuesto o aparece una necesidad fuera de HU-03; rollback: retirar solo el slice de `panel/` y sus pruebas/configuración. <!-- sdd-owner: implementation -->

## Fuera de alcance y criterio de detención

No crear tareas ni archivos para `backend/`, Flutter o la raíz; no crear endpoints, payloads, migraciones, contratos API, autenticación, autorización, RBAC, auditoría, catálogos normativos, unicidad formal de correo, búsqueda/filtros/paginación, persistencia, eliminación/reactivación o verificación de correo HU-003. Si aparece cualquiera de esas necesidades, detener la unidad actual y registrar un nuevo cambio o decisión de producto.

## Verificación final esperada

La fase posterior de verificación deberá comprobar AC-01 a AC-08 contra `panel/openspec/changes/hu03-gestion-usuarios/specs/user-management/spec.md`, leyendo el diff real y la evidencia de `npm run test:run` y `npm run build`. En esta fase de tareas no se ejecutaron instalaciones, pruebas ni build.
