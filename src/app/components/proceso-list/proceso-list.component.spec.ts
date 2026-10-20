import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { ProcesoListComponent } from './proceso-list.component';
import { ProcesoService } from '../../services/proceso.service';
import { ProcesoResponse } from '../../models/proceso-response';
import { PageResponse } from '../../models/page-response';

describe('ProcesoListComponent', () => {
  let fixture: ComponentFixture<ProcesoListComponent>;
  let component: ProcesoListComponent;
  let procesoService: jasmine.SpyObj<ProcesoService>;

  const proceso: ProcesoResponse = {
    id: 1, nombre: 'Compras', descripcion: 'Proceso de compras', categoria: 'Finanzas',
    estado: 'BORRADOR', activo: true,
    fechaCreacion: '2026-01-01T00:00:00', fechaModificacion: '2026-01-02T00:00:00'
  };
  const page: PageResponse<ProcesoResponse> = {
    content: [proceso], page: 0, size: 10, totalElements: 1, totalPages: 1
  };

  beforeEach(async () => {
    procesoService = jasmine.createSpyObj('ProcesoService', ['buscar']);
    procesoService.buscar.and.returnValue(of(page));

    await TestBed.configureTestingModule({
      imports: [ProcesoListComponent],
      providers: [
        provideRouter([]),
        { provide: ProcesoService, useValue: procesoService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ProcesoListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debe crearse', () => {
    expect(component).toBeTruthy();
  });

  it('debe buscar procesos al inicializar', () => {
    expect(procesoService.buscar).toHaveBeenCalledWith('', '', '', undefined, 0);
  });

  it('debe mostrar los procesos en la tabla', () => {
    const rows = fixture.nativeElement.querySelectorAll('tbody tr');
    expect(rows.length).toBe(1);
    expect(rows[0].textContent).toContain('Compras');
    expect(rows[0].textContent).toContain('Finanzas');
    expect(rows[0].textContent).toContain('BORRADOR');
  });
});
