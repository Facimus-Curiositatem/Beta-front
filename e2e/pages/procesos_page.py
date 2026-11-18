from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import Select

from pages.base_page import BasePage


class ProcesosPage(BasePage):
    """Lista de procesos: la pantalla a la que llega el usuario despues de iniciar sesion."""

    TITULO = (By.CSS_SELECTOR, "app-proceso-list h2")
    CREAR = (By.XPATH, "//app-proceso-list//a[normalize-space()='Crear proceso']")
    FILTRO_NOMBRE = (By.CSS_SELECTOR, "app-proceso-list input[formcontrolname='nombre']")
    FILTRO_VIGENCIA = (By.CSS_SELECTOR, "app-proceso-list select[formcontrolname='vigencia']")
    BUSCAR = (By.XPATH, "//app-proceso-list//button[normalize-space()='Buscar']")
    TABLA = (By.CSS_SELECTOR, "app-proceso-list table")
    SIN_RESULTADOS = (By.XPATH, "//app-proceso-list//td[normalize-space()='No hay procesos registrados.']")

    def abrir(self):
        self.ir_a("/procesos")
        self.esta_abierta()
        return self

    def esta_abierta(self):
        # Espera a que Angular termine de navegar; si no ocurre en 10 s, lanza TimeoutException.
        self.esperar_ruta("/procesos")
        return self.esperar_texto(self.TITULO, "Procesos")

    def crear_proceso(self):
        self.clic(self.CREAR)
        return ProcesoFormPage(self.driver, self.base_url).esperar_formulario()

    def buscar(self, nombre, vigencia="activos"):
        tabla = self.wait.until(EC.visibility_of_element_located(self.TABLA))
        self.escribir(self.FILTRO_NOMBRE, nombre)
        Select(self.driver.find_element(*self.FILTRO_VIGENCIA)).select_by_value(vigencia)
        self.clic(self.BUSCAR)
        # Mientras carga, Angular quita la tabla anterior: asi no se leen resultados viejos.
        self.wait.until(EC.staleness_of(tabla))
        return self

    def muestra(self, nombre):
        return self.esta_visible(self.fila(nombre))

    def sin_resultados(self):
        return self.esta_visible(self.SIN_RESULTADOS)


class ProcesoFormPage(BasePage):
    """Formulario para crear o editar un proceso."""

    NOMBRE = (By.CSS_SELECTOR, "app-proceso-form input[formcontrolname='nombre']")
    DESCRIPCION = (By.CSS_SELECTOR, "app-proceso-form textarea[formcontrolname='descripcion']")
    CATEGORIA = (By.CSS_SELECTOR, "app-proceso-form input[formcontrolname='categoria']")
    GUARDAR = (By.CSS_SELECTOR, "app-proceso-form button[type='submit']")
    MENSAJE_ERROR = (By.CSS_SELECTOR, "app-proceso-form p")
    ERRORES_VALIDACION = (By.CSS_SELECTOR, "app-proceso-form small")

    def esperar_formulario(self):
        self.wait.until(EC.visibility_of_element_located(self.NOMBRE))
        return self

    def esperar_datos_cargados(self):
        # Al editar, los datos llegan despues: si se escribe antes, Angular sobrescribe lo escrito.
        self.wait.until(lambda d: d.find_element(*self.NOMBRE).get_attribute("value"))
        return self

    def completar(self, nombre, descripcion, categoria):
        self.escribir(self.NOMBRE, nombre)
        self.escribir(self.DESCRIPCION, descripcion)
        self.escribir(self.CATEGORIA, categoria)
        return self

    def guardar(self):
        self.enviar_formulario(self.GUARDAR, r"/procesos/\d+", self.MENSAJE_ERROR)
        return ProcesoDetallePage(self.driver, self.base_url).esperar_detalle()

    def enviar_vacio(self):
        self.clic(self.GUARDAR)
        return self

    def errores_validacion(self):
        errores = self.wait.until(EC.visibility_of_all_elements_located(self.ERRORES_VALIDACION))
        return [error.text for error in errores]


class ProcesoDetallePage(BasePage):
    """Detalle de un proceso, en /procesos/{id}."""

    TITULO = (By.CSS_SELECTOR, "app-proceso-detalle h2")
    EDITAR = (By.XPATH, "//app-proceso-detalle//a[normalize-space()='Editar']")
    PUBLICAR = (By.XPATH, "//app-proceso-detalle//button[normalize-space()='Publicar']")
    ELIMINAR = (By.XPATH, "//app-proceso-detalle//button[normalize-space()='Eliminar']")

    @staticmethod
    def dato(etiqueta):
        """Parrafo con el formato 'Etiqueta: valor', como 'Estado: BORRADOR'."""
        return (By.XPATH, f"//app-proceso-detalle//p[starts-with(normalize-space(), '{etiqueta}:')]")

    def abrir(self, proceso_id):
        self.ir_a(f"/procesos/{proceso_id}")
        return self.esperar_detalle()

    def esperar_detalle(self):
        self.wait.until(EC.visibility_of_element_located(self.TITULO))
        return self

    @property
    def proceso_id(self):
        return int(self.esperar_ruta(r"/procesos/\d+").rsplit("/", 1)[1])

    def nombre(self):
        return self.texto(self.TITULO)

    def valor(self, etiqueta):
        return self.texto(self.dato(etiqueta)).split(":", 1)[1].strip()

    def editar(self):
        self.clic(self.EDITAR)
        return ProcesoFormPage(self.driver, self.base_url).esperar_datos_cargados()

    def publicar(self):
        self.clic(self.PUBLICAR)
        self.esperar_texto(self.dato("Estado"), "PUBLICADO")
        return self

    def eliminar(self):
        self.clic(self.ELIMINAR)
        self.aceptar_confirmacion()
        self.esperar_ruta("/procesos")
        return ProcesosPage(self.driver, self.base_url)
