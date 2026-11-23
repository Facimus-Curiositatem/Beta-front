from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC

from pages.base_page import BasePage


class ArcosPage(BasePage):
    """Arcos (flechas entre nodos) de un pool, en /pools/{id}/arcos."""

    TITULO = (By.CSS_SELECTOR, "app-arco-list h2")
    CREAR = (By.XPATH, "//app-arco-list//a[normalize-space()='Crear arco']")

    @staticmethod
    def fila_arco(origen, destino):
        return (
            By.XPATH,
            f"//app-arco-list//tr[td[1][normalize-space()='{origen}'] and td[2][normalize-space()='{destino}']]",
        )

    def abrir(self, pool_id):
        self.ir_a(f"/pools/{pool_id}/arcos")
        return self.esperar_lista()

    def esperar_lista(self):
        self.esperar_texto(self.TITULO, "Arcos del pool")
        return self

    def crear_arco(self, origen, destino, etiqueta=""):
        """origen y destino son el texto de la opcion, por ejemplo 'Revisar (ACTIVIDAD)'."""
        self.clic(self.CREAR)
        formulario = ArcoFormPage(self.driver, self.base_url).esperar_formulario()
        return formulario.completar(origen, destino, etiqueta).guardar()

    def muestra_arco(self, origen, destino):
        # Los nombres llegan en una segunda consulta: hasta entonces la tabla muestra ids.
        return self.esta_visible(self.fila_arco(origen, destino))


class ArcoFormPage(BasePage):
    ORIGEN = (By.CSS_SELECTOR, "app-arco-form select[formcontrolname='origenId']")
    DESTINO = (By.CSS_SELECTOR, "app-arco-form select[formcontrolname='destinoId']")
    ETIQUETA = (By.CSS_SELECTOR, "app-arco-form input[formcontrolname='etiqueta']")
    GUARDAR = (By.CSS_SELECTOR, "app-arco-form button[type='submit']")
    MENSAJE_ERROR = (By.CSS_SELECTOR, "app-arco-form p")

    def esperar_formulario(self):
        self.wait.until(EC.visibility_of_element_located(self.ORIGEN))
        return self

    def completar(self, origen, destino, etiqueta=""):
        self.seleccionar(self.ORIGEN, origen)
        self.seleccionar(self.DESTINO, destino)
        self.escribir(self.ETIQUETA, etiqueta)
        return self

    def guardar(self):
        self.enviar_formulario(self.GUARDAR, r"/pools/\d+/arcos", self.MENSAJE_ERROR)
        return ArcosPage(self.driver, self.base_url).esperar_lista()
