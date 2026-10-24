# Guía de implementación y sustentación — Angular de Samuel

Fecha: 24 de octubre de 2026. Issues: **#4 H1, #11 H8, #7 H4**.

## Empieza aquí

1. Lee el guion y los conceptos básicos de abajo.
2. Sigue login.model → AuthService → LoginComponent → rutas.
3. Sigue RolProcesoService → lista/formulario → LaneForm existente.
4. Sigue PermisoEstructuraService → formulario de permisos.
5. Sigue ProcesoCompartidoService → compartir → recibidos → detalle.
6. Abre cada archivo junto a este documento: el bloque de código es su contenido completo al preparar esta guía.

Este documento explica la implementación actual; las decisiones descritas son las de este cambio. No presume motivos históricos de código escrito por otros integrantes.

## Qué queda integrado y qué depende del equipo

- H1 incluye registro, login, logout, sesión, enlaces, guard de administrador y errores ProblemDetail.
- H8 incluye CRUD, búsqueda paginada, uso de roles y edición de permisos.
- H4 incluye las cinco operaciones y las tres pantallas con detalle de solo lectura.
- **H3 aún no estaba en main al iniciar:** /procesos usa un acceso temporal por ID. Al integrar H3, sustituir su loadComponent y conservar enlaces a pools y compartir. El acceso no crea ni lista procesos.
- H6/H7: nodos-compartidos.model.ts solo define DTOs de lectura. Cuando lleguen modelos equivalentes, reutilizarlos coordinando imports; no cambiar el JSON.
- Backend: contratos comprobados contra origin/main de Beta-back. La VM 10.43.99.37:8080 no respondió desde este entorno. Las pruebas HTTP usan respuestas controladas, no prueban disponibilidad ni datos reales de la VM.
- La autorización y la multitenencia permanecen en el backend. Decodificar un JWT en el navegador **no verifica su firma**.
- Se mantiene Angular 20 y la organización existente; no se añadieron dependencias de producto. Las interfaces se agrupan por dominio en .model.ts, como hacía main, en lugar de duplicarlas en un archivo por DTO.

## Guion para presentar (6–8 minutos)

**1. Ubicación — 30 segundos.** «Mi parte tiene tres módulos: registro y autenticación, roles y permisos, y procesos compartidos. Están organizados en modelos, servicios y componentes; app.routes.ts conecta sus pantallas».

**2. Login y registro — 2 minutos.** Enseña login.model.ts, AuthService y LoginComponent. «El formulario valida, el servicio envía HTTP y el backend devuelve un JWT. TokenService conserva el token; el interceptor añade Bearer solo a nuestra API. Al cerrar sesión eliminamos la copia local incluso con error de conexión. Registro usa una sola petición para crear la empresa y su administrador». Muestra también el formulario de registro y un error de validación.

**3. Roles y permisos — 2 minutos.** «Un rol de proceso es una función dentro del modelo, como ventas, y se asigna a un lane. Un rol de acceso establece qué puede hacer el usuario. El listado consulta páginas del backend; el formulario crea o edita. Un rol en uso no se puede borrar. La configuración de estructura permite administrar seis permisos por rol de acceso». Enseña service, tabla y FormArray.

**4. Compartidos — 2 minutos.** «El propietario comparte un proceso con otra empresa por ID. El invitado consulta una vista de lectura con todas las colecciones. Para revocar mandamos empresaInvitadaId. El backend obtiene la empresa del JWT, no de un ID de propietario elegido por el navegador». Muestra servicio y detalle sin botones de escritura.

**5. Verificación — 30 segundos.** «Tenemos pruebas de peticiones, validación, navegación, errores y cambio de IDs; además compilación de producción. La conexión a la VM debe verificarse desde la red del equipo».

## Conceptos que debes poder explicar

| Elemento | Explicación breve |
|---|---|
| interface | Describe la forma de datos en TypeScript; no crea ni valida objetos en ejecución. |
| Component | Une la lógica de una pantalla con su plantilla HTML. |
| Injectable / inject | Angular crea y entrega dependencias registradas, como HttpClient o un servicio. |
| providedIn: root | Registra el servicio en el inyector principal. |
| standalone / imports | El componente declara las piezas que usa en su plantilla sin necesitar un NgModule propio. |
| Observable / subscribe | Observable representa una operación que puede emitir datos o error; subscribe inicia la petición HttpClient y atiende su resultado. |
| signal | Guarda un valor que la plantilla puede leer y actualizar reactivamente. No realiza peticiones por sí mismo. |
| FormControl / FormGroup | Un campo y un grupo de campos con estado y validaciones. |
| nonNullable | Evita que el tipo de un control incluya null y conserva su valor inicial al resetear. |
| getRawValue | Obtiene valores de todos los controles, incluidos los deshabilitados. |
| touched | Indica interacción con el campo; ayuda a decidir cuándo mostrar errores. |
| FormArray | Lista de grupos/controles para filas dinámicas, aquí permisos por rol. |
| input.required | Dato de entrada obligatorio. El router entrega el parámetro de URL mediante withComponentInputBinding. |
| ngOnChanges / ngOnDestroy | Reacciona a cambios de entradas y limpia al destruir el componente. Aquí se cancela la carga anterior. |
| Subscription.unsubscribe | Cancela una suscripción; en HttpClient evita seguir atendiendo esa petición. |
| @if / @for / track | Muestran condiciones y repiten filas; track identifica cada fila para actualizarla correctamente. |
| [propiedad] / (evento) | Enlazan un dato hacia la vista y una acción del usuario hacia la clase. |
| ?? / ?. | Valor alternativo para null/undefined y acceso seguro cuando un dato puede faltar. |
| HttpParams | Construye parámetros de consulta; sus métodos devuelven una nueva instancia. |
| tap / finalize | Ejecutan un efecto con el resultado y una limpieza al terminar, respectivamente. |
| readonly / private / protected | Restringen asignaciones y accesos en TypeScript; no son mecanismos de seguridad HTTP. |
| JWT | Token firmado que permite al backend identificar usuario, empresa y rol sin sesión de servidor. |
| 400 / 401 / 403 / 404 / 409 | Datos inválidos / autenticación inválida / sin permiso / no encontrado / conflicto de negocio. |
| ProblemDetail.detail | Mensaje del problema enviado por Spring; se muestra para conservar el contexto real del error. |

## Recorrido de prueba manual antes de sustentar

1. Usar Node 22 (recomendación del equipo), ejecutar npm ci y npm start.
2. Confirmar proxy.conf.json contra la dirección del backend accesible desde el PC. En producción /api/v1 requiere que el despliegue lo enrute al backend; el proxy de ng serve no se publica.
3. Registrar una empresa, iniciar sesión y comprobar POST en Network y Bearer en una petición privada.
4. Crear/editar un rol; intentar borrar uno en uso; buscar y avanzar página cuando haya suficientes datos.
5. Cambiar un permiso de EDITOR, guardar y recargar para confirmar persistencia. Verificar con esa cuenta una operación permitida y otra rechazada.
6. Con empresa A, compartir un proceso real con empresa B. Con B, abrir recibidos y detalle. Revocar con A y comprobar que B ya no lo puede consultar.
7. Cerrar sesión y volver a una URL privada: debe ir al login. Probar también con EDITOR una URL administrativa.

## Archivos, uno por uno

Los archivos .spec.ts pertenecen a pruebas. No se incorporan como pantallas del producto.

### 1. `src/app/app.component.html`

**Propósito y qué hace:** Muestra enlaces según la sesión y el rol, y aloja la pantalla elegida por RouterOutlet.

**Por qué así:** El menú es común a los tres issues. Ocultar enlaces mejora la navegación; la autorización real permanece en Spring Security.

**Pregunta probable:** ¿Es seguro esconder un botón? Es solo una ayuda visual. El backend debe rechazar peticiones no autorizadas.

```html
@if (tokens.tieneSesion()) {
  <nav aria-label="Navegación principal">
    <a routerLink="/procesos">Procesos</a>
    <a routerLink="/procesos-compartidos">Compartidos conmigo</a>
    @if (tokens.esAdministrador()) {
      <a routerLink="/roles">Roles de proceso</a>
      <a routerLink="/permisos-estructura">Permisos de estructura</a>
    }
    <button type="button" (click)="cerrarSesion()" [disabled]="closing()">Cerrar sesión</button>
  </nav>
}
<main><router-outlet /></main>
```

### 2. `src/app/app.component.spec.ts`

**Propósito y qué hace:** Pruebas de app.component: debe crearse; debe contener router-outlet; cierra sesión y vuelve a login aunque falle el servidor.

**Por qué así:** Comprueba peticiones, estado visible o navegación usando TestBed y respuestas HTTP controladas; no usa la VM. Las dependencias se registran como en la aplicación.

**Pregunta probable:** ¿Por qué estas pruebas? Protegen estos comportamientos concretos y detectan regresiones. No comprueban disponibilidad de la VM ni reemplazan pruebas entre frontend y backend reales.

```typescript
import { Router } from '@angular/router';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AppComponent } from './app.component';

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [provideRouter([]), provideHttpClient()]
    }).compileComponents();
  });

  it('debe crearse', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('debe contener router-outlet', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('router-outlet')).toBeTruthy();
  });
});

describe('AppComponent cierre de sesión', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()]
    });
  });
  afterEach(() => {
    TestBed.inject(HttpTestingController).verify();
    localStorage.clear();
  });
  it('cierra sesión y vuelve a login aunque falle el servidor', () => {
    const f = TestBed.createComponent(AppComponent);
    localStorage.setItem('accessToken', 'token');
    const nav = spyOn(TestBed.inject(Router), 'navigate').and.resolveTo(true);
    f.componentInstance.cerrarSesion();
    f.componentInstance.cerrarSesion();
    TestBed.inject(HttpTestingController)
      .expectOne('/api/v1/auth/logout')
      .flush({}, { status: 500, statusText: 'Error' });
    expect(localStorage.getItem('accessToken')).toBeNull();
    expect(nav).toHaveBeenCalledWith(['/login']);
    expect(f.componentInstance.closing()).toBeFalse();
  });
});
```

### 3. `src/app/app.component.ts`

**Propósito y qué hace:** Es el componente raíz: mantiene la navegación común y ofrece cerrar sesión.

**Por qué así:** Centralizar el botón de salida evita repetirlo en cada pantalla. cerrarSesion bloquea doble clic y descarta credenciales tanto en éxito como en fallo de red.

**Pregunta probable:** ¿El logout invalida el JWT en el servidor? No: AuthController es stateless; el cliente elimina su copia. Un token copiado conserva validez hasta expirar.

```typescript
import { Component, inject, signal } from '@angular/core';
import { RouterOutlet, RouterLink, Router } from '@angular/router';

import { AuthService } from './services/auth.service';
import { TokenService } from './services/token.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'Beta-front';
  readonly tokens = inject(TokenService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  readonly closing = signal(false);
  cerrarSesion(): void {
    if (this.closing()) return;
    this.closing.set(true);
    const salir = () => {
      this.tokens.removeToken();
      this.closing.set(false);
      this.router.navigate(['/login']);
    };
    this.auth.logout().subscribe({ next: salir, error: salir });
  }
}
```

### 4. `src/app/app.config.ts`

**Propósito y qué hace:** Registra HttpClient, interceptores y router con enlace de parámetros a inputs.

**Por qué así:** Es infraestructura previa reutilizada. No añadimos otra configuración paralela para los issues propios.

**Pregunta probable:** ¿Por qué se inyecta HttpClient sin crearlo con new? Porque está registrado como proveedor y Angular resuelve la dependencia.

```typescript
import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { routes } from './app.routes';
import { authInterceptor } from './interceptors/auth.interceptor';
import { errorInterceptor } from './interceptors/error.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(withInterceptors([authInterceptor, errorInterceptor]))
  ]
};
```

### 5. `src/app/app.routes.spec.ts`

**Propósito y qué hace:** Pruebas de app.routes: protege módulos privados sin sesión; impide a editor abrir administración; vincula id de ruta al formulario de edición; vincula id de proceso al módulo compartir.

**Por qué así:** Comprueba peticiones, estado visible o navegación usando TestBed y respuestas HTTP controladas; no usa la VM. Las dependencias se registran como en la aplicación.

**Pregunta probable:** ¿Por qué estas pruebas? Protegen estos comportamientos concretos y detectan regresiones. No comprueban disponibilidad de la VM ni reemplazan pruebas entre frontend y backend reales.

```typescript
import { TestBed } from '@angular/core/testing';
import { provideRouter, withComponentInputBinding, Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { routes } from './app.routes';
import { TokenService } from './services/token.service';
import { RolProcesoFormComponent } from './components/rol-proceso-form/rol-proceso-form.component';
import { CompartirProcesoComponent } from './components/compartir-proceso/compartir-proceso.component';

describe('Rutas H1, H4 y H8', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        provideRouter(routes, withComponentInputBinding()),
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });
  });
  afterEach(() => {
    TestBed.inject(HttpTestingController).verify();
    localStorage.clear();
  });
  function login(rol = 'ADMINISTRADOR') {
    TestBed.inject(TokenService).setToken(
      'h.' + btoa(JSON.stringify({ exp: Date.now() / 1000 + 3600, rol })) + '.s'
    );
  }
  it('protege módulos privados sin sesión', async () => {
    const h = await RouterTestingHarness.create();
    await h.navigateByUrl('/roles');
    expect(TestBed.inject(Router).url).toBe('/login');
  });
  it('impide a editor abrir administración', async () => {
    login('EDITOR');
    const h = await RouterTestingHarness.create();
    await h.navigateByUrl('/roles');
    expect(TestBed.inject(Router).url).toContain('/procesos?aviso=sin-permiso');
  });
  it('vincula id de ruta al formulario de edición', async () => {
    login();
    const h = await RouterTestingHarness.create();
    const c = await h.navigateByUrl('/roles/7/editar', RolProcesoFormComponent);
    expect(c.id()).toBe('7');
    TestBed.inject(HttpTestingController)
      .expectOne('/api/v1/roles/7')
      .flush({ id: 7, nombre: 'Ventas', descripcion: null });
  });
  it('vincula id de proceso al módulo compartir', async () => {
    login();
    const h = await RouterTestingHarness.create();
    const c = await h.navigateByUrl('/procesos/10/compartir', CompartirProcesoComponent);
    expect(c.id()).toBe('10');
    TestBed.inject(HttpTestingController).expectOne('/api/v1/procesos/10/compartidos').flush([]);
  });
});
```

### 6. `src/app/app.routes.ts`

**Propósito y qué hace:** Relaciona URLs con login, registro, roles, permisos, procesos compartidos y los pools/lanes existentes.

**Por qué así:** loadComponent carga la pantalla cuando se necesita. authGuard y adminGuard orientan el acceso desde el navegador. La ruta /procesos es un acceso temporal para integrar H3.

**Pregunta probable:** ¿Qué significa :id? Es un parámetro de ruta. withComponentInputBinding lo entrega al input id del componente.

