import { ChangeDetectionStrategy, Component, effect, inject, input, output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TipoEventoMensaje } from '../../models/evento-mensaje.model';
import { CambiosEvento } from '../../models/diagrama.model';

@Component({
  selector: 'app-propiedades-evento',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './propiedades-evento.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PropiedadesEventoComponent {
  private readonly fb = inject(FormBuilder);

  readonly clave = input.required<string>();
  readonly datos = input.required<CambiosEvento>();
  readonly esNuevo = input(false);
  readonly soloLectura = input(false);
  readonly puedeEliminar = input(false);
  readonly guardando = input(false);
  readonly guardar = output<CambiosEvento>();
  readonly eliminar = output<void>();
  readonly cancelar = output<void>();

  protected readonly tipos: { valor: TipoEventoMensaje; etiqueta: string }[] = [
    { valor: 'CATCH_INICIO', etiqueta: 'Inicio de mensaje (arranca el proceso)' },
    { valor: 'CATCH_INTERMEDIO', etiqueta: 'Espera de mensaje (intermedio)' },
    { valor: 'THROW', etiqueta: 'Envío de mensaje' }
  ];

  protected readonly form = this.fb.nonNullable.group({
    nombre: ['', Validators.required],
    tipoEvento: ['THROW' as TipoEventoMensaje, Validators.required],
    contenido: ['', Validators.required],
    claveCorrelacion: ['', Validators.required],
    origenExterno: [false]
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
    const valores = this.form.getRawValue();
    this.guardar.emit({ ...valores, origenExterno: valores.tipoEvento !== 'THROW' && valores.origenExterno });
    this.form.markAsPristine();
  }
}
