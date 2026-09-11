# Diseño técnico — HU-03 Gestión de usuarios

## 1. Decisión y evidencia

**Cambio:** `hu03-gestion-usuarios`  
**Slice autorizado:** `panel-local`  
**Superficie:** panel Web dentro de `panel/`  
**Idioma del artefacto:** español profesional; los identificadores técnicos y ejemplos de código se mantienen en inglés.

### Evidencia observada

- La propuesta y la especificación de OpenSpec, junto con sus observaciones equivalentes de Engram (`sdd/hu03-gestion-usuarios/proposal` y `sdd/hu03-gestion-usuarios/spec`), definen únicamente una experiencia local de demostración para HU-03.
- `panel/README.md` declara React + TypeScript + Vite y describe una estructura inicial sin código.
- No se observó un manifiesto, configuración Vite/TypeScript, contrato API, fuente de aplicación ni runner de pruebas en el panel. Por lo tanto, en esta fase no se ejecutaron instalaciones ni pruebas.
- HU-03 del documento modelo es distinta de HU-003 canónica de verificación de correo. Este diseño no incorpora verificación de correo.

### Decisiones de este diseño

Se propone bootstrapear una aplicación mínima React + TypeScript + Vite, con separación **presentación → aplicación → puerto de datos → adaptador en memoria → fixtures**. Se eligen Vitest, React Testing Library, `user-event` y `jsdom` como base técnica propuesta para Strict TDD. Estas elecciones son decisiones de diseño, no evidencia de dependencias ya instaladas.

El diseño no crea endpoints, payloads remotos, autenticación, autorización, RBAC, auditoría, persistencia, unicidad formal de correo ni un catálogo normativo de roles o estados.

## 2. Límites del slice

Incluye:

- lista local inicial de usuarios;
- alta, edición y desactivación no destructiva;
- campos obligatorios `name`, `email`, `role` y `status`;
- validación de no vacío después de recortar espacios;
- mensajes comprensibles de éxito y error;
- datos exclusivamente en memoria durante la sesión;
- UI responsive y accesible;
- pruebas unitarias y de componente dentro de `panel/`.

No incluye búsqueda, filtros, paginación, ordenamiento, eliminación, reactivación como acción dedicada, almacenamiento del navegador, HTTP, servicios externos ni un flujo de verificación de correo. El campo `email` no tendrá validación formal de formato ni unicidad en este slice; se validará únicamente como dato obligatorio.

## 3. Arquitectura propuesta

```text
App
  └── UserManagementPage (presentación)
        └── UserManagementService (aplicación)
              └── UserRepository (puerto)
                    └── InMemoryUserRepository (adaptador)
                          └── demoUsers (fixtures locales)
```

### Presentación

`UserManagementPage` contiene la composición visual, el estado de interacción y la traducción de resultados a mensajes. Recibe un `UserManagementService` por propiedad para poder probarse con el adaptador real o con un doble controlado. No importa `fetch`, APIs de almacenamiento ni detalles del adaptador.

La pantalla tendrá:

1. encabezado con la identificación explícita **HU-03 — Gestión de usuarios**;
2. aviso visible de que se trata de datos locales de demostración, sin persistencia ni control de acceso real;
3. formulario único reutilizable para alta y edición;
4. lista accesible de registros con nombre, correo, rol y estado;
5. acción de editar por registro;
6. acción de desactivar para registros cuyo estado local no sea `inactive`;
7. región de mensajes de operación y estado de error.

No habrá un botón de eliminación física ni una pantalla de verificación de correo.

### Aplicación

`UserManagementService` coordina validación, normalización y llamadas al puerto. Las operaciones son explícitas: `listUsers`, `createUser`, `updateUser` y `deactivateUser`. La UI no modifica colecciones directamente.

La validación se ejecuta nuevamente en la capa de aplicación aunque la UI pueda mostrar validación temprana. Así, cualquier consumidor de la aplicación conserva la misma regla y el repositorio nunca recibe un borrador inválido. No se agrega validación de catálogo, formato o unicidad.

### Datos

