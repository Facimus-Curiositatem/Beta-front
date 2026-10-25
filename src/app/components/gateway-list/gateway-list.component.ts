import { Component, ChangeDetectionStrategy, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { GatewayService } from '../../services/gateway.service';
import { GatewayResponse } from '../../models/gateway.model';
import { ImpactoEliminacionResponse } from '../../models/impacto-eliminacion.model';
import { ConfirmarEliminacionComponent } from '../confirmar-eliminacion/confirmar-eliminacion.component';

@Component({
  selector: 'app-gateway-list',
  standalone: true,
  imports: [RouterLink, ConfirmarEliminacionComponent],
  templateUrl: './gateway-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GatewayListComponent {
  private readonly gatewayService = inject(GatewayService);

  laneId = input.required<string>();

  protected readonly status = signal<'loading' | 'success' | 'error'>('loading');
  protected readonly items = signal<GatewayResponse[]>([]);
  protected readonly message = signal('');
  protected readonly eliminacion = signal<{
    gateway: GatewayResponse;
    impacto: ImpactoEliminacionResponse;
  } | null>(null);

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.status.set('loading');
    this.message.set('');
    this.gatewayService.listar(Number(this.laneId())).subscribe({
      next: data => {
        this.items.set(data);
        this.status.set('success');
      },
      error: (err: HttpErrorResponse) => {
        this.message.set(
          err.status === 0
            ? 'No hay conexión con el servidor'
            : (err.error?.detail ?? 'No fue posible cargar los gateways')
        );
        this.status.set('error');
      }
    });
  }

  pedirEliminar(gateway: GatewayResponse): void {
    this.message.set('');
    this.gatewayService.evaluarImpacto(gateway.id).subscribe({
      next: impacto => this.eliminacion.set({ gateway, impacto }),
      error: (err: HttpErrorResponse) => {
        this.message.set(err.error?.detail ?? 'No fue posible evaluar el impacto');
      }
    });
  }

  confirmarEliminar(): void {
    const pendiente = this.eliminacion();
    if (!pendiente) return;

    this.gatewayService.eliminar(pendiente.gateway.id).subscribe({
      next: () => {
        this.eliminacion.set(null);
        this.load();
      },
      error: (err: HttpErrorResponse) => {
        this.eliminacion.set(null);
        this.message.set(err.error?.detail ?? 'No fue posible eliminar el gateway');
      }
    });
  }

  cancelarEliminar(): void {
    this.eliminacion.set(null);
  }
}