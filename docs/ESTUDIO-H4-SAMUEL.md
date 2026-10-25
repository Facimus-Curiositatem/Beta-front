# Estudio H4 — Samuel

Actualizado: 25 de octubre de 2026. Rama: `feature/H4-procesos-compartidos`. Base: `feature/H1-registro-autenticacion`.

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

1. «Este PR contiene solo H4; los otros módulos están en ramas separadas».
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
    <a routerLink="/procesos-compartidos">Compartidos conmigo</a>
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

### 3. `src/app/components/compartir-proceso/compartir-proceso.component.html`

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

### 4. `src/app/components/compartir-proceso/compartir-proceso.component.spec.ts`

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

### 5. `src/app/components/compartir-proceso/compartir-proceso.component.ts`

**Propósito y qué hace:** Comparte con un ID de empresa, lista invitados y permite revocar con confirmación.

**Por qué así:** El backend determina propiedad y empresa autenticada. empresaInvitadaId identifica a quién se revoca. Se recarga al cambiar el proceso y se cancela la consulta anterior.

**Pregunta probable:** ¿Por qué no usar item.id al revocar? El contrato de DELETE pide el ID de la empresa invitada, no el ID del registro ProcesoCompartido.

**OnPush en este archivo:** `@Component` declara la estrategia. Los signals de estado/datos usados por el HTML avisan cuando cambian. Los formularios continúan usando sus eventos y controles reactivos.

```typescript
import { Subscription } from 'rxjs';
import { ChangeDetectionStrategy, Component, inject, input, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { ProcesoCompartidoService } from '../../services/proceso-compartido.service';
import { ProcesoCompartidoResponse } from '../../models/proceso-compartido.model';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
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
  @if (tokens.esAdministrador()) {
    <button type="button" (click)="compartir()" [disabled]="form.invalid">Compartir proceso</button>
  }
</form>
```

### 7. `src/app/components/inicio-procesos/inicio-procesos.component.spec.ts`

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

### 8. `src/app/components/inicio-procesos/inicio-procesos.component.ts`

**Propósito y qué hace:** Ofrece enlaces y abre pools o compartir usando un ID de proceso existente.

**Por qué así:** Es un punto de integración temporal: main carece de H3. No crea datos ficticios ni pretende reemplazar el CRUD del compañero.

**Pregunta probable:** ¿Qué se debe cambiar al llegar H3? La ruta /procesos debe apuntar a su listado; sus enlaces deben abrir /procesos/:id/pools y /procesos/:id/compartir.

**OnPush en este archivo:** `@Component` declara la estrategia. Los signals de estado/datos usados por el HTML avisan cuando cambian. Los formularios continúan usando sus eventos y controles reactivos.

