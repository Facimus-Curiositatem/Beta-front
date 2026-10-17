import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { PoolListComponent } from './pool-list.component';
import { PoolService } from '../../services/pool.service';
import { PoolResponse } from '../../models/pool.model';
import { Component } from '@angular/core';

// Wrapper para proveer el input requerido procesoId
@Component({
  standalone: true,
  imports: [PoolListComponent],
  template: '<app-pool-list />'
})
class TestHostComponent {}

describe('PoolListComponent', () => {
  let fixture: ComponentFixture<PoolListComponent>;
  let component: PoolListComponent;
  let poolService: jasmine.SpyObj<PoolService>;

  const pools: PoolResponse[] = [
    { id: 1, nombre: 'Empresa', tipoParticipante: 'EMPRESA', cajaNegra: false, orden: 0, procesoId: 10 }
  ];

  beforeEach(async () => {
    poolService = jasmine.createSpyObj('PoolService', ['listar', 'eliminar']);
    poolService.listar.and.returnValue(of(pools));

    await TestBed.configureTestingModule({
      imports: [PoolListComponent],
      providers: [
        provideRouter([]),
        { provide: PoolService, useValue: poolService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PoolListComponent);
    component = fixture.componentInstance;
    // Setear el input requerido via componentRef
    fixture.componentRef.setInput('procesoId', '10');
    fixture.detectChanges();
  });

  it('debe crearse', () => {
    expect(component).toBeTruthy();
  });

  it('debe cargar los pools al inicializar', () => {
    expect(poolService.listar).toHaveBeenCalledWith(10);
  });

  it('debe mostrar los pools en la tabla', () => {
    const rows = fixture.nativeElement.querySelectorAll('tbody tr');
    expect(rows.length).toBe(1);
    expect(rows[0].textContent).toContain('Empresa');
  });
});
