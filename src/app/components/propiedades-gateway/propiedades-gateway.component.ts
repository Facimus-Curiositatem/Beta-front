import { ChangeDetectionStrategy, Component, effect, inject, input, output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { GatewayResponse, TipoGateway } from '../../models/gateway.model';
import { CambiosGateway } from '../../models/diagrama.model';

@Component({
  selector: 'app-propiedades-gateway',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './propiedades-gateway.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PropiedadesGatewayComponent {
  private readonly fb = inject(FormBuilder);

  readonly gateway = input.required<GatewayResponse>();
  readonly lane = input.required<string>();
  readonly soloLectura = input(false);
  readonly puedeEliminar = input(false);
  readonly guardando = input(false);
  readonly guardar = output<CambiosGateway>();
  readonly eliminar = output<void>();

  protected readonly tipos: { valor: TipoGateway; etiqueta: string }[] = [
    { valor: 'EXCLUSIVO', etiqueta: 'Exclusivo (✕)' },
    { valor: 'PARALELO', etiqueta: 'Paralelo (+)' },
    { valor: 'INCLUSIVO', etiqueta: 'Inclusivo (○)' }
  ];

  protected readonly form = this.fb.nonNullable.group({
    nombre: ['', Validators.required],
    tipoGateway: ['EXCLUSIVO' as TipoGateway, Validators.required]
  });

  private idCargado: number | null = null;

  constructor() {
    effect(() => {
      const gateway = this.gateway();
      if (gateway.id !== this.idCargado || this.form.pristine) {
        this.idCargado = gateway.id;
        this.form.reset({ nombre: gateway.nombre, tipoGateway: gateway.tipoGateway });
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
