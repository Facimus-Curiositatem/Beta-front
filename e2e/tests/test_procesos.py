import pytest

from datos import unico
from pages.procesos_page import ProcesoDetallePage, ProcesosPage


@pytest.mark.usefixtures("sesion")
def test_crear_proceso_lo_deja_en_borrador(driver, base_url):
    nombre = unico("Proceso E2E")

    formulario = ProcesosPage(driver, base_url).abrir().crear_proceso()
    detalle = formulario.completar(nombre, "Alta de clientes", "Ventas").guardar()

    assert detalle.nombre() == nombre
    assert detalle.valor("Descripcion") == "Alta de clientes"
    assert detalle.valor("Categoria") == "Ventas"
    assert detalle.valor("Estado") == "BORRADOR"


@pytest.mark.usefixtures("sesion")
def test_formulario_de_proceso_exige_los_campos(driver, base_url):
    formulario = ProcesosPage(driver, base_url).abrir().crear_proceso().enviar_vacio()

    assert formulario.errores_validacion() == [
        "El nombre es obligatorio",
        "La descripcion es obligatoria",
        "La categoria es obligatoria",
    ]


def test_editar_proceso(driver, base_url, proceso):
    nuevo_nombre = unico("Proceso editado")

    formulario = ProcesoDetallePage(driver, base_url).abrir(proceso.id).editar()
    detalle = formulario.completar(nuevo_nombre, "Descripcion nueva", "Compras").guardar()

    assert detalle.nombre() == nuevo_nombre
    assert detalle.valor("Categoria") == "Compras"


def test_publicar_proceso(driver, base_url, proceso):
    detalle = ProcesoDetallePage(driver, base_url).abrir(proceso.id).publicar()

    assert detalle.valor("Estado") == "PUBLICADO"


def test_eliminar_proceso_lo_pasa_a_inactivos(driver, base_url, proceso):
    procesos = ProcesoDetallePage(driver, base_url).abrir(proceso.id).eliminar()

    # La eliminacion es logica: sale de los activos y se consulta con el filtro de inactivos.
    assert procesos.buscar(proceso.nombre).sin_resultados()
    assert procesos.buscar(proceso.nombre, vigencia="inactivos").muestra(proceso.nombre)