```typescript
import { Routes } from '@angular/router';
import { adminGuard } from './guards/admin.guard';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: 'procesos/:id/compartir',
    canActivate: [adminGuard],
    loadComponent: () =>
      import('./components/compartir-proceso/compartir-proceso.component').then(
        (m) => m.CompartirProcesoComponent
      )
  },
  {
    path: 'procesos-compartidos',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./components/procesos-compartidos-list/procesos-compartidos-list.component').then(
        (m) => m.ProcesosCompartidosListComponent
      )
  },
  {
    path: 'procesos-compartidos/:id',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./components/proceso-compartido-detalle/proceso-compartido-detalle.component').then(
        (m) => m.ProcesoCompartidoDetalleComponent
      )
  },
  {
    path: 'roles',
    canActivate: [adminGuard],
    loadComponent: () =>
      import('./components/rol-proceso-list/rol-proceso-list.component').then(
        (m) => m.RolProcesoListComponent
      )
  },
  {
    path: 'roles/nuevo',
    canActivate: [adminGuard],
    loadComponent: () =>
      import('./components/rol-proceso-form/rol-proceso-form.component').then(
        (m) => m.RolProcesoFormComponent
      )
  },
  {
    path: 'roles/:id/editar',
    canActivate: [adminGuard],
    loadComponent: () =>
      import('./components/rol-proceso-form/rol-proceso-form.component').then(
        (m) => m.RolProcesoFormComponent
      )
  },
  {
    path: 'permisos-estructura',
    canActivate: [adminGuard],
    loadComponent: () =>
      import('./components/permiso-estructura/permiso-estructura.component').then(
        (m) => m.PermisoEstructuraComponent
      )
  },
  {
    path: 'registro',
    loadComponent: () =>
      import('./components/registro-empresa/registro-empresa.component').then(
        (m) => m.RegistroEmpresaComponent
      )
  },
  {
    path: 'procesos',
    loadComponent: () =>
      import('./components/inicio-procesos/inicio-procesos.component').then(
        (m) => m.InicioProcesosComponent
      ),
    canActivate: [authGuard]
  },
  {
    path: 'login',
    loadComponent: () => import('./components/login/login.component').then((m) => m.LoginComponent)
  },
  {
    path: 'procesos/:procesoId/pools',
    loadComponent: () =>
      import('./components/pool-list/pool-list.component').then((m) => m.PoolListComponent),
    canActivate: [authGuard]
  },
  {
    path: 'procesos/:procesoId/pools/nuevo',
    loadComponent: () =>
      import('./components/pool-form/pool-form.component').then((m) => m.PoolFormComponent),
    canActivate: [authGuard]
  },
  {
    path: 'procesos/:procesoId/pools/:id/editar',
    loadComponent: () =>
      import('./components/pool-form/pool-form.component').then((m) => m.PoolFormComponent),
    canActivate: [authGuard]
  },
  {
    path: 'pools/:id/lanes',
    loadComponent: () =>
      import('./components/lane-list/lane-list.component').then((m) => m.LaneListComponent),
    canActivate: [authGuard]
  },
  {
    path: 'pools/:poolId/lanes/nuevo',
    loadComponent: () =>
      import('./components/lane-form/lane-form.component').then((m) => m.LaneFormComponent),
    canActivate: [authGuard]
  },
  {
    path: 'pools/:poolId/lanes/:laneId/editar',
    loadComponent: () =>
      import('./components/lane-form/lane-form.component').then((m) => m.LaneFormComponent),
    canActivate: [authGuard]
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: 'login'
  }
];
```

### 7. `src/app/components/compartir-proceso/compartir-proceso.component.html`

**Propósito y qué hace:** Plantilla de la pantalla: Comparte con un ID de empresa, lista invitados y permite revocar con confirmación.

**Por qué así:** Se separa el HTML de la clase para leer y explicar la vista. Usa controles, mensajes y acciones del componente. El backend determina propiedad y empresa autenticada. empresaInvitadaId identifica a quién se revoca. Se recarga al cambiar el proceso y se cancela la consulta anterior.

**Pregunta probable:** ¿Por qué no usar item.id al revocar? El contrato de DELETE pide el ID de la empresa invitada, no el ID del registro ProcesoCompartido.

```html
<h1>Compartir proceso {{ id() }}</h1>
<p>La empresa invitada tendrá acceso de solo lectura.</p>
@if (message()) {
  <p role="alert">{{ message() }}</p>
}
<form [formGroup]="form" (ngSubmit)="compartir()">
  <label
    >ID de empresa invitada
    <input type="number" min="1" step="1" formControlName="empresaInvitadaId"
  /></label>
  @if (form.controls.empresaInvitadaId.touched && form.controls.empresaInvitadaId.invalid) {
    <small>Ingresa un ID entero mayor que cero.</small>
  }
  <button type="submit" [disabled]="saving()">Compartir</button>
</form>
<button type="button" (click)="cargar()" [disabled]="loading() || saving()">
  Actualizar lista
</button>
@if (loading()) {
  <p>Cargando...</p>
}
<table>
  <thead>
    <tr>
      <th>Empresa invitada</th>
      <th>Solo lectura</th>
      <th>Acción</th>
    </tr>
  </thead>
  <tbody>
    @for (item of compartidos(); track item.id) {
      <tr>
        <td>{{ item.empresaInvitada }}</td>
        <td>{{ item.soloLectura ? 'Sí' : 'No' }}</td>
        <td>
          <button type="button" (click)="revocar(item)" [disabled]="saving()">Revocar</button>
        </td>
      </tr>
    } @empty {
      <tr>
        <td colspan="3">No hay empresas invitadas.</td>
      </tr>
    }
  </tbody>
</table>
<a routerLink="/procesos">Volver a procesos</a>
```

### 8. `src/app/components/compartir-proceso/compartir-proceso.component.spec.ts`

**Propósito y qué hace:** Pruebas de compartir-proceso.component: muestra invitados y rechaza IDs inválidos; comparte una vez y actualiza lista; revoca por empresaInvitadaId y no por id del compartido; muestra error de negocio al compartir; recarga al cambiar el ID sin recrear la pantalla; limpia error después de recuperar la lista.

**Por qué así:** Comprueba peticiones, estado visible o navegación usando TestBed y respuestas HTTP controladas; no usa la VM. Las dependencias se registran como en la aplicación.

**Pregunta probable:** ¿Por qué estas pruebas? Protegen estos comportamientos concretos y detectan regresiones. No comprueban disponibilidad de la VM ni reemplazan pruebas entre frontend y backend reales.

```typescript
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { CompartirProcesoComponent } from './compartir-proceso.component';
import { compartido } from '../../testing/compartidos.fixture';
describe('CompartirProcesoComponent', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [CompartirProcesoComponent],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()]
    })
  );
  afterEach(() => TestBed.inject(HttpTestingController).verify());
  function setup() {
    const f = TestBed.createComponent(CompartirProcesoComponent);
    f.componentRef.setInput('id', '10');
    f.detectChanges();
    TestBed.inject(HttpTestingController)
      .expectOne('/api/v1/procesos/10/compartidos')
      .flush([compartido]);
    f.detectChanges();
    return f;
  }
  it('muestra invitados y rechaza IDs inválidos', () => {
    const f = setup();
    expect(f.nativeElement.textContent).toContain('Aliada');
    for (const id of [0, -1, 1.5]) {
      f.componentInstance.form.setValue({ empresaInvitadaId: id });
      f.componentInstance.compartir();
      expect(f.componentInstance.form.invalid).toBeTrue();
    }
    TestBed.inject(HttpTestingController).expectNone('/api/v1/procesos/10/compartidos');
  });
  it('comparte una vez y actualiza lista', () => {
    const f = setup();
    f.componentInstance.form.setValue({ empresaInvitadaId: 9 });
    f.componentInstance.compartir();
    f.componentInstance.compartir();
    const http = TestBed.inject(HttpTestingController);
    const r = http.expectOne('/api/v1/procesos/10/compartidos');
    expect(r.request.body.empresaInvitadaId).toBe(9);
    r.flush(compartido);
    http.expectOne('/api/v1/procesos/10/compartidos').flush([compartido]);
    expect(f.componentInstance.saving()).toBeFalse();
  });
  it('revoca por empresaInvitadaId y no por id del compartido', () => {
    spyOn(window, 'confirm').and.returnValue(true);
    const f = setup();
    f.componentInstance.revocar(compartido);
    const http = TestBed.inject(HttpTestingController);
    const r = http.expectOne('/api/v1/procesos/10/compartidos/8');
    expect(r.request.method).toBe('DELETE');
    r.flush(null);
    http.expectOne('/api/v1/procesos/10/compartidos').flush([]);
    expect(f.componentInstance.compartidos()).toEqual([]);
  });
  it('muestra error de negocio al compartir', () => {
    const f = setup();
    f.componentInstance.form.setValue({ empresaInvitadaId: 8 });
    f.componentInstance.compartir();
    TestBed.inject(HttpTestingController)
      .expectOne('/api/v1/procesos/10/compartidos')
      .flush({ detail: 'Ya compartido' }, { status: 409, statusText: 'Conflict' });
    expect(f.componentInstance.message()).toBe('Ya compartido');
    expect(f.componentInstance.saving()).toBeFalse();
  });
  it('recarga al cambiar el ID sin recrear la pantalla', () => {
    const f = TestBed.createComponent(CompartirProcesoComponent);
    f.componentRef.setInput('id', '9');
    f.detectChanges();
    const http = TestBed.inject(HttpTestingController);
    http.expectOne('/api/v1/procesos/9/compartidos').flush([]);
    f.componentRef.setInput('id', '12');
    f.detectChanges();
    const req = http.expectOne('/api/v1/procesos/12/compartidos');
    req.flush([]);
    expect(f.componentInstance.id()).toBe('12');
  });
  it('limpia error después de recuperar la lista', () => {
    const f = TestBed.createComponent(CompartirProcesoComponent);
    f.componentRef.setInput('id', '10');
    f.detectChanges();
    const http = TestBed.inject(HttpTestingController);
    http
      .expectOne('/api/v1/procesos/10/compartidos')
      .flush({ detail: 'Error de carga' }, { status: 500, statusText: 'Error' });
    f.componentInstance.cargar();
    http.expectOne('/api/v1/procesos/10/compartidos').flush([]);
    expect(f.componentInstance.message()).toBe('');
  });
});
```

### 9. `src/app/components/compartir-proceso/compartir-proceso.component.ts`

**Propósito y qué hace:** Comparte con un ID de empresa, lista invitados y permite revocar con confirmación.

**Por qué así:** El backend determina propiedad y empresa autenticada. empresaInvitadaId identifica a quién se revoca. Se recarga al cambiar el proceso y se cancela la consulta anterior.

**Pregunta probable:** ¿Por qué no usar item.id al revocar? El contrato de DELETE pide el ID de la empresa invitada, no el ID del registro ProcesoCompartido.

```typescript
import { Subscription } from 'rxjs';
import { Component, inject, input, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { ProcesoCompartidoService } from '../../services/proceso-compartido.service';
import { ProcesoCompartidoResponse } from '../../models/proceso-compartido.model';

@Component({
  selector: 'app-compartir-proceso',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './compartir-proceso.component.html'
})
export class CompartirProcesoComponent {
  private readonly service = inject(ProcesoCompartidoService);
  readonly id = input.required<string>();
  readonly compartidos = signal<ProcesoCompartidoResponse[]>([]);
  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly message = signal('');
  readonly form = inject(FormBuilder).nonNullable.group({
    empresaInvitadaId: [0, [Validators.required, Validators.min(1), Validators.pattern(/^[0-9]+$/)]]
  });
  private carga?: Subscription;
  ngOnDestroy(): void {
    this.carga?.unsubscribe();
  }
  ngOnChanges(): void {
    this.cargar();
  }
  cargar(): void {
    this.carga?.unsubscribe();
    this.loading.set(true);
    this.message.set('');
    this.compartidos.set([]);
    this.carga = this.service.listarCompartidosPorMi(Number(this.id())).subscribe({
      next: (data) => {
        this.compartidos.set(data);
        this.loading.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.loading.set(false);
        this.message.set(err.error?.detail ?? 'No fue posible cargar las empresas invitadas');
      }
    });
  }
  compartir(): void {
    if (this.saving()) return;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.saving.set(true);
    this.message.set('');
    this.service.compartir(Number(this.id()), this.form.getRawValue()).subscribe({
      next: () => {
        this.saving.set(false);
        this.form.reset();
        this.cargar();
      },
      error: (err: HttpErrorResponse) => {
        this.saving.set(false);
        this.message.set(err.error?.detail ?? 'No fue posible compartir el proceso');
      }
    });
  }
  revocar(compartido: ProcesoCompartidoResponse): void {
    if (this.saving()) return;
    if (!confirm(`¿Revocar el acceso de ${compartido.empresaInvitada}?`)) return;
    this.saving.set(true);
    this.message.set('');
    // El endpoint recibe la empresa invitada, no el ID del registro compartido.
    this.service.revocar(Number(this.id()), compartido.empresaInvitadaId).subscribe({
      next: () => {
        this.saving.set(false);
        this.cargar();
      },
      error: (err: HttpErrorResponse) => {
        this.saving.set(false);
        this.message.set(err.error?.detail ?? 'No fue posible revocar el acceso');
      }
    });
  }
}
```

### 10. `src/app/components/inicio-procesos/inicio-procesos.component.html`

**Propósito y qué hace:** Plantilla de la pantalla: Ofrece enlaces y abre pools o compartir usando un ID de proceso existente.

**Por qué así:** Se separa el HTML de la clase para leer y explicar la vista. Usa controles, mensajes y acciones del componente. Es un punto de integración temporal: main carece de H3. No crea datos ficticios ni pretende reemplazar el CRUD del compañero.

**Pregunta probable:** ¿Qué se debe cambiar al llegar H3? La ruta /procesos debe apuntar a su listado; sus enlaces deben abrir /procesos/:id/pools y /procesos/:id/compartir.

```html
<h1>Procesos</h1>
@if (sinPermiso) {
  <p role="alert">No tienes permiso para administrar esta sección.</p>
}
<p>Acceso por identificador. El listado de procesos se incorporará con H3.</p>
<form [formGroup]="form" (ngSubmit)="abrir()">
  <label
    >ID de un proceso existente <input type="number" min="1" step="1" formControlName="procesoId"
  /></label>
  <button type="submit" [disabled]="form.invalid">Ver pools</button>
  @if (tokens.esAdministrador()) {
    <button type="button" (click)="compartir()" [disabled]="form.invalid">Compartir proceso</button>
  }
</form>
```

### 11. `src/app/components/inicio-procesos/inicio-procesos.component.spec.ts`

**Propósito y qué hace:** Pruebas de inicio-procesos.component: abre pools y compartir con el mismo ID real; no navega con ID inválido.

**Por qué así:** Comprueba peticiones, estado visible o navegación usando TestBed y respuestas HTTP controladas; no usa la VM. Las dependencias se registran como en la aplicación.

**Pregunta probable:** ¿Por qué estas pruebas? Protegen estos comportamientos concretos y detectan regresiones. No comprueban disponibilidad de la VM ni reemplazan pruebas entre frontend y backend reales.

```typescript
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { InicioProcesosComponent } from './inicio-procesos.component';
describe('InicioProcesosComponent integración H3', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [InicioProcesosComponent],
      providers: [provideRouter([])]
    })
  );
  it('abre pools y compartir con el mismo ID real', () => {
    const f = TestBed.createComponent(InicioProcesosComponent);
    const nav = spyOn(TestBed.inject(Router), 'navigate').and.resolveTo(true);
    f.componentInstance.form.setValue({ procesoId: 10 });
    f.componentInstance.abrir();
    expect(nav).toHaveBeenCalledWith(['/procesos', 10, 'pools']);
    f.componentInstance.compartir();
    expect(nav).toHaveBeenCalledWith(['/procesos', 10, 'compartir']);
  });
  it('no navega con ID inválido', () => {
    const f = TestBed.createComponent(InicioProcesosComponent);
    const nav = spyOn(TestBed.inject(Router), 'navigate').and.resolveTo(true);
    f.componentInstance.form.setValue({ procesoId: 0 });
    f.componentInstance.abrir();
    f.componentInstance.compartir();
    expect(nav).not.toHaveBeenCalled();
    expect(f.componentInstance.form.invalid).toBeTrue();
  });
});
```

### 12. `src/app/components/inicio-procesos/inicio-procesos.component.ts`

**Propósito y qué hace:** Ofrece enlaces y abre pools o compartir usando un ID de proceso existente.

**Por qué así:** Es un punto de integración temporal: main carece de H3. No crea datos ficticios ni pretende reemplazar el CRUD del compañero.

**Pregunta probable:** ¿Qué se debe cambiar al llegar H3? La ruta /procesos debe apuntar a su listado; sus enlaces deben abrir /procesos/:id/pools y /procesos/:id/compartir.

