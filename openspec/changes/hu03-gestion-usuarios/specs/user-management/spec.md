# Especificación de user-management

## Propósito

Definir el comportamiento del primer slice `panel-local` para la gestión administrativa de usuarios de HU-03 del documento modelo. El slice permite consultar, crear, editar y desactivar registros de demostración durante la sesión de la aplicación, sin representar usuarios reales ni una integración con servicios externos.

## Requisitos

### Requirement: Consulta de usuarios

La superficie de gestión MUST mostrar una lista de registros de usuario disponibles en el alcance local, incluyendo `name`, `email`, `role` y `status` para cada registro. La consulta MUST limitarse a la visualización de la lista; no incluye búsqueda, filtros, paginación ni ordenamiento.

#### Scenario: Visualización inicial de la lista

- GIVEN que la superficie de gestión se abre en una sesión de la aplicación
- WHEN se solicita la consulta de usuarios
- THEN se muestra la lista local disponible y cada registro presenta `name`, `email`, `role` y `status`

### Requirement: Alta de usuarios con datos respaldados

El sistema MUST permitir crear un registro de usuario mediante los cuatro campos respaldados por HU-03: `name`, `email`, `role` y `status`. Un alta aceptada MUST hacer visible el nuevo registro en la lista local.

#### Scenario: Alta válida

- GIVEN que la persona completa `name`, `email`, `role` y `status` con valores no vacíos
- WHEN confirma el alta
- THEN se incorpora un nuevo registro a la lista local con esos valores

### Requirement: Validación de campos obligatorios

El sistema MUST validar que `name`, `email`, `role` y `status` tengan un valor no vacío antes de crear un registro o guardar una edición. Si falta cualquiera de ellos, MUST bloquear la operación e informar el campo o los campos que requieren corrección. Esta validación MUST NOT establecer catálogos normativos de roles o estados ni una regla formal de unicidad de correo.

#### Scenario: Alta incompleta

- GIVEN que uno o más de los cuatro campos obligatorios están vacíos
- WHEN la persona intenta confirmar el alta
- THEN el sistema no crea el registro y muestra un mensaje de error de validación asociado al dato faltante

#### Scenario: Edición incompleta

- GIVEN que una persona edita un usuario y deja vacío al menos uno de los cuatro campos obligatorios
- WHEN intenta guardar los cambios
- THEN el sistema conserva los datos anteriores, no guarda la edición y muestra un mensaje de error de validación

### Requirement: Edición sin duplicación

El sistema MUST permitir modificar los datos de un usuario existente. Una edición válida MUST actualizar el registro seleccionado y MUST NOT crear un segundo registro como consecuencia de la edición.

#### Scenario: Actualización de un usuario existente

- GIVEN que existe un usuario seleccionado y sus cuatro campos reciben valores no vacíos
- WHEN la persona confirma la edición
- THEN la lista muestra los valores actualizados en el mismo registro y la cantidad de registros no aumenta por la edición

### Requirement: Desactivación no destructiva

El sistema MUST permitir desactivar un usuario sin eliminar su registro ni los datos asociados del alcance local. Después de la desactivación, el registro MUST continuar disponible y MUST reflejar un estado inactivo. El slice MUST NOT definir un catálogo normativo ni transiciones adicionales para `status`.

#### Scenario: Desactivación de un usuario

- GIVEN que existe un usuario activo en la lista local
- WHEN la persona solicita su desactivación
- THEN el registro permanece disponible con sus datos y se muestra como inactivo

### Requirement: Mensajes de resultado

El sistema MUST comunicar mediante un mensaje comprensible el resultado de cada operación de alta, edición o desactivación. Una operación exitosa MUST mostrar una confirmación; una operación bloqueada por validación o por un error controlado MUST mostrar un mensaje de error y MUST preservar los datos válidos existentes.

#### Scenario: Confirmación de una operación exitosa

- GIVEN que una operación local de alta, edición o desactivación se completa correctamente
- WHEN el sistema termina la operación
- THEN muestra un mensaje de confirmación comprensible para la persona

#### Scenario: Error controlado

- GIVEN que una operación local es rechazada por validación o por un error controlado
- WHEN el sistema comunica el resultado
- THEN muestra un mensaje de error comprensible y no presenta la operación como exitosa

### Requirement: Alcance de datos en memoria

Los registros del slice MUST permanecer únicamente en memoria durante la sesión de la aplicación. El sistema MUST reiniciar el estado local al recargar o reiniciar la aplicación y MUST comunicar que los datos son locales y de demostración. El sistema MUST NOT usar almacenamiento persistente del navegador ni afirmar conservación entre sesiones.

#### Scenario: Reinicio del estado al recargar

- GIVEN que durante una sesión se crea, edita o desactiva un usuario
- WHEN la aplicación se recarga o se reinicia
- THEN el estado local vuelve a su estado inicial de la sesión y no se presenta como persistido

#### Scenario: Transparencia del alcance local

- GIVEN que la persona visualiza o modifica usuarios en el panel
- WHEN consulta la superficie de gestión
- THEN encuentra una indicación de que los datos son locales y de demostración, sin promesa de persistencia ni de usuarios reales

### Requirement: Ausencia de integración externa y seguridad efectiva

Las operaciones de `user-management` MUST ejecutarse sin llamadas HTTP, endpoints ni servicios externos. El slice MUST NOT declarar persistencia remota, autenticación, autorización efectiva, verificación de que la persona es administradora, RBAC ni auditoría. Los valores de `role` y `status` MUST tratarse como datos locales no normativos.

#### Scenario: Operación exclusivamente local

- GIVEN que la persona consulta o ejecuta una operación de gestión de usuarios
- WHEN el sistema procesa la operación
- THEN la operación se resuelve dentro del alcance local en memoria y no realiza una llamada HTTP ni a un endpoint

#### Scenario: Sin afirmación de control de acceso real

- GIVEN que la persona utiliza la superficie de gestión
- WHEN el sistema presenta el flujo de usuario
- THEN no afirma haber autenticado, autorizado ni validado permisos o membresías reales

### Requirement: Separación de HU-03 y HU-003 canónica

La especificación y la superficie de este cambio MUST identificar el alcance como HU-03 del documento modelo. El sistema MUST NOT incorporar el flujo de verificación de correo correspondiente a HU-003 canónica.

#### Scenario: Alcance de la historia seleccionada

- GIVEN que se consulta la funcionalidad entregada por este cambio
- WHEN se revisan sus operaciones y documentación
- THEN se identifica gestión de usuarios de HU-03 y no se incluye verificación de correo de HU-003 canónica
