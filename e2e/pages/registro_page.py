from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC

from pages.base_page import BasePage


class RegistroPage(BasePage):
    NOMBRE_EMPRESA = (By.CSS_SELECTOR, "input[formcontrolname='nombreEmpresa']")
    NIT = (By.CSS_SELECTOR, "input[formcontrolname='nit']")
    CORREO_CONTACTO = (By.CSS_SELECTOR, "input[formcontrolname='correoContacto']")
    NOMBRE_ADMIN = (By.CSS_SELECTOR, "input[formcontrolname='nombreAdmin']")
    CORREO_ADMIN = (By.CSS_SELECTOR, "input[formcontrolname='emailAdmin']")
    CONTRASENA_ADMIN = (By.CSS_SELECTOR, "input[formcontrolname='passwordAdmin']")
    REGISTRAR = (By.CSS_SELECTOR, "app-registro-empresa button[type='submit']")
    MENSAJE_ERROR = (By.CSS_SELECTOR, "app-registro-empresa p[role='alert']")
    ERRORES_VALIDACION = (By.CSS_SELECTOR, "app-registro-empresa small")

    def abrir(self):
        self.ir_a("/registro")
        self.wait.until(EC.visibility_of_element_located(self.NOMBRE_EMPRESA))
        return self

    def registrar(self, empresa):
        self.escribir(self.NOMBRE_EMPRESA, empresa.nombre)
        self.escribir(self.NIT, empresa.nit)
        self.escribir(self.CORREO_CONTACTO, empresa.correo_contacto)
        self.escribir(self.NOMBRE_ADMIN, empresa.nombre_admin)
        self.escribir(self.CORREO_ADMIN, empresa.correo_admin)
        self.escribir(self.CONTRASENA_ADMIN, empresa.contrasena_admin)
        # Al registrarse, la aplicacion lleva al login.
        self.enviar_formulario(self.REGISTRAR, "/login", self.MENSAJE_ERROR)

    def enviar_vacio(self):
        self.clic(self.REGISTRAR)
        return self

    def errores_validacion(self):
        return self.textos_estables(self.ERRORES_VALIDACION)
