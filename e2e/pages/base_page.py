import os
import re
import time
from urllib.parse import urlparse

from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import Select, WebDriverWait

# Segundos que se espera a cada elemento. En CI se sube porque el backend temporal responde mas lento.
TIEMPO_ESPERA = float(os.environ.get("E2E_TIMEOUT") or 10)


class BasePage:
    """Acciones comunes a todas las pantallas. Cada Page Object hereda de aqui."""

    def __init__(self, driver, base_url):
        self.driver = driver
        self.base_url = base_url
        self.wait = WebDriverWait(driver, TIEMPO_ESPERA)

    def ir_a(self, ruta):
        self.driver.get(f"{self.base_url}{ruta}")

    def ruta_actual(self):
        return urlparse(self.driver.current_url).path

    def esperar_ruta(self, patron):
        """Espera a que la ruta coincida completa con la expresion regular, por ejemplo r"/procesos/\\d+"."""
        self.wait.until(lambda d: re.fullmatch(patron, self.ruta_actual()))
        return self.ruta_actual()

    def escribir(self, locator, texto):
        campo = self.wait.until(EC.visibility_of_element_located(locator))
        # clear() no siempre avisa a los formularios de Angular; seleccionar y borrar si lo hace.
        campo.send_keys(Keys.CONTROL, "a")
        campo.send_keys(Keys.DELETE)
        campo.send_keys(texto)

    def clic(self, locator):
        self.wait.until(EC.element_to_be_clickable(locator)).click()

    def seleccionar(self, locator, texto_visible):
        # Las opciones pueden llegar despues desde el backend: se espera a que exista la buscada.
        self.wait.until(
            lambda d: any(o.text.strip() == texto_visible for o in Select(d.find_element(*locator)).options)
        )
        Select(self.driver.find_element(*locator)).select_by_visible_text(texto_visible)

    def texto(self, locator):
        return self.wait.until(EC.visibility_of_element_located(locator)).text

    def esperar_texto(self, locator, texto):
        return self.wait.until(EC.text_to_be_present_in_element(locator, texto))

    def textos_estables(self, locator, quieto=0.5):
        """Textos visibles de los elementos que coinciden, cuando la lista deja de cambiar.

        Sirve para mensajes de validacion que Angular muestra en momentos distintos (unos al salir
        de un campo y otros al enviar): esperar solo "a que haya alguno" puede leer la lista a medias.
        """
        self.wait.until(EC.visibility_of_any_elements_located(locator))
        limite = time.monotonic() + TIEMPO_ESPERA
        anterior, desde = None, time.monotonic()
        while time.monotonic() < limite:
            actual = [e.text for e in self.driver.find_elements(*locator) if e.is_displayed()]
            if actual != anterior:
                anterior, desde = actual, time.monotonic()
            elif time.monotonic() - desde >= quieto:
                return actual
            time.sleep(0.1)
        return anterior

    def esta_visible(self, locator):
        return self.wait.until(EC.visibility_of_element_located(locator)).is_displayed()

    def aceptar_confirmacion(self):
        """Acepta un confirm() nativo del navegador, como el de 'Eliminar'."""
        self.wait.until(EC.alert_is_present()).accept()

    def enviar_formulario(self, boton, ruta_esperada, mensaje_error):
        """Guarda y espera la navegacion. Si el backend rechaza los datos, falla mostrando su mensaje."""
        self.clic(boton)
        self.wait.until(
            lambda d: re.fullmatch(ruta_esperada, self.ruta_actual()) or d.find_elements(*mensaje_error)
        )
        if not re.fullmatch(ruta_esperada, self.ruta_actual()):
            raise AssertionError(f"El formulario no se guardo: {self.driver.find_element(*mensaje_error).text}")

    def id_en_enlace(self, locator, patron):
        """Lee un id del href de un enlace sin hacer clic, por ejemplo /pools/12/arcos -> 12."""
        href = self.wait.until(EC.presence_of_element_located(locator)).get_attribute("href")
        return int(re.search(patron, urlparse(href).path).group(1))

    @staticmethod
    def fila(texto):
        """Fila de una tabla que tiene una celda con ese texto exacto."""
        return (By.XPATH, f"//tr[td[normalize-space()='{texto}']]")

    @staticmethod
    def celda(texto, columna):
        """Celda en la posicion indicada (empieza en 1) de la fila que contiene ese texto."""
        return (By.XPATH, f"//tr[td[normalize-space()='{texto}']]/td[{columna}]")
