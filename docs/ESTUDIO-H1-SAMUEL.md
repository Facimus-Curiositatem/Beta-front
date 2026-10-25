# Estudio H1 — Samuel

Actualizado: 25 de octubre de 2026. Rama: `feature/H1-registro-autenticacion`. Base: `origin/main`.

## Organización acordada con el equipo

Un issue por rama y PR. H1 parte de main; H8 y H4 parten de H1 porque necesitan su sesión y guard de administrador. Sus PR apuntan primero a H1 para mostrar solo su propio cambio. Después de integrar H1, se actualiza su base a main. H8 y H4 no dependen entre sí. El PR combinado #17 se sustituye por estos tres PR.

Los audios piden aislar los issues y acordar la consistencia de OnPush; la indicación posterior del equipo elige usarlo. No afirmamos que apareciera en clase sin verificar las presentaciones.

## OnPush explicado para sustentar

Angular comprueba los valores usados por la plantilla y actualiza el DOM cuando cambian. En Angular 20, OnPush permite omitir subárboles que no necesitan revisión. La vista se revisa ante entradas nuevas, eventos de su subárbol o notificaciones como signals leídos por la plantilla, AsyncPipe y markForCheck. No significa «solo se actualiza al hacer clic» ni cambia la lógica del backend.

Aquí se declara `changeDetection: ChangeDetectionStrategy.OnPush` en cada componente propio. Los datos HTTP y estados visibles se guardan en signals; `.set()` notifica a Angular. No se añadió markForCheck a todas las suscripciones: el estado reactivo ya proporciona la notificación. Para inputs objeto, mutar el mismo objeto puede no notificar: conviene entregar una referencia nueva.

**Por qué lo usamos:** consistencia con H5 y H3, y evitar comprobaciones innecesarias. No demostramos una mejora de rendimiento medida y no es requisito para que Angular funcione.

**Caso que sí hubo que corregir:** localStorage no notifica cambios de vista. TokenService mantiene una signal en memoria y persiste su valor; el menú lee esa signal indirectamente mediante tieneSesion(). Una prueba asíncrona comprueba que se muestra y se oculta bajo OnPush sin pulsar el menú.

Referencias de Angular 20: https://v20.angular.dev/best-practices/skipping-subtrees y https://v20.angular.dev/guide/signals#reading-signals-in-onpush-components

## Guion breve

1. «Este PR contiene solo H1; los otros módulos están en ramas separadas».
2. Abrir modelo, servicio HTTP, componente y HTML; seguir una acción completa desde el formulario hasta la respuesta.
3. Mostrar OnPush y la signal que cambia al recibir la respuesta.
4. Enseñar su spec y explicar el comportamiento comprobado.
5. Aclarar que el backend aplica permisos y empresa autenticada; Angular organiza la experiencia.

## Integración con H3

H3 ya tiene el PR #19 abierto; aún no estaba en main al hacer esta separación. Su listado sustituirá InicioProcesosComponent en /procesos. No mergeamos ese PR ajeno. H8 usa PageResponse alineado con su archivo page-response.model.ts; H4 reutiliza sus contratos de proceso/historial. No copiamos el CRUD H3. Las rutas que comparten app.routes.ts y los enlaces del menú se concilian al integrar.

## Código por archivo

### 1. `src/app/app.component.html`

**Propósito y qué hace:** Muestra enlaces según la sesión y el rol, y aloja la pantalla elegida por RouterOutlet.

**Por qué así:** El menú es común a los tres issues. Ocultar enlaces mejora la navegación; la autorización real permanece en Spring Security.

**Pregunta probable:** ¿Es seguro esconder un botón? Es solo una ayuda visual. El backend debe rechazar peticiones no autorizadas.

```html
@if (tokens.tieneSesion()) {
  <nav aria-label="Navegación principal">
    <a routerLink="/procesos">Procesos</a>
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
import { TokenService } from './services/token.service';
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

describe('Menú de sesión con OnPush', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()]
    });
  });
  afterEach(() => localStorage.clear());
  it('actualiza el menú al recibir o eliminar el token fuera de un clic del menú', async () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.autoDetectChanges();
    expect(fixture.nativeElement.querySelector('nav')).toBeNull();
    const token =
      'h.' + btoa(JSON.stringify({ exp: Date.now() / 1000 + 3600, rol: 'ADMINISTRADOR' })) + '.s';
    TestBed.inject(TokenService).setToken(token);
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('nav')).not.toBeNull();
    TestBed.inject(TokenService).removeToken();
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('nav')).toBeNull();
  });
});
```

