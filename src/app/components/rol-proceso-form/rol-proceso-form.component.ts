import { Subscription } from 'rxjs';
import { ChangeDetectionStrategy, Component, inject, input, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { RolProcesoService } from '../../services/rol-proceso.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-rol-proceso-form',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './rol-proceso-form.component.html'
})
export class RolProcesoFormComponent {
  private readonly service = inject(RolProcesoService);
  private readonly router = inject(Router);
  readonly id = input<string>();
  readonly saving = signal(false);
  readonly loading = signal(false);
  readonly loaded = signal(false);
  readonly message = signal('');
  readonly form = inject(FormBuilder).nonNullable.group({
    nombre: ['', Validators.required],
    descripcion: ['']
  });
  private carga?: Subscription;
  ngOnDestroy(): void {
    this.carga?.unsubscribe();
  }
  ngOnChanges(): void {
    this.cargar();
  }
  cargar(): void {
    this.carga?.unsubscribe();
    if (!this.id()) return;
    this.loading.set(true);
    this.loaded.set(false);
    this.message.set('');
    this.carga = this.service.obtener(Number(this.id())).subscribe({
      next: (rol) => {
        this.form.patchValue({ nombre: rol.nombre, descripcion: rol.descripcion ?? '' });
        this.loading.set(false);
        this.loaded.set(true);
      },
      error: (err: HttpErrorResponse) => {
        this.loading.set(false);
        this.message.set(err.error?.detail ?? 'No fue posible cargar el rol');
      }
    });
  }
  submit(): void {
    if (this.saving() || this.loading() || (this.id() && !this.loaded())) return;
    if (this.form.invalid || !this.form.controls.nombre.value.trim()) {
      this.form.markAllAsTouched();
      this.message.set('El nombre es obligatorio');
      return;
    }
    const body = this.form.getRawValue();
    body.nombre = body.nombre.trim();
    this.saving.set(true);
    this.message.set('');
    const request = this.id()
      ? this.service.editar(Number(this.id()), body)
      : this.service.crear(body);
    request.subscribe({
      next: () => {
        this.saving.set(false);
        this.router.navigate(['/roles']);
      },
      error: (err: HttpErrorResponse) => {
        this.saving.set(false);
        this.message.set(err.error?.detail ?? 'No fue posible guardar el rol');
      }
    });
  }
}
