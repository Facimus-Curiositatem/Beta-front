from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC

from pages.base_page import BasePage
from pages.procesos_page import ProcesosPage


class LoginPage(BasePage):
    """Unico lugar que conoce como esta construida la pantalla de login."""

    CORREO = (By.CSS_SELECTOR, "input[formcontrolname='email']")
    CONTRASENA = (By.CSS_SELECTOR, "input[formcontrolname='password']")
    INGRESAR = (By.CSS_SELECTOR, "button[type='submit']")
    MENSAJE_ERROR = (By.CSS_SELECTOR, "app-login > p")
    ERRORES_VALIDACION = (By.CSS_SELECTOR, "app-login small")

    def abrir(self):
        self.ir_a("/login")
        self.wait.until(EC.visibility_of_element_located(self.CORREO))
        return self

    def esta_abierta(self):
        self.esperar_ruta("/login")
        return self.esta_visible(self.CORREO)

    def iniciar_sesion(self, correo, contrasena):
        self.escribir(self.CORREO, correo)
        self.escribir(self.CONTRASENA, contrasena)
        self.clic(self.INGRESAR)
        return ProcesosPage(self.driver, self.base_url)

    def mensaje_error(self):
        return self.texto(self.MENSAJE_ERROR)

    def errores_validacion(self):
        errores = self.wait.until(EC.visibility_of_all_elements_located(self.ERRORES_VALIDACION))
        return [error.text for error in errores]
