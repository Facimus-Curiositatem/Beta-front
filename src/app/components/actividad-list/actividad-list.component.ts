import { Component, ChangeDetectionStrategy, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { ActividadService } from '../../services/actividad.service';
import { ActividadResponse } from '../../models/actividad.model';
import { ImpactoEliminacionResponse } from '../../models/impacto-eliminacion.model';
import { ConfirmarEliminacionComponent } from '../confirmar-eliminacion/confirmar-eliminacion.component';

@Component({
  selector: 'app-actividad-list',
  standalone: true,
  imports: [RouterLink, ConfirmarEliminacionComponent],
  templateUrl: './actividad-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ActividadListComponent {
  private readonly actividadService = inject(ActividadService);

  laneId = input.required<string>();

  protected readonly status = signal<'loading' | 'success' | 'error'>('loading');
  protected readonly items = signal<ActividadResponse[]>([]);
  protected readonly message = signal('');
  protected readonly eliminacion = signal<{
    actividad: ActividadResponse;
    impacto: ImpactoEliminacionResponse;
  } | null>(null);

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.status.set('loading');
    this.message.set('');
    this.actividadService.listar(Number(this.laneId())).subscribe({
      next: data => {
        this.items.set(data);
        this.status.set('success');
      },
      error: (err: HttpErrorResponse) => {
        this.message.set(
          err.status === 0
            ? 'No hay conexión con el servidor'
            : (err.error?.detail ?? 'No fue posible cargar las actividades')
        );
        this.status.set('error');
      }
    });
  }

  pedirEliminar(actividad: ActividadResponse): void {
    this.message.set('');
    this.actividadService.evaluarImpacto(actividad.id).subscribe({
      next: impacto => this.eliminacion.set({ actividad, impacto }),
      error: (err: HttpErrorResponse) => {
        this.message.set(err.error?.detail ?? 'No fue posible evaluar el impacto');
      }
    });
  }

  confirmarEliminar(): void {
    const pendiente = this.eliminacion();
    if (!pendiente) return;

    this.actividadService.eliminar(pendiente.actividad.id).subscribe({
      next: () => {
        this.eliminacion.set(null);
        this.load();
      },
      error: (err: HttpErrorResponse) => {
        this.eliminacion.set(null);
        this.message.set(err.error?.detail ?? 'No fue posible eliminar la actividad');
      }
    });
  }

  cancelarEliminar(): void {
    this.eliminacion.set(null);
  }
}