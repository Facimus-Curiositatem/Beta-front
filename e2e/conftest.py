import os
from pathlib import Path

import pytest
from selenium import webdriver

from datos import Empresa, Registro, unico
from pages.lanes_page import LanesPage
from pages.login_page import LoginPage
from pages.pools_page import PoolsPage
from pages.procesos_page import ProcesosPage
from pages.registro_page import RegistroPage
from pages.roles_page import RolesPage

CARPETA_REPORTES = Path(__file__).parent / "reportes"


def _variable_obligatoria(nombre):
    valor = os.environ.get(nombre)
    if not valor:
        pytest.fail(f"Falta la variable de entorno {nombre}. Ver e2e/README.md")
    return valor


def _nuevo_navegador():
    options = webdriver.ChromeOptions()
    if os.environ.get("E2E_HEADLESS") == "1":
        options.add_argument("--headless=new")
    # Tamano fijo: con o sin ventana, la pagina se ve igual y los elementos caben en pantalla.
    options.add_argument("--window-size=1366,900")
    return webdriver.Chrome(options=options)


@pytest.fixture(scope="session")
def base_url():
    return _variable_obligatoria("E2E_BASE_URL").rstrip("/")


@pytest.fixture
def driver(base_url):
    # Un navegador nuevo por test: cada uno empieza sin sesion y no depende de los demas.
    navegador = _nuevo_navegador()
    yield navegador
    navegador.quit()


@pytest.fixture(scope="session")
def empresa(base_url):
    """Registra una empresa nueva por ejecucion, usando la pantalla de registro.

    Todo lo que crean las pruebas queda dentro de esta empresa, asi que no se tocan
    los datos de otras empresas y no hace falta guardar credenciales en ningun lado.
    """
    datos = Empresa.nueva()
    navegador = _nuevo_navegador()
    try:
        RegistroPage(navegador, base_url).abrir().registrar(datos)
    finally:
        navegador.quit()
    return datos


@pytest.fixture
def login_page(driver, base_url):
    return LoginPage(driver, base_url).abrir()


@pytest.fixture
def sesion(login_page, empresa):
    """Navegador con la sesion del administrador de la empresa de prueba."""
    procesos = login_page.iniciar_sesion(empresa.correo_admin, empresa.contrasena_admin)
    procesos.esta_abierta()
    return procesos


# Las fixtures de datos devuelven ids y nombres, no Page Objects: cada una navega
# por URL a la pantalla que necesita, asi el orden en que pytest las crea no importa.

@pytest.fixture
def rol(driver, base_url, sesion):
    nombre = unico("Rol E2E")
    RolesPage(driver, base_url).abrir().crear_rol(nombre, "Creado por las pruebas E2E")
    return nombre


@pytest.fixture
def proceso(driver, base_url, sesion):
    nombre = unico("Proceso E2E")
    formulario = ProcesosPage(driver, base_url).abrir().crear_proceso()
    detalle = formulario.completar(nombre, "Creado por las pruebas E2E", "Pruebas").guardar()
    return Registro(detalle.proceso_id, nombre)


@pytest.fixture
def pool(driver, base_url, proceso):
    nombre = unico("Pool E2E")
    pools = PoolsPage(driver, base_url).abrir(proceso.id).crear_pool(nombre)
    return Registro(pools.id_de(nombre), nombre)


@pytest.fixture
def lane(driver, base_url, pool, rol):
    nombre = unico("Lane E2E")
    lanes = LanesPage(driver, base_url).abrir(pool.id).crear_lane(nombre, rol)
    return Registro(lanes.id_de(nombre), nombre)


@pytest.hookimpl(wrapper=True)
def pytest_runtest_makereport(item, call):
    """Si un test falla, guarda una captura de lo que mostraba el navegador en e2e/reportes/."""
    reporte = yield
    navegador = item.funcargs.get("driver")
    if reporte.failed and reporte.when in ("setup", "call") and navegador:
        CARPETA_REPORTES.mkdir(exist_ok=True)
        navegador.save_screenshot(str(CARPETA_REPORTES / f"{item.name}.png"))
    return reporte
