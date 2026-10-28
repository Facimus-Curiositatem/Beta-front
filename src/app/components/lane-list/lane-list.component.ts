import { Component, ChangeDetectionStrategy, inject, input, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { CdkDrag, CdkDragDrop, CdkDragHandle, CdkDragPreview, CdkDropList, moveItemInArray } from '@angular/cdk/drag-drop';
import { LaneService } from '../../services/lane.service';
import { LaneResponse } from '../../models/lane.model';
import { PoolResponse } from '../../models/pool.model';
import { TramoNavegacion } from '../../models/navegacion.model';
import { RutaNavegacionComponent } from '../ruta-navegacion/ruta-navegacion.component';

@Component({
  selector: 'app-lane-list',
  standalone: true,
  imports: [RouterLink, CdkDropList, CdkDrag, CdkDragHandle, CdkDragPreview, RutaNavegacionComponent],
  templateUrl: './lane-list.component.html',
  styleUrl: './lane-list.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LaneListComponent {
  private readonly laneService = inject(LaneService);
  private readonly router = inject(Router);

  id = input.required<string>();
  pool = input<PoolResponse | null>(null);
  tramos = input<TramoNavegacion[]>([]);

  protected readonly status = signal<'loading' | 'success' | 'error'>('loading');
  protected readonly items = signal<LaneResponse[]>([]);
  protected readonly message = signal('');
  protected readonly guardando = signal(false);
  protected readonly aviso = signal('');

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.status.set('loading');
    this.laneService.listar(Number(this.id())).subscribe({
      next: data => {
        this.items.set(data);
        this.status.set('success');
      },
      error: (err: HttpErrorResponse) => {
        this.message.set(err.error?.detail ?? 'No fue posible cargar los lanes');
        this.status.set('error');
      }
    });
  }

  eliminar(laneId: number): void {
    this.laneService.eliminar(laneId).subscribe({
      next: () => this.load(),
      error: (err: HttpErrorResponse) => {
        this.message.set(err.error?.detail ?? 'No fue posible eliminar el lane');
      }
    });
  }

  editar(laneId: number): void {
    this.router.navigate(['/pools', this.id(), 'lanes', laneId, 'editar']);
  }

  subirOrden(index: number): void {
    if (index === 0) return;
    this.reordenar(index, index - 1);
  }

  bajarOrden(index: number): void {
    if (index === this.items().length - 1) return;
    this.reordenar(index, index + 1);
  }

  soltar(event: CdkDragDrop<LaneResponse[]>): void {
    if (event.previousIndex === event.currentIndex) return;
    this.reordenar(event.previousIndex, event.currentIndex);
  }

  // Se muestra el nuevo orden de inmediato y se revierte si el backend lo rechaza.
  private reordenar(desde: number, hasta: number): void {
    const anterior = this.items();
    const nuevo = [...anterior];
    moveItemInArray(nuevo, desde, hasta);
    this.items.set(nuevo);
    this.guardando.set(true);
    this.message.set('');
    this.aviso.set('');

    this.laneService.reordenar(Number(this.id()), { laneIds: nuevo.map(l => l.id) }).subscribe({
      next: data => {
        this.items.set(data);
        this.guardando.set(false);
        this.aviso.set('Orden guardado');
      },
      error: (err: HttpErrorResponse) => {
        this.items.set(anterior);
        this.guardando.set(false);
        this.message.set(err.error?.detail ?? 'No fue posible reordenar los lanes');
      }
    });
  }
}
