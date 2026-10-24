# Angular de Samuel Implementation Plan

> Ejecución nativa autorizada por el usuario; usar executing-plans.

**Goal:** Completar issues #4, #7, #11 y guía de sustentación.
**Architecture:** Conservar capas y contratos existentes; extender servicios concretos.
**Tech Stack:** Angular 20, TypeScript, RxJS, Jasmine/Karma.
**Spec:** docs/superpowers/specs/2026-10-24-angular-samuel-design.md

## Global Constraints
- Sin cambios de backend, sin merge a main, sin bibliotecas de producto nuevas.
- Validar autorización y datos siempre en backend; guard solo orienta navegación.
- Conservar RolProcesoService.listar y modelos de lanes/pools.

## Review Focus
- Token ausente/expirado, usuario sin permiso, respuesta ProblemDetail.
- Doble envío y errores HTTP recuperables.
- Rol en uso no eliminable y paginación vacía.
- Compartir con ID positivo y revocar por empresaInvitadaId.
- Detalle recibido sin acciones de escritura y con todas sus colecciones.

## Task 1: H1
Archivos: services/auth y token, guards, login, registro-empresa, app y página inicio-procesos; modelos empresa/usuario.
- [x] Specs de sesión y navegación: POST correcto, persistencia, logout incluso con error, formularios inválidos, ProblemDetail, guard administrador.
- [x] Ejecutar specs RED, implementar y repetir GREEN.
- [x] Commit H1.

## Task 2: H8
Archivos: rol-proceso, page, permiso-estructura models/services; roles list/form y permisos.
- [x] Specs HTTP CRUD/búsqueda/actualización y componentes (validaciones, enUso, guardar/error).
- [x] Ejecutar RED, implementar y repetir GREEN.
- [x] Commit H8.

## Task 3: H4
Archivos: proceso-compartido y DTOs reales, service; compartir/listado/detalle y rutas.
- [x] Specs de cinco endpoints, empresaInvitadaId, detalle solo lectura y errores.
- [x] Ejecutar RED, implementar y repetir GREEN.
- [x] Commit H4.

## Task 4: cierre
- [x] Suite completa, build producción, revisión independiente y correcciones.
- [x] Guía Markdown por archivo con código completo, explicación, preguntas y guion.
- [x] Entregar rama y patch aplicable; no mergear.

## Resultado de verificación

- 89 pruebas Jasmine/Karma pasan con Chromium Headless 153.
- npm run build pasa en producción.
- Cobertura global: líneas 82,1%; sentencias 80,57%; ramas 50%; funciones 65,24%. No equivale a cobertura de todos los casos.
- Revisión independiente: cambio de ID reutilizando componente y error persistente al recuperar carga reproducidos y corregidos con pruebas.
- Sin conexión a VM; integración con H3 pendiente de su entrega.
- No se siguió RED→GREEN individual para todos los tests nuevos: sí para sesión, endpoints ausentes, interceptores y regresiones de cambio de ID/carga. No atribuir a esta entrega una metodología TDD estricta completa.
