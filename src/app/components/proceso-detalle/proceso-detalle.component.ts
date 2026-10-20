import { Component, ChangeDetectionStrategy, inject, input, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { ProcesoService } from '../../services/proceso.service';
import { ProcesoDetalleResponse } from '../../models/proceso-detalle-response';

@Component({
  selector: 'app-proceso-detalle',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './proceso-detalle.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProcesoDetalleComponent {
  private readonly procesoService = inject(ProcesoService);
  private readonly router = inject(Router);

  id = input.required<string>();

  protected readonly status = signal<'loading' | 'success' | 'error'>('loading');
  protected readonly detalle = signal<ProcesoDetalleResponse | null>(null);
  protected readonly message = signal('');

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.status.set('loading');
    this.procesoService.obtener(Number(this.id())).subscribe({
      next: data => {
        this.detalle.set(data);
        this.status.set('success');
      },
      error: (err: HttpErrorResponse) => {
        this.message.set(err.error?.detail ?? 'No fue posible cargar el proceso');
        this.status.set('error');
      }
    });
  }

  // El backend no permite volver de PUBLICADO a BORRADOR, solo se publica.
  publicar(): void {
    this.message.set('');
    this.procesoService.cambiarEstado(Number(this.id()), { estado: 'PUBLICADO' }).subscribe({
      next: () => this.load(),
      error: (err: HttpErrorResponse) => {
        this.message.set(err.error?.detail ?? 'No fue posible cambiar el estado');
      }
    });
  }

  eliminar(): void {
    this.procesoService.eliminar(Number(this.id())).subscribe({
      next: () => this.router.navigate(['/procesos']),
      error: (err: HttpErrorResponse) => {
        this.message.set(err.error?.detail ?? 'No fue posible eliminar el proceso');
      }
    });
  }
}
