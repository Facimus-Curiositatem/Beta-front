from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC

from pages.base_page import BasePage


class PoolsPage(BasePage):
    """Pools de un proceso, en /procesos/{id}/pools."""

    TITULO = (By.CSS_SELECTOR, "app-pool-list h2")
    CREAR = (By.XPATH, "//app-pool-list//a[normalize-space()='Crear pool']")

    @staticmethod
    def fila_pool(nombre):
        # La celda tiene el nombre en <strong> y debajo el tipo, por eso no sirve fila().
        return (By.XPATH, f"//app-pool-list//tr[td/strong[normalize-space()='{nombre}']]")

    def abrir(self, proceso_id):
        self.ir_a(f"/procesos/{proceso_id}/pools")
        return self.esperar_lista()

    def esperar_lista(self):
        self.esperar_texto(self.TITULO, "Pools del proceso")
        return self

    def crear_pool(self, nombre, tipo="EMPRESA"):
        self.clic(self.CREAR)
        return PoolFormPage(self.driver, self.base_url).esperar_formulario().completar(nombre, tipo).guardar()

    def muestra(self, nombre):
        return self.esta_visible(self.fila_pool(nombre))

    def tipo_de(self, nombre):
        return self.texto((By.XPATH, f"{self.fila_pool(nombre)[1]}//div[@class='detalle']"))

    def id_de(self, nombre):
        # El enlace "Arcos" apunta a /pools/{id}/arcos.
        enlace = (By.XPATH, f"{self.fila_pool(nombre)[1]}//a[normalize-space()='Arcos']")
        return self.id_en_enlace(enlace, r"/pools/(\d+)/arcos")


class PoolFormPage(BasePage):
    NOMBRE = (By.CSS_SELECTOR, "app-pool-form input[formcontrolname='nombre']")
    TIPO = (By.CSS_SELECTOR, "app-pool-form select[formcontrolname='tipoParticipante']")
    GUARDAR = (By.CSS_SELECTOR, "app-pool-form button[type='submit']")
    MENSAJE_ERROR = (By.CSS_SELECTOR, "app-pool-form p")

    def esperar_formulario(self):
        self.wait.until(EC.visibility_of_element_located(self.NOMBRE))
        return self

    def completar(self, nombre, tipo):
        self.escribir(self.NOMBRE, nombre)
        self.seleccionar(self.TIPO, tipo)
        return self

    def guardar(self):
        self.enviar_formulario(self.GUARDAR, r"/procesos/\d+/pools", self.MENSAJE_ERROR)
        return PoolsPage(self.driver, self.base_url).esperar_lista()
