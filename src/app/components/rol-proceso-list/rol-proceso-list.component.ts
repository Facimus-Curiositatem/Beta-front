import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { RolProcesoService } from '../../services/rol-proceso.service';
import { PageResponse } from '../../models/page.model';
import { RolProcesoConsultaResponse } from '../../models/rol-proceso.model';

@Component({
  selector: 'app-rol-proceso-list',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './rol-proceso-list.component.html'
})
export class RolProcesoListComponent {
  private readonly service = inject(RolProcesoService);
  readonly form = inject(FormBuilder).nonNullable.group({ nombre: [''] });
  readonly page = signal<PageResponse<RolProcesoConsultaResponse> | null>(null);
  readonly loading = signal(false);
  readonly deleting = signal<number | null>(null);
  readonly message = signal('');
  private filtro = '';
  ngOnInit(): void {
    this.cargar();
  }
  buscar(): void {
    this.filtro = this.form.getRawValue().nombre.trim();
    this.cargar(0);
  }
  cargar(pagina = 0): void {
    this.loading.set(true);
    this.message.set('');
    this.service.buscar(this.filtro, pagina).subscribe({
      next: (page) => {
        this.page.set(page);
        this.loading.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.loading.set(false);
        this.message.set(err.error?.detail ?? 'No fue posible cargar los roles');
      }
    });
  }
  eliminar(rol: RolProcesoConsultaResponse): void {
    if (rol.enUso || this.deleting() !== null) return;
    if (!confirm(`¿Eliminar el rol ${rol.nombre}?`)) return;
    this.deleting.set(rol.id);
    this.service.eliminar(rol.id).subscribe({
      next: () => {
        this.deleting.set(null);
        this.cargar(0);
      },
      error: (err: HttpErrorResponse) => {
        this.deleting.set(null);
        this.message.set(err.error?.detail ?? 'No fue posible eliminar el rol');
      }
    });
  }
}
