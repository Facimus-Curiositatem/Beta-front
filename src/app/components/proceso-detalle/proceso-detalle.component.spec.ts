import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { ProcesoDetalleComponent } from './proceso-detalle.component';
import { ProcesoService } from '../../services/proceso.service';
import { ProcesoDetalleResponse, ProcesoResponse } from '../../models/proceso.model';

describe('ProcesoDetalleComponent', () => {
  let fixture: ComponentFixture<ProcesoDetalleComponent>;
  let component: ProcesoDetalleComponent;
  let procesoService: jasmine.SpyObj<ProcesoService>;
  let router: Router;

  const proceso: ProcesoResponse = {
    id: 1, nombre: 'Compras', descripcion: 'Proceso de compras', categoria: 'Finanzas',
    estado: 'BORRADOR', activo: true,
    fechaCreacion: '2026-01-01T00:00:00', fechaModificacion: '2026-01-02T00:00:00'
  };
  const detalle: ProcesoDetalleResponse = {
    proceso,
    historial: [
      { id: 1, fechaCambio: '2026-01-02T00:00:00', descripcionCambio: 'Proceso creado', autorNombre: 'Ana' }
    ]
  };

  function crear(): void {
    fixture = TestBed.createComponent(ProcesoDetalleComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('id', '1');
    fixture.detectChanges();
  }

  beforeEach(async () => {
    procesoService = jasmine.createSpyObj('ProcesoService', ['obtener', 'cambiarEstado', 'eliminar']);
    procesoService.obtener.and.returnValue(of(detalle));
    procesoService.cambiarEstado.and.returnValue(of({ ...proceso, estado: 'PUBLICADO' }));
    procesoService.eliminar.and.returnValue(of(void 0));

    await TestBed.configureTestingModule({
      imports: [ProcesoDetalleComponent],
      providers: [
        provideRouter([]),
        { provide: ProcesoService, useValue: procesoService }
      ]
    }).compileComponents();

    router = TestBed.inject(Router);
    spyOn(router, 'navigate').and.resolveTo(true);
  });

  it('debe cargar el proceso al inicializar', () => {
    crear();
    expect(component).toBeTruthy();
    expect(procesoService.obtener).toHaveBeenCalledWith(1);
  });

  it('debe mostrar los datos del proceso y su historial', () => {
    crear();
    const texto = fixture.nativeElement.textContent;
    expect(texto).toContain('Compras');
    expect(texto).toContain('Finanzas');
    expect(fixture.nativeElement.querySelectorAll('li').length).toBe(1);
    expect(texto).toContain('Ana: Proceso creado');
  });

  it('muestra mensaje cuando el historial esta vacio', () => {
    procesoService.obtener.and.returnValue(of({ proceso, historial: [] }));
    crear();
    expect(fixture.nativeElement.textContent).toContain('No hay cambios registrados.');
  });

  it('muestra el boton Publicar solo si el proceso esta en BORRADOR', () => {
    crear();
    expect(fixture.nativeElement.textContent).toContain('Publicar');

    procesoService.obtener.and.returnValue(of({ ...detalle, proceso: { ...proceso, estado: 'PUBLICADO' } }));
    component.load();
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).not.toContain('Publicar');
  });

  it('publicar cambia el estado a PUBLICADO y recarga', () => {
    crear();
    component.publicar();
    expect(procesoService.cambiarEstado).toHaveBeenCalledWith(1, { estado: 'PUBLICADO' });
    expect(procesoService.obtener).toHaveBeenCalledTimes(2);
  });

  it('eliminar borra el proceso y vuelve a la lista', () => {
    crear();
    component.eliminar();
    expect(procesoService.eliminar).toHaveBeenCalledWith(1);
    expect(router.navigate).toHaveBeenCalledWith(['/procesos']);
  });

  it('muestra el mensaje del backend si falla la carga', () => {
    procesoService.obtener.and.returnValue(throwError(() => ({ error: { detail: 'Proceso no encontrado' } })));
    crear();
    expect(fixture.nativeElement.textContent).toContain('Proceso no encontrado');
    expect(fixture.nativeElement.textContent).toContain('Reintentar');
  });
});
