from pages.menu_principal import MenuPrincipal
from pages.registro_page import RegistroPage


def test_registro_valida_campos_obligatorios(driver, base_url):
    registro = RegistroPage(driver, base_url).abrir().enviar_vacio()

    assert registro.errores_validacion() == [
        "Revisa este campo: es obligatorio y debe tener un formato válido."
    ] * 6


def test_empresa_registrada_entra_como_administrador(driver, base_url, login_page, empresa):
    # La fixture empresa ya registro la empresa por la pantalla de registro.
    procesos = login_page.iniciar_sesion(empresa.correo_admin, empresa.contrasena_admin)

    assert procesos.esta_abierta()
    assert MenuPrincipal(driver, base_url).muestra_opciones_de_administrador()
