import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { debounceTime, finalize } from 'rxjs';
import { PageResponse } from '../../models/page-response.model';
import { EstadoProceso, FiltrosProceso, Proceso } from '../../models/proceso.model';
import { ProcesoService } from '../../service/proceso.service';
import { TokenService } from '../../service/token.service';
import { mensajeDeError } from '../../utils/mensaje-error';

/** HU-07: lista paginada de procesos de la empresa, con busqueda y filtros. */
@Component({
  selector: 'app-proceso-list',
  imports: [ReactiveFormsModule, RouterLink, DatePipe],
  templateUrl: './proceso-list.component.html',
  styleUrl: './proceso-list.component.scss',
})
export class ProcesoListComponent implements OnInit {
  private procesoService = inject(ProcesoService);
  private tokenService = inject(TokenService);
  private destroyRef = inject(DestroyRef);

  filtros = new FormGroup({
    nombre: new FormControl<string | null>(''),
    estado: new FormControl<EstadoProceso | null>(null),
    categoria: new FormControl<string | null>(''),
    verEliminados: new FormControl<boolean | null>(false),
  });

  resultado: PageResponse<Proceso> | null = null;
  pagina = 0;
  cargando = false;
  error: string | null = null;
  procesoAEliminar: Proceso | null = null;

  // HU-05: solo administrador o editor modifican. HU-06: solo el administrador elimina.
  puedeEditar = this.tokenService.tieneRol('ADMINISTRADOR', 'EDITOR');
  puedeEliminar = this.tokenService.tieneRol('ADMINISTRADOR');

  ngOnInit(): void {
    this.filtros.valueChanges
      .pipe(debounceTime(300), takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.pagina = 0;
        this.cargar();
      });
    this.cargar();
  }

  cargar(): void {
    this.cargando = true;
    this.error = null;
    this.procesoService
      .buscar(this.filtros.getRawValue() as FiltrosProceso, this.pagina)
      .pipe(finalize(() => (this.cargando = false)))
      .subscribe({
        next: (pagina) => (this.resultado = pagina),
        error: (err: HttpErrorResponse) => (this.error = mensajeDeError(err)),
      });
  }

  irAPagina(pagina: number): void {
    this.pagina = pagina;
    this.cargar();
  }

  publicar(proceso: Proceso): void {
    this.procesoService.cambiarEstado(proceso.id, 'PUBLICADO').subscribe({
      next: () => this.cargar(),
      error: (err: HttpErrorResponse) => (this.error = mensajeDeError(err)),
    });
  }

  confirmarEliminacion(): void {
    if (!this.procesoAEliminar) {
      return;
    }
    // Eliminacion logica en el backend (HU-06); la lista se recarga con la respuesta.
    this.procesoService.eliminar(this.procesoAEliminar.id).subscribe({
      next: () => {
        this.procesoAEliminar = null;
        this.cargar();
      },
      error: (err: HttpErrorResponse) => (this.error = mensajeDeError(err)),
    });
  }
}
