import { Component, ChangeDetectionStrategy, inject, input, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { PoolService } from '../../services/pool.service';
import { PoolResponse } from '../../models/pool.model';
import { LanesPorPool, TramoNavegacion } from '../../models/navegacion.model';
import { RutaNavegacionComponent } from '../ruta-navegacion/ruta-navegacion.component';

@Component({
  selector: 'app-pool-list',
  standalone: true,
  imports: [RouterLink, RutaNavegacionComponent],
  templateUrl: './pool-list.component.html',
  styleUrl: './pool-list.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PoolListComponent {
  private readonly poolService = inject(PoolService);
  private readonly router = inject(Router);

  procesoId = input.required<string>();
  tramos = input<TramoNavegacion[]>([]);
  lanesPorPool = input<LanesPorPool>({});

  protected readonly status = signal<'loading' | 'success' | 'error'>('loading');
  protected readonly items = signal<PoolResponse[]>([]);
  protected readonly message = signal('');

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.status.set('loading');
    this.poolService.listar(Number(this.procesoId())).subscribe({
      next: data => {
        this.items.set(data);
        this.status.set('success');
      },
      error: (err: HttpErrorResponse) => {
        this.message.set(err.error?.detail ?? 'No fue posible cargar los pools');
        this.status.set('error');
      }
    });
  }

  eliminar(id: number): void {
    this.poolService.eliminar(id).subscribe({
      next: () => this.load(),
      error: (err: HttpErrorResponse) => {
        this.message.set(err.error?.detail ?? 'No fue posible eliminar el pool');
      }
    });
  }

  editar(id: number): void {
    this.router.navigate(['/procesos', this.procesoId(), 'pools', id, 'editar']);
  }

  verLanes(poolId: number): void {
    this.router.navigate(['/pools', poolId, 'lanes']);
  }
}
