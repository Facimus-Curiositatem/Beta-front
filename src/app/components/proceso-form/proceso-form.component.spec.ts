import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { ProcesoFormComponent } from './proceso-form.component';
import { ProcesoService } from '../../services/proceso.service';
import { ProcesoDetalleResponse, ProcesoResponse } from '../../models/proceso.model';

describe('ProcesoFormComponent', () => {
  let fixture: ComponentFixture<ProcesoFormComponent>;
  let component: ProcesoFormComponent;
  let procesoService: jasmine.SpyObj<ProcesoService>;
  let router: Router;

  const proceso: ProcesoResponse = {
    id: 1, nombre: 'Compras', descripcion: 'Proceso de compras', categoria: 'Finanzas',
    estado: 'BORRADOR', activo: true,
    fechaCreacion: '2026-01-01T00:00:00', fechaModificacion: '2026-01-02T00:00:00'
  };
  const detalle: ProcesoDetalleResponse = { proceso, historial: [] };

  function crear(id?: string): void {
    fixture = TestBed.createComponent(ProcesoFormComponent);
    component = fixture.componentInstance;
    if (id) fixture.componentRef.setInput('id', id);
    fixture.detectChanges();
  }

  beforeEach(async () => {
    procesoService = jasmine.createSpyObj('ProcesoService', ['crear', 'editar', 'obtener']);
    procesoService.crear.and.returnValue(of(proceso));
    procesoService.editar.and.returnValue(of(proceso));
    procesoService.obtener.and.returnValue(of(detalle));

    await TestBed.configureTestingModule({
      imports: [ProcesoFormComponent],
      providers: [
        provideRouter([]),
        { provide: ProcesoService, useValue: procesoService }
      ]
    }).compileComponents();

    router = TestBed.inject(Router);
    spyOn(router, 'navigate').and.resolveTo(true);
  });

  it('debe crearse en modo creacion sin cargar ningun proceso', () => {
    crear();
    expect(component).toBeTruthy();
    expect(procesoService.obtener).not.toHaveBeenCalled();
    expect(fixture.nativeElement.textContent).toContain('Crear proceso');
  });

  it('no envia el formulario si faltan campos obligatorios', () => {
    crear();
    component.submit();
    expect(procesoService.crear).not.toHaveBeenCalled();
    expect(component['form'].controls.nombre.touched).toBeTrue();
  });

  it('submit crea el proceso y navega a su detalle', () => {
    crear();
    component['form'].setValue({ nombre: 'Compras', descripcion: 'Proceso de compras', categoria: 'Finanzas' });
    component.submit();
    expect(procesoService.crear).toHaveBeenCalledWith({
      nombre: 'Compras', descripcion: 'Proceso de compras', categoria: 'Finanzas'
    });
    expect(router.navigate).toHaveBeenCalledWith(['/procesos', 1]);
  });

  it('en edicion carga el proceso y rellena el formulario', () => {
    crear('1');
    expect(procesoService.obtener).toHaveBeenCalledWith(1);
    expect(component['form'].getRawValue()).toEqual({
      nombre: 'Compras', descripcion: 'Proceso de compras', categoria: 'Finanzas'
    });
    expect(fixture.nativeElement.textContent).toContain('Editar proceso');
  });

  it('en edicion submit llama a editar con el id', () => {
    crear('1');
    component['form'].patchValue({ nombre: 'Compras v2' });
    component.submit();
    expect(procesoService.editar).toHaveBeenCalledWith(1, jasmine.objectContaining({ nombre: 'Compras v2' }));
  });

  it('muestra el mensaje del backend si falla el guardado', () => {
    procesoService.crear.and.returnValue(throwError(() => ({ error: { detail: 'Nombre duplicado' } })));
    crear();
    component['form'].setValue({ nombre: 'Compras', descripcion: 'Proceso de compras', categoria: 'Finanzas' });
    component.submit();
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Nombre duplicado');
    expect(component['saving']()).toBeFalse();
  });
});
