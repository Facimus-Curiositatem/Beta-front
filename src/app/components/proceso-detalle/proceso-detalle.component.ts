import { Component, ChangeDetectionStrategy, computed, inject, input, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { ProcesoService } from '../../services/proceso.service';
import { TokenService } from '../../services/token.service';
import { ProcesoDetalleResponse } from '../../models/proceso.model';
import { TramoNavegacion } from '../../models/navegacion.model';
import { RutaNavegacionComponent } from '../ruta-navegacion/ruta-navegacion.component';

@Component({
  selector: 'app-proceso-detalle',
  standalone: true,
  imports: [RouterLink, RutaNavegacionComponent],
  templateUrl: './proceso-detalle.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProcesoDetalleComponent {
  private readonly procesoService = inject(ProcesoService);
  private readonly router = inject(Router);
  protected readonly tokens = inject(TokenService);

  id = input.required<string>();

  protected readonly status = signal<'loading' | 'success' | 'error'>('loading');
  protected readonly detalle = signal<ProcesoDetalleResponse | null>(null);
  protected readonly message = signal('');

  protected readonly soloLectura = computed(() => this.tokens.rol() === 'SOLO_LECTURA');

  protected readonly tramos = computed<TramoNavegacion[]>(() => [
    { etiqueta: 'Procesos', enlace: ['/procesos'] },
    { etiqueta: this.detalle()?.proceso.nombre ?? 'Proceso' }
  ]);

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

  // La eliminación es lógica: el proceso pasa a inactivo y se consulta con el filtro de inactivos.
  confirmarEliminacion(): void {
    const nombre = this.detalle()?.proceso.nombre ?? '';
    if (confirm(`¿Eliminar el proceso «${nombre}»? Pasará a inactivo y podrás consultarlo con el filtro de inactivos.`)) {
      this.eliminar();
    }
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