```typescript
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

// Punto de acceso temporal hasta integrar el listado H3 del compañero.
import { TokenService } from '../../services/token.service';

@Component({
  selector: 'app-inicio-procesos',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './inicio-procesos.component.html'
})
export class InicioProcesosComponent {
  readonly tokens = inject(TokenService);
  private readonly router = inject(Router);
  readonly sinPermiso =
    inject(ActivatedRoute).snapshot.queryParamMap.get('aviso') === 'sin-permiso';
  readonly form = inject(FormBuilder).nonNullable.group({
    procesoId: [1, [Validators.required, Validators.min(1), Validators.pattern(/^[0-9]+$/)]]
  });
  compartir(): void {
    if (this.form.invalid) return;
    this.router.navigate(['/procesos', this.form.getRawValue().procesoId, 'compartir']);
  }
  abrir(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.router.navigate(['/procesos', this.form.getRawValue().procesoId, 'pools']);
  }
}
```

### 13. `src/app/components/login/login.component.html`

**Propósito y qué hace:** Plantilla de la pantalla: Valida correo y contraseña, llama a AuthService, muestra errores y navega a /procesos.

**Por qué así:** Se separa el HTML de la clase para leer y explicar la vista. Usa controles, mensajes y acciones del componente. El componente gestiona interacción y navegación; el servicio guarda el token. loading evita envíos repetidos.

**Pregunta probable:** ¿Qué hace markAllAsTouched? Marca campos como tocados para mostrar sus errores cuando se intenta enviar un formulario inválido.

```html
<h2>Iniciar sesion</h2>

@if (message()) {
  <p>{{ message() }}</p>
}

<form [formGroup]="form" (ngSubmit)="submit()">
  <label>
    Correo
    <input type="email" formControlName="email" />
  </label>
  @if (form.controls.email.touched && form.controls.email.hasError('required')) {
    <small>El correo es obligatorio</small>
  }
  @if (form.controls.email.touched && form.controls.email.hasError('email')) {
    <small>El correo no tiene un formato valido</small>
  }

  <label>
    Contrasena
    <input type="password" formControlName="password" />
  </label>
  @if (form.controls.password.touched && form.controls.password.hasError('required')) {
    <small>La contrasena es obligatoria</small>
  }

  <button type="submit" [disabled]="loading()">
    @if (loading()) {
      Ingresando...
    } @else {
      Ingresar
    }
  </button>
</form>

<a routerLink="/registro">Registrar una empresa</a>
```

### 14. `src/app/components/login/login.component.spec.ts`

**Propósito y qué hace:** Pruebas de login.component: no envía formulario vacío; guarda sesión, evita doble envío y navega a procesos; muestra detail del backend y permite reintentar.

**Por qué así:** Comprueba peticiones, estado visible o navegación usando TestBed y respuestas HTTP controladas; no usa la VM. Las dependencias se registran como en la aplicación.

**Pregunta probable:** ¿Por qué estas pruebas? Protegen estos comportamientos concretos y detectan regresiones. No comprueban disponibilidad de la VM ni reemplazan pruebas entre frontend y backend reales.

```typescript
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { LoginComponent } from './login.component';

describe('LoginComponent', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()]
    });
  });
  afterEach(() => {
    TestBed.inject(HttpTestingController).verify();
    localStorage.clear();
  });
  it('no envía formulario vacío', () => {
    const f = TestBed.createComponent(LoginComponent);
    f.detectChanges();
    f.componentInstance.submit();
    expect(f.nativeElement.querySelector('form')).toBeTruthy();
    TestBed.inject(HttpTestingController).expectNone('/api/v1/auth/login');
  });
  it('guarda sesión, evita doble envío y navega a procesos', () => {
    const f = TestBed.createComponent(LoginComponent);
    const nav = spyOn(TestBed.inject(Router), 'navigate').and.resolveTo(true);
    f.detectChanges();
    for (const [name, value] of [
      ['email', 'sam@beta.co'],
      ['password', '123456']
    ]) {
      const input: HTMLInputElement = f.nativeElement.querySelector(`[formControlName="${name}"]`);
      input.value = value;
      input.dispatchEvent(new Event('input'));
    }
    f.componentInstance.submit();
    f.componentInstance.submit();
    const req = TestBed.inject(HttpTestingController).expectOne('/api/v1/auth/login');
    req.flush({ accessToken: 'jwt', usuario: {}, expiresIn: 3600, tokenType: 'Bearer' });
    expect(localStorage.getItem('accessToken')).toBe('jwt');
    expect(nav).toHaveBeenCalledWith(['/procesos']);
  });
  it('muestra detail del backend y permite reintentar', () => {
    const f = TestBed.createComponent(LoginComponent);
    f.detectChanges();
    for (const [name, value] of [
      ['email', 'sam@beta.co'],
      ['password', '123456']
    ]) {
      const input = f.nativeElement.querySelector(`[formControlName="${name}"]`);
      input.value = value;
      input.dispatchEvent(new Event('input'));
    }
    f.componentInstance.submit();
    TestBed.inject(HttpTestingController)
      .expectOne('/api/v1/auth/login')
      .flush({ detail: 'Credenciales inválidas' }, { status: 401, statusText: 'Unauthorized' });
    f.detectChanges();
    expect(f.nativeElement.textContent).toContain('Credenciales inválidas');
    expect(f.nativeElement.querySelector('button').disabled).toBeFalse();
  });
});
```

### 15. `src/app/components/login/login.component.ts`

**Propósito y qué hace:** Valida correo y contraseña, llama a AuthService, muestra errores y navega a /procesos.

**Por qué así:** El componente gestiona interacción y navegación; el servicio guarda el token. loading evita envíos repetidos.

**Pregunta probable:** ¿Qué hace markAllAsTouched? Marca campos como tocados para mostrar sus errores cuando se intenta enviar un formulario inválido.

```typescript
import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html'
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly message = signal('');
  protected readonly loading = signal(false);

  protected readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required]
  });

  submit(): void {
    if (this.loading()) return;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.message.set('');

    this.authService.login(this.form.getRawValue()).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigate(['/procesos']);
      },
      error: (err: HttpErrorResponse) => {
        this.loading.set(false);
        this.message.set(
          err.error?.detail ?? err.error?.message ?? 'No fue posible iniciar sesion'
        );
      }
    });
  }
}
```

### 16. `src/app/components/permiso-estructura/permiso-estructura.component.html`

**Propósito y qué hace:** Plantilla de la pantalla: Muestra una fila por rol de acceso, seis casillas y guardado individual.

**Por qué así:** Se separa el HTML de la clase para leer y explicar la vista. Usa controles, mensajes y acciones del componente. FormArray contiene grupos de campos, uno por fila recibida. Se envían booleanos reales; el rol se separa del body. Se usa la respuesta del servidor como configuración guardada.

**Pregunta probable:** ¿Qué es FormArray? Una colección de formularios del mismo tipo, útil cuando el número de filas se conoce al recibir la respuesta. ReturnType obtiene en TypeScript el tipo de grupo que devuelve fila(); no ejecuta nada adicional.

```html
<h1>Permisos de estructura</h1>
<p>El rol de acceso determina quién puede crear, editar o eliminar pools y lanes.</p>
@if (message()) {
  <p role="status">{{ message() }}</p>
}
@if (loading()) {
  <p>Cargando...</p>
}
<button type="button" (click)="cargar()" [disabled]="loading() || saving() !== null">
  Recargar
</button>
<form [formGroup]="form">
  <div formArrayName="permisos">
    <table>
      <thead>
        <tr>
          <th>Rol de acceso</th>
          <th>crearPool</th>
          <th>editarPool</th>
          <th>eliminarPool</th>
          <th>crearLane</th>
          <th>editarLane</th>
          <th>eliminarLane</th>
          <th>Acción</th>
        </tr>
      </thead>
      <tbody>
        @for (row of rows.controls; track row; let i = $index) {
          <tr [formGroupName]="i">
            <th>{{ row.controls.rolAcceso.value }}</th>
            <td>
              <input
                type="checkbox"
                formControlName="crearPool"
                [attr.aria-label]="row.controls.rolAcceso.value + ' crearPool'"
              />
            </td>
            <td>
              <input
                type="checkbox"
                formControlName="editarPool"
                [attr.aria-label]="row.controls.rolAcceso.value + ' editarPool'"
              />
            </td>
            <td>
              <input
                type="checkbox"
                formControlName="eliminarPool"
                [attr.aria-label]="row.controls.rolAcceso.value + ' eliminarPool'"
              />
            </td>
            <td>
              <input
                type="checkbox"
                formControlName="crearLane"
                [attr.aria-label]="row.controls.rolAcceso.value + ' crearLane'"
              />
            </td>
            <td>
              <input
                type="checkbox"
                formControlName="editarLane"
                [attr.aria-label]="row.controls.rolAcceso.value + ' editarLane'"
              />
            </td>
            <td>
              <input
                type="checkbox"
                formControlName="eliminarLane"
                [attr.aria-label]="row.controls.rolAcceso.value + ' eliminarLane'"
              />
            </td>
            <td>
              <button type="button" (click)="guardar(i)" [disabled]="saving() !== null">
                Guardar
              </button>
            </td>
          </tr>
        }
      </tbody>
    </table>
  </div>
</form>
```

### 17. `src/app/components/permiso-estructura/permiso-estructura.component.spec.ts`

**Propósito y qué hace:** Pruebas de permiso-estructura.component: muestra seis checkboxes y envía los cambios sin rolAcceso en body; permite reintento al fallar actualización.

**Por qué así:** Comprueba peticiones, estado visible o navegación usando TestBed y respuestas HTTP controladas; no usa la VM. Las dependencias se registran como en la aplicación.

**Pregunta probable:** ¿Por qué estas pruebas? Protegen estos comportamientos concretos y detectan regresiones. No comprueban disponibilidad de la VM ni reemplazan pruebas entre frontend y backend reales.

```typescript
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { PermisoEstructuraComponent } from './permiso-estructura.component';
describe('PermisoEstructuraComponent', () => {
  const permiso = {
    rolAcceso: 'EDITOR',
    crearPool: true,
    editarPool: true,
    eliminarPool: false,
    crearLane: true,
    editarLane: true,
    eliminarLane: false
  };
  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [PermisoEstructuraComponent],
      providers: [provideHttpClient(), provideHttpClientTesting()]
    })
  );
  afterEach(() => TestBed.inject(HttpTestingController).verify());
  it('muestra seis checkboxes y envía los cambios sin rolAcceso en body', () => {
    const f = TestBed.createComponent(PermisoEstructuraComponent);
    f.detectChanges();
    const http = TestBed.inject(HttpTestingController);
    http.expectOne('/api/v1/permisos-estructura').flush([permiso]);
    f.detectChanges();
    expect(f.nativeElement.querySelectorAll('input[type="checkbox"]').length).toBe(6);
    f.componentInstance.rows.at(0).controls.crearPool.setValue(false);
    f.componentInstance.guardar(0);
    const req = http.expectOne('/api/v1/permisos-estructura/EDITOR');
    expect(req.request.body.crearPool).toBeFalse();
    expect(req.request.body.rolAcceso).toBeUndefined();
    req.flush({ ...permiso, crearPool: false });
    expect(f.componentInstance.message()).toBe('Permisos guardados');
  });
  it('permite reintento al fallar actualización', () => {
    const f = TestBed.createComponent(PermisoEstructuraComponent);
    f.detectChanges();
    const http = TestBed.inject(HttpTestingController);
    http.expectOne('/api/v1/permisos-estructura').flush([permiso]);
    f.componentInstance.guardar(0);
    http
      .expectOne('/api/v1/permisos-estructura/EDITOR')
      .flush({ detail: 'Sin permiso' }, { status: 403, statusText: 'Forbidden' });
    expect(f.componentInstance.saving()).toBeNull();
    expect(f.componentInstance.message()).toBe('Sin permiso');
  });
});
```

### 18. `src/app/components/permiso-estructura/permiso-estructura.component.ts`

**Propósito y qué hace:** Muestra una fila por rol de acceso, seis casillas y guardado individual.

**Por qué así:** FormArray contiene grupos de campos, uno por fila recibida. Se envían booleanos reales; el rol se separa del body. Se usa la respuesta del servidor como configuración guardada.

**Pregunta probable:** ¿Qué es FormArray? Una colección de formularios del mismo tipo, útil cuando el número de filas se conoce al recibir la respuesta. ReturnType obtiene en TypeScript el tipo de grupo que devuelve fila(); no ejecuta nada adicional.

```typescript
import { Component, inject, signal } from '@angular/core';
import { FormArray, FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { PermisoEstructuraService } from '../../services/permiso-estructura.service';

@Component({
  selector: 'app-permiso-estructura',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './permiso-estructura.component.html'
})
export class PermisoEstructuraComponent {
  private readonly service = inject(PermisoEstructuraService);
  private readonly fb = inject(FormBuilder);
  readonly rows = new FormArray<ReturnType<PermisoEstructuraComponent['fila']>>([]);
  readonly form = this.fb.group({ permisos: this.rows });
  readonly loading = signal(false);
  readonly saving = signal<number | null>(null);
  readonly message = signal('');
  fila() {
    return this.fb.nonNullable.group({
      rolAcceso: [''],
      crearPool: [false],
      editarPool: [false],
      eliminarPool: [false],
      crearLane: [false],
      editarLane: [false],
      eliminarLane: [false]
    });
  }
  ngOnInit(): void {
    this.cargar();
  }
  cargar(): void {
    this.loading.set(true);
    this.message.set('');
    this.service.listar().subscribe({
      next: (permisos) => {
        this.rows.clear();
        for (const permiso of permisos) {
          const row = this.fila();
          row.patchValue(permiso);
          this.rows.push(row);
        }
        this.loading.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.loading.set(false);
        this.message.set(err.error?.detail ?? 'No fue posible cargar los permisos');
      }
    });
  }
  guardar(index: number): void {
    if (this.saving() !== null) return;
    const { rolAcceso, ...request } = this.rows.at(index).getRawValue();
    this.saving.set(index);
    this.message.set('');
    this.service.actualizar(rolAcceso, request).subscribe({
      next: (permiso) => {
        this.rows.at(index).patchValue(permiso);
        this.saving.set(null);
        this.message.set('Permisos guardados');
      },
      error: (err: HttpErrorResponse) => {
        this.saving.set(null);
        this.message.set(err.error?.detail ?? 'No fue posible guardar los permisos');
      }
    });
  }
}
```

### 19. `src/app/components/proceso-compartido-detalle/proceso-compartido-detalle.component.html`

**Propósito y qué hace:** Plantilla de la pantalla: Muestra datos generales, pools, lanes, actividades, gateways, eventos, arcos y mensajes.

**Por qué así:** Se separa el HTML de la clase para leer y explicar la vista. Usa controles, mensajes y acciones del componente. Es una vista de lectura con tablas simples, sin editor gráfico ni formulario. Recargar borra el detalle viejo; un acceso revocado se informa con el error real del backend.

**Pregunta probable:** ¿Se garantiza solo lectura quitando botones? Los botones reflejan la restricción, pero la garantía depende de las reglas del backend y su comprobación de empresa propietaria.

```html
<a routerLink="/procesos-compartidos">Volver a compartidos</a>
@if (message()) {
  <p role="alert">{{ message() }}</p>
}
<button type="button" (click)="cargar()" [disabled]="loading()">Actualizar</button>
@if (loading()) {
  <p>Cargando...</p>
}
@if (detalle(); as d) {
  <h1>{{ d.proceso.nombre }}</h1>
  <p>Empresa propietaria: {{ d.empresaPropietaria }}. Vista de solo lectura.</p>
  <dl>
    <dt>ID</dt>
    <dd>{{ d.proceso.id }}</dd>
    <dt>Descripción</dt>
    <dd>{{ d.proceso.descripcion }}</dd>
    <dt>Categoría</dt>
    <dd>{{ d.proceso.categoria }}</dd>
    <dt>Estado</dt>
    <dd>{{ d.proceso.estado }}</dd>
    <dt>Activo</dt>
    <dd>{{ d.proceso.activo }}</dd>
    <dt>Creación</dt>
    <dd>{{ d.proceso.fechaCreacion }}</dd>
    <dt>Modificación</dt>
    <dd>{{ d.proceso.fechaModificacion }}</dd>
  </dl>
  <section>
    <h2>Pools</h2>
    <table>
      <thead>
        <tr>
          <th>id</th>
          <th>nombre</th>
          <th>tipoParticipante</th>
          <th>cajaNegra</th>
          <th>orden</th>
          <th>procesoId</th>
        </tr>
      </thead>
      <tbody>
        @for (item of d.pools; track item.id) {
          <tr>
            <td>{{ item.id }}</td>
            <td>{{ item.nombre }}</td>
            <td>{{ item.tipoParticipante }}</td>
            <td>{{ item.cajaNegra }}</td>
            <td>{{ item.orden }}</td>
            <td>{{ item.procesoId }}</td>
          </tr>
        } @empty {
          <tr>
            <td colspan="6">Sin registros</td>
          </tr>
        }
      </tbody>
    </table>
  </section>
  <section>
    <h2>Lanes</h2>
    <table>
      <thead>
        <tr>
          <th>id</th>
          <th>nombre</th>
          <th>orden</th>
          <th>poolId</th>
          <th>rolProcesoId</th>
          <th>Rol de proceso</th>
        </tr>
      </thead>
      <tbody>
        @for (item of d.lanes; track item.id) {
          <tr>
            <td>{{ item.id }}</td>
            <td>{{ item.nombre }}</td>
            <td>{{ item.orden }}</td>
            <td>{{ item.poolId }}</td>
            <td>{{ item.rolProcesoId }}</td>
            <td>{{ item.rolProcesoNombre }}</td>
          </tr>
        } @empty {
          <tr>
            <td colspan="5">Sin registros</td>
          </tr>
        }
      </tbody>
    </table>
  </section>
  <section>
    <h2>Actividades</h2>
    <table>
      <thead>
        <tr>
          <th>id</th>
          <th>nombre</th>
          <th>descripcion</th>
          <th>tipoActividad</th>
          <th>laneId</th>
          <th>posicionX</th>
          <th>posicionY</th>
        </tr>
      </thead>
      <tbody>
        @for (item of d.actividades; track item.id) {
          <tr>
            <td>{{ item.id }}</td>
            <td>{{ item.nombre }}</td>
            <td>{{ item.descripcion }}</td>
            <td>{{ item.tipoActividad }}</td>
            <td>{{ item.laneId }}</td>
            <td>{{ item.posicionX }}</td>
            <td>{{ item.posicionY }}</td>
          </tr>
        } @empty {
          <tr>
            <td colspan="7">Sin registros</td>
          </tr>
        }
      </tbody>
    </table>
  </section>
  <section>
    <h2>Gateways</h2>
    <table>
      <thead>
        <tr>
          <th>id</th>
          <th>nombre</th>
          <th>tipoGateway</th>
          <th>laneId</th>
          <th>posicionX</th>
          <th>posicionY</th>
        </tr>
      </thead>
      <tbody>
        @for (item of d.gateways; track item.id) {
          <tr>
            <td>{{ item.id }}</td>
            <td>{{ item.nombre }}</td>
            <td>{{ item.tipoGateway }}</td>
            <td>{{ item.laneId }}</td>
            <td>{{ item.posicionX }}</td>
            <td>{{ item.posicionY }}</td>
          </tr>
        } @empty {
          <tr>
            <td colspan="6">Sin registros</td>
          </tr>
        }
      </tbody>
    </table>
  </section>
  <section>
    <h2>Eventos de mensaje</h2>
    <table>
      <thead>
        <tr>
          <th>id</th>
          <th>nombre</th>
          <th>tipoEvento</th>
          <th>contenido</th>
          <th>claveCorrelacion</th>
          <th>laneId</th>
          <th>posicionX</th>
          <th>posicionY</th>
          <th>origenExterno</th>
        </tr>
      </thead>
      <tbody>
        @for (item of d.eventos; track item.id) {
          <tr>
            <td>{{ item.id }}</td>
            <td>{{ item.nombre }}</td>
            <td>{{ item.tipoEvento }}</td>
            <td>{{ item.contenido }}</td>
            <td>{{ item.claveCorrelacion }}</td>
            <td>{{ item.laneId }}</td>
            <td>{{ item.posicionX }}</td>
            <td>{{ item.posicionY }}</td>
            <td>{{ item.origenExterno }}</td>
          </tr>
        } @empty {
          <tr>
            <td colspan="9">Sin registros</td>
          </tr>
        }
      </tbody>
    </table>
  </section>
  <section>
    <h2>Arcos</h2>
    <table>
      <thead>
        <tr>
          <th>id</th>
          <th>etiqueta</th>
          <th>condicion</th>
          <th>origenId</th>
          <th>destinoId</th>
          <th>poolId</th>
        </tr>
      </thead>
      <tbody>
        @for (item of d.arcos; track item.id) {
          <tr>
            <td>{{ item.id }}</td>
            <td>{{ item.etiqueta }}</td>
            <td>{{ item.condicion }}</td>
            <td>{{ item.origenId }}</td>
            <td>{{ item.destinoId }}</td>
            <td>{{ item.poolId }}</td>
          </tr>
        } @empty {
          <tr>
            <td colspan="6">Sin registros</td>
          </tr>
        }
      </tbody>
    </table>
  </section>
  <section>
    <h2>Mensajes</h2>
    <table>
      <thead>
        <tr>
          <th>id</th>
          <th>nombre</th>
          <th>contenido</th>
          <th>poolOrigenId</th>
          <th>poolDestinoId</th>
          <th>procesoId</th>
          <th>eventoThrowId</th>
          <th>eventoCatchId</th>
          <th>claveCorrelacion</th>
          <th>tipoDestinoExterno</th>
          <th>destinoExterno</th>
          <th>politicaFalloNotificacion</th>
          <th>actividadErrorId</th>
          <th>politicaSinCaso</th>
          <th>sinReceptor</th>
        </tr>
      </thead>
      <tbody>
        @for (item of d.mensajes; track item.id) {
          <tr>
            <td>{{ item.id }}</td>
            <td>{{ item.nombre }}</td>
            <td>{{ item.contenido }}</td>
            <td>{{ item.poolOrigenId }}</td>
            <td>{{ item.poolDestinoId }}</td>
            <td>{{ item.procesoId }}</td>
            <td>{{ item.eventoThrowId }}</td>
            <td>{{ item.eventoCatchId }}</td>
            <td>{{ item.claveCorrelacion }}</td>
            <td>{{ item.tipoDestinoExterno }}</td>
            <td>{{ item.destinoExterno }}</td>
            <td>{{ item.politicaFalloNotificacion }}</td>
            <td>{{ item.actividadErrorId }}</td>
            <td>{{ item.politicaSinCaso }}</td>
            <td>{{ item.sinReceptor }}</td>
          </tr>
        } @empty {
          <tr>
            <td colspan="15">Sin registros</td>
          </tr>
        }
      </tbody>
    </table>
  </section>
}
```

### 20. `src/app/components/proceso-compartido-detalle/proceso-compartido-detalle.component.spec.ts`

**Propósito y qué hace:** Pruebas de proceso-compartido-detalle.component: muestra todas las colecciones sin formularios ni acciones de escritura; borra detalle y muestra revocación al recargar; recarga al cambiar el ID sin recrear la pantalla.

**Por qué así:** Comprueba peticiones, estado visible o navegación usando TestBed y respuestas HTTP controladas; no usa la VM. Las dependencias se registran como en la aplicación.

**Pregunta probable:** ¿Por qué estas pruebas? Protegen estos comportamientos concretos y detectan regresiones. No comprueban disponibilidad de la VM ni reemplazan pruebas entre frontend y backend reales.

```typescript
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { ProcesoCompartidoDetalleComponent } from './proceso-compartido-detalle.component';
import { detalleCompartido } from '../../testing/compartidos.fixture';
describe('ProcesoCompartidoDetalleComponent', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [ProcesoCompartidoDetalleComponent],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()]
    })
  );
  afterEach(() => TestBed.inject(HttpTestingController).verify());
  it('muestra todas las colecciones sin formularios ni acciones de escritura', () => {
    const f = TestBed.createComponent(ProcesoCompartidoDetalleComponent);
    f.componentRef.setInput('id', '10');
    f.detectChanges();
    TestBed.inject(HttpTestingController)
      .expectOne('/api/v1/procesos-compartidos/10')
      .flush(detalleCompartido);
    f.detectChanges();
    for (const text of [
      'Compra',
      'Pool Beta',
      'Lane ventas',
      'Cotizar',
      'Aprobación',
      'Solicitud',
      'Sí aprobado',
      'Avisar'
    ])
      expect(f.nativeElement.textContent).toContain(text);
    expect(f.nativeElement.querySelectorAll('form,input,textarea').length).toBe(0);
    expect(f.nativeElement.querySelectorAll('button').length).toBe(1);
  });
  it('borra detalle y muestra revocación al recargar', () => {
    const f = TestBed.createComponent(ProcesoCompartidoDetalleComponent);
    f.componentRef.setInput('id', '10');
    f.detectChanges();
    const http = TestBed.inject(HttpTestingController);
    http.expectOne('/api/v1/procesos-compartidos/10').flush(detalleCompartido);
    f.componentInstance.cargar();
    http
      .expectOne('/api/v1/procesos-compartidos/10')
      .flush({ detail: 'Acceso revocado' }, { status: 404, statusText: 'Not Found' });
    f.detectChanges();
    expect(f.componentInstance.detalle()).toBeNull();
    expect(f.nativeElement.textContent).toContain('Acceso revocado');
  });
  it('recarga al cambiar el ID sin recrear la pantalla', () => {
    const f = TestBed.createComponent(ProcesoCompartidoDetalleComponent);
    f.componentRef.setInput('id', '9');
    f.detectChanges();
    const http = TestBed.inject(HttpTestingController);
    http.expectOne('/api/v1/procesos-compartidos/9').flush(detalleCompartido);
    f.componentRef.setInput('id', '12');
    f.detectChanges();
    const req = http.expectOne('/api/v1/procesos-compartidos/12');
    req.flush(detalleCompartido);
    expect(f.componentInstance.id()).toBe('12');
  });
});
```

### 21. `src/app/components/proceso-compartido-detalle/proceso-compartido-detalle.component.ts`

**Propósito y qué hace:** Muestra datos generales, pools, lanes, actividades, gateways, eventos, arcos y mensajes.

**Por qué así:** Es una vista de lectura con tablas simples, sin editor gráfico ni formulario. Recargar borra el detalle viejo; un acceso revocado se informa con el error real del backend.

**Pregunta probable:** ¿Se garantiza solo lectura quitando botones? Los botones reflejan la restricción, pero la garantía depende de las reglas del backend y su comprobación de empresa propietaria.

```typescript
import { Subscription } from 'rxjs';
import { Component, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { ProcesoCompartidoService } from '../../services/proceso-compartido.service';
import { ProcesoCompartidoDetalleResponse } from '../../models/proceso-compartido.model';

@Component({
  selector: 'app-proceso-compartido-detalle',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './proceso-compartido-detalle.component.html'
})
export class ProcesoCompartidoDetalleComponent {
  private readonly service = inject(ProcesoCompartidoService);
  readonly id = input.required<string>();
  readonly detalle = signal<ProcesoCompartidoDetalleResponse | null>(null);
  readonly loading = signal(false);
  readonly message = signal('');
  private carga?: Subscription;
  ngOnDestroy(): void {
    this.carga?.unsubscribe();
  }
  ngOnChanges(): void {
    this.cargar();
  }
  cargar(): void {
    this.carga?.unsubscribe();
    this.detalle.set(null);
    this.loading.set(true);
    this.message.set('');
    this.carga = this.service.verDetalle(Number(this.id())).subscribe({
      next: (data) => {
        this.detalle.set(data);
        this.loading.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.loading.set(false);
        this.message.set(err.error?.detail ?? 'No fue posible acceder al proceso compartido');
      }
    });
  }
}
```

### 22. `src/app/components/procesos-compartidos-list/procesos-compartidos-list.component.html`

**Propósito y qué hace:** Plantilla de la pantalla: Lista procesos recibidos con propietario y enlace a detalle.

**Por qué así:** Se separa el HTML de la clase para leer y explicar la vista. Usa controles, mensajes y acciones del componente. El enlace usa procesoId. Solo consulta datos que el backend permite a la empresa autenticada.

**Pregunta probable:** ¿Cómo sabemos cuáles son de nuestra empresa? El endpoint utiliza principal.empresaId(); no hace falta enviar el ID de empresa en la URL.

```html
<h1>Procesos compartidos conmigo</h1>
@if (message()) {
  <p role="alert">{{ message() }}</p>
}
<button type="button" (click)="cargar()" [disabled]="loading()">Actualizar</button>
@if (loading()) {
  <p>Cargando...</p>
}
<table>
  <thead>
    <tr>
      <th>Proceso</th>
      <th>Empresa propietaria</th>
      <th>Solo lectura</th>
    </tr>
  </thead>
  <tbody>
    @for (item of items(); track item.id) {
      <tr>
        <td>
          <a [routerLink]="['/procesos-compartidos', item.procesoId]">{{ item.procesoNombre }}</a>
        </td>
        <td>{{ item.empresaPropietaria }}</td>
        <td>{{ item.soloLectura ? 'Sí' : 'No' }}</td>
      </tr>
    } @empty {
      <tr>
        <td colspan="3">No hay procesos compartidos contigo.</td>
      </tr>
    }
  </tbody>
</table>
```

### 23. `src/app/components/procesos-compartidos-list/procesos-compartidos-list.component.spec.ts`

**Propósito y qué hace:** Pruebas de procesos-compartidos-list.component: enlaza al procesoId recibido; muestra errores y termina carga.

**Por qué así:** Comprueba peticiones, estado visible o navegación usando TestBed y respuestas HTTP controladas; no usa la VM. Las dependencias se registran como en la aplicación.

**Pregunta probable:** ¿Por qué estas pruebas? Protegen estos comportamientos concretos y detectan regresiones. No comprueban disponibilidad de la VM ni reemplazan pruebas entre frontend y backend reales.

```typescript
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { ProcesosCompartidosListComponent } from './procesos-compartidos-list.component';
import { compartido } from '../../testing/compartidos.fixture';
describe('ProcesosCompartidosListComponent', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [ProcesosCompartidosListComponent],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()]
    })
  );
  afterEach(() => TestBed.inject(HttpTestingController).verify());
  it('enlaza al procesoId recibido', () => {
    const f = TestBed.createComponent(ProcesosCompartidosListComponent);
    f.detectChanges();
    TestBed.inject(HttpTestingController)
      .expectOne('/api/v1/procesos-compartidos')
      .flush([compartido]);
    f.detectChanges();
    expect(f.nativeElement.textContent).toContain('Compra');
    expect(f.nativeElement.querySelector('a').getAttribute('href')).toBe(
      '/procesos-compartidos/10'
    );
  });
  it('muestra errores y termina carga', () => {
    const f = TestBed.createComponent(ProcesosCompartidosListComponent);
    f.detectChanges();
    TestBed.inject(HttpTestingController)
      .expectOne('/api/v1/procesos-compartidos')
      .flush({ detail: 'Sin acceso' }, { status: 403, statusText: 'Forbidden' });
    f.detectChanges();
    expect(f.nativeElement.textContent).toContain('Sin acceso');
    expect(f.componentInstance.loading()).toBeFalse();
  });
});
```

### 24. `src/app/components/procesos-compartidos-list/procesos-compartidos-list.component.ts`

**Propósito y qué hace:** Lista procesos recibidos con propietario y enlace a detalle.

**Por qué así:** El enlace usa procesoId. Solo consulta datos que el backend permite a la empresa autenticada.

**Pregunta probable:** ¿Cómo sabemos cuáles son de nuestra empresa? El endpoint utiliza principal.empresaId(); no hace falta enviar el ID de empresa en la URL.

```typescript
import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { ProcesoCompartidoService } from '../../services/proceso-compartido.service';
import { ProcesoCompartidoResponse } from '../../models/proceso-compartido.model';

@Component({
  selector: 'app-procesos-compartidos-list',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './procesos-compartidos-list.component.html'
})
export class ProcesosCompartidosListComponent {
  private readonly service = inject(ProcesoCompartidoService);
  readonly items = signal<ProcesoCompartidoResponse[]>([]);
  readonly loading = signal(false);
  readonly message = signal('');
  ngOnInit(): void {
    this.cargar();
  }
  cargar(): void {
    this.loading.set(true);
    this.message.set('');
    this.service.listarCompartidosConmigo().subscribe({
      next: (data) => {
        this.items.set(data);
        this.loading.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.loading.set(false);
        this.message.set(err.error?.detail ?? 'No fue posible cargar los procesos recibidos');
      }
    });
  }
}
```

### 25. `src/app/components/registro-empresa/registro-empresa.component.html`

**Propósito y qué hace:** Plantilla de la pantalla: Captura datos de empresa y administrador, valida y registra con EmpresaService.

**Por qué así:** Se separa el HTML de la clase para leer y explicar la vista. Usa controles, mensajes y acciones del componente. FormBuilder.nonNullable evita valores null al resetear; Validators.required/email/minLength replican la validación de entrada del backend.

**Pregunta probable:** ¿Basta con validar aquí? No. La validación del navegador mejora la experiencia; el backend valida otra vez y aplica unicidad y reglas de negocio.

```html
<h1>Registrar empresa</h1>
@if (message()) {
  <p role="alert">{{ message() }}</p>
}
<form [formGroup]="form" (ngSubmit)="submit()">
  <label>Nombre de la empresa<input type="text" formControlName="nombreEmpresa" /></label>
  @if (form.controls.nombreEmpresa.touched && form.controls.nombreEmpresa.invalid) {
    <small>Revisa este campo: es obligatorio y debe tener un formato válido.</small>
  }
  <label>NIT<input type="text" formControlName="nit" /></label>
  @if (form.controls.nit.touched && form.controls.nit.invalid) {
    <small>Revisa este campo: es obligatorio y debe tener un formato válido.</small>
  }
  <label>Correo de contacto<input type="email" formControlName="correoContacto" /></label>
  @if (form.controls.correoContacto.touched && form.controls.correoContacto.invalid) {
    <small>Revisa este campo: es obligatorio y debe tener un formato válido.</small>
  }
  <label>Nombre del administrador<input type="text" formControlName="nombreAdmin" /></label>
  @if (form.controls.nombreAdmin.touched && form.controls.nombreAdmin.invalid) {
    <small>Revisa este campo: es obligatorio y debe tener un formato válido.</small>
  }
  <label>Correo del administrador<input type="email" formControlName="emailAdmin" /></label>
  @if (form.controls.emailAdmin.touched && form.controls.emailAdmin.invalid) {
    <small>Revisa este campo: es obligatorio y debe tener un formato válido.</small>
  }
  <label
    >Contraseña (mínimo 6 caracteres)<input type="password" formControlName="passwordAdmin"
  /></label>
  @if (form.controls.passwordAdmin.touched && form.controls.passwordAdmin.invalid) {
    <small>Revisa este campo: es obligatorio y debe tener un formato válido.</small>
  }
  <button type="submit" [disabled]="saving()">{{ saving() ? 'Guardando...' : 'Registrar' }}</button>
</form>
<a routerLink="/login">Volver a iniciar sesión</a>
```

### 26. `src/app/components/registro-empresa/registro-empresa.component.spec.ts`

**Propósito y qué hace:** Pruebas de registro-empresa.component: valida email y contraseña corta sin enviar HTTP; registra con body exacto y navega a login; muestra conflicto y desbloquea guardar.

**Por qué así:** Comprueba peticiones, estado visible o navegación usando TestBed y respuestas HTTP controladas; no usa la VM. Las dependencias se registran como en la aplicación.

**Pregunta probable:** ¿Por qué estas pruebas? Protegen estos comportamientos concretos y detectan regresiones. No comprueban disponibilidad de la VM ni reemplazan pruebas entre frontend y backend reales.

```typescript
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { RegistroEmpresaComponent } from './registro-empresa.component';

describe('RegistroEmpresaComponent y EmpresaService', () => {
  const body = {
    nombreEmpresa: 'Beta',
    nit: '123',
    correoContacto: 'beta@beta.co',
    nombreAdmin: 'Sam',
    emailAdmin: 'sam@beta.co',
    passwordAdmin: '123456'
  };
  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [RegistroEmpresaComponent],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()]
    })
  );
  afterEach(() => TestBed.inject(HttpTestingController).verify());
  it('valida email y contraseña corta sin enviar HTTP', () => {
    const f = TestBed.createComponent(RegistroEmpresaComponent);
    f.componentInstance.form.setValue({ ...body, emailAdmin: 'mal', passwordAdmin: '123' });
    f.componentInstance.submit();
    expect(f.componentInstance.form.invalid).toBeTrue();
    TestBed.inject(HttpTestingController).expectNone('/api/v1/empresas');
  });
  it('registra con body exacto y navega a login', () => {
    const f = TestBed.createComponent(RegistroEmpresaComponent);
    const nav = spyOn(TestBed.inject(Router), 'navigate').and.resolveTo(true);
    f.componentInstance.form.setValue(body);
    f.componentInstance.submit();
    f.componentInstance.submit();
    const req = TestBed.inject(HttpTestingController).expectOne('/api/v1/empresas');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(body);
    req.flush({ id: 1 });
    expect(nav).toHaveBeenCalledWith(['/login']);
  });
  it('muestra conflicto y desbloquea guardar', () => {
    const f = TestBed.createComponent(RegistroEmpresaComponent);
    f.componentInstance.form.setValue(body);
    f.componentInstance.submit();
    TestBed.inject(HttpTestingController)
      .expectOne('/api/v1/empresas')
      .flush({ detail: 'NIT registrado' }, { status: 409, statusText: 'Conflict' });
    f.detectChanges();
    expect(f.nativeElement.textContent).toContain('NIT registrado');
    expect(f.componentInstance.saving()).toBeFalse();
  });
});
```

### 27. `src/app/components/registro-empresa/registro-empresa.component.ts`

**Propósito y qué hace:** Captura datos de empresa y administrador, valida y registra con EmpresaService.

**Por qué así:** FormBuilder.nonNullable evita valores null al resetear; Validators.required/email/minLength replican la validación de entrada del backend.

**Pregunta probable:** ¿Basta con validar aquí? No. La validación del navegador mejora la experiencia; el backend valida otra vez y aplica unicidad y reglas de negocio.

```typescript
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { EmpresaService } from '../../services/empresa.service';

@Component({
  selector: 'app-registro-empresa',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './registro-empresa.component.html'
})
export class RegistroEmpresaComponent {
  private readonly fb = inject(FormBuilder);
  private readonly empresas = inject(EmpresaService);
  private readonly router = inject(Router);
  readonly saving = signal(false);
  readonly message = signal('');
  readonly form = this.fb.nonNullable.group({
    nombreEmpresa: ['', Validators.required],
    nit: ['', Validators.required],
    correoContacto: ['', [Validators.required, Validators.email]],
    nombreAdmin: ['', Validators.required],
    emailAdmin: ['', [Validators.required, Validators.email]],
    passwordAdmin: ['', [Validators.required, Validators.minLength(6)]]
  });

  submit(): void {
    if (this.saving()) return;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.saving.set(true);
    this.message.set('');
    this.empresas.registrar(this.form.getRawValue()).subscribe({
      next: () => {
        this.saving.set(false);
        this.router.navigate(['/login']);
      },
      error: (err: HttpErrorResponse) => {
        this.saving.set(false);
        this.message.set(err.error?.detail ?? 'No fue posible registrar la empresa');
      }
    });
  }
}
```

### 28. `src/app/components/rol-proceso-form/rol-proceso-form.component.html`

**Propósito y qué hace:** Plantilla de la pantalla: Crea y edita roles, carga datos al cambiar id y permite reintentar una carga fallida.

**Por qué así:** Se separa el HTML de la clase para leer y explicar la vista. Usa controles, mensajes y acciones del componente. Una pantalla sirve para crear y editar. loaded impide guardar un rol cuyo detalle no pudo cargarse. ngOnChanges atiende reutilización de la ruta; cancelar la carga anterior evita respuestas atrasadas.

**Pregunta probable:** ¿Por qué ngOnChanges en lugar de solo ngOnInit? Angular puede conservar el componente al cambiar /roles/7/editar por /roles/12/editar; cambia el input pero no repite ngOnInit.

```html
<h1>{{ id() ? 'Editar' : 'Crear' }} rol de proceso</h1>
@if (message()) {
  <p role="alert">{{ message() }}</p>
}
@if (id() && !loaded()) {
  <button type="button" (click)="cargar()" [disabled]="loading()">Reintentar carga</button>
}
<form [formGroup]="form" (ngSubmit)="submit()">
  <label>Nombre <input formControlName="nombre" /></label>
  @if (form.controls.nombre.touched && form.controls.nombre.invalid) {
    <small>El nombre es obligatorio</small>
  }
  <label>Descripción <textarea formControlName="descripcion"></textarea></label>
  <button type="submit" [disabled]="saving() || loading() || (!!id() && !loaded())">Guardar</button>
</form>
<a routerLink="/roles">Volver</a>
```

### 29. `src/app/components/rol-proceso-form/rol-proceso-form.component.spec.ts`

**Propósito y qué hace:** Pruebas de rol-proceso-form.component: no envía nombre vacío; crea un rol y regresa al listado; carga y edita el rol de la ruta; permite reintentar carga fallida sin habilitar edición de datos no cargados; recarga al cambiar el ID sin recrear la pantalla.

**Por qué así:** Comprueba peticiones, estado visible o navegación usando TestBed y respuestas HTTP controladas; no usa la VM. Las dependencias se registran como en la aplicación.

**Pregunta probable:** ¿Por qué estas pruebas? Protegen estos comportamientos concretos y detectan regresiones. No comprueban disponibilidad de la VM ni reemplazan pruebas entre frontend y backend reales.

```typescript
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { RolProcesoFormComponent } from './rol-proceso-form.component';
describe('RolProcesoFormComponent', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [RolProcesoFormComponent],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()]
    })
  );
  afterEach(() => TestBed.inject(HttpTestingController).verify());
  it('no envía nombre vacío', () => {
    const f = TestBed.createComponent(RolProcesoFormComponent);
    f.componentInstance.submit();
    expect(f.componentInstance.form.invalid).toBeTrue();
    TestBed.inject(HttpTestingController).expectNone('/api/v1/roles');
  });
  it('crea un rol y regresa al listado', () => {
    const f = TestBed.createComponent(RolProcesoFormComponent);
    const nav = spyOn(TestBed.inject(Router), 'navigate').and.resolveTo(true);
    f.componentInstance.form.setValue({ nombre: 'Ventas', descripcion: 'Atención' });
    f.componentInstance.submit();
    TestBed.inject(HttpTestingController).expectOne('/api/v1/roles').flush({ id: 1 });
    expect(nav).toHaveBeenCalledWith(['/roles']);
  });
  it('carga y edita el rol de la ruta', () => {
    const f = TestBed.createComponent(RolProcesoFormComponent);
    f.componentRef.setInput('id', '7');
    f.detectChanges();
    const http = TestBed.inject(HttpTestingController);
    http.expectOne('/api/v1/roles/7').flush({ id: 7, nombre: 'Ventas', descripcion: null });
    expect(f.componentInstance.form.controls.nombre.value).toBe('Ventas');
    f.componentInstance.submit();
    const req = http.expectOne('/api/v1/roles/7');
    expect(req.request.method).toBe('PUT');
    req.flush({ detail: 'Nombre repetido' }, { status: 409, statusText: 'Conflict' });
    expect(f.componentInstance.message()).toBe('Nombre repetido');
    expect(f.componentInstance.saving()).toBeFalse();
  });
  it('permite reintentar carga fallida sin habilitar edición de datos no cargados', () => {
    const f = TestBed.createComponent(RolProcesoFormComponent);
    f.componentRef.setInput('id', '7');
    f.detectChanges();
    const http = TestBed.inject(HttpTestingController);
    http
      .expectOne('/api/v1/roles/7')
      .flush({ detail: 'Sin conexión' }, { status: 500, statusText: 'Error' });
    expect(f.componentInstance.loading()).toBeFalse();
    f.componentInstance.submit();
    http.expectNone('/api/v1/roles/7');
    f.componentInstance.cargar();
    http.expectOne('/api/v1/roles/7').flush({ id: 7, nombre: 'Ventas', descripcion: null });
    expect(f.componentInstance.form.controls.nombre.value).toBe('Ventas');
  });
  it('recarga al cambiar el ID sin recrear la pantalla', () => {
    const f = TestBed.createComponent(RolProcesoFormComponent);
    f.componentRef.setInput('id', '9');
    f.detectChanges();
    const http = TestBed.inject(HttpTestingController);
    http.expectOne('/api/v1/roles/9').flush({ id: 9, nombre: 'Ventas', descripcion: null });
    f.componentRef.setInput('id', '12');
    f.detectChanges();
    const req = http.expectOne('/api/v1/roles/12');
    req.flush({ id: 12, nombre: 'Compras', descripcion: null });
    expect(f.componentInstance.id()).toBe('12');
  });
});
```

### 30. `src/app/components/rol-proceso-form/rol-proceso-form.component.ts`

**Propósito y qué hace:** Crea y edita roles, carga datos al cambiar id y permite reintentar una carga fallida.

**Por qué así:** Una pantalla sirve para crear y editar. loaded impide guardar un rol cuyo detalle no pudo cargarse. ngOnChanges atiende reutilización de la ruta; cancelar la carga anterior evita respuestas atrasadas.

**Pregunta probable:** ¿Por qué ngOnChanges en lugar de solo ngOnInit? Angular puede conservar el componente al cambiar /roles/7/editar por /roles/12/editar; cambia el input pero no repite ngOnInit.

```typescript
import { Subscription } from 'rxjs';
import { Component, inject, input, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { RolProcesoService } from '../../services/rol-proceso.service';

@Component({
  selector: 'app-rol-proceso-form',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './rol-proceso-form.component.html'
})
export class RolProcesoFormComponent {
  private readonly service = inject(RolProcesoService);
  private readonly router = inject(Router);
  readonly id = input<string>();
  readonly saving = signal(false);
  readonly loading = signal(false);
  readonly loaded = signal(false);
  readonly message = signal('');
  readonly form = inject(FormBuilder).nonNullable.group({
    nombre: ['', Validators.required],
    descripcion: ['']
  });
  private carga?: Subscription;
  ngOnDestroy(): void {
    this.carga?.unsubscribe();
  }
  ngOnChanges(): void {
    this.cargar();
  }
  cargar(): void {
    this.carga?.unsubscribe();
    if (!this.id()) return;
    this.loading.set(true);
    this.loaded.set(false);
    this.message.set('');
    this.carga = this.service.obtener(Number(this.id())).subscribe({
      next: (rol) => {
        this.form.patchValue({ nombre: rol.nombre, descripcion: rol.descripcion ?? '' });
        this.loading.set(false);
        this.loaded.set(true);
      },
      error: (err: HttpErrorResponse) => {
        this.loading.set(false);
        this.message.set(err.error?.detail ?? 'No fue posible cargar el rol');
      }
    });
  }
  submit(): void {
    if (this.saving() || this.loading() || (this.id() && !this.loaded())) return;
    if (this.form.invalid || !this.form.controls.nombre.value.trim()) {
      this.form.markAllAsTouched();
      this.message.set('El nombre es obligatorio');
      return;
    }
    const body = this.form.getRawValue();
    body.nombre = body.nombre.trim();
    this.saving.set(true);
    this.message.set('');
    const request = this.id()
      ? this.service.editar(Number(this.id()), body)
      : this.service.crear(body);
    request.subscribe({
      next: () => {
        this.saving.set(false);
        this.router.navigate(['/roles']);
      },
      error: (err: HttpErrorResponse) => {
        this.saving.set(false);
        this.message.set(err.error?.detail ?? 'No fue posible guardar el rol');
      }
    });
  }
}
```

### 31. `src/app/components/rol-proceso-list/rol-proceso-list.component.html`

