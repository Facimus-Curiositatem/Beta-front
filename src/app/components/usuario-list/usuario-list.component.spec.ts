import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';

import { UsuarioListComponent } from './usuario-list.component';
import { UsuarioService } from '../../services/usuario.service';
import { UsuarioResponse } from '../../models/usuario.model';

describe('UsuarioListComponent', () => {
  let fixture: ComponentFixture<UsuarioListComponent>;
  let service: jasmine.SpyObj<UsuarioService>;

  const usuarios: UsuarioResponse[] = [
    { id: 1, nombre: 'Juan', email: 'juan@correo.com', rolAcceso: 'ADMINISTRADOR', activo: true },
    { id: 2, nombre: 'Ana', email: 'ana@correo.com', rolAcceso: 'EDITOR', activo: false },
  ];

  beforeEach(async () => {
    service = jasmine.createSpyObj('UsuarioService', ['list', 'delete']);
    service.list.and.returnValue(of(usuarios));
    service.delete.and.returnValue(of(undefined));

    await TestBed.configureTestingModule({
      imports: [UsuarioListComponent],
      providers: [provideRouter([]), { provide: UsuarioService, useValue: service }],
    }).compileComponents();

    fixture = TestBed.createComponent(UsuarioListComponent);
    fixture.detectChanges();
  });

  it('muestra una fila por cada usuario', () => {
    const filas = fixture.nativeElement.querySelectorAll('tbody tr');
    expect(filas.length).toBe(2);
    expect(filas[0].textContent).toContain('Juan');
  });

  it('muestra el mensaje de error si el back falla', () => {
    service.list.and.returnValue(
      throwError(() => new HttpErrorResponse({ status: 500, error: { detail: 'Fallo del servidor' } })),
    );
    const f = TestBed.createComponent(UsuarioListComponent);
    f.detectChanges();

    expect(f.nativeElement.querySelector('.error').textContent).toContain('Fallo del servidor');
  });

  it('desactivar() llama al servicio y recarga la lista', () => {
    spyOn(window, 'confirm').and.returnValue(true);

    fixture.nativeElement.querySelector('button.desactivar').click();

    expect(service.delete).toHaveBeenCalledWith(1);
    expect(service.list).toHaveBeenCalledTimes(2);
  });
});