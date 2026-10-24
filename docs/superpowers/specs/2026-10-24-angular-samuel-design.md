# H1, H4 y H8 de Samuel

Solicitud: implementar íntegramente issues #4, #7 y #11 con guía por archivo; autorización para continuar sin preguntas por tiempo.

Decisión: Angular 20 existente, HttpClient + Observable, formularios reactivos y signals de estado. Sin librerías nuevas de producto ni abstracciones CRUD. Conservar modelos y servicios existentes. Backend origin/main determina JSON, permisos y URLs. Mantener main intacto.

H1: login/registro/logout, token y sesión de usuario, navegación y administración de rutas. H8: roles CRUD y búsqueda paginada, permisos por rol. H4: compartir/revocar/listar/detalle completo de solo lectura.

La ruta /procesos falta en main (H3 de otro integrante): añadir una página de acceso con enlaces y apertura por ID real, claramente documentada para sustituirla por H3, sin implementar su CRUD. El detalle compartido usa DTOs reales aunque H6/H7 aún no estén integrados. No sustituir autorización del backend por controles del navegador.

Verificación: specs HTTP, formularios, guards, interacción y errores; build producción; pruebas reales con backend solo si existe instancia accesible. Guía contiene código completo y preguntas por cada archivo propio.
