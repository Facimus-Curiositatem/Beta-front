from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC

from pages.base_page import BasePage


class GatewaysPage(BasePage):
    """Gateways de un lane, en /lanes/{id}/gateways."""

    TITULO = (By.CSS_SELECTOR, "app-gateway-list h2")
    CREAR = (By.XPATH, "//app-gateway-list//a[normalize-space()='Crear gateway']")

    def abrir(self, lane_id):
        self.ir_a(f"/lanes/{lane_id}/gateways")
        return self.esperar_lista()

    def esperar_lista(self):
        self.esperar_texto(self.TITULO, "Gateways del lane")
        return self

    def crear_gateway(self, nombre, tipo="EXCLUSIVO"):
        self.clic(self.CREAR)
        return GatewayFormPage(self.driver, self.base_url).esperar_formulario().completar(nombre, tipo).guardar()

    def muestra(self, nombre):
        return self.esta_visible(self.fila(nombre))

    def tipo_de(self, nombre):
        return self.texto(self.celda(nombre, 2))


class GatewayFormPage(BasePage):
    NOMBRE = (By.CSS_SELECTOR, "app-gateway-form input[formcontrolname='nombre']")
    TIPO = (By.CSS_SELECTOR, "app-gateway-form select[formcontrolname='tipoGateway']")
    GUARDAR = (By.CSS_SELECTOR, "app-gateway-form button[type='submit']")
    MENSAJE_ERROR = (By.CSS_SELECTOR, "app-gateway-form p.error")

    def esperar_formulario(self):
        self.wait.until(EC.visibility_of_element_located(self.NOMBRE))
        return self

    def completar(self, nombre, tipo):
        self.escribir(self.NOMBRE, nombre)
        self.seleccionar(self.TIPO, tipo)
        return self

    def guardar(self):
        self.enviar_formulario(self.GUARDAR, r"/lanes/\d+/gateways", self.MENSAJE_ERROR)
        return GatewaysPage(self.driver, self.base_url).esperar_lista()
