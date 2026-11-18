from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC

from pages.base_page import BasePage


class ActividadesPage(BasePage):
    """Actividades de un lane, en /lanes/{id}/actividades."""

    TITULO = (By.CSS_SELECTOR, "app-actividad-list h2")
    CREAR = (By.XPATH, "//app-actividad-list//a[normalize-space()='Crear actividad']")

    def abrir(self, lane_id):
        self.ir_a(f"/lanes/{lane_id}/actividades")
        return self.esperar_lista()

    def esperar_lista(self):
        self.esperar_texto(self.TITULO, "Actividades del lane")
        return self

    def crear_actividad(self, nombre, tipo="TAREA", descripcion=""):
        self.clic(self.CREAR)
        formulario = ActividadFormPage(self.driver, self.base_url).esperar_formulario()
        return formulario.completar(nombre, tipo, descripcion).guardar()

    def muestra(self, nombre):
        return self.esta_visible(self.fila(nombre))

    def tipo_de(self, nombre):
        return self.texto(self.celda(nombre, 2))


class ActividadFormPage(BasePage):
    NOMBRE = (By.CSS_SELECTOR, "app-actividad-form input[formcontrolname='nombre']")
    DESCRIPCION = (By.CSS_SELECTOR, "app-actividad-form input[formcontrolname='descripcion']")
    TIPO = (By.CSS_SELECTOR, "app-actividad-form select[formcontrolname='tipoActividad']")
    GUARDAR = (By.CSS_SELECTOR, "app-actividad-form button[type='submit']")
    MENSAJE_ERROR = (By.CSS_SELECTOR, "app-actividad-form p.error")

    def esperar_formulario(self):
        self.wait.until(EC.visibility_of_element_located(self.NOMBRE))
        return self

    def completar(self, nombre, tipo, descripcion=""):
        self.escribir(self.NOMBRE, nombre)
        self.escribir(self.DESCRIPCION, descripcion)
        self.seleccionar(self.TIPO, tipo)
        return self

    def guardar(self):
        self.enviar_formulario(self.GUARDAR, r"/lanes/\d+/actividades", self.MENSAJE_ERROR)
        return ActividadesPage(self.driver, self.base_url).esperar_lista()
