import { ChangeDetectionStrategy, Component, effect, inject, input, output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RolProcesoVistaResponse } from '../../models/rol-proceso.model';
import { CambiosLane } from '../../models/diagrama.model';

@Component({
  selector: 'app-propiedades-lane',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './propiedades-lane.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PropiedadesLaneComponent {
  private readonly fb = inject(FormBuilder);

  readonly clave = input.required<string>();
  readonly datos = input.required<CambiosLane>();
  readonly roles = input.required<RolProcesoVistaResponse[]>();
  readonly pool = input.required<string>();
  readonly esNuevo = input(false);
  readonly puedeSubir = input(false);
  readonly puedeBajar = input(false);
  readonly soloLectura = input(false);
  readonly puedeEliminar = input(false);
  readonly guardando = input(false);
  readonly guardar = output<CambiosLane>();
  readonly mover = output<-1 | 1>();
  readonly eliminar = output<void>();
  readonly cancelar = output<void>();

  protected readonly form = this.fb.nonNullable.group({
    nombre: ['', Validators.required],
    rolProcesoId: [0, Validators.min(1)]
  });

  private claveCargada: string | null = null;

  constructor() {
    effect(() => {
      const datos = this.datos();
      const clave = this.clave();
      if (clave !== this.claveCargada || this.form.pristine) {
        this.claveCargada = clave;
        this.form.reset(datos);
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
