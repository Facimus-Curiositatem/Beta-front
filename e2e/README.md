# Tests end-to-end

Pruebas con Selenium y pytest que manejan un navegador real contra la aplicacion levantada (front + back).
Son independientes del codigo Angular: no modifican `src/` ni forman parte de `ng test`.

## Que cubren

| Archivo | Flujos |
|---|---|
| `test_login.py` | Login valido e invalido, validaciones, ruta protegida y cerrar sesion |
| `test_registro_empresa.py` | Validaciones del registro y entrada del administrador registrado |
| `test_procesos.py` | Crear, validar, editar, publicar y eliminar procesos |
| `test_modelado.py` | Crear pool, lane, actividad, gateway y arco |
| `test_usuarios.py` | Crear, desactivar y reactivar usuarios |
| `test_roles.py` | Crear, editar y eliminar roles de proceso |

## Estructura

- `pages/`: un Page Object por pantalla. Solo aqui van los selectores. `base_page.py` tiene las esperas y acciones comunes.
- `tests/`: los escenarios. Describen lo que hace el usuario y verifican el resultado.
- `conftest.py`: configuracion compartida: abrir el navegador, la empresa de prueba y los datos que necesita cada test.
- `datos.py`: generadores de nombres y datos unicos.

## Datos de prueba

Cada ejecucion registra una empresa nueva por la pantalla de registro, con un administrador
y una contrasena aleatoria. Todo lo que crean los tests queda dentro de esa empresa:

- No se tocan los datos de otras empresas.
- No hace falta configurar usuarios ni credenciales.
- Cada test crea lo que necesita con nombres unicos, asi que se pueden correr en cualquier orden.

Las empresas de prueba quedan en la base de datos despues de cada ejecucion. Se reconocen
porque se llaman `Empresa E2E <codigo>` y sus correos terminan en `@example.com`.

## Requisitos

Python 3, Chrome y acceso de red a la aplicacion.

```powershell
pip install -r e2e/requirements.txt
```

## Ejecucion

```powershell
$env:E2E_BASE_URL = "http://<host>:<puerto>"
python -m pytest e2e -v
```

- Con `$env:E2E_HEADLESS = "1"` el navegador corre sin ventana.
- `$env:E2E_TIMEOUT` define cuantos segundos se espera a cada elemento (por defecto 10). En CI se usa 20.
- Para correr un solo archivo: `python -m pytest e2e/tests/test_procesos.py -v`.
- Si un test falla, la captura de pantalla queda en `e2e/reportes/<nombre del test>.png`.

## En el CI

El job `e2e` de `.github/workflows/ci.yml` corre estas pruebas:

- En cada pull request a `main`: si alguna falla, el PR queda en rojo.
- En cada merge a `main`: el despliegue en beta-front solo ocurre si pasan.
- A mano, desde Actions > CI/CD Front > Run workflow, sobre la rama que elijas (no despliega).

En cada ejecucion:

1. Levanta en la VM beta-back un backend temporal (`ci/levantar-backend-e2e.sh`) con la imagen `beta-back:latest`, contra la BD vacia `proyecto_ci_front`.
2. Arranca en el runner la imagen del front que acaba de publicar el job `docker` (`beta-front:pr-<N>` en un PR, `beta-front:sha-<commit>` en el merge o a mano) en `http://localhost:8080`, apuntando a ese backend.
3. Ejecuta pytest con `E2E_HEADLESS=1` y `E2E_TIMEOUT=20`.
4. Publica la tabla "Reporte E2E Selenium", un resumen en la pagina de la ejecucion y el artefacto `reporte-e2e` (HTML, junit y capturas).
5. Siempre quita el backend temporal y vacia la BD (`ci/bajar-backend-e2e.sh`).

## Seguridad

- Nunca escribas credenciales ni URLs internas en estos archivos.
- No uses `-l`, `--showlocals` ni `--tb=long` en CI: muestran los valores de las variables al fallar.
