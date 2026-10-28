import { Component, ChangeDetectionStrategy, inject, input, signal, computed } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { ProcesoService } from '../../services/proceso.service';

@Component({
  selector: 'app-proceso-form',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './proceso-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProcesoFormComponent {
  private readonly fb = inject(FormBuilder);
  private readonly procesoService = inject(ProcesoService);
  private readonly router = inject(Router);

  id = input<string>();

  protected readonly editing = computed(() => this.id() !== undefined);
  protected readonly saving = signal(false);
  protected readonly message = signal('');

  protected readonly form = this.fb.nonNullable.group({
    nombre: ['', Validators.required],
    descripcion: ['', Validators.required],
    categoria: ['', Validators.required]
  });

  ngOnInit(): void {
    if (this.editing()) {
      this.procesoService.obtener(Number(this.id())).subscribe({
        next: detalle => {
          const { nombre, descripcion, categoria } = detalle.proceso;
          this.form.patchValue({ nombre, descripcion, categoria });
        },
        error: (err: HttpErrorResponse) => {
          this.message.set(err.error?.detail ?? 'No fue posible cargar el proceso');
        }
      });
    }
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    this.message.set('');
    const body = this.form.getRawValue();

    const request$ = this.editing()
      ? this.procesoService.editar(Number(this.id()), body)
      : this.procesoService.crear(body);

    request$.subscribe({
      next: proceso => this.router.navigate(['/procesos', proceso.id]),
      error: (err: HttpErrorResponse) => {
        this.saving.set(false);
        this.message.set(err.error?.detail ?? 'No fue posible guardar el proceso');
      }
    });
  }
}
