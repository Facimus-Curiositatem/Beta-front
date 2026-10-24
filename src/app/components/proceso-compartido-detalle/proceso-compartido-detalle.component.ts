import { Subscription } from 'rxjs';
import { Component, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { ProcesoCompartidoService } from '../../services/proceso-compartido.service';
import { ProcesoCompartidoDetalleResponse } from '../../models/proceso-compartido.model';

@Component({
  selector: 'app-proceso-compartido-detalle',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './proceso-compartido-detalle.component.html'
})
export class ProcesoCompartidoDetalleComponent {
  private readonly service = inject(ProcesoCompartidoService);
  readonly id = input.required<string>();
  readonly detalle = signal<ProcesoCompartidoDetalleResponse | null>(null);
  readonly loading = signal(false);
  readonly message = signal('');
  private carga?: Subscription;
  ngOnDestroy(): void {
    this.carga?.unsubscribe();
  }
  ngOnChanges(): void {
    this.cargar();
  }
  cargar(): void {
    this.carga?.unsubscribe();
    this.detalle.set(null);
    this.loading.set(true);
    this.message.set('');
    this.carga = this.service.verDetalle(Number(this.id())).subscribe({
      next: (data) => {
        this.detalle.set(data);
        this.loading.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.loading.set(false);
        this.message.set(err.error?.detail ?? 'No fue posible acceder al proceso compartido');
      }
    });
  }
}
