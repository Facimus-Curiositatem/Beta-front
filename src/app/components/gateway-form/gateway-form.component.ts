import { Component, ChangeDetectionStrategy, inject, input, signal, computed } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { GatewayService } from '../../services/gateway.service';
import { GatewayRequest, TipoGateway } from '../../models/gateway.model';
import { TramoNavegacion } from '../../models/navegacion.model';
import { RutaNavegacionComponent } from '../ruta-navegacion/ruta-navegacion.component';

@Component({
  selector: 'app-gateway-form',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, RutaNavegacionComponent],
  templateUrl: './gateway-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GatewayFormComponent {
  private readonly fb = inject(FormBuilder);
  private readonly gatewayService = inject(GatewayService);
  private readonly router = inject(Router);

  laneId = input.required<string>();
  id = input<string>();
  volverADiagrama = input<string>();
  tramos = input<TramoNavegacion[]>([]);

  protected readonly tiposGateway: TipoGateway[] = ['EXCLUSIVO', 'PARALELO', 'INCLUSIVO'];
  protected readonly editing = computed(() => this.id() !== undefined);
  protected readonly saving = signal(false);
  protected readonly message = signal('');

  protected readonly form = this.fb.nonNullable.group({
    nombre: ['', Validators.required],
    tipoGateway: ['EXCLUSIVO' as TipoGateway, Validators.required],
    posicionX: [0],
    posicionY: [0]
  });

  ngOnInit(): void {
    if (this.editing()) {
      this.gatewayService.obtener(Number(this.id())).subscribe({
        next: gateway => {
          this.form.patchValue({
            nombre: gateway.nombre,
            tipoGateway: gateway.tipoGateway,
            posicionX: gateway.posicionX,
            posicionY: gateway.posicionY
          });
        },
        error: (err: HttpErrorResponse) => {
          this.message.set(err.error?.detail ?? 'No fue posible cargar el gateway');
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
    const body: GatewayRequest = this.form.getRawValue();

    const request$ = this.editing()
      ? this.gatewayService.editar(Number(this.id()), body)
      : this.gatewayService.crear(Number(this.laneId()), body);

    request$.subscribe({
      next: () => this.router.navigate(
        this.volverADiagrama() ? ['/procesos', this.volverADiagrama(), 'diagrama'] : ['/lanes', this.laneId(), 'gateways']
      ),
      error: (err: HttpErrorResponse) => {
        this.saving.set(false);
        this.message.set(err.error?.detail ?? 'No fue posible guardar el gateway');
      }
    });
  }
}