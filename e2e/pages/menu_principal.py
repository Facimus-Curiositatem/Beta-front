from selenium.webdriver.common.by import By

from pages.base_page import BasePage
from pages.login_page import LoginPage


class MenuPrincipal(BasePage):
    """Menu superior. Solo aparece con la sesion iniciada, y algunas opciones solo para administradores."""

    CERRAR_SESION = (By.XPATH, "//nav//button[normalize-space()='Cerrar sesión']")
    USUARIOS = (By.XPATH, "//nav//a[normalize-space()='Usuarios']")

    def muestra_cerrar_sesion(self):
        return self.esta_visible(self.CERRAR_SESION)

    def muestra_opciones_de_administrador(self):
        return self.esta_visible(self.USUARIOS)

    def cerrar_sesion(self):
        self.clic(self.CERRAR_SESION)
        self.esperar_ruta("/login")
        return LoginPage(self.driver, self.base_url)