`UserRepository` es un puerto interno, no un contrato backend. El adaptador en memoria conserva una colección privada, devuelve copias y no expone operaciones de borrado. Sus mutaciones preparan una nueva colección y la asignan solo después de localizar el registro y completar las comprobaciones controladas.

La forma asíncrona del puerto (`Promise`) mantiene una frontera sustituible sin diseñar todavía un adaptador remoto. El adaptador local resuelve esas promesas sin I/O externo.

## 4. Modelo interno y contratos

Los tipos son internos al panel y no representan un esquema remoto:

```ts
export type UserId = string;

export interface User {
  readonly id: UserId;
  readonly name: string;
  readonly email: string;
  readonly role: string;
  readonly status: string;
}

export type UserDraft = Omit<User, "id">;
export type UserField = keyof UserDraft;
export type ValidationErrors = Partial<Record<UserField, string>>;
```

`role` y `status` permanecen como `string`; no se declaran uniones como `Admin | Agent` ni `Active | Inactive`. El valor `inactive` es un marcador local necesario para que la acción de desactivación sea observable, no un catálogo normativo. Las fixtures pueden usar valores ilustrativos como `demo-operator` y `active`, sin atribuirles permisos o semántica oficial.

El puerto será equivalente a:

```ts
export interface UserRepository {
  list(): Promise<readonly User[]>;
  create(input: UserDraft): Promise<User>;
  update(id: UserId, input: UserDraft): Promise<User>;
  deactivate(id: UserId): Promise<User>;
}
```

Contratos adicionales:

- `validateUserDraft(input): ValidationErrors` devuelve un error por cada campo cuyo valor recortado esté vacío.
- `normalizeUserDraft(input): UserDraft` recorta los cuatro valores y no cambia su contenido por reglas de dominio adicionales.
- `UserValidationError` transporta `ValidationErrors` sin modificar el repositorio.
- `UserNotFoundError` representa una selección local inexistente o desactualizada.
- `INACTIVE_STATUS = "inactive"` es una constante de presentación/aplicación local; no habilita una taxonomía de estados.

El adaptador debe:

- clonar fixtures al construirse;
- generar identificadores locales no significativos fuera de la sesión;
- conservar el mismo `id` al actualizar;
- devolver el registro al desactivar, con sus demás datos intactos y `status: "inactive"`;
- aceptar correos repetidos, porque este cambio no define unicidad;
- no implementar `delete`, `activate`, `saveToStorage` ni métodos equivalentes.

## 5. Flujo de datos y control

### Inicio y consulta

1. `App` crea una sola instancia de `InMemoryUserRepository` mediante inicialización lazy, sembrada con `demoUsers`.
2. `App` crea el servicio una sola vez y lo inyecta en `UserManagementPage`.
3. Al montar la página, esta solicita `listUsers`.
4. Mientras se resuelve la consulta se informa un estado de carga; luego se muestran todos los registros, sin filtros, ordenamiento ni paginación.
5. Un recargo del navegador vuelve a crear el adaptador con las fixtures iniciales. No se usa `localStorage`, IndexedDB, `sessionStorage`, `fetch` ni otra fuente externa.

### Alta

1. La persona completa los cuatro campos y pulsa el botón principal.
2. La página conserva el borrador, recorta valores y delega `createUser` al servicio.
3. Si la validación falla, no se invoca el puerto, se muestran errores junto a cada campo y se enfoca el primer campo inválido.
4. Si el repositorio crea el registro, la página vuelve a consultar la lista, limpia el formulario y anuncia una confirmación.
5. Si ocurre un error controlado, se conserva el borrador y la lista válida; se anuncia la causa y una acción de recuperación, sin mostrar éxito.

### Edición

1. `Edit` selecciona un `UserId` y carga una copia de sus cuatro campos en el mismo formulario.
2. El encabezado y el botón cambian a modo de edición; aparece `Cancel` para volver al alta sin mutar datos.
3. El servicio valida y llama `updateUser(selectedId, draft)`.
4. La actualización conserva el identificador y reemplaza el registro, por lo que la cantidad de elementos no aumenta.
5. Tras éxito se recarga la lista, se abandona el modo de edición y se anuncia la confirmación.
6. Ante validación o error controlado, los datos previos del repositorio permanecen intactos y el borrador queda disponible para corregirse.

