import { ChangeDetectionStrategy, Component, effect, inject, input, output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CambiosPool } from '../../models/diagrama.model';

@Component({
  selector: 'app-propiedades-pool',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './propiedades-pool.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PropiedadesPoolComponent {
  private readonly fb = inject(FormBuilder);

  readonly clave = input.required<string>();
  readonly datos = input.required<CambiosPool>();
  readonly tieneLanes = input(false);
  readonly esNuevo = input(false);
  readonly soloLectura = input(false);
  readonly puedeEliminar = input(false);
  readonly guardando = input(false);
  readonly guardar = output<CambiosPool>();
  readonly agregarLane = output<void>();
  readonly eliminar = output<void>();
  readonly cancelar = output<void>();

  protected readonly tipos = [
    { valor: 'EMPRESA', etiqueta: 'Empresa' },
    { valor: 'CLIENTE', etiqueta: 'Cliente' },
    { valor: 'PROVEEDOR', etiqueta: 'Proveedor' },
    { valor: 'SISTEMA_EXTERNO', etiqueta: 'Sistema externo' }
  ];

  protected readonly form = this.fb.nonNullable.group({
    nombre: ['', Validators.required],
    tipoParticipante: ['EMPRESA', Validators.required],
    cajaNegra: [false]
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
    effect(() => {
      if (this.soloLectura()) {
        this.form.disable();
      } else {
        this.form.enable();
        // El backend no deja marcar como caja negra un pool que ya tiene lanes.
        if (this.tieneLanes()) {
          this.form.controls.cajaNegra.disable();
        }
      }
    });
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
