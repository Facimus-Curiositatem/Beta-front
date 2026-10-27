# Estudio H8 — Samuel

Actualizado: 25 de octubre de 2026. Rama: `feature/H8-roles-permisos`. Base: `feature/H1-registro-autenticacion`.

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

1. «Este PR contiene solo H8; los otros módulos están en ramas separadas».
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
    @if (tokens.esAdministrador()) {
      <a routerLink="/roles">Roles de proceso</a>
      <a routerLink="/permisos-estructura">Permisos de estructura</a>
    }
    <button type="button" (click)="cerrarSesion()" [disabled]="closing()">Cerrar sesión</button>
  </nav>
}
<main><router-outlet /></main>
```

### 2. `src/app/app.routes.ts`

**Propósito y qué hace:** Relaciona URLs con login, registro, roles, permisos, procesos compartidos y los pools/lanes existentes.

**Por qué así:** loadComponent carga la pantalla cuando se necesita. authGuard y adminGuard orientan el acceso desde el navegador. La ruta /procesos es un acceso temporal para integrar H3.

**Pregunta probable:** ¿Qué significa :id? Es un parámetro de ruta. withComponentInputBinding lo entrega al input id del componente.

```typescript
import { adminGuard } from './guards/admin.guard';
import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
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

### 3. `src/app/components/permiso-estructura/permiso-estructura.component.html`

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

### 4. `src/app/components/permiso-estructura/permiso-estructura.component.spec.ts`

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

### 5. `src/app/components/permiso-estructura/permiso-estructura.component.ts`

**Propósito y qué hace:** Muestra una fila por rol de acceso, seis casillas y guardado individual.

**Por qué así:** FormArray contiene grupos de campos, uno por fila recibida. Se envían booleanos reales; el rol se separa del body. Se usa la respuesta del servidor como configuración guardada.

**Pregunta probable:** ¿Qué es FormArray? Una colección de formularios del mismo tipo, útil cuando el número de filas se conoce al recibir la respuesta. ReturnType obtiene en TypeScript el tipo de grupo que devuelve fila(); no ejecuta nada adicional.

**OnPush en este archivo:** `@Component` declara la estrategia. Los signals de estado/datos usados por el HTML avisan cuando cambian. Los formularios continúan usando sus eventos y controles reactivos.

```typescript
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormArray, FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { PermisoEstructuraService } from '../../services/permiso-estructura.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
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

### 6. `src/app/components/rol-proceso-form/rol-proceso-form.component.html`

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

### 7. `src/app/components/rol-proceso-form/rol-proceso-form.component.spec.ts`

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

### 8. `src/app/components/rol-proceso-form/rol-proceso-form.component.ts`

**Propósito y qué hace:** Crea y edita roles, carga datos al cambiar id y permite reintentar una carga fallida.

**Por qué así:** Una pantalla sirve para crear y editar. loaded impide guardar un rol cuyo detalle no pudo cargarse. ngOnChanges atiende reutilización de la ruta; cancelar la carga anterior evita respuestas atrasadas.

**Pregunta probable:** ¿Por qué ngOnChanges en lugar de solo ngOnInit? Angular puede conservar el componente al cambiar /roles/7/editar por /roles/12/editar; cambia el input pero no repite ngOnInit.

**OnPush en este archivo:** `@Component` declara la estrategia. Los signals de estado/datos usados por el HTML avisan cuando cambian. Los formularios continúan usando sus eventos y controles reactivos.

```typescript
import { Subscription } from 'rxjs';
import { ChangeDetectionStrategy, Component, inject, input, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { RolProcesoService } from '../../services/rol-proceso.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
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

### 9. `src/app/components/rol-proceso-list/rol-proceso-list.component.html`

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

### 10. `src/app/components/rol-proceso-list/rol-proceso-list.component.spec.ts`

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

### 11. `src/app/components/rol-proceso-list/rol-proceso-list.component.ts`

**Propósito y qué hace:** Busca roles con paginación y muestra nombre, descripción, uso y acciones.

**Por qué así:** Se usa la consulta paginada del backend; enUso bloquea eliminar en la interfaz y el servidor rechaza igualmente un borrado inválido.

**Pregunta probable:** ¿Cómo calculamos cuántos procesos lo usan? Con procesos.length de la respuesta de consulta, sin inventar una propiedad del JSON.

**OnPush en este archivo:** `@Component` declara la estrategia. Los signals de estado/datos usados por el HTML avisan cuando cambian. Los formularios continúan usando sus eventos y controles reactivos.

```typescript
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { RolProcesoService } from '../../services/rol-proceso.service';
import { PageResponse } from '../../models/page-response.model';
import { RolProcesoConsultaResponse } from '../../models/rol-proceso.model';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
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

### 12. `src/app/h8.routes.spec.ts`

**Propósito:** comprueba la conducta observable del módulo mediante TestBed y peticiones controladas.

**Pregunta probable:** ¿Prueba la VM real? No, prueba la llamada y su resultado en Angular; falta el recorrido de integración contra el servidor.

```typescript
import { TestBed } from '@angular/core/testing';
import { provideRouter, withComponentInputBinding, Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { routes } from './app.routes';
import { TokenService } from './services/token.service';
import { RolProcesoFormComponent } from './components/rol-proceso-form/rol-proceso-form.component';

describe('Rutas administrativas H8', () => {
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
});
```

### 13. `src/app/models/page-response.model.ts`

**Propósito:** contrato compartido de respuesta, alineado con los DTOs reales y la rama H3.

**Por qué así:** reutilizar la misma estructura evita definir dos formas distintas del mismo JSON.

**Pregunta probable:** ¿Esto trae el CRUD H3? No; solo describe los datos.

```typescript
export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}
```

### 14. `src/app/models/permiso-estructura.model.ts`

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

### 15. `src/app/models/rol-proceso.model.ts`

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

### 16. `src/app/services/permiso-estructura.service.spec.ts`

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

### 17. `src/app/services/permiso-estructura.service.ts`

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

### 18. `src/app/services/rol-proceso.service.spec.ts`

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

### 19. `src/app/services/rol-proceso.service.ts`

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

import { PageResponse } from '../models/page-response.model';

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