### Desactivación

1. La acción `Deactivate` se muestra solo cuando el estado local no es `inactive`.
2. La página llama `deactivateUser(id)` sin borrar ni ocultar el registro.
3. El servicio/adaptador conserva nombre, correo, rol e identificador y cambia únicamente el estado local a `inactive`.
4. Se recarga la lista y se anuncia que el registro permanece disponible como inactivo.
5. No se implementa una acción dedicada de reactivación ni una transición adicional.

No se aplican actualizaciones optimistas: la lista visible se reemplaza después de una operación exitosa y una consulta posterior. Esto evita mostrar un éxito cuando el puerto rechaza la operación.

## 6. Bootstrap, dependencias e instalación

### Archivos de aplicación propuestos

| Archivo | Responsabilidad |
| --- | --- |
| `panel/package.json` | Scripts `dev`, `build`, `test` y `test:run`; dependencias React/Vite y de pruebas. |
| `panel/index.html` | Documento HTML mínimo, `lang`, viewport y punto de montaje. |
| `panel/tsconfig.json` | TypeScript estricto, JSX `react-jsx`, resolución moderna y tipos de Vite. |
| `panel/vite.config.ts` | Configuración mínima con `@vitejs/plugin-react` y entorno de pruebas `jsdom`. |
| `panel/src/main.tsx` | Punto de entrada React y hoja de estilos. |
| `panel/src/App.tsx` | Composición y creación lazy de las dependencias locales. |
| `panel/src/styles.css` | Tokens visuales, layout responsive, estados de foco y estados semánticos. |
| `panel/src/domain/user.ts` | Modelo interno, constantes y validación/normalización pura. |
| `panel/src/application/userManagementService.ts` | Casos de uso, errores y coordinación con el puerto. |
| `panel/src/data/UserRepository.ts` | Puerto interno de datos. |
| `panel/src/data/InMemoryUserRepository.ts` | Adaptador local, clonado, IDs y mutaciones no destructivas. |
| `panel/src/data/fixtures/users.ts` | Registros de demostración controlados, sin autoridad de dominio. |
| `panel/src/features/user-management/UserManagementPage.tsx` | Formulario, lista, acciones, estados y mensajes accesibles. |
| `panel/src/test/setup.ts` | Importación de `@testing-library/jest-dom` y configuración común. |
| `panel/src/domain/user.test.ts` | Pruebas de normalización y campos obligatorios. |
| `panel/src/data/InMemoryUserRepository.test.ts` | Pruebas aisladas del adaptador y desactivación no destructiva. |
| `panel/src/application/userManagementService.test.ts` | Pruebas de validación antes del puerto y propagación de errores. |
| `panel/src/features/user-management/UserManagementPage.test.tsx` | Flujos observables de lista, alta, edición, desactivación y mensajes. |

### Elección de toolchain

La propuesta elegida es **npm + Vite + TypeScript + Vitest + React Testing Library**. `jsdom` simula el DOM; `@testing-library/user-event` modela interacción de usuario; `@testing-library/jest-dom` aporta aserciones semánticas. No se incorpora una librería visual para mantener el slice pequeño y evitar decisiones de diseño no respaldadas.

Los paquetes deben instalarse únicamente dentro de `panel/` durante `sdd-apply`, después de verificar que no exista una convención o lockfile omitido. La instalación propuesta es una decisión pendiente de confirmación operativa, no una acción realizada en diseño. No se modificará la raíz del monorepo.

Scripts previstos:

```json
{
  "dev": "vite",
  "build": "tsc --noEmit && vite build",
  "test": "vitest",
  "test:run": "vitest run"
}
```

La configuración de Vitest debe incluir `environment: "jsdom"`, `setupFiles: ["./src/test/setup.ts"]` y cobertura solo si puede agregarse sin superar el presupuesto; no es requisito del slice.

## 7. Diseño de UI, accesibilidad y responsive

