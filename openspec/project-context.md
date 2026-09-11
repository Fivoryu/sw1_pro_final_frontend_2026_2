# Contexto SDD — RoomForge Panel

## Identificación y alcance

- **Proyecto:** RoomForge, superficie Web administrativa y de agente.
- **Repositorio objetivo:** `panel/`, repositorio Git independiente.
- **Rama observada:** `main`, limpia y alineada con `origin/main` durante la inicialización.
- **Cambio previsto:** HU-03 del modelo, «Gestión de usuarios»: crear, editar,
  desactivar y consultar usuarios.
- **Restricción:** las mutaciones del cambio quedan limitadas a `panel/`.
  No se deben modificar backend, Flutter ni la raíz del monorepo.

## Evidencia inspeccionada

La única evidencia local disponible al inicializar fue `README.md`. Declara:

- React + TypeScript + Vite.
- Panel administrativo y de agente de RoomForge (web).
- Estructura inicial, sin código.
- Documentación de arquitectura enlazada externamente mediante
  `../docs/scrum/sprint-0-requerimientos/09-infraestructura.md`.

No se encontraron dentro de `panel/` archivos fuente, `package.json`, lockfile,
configuración de Vite/TypeScript, configuración de pruebas ni documentación
adicional.

## Pruebas y Strict TDD

Strict TDD está activo para las fases de implementación y verificación:
RED → GREEN → TRIANGULATE → REFACTOR.

**Comando de pruebas detectado:** ninguno. No existe runner ni configuración de
pruebas en `panel/`; este gap debe resolverse antes de ejecutar pruebas reales.
No se inventan comandos, tests, endpoints ni evidencia.

## Convenciones SDD

- Artefactos: híbridos, OpenSpec + Engram.
- Documentación SDD: español profesional.
- Código e identificadores: inglés.
- Estrategia de entrega: `ask-on-risk`.
- Presupuesto de revisión por defecto: 400 líneas modificadas.
- No commits ni pushes durante esta inicialización.

## Gaps abiertos

- **GAP-001:** no existe implementación web local sobre la que diseñar o probar.
  Acción: definir la primera estructura de aplicación en las fases de propuesta,
  especificación y diseño, sin asumir contratos no presentes.
- **GAP-002:** no hay runner de pruebas detectado. Acción: decidir y documentar
  el runner como parte del diseño/tareas antes de aplicar Strict TDD.
- **GAP-003:** los requisitos detallados de HU-03 no están presentes en el
  repositorio `panel/`. Acción: recuperar la fuente autorizada del modelo en la
  fase de exploración/propuesta y marcar cualquier dato no verificable.

## Estado de inicialización

Configuración local: [`config.yaml`](config.yaml).

Este contexto registra únicamente hechos verificables del repositorio objetivo y
las decisiones de sesión proporcionadas por el orquestador.
