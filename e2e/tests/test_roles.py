import pytest

from datos import unico
from pages.roles_page import RolesPage


@pytest.mark.usefixtures("sesion")
def test_crear_rol(driver, base_url):
    nombre = unico("Rol E2E")

    roles = RolesPage(driver, base_url).abrir().crear_rol(nombre, "Aprueba solicitudes")

    assert roles.buscar(nombre).muestra(nombre)


def test_editar_rol(driver, base_url, rol):
    nuevo_nombre = unico("Rol editado")

    formulario = RolesPage(driver, base_url).abrir().buscar(rol).editar(rol)
    roles = formulario.completar(nuevo_nombre, "Descripcion nueva").guardar()

    assert roles.buscar(nuevo_nombre).muestra(nuevo_nombre)


def test_eliminar_rol_sin_uso(driver, base_url, rol):
    roles = RolesPage(driver, base_url).abrir().buscar(rol).eliminar(rol)

    # Despues de eliminar, la lista se recarga con el mismo filtro y queda vacia.
    assert roles.sin_resultados()
