from pages.login_page import LoginPage
from pages.menu_principal import MenuPrincipal


def test_credenciales_validas_llevan_a_procesos(driver, base_url, login_page, empresa):
    procesos = login_page.iniciar_sesion(empresa.correo_admin, empresa.contrasena_admin)

    assert procesos.esta_abierta()
    assert MenuPrincipal(driver, base_url).muestra_cerrar_sesion()


def test_credenciales_invalidas_muestran_error(driver, login_page):
    # Correo inventado: el backend responde igual exista o no, y no se toca ninguna cuenta real.
    login_page.iniciar_sesion("no-existe@example.com", "contrasena-incorrecta")

    assert login_page.mensaje_error() != ""
    assert "/login" in driver.current_url


def test_formulario_vacio_muestra_campos_obligatorios(login_page):
    login_page.iniciar_sesion("", "")

    assert login_page.errores_validacion() == [
        "El correo es obligatorio",
        "La contrasena es obligatoria",
    ]


def test_correo_con_formato_invalido(login_page):
    login_page.iniciar_sesion("esto-no-es-un-correo", "cualquier-contrasena")

    assert login_page.errores_validacion() == ["El correo no tiene un formato valido"]


def test_ruta_protegida_sin_sesion_redirige_a_login(driver, base_url):
    driver.get(f"{base_url}/procesos")

    assert LoginPage(driver, base_url).esta_abierta()


def test_cerrar_sesion_vuelve_al_login_y_protege_las_rutas(driver, base_url, sesion):
    login = MenuPrincipal(driver, base_url).cerrar_sesion()

    assert login.esta_abierta()

    # Sin sesion, volver a una pantalla protegida debe llevar de nuevo al login.
    driver.get(f"{base_url}/procesos")
    assert login.esta_abierta()
