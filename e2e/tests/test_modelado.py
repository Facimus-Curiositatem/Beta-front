from datos import unico
from pages.actividades_page import ActividadesPage
from pages.arcos_page import ArcosPage
from pages.gateways_page import GatewaysPage
from pages.lanes_page import LanesPage
from pages.pools_page import PoolsPage


def test_crear_pool(driver, base_url, proceso):
    nombre = unico("Pool E2E")

    pools = PoolsPage(driver, base_url).abrir(proceso.id).crear_pool(nombre, tipo="CLIENTE")

    assert pools.muestra(nombre)
    assert pools.tipo_de(nombre) == "CLIENTE"


def test_crear_lane_con_rol(driver, base_url, pool, rol):
    nombre = unico("Lane E2E")

    lanes = LanesPage(driver, base_url).abrir(pool.id).crear_lane(nombre, rol)

    assert lanes.muestra(nombre)
    assert lanes.rol_de(nombre) == rol


def test_crear_actividad(driver, base_url, lane):
    nombre = unico("Actividad E2E")

    actividades = ActividadesPage(driver, base_url).abrir(lane.id)
    actividades.crear_actividad(nombre, tipo="USUARIO", descripcion="Revisar la solicitud")

    assert actividades.muestra(nombre)
    assert actividades.tipo_de(nombre) == "USUARIO"


def test_crear_gateway(driver, base_url, lane):
    nombre = unico("Gateway E2E")

    gateways = GatewaysPage(driver, base_url).abrir(lane.id).crear_gateway(nombre, tipo="PARALELO")

    assert gateways.muestra(nombre)
    assert gateways.tipo_de(nombre) == "PARALELO"


def test_crear_arco_entre_actividad_y_gateway(driver, base_url, pool, lane):
    actividad = unico("Actividad E2E")
    gateway = unico("Gateway E2E")
    ActividadesPage(driver, base_url).abrir(lane.id).crear_actividad(actividad)
    GatewaysPage(driver, base_url).abrir(lane.id).crear_gateway(gateway)

    arcos = ArcosPage(driver, base_url).abrir(pool.id)
    arcos.crear_arco(f"{actividad} (ACTIVIDAD)", f"{gateway} (GATEWAY)", etiqueta="Aprobado")

    assert arcos.muestra_arco(actividad, gateway)
