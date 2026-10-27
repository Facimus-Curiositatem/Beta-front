import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormArray, FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { PermisoEstructuraService } from '../../services/permiso-estructura.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-permiso-estructura',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './permiso-estructura.component.html'
})
export class PermisoEstructuraComponent {
  private readonly service = inject(PermisoEstructuraService);
  private readonly fb = inject(FormBuilder);
  readonly rows = new FormArray<ReturnType<PermisoEstructuraComponent['fila']>>([]);
  readonly form = this.fb.group({ permisos: this.rows });
  readonly loading = signal(false);
  readonly saving = signal<number | null>(null);
  readonly message = signal('');
  fila() {
    return this.fb.nonNullable.group({
      rolAcceso: [''],
      crearPool: [false],
      editarPool: [false],
      eliminarPool: [false],
      crearLane: [false],
      editarLane: [false],
      eliminarLane: [false]
    });
  }
  ngOnInit(): void {
    this.cargar();
  }
  cargar(): void {
    this.loading.set(true);
    this.message.set('');
    this.service.listar().subscribe({
      next: (permisos) => {
        this.rows.clear();
        for (const permiso of permisos) {
          const row = this.fila();
          row.patchValue(permiso);
          this.rows.push(row);
        }
        this.loading.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.loading.set(false);
        this.message.set(err.error?.detail ?? 'No fue posible cargar los permisos');
      }
    });
  }
  guardar(index: number): void {
    if (this.saving() !== null) return;
    const { rolAcceso, ...request } = this.rows.at(index).getRawValue();
    this.saving.set(index);
    this.message.set('');
    this.service.actualizar(rolAcceso, request).subscribe({
      next: (permiso) => {
        this.rows.at(index).patchValue(permiso);
        this.saving.set(null);
        this.message.set('Permisos guardados');
      },
      error: (err: HttpErrorResponse) => {
        this.saving.set(null);
        this.message.set(err.error?.detail ?? 'No fue posible guardar los permisos');
      }
    });
  }
}