Se elige una interfaz administrativa **content-first**, de superficies neutras, tipografía del sistema y tokens semánticos. No se usarán gradientes, glassmorphism, emojis ni iconos aislados. La pantalla tendrá una única acción primaria por modo (`Create user` o `Save changes`) y una acción secundaria claramente separada para cancelar.

Requisitos de interacción:

- layout mobile-first con una columna en pantallas pequeñas y dos áreas (`form`/`list`) desde aproximadamente `768px`;
- `max-width` legible en escritorio, gutters adaptativos y sin ancho fijo que provoque scroll horizontal;
- lista basada en `ul`/`li` y `article` o elementos equivalentes, no una tabla que obligue a desplazamiento horizontal;
- controles de al menos `44px` de alto/ancho efectivo y separación mínima de `8px`;
- foco visible de alto contraste, orden de tabulación igual al orden visual y soporte completo de teclado;
- `main`, `h1`, `section`, `form`, labels visibles y jerarquía de encabezados secuencial;
- cada campo con `label`, `id`, `aria-required`, `aria-invalid` y `aria-describedby` cuando corresponda;
- error debajo del campo y resumen/alerta para fallos de operación; el primer campo inválido recibe foco;
- mensajes de éxito en `role="status"` con `aria-live="polite"`; errores en una región anunciable sin robar foco innecesariamente;
- estado presentado con texto (`Active`/`Inactive` como copy local) y no solo color o icono;
- `aria-busy` durante carga o guardado y controles deshabilitados mientras una operación está en curso;
- aviso persistente de alcance local visible para todas las personas usuarias;
- `inputMode="email"` y `autoComplete="email"` sin activar una regla formal de formato; la única regla de este slice es no vacío;
- soporte de `prefers-reduced-motion`; preferentemente no habrá animación necesaria para completar los flujos;
- viewport configurado sin deshabilitar zoom y layout verificable en 375px, 768px, escritorio y orientación horizontal.

La acción de desactivar no es eliminación: se rotula con claridad y el resultado confirma la conservación del registro. No se requiere un diálogo de confirmación destructivo porque el diseño no ofrece borrado físico.

## 8. Estrategia Strict TDD

El runner propuesto se confirma durante la primera tarea de aplicación. Hasta entonces no se declara evidencia ejecutable. La implementación debe seguir, por cada incremento, **RED → GREEN → TRIANGULATE → REFACTOR**.

### Secuencia

1. **RED:** escribir primero pruebas de campos vacíos/espacios y conservación al desactivar; luego pruebas de repositorio, servicio y UI.
2. **GREEN:** agregar solo el código mínimo para que pase cada grupo, sin catálogos ni reglas no solicitadas.
3. **TRIANGULATE:** contrastar cada regla en tres niveles: función pura/adaptador, servicio con doble de repositorio y flujo de componente con Testing Library; complementar con recorrido manual de navegador y revisión estática de ausencia de `fetch` y almacenamiento persistente.
4. **REFACTOR:** simplificar nombres, dependencias y composición únicamente después de mantener verde toda la suite y actualizar la evidencia.

Cobertura funcional mínima:

| Criterio | Prueba principal | Triangulación |
| --- | --- | --- |
| AC-01 | Render inicial muestra fixture y cuatro datos | Componente + adaptador real |
| AC-02 | Alta válida agrega un registro | Servicio + flujo de formulario |
| AC-03 | Cada campo vacío bloquea alta y edición | Validador + errores asociados |
| AC-04 | Edición conserva `id` y cantidad | Adaptador + lista UI |
| AC-05 | Desactivación conserva registro y datos, cambia a `inactive` | Repositorio + flujo UI |
| AC-06 | Éxitos y fallos controlados producen mensajes | Servicio falso + componente |
| AC-07 | No hay HTTP ni storage | Inyección/inspección estática + build |
| AC-08 | Título y documentación nombran HU-03; no aparece flujo de verificación | Revisión de alcance y pruebas |

La verificación posterior ejecutará, como mínimo, `npm run test:run` y `npm run build`, además de revisar manualmente los cuatro flujos, el reinicio de fixtures, foco/teclado, mensajes, contraste y viewport pequeño. No se probarán autenticación, autorización, backend, RoomForge ni CP-03 como prueba histórica de unicidad.

