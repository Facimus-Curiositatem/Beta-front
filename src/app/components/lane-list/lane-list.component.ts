import { Component, ChangeDetectionStrategy, inject, input, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { LaneService } from '../../services/lane.service';
import { LaneResponse } from '../../models/lane.model';

@Component({
  selector: 'app-lane-list',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './lane-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LaneListComponent {
  private readonly laneService = inject(LaneService);
  private readonly router = inject(Router);

  id = input.required<string>();

  protected readonly status = signal<'loading' | 'success' | 'error'>('loading');
  protected readonly items = signal<LaneResponse[]>([]);
  protected readonly message = signal('');

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
        this.message.set(err.error?.message ?? 'No fue posible cargar los lanes');
        this.status.set('error');
      }
    });
  }

  eliminar(laneId: number): void {
    this.laneService.eliminar(laneId).subscribe({
      next: () => this.load(),
      error: (err: HttpErrorResponse) => {
        this.message.set(err.error?.message ?? 'No fue posible eliminar el lane');
      }
    });
  }

  editar(laneId: number): void {
    this.router.navigate(['/pools', this.id(), 'lanes', laneId, 'editar']);
  }

  subirOrden(index: number): void {
    if (index === 0) return;
    const ids = this.items().map(l => l.id);
    [ids[index - 1], ids[index]] = [ids[index], ids[index - 1]];
    this.reordenar(ids);
  }

  bajarOrden(index: number): void {
    const lanes = this.items();
    if (index === lanes.length - 1) return;
    const ids = lanes.map(l => l.id);
    [ids[index], ids[index + 1]] = [ids[index + 1], ids[index]];
    this.reordenar(ids);
  }

  private reordenar(laneIds: number[]): void {
    this.laneService.reordenar(Number(this.id()), { laneIds }).subscribe({
      next: data => this.items.set(data),
      error: (err: HttpErrorResponse) => {
        this.message.set(err.error?.message ?? 'No fue posible reordenar los lanes');
      }
    });
  }
}
