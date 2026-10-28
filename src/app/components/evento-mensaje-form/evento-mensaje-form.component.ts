import { Component, ChangeDetectionStrategy, inject, input, signal, computed } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { EventoMensajeService } from '../../services/evento-mensaje.service';
import { TipoEventoMensaje } from '../../models/evento-mensaje.model';
import { TramoNavegacion } from '../../models/navegacion.model';
import { RutaNavegacionComponent } from '../ruta-navegacion/ruta-navegacion.component';

@Component({
  selector: 'app-evento-mensaje-form',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, RutaNavegacionComponent],
  templateUrl: './evento-mensaje-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EventoMensajeFormComponent {
  private readonly fb = inject(FormBuilder);
  private readonly eventoMensajeService = inject(EventoMensajeService);
  private readonly router = inject(Router);

  laneId = input.required<string>();
  eventoId = input<string>();
  volverADiagrama = input<string>();
  tramos = input<TramoNavegacion[]>([]);

  protected readonly tiposEvento: TipoEventoMensaje[] = ['THROW', 'CATCH_INICIO', 'CATCH_INTERMEDIO'];
  protected readonly editing = computed(() => this.eventoId() !== undefined);
  protected readonly saving = signal(false);
  protected readonly message = signal('');

  protected readonly form = this.fb.nonNullable.group({
    nombre: ['', Validators.required],
    tipoEvento: this.fb.nonNullable.control<TipoEventoMensaje>('THROW', Validators.required),
    contenido: ['', Validators.required],
    claveCorrelacion: ['', Validators.required],
    posicionX: [0],
    posicionY: [0],
    origenExterno: [false]
  });

  ngOnInit(): void {
    if (this.editing()) {
      this.eventoMensajeService.obtener(Number(this.eventoId())).subscribe({
        next: evento => {
          this.form.patchValue({
            nombre: evento.nombre,
            tipoEvento: evento.tipoEvento,
            contenido: evento.contenido,
            claveCorrelacion: evento.claveCorrelacion,
            posicionX: evento.posicionX,
            posicionY: evento.posicionY,
            origenExterno: evento.origenExterno
          });
        },
        error: (err: HttpErrorResponse) => {
          this.message.set(err.error?.message ?? 'No fue posible cargar el evento de mensaje');
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
      ? this.eventoMensajeService.editar(Number(this.eventoId()), body)
      : this.eventoMensajeService.crear(Number(this.laneId()), body);

    request$.subscribe({
      next: () => this.router.navigate(
        this.volverADiagrama() ? ['/procesos', this.volverADiagrama(), 'diagrama'] : ['/lanes', this.laneId(), 'eventos-mensaje']
      ),
      error: (err: HttpErrorResponse) => {
        this.saving.set(false);
        this.message.set(err.error?.message ?? 'No fue posible guardar el evento de mensaje');
      }
    });
  }
}
