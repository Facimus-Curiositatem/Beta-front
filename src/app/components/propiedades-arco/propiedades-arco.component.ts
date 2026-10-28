import { ChangeDetectionStrategy, Component, effect, inject, input, output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CambiosArco, OpcionNodo } from '../../models/diagrama.model';

@Component({
  selector: 'app-propiedades-arco',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './propiedades-arco.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PropiedadesArcoComponent {
  private readonly fb = inject(FormBuilder);

  readonly clave = input.required<string>();
  readonly datos = input.required<CambiosArco>();
  readonly nodos = input.required<OpcionNodo[]>();
  readonly esNuevo = input(false);
  readonly soloLectura = input(false);
  readonly puedeEliminar = input(false);
  readonly guardando = input(false);
  readonly guardar = output<CambiosArco>();
  readonly eliminar = output<void>();
  readonly cancelar = output<void>();

  protected readonly form = this.fb.nonNullable.group({
    origenId: [0, Validators.required],
    destinoId: [0, Validators.required],
    etiqueta: [''],
    condicion: ['']
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

  origenRequiereCondicion(): boolean {
    const origenId = this.form.controls.origenId.value;
    return this.nodos().some(n => n.id === origenId && n.requiereCondicion);
  }

  enviar(): void {
    const condicion = this.form.controls.condicion;
    if (this.origenRequiereCondicion() && !condicion.value.trim()) {
      condicion.setErrors({ required: true });
    }
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const valores = this.form.getRawValue();
    this.guardar.emit({ ...valores, condicion: this.origenRequiereCondicion() ? valores.condicion : '' });
    this.form.markAsPristine();
  }
}
