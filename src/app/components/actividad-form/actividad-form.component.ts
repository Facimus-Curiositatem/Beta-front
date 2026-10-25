import { Component, ChangeDetectionStrategy, inject, input, signal, computed } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { ActividadService } from '../../services/actividad.service';
import { ActividadRequest, TipoActividad } from '../../models/actividad.model';

@Component({
  selector: 'app-actividad-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './actividad-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ActividadFormComponent {
  private readonly fb = inject(FormBuilder);
  private readonly actividadService = inject(ActividadService);
  private readonly router = inject(Router);

  laneId = input.required<string>();
  id = input<string>();

  protected readonly tiposActividad: TipoActividad[] = [
    'TAREA', 'USUARIO', 'SERVICIO', 'MANUAL', 'SCRIPT', 'REGLA_NEGOCIO'
  ];
  protected readonly editing = computed(() => this.id() !== undefined);
  protected readonly saving = signal(false);
  protected readonly message = signal('');

  protected readonly form = this.fb.nonNullable.group({
    nombre: ['', Validators.required],
    descripcion: [''],
    tipoActividad: ['TAREA' as TipoActividad],
    posicionX: [0],
    posicionY: [0]
  });

  ngOnInit(): void {
    if (this.editing()) {
      this.actividadService.obtener(Number(this.id())).subscribe({
        next: actividad => {
          this.form.patchValue({
            nombre: actividad.nombre,
            descripcion: actividad.descripcion ?? '',
            tipoActividad: actividad.tipoActividad,
            posicionX: actividad.posicionX,
            posicionY: actividad.posicionY
          });
        },
        error: (err: HttpErrorResponse) => {
          this.message.set(err.error?.detail ?? 'No fue posible cargar la actividad');
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
    const body: ActividadRequest = this.form.getRawValue();

    const request$ = this.editing()
      ? this.actividadService.editar(Number(this.id()), body)
      : this.actividadService.crear(Number(this.laneId()), body);

    request$.subscribe({
      next: () => this.router.navigate(['/lanes', this.laneId(), 'actividades']),
      error: (err: HttpErrorResponse) => {
        this.saving.set(false);
        this.message.set(err.error?.detail ?? 'No fue posible guardar la actividad');
      }
    });
  }
}