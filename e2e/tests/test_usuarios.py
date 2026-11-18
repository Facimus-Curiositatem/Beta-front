import secrets

import pytest

from datos import unico
from pages.usuarios_page import UsuariosPage


@pytest.fixture
def usuario(driver, base_url, sesion):
    """Usuario EDITOR nuevo dentro de la empresa de prueba. Devuelve su correo."""
    correo = f"editor-{secrets.token_hex(4)}@example.com"
    formulario = UsuariosPage(driver, base_url).abrir().nuevo_usuario()
    formulario.completar(unico("Editor E2E"), correo, secrets.token_urlsafe(12), "EDITOR").guardar()
    return correo


@pytest.mark.usefixtures("sesion")
def test_crear_usuario(driver, base_url):
    correo = f"editor-{secrets.token_hex(4)}@example.com"

    formulario = UsuariosPage(driver, base_url).abrir().nuevo_usuario()
    usuarios = formulario.completar(unico("Editor E2E"), correo, secrets.token_urlsafe(12), "EDITOR").guardar()

    assert usuarios.muestra(correo)
    assert usuarios.rol_de(correo) == "EDITOR"
    assert usuarios.estado_de(correo) == "Activo"


def test_desactivar_y_reactivar_usuario(driver, base_url, usuario):
    usuarios = UsuariosPage(driver, base_url).abrir().desactivar(usuario)

    usuarios.mostrar("desactivados")
    assert usuarios.estado_de(usuario) == "Inactivo"

    usuarios.reactivar(usuario)
    assert "fue reactivado" in usuarios.aviso()

    usuarios.mostrar("activos")
    assert usuarios.estado_de(usuario) == "Activo"