```typescript
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

// Punto de acceso temporal hasta integrar el listado H3 del compañero.
import { TokenService } from '../../services/token.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
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

### 9. `src/app/components/proceso-compartido-detalle/proceso-compartido-detalle.component.html`

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

### 10. `src/app/components/proceso-compartido-detalle/proceso-compartido-detalle.component.spec.ts`

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

### 11. `src/app/components/proceso-compartido-detalle/proceso-compartido-detalle.component.ts`

**Propósito y qué hace:** Muestra datos generales, pools, lanes, actividades, gateways, eventos, arcos y mensajes.

**Por qué así:** Es una vista de lectura con tablas simples, sin editor gráfico ni formulario. Recargar borra el detalle viejo; un acceso revocado se informa con el error real del backend.

**Pregunta probable:** ¿Se garantiza solo lectura quitando botones? Los botones reflejan la restricción, pero la garantía depende de las reglas del backend y su comprobación de empresa propietaria.

**OnPush en este archivo:** `@Component` declara la estrategia. Los signals de estado/datos usados por el HTML avisan cuando cambian. Los formularios continúan usando sus eventos y controles reactivos.

```typescript
import { Subscription } from 'rxjs';
import { ChangeDetectionStrategy, Component, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { ProcesoCompartidoService } from '../../services/proceso-compartido.service';
import { ProcesoCompartidoDetalleResponse } from '../../models/proceso-compartido.model';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
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

### 12. `src/app/components/procesos-compartidos-list/procesos-compartidos-list.component.html`

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

### 13. `src/app/components/procesos-compartidos-list/procesos-compartidos-list.component.spec.ts`

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

### 14. `src/app/components/procesos-compartidos-list/procesos-compartidos-list.component.ts`

**Propósito y qué hace:** Lista procesos recibidos con propietario y enlace a detalle.

**Por qué así:** El enlace usa procesoId. Solo consulta datos que el backend permite a la empresa autenticada.

**Pregunta probable:** ¿Cómo sabemos cuáles son de nuestra empresa? El endpoint utiliza principal.empresaId(); no hace falta enviar el ID de empresa en la URL.

**OnPush en este archivo:** `@Component` declara la estrategia. Los signals de estado/datos usados por el HTML avisan cuando cambian. Los formularios continúan usando sus eventos y controles reactivos.

```typescript
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { ProcesoCompartidoService } from '../../services/proceso-compartido.service';
import { ProcesoCompartidoResponse } from '../../models/proceso-compartido.model';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
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

### 15. `src/app/h4.routes.spec.ts`

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
import { CompartirProcesoComponent } from './components/compartir-proceso/compartir-proceso.component';

describe('Rutas de procesos compartidos H4', () => {
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
    await h.navigateByUrl('/procesos/10/compartir');
    expect(TestBed.inject(Router).url).toBe('/login');
  });
  it('impide a editor abrir administración', async () => {
    login('EDITOR');
    const h = await RouterTestingHarness.create();
    await h.navigateByUrl('/procesos/10/compartir');
    expect(TestBed.inject(Router).url).toContain('/procesos?aviso=sin-permiso');
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

### 16. `src/app/models/historial.model.ts`

**Propósito:** contrato compartido de respuesta, alineado con los DTOs reales y la rama H3.

**Por qué así:** reutilizar la misma estructura evita definir dos formas distintas del mismo JSON.

**Pregunta probable:** ¿Esto trae el CRUD H3? No; solo describe los datos.

```typescript
export interface HistorialCambioResponse {
  id: number;
  fechaCambio: string;
  descripcionCambio: string;
  autorNombre: string;
}
```

### 17. `src/app/models/nodos-compartidos.model.ts`

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

### 18. `src/app/models/proceso-compartido.model.ts`

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

### 19. `src/app/models/proceso.model.ts`

**Propósito y qué hace:** Describe ProcesoResponse recibido dentro de un proceso compartido.

**Por qué así:** H3 aún no está en main. Este contrato copia el record real del backend y puede ser reutilizado al integrarlo, sin añadir un CRUD ajeno.

**Pregunta probable:** ¿Por qué fechas string? Porque HTTP transporta JSON y las fechas Java se serializan como texto; no son objetos Date automáticamente.

```typescript
import { HistorialCambioResponse } from './historial.model';

export type EstadoProceso = 'BORRADOR' | 'PUBLICADO';

export interface ProcesoResponse {
  id: number;
  nombre: string;
  descripcion: string;
  categoria: string;
  estado: EstadoProceso;
  activo: boolean;
  fechaCreacion: string;
  fechaModificacion: string;
}

export interface ProcesoRequest {
  nombre: string;
  descripcion: string;
  categoria: string;
}

export interface EditarProcesoRequest {
  nombre: string;
  descripcion: string;
  categoria: string;
}

export interface CambiarEstadoRequest {
  estado: EstadoProceso;
}

export interface ProcesoDetalleResponse {
  proceso: ProcesoResponse;
  historial: HistorialCambioResponse[];
}

// Tipo minimo: el backend aun no documenta los campos del diagrama.
export interface ProcesoDiagramaResponse {
  [clave: string]: unknown;
}
```

### 20. `src/app/services/proceso-compartido.service.spec.ts`

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

### 21. `src/app/services/proceso-compartido.service.ts`

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

### 22. `src/app/testing/compartidos.fixture.ts`

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
