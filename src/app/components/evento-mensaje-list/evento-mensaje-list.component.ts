import { Component, ChangeDetectionStrategy, inject, input, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { EventoMensajeService } from '../../services/evento-mensaje.service';
import { EventoMensajeResponse } from '../../models/evento-mensaje.model';
import { TramoNavegacion } from '../../models/navegacion.model';
import { RutaNavegacionComponent } from '../ruta-navegacion/ruta-navegacion.component';

@Component({
  selector: 'app-evento-mensaje-list',
  standalone: true,
  imports: [RouterLink, RutaNavegacionComponent],
  templateUrl: './evento-mensaje-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EventoMensajeListComponent {
  private readonly eventoMensajeService = inject(EventoMensajeService);
  private readonly router = inject(Router);

  laneId = input.required<string>();
  tramos = input<TramoNavegacion[]>([]);

  protected readonly status = signal<'loading' | 'success' | 'error'>('loading');
  protected readonly items = signal<EventoMensajeResponse[]>([]);
  protected readonly message = signal('');

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.status.set('loading');
    this.eventoMensajeService.listar(Number(this.laneId())).subscribe({
      next: data => {
        this.items.set(data);
        this.status.set('success');
      },
      error: (err: HttpErrorResponse) => {
        this.message.set(err.error?.message ?? 'No fue posible cargar los eventos de mensaje');
        this.status.set('error');
      }
    });
  }

  editar(eventoId: number): void {
    this.router.navigate(['/lanes', this.laneId(), 'eventos-mensaje', eventoId, 'editar']);
  }

  eliminar(eventoId: number): void {
    this.eventoMensajeService.eliminar(eventoId).subscribe({
      next: () => this.load(),
      error: (err: HttpErrorResponse) => {
        this.message.set(err.error?.message ?? 'No fue posible eliminar el evento de mensaje');
      }
    });
  }
}