### 3. `src/app/app.component.ts`

**Propósito y qué hace:** Es el componente raíz: mantiene la navegación común y ofrece cerrar sesión.

**Por qué así:** Centralizar el botón de salida evita repetirlo en cada pantalla. cerrarSesion bloquea doble clic y descarta credenciales tanto en éxito como en fallo de red.

**Pregunta probable:** ¿El logout invalida el JWT en el servidor? No: AuthController es stateless; el cliente elimina su copia. Un token copiado conserva validez hasta expirar.

**OnPush en este archivo:** `@Component` declara la estrategia. Los signals de estado/datos usados por el HTML avisan cuando cambian. Los formularios continúan usando sus eventos y controles reactivos.

```typescript
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterOutlet, RouterLink, Router } from '@angular/router';

import { AuthService } from './services/auth.service';
import { TokenService } from './services/token.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
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

### 5. `src/app/app.routes.ts`

**Propósito y qué hace:** Relaciona URLs con login, registro, roles, permisos, procesos compartidos y los pools/lanes existentes.

**Por qué así:** loadComponent carga la pantalla cuando se necesita. authGuard y adminGuard orientan el acceso desde el navegador. La ruta /procesos es un acceso temporal para integrar H3.

**Pregunta probable:** ¿Qué significa :id? Es un parámetro de ruta. withComponentInputBinding lo entrega al input id del componente.

```typescript
import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: 'registro',
    loadComponent: () =>
      import('./components/registro-empresa/registro-empresa.component').then(
        (m) => m.RegistroEmpresaComponent
      )
  },
  {
    path: 'procesos',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./components/inicio-procesos/inicio-procesos.component').then(
        (m) => m.InicioProcesosComponent
      )
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

### 6. `src/app/components/inicio-procesos/inicio-procesos.component.html`

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
</form>
```

### 7. `src/app/components/inicio-procesos/inicio-procesos.component.ts`

**Propósito y qué hace:** Ofrece enlaces y abre pools o compartir usando un ID de proceso existente.

**Por qué así:** Es un punto de integración temporal: main carece de H3. No crea datos ficticios ni pretende reemplazar el CRUD del compañero.

**Pregunta probable:** ¿Qué se debe cambiar al llegar H3? La ruta /procesos debe apuntar a su listado; sus enlaces deben abrir /procesos/:id/pools y /procesos/:id/compartir.

**OnPush en este archivo:** `@Component` declara la estrategia. Los signals de estado/datos usados por el HTML avisan cuando cambian. Los formularios continúan usando sus eventos y controles reactivos.

```typescript
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

// Punto de acceso temporal hasta integrar el listado H3 del compañero.

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-inicio-procesos',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './inicio-procesos.component.html'
})
export class InicioProcesosComponent {
  private readonly router = inject(Router);
  readonly sinPermiso =
    inject(ActivatedRoute).snapshot.queryParamMap.get('aviso') === 'sin-permiso';
  readonly form = inject(FormBuilder).nonNullable.group({
    procesoId: [1, [Validators.required, Validators.min(1), Validators.pattern(/^[0-9]+$/)]]
  });
  abrir(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.router.navigate(['/procesos', this.form.getRawValue().procesoId, 'pools']);
  }
}
```

### 8. `src/app/components/login/login.component.html`

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

### 9. `src/app/components/login/login.component.spec.ts`

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

### 10. `src/app/components/login/login.component.ts`

**Propósito y qué hace:** Valida correo y contraseña, llama a AuthService, muestra errores y navega a /procesos.

**Por qué así:** El componente gestiona interacción y navegación; el servicio guarda el token. loading evita envíos repetidos.

**Pregunta probable:** ¿Qué hace markAllAsTouched? Marca campos como tocados para mostrar sus errores cuando se intenta enviar un formulario inválido.

**OnPush en este archivo:** `@Component` declara la estrategia. Los signals de estado/datos usados por el HTML avisan cuando cambian. Los formularios continúan usando sus eventos y controles reactivos.

```typescript
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
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

### 11. `src/app/components/registro-empresa/registro-empresa.component.html`

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

### 12. `src/app/components/registro-empresa/registro-empresa.component.spec.ts`

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

### 13. `src/app/components/registro-empresa/registro-empresa.component.ts`

**Propósito y qué hace:** Captura datos de empresa y administrador, valida y registra con EmpresaService.

**Por qué así:** FormBuilder.nonNullable evita valores null al resetear; Validators.required/email/minLength replican la validación de entrada del backend.

**Pregunta probable:** ¿Basta con validar aquí? No. La validación del navegador mejora la experiencia; el backend valida otra vez y aplica unicidad y reglas de negocio.

**OnPush en este archivo:** `@Component` declara la estrategia. Los signals de estado/datos usados por el HTML avisan cuando cambian. Los formularios continúan usando sus eventos y controles reactivos.

```typescript
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { EmpresaService } from '../../services/empresa.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
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

### 14. `src/app/guards/admin.guard.spec.ts`

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

### 15. `src/app/guards/admin.guard.ts`

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

### 16. `src/app/guards/auth.guard.spec.ts`

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

### 17. `src/app/guards/auth.guard.ts`

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

### 18. `src/app/interceptors/auth.interceptor.spec.ts`

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

### 19. `src/app/interceptors/auth.interceptor.ts`

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

### 20. `src/app/models/empresa.model.ts`

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

### 21. `src/app/models/login.model.ts`

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

### 22. `src/app/models/usuario.model.ts`

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

### 23. `src/app/services/auth.service.spec.ts`

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

### 24. `src/app/services/auth.service.ts`

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

### 25. `src/app/services/empresa.service.ts`

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

### 26. `src/app/services/token.service.spec.ts`

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
  it('sincroniza la sesión cuando otra pestaña cambia o elimina el token', () => {
    service.setToken('anterior');
    localStorage.setItem('accessToken', 'nuevo');
    window.dispatchEvent(
      new StorageEvent('storage', {
        key: 'accessToken',
        storageArea: localStorage,
        newValue: 'nuevo'
      })
    );
    expect(service.getToken()).toBe('nuevo');
    localStorage.clear();
    window.dispatchEvent(new StorageEvent('storage', { key: null, storageArea: localStorage }));
    expect(service.getToken()).toBeNull();
  });
});
```

### 27. `src/app/services/token.service.ts`

**Propósito y qué hace:** Conserva accessToken en localStorage y lee exp y rol para orientar la interfaz.

**Por qué así:** Se conserva el almacenamiento inicial y se añade lectura del payload JWT en base64url. El navegador solo comprueba vencimiento y rol declarado; Spring verifica firma, usuario y empresa. Si el token está mal formado, se trata como sesión ausente.

**Pregunta probable:** ¿Por qué localStorage? Ya lo usaba main y conserva sesión al recargar. JavaScript puede leerlo: no evita robo por XSS. No guardamos contraseñas y no afirmamos que decodificar verifique la firma.

**Ajuste del 25 de octubre:** getToken lee ahora una signal inicializada desde localStorage; setToken/removeToken actualizan almacenamiento y signal. Así OnPush recibe la notificación. Se escucha storage para sincronizar cambios de otra pestaña, incluido clear. DestroyRef retira el listener al destruir el servicio en pruebas o al destruir su inyector. No se guarda la contraseña ni se verifica la firma en el navegador.

```typescript
import { DestroyRef, Injectable, inject, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class TokenService {
  private readonly TOKEN_KEY = 'accessToken';
  private readonly token = signal<string | null>(localStorage.getItem(this.TOKEN_KEY));

  constructor() {
    const sincronizar = (event: StorageEvent) => {
      if (
        event.storageArea === localStorage &&
        (event.key === this.TOKEN_KEY || event.key === null)
      ) {
        this.token.set(localStorage.getItem(this.TOKEN_KEY));
      }
    };
    window.addEventListener('storage', sincronizar);
    inject(DestroyRef).onDestroy(() => window.removeEventListener('storage', sincronizar));
  }

  getToken(): string | null {
    return this.token();
  }

  setToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
    this.token.set(token);
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
    this.token.set(null);
  }
}
```