**Propósito y qué hace:** Plantilla de la pantalla: Busca roles con paginación y muestra nombre, descripción, uso y acciones.

**Por qué así:** Se separa el HTML de la clase para leer y explicar la vista. Usa controles, mensajes y acciones del componente. Se usa la consulta paginada del backend; enUso bloquea eliminar en la interfaz y el servidor rechaza igualmente un borrado inválido.

**Pregunta probable:** ¿Cómo calculamos cuántos procesos lo usan? Con procesos.length de la respuesta de consulta, sin inventar una propiedad del JSON.

```html
<h1>Roles de proceso</h1>
<a routerLink="/roles/nuevo">Crear rol</a>
<form [formGroup]="form" (ngSubmit)="buscar()">
  <label>Nombre <input formControlName="nombre" /></label>
  <button type="submit" [disabled]="loading()">Buscar</button>
</form>
@if (message()) {
  <p role="alert">{{ message() }}</p>
}
@if (loading()) {
  <p>Cargando...</p>
}
@if (page(); as resultado) {
  <table>
    <thead>
      <tr>
        <th>Nombre</th>
        <th>Descripción</th>
        <th>Procesos que lo usan</th>
        <th>En uso</th>
        <th>Acciones</th>
      </tr>
    </thead>
    <tbody>
      @for (rol of resultado.content; track rol.id) {
        <tr>
          <td>{{ rol.nombre }}</td>
          <td>{{ rol.descripcion }}</td>
          <td>{{ rol.procesos.length }}: {{ rol.procesos.join(', ') }}</td>
          <td>{{ rol.enUso ? 'Sí' : 'No' }}</td>
          <td>
            <a [routerLink]="['/roles', rol.id, 'editar']">Editar</a>
            <button
              type="button"
              (click)="eliminar(rol)"
              [disabled]="rol.enUso || deleting() !== null"
            >
              Eliminar
            </button>
          </td>
        </tr>
      } @empty {
        <tr>
          <td colspan="5">No hay roles para esta búsqueda.</td>
        </tr>
      }
    </tbody>
  </table>
  <button
    type="button"
    (click)="cargar(resultado.page - 1)"
    [disabled]="loading() || resultado.page === 0"
  >
    Anterior
  </button>
  <span
    >Página {{ resultado.totalPages ? resultado.page + 1 : 0 }} de {{ resultado.totalPages }}</span
  >
  <button
    type="button"
    (click)="cargar(resultado.page + 1)"
    [disabled]="loading() || resultado.page + 1 >= resultado.totalPages"
  >
    Siguiente
  </button>
}
```

### 32. `src/app/components/rol-proceso-list/rol-proceso-list.component.spec.ts`

**Propósito y qué hace:** Pruebas de rol-proceso-list.component: muestra uso y no permite eliminar rol en uso; busca desde página cero y muestra respuesta vacía; conserva mensaje de conflicto al eliminar.

**Por qué así:** Comprueba peticiones, estado visible o navegación usando TestBed y respuestas HTTP controladas; no usa la VM. Las dependencias se registran como en la aplicación.

**Pregunta probable:** ¿Por qué estas pruebas? Protegen estos comportamientos concretos y detectan regresiones. No comprueban disponibilidad de la VM ni reemplazan pruebas entre frontend y backend reales.

```typescript
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { RolProcesoListComponent } from './rol-proceso-list.component';
describe('RolProcesoListComponent', () => {
  const rol = {
    id: 1,
    nombre: 'Ventas',
    descripcion: 'Atención',
    procesos: ['Compra'],
    enUso: true
  };
  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [RolProcesoListComponent],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()]
    })
  );
  afterEach(() => TestBed.inject(HttpTestingController).verify());
  it('muestra uso y no permite eliminar rol en uso', () => {
    const f = TestBed.createComponent(RolProcesoListComponent);
    f.detectChanges();
    const http = TestBed.inject(HttpTestingController);
    http
      .expectOne((q) => q.url.endsWith('/roles/consulta'))
      .flush({ content: [rol], page: 0, size: 10, totalElements: 1, totalPages: 1 });
    f.detectChanges();
    expect(f.nativeElement.textContent).toContain('Compra');
    const buttons: Array<HTMLButtonElement> = Array.from(
      f.nativeElement.querySelectorAll('button')
    );
    expect(buttons.find((b) => b.textContent?.includes('Eliminar'))?.disabled).toBeTrue();
    f.componentInstance.eliminar(rol);
    http.expectNone('/api/v1/roles/1');
  });
  it('busca desde página cero y muestra respuesta vacía', () => {
    const f = TestBed.createComponent(RolProcesoListComponent);
    f.componentInstance.form.setValue({ nombre: 'Nuevo' });
    f.componentInstance.buscar();
    const req = TestBed.inject(HttpTestingController).expectOne((q) =>
      q.url.endsWith('/roles/consulta')
    );
    expect(req.request.params.get('pagina')).toBe('0');
    expect(req.request.params.get('nombre')).toBe('Nuevo');
    req.flush({ content: [], page: 0, size: 10, totalElements: 0, totalPages: 0 });
    expect(f.componentInstance.page()?.totalPages).toBe(0);
  });
  it('conserva mensaje de conflicto al eliminar', () => {
    spyOn(window, 'confirm').and.returnValue(true);
    const f = TestBed.createComponent(RolProcesoListComponent);
    f.componentInstance.eliminar({ ...rol, enUso: false });
    TestBed.inject(HttpTestingController)
      .expectOne('/api/v1/roles/1')
      .flush({ detail: 'Rol en uso' }, { status: 409, statusText: 'Conflict' });
    expect(f.componentInstance.message()).toBe('Rol en uso');
    expect(f.componentInstance.deleting()).toBeNull();
  });
});
```

### 33. `src/app/components/rol-proceso-list/rol-proceso-list.component.ts`

**Propósito y qué hace:** Busca roles con paginación y muestra nombre, descripción, uso y acciones.

**Por qué así:** Se usa la consulta paginada del backend; enUso bloquea eliminar en la interfaz y el servidor rechaza igualmente un borrado inválido.

**Pregunta probable:** ¿Cómo calculamos cuántos procesos lo usan? Con procesos.length de la respuesta de consulta, sin inventar una propiedad del JSON.

```typescript
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { RolProcesoService } from '../../services/rol-proceso.service';
import { PageResponse } from '../../models/page.model';
import { RolProcesoConsultaResponse } from '../../models/rol-proceso.model';

@Component({
  selector: 'app-rol-proceso-list',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './rol-proceso-list.component.html'
})
export class RolProcesoListComponent {
  private readonly service = inject(RolProcesoService);
  readonly form = inject(FormBuilder).nonNullable.group({ nombre: [''] });
  readonly page = signal<PageResponse<RolProcesoConsultaResponse> | null>(null);
  readonly loading = signal(false);
  readonly deleting = signal<number | null>(null);
  readonly message = signal('');
  private filtro = '';
  ngOnInit(): void {
    this.cargar();
  }
  buscar(): void {
    this.filtro = this.form.getRawValue().nombre.trim();
    this.cargar(0);
  }
  cargar(pagina = 0): void {
    this.loading.set(true);
    this.message.set('');
    this.service.buscar(this.filtro, pagina).subscribe({
      next: (page) => {
        this.page.set(page);
        this.loading.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.loading.set(false);
        this.message.set(err.error?.detail ?? 'No fue posible cargar los roles');
      }
    });
  }
  eliminar(rol: RolProcesoConsultaResponse): void {
    if (rol.enUso || this.deleting() !== null) return;
    if (!confirm(`¿Eliminar el rol ${rol.nombre}?`)) return;
    this.deleting.set(rol.id);
    this.service.eliminar(rol.id).subscribe({
      next: () => {
        this.deleting.set(null);
        this.cargar(0);
      },
      error: (err: HttpErrorResponse) => {
        this.deleting.set(null);
        this.message.set(err.error?.detail ?? 'No fue posible eliminar el rol');
      }
    });
  }
}
```

### 34. `src/app/guards/admin.guard.spec.ts`

**Propósito y qué hace:** Pruebas de admin.guard: admite administrador; rechaza editor; rechaza expirado.

**Por qué así:** Comprueba peticiones, estado visible o navegación usando TestBed y respuestas HTTP controladas; no usa la VM. Las dependencias se registran como en la aplicación.

**Pregunta probable:** ¿Por qué estas pruebas? Protegen estos comportamientos concretos y detectan regresiones. No comprueban disponibilidad de la VM ni reemplazan pruebas entre frontend y backend reales.

```typescript
import { TestBed } from '@angular/core/testing';
import { provideRouter, UrlTree } from '@angular/router';
import { adminGuard } from './admin.guard';
import { TokenService } from '../services/token.service';
describe('adminGuard', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
  });
  afterEach(() => localStorage.clear());
  function check(rol: string, exp = Date.now() / 1000 + 3600) {
    TestBed.inject(TokenService).setToken('h.' + btoa(JSON.stringify({ rol, exp })) + '.s');
    return TestBed.runInInjectionContext(() => adminGuard({} as never, {} as never));
  }
  it('admite administrador', () => expect(check('ADMINISTRADOR')).toBeTrue());
  it('rechaza editor', () =>
    expect((check('EDITOR') as UrlTree).toString()).toContain('sin-permiso'));
  it('rechaza expirado', () =>
    expect((check('ADMINISTRADOR', 1) as UrlTree).toString()).toBe('/login'));
});
```

### 35. `src/app/guards/admin.guard.ts`

**Propósito y qué hace:** Permite páginas administrativas si el JWT vigente declara ADMINISTRADOR.

**Por qué así:** Diferencia falta de sesión de falta de permisos: login para la primera, página de procesos con aviso para la segunda.

**Pregunta probable:** ¿Qué es UrlTree? Una representación de la URL a la que el router debe redirigir.

```typescript
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { TokenService } from '../services/token.service';

export const adminGuard: CanActivateFn = () => {
  const tokens = inject(TokenService);
  const router = inject(Router);
  if (!tokens.tieneSesion()) {
    tokens.removeToken();
    return router.createUrlTree(['/login']);
  }
  return (
    tokens.esAdministrador() ||
    router.createUrlTree(['/procesos'], {
      queryParams: { aviso: 'sin-permiso' }
    })
  );
};
```

### 36. `src/app/guards/auth.guard.spec.ts`

**Propósito y qué hace:** Pruebas de auth.guard: debe permitir acceso cuando hay token; debe redirigir a /login cuando no hay token.

**Por qué así:** Comprueba peticiones, estado visible o navegación usando TestBed y respuestas HTTP controladas; no usa la VM. Las dependencias se registran como en la aplicación.

**Pregunta probable:** ¿Por qué estas pruebas? Protegen estos comportamientos concretos y detectan regresiones. No comprueban disponibilidad de la VM ni reemplazan pruebas entre frontend y backend reales.

```typescript
import { TestBed } from '@angular/core/testing';
import { Router, UrlTree } from '@angular/router';
import { provideRouter } from '@angular/router';
import { authGuard } from './auth.guard';
import { TokenService } from '../services/token.service';

describe('authGuard', () => {
  let tokenService: TokenService;
  let router: Router;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideRouter([])]
    });
    tokenService = TestBed.inject(TokenService);
    router = TestBed.inject(Router);
  });

  afterEach(() => localStorage.clear());

  it('debe permitir acceso cuando hay token', () => {
    tokenService.setToken(
      'header.' +
        btoa(JSON.stringify({ exp: Math.floor(Date.now() / 1000) + 3600, rol: 'EDITOR' })) +
        '.firma'
    );

    const result = TestBed.runInInjectionContext(() => authGuard({} as any, {} as any));

    expect(result).toBeTrue();
  });

  it('debe redirigir a /login cuando no hay token', () => {
    const result = TestBed.runInInjectionContext(() => authGuard({} as any, {} as any));

    expect(result).toBeInstanceOf(UrlTree);
    expect((result as UrlTree).toString()).toBe('/login');
  });
});
```

### 37. `src/app/guards/auth.guard.ts`

**Propósito y qué hace:** Permite rutas privadas con JWT vigente según su vencimiento; en caso contrario elimina token y devuelve URL de login.

**Por qué así:** Evita mostrar módulos privados con sesión ausente o vencida. El servidor vuelve a validar firma, usuario y empresa.

**Pregunta probable:** ¿El guard demuestra que la firma es válida? No. Solo ayuda en la navegación; esa verificación criptográfica es del backend.

```typescript
import { CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { TokenService } from '../services/token.service';

export const authGuard: CanActivateFn = () => {
  const tokenService = inject(TokenService);
  const router = inject(Router);

  if (tokenService.tieneSesion()) {
    return true;
  }

  tokenService.removeToken();
  return router.createUrlTree(['/login']);
};
```

### 38. `src/app/interceptors/auth.interceptor.spec.ts`

**Propósito y qué hace:** Pruebas de auth.interceptor: debe agregar el header Authorization cuando hay token; no debe agregar el header cuando no hay token; no envía un token anterior al iniciar sesión o registrar empresa; no filtra el token a otra API.

**Por qué así:** Comprueba peticiones, estado visible o navegación usando TestBed y respuestas HTTP controladas; no usa la VM. Las dependencias se registran como en la aplicación.

**Pregunta probable:** ¿Por qué estas pruebas? Protegen estos comportamientos concretos y detectan regresiones. No comprueban disponibilidad de la VM ni reemplazan pruebas entre frontend y backend reales.

```typescript
import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { authInterceptor } from './auth.interceptor';
import { TokenService } from '../services/token.service';

describe('authInterceptor', () => {
  let http: HttpClient;
  let httpTesting: HttpTestingController;
  let tokenService: TokenService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting()
      ]
    });
    http = TestBed.inject(HttpClient);
    httpTesting = TestBed.inject(HttpTestingController);
    tokenService = TestBed.inject(TokenService);
  });

  afterEach(() => {
    httpTesting.verify();
    localStorage.clear();
  });

  it('debe agregar el header Authorization cuando hay token', () => {
    tokenService.setToken('mi-token');

    http.get('/api/v1/test').subscribe();

    const req = httpTesting.expectOne('/api/v1/test');
    expect(req.request.headers.get('Authorization')).toBe('Bearer mi-token');
    req.flush({});
  });

  it('no debe agregar el header cuando no hay token', () => {
    http.get('/api/v1/test').subscribe();

    const req = httpTesting.expectOne('/api/v1/test');
    expect(req.request.headers.has('Authorization')).toBeFalse();
    req.flush({});
  });
  it('no envía un token anterior al iniciar sesión o registrar empresa', () => {
    tokenService.setToken('token-anterior');
    for (const url of ['/api/v1/auth/login', '/api/v1/empresas']) {
      http.post(url, {}).subscribe();
      const req = httpTesting.expectOne(url);
      expect(req.request.headers.has('Authorization')).toBeFalse();
      req.flush({});
    }
  });
  it('no filtra el token a otra API', () => {
    tokenService.setToken('token-anterior');
    http.get('https://example.org/otra-api').subscribe();
    const req = httpTesting.expectOne('https://example.org/otra-api');
    expect(req.request.headers.has('Authorization')).toBeFalse();
    req.flush({});
  });
});
```

### 39. `src/app/interceptors/auth.interceptor.ts`

**Propósito y qué hace:** Adjunta Authorization: Bearer a peticiones de nuestra API, excepto login y registro públicos.

**Por qué así:** No se envía un token anterior al autenticarse y no se filtra a URLs de terceros. Se mantiene la cabecera centralizada.

**Pregunta probable:** ¿Por qué clone? HttpRequest es inmutable; se crea una copia con la cabecera añadida.

```typescript
import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { environment } from '../../environments/environment';
import { TokenService } from '../services/token.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const tokenService = inject(TokenService);
  const token = tokenService.getToken();

  const esApi = req.url.startsWith(`${environment.apiUrl}/`);
  const esPublica =
    req.method === 'POST' &&
    (req.url === `${environment.apiUrl}/auth/login` ||
      req.url === `${environment.apiUrl}/empresas`);
  if (token && esApi && !esPublica) {
    req = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });
  }

  return next(req);
};
```

