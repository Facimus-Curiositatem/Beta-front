import { Component, ChangeDetectionStrategy, inject, input, signal, computed } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Observable, catchError, forkJoin, map, of, switchMap } from 'rxjs';
import { MensajeService } from '../../services/mensaje.service';
import { CorrelacionService } from '../../services/correlacion.service';
import { PoolService } from '../../services/pool.service';
import { LaneService } from '../../services/lane.service';
import { EventoMensajeService } from '../../services/evento-mensaje.service';
import { PoolResponse } from '../../models/pool.model';
import { EventoMensajeResponse } from '../../models/evento-mensaje.model';
import {
  MensajeRequest, PoliticaFalloNotificacion, PoliticaMensajeSinCaso, TipoDestinoExterno
} from '../../models/mensaje.model';

@Component({
  selector: 'app-mensaje-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './mensaje-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MensajeFormComponent {
  private readonly fb = inject(FormBuilder);
  private readonly mensajeService = inject(MensajeService);
  private readonly correlacionService = inject(CorrelacionService);
  private readonly poolService = inject(PoolService);
  private readonly laneService = inject(LaneService);
  private readonly eventoMensajeService = inject(EventoMensajeService);
  private readonly router = inject(Router);

  procesoId = input.required<string>();
  mensajeId = input<string>();

  protected readonly tiposDestinoExterno: TipoDestinoExterno[] = ['CORREO', 'SERVICIO_WEB', 'COLA'];
  protected readonly politicasFallo: PoliticaFalloNotificacion[] = [
    'CONTINUAR_FLUJO', 'DERIVAR_ACTIVIDAD_ERROR', 'FINALIZAR_PROCESO'
  ];
  protected readonly politicasSinCaso: PoliticaMensajeSinCaso[] = ['DESCARTAR', 'INICIAR_CASO_NUEVO'];

  protected readonly pools = signal<PoolResponse[]>([]);
  protected readonly eventosThrow = signal<EventoMensajeResponse[]>([]);
  protected readonly eventosCatch = signal<EventoMensajeResponse[]>([]);
  protected readonly editing = computed(() => this.mensajeId() !== undefined);
  protected readonly saving = signal(false);
  protected readonly message = signal('');
  protected readonly correlacionMessage = signal('');

  protected readonly form = this.fb.group({
    nombre: this.fb.nonNullable.control('', Validators.required),
    contenido: this.fb.nonNullable.control('', Validators.required),
    poolOrigenId: this.fb.control<number | null>(null, Validators.required),
    poolDestinoId: this.fb.control<number | null>(null, Validators.required),
    eventoThrowId: this.fb.control<number | null>(null),
    eventoCatchId: this.fb.control<number | null>(null),
    claveCorrelacion: this.fb.nonNullable.control(''),
    // '' representa "Ninguno" en los selects opcionales
    tipoDestinoExterno: this.fb.nonNullable.control<TipoDestinoExterno | ''>(''),
    destinoExterno: this.fb.nonNullable.control(''),
    politicaFalloNotificacion: this.fb.nonNullable.control<PoliticaFalloNotificacion | ''>(''),
    actividadErrorId: this.fb.control<number | null>(null),
    politicaSinCaso: this.fb.nonNullable.control<PoliticaMensajeSinCaso | ''>('')
  });

  protected readonly correlacionForm = this.fb.nonNullable.group({
    criterio: ['', Validators.required]
  });

  constructor() {
    // Al elegir un pool se cargan sus eventos: throw para el origen, catch para el destino
    this.form.controls.poolOrigenId.valueChanges.pipe(
      switchMap(poolId => this.eventosPorPool(poolId)),
      takeUntilDestroyed()
    ).subscribe(eventos => this.eventosThrow.set(eventos.filter(e => e.tipoEvento === 'THROW')));

    this.form.controls.poolDestinoId.valueChanges.pipe(
      switchMap(poolId => this.eventosPorPool(poolId)),
      takeUntilDestroyed()
    ).subscribe(eventos => this.eventosCatch.set(eventos.filter(e => e.tipoEvento !== 'THROW')));
  }

  ngOnInit(): void {
    this.poolService.listar(Number(this.procesoId())).subscribe({
      next: data => this.pools.set(data),
      error: () => this.message.set('No fue posible cargar los pools del proceso')
    });

    if (this.editing()) {
      // Pools y evento throw no se pueden cambiar una vez creado el mensaje
      this.form.controls.poolOrigenId.disable();
      this.form.controls.poolDestinoId.disable();
      this.form.controls.eventoThrowId.disable();

      this.mensajeService.obtener(Number(this.mensajeId())).subscribe({
        next: mensaje => {
          this.form.patchValue({
            nombre: mensaje.nombre,
            contenido: mensaje.contenido,
            poolOrigenId: mensaje.poolOrigenId,
            poolDestinoId: mensaje.poolDestinoId,
            eventoThrowId: mensaje.eventoThrowId,
            eventoCatchId: mensaje.eventoCatchId,
            claveCorrelacion: mensaje.claveCorrelacion ?? '',
            tipoDestinoExterno: mensaje.tipoDestinoExterno ?? '',
            destinoExterno: mensaje.destinoExterno ?? '',
            politicaFalloNotificacion: mensaje.politicaFalloNotificacion ?? '',
            actividadErrorId: mensaje.actividadErrorId,
            politicaSinCaso: mensaje.politicaSinCaso ?? ''
          });
        },
        error: (err: HttpErrorResponse) => {
          this.message.set(err.error?.message ?? 'No fue posible cargar el mensaje');
        }
      });

      this.correlacionService.obtener(Number(this.mensajeId())).subscribe({
        next: correlacion => this.correlacionForm.patchValue({ criterio: correlacion.criterio }),
        // 404 significa que el mensaje aun no tiene correlacion definida
        error: () => this.correlacionForm.reset()
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
    const v = this.form.getRawValue();
    const opcionales = {
      eventoCatchId: v.eventoCatchId ?? undefined,
      claveCorrelacion: v.claveCorrelacion || undefined,
      tipoDestinoExterno: v.tipoDestinoExterno || undefined,
      destinoExterno: v.destinoExterno || undefined,
      politicaFalloNotificacion: v.politicaFalloNotificacion || undefined,
      actividadErrorId: v.actividadErrorId ?? undefined,
      politicaSinCaso: v.politicaSinCaso || undefined
    };

    const request$ = this.editing()
      ? this.mensajeService.editar(Number(this.mensajeId()), {
        nombre: v.nombre, contenido: v.contenido, ...opcionales
      })
      : this.mensajeService.crear(Number(this.procesoId()), {
        nombre: v.nombre,
        contenido: v.contenido,
        poolOrigenId: v.poolOrigenId!,
        poolDestinoId: v.poolDestinoId!,
        eventoThrowId: v.eventoThrowId ?? undefined,
        ...opcionales
      } satisfies MensajeRequest);

    request$.subscribe({
      next: () => this.router.navigate(['/procesos', this.procesoId(), 'mensajes']),
      error: (err: HttpErrorResponse) => {
        this.saving.set(false);
        this.message.set(err.error?.message ?? 'No fue posible guardar el mensaje');
      }
    });
  }

  definirCorrelacion(): void {
    if (this.correlacionForm.invalid) {
      this.correlacionForm.markAllAsTouched();
      return;
    }
    this.correlacionService.definir(Number(this.mensajeId()), this.correlacionForm.getRawValue()).subscribe({
      next: () => this.correlacionMessage.set('Correlacion guardada'),
      error: (err: HttpErrorResponse) => {
        this.correlacionMessage.set(err.error?.message ?? 'No fue posible guardar la correlacion');
      }
    });
  }

  eliminarCorrelacion(): void {
    this.correlacionService.eliminar(Number(this.mensajeId())).subscribe({
      next: () => {
        this.correlacionForm.reset();
        this.correlacionMessage.set('Correlacion eliminada');
      },
      error: (err: HttpErrorResponse) => {
        this.correlacionMessage.set(err.error?.message ?? 'No fue posible eliminar la correlacion');
      }
    });
  }

  /** Los eventos viven en los lanes, asi que se juntan los de todos los lanes del pool. */
  private eventosPorPool(poolId: number | null): Observable<EventoMensajeResponse[]> {
    if (poolId === null) return of([]);
    return this.laneService.listar(poolId).pipe(
      switchMap(lanes => lanes.length === 0
        ? of([])
        : forkJoin(lanes.map(lane => this.eventoMensajeService.listar(lane.id)))),
      map(grupos => grupos.flat()),
      catchError(() => {
        this.message.set('No fue posible cargar los eventos del pool');
        return of([]);
      })
    );
  }
}