## 9. Errores, recuperación y rollback

- **Validación:** no hay llamada al repositorio; se preservan borrador y lista.
- **Registro no encontrado:** se muestra error controlado, se cancela la selección obsoleta y se vuelve a consultar la lista.
- **Error inesperado del puerto:** se muestra un mensaje local de recuperación, no se actualiza optimistamente la lista y se conserva la información válida visible.
- **Fallo de consulta inicial:** se muestra estado de error con `Retry`; no se presenta una lista vacía como si fuera válida.
- **Recarga:** se reinicia la instancia en memoria y vuelven las fixtures; esto se comunica como comportamiento esperado, no como pérdida de persistencia.

El adaptador no toca recursos externos, por lo que no existe rollback de datos remotos. Una mutación fallida no asigna la nueva colección. Para retirar el slice, se eliminan los archivos de bootstrap, código, fixtures, pruebas y configuración agregados dentro de `panel/`; no se modifican backend, Flutter ni archivos de la raíz. Si aparece un contrato real, una necesidad de seguridad o una regla de negocio nueva, se detiene la ampliación y se crea una decisión/cambio separado.

## 10. Presupuesto y plan de entrega

El objetivo es mantener la implementación revisable por debajo de **400 líneas cambiadas**, sin contar lockfile generado automáticamente. Presupuesto orientativo:

| Área | Presupuesto |
| --- | ---: |
| Bootstrap, configuración y entrada | 55 líneas |
| Modelo, validación, servicio, puerto, adaptador y fixtures | 105 líneas |
| Página, estados y estilos responsive | 135 líneas |
| Pruebas unitarias, de servicio y componente | 80 líneas |
| Margen de integración | 20 líneas |
| **Total objetivo** | **395 líneas** |

Si una tarea excede el presupuesto, debe reducirse el diseño o detenerse para una decisión explícita; no se agregan filtros, routing, librerías visuales, persistencia ni nuevas capacidades para compensar.

Orden de implementación sugerido:

1. confirmar gestor, versión disponible y runner; añadir bootstrap mínimo;
2. escribir pruebas RED de modelo/adaptador y completar GREEN;
3. añadir servicio y puerto con sus pruebas;
4. construir la página y estilos con pruebas de comportamiento;
5. triangular con adaptador real, doble de repositorio, navegador y revisión de límites;
6. refactorizar, ejecutar suite/build y documentar la evidencia en fases posteriores.

## 11. Riesgos y decisiones abiertas

- **Dependencias no confirmadas:** verificar durante apply el gestor y la disponibilidad de Node/npm antes de instalar. Si existe una convención del panel, se respeta sin mover el alcance.
- **Catálogo de roles/estados:** se mantiene abierto; por eso los campos son texto libre y los valores locales no son normativos.
- **Correo repetido:** se acepta en memoria y no se comunica como regla de negocio; cualquier unicidad requiere una decisión y autoridad futuras.
- **Semántica de administrador:** el encabezado describe la superficie prevista, pero no autentica ni autoriza a nadie.
- **Diferencia HU-03/HU-003:** se conserva en nombres, título, pruebas y mensajes; no se implementa verificación de correo.
- **Ausencia de fuente existente:** no se presume compatibilidad con componentes o estilos externos; el bootstrap queda deliberadamente pequeño.

## Key Learnings

- La arquitectura mínima viable es una página React inyectada con un servicio de aplicación, un puerto `UserRepository` y un adaptador en memoria.
- `role` y `status` deben permanecer como `string`; `inactive` es solo el marcador local necesario para observar la desactivación.
- La validación se limita a valores obligatorios no vacíos después de recortar espacios; no se agrega formato ni unicidad de correo.
- Vitest + React Testing Library + `jsdom` resuelve técnicamente Strict TDD como propuesta, pero la instalación y ejecución quedan para `sdd-apply`.
- La UI debe declarar que los datos son locales, no ofrecer persistencia ni seguridad efectiva y distinguir explícitamente HU-03 de HU-003.
- El plan mantiene un objetivo de 395 líneas cambiadas y no amplía el slice fuera de `panel/`.