### 40. `src/app/interceptors/error.interceptor.ts`

**Propósito y qué hace:** Maneja el 401 global: elimina token, navega al login y vuelve a propagar el error al componente.

**Por qué así:** Es infraestructura previa reutilizada; el componente conserva el mensaje específico de su formulario.

**Pregunta probable:** ¿401 y 403 son lo mismo? No: 401 significa falta de autenticación válida; 403 significa que no hay permiso para la operación.

```typescript
import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, from, switchMap, throwError } from 'rxjs';
import { TokenService } from '../services/token.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const tokenService = inject(TokenService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        tokenService.removeToken();
        return from(router.navigateByUrl('/login')).pipe(
          switchMap(() => throwError(() => error))
        );
      }
      return throwError(() => error);
    })
  );
};
```

### 41. `src/app/models/empresa.model.ts`

**Propósito y qué hace:** Describe los seis campos de registro y los datos de empresa devueltos por Java.

**Por qué así:** Las interfaces siguen RegistroEmpresaRequest y EmpresaResponse reales. La fecha llega serializada como texto.

**Pregunta probable:** ¿Una interface valida el JSON en ejecución? No. Ayuda al compilador; la validación real de entrada también ocurre en el backend.

```typescript
export interface RegistroEmpresaRequest {
  nombreEmpresa: string;
  nit: string;
  correoContacto: string;
  nombreAdmin: string;
  emailAdmin: string;
  passwordAdmin: string;
}
export interface EmpresaResponse {
  id: number;
  nombre: string;
  nit: string;
  correoContacto: string;
  fechaRegistro: string;
}
```

### 42. `src/app/models/lane.model.ts`

**Propósito y qué hace:** Contrato previo de lanes y su rol de proceso, incluido rolProcesoNombre.

**Por qué así:** Se conserva y reutiliza. El detalle muestra tanto IDs como el nombre del rol recibido.

**Pregunta probable:** ¿Qué representa lane? Una división de responsabilidad dentro de un pool; organiza quién realiza las actividades.

```typescript
export interface LaneResponse {
  id: number;
  nombre: string;
  orden: number;
  poolId: number;
  rolProcesoId: number;
  rolProcesoNombre: string;
}

export interface LaneRequest {
  nombre: string;
  rolProcesoId: number;
}

export interface ReordenarLanesRequest {
  laneIds: number[];
}
```

### 43. `src/app/models/login.model.ts`

**Propósito y qué hace:** Describe email/password y la respuesta JWT con datos del usuario.

**Por qué así:** Ya existía; se conserva para no duplicar contratos ni romper imports.

**Pregunta probable:** ¿expiresIn es el token? No. Es su duración en segundos; accessToken contiene el JWT.

```typescript
import { UsuarioResponse } from './usuario.model';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  usuario: UsuarioResponse;
}
```

### 44. `src/app/models/nodos-compartidos.model.ts`

**Propósito y qué hace:** Define actividades, gateways, eventos, arcos y mensajes que recibe el detalle compartido.

**Por qué así:** Son contratos de lectura del backend; no implementan operaciones de H6/H7. Los campos opcionales del backend usan null explícito.

**Pregunta probable:** ¿Por qué number | null? El backend puede devolver un identificador o null, por ejemplo un evento receptor aún no asignado.

```typescript
// DTOs del detalle recibido. Estos tipos no añaden operaciones de H6/H7.
export interface ActividadResponse {
  id: number;
  nombre: string;
  descripcion: string | null;
  posicionX: number;
  posicionY: number;
  laneId: number;
  tipoActividad: string;
}
export interface GatewayResponse {
  id: number;
  nombre: string;
  tipoGateway: string;
  posicionX: number;
  posicionY: number;
  laneId: number;
}
export interface EventoMensajeResponse {
  id: number;
  nombre: string;
  tipoEvento: string;
  contenido: string | null;
  claveCorrelacion: string | null;
  posicionX: number;
  posicionY: number;
  laneId: number;
  origenExterno: boolean;
}
export interface ArcoResponse {
  id: number;
  etiqueta: string | null;
  condicion: string | null;
  origenId: number;
  destinoId: number;
  poolId: number;
}
export interface MensajeResponse {
  id: number;
  nombre: string;
  contenido: string | null;
  poolOrigenId: number;
  poolDestinoId: number;
  procesoId: number;
  eventoThrowId: number | null;
  eventoCatchId: number | null;
  claveCorrelacion: string | null;
  tipoDestinoExterno: string | null;
  destinoExterno: string | null;
  politicaFalloNotificacion: string | null;
  actividadErrorId: number | null;
  politicaSinCaso: string | null;
  sinReceptor: boolean;
}
```

### 45. `src/app/models/page.model.ts`

**Propósito y qué hace:** Representa una página: content, page, size, totalElements y totalPages.

**Por qué así:** Copia el PageResponse propio de Beta-back; no asumimos la estructura completa de Spring Page.

**Pregunta probable:** ¿La primera página es cero o uno? El backend recibe cero. En la pantalla se muestra page + 1 cuando existen resultados.

```typescript
export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}
```

### 46. `src/app/models/permiso-estructura.model.ts`

**Propósito y qué hace:** Define seis permisos booleanos y el rol de acceso al que pertenecen.

**Por qué así:** La petición contiene solo los seis booleanos; el rol va en la URL. La respuesta incluye rolAcceso.

**Pregunta probable:** ¿Qué hace extends? Añade rolAcceso a los campos que ya define PermisoEstructuraRequest sin volver a escribirlos.

```typescript
export interface PermisoEstructuraRequest {
  crearPool: boolean;
  editarPool: boolean;
  eliminarPool: boolean;
  crearLane: boolean;
  editarLane: boolean;
  eliminarLane: boolean;
}
export interface PermisoEstructuraResponse extends PermisoEstructuraRequest {
  rolAcceso: string;
}
```

### 47. `src/app/models/pool.model.ts`

**Propósito y qué hace:** Contrato previo de pools, reutilizado dentro del detalle compartido.

**Por qué así:** No se modifica. Reutilizarlo evita dos definiciones incompatibles del mismo JSON.

**Pregunta probable:** ¿Caja negra? Es un participante cuyo flujo interno no se modela o no se expone; no es un mecanismo de cifrado.

```typescript
export interface PoolResponse {
  id: number;
  nombre: string;
  tipoParticipante: string;
  cajaNegra: boolean;
  orden: number;
  procesoId: number;
}

export interface PoolRequest {
  nombre: string;
  tipoParticipante: string;
  cajaNegra: boolean;
}

export interface EditarPoolRequest {
  nombre: string;
  tipoParticipante: string;
  cajaNegra?: boolean;
}
```

### 48. `src/app/models/proceso-compartido.model.ts`

**Propósito y qué hace:** Define la petición para compartir, la relación de empresas y el detalle agregado con sus siete colecciones.

**Por qué así:** El endpoint del detalle devuelve todo junto. Se reutilizan PoolResponse y LaneResponse existentes.

**Pregunta probable:** ¿id y procesoId son iguales? No necesariamente. id identifica el registro compartido; procesoId identifica el proceso. Para revocar se usa empresaInvitadaId.

```typescript
import { ProcesoResponse } from './proceso.model';
import { PoolResponse } from './pool.model';
import { LaneResponse } from './lane.model';
import {
  ActividadResponse,
  GatewayResponse,
  EventoMensajeResponse,
  ArcoResponse,
  MensajeResponse
} from './nodos-compartidos.model';
export interface CompartirProcesoRequest {
  empresaInvitadaId: number;
}
export interface ProcesoCompartidoResponse {
  id: number;
  procesoId: number;
  procesoNombre: string;
  empresaPropietariaId: number;
  empresaPropietaria: string;
  empresaInvitadaId: number;
  empresaInvitada: string;
  soloLectura: boolean;
}
export interface ProcesoCompartidoDetalleResponse {
  proceso: ProcesoResponse;
  empresaPropietaria: string;
  soloLectura: boolean;
  pools: PoolResponse[];
  lanes: LaneResponse[];
  actividades: ActividadResponse[];
  gateways: GatewayResponse[];
  eventos: EventoMensajeResponse[];
  arcos: ArcoResponse[];
  mensajes: MensajeResponse[];
}
```

### 49. `src/app/models/proceso.model.ts`

**Propósito y qué hace:** Describe ProcesoResponse recibido dentro de un proceso compartido.

**Por qué así:** H3 aún no está en main. Este contrato copia el record real del backend y puede ser reutilizado al integrarlo, sin añadir un CRUD ajeno.

**Pregunta probable:** ¿Por qué fechas string? Porque HTTP transporta JSON y las fechas Java se serializan como texto; no son objetos Date automáticamente.

```typescript
// Contrato de ProcesoResponse en Beta-back/main; reutilizable por H3.
export interface ProcesoResponse {
  id: number;
  nombre: string;
  descripcion: string | null;
  categoria: string;
  estado: string;
  activo: boolean;
  fechaCreacion: string;
  fechaModificacion: string;
}
```

### 50. `src/app/models/rol-proceso.model.ts`

**Propósito y qué hace:** Describe creación/edición, listado con contador de uso y consulta paginada con nombres de procesos.

**Por qué así:** Se amplía el archivo existente. RolProcesoVistaResponse sigue disponible para LaneFormComponent. La consulta usa procesos[], tal como devuelve el backend.

**Pregunta probable:** ¿Por qué hay Vista y Consulta? Son respuestas distintas: una trae contador y la otra la lista de procesos que usan el rol.

```typescript
export interface RolProcesoVistaResponse {
  id: number;
  nombre: string;
  descripcion: string;
  procesosQueLoUsan: number;
  enUso: boolean;
}

export interface RolProcesoRequest {
  nombre: string;
  descripcion?: string;
}
export interface RolProcesoConsultaResponse {
  id: number;
  nombre: string;
  descripcion: string | null;
  procesos: string[];
  enUso: boolean;
}
```

### 51. `src/app/models/usuario.model.ts`

**Propósito y qué hace:** Describe los datos públicos de usuario que devuelve el login.

**Por qué así:** Se reutiliza el contrato existente. No se incluye la contraseña en la respuesta.

**Pregunta probable:** ¿rolAcceso es un rol de proceso? No. Es el permiso general de acceso: ADMINISTRADOR, EDITOR o SOLO_LECTURA.

```typescript
export interface UsuarioResponse {
  id: number;
  nombre: string;
  email: string;
  rolAcceso: string;
  activo: boolean;
}
```

### 52. `src/app/services/auth.service.spec.ts`

**Propósito y qué hace:** Pruebas de auth.service: guarda token después de POST login exitoso; descarta token aunque logout responda con error.

**Por qué así:** Comprueba peticiones, estado visible o navegación usando TestBed y respuestas HTTP controladas; no usa la VM. Las dependencias se registran como en la aplicación.

**Pregunta probable:** ¿Por qué estas pruebas? Protegen estos comportamientos concretos y detectan regresiones. No comprueban disponibilidad de la VM ni reemplazan pruebas entre frontend y backend reales.

```typescript
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { AuthService } from './auth.service';
import { TokenService } from './token.service';

describe('AuthService sesión', () => {
  let service: AuthService;
  let http: HttpTestingController;
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(AuthService);
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => {
    http.verify();
    localStorage.clear();
  });
  it('guarda token después de POST login exitoso', () => {
    const body = { email: 'admin@beta.co', password: '123456' };
    service.login(body).subscribe();
    const req = http.expectOne('/api/v1/auth/login');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(body);
    req.flush({
      accessToken: 'jwt',
      tokenType: 'Bearer',
      expiresIn: 3600,
      usuario: { id: 1, nombre: 'Sam', email: body.email, rolAcceso: 'ADMINISTRADOR', activo: true }
    });
    expect(TestBed.inject(TokenService).getToken()).toBe('jwt');
  });
  it('descarta token aunque logout responda con error', () => {
    TestBed.inject(TokenService).setToken('jwt');
    service.logout().subscribe({ error: () => {} });
    const req = http.expectOne('/api/v1/auth/logout');
    expect(req.request.method).toBe('POST');
    req.flush({}, { status: 500, statusText: 'Error' });
    expect(TestBed.inject(TokenService).getToken()).toBeNull();
  });
});
```

### 53. `src/app/services/auth.service.ts`

**Propósito y qué hace:** Envía login y logout al backend y coordina el almacenamiento del token mediante TokenService.

**Por qué así:** El requisito de H1 exige que el servicio administre el token. tap guarda solo al recibir respuesta exitosa; finalize lo elimina al finalizar logout incluso con error.

**Pregunta probable:** ¿Por qué tap y finalize? tap ejecuta un efecto sin cambiar el valor emitido. finalize ejecuta limpieza cuando la suscripción termina, falla o se cancela.

```typescript
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, finalize, tap } from 'rxjs';
import { LoginRequest, LoginResponse } from '../models/login.model';
import { environment } from '../../environments/environment';
import { TokenService } from './token.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly tokens = inject(TokenService);
  private readonly url = `${environment.apiUrl}/auth`;

  login(request: LoginRequest): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${this.url}/login`, request)
      .pipe(tap((response) => this.tokens.setToken(response.accessToken)));
  }

  logout(): Observable<void> {
    // El servidor es stateless: se descarta el token incluso si falla la conexión.
    return this.http
      .post<void>(`${this.url}/logout`, null)
      .pipe(finalize(() => this.tokens.removeToken()));
  }
}
```

### 54. `src/app/services/empresa.service.ts`

**Propósito y qué hace:** Registra una empresa y su administrador inicial con POST /api/v1/empresas.

**Por qué así:** El backend ya concentra esa creación en una operación. Angular envía un único RegistroEmpresaRequest.

**Pregunta probable:** ¿Se hacen dos peticiones para empresa y administrador? No. El endpoint de registro los crea juntos en el backend.

```typescript
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { EmpresaResponse, RegistroEmpresaRequest } from '../models/empresa.model';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class EmpresaService {
  private readonly http = inject(HttpClient);
  registrar(request: RegistroEmpresaRequest): Observable<EmpresaResponse> {
    return this.http.post<EmpresaResponse>(`${environment.apiUrl}/empresas`, request);
  }
}
```

### 55. `src/app/services/permiso-estructura.service.spec.ts`

**Propósito y qué hace:** Pruebas de permiso-estructura.service: lista configuración; actualiza los seis permisos por rol de acceso.

**Por qué así:** Comprueba peticiones, estado visible o navegación usando TestBed y respuestas HTTP controladas; no usa la VM. Las dependencias se registran como en la aplicación.

**Pregunta probable:** ¿Por qué estas pruebas? Protegen estos comportamientos concretos y detectan regresiones. No comprueban disponibilidad de la VM ni reemplazan pruebas entre frontend y backend reales.

```typescript
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { PermisoEstructuraService } from './permiso-estructura.service';
describe('PermisoEstructuraService', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] })
  );
  afterEach(() => TestBed.inject(HttpTestingController).verify());
  it('lista configuración', () => {
    TestBed.inject(PermisoEstructuraService).listar().subscribe();
    const r = TestBed.inject(HttpTestingController).expectOne('/api/v1/permisos-estructura');
    expect(r.request.method).toBe('GET');
    r.flush([]);
  });
  it('actualiza los seis permisos por rol de acceso', () => {
    const body = {
      crearPool: true,
      editarPool: false,
      eliminarPool: false,
      crearLane: true,
      editarLane: true,
      eliminarLane: false
    };
    TestBed.inject(PermisoEstructuraService).actualizar('EDITOR', body).subscribe();
    const r = TestBed.inject(HttpTestingController).expectOne('/api/v1/permisos-estructura/EDITOR');
    expect(r.request.method).toBe('PUT');
    expect(r.request.body).toEqual(body);
    r.flush({ rolAcceso: 'EDITOR', ...body });
  });
});
```

### 56. `src/app/services/permiso-estructura.service.ts`

**Propósito y qué hace:** Consulta configuración y actualiza los permisos de un rol de acceso.

**Por qué así:** Solo llama los dos endpoints existentes. Los seis campos viajan tipados y el rol forma parte de la URL.

**Pregunta probable:** ¿Qué pasa si un editor llama directamente al endpoint? Spring Security decide si lo autoriza; el guard de Angular no sustituye esa regla.

```typescript
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  PermisoEstructuraRequest,
  PermisoEstructuraResponse
} from '../models/permiso-estructura.model';

