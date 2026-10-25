import { Component, ChangeDetectionStrategy, inject, input, signal, computed } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { MensajeService } from '../../services/mensaje.service';
import { PoolService } from '../../services/pool.service';
import { MensajeResponse } from '../../models/mensaje.model';
import { PoolResponse } from '../../models/pool.model';

@Component({
  selector: 'app-mensaje-list',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './mensaje-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MensajeListComponent {
  private readonly mensajeService = inject(MensajeService);
  private readonly poolService = inject(PoolService);
  private readonly router = inject(Router);

  procesoId = input.required<string>();

  protected readonly status = signal<'loading' | 'success' | 'error'>('loading');
  protected readonly items = signal<MensajeResponse[]>([]);
  protected readonly pools = signal<PoolResponse[]>([]);
  protected readonly message = signal('');

  protected readonly nombresPool = computed(() => new Map(this.pools().map(p => [p.id, p.nombre])));

  ngOnInit(): void {
    this.poolService.listar(Number(this.procesoId())).subscribe({
      next: data => this.pools.set(data),
      error: () => this.message.set('No fue posible cargar los pools del proceso')
    });
    this.load();
  }

  load(): void {
    this.status.set('loading');
    this.mensajeService.listar(Number(this.procesoId())).subscribe({
      next: data => {
        this.items.set(data);
        this.status.set('success');
      },
      error: (err: HttpErrorResponse) => {
        this.message.set(err.error?.message ?? 'No fue posible cargar los mensajes');
        this.status.set('error');
      }
    });
  }

  editar(mensajeId: number): void {
    this.router.navigate(['/procesos', this.procesoId(), 'mensajes', mensajeId, 'editar']);
  }

  eliminar(mensajeId: number): void {
    this.mensajeService.eliminar(mensajeId).subscribe({
      next: () => this.load(),
      error: (err: HttpErrorResponse) => {
        this.message.set(err.error?.message ?? 'No fue posible eliminar el mensaje');
      }
    });
  }
}
