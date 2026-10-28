import { Component, ChangeDetectionStrategy, inject, input, signal, computed } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { map, of, switchMap } from 'rxjs';
import { ArcoService } from '../../services/arco.service';
import { NodoFlujoService } from '../../services/nodo-flujo.service';
import { ArcoResponse } from '../../models/arco.model';
import { NodoFlujo } from '../../models/nodo-flujo.model';
import { TramoNavegacion } from '../../models/navegacion.model';
import { RutaNavegacionComponent } from '../ruta-navegacion/ruta-navegacion.component';

@Component({
  selector: 'app-arco-list',
  standalone: true,
  imports: [RouterLink, RutaNavegacionComponent],
  templateUrl: './arco-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ArcoListComponent {
  private readonly arcoService = inject(ArcoService);
  private readonly nodoFlujoService = inject(NodoFlujoService);
  private readonly router = inject(Router);

  poolId = input.required<string>();
  tramos = input<TramoNavegacion[]>([]);

  protected readonly status = signal<'loading' | 'success' | 'error'>('loading');
  protected readonly items = signal<ArcoResponse[]>([]);
  protected readonly nodos = signal<NodoFlujo[]>([]);
  protected readonly message = signal('');

  protected readonly nombresNodo = computed(() => new Map(this.nodos().map(n => [n.id, n.nombre])));

  ngOnInit(): void {
    this.nodoFlujoService.listarPorPool(Number(this.poolId())).subscribe({
      next: data => this.nodos.set(data),
      error: () => this.message.set('No fue posible cargar los nodos del pool')
    });
    this.load();
  }

  load(): void {
    this.status.set('loading');
    this.arcoService.listar(Number(this.poolId())).subscribe({
      next: data => {
        this.items.set(data);
        this.status.set('success');
      },
      error: (err: HttpErrorResponse) => {
        this.message.set(err.error?.message ?? 'No fue posible cargar los arcos');
        this.status.set('error');
      }
    });
  }

  editar(arcoId: number): void {
    this.router.navigate(['/pools', this.poolId(), 'arcos', arcoId, 'editar']);
  }

  /** Consulta el impacto antes de borrar y pide confirmacion si el backend lo exige. */
  eliminar(arcoId: number): void {
    this.message.set('');
    this.arcoService.evaluarImpacto(arcoId).pipe(
      switchMap(impacto => {
        const confirmado = !impacto.requiereConfirmacion
          || confirm(`${impacto.advertencias.join('\n')}\n\nDesea eliminar el arco?`);
        return confirmado ? this.arcoService.eliminar(arcoId).pipe(map(() => true)) : of(false);
      })
    ).subscribe({
      next: eliminado => {
        if (eliminado) this.load();
      },
      error: (err: HttpErrorResponse) => {
        this.message.set(err.error?.message ?? 'No fue posible eliminar el arco');
      }
    });
  }
}
