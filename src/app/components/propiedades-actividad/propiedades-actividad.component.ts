import { ChangeDetectionStrategy, Component, effect, inject, input, output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActividadResponse, TipoActividad } from '../../models/actividad.model';
import { CambiosActividad, OpcionLane } from '../../models/diagrama.model';

@Component({
  selector: 'app-propiedades-actividad',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './propiedades-actividad.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PropiedadesActividadComponent {
  private readonly fb = inject(FormBuilder);

  readonly actividad = input.required<ActividadResponse>();
  readonly lanes = input.required<OpcionLane[]>();
  readonly soloLectura = input(false);
  readonly puedeEliminar = input(false);
  readonly guardando = input(false);
  readonly guardar = output<CambiosActividad>();
  readonly eliminar = output<void>();

  protected readonly tipos: { valor: TipoActividad; etiqueta: string }[] = [
    { valor: 'TAREA', etiqueta: 'Tarea' },
    { valor: 'USUARIO', etiqueta: 'Usuario' },
    { valor: 'SERVICIO', etiqueta: 'Servicio' },
    { valor: 'MANUAL', etiqueta: 'Manual' },
    { valor: 'SCRIPT', etiqueta: 'Script' },
    { valor: 'REGLA_NEGOCIO', etiqueta: 'Regla de negocio' }
  ];

  protected readonly form = this.fb.nonNullable.group({
    nombre: ['', Validators.required],
    tipoActividad: ['TAREA' as TipoActividad, Validators.required],
    laneId: [0, Validators.required],
    descripcion: ['']
  });

  private idCargado: number | null = null;

  constructor() {
    // Recarga el formulario al cambiar de actividad, o si cambió en el lienzo y no hay ediciones sin guardar.
    effect(() => {
      const actividad = this.actividad();
      if (actividad.id !== this.idCargado || this.form.pristine) {
        this.idCargado = actividad.id;
        this.form.reset({
          nombre: actividad.nombre,
          tipoActividad: actividad.tipoActividad,
          laneId: actividad.laneId,
          descripcion: actividad.descripcion ?? ''
        });
      }
    });
    effect(() => (this.soloLectura() ? this.form.disable() : this.form.enable()));
  }

  enviar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.guardar.emit(this.form.getRawValue());
    this.form.markAsPristine();
  }
}
