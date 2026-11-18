from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC

from pages.base_page import BasePage


class LanesPage(BasePage):
    """Lanes de un pool, en /pools/{id}/lanes."""

    TITULO = (By.CSS_SELECTOR, "app-lane-list h2")
    CREAR = (By.XPATH, "//app-lane-list//a[normalize-space()='Crear lane']")

    def abrir(self, pool_id):
        self.ir_a(f"/pools/{pool_id}/lanes")
        return self.esperar_lista()

    def esperar_lista(self):
        self.esperar_texto(self.TITULO, "Lanes del pool")
        return self

    def crear_lane(self, nombre, rol):
        self.clic(self.CREAR)
        return LaneFormPage(self.driver, self.base_url).esperar_formulario().completar(nombre, rol).guardar()

    def muestra(self, nombre):
        return self.esta_visible(self.fila(nombre))

    def rol_de(self, nombre):
        # Columnas: asa para arrastrar, nombre, rol, orden y acciones.
        return self.texto(self.celda(nombre, 3))

    def id_de(self, nombre):
        # El enlace "Actividades" apunta a /lanes/{id}/actividades.
        enlace = (By.XPATH, f"{self.fila(nombre)[1]}//a[normalize-space()='Actividades']")
        return self.id_en_enlace(enlace, r"/lanes/(\d+)/actividades")


class LaneFormPage(BasePage):
    NOMBRE = (By.CSS_SELECTOR, "app-lane-form input[formcontrolname='nombre']")
    ROL = (By.CSS_SELECTOR, "app-lane-form select[formcontrolname='rolProcesoId']")
    GUARDAR = (By.CSS_SELECTOR, "app-lane-form button[type='submit']")
    MENSAJE_ERROR = (By.CSS_SELECTOR, "app-lane-form p")

    def esperar_formulario(self):
        self.wait.until(EC.visibility_of_element_located(self.NOMBRE))
        return self

    def completar(self, nombre, rol):
        self.escribir(self.NOMBRE, nombre)
        self.seleccionar(self.ROL, rol)
        return self

    def guardar(self):
        self.enviar_formulario(self.GUARDAR, r"/pools/\d+/lanes", self.MENSAJE_ERROR)
        return LanesPage(self.driver, self.base_url).esperar_lista()