@Injectable({ providedIn: 'root' })
export class PermisoEstructuraService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/permisos-estructura`;
  listar(): Observable<PermisoEstructuraResponse[]> {
    return this.http.get<PermisoEstructuraResponse[]>(this.url);
  }
  actualizar(
    rol: string,
    request: PermisoEstructuraRequest
  ): Observable<PermisoEstructuraResponse> {
    return this.http.put<PermisoEstructuraResponse>(`${this.url}/${rol}`, request);
  }
}
```

### 57. `src/app/services/proceso-compartido.service.spec.ts`

**Propósito y qué hace:** Pruebas de proceso-compartido.service: lista invitados de un proceso; comparte por ID de empresa invitada; revoca con ID de empresa invitada; lista recibidos; consulta detalle por procesoId.

**Por qué así:** Comprueba peticiones, estado visible o navegación usando TestBed y respuestas HTTP controladas; no usa la VM. Las dependencias se registran como en la aplicación.

**Pregunta probable:** ¿Por qué estas pruebas? Protegen estos comportamientos concretos y detectan regresiones. No comprueban disponibilidad de la VM ni reemplazan pruebas entre frontend y backend reales.

```typescript
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { ProcesoCompartidoService } from './proceso-compartido.service';
describe('ProcesoCompartidoService', () => {
  let s: ProcesoCompartidoService;
  let http: HttpTestingController;
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    s = TestBed.inject(ProcesoCompartidoService);
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => http.verify());
  it('lista invitados de un proceso', () => {
    s.listarCompartidosPorMi(10).subscribe();
    const r = http.expectOne('/api/v1/procesos/10/compartidos');
    expect(r.request.method).toBe('GET');
    r.flush([]);
  });
  it('comparte por ID de empresa invitada', () => {
    s.compartir(10, { empresaInvitadaId: 8 }).subscribe();
    const r = http.expectOne('/api/v1/procesos/10/compartidos');
    expect(r.request.method).toBe('POST');
    expect(r.request.body).toEqual({ empresaInvitadaId: 8 });
    r.flush({});
  });
  it('revoca con ID de empresa invitada', () => {
    s.revocar(10, 8).subscribe();
    const r = http.expectOne('/api/v1/procesos/10/compartidos/8');
    expect(r.request.method).toBe('DELETE');
    r.flush(null);
  });
  it('lista recibidos', () => {
    s.listarCompartidosConmigo().subscribe();
    const r = http.expectOne('/api/v1/procesos-compartidos');
    expect(r.request.method).toBe('GET');
    r.flush([]);
  });
  it('consulta detalle por procesoId', () => {
    s.verDetalle(10).subscribe();
    const r = http.expectOne('/api/v1/procesos-compartidos/10');
    expect(r.request.method).toBe('GET');
    r.flush({});
  });
});
```

### 58. `src/app/services/proceso-compartido.service.ts`

**Propósito y qué hace:** Implementa las cinco operaciones HTTP para compartir, revocar, listar invitados, listar recibidos y consultar detalle.

**Por qué así:** Cada método corresponde a un endpoint real de ProcesoCompartidoController; no inventamos URLs ni necesitamos consultar cada nodo por separado.

**Pregunta probable:** ¿De dónde sale la empresa del usuario? El backend la obtiene del principal autenticado; Angular no manda una empresaPropietariaId elegida por el cliente.

```typescript
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  CompartirProcesoRequest,
  ProcesoCompartidoResponse,
  ProcesoCompartidoDetalleResponse
} from '../models/proceso-compartido.model';

@Injectable({ providedIn: 'root' })
export class ProcesoCompartidoService {
  private readonly http = inject(HttpClient);
  private readonly url = environment.apiUrl;
  listarCompartidosPorMi(procesoId: number): Observable<ProcesoCompartidoResponse[]> {
    return this.http.get<ProcesoCompartidoResponse[]>(
      `${this.url}/procesos/${procesoId}/compartidos`
    );
  }
  compartir(
    procesoId: number,
    request: CompartirProcesoRequest
  ): Observable<ProcesoCompartidoResponse> {
    return this.http.post<ProcesoCompartidoResponse>(
      `${this.url}/procesos/${procesoId}/compartidos`,
      request
    );
  }
  revocar(procesoId: number, empresaInvitadaId: number): Observable<void> {
    return this.http.delete<void>(
      `${this.url}/procesos/${procesoId}/compartidos/${empresaInvitadaId}`
    );
  }
  listarCompartidosConmigo(): Observable<ProcesoCompartidoResponse[]> {
    return this.http.get<ProcesoCompartidoResponse[]>(`${this.url}/procesos-compartidos`);
  }
  verDetalle(procesoId: number): Observable<ProcesoCompartidoDetalleResponse> {
    return this.http.get<ProcesoCompartidoDetalleResponse>(
      `${this.url}/procesos-compartidos/${procesoId}`
    );
  }
}
```

### 59. `src/app/services/rol-proceso.service.spec.ts`

**Propósito y qué hace:** Pruebas de rol-proceso.service: conserva listar para LaneForm; busca por nombre y página; obtiene detalle por ID; crea con request; edita por ID; elimina por ID.

**Por qué así:** Comprueba peticiones, estado visible o navegación usando TestBed y respuestas HTTP controladas; no usa la VM. Las dependencias se registran como en la aplicación.

**Pregunta probable:** ¿Por qué estas pruebas? Protegen estos comportamientos concretos y detectan regresiones. No comprueban disponibilidad de la VM ni reemplazan pruebas entre frontend y backend reales.

```typescript
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { RolProcesoService } from './rol-proceso.service';

describe('RolProcesoService contrato HTTP', () => {
  let s: RolProcesoService;
  let http: HttpTestingController;
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    s = TestBed.inject(RolProcesoService);
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => http.verify());
  it('conserva listar para LaneForm', () => {
    s.listar().subscribe();
    const r = http.expectOne('/api/v1/roles');
    expect(r.request.method).toBe('GET');
    r.flush([]);
  });
  it('busca por nombre y página', () => {
    s.buscar('Ventas', 2).subscribe();
    const r = http.expectOne((q) => q.url === '/api/v1/roles/consulta');
    expect(r.request.params.get('nombre')).toBe('Ventas');
    expect(r.request.params.get('pagina')).toBe('2');
    r.flush({ content: [], page: 2, size: 10, totalElements: 0, totalPages: 0 });
  });
  it('obtiene detalle por ID', () => {
    s.obtener(4).subscribe();
    const r = http.expectOne('/api/v1/roles/4');
    expect(r.request.method).toBe('GET');
    r.flush({});
  });
  it('crea con request', () => {
    const body = { nombre: 'Ventas', descripcion: 'Atención' };
    s.crear(body).subscribe();
    const r = http.expectOne('/api/v1/roles');
    expect(r.request.method).toBe('POST');
    expect(r.request.body).toEqual(body);
    r.flush({});
  });
  it('edita por ID', () => {
    s.editar(4, { nombre: 'Soporte' }).subscribe();
    const r = http.expectOne('/api/v1/roles/4');
    expect(r.request.method).toBe('PUT');
    expect(r.request.body.nombre).toBe('Soporte');
    r.flush({});
  });
  it('elimina por ID', () => {
    s.eliminar(4).subscribe();
    const r = http.expectOne('/api/v1/roles/4');
    expect(r.request.method).toBe('DELETE');
    r.flush(null);
  });
});
```

### 60. `src/app/services/rol-proceso.service.ts`

**Propósito y qué hace:** Ofrece listar, buscar, obtener, crear, editar y eliminar roles con HttpClient.

**Por qué así:** Se conserva listar para lanes y se añade buscar para paginación. HttpParams serializa nombre y pagina correctamente.

**Pregunta probable:** ¿RolProceso es seguridad? No. Es una función del proceso asignable a lanes, como ventas o compras.

```typescript
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  RolProcesoVistaResponse,
  RolProcesoConsultaResponse,
  RolProcesoRequest
} from '../models/rol-proceso.model';
import { environment } from '../../environments/environment';

import { PageResponse } from '../models/page.model';

@Injectable({ providedIn: 'root' })
export class RolProcesoService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/roles`;

  listar(): Observable<RolProcesoVistaResponse[]> {
    return this.http.get<RolProcesoVistaResponse[]>(this.url);
  }
  buscar(nombre = '', pagina = 0): Observable<PageResponse<RolProcesoConsultaResponse>> {
    const params = new HttpParams().set('nombre', nombre).set('pagina', pagina);
    return this.http.get<PageResponse<RolProcesoConsultaResponse>>(`${this.url}/consulta`, {
      params
    });
  }
  obtener(id: number): Observable<RolProcesoVistaResponse> {
    return this.http.get<RolProcesoVistaResponse>(`${this.url}/${id}`);
  }
  crear(request: RolProcesoRequest): Observable<RolProcesoVistaResponse> {
    return this.http.post<RolProcesoVistaResponse>(this.url, request);
  }
  editar(id: number, request: RolProcesoRequest): Observable<RolProcesoVistaResponse> {
    return this.http.put<RolProcesoVistaResponse>(`${this.url}/${id}`, request);
  }
  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}
```

### 61. `src/app/services/token.service.spec.ts`

**Propósito y qué hace:** Pruebas de token.service: debe crearse; debe almacenar y recuperar el token; debe retornar null si no hay token; debe eliminar el token; rechaza tokens malformados, sin vencimiento o vencidos; reconoce sesión y rol de acceso de JWT vigente.

**Por qué así:** Comprueba peticiones, estado visible o navegación usando TestBed y respuestas HTTP controladas; no usa la VM. Las dependencias se registran como en la aplicación.

**Pregunta probable:** ¿Por qué estas pruebas? Protegen estos comportamientos concretos y detectan regresiones. No comprueban disponibilidad de la VM ni reemplazan pruebas entre frontend y backend reales.

```typescript
import { TestBed } from '@angular/core/testing';
import { TokenService } from './token.service';

describe('TokenService', () => {
  let service: TokenService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    service = TestBed.inject(TokenService);
  });

  afterEach(() => localStorage.clear());

  it('debe crearse', () => {
    expect(service).toBeTruthy();
  });

  it('debe almacenar y recuperar el token', () => {
    service.setToken('abc123');
    expect(service.getToken()).toBe('abc123');
  });

  it('debe retornar null si no hay token', () => {
    expect(service.getToken()).toBeNull();
  });

  it('debe eliminar el token', () => {
    service.setToken('abc123');
    service.removeToken();
    expect(service.getToken()).toBeNull();
  });
  it('rechaza tokens malformados, sin vencimiento o vencidos', () => {
    for (const token of [
      'mal',
      'h.invalido.s',
      'h.' + btoa('{}') + '.s',
      'h.' + btoa(JSON.stringify({ exp: 1 })) + '.s'
    ]) {
      service.setToken(token);
      expect(service.tieneSesion()).toBeFalse();
      expect(service.esAdministrador()).toBeFalse();
    }
  });
  it('reconoce sesión y rol de acceso de JWT vigente', () => {
    service.setToken(
      'h.' + btoa(JSON.stringify({ exp: Date.now() / 1000 + 1000, rol: 'ADMINISTRADOR' })) + '.s'
    );
    expect(service.tieneSesion()).toBeTrue();
    expect(service.esAdministrador()).toBeTrue();
  });
});
```

### 62. `src/app/services/token.service.ts`

**Propósito y qué hace:** Conserva accessToken en localStorage y lee exp y rol para orientar la interfaz.

**Por qué así:** Se conserva el almacenamiento inicial y se añade lectura del payload JWT en base64url. El navegador solo comprueba vencimiento y rol declarado; Spring verifica firma, usuario y empresa. Si el token está mal formado, se trata como sesión ausente.

**Pregunta probable:** ¿Por qué localStorage? Ya lo usaba main y conserva sesión al recargar. JavaScript puede leerlo: no evita robo por XSS. No guardamos contraseñas y no afirmamos que decodificar verifique la firma.

```typescript
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class TokenService {
  private readonly TOKEN_KEY = 'accessToken';

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  setToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  // Leer claims orienta la interfaz; solo el backend verifica la firma del JWT.
  private claims(): { exp?: number; rol?: string } | null {
    const token = this.getToken();
    if (!token) return null;
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;
      const payload = parts[1].replace(/-/g, '+').replace(/_/g, '/');
      return JSON.parse(atob(payload.padEnd(Math.ceil(payload.length / 4) * 4, '=')));
    } catch {
      return null;
    }
  }

  tieneSesion(): boolean {
    const claims = this.claims();
    return typeof claims?.exp === 'number' && claims.exp * 1000 > Date.now();
  }

  esAdministrador(): boolean {
    return this.tieneSesion() && this.claims()?.rol === 'ADMINISTRADOR';
  }

  removeToken(): void {
    localStorage.removeItem(this.TOKEN_KEY);
  }
}
```

### 63. `src/app/testing/compartidos.fixture.ts`

**Propósito y qué hace:** Contiene una respuesta de ejemplo tipada para pruebas de procesos compartidos.

**Por qué así:** Los datos de prueba se mantienen fuera del código de producción. Incluyen las siete colecciones y campos null reales.

**Pregunta probable:** ¿Se muestran estos datos al usuario? No. Solo los importan los archivos spec.

```typescript
import {
  ProcesoCompartidoResponse,
  ProcesoCompartidoDetalleResponse
} from '../models/proceso-compartido.model';
export const compartido: ProcesoCompartidoResponse = {
  id: 50,
  procesoId: 10,
  procesoNombre: 'Compra',
  empresaPropietariaId: 1,
  empresaPropietaria: 'Beta',
  empresaInvitadaId: 8,
  empresaInvitada: 'Aliada',
  soloLectura: true
};
export const detalleCompartido: ProcesoCompartidoDetalleResponse = {
  proceso: {
    id: 10,
    nombre: 'Compra',
    descripcion: 'Adquisiciones',
    categoria: 'Compras',
    estado: 'BORRADOR',
    activo: true,
    fechaCreacion: '2026-10-24',
    fechaModificacion: '2026-10-24'
  },
  empresaPropietaria: 'Beta',
  soloLectura: true,
  pools: [
    {
      id: 1,
      nombre: 'Pool Beta',
      tipoParticipante: 'EMPRESA',
      cajaNegra: false,
      orden: 0,
      procesoId: 10
    }
  ],
  lanes: [
    {
      id: 2,
      nombre: 'Lane ventas',
      orden: 0,
      poolId: 1,
      rolProcesoId: 3,
      rolProcesoNombre: 'Vendedor'
    }
  ],
  actividades: [
    {
      id: 4,
      nombre: 'Cotizar',
      descripcion: null,
      posicionX: 0,
      posicionY: 0,
      laneId: 2,
      tipoActividad: 'TAREA'
    }
  ],
  gateways: [
    { id: 5, nombre: 'Aprobación', tipoGateway: 'EXCLUSIVO', posicionX: 0, posicionY: 0, laneId: 2 }
  ],
  eventos: [
    {
      id: 6,
      nombre: 'Solicitud',
      tipoEvento: 'THROW',
      contenido: null,
      claveCorrelacion: null,
      posicionX: 0,
      posicionY: 0,
      laneId: 2,
      origenExterno: false
    }
  ],
  arcos: [
    { id: 7, etiqueta: 'Sí aprobado', condicion: null, origenId: 4, destinoId: 5, poolId: 1 }
  ],
  mensajes: [
    {
      id: 8,
      nombre: 'Avisar',
      contenido: null,
      poolOrigenId: 1,
      poolDestinoId: 9,
      procesoId: 10,
      eventoThrowId: 6,
      eventoCatchId: null,
      claveCorrelacion: null,
      tipoDestinoExterno: null,
      destinoExterno: null,
      politicaFalloNotificacion: null,
      actividadErrorId: null,
      politicaSinCaso: null,
      sinReceptor: true
    }
  ]
};
```
