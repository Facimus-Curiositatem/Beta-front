# Entrega Angular — Samuel

## Incluido

- H1 (#4): registro de empresa, login/logout, manejo JWT y navegación.
- H8 (#11): roles CRUD/búsqueda paginada y configuración de permisos.
- H4 (#7): compartir/revocar, recibidos y detalle completo de solo lectura.
- Guía: [GUIA-ANGULAR-SAMUEL.md](GUIA-ANGULAR-SAMUEL.md), 63 archivos con código completo y guion.

## Verificación del 24 de octubre

- `npm ci`: completado sin cambiar package-lock.json.
- `npm test -- --watch=false --browsers=ChromeHeadless --code-coverage`: 89 pruebas, 0 fallos.
- `npm run build`: producción correcta.
- Cobertura global: líneas 82,1%; sentencias 80,57%; ramas 50%; funciones 65,24%.
- `git diff --check`: sin errores.
- Revisión independiente y pruebas de cambio de ID sobre componentes reutilizados.
- El navegador de pruebas se instaló fuera del repositorio; no añade dependencias a la aplicación.

## Pendiente para integración del equipo

1. Reemplazar InicioProcesosComponent en /procesos al integrar H3. Conservar accesos a pools y compartir.
2. Coordinar modelos de lectura de procesos/nodos con H3/H6/H7 al integrar sus ramas.
3. Probar contra la VM desde la red del equipo: registro, dos empresas, tres roles de acceso, compartir y revocar. La VM 10.43.99.37:8080 no estuvo accesible desde este entorno.
4. Configurar proxy de desarrollo o reverse proxy de producción hacia el backend correcto.

El guard inspecciona vencimiento y rol declarado, no verifica firma JWT. Spring Security y los services mantienen autorización y multitenencia. No se ha mergeado main.
