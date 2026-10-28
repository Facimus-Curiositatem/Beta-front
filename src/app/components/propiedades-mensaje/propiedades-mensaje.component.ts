import { ChangeDetectionStrategy, Component, effect, inject, input, output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { PoliticaFalloNotificacion, PoliticaMensajeSinCaso, TipoDestinoExterno } from '../../models/mensaje.model';
import { CambiosMensaje, OpcionLane } from '../../models/diagrama.model';

@Component({
  selector: 'app-propiedades-mensaje',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './propiedades-mensaje.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PropiedadesMensajeComponent {
  private readonly fb = inject(FormBuilder);

  readonly clave = input.required<string>();
  readonly datos = input.required<CambiosMensaje>();
  readonly externo = input(false);
  readonly sinReceptor = input(false);
  readonly actividades = input<OpcionLane[]>([]);
  readonly esNuevo = input(false);
  readonly soloLectura = input(false);
  readonly puedeEliminar = input(false);
  readonly guardando = input(false);
  readonly guardar = output<CambiosMensaje>();
  readonly eliminar = output<void>();
  readonly cancelar = output<void>();

  protected readonly destinos: { valor: TipoDestinoExterno; etiqueta: string }[] = [
    { valor: 'CORREO', etiqueta: 'Correo' },
    { valor: 'SERVICIO_WEB', etiqueta: 'Servicio web' },
    { valor: 'COLA', etiqueta: 'Cola de mensajes' }
  ];

  protected readonly politicasFallo: { valor: PoliticaFalloNotificacion; etiqueta: string }[] = [
    { valor: 'CONTINUAR_FLUJO', etiqueta: 'Continuar el flujo' },
    { valor: 'DERIVAR_ACTIVIDAD_ERROR', etiqueta: 'Derivar a una actividad de error' },
    { valor: 'FINALIZAR_PROCESO', etiqueta: 'Finalizar el proceso' }
  ];

  protected readonly politicasSinCaso: { valor: PoliticaMensajeSinCaso; etiqueta: string }[] = [
    { valor: 'DESCARTAR', etiqueta: 'Descartarlo' },
    { valor: 'INICIAR_CASO_NUEVO', etiqueta: 'Iniciar un caso nuevo' }
  ];

  protected readonly form = this.fb.nonNullable.group({
    nombre: [{ value: '', disabled: true }],
    claveCorrelacion: [{ value: '', disabled: true }],
    contenido: ['', Validators.required],
    politicaSinCaso: ['DESCARTAR' as PoliticaMensajeSinCaso],
    tipoDestinoExterno: [null as TipoDestinoExterno | null],
    destinoExterno: [''],
    politicaFalloNotificacion: [null as PoliticaFalloNotificacion | null],
    actividadErrorId: [null as number | null]
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
      // Nombre y clave se heredan del Message Throw: el backend exige que coincidan.
      if (this.soloLectura()) {
        this.form.disable();
      } else {
        this.form.enable();
        this.form.controls.nombre.disable();
        this.form.controls.claveCorrelacion.disable();
      }
    });
  }

  enviar(): void {
    const c = this.form.controls;
    if (this.externo()) {
      if (!c.tipoDestinoExterno.value) c.tipoDestinoExterno.setErrors({ required: true });
      if (!c.destinoExterno.value.trim()) c.destinoExterno.setErrors({ required: true });
      if (!c.politicaFalloNotificacion.value) c.politicaFalloNotificacion.setErrors({ required: true });
      if (c.politicaFalloNotificacion.value === 'DERIVAR_ACTIVIDAD_ERROR' && c.actividadErrorId.value === null) {
        c.actividadErrorId.setErrors({ required: true });
      }
    }
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const valores = this.form.getRawValue();
    this.guardar.emit(this.externo()
      ? { ...valores, actividadErrorId: valores.politicaFalloNotificacion === 'DERIVAR_ACTIVIDAD_ERROR' ? valores.actividadErrorId : null }
      : { ...valores, tipoDestinoExterno: null, destinoExterno: '', politicaFalloNotificacion: null, actividadErrorId: null });
    this.form.markAsPristine();
  }
}
