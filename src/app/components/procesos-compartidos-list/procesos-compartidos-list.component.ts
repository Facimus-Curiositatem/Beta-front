import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { ProcesoCompartidoService } from '../../services/proceso-compartido.service';
import { ProcesoCompartidoResponse } from '../../models/proceso-compartido.model';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-procesos-compartidos-list',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './procesos-compartidos-list.component.html'
})
export class ProcesosCompartidosListComponent {
  private readonly service = inject(ProcesoCompartidoService);
  readonly items = signal<ProcesoCompartidoResponse[]>([]);
  readonly loading = signal(false);
  readonly message = signal('');
  ngOnInit(): void {
    this.cargar();
  }
  cargar(): void {
    this.loading.set(true);
    this.message.set('');
    this.service.listarCompartidosConmigo().subscribe({
      next: (data) => {
        this.items.set(data);
        this.loading.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.loading.set(false);
        this.message.set(err.error?.detail ?? 'No fue posible cargar los procesos recibidos');
      }
    });
  }
}
