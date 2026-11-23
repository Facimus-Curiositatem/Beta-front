# Pulido visual del frontend - issue #35

## Diseño

El objetivo es dar un aspecto sencillo y coherente a las vistas que ya funcionan.
La base es `origin/main` en `0dc05d3`; la rama de trabajo es
`feature/35-pulido-visual`.

Se utiliza CSS propio, la tipografía del sistema y HTML semántico. La paleta usa
azul para navegación y acciones, blanco para el contenido y gris claro para el
fondo. Rojo y verde distinguen acciones destructivas y confirmaciones.

Se eligieron reglas compartidas en `src/styles.css` para evitar repetir un diseño
en cada componente. Las reglas específicas del menú y del modelador se conservan
en sus CSS de componente. Añadir una biblioteca de componentes o rehacer las
pantallas haría el cambio más difícil de explicar y de integrar para este alcance.

## Restricciones

- Mantener OnPush, signals, formularios reactivos, DTO, rutas y servicios.
- No añadir dependencias, fuentes externas ni imágenes decorativas.
- No alterar coordenadas ni tamaños de las figuras BPMN.
- Conservar controles, textos de acciones y bindings usados por las pruebas.
- Separar el aspecto visual del cambio de refresh token del issue #34.

## Implementación y comprobación

- [x] Aplicar variables de color, controles, tablas, foco y mensajes compartidos.
- [x] Ajustar menú, acceso, filtros y contenedores de tablas.
- [x] Adaptar las columnas del modelador a tablet y móvil en su CSS de componente.
- [x] Compilar producción y comprobar tipos de las pruebas.
- [x] Intentar pruebas existentes: Chromium no inicia por restricciones del entorno.
- [ ] Revisar vistas a tamaños de escritorio y móvil: navegador bloqueado.
- [x] Documentar archivos, CSS utilizado y recorrido para la sustentación.

La entrega se prepara en commits separados de código y documentación, con un PR
dirigido a main y Mundolel como reviewer. No se integra automáticamente.

## Revisión

Comprobar tablas anchas, etiquetas de checkbox, formularios con errores, sesión
cerrada, menú en móvil y panel del modelador. Si se utilizan datos simulados para
la inspección visual, se mantienen fuera de la aplicación y se indican como tal.
La prueba previa de Karma no pudo iniciar Chromium por restricciones del entorno;
no se considera una prueba funcional aprobada.

La revisión de código detectó y permitió corregir dos conflictos de cascada:
las reglas responsive del modelador ahora están en su componente, y los campos
generales se limitan a formularios para respetar el editor de nombres del lienzo.
El detalle de comprobaciones y el recorrido visual pendiente están en
`ESTUDIO-PULIDO-VISUAL-SAMUEL.md`.
