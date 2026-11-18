from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import Select

from pages.base_page import BasePage


class UsuariosPage(BasePage):
    """Gestion de usuarios de la empresa. Solo la ven los administradores."""

    TITULO = (By.CSS_SELECTOR, "app-usuario-list h2")
    NUEVO = (By.XPATH, "//app-usuario-list//a[normalize-space()='Nuevo usuario']")
    # El select usa [formControl], que no deja atributo en el HTML: se ubica por su etiqueta.
    VIGENCIA = (By.XPATH, "//app-usuario-list//label[contains(., 'Mostrar')]//select")
    AVISO = (By.CSS_SELECTOR, "app-usuario-list p[aria-live]")
    TABLA = (By.CSS_SELECTOR, "app-usuario-list table")

    def abrir(self):
        self.ir_a("/usuarios")
        self.esperar_texto(self.TITULO, "Usuarios")
        return self

    def nuevo_usuario(self):
        self.clic(self.NUEVO)
        return UsuarioFormPage(self.driver, self.base_url).esperar_formulario()

    def mostrar(self, vigencia):
        """Cambia el filtro a 'activos' o 'desactivados'. Debe ser distinto al actual."""
        tabla = self.wait.until(EC.visibility_of_element_located(self.TABLA))
        Select(self.driver.find_element(*self.VIGENCIA)).select_by_value(vigencia)
        self.wait.until(EC.staleness_of(tabla))
        return self

    def muestra(self, correo):
        return self.esta_visible(self.fila(correo))

    def rol_de(self, correo):
        return self.texto(self.celda(correo, 3))

    def estado_de(self, correo):
        return self.texto(self.celda(correo, 4))

    def desactivar(self, correo):
        tabla = self.wait.until(EC.visibility_of_element_located(self.TABLA))
        self.clic((By.XPATH, f"{self.fila(correo)[1]}//button[normalize-space()='Desactivar']"))
        self.aceptar_confirmacion()
        self.wait.until(EC.staleness_of(tabla))
        return self

    def reactivar(self, correo):
        self.clic((By.XPATH, f"{self.fila(correo)[1]}//button[normalize-space()='Reactivar']"))
        self.esperar_texto(self.AVISO, "fue reactivado")
        return self

    def aviso(self):
        return self.texto(self.AVISO)


class UsuarioFormPage(BasePage):
    NOMBRE = (By.CSS_SELECTOR, "app-usuario-form input[formcontrolname='nombre']")
    CORREO = (By.CSS_SELECTOR, "app-usuario-form input[formcontrolname='email']")
    CONTRASENA = (By.CSS_SELECTOR, "app-usuario-form input[formcontrolname='password']")
    ROL = (By.CSS_SELECTOR, "app-usuario-form select[formcontrolname='rolAcceso']")
    GUARDAR = (By.CSS_SELECTOR, "app-usuario-form button[type='submit']")
    MENSAJE_ERROR = (By.CSS_SELECTOR, "app-usuario-form p.error")

    def esperar_formulario(self):
        self.wait.until(EC.visibility_of_element_located(self.NOMBRE))
        return self

    def completar(self, nombre, correo, contrasena, rol):
        self.escribir(self.NOMBRE, nombre)
        self.escribir(self.CORREO, correo)
        self.escribir(self.CONTRASENA, contrasena)
        self.seleccionar(self.ROL, rol)
        return self

    def guardar(self):
        self.enviar_formulario(self.GUARDAR, "/usuarios", self.MENSAJE_ERROR)
        return UsuariosPage(self.driver, self.base_url)
