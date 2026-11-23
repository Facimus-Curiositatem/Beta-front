from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC

from pages.base_page import BasePage


class RolesPage(BasePage):
    """Lista de roles de proceso. Solo la ven los administradores."""

    TITULO = (By.CSS_SELECTOR, "app-rol-proceso-list h1")
    CREAR = (By.XPATH, "//app-rol-proceso-list//a[normalize-space()='Crear rol']")
    FILTRO_NOMBRE = (By.CSS_SELECTOR, "app-rol-proceso-list input[formcontrolname='nombre']")
    BUSCAR = (By.XPATH, "//app-rol-proceso-list//button[normalize-space()='Buscar']")
    SIN_RESULTADOS = (
        By.XPATH,
        "//app-rol-proceso-list//td[normalize-space()='No hay roles para esta búsqueda.']",
    )

    def abrir(self):
        self.ir_a("/roles")
        self.esperar_texto(self.TITULO, "Roles de proceso")
        return self

    def crear_rol(self, nombre, descripcion=""):
        self.clic(self.CREAR)
        return RolFormPage(self.driver, self.base_url).esperar_formulario().completar(nombre, descripcion).guardar()

    def buscar(self, nombre):
        self.escribir(self.FILTRO_NOMBRE, nombre)
        self.clic(self.BUSCAR)
        # El boton se deshabilita mientras carga: al habilitarse, ya llegaron los resultados.
        self.wait.until(EC.element_to_be_clickable(self.BUSCAR))
        return self

    def muestra(self, nombre):
        return self.esta_visible(self.fila(nombre))

    def sin_resultados(self):
        return self.esta_visible(self.SIN_RESULTADOS)

    def editar(self, nombre):
        self.clic((By.XPATH, f"{self.fila(nombre)[1]}//a[normalize-space()='Editar']"))
        return RolFormPage(self.driver, self.base_url).esperar_datos_cargados()

    def eliminar(self, nombre):
        self.clic((By.XPATH, f"{self.fila(nombre)[1]}//button[normalize-space()='Eliminar']"))
        self.aceptar_confirmacion()
        return self


class RolFormPage(BasePage):
    NOMBRE = (By.CSS_SELECTOR, "app-rol-proceso-form input[formcontrolname='nombre']")
    DESCRIPCION = (By.CSS_SELECTOR, "app-rol-proceso-form textarea[formcontrolname='descripcion']")
    GUARDAR = (By.CSS_SELECTOR, "app-rol-proceso-form button[type='submit']")
    MENSAJE_ERROR = (By.CSS_SELECTOR, "app-rol-proceso-form p[role='alert']")

    def esperar_formulario(self):
        self.wait.until(EC.visibility_of_element_located(self.NOMBRE))
        return self

    def esperar_datos_cargados(self):
        # Al editar, los datos llegan despues: si se escribe antes, Angular sobrescribe lo escrito.
        self.wait.until(lambda d: d.find_element(*self.NOMBRE).get_attribute("value"))
        return self

    def completar(self, nombre, descripcion=""):
        self.escribir(self.NOMBRE, nombre)
        self.escribir(self.DESCRIPCION, descripcion)
        return self

    def guardar(self):
        self.enviar_formulario(self.GUARDAR, "/roles", self.MENSAJE_ERROR)
        return RolesPage(self.driver, self.base_url)
