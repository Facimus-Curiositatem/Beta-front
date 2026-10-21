import { Component, ChangeDetectionStrategy, inject, input, signal, computed } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { LaneService } from '../../services/lane.service';
import { RolProcesoService } from '../../services/rol-proceso.service';
import { RolProcesoVistaResponse } from '../../models/rol-proceso.model';

@Component({
  selector: 'app-lane-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './lane-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LaneFormComponent {
  private readonly fb = inject(FormBuilder);
  private readonly laneService = inject(LaneService);
  private readonly rolProcesoService = inject(RolProcesoService);
  private readonly router = inject(Router);

  poolId = input.required<string>();
  laneId = input<string>();

  protected readonly roles = signal<RolProcesoVistaResponse[]>([]);
  protected readonly editing = computed(() => this.laneId() !== undefined);
  protected readonly saving = signal(false);
  protected readonly message = signal('');

  protected readonly form = this.fb.nonNullable.group({
    nombre: ['', Validators.required],
    rolProcesoId: [0, Validators.required]
  });

  ngOnInit(): void {
    this.rolProcesoService.listar().subscribe({
      next: data => this.roles.set(data),
      error: () => this.message.set('No fue posible cargar los roles')
    });

    if (this.editing()) {
      this.laneService.obtener(Number(this.laneId())).subscribe({
        next: lane => {
          this.form.patchValue({
            nombre: lane.nombre,
            rolProcesoId: lane.rolProcesoId
          });
        },
        error: (err: HttpErrorResponse) => {
          this.message.set(err.error?.message ?? 'No fue posible cargar el lane');
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
      ? this.laneService.editar(Number(this.laneId()), body)
      : this.laneService.crear(Number(this.poolId()), body);

    request$.subscribe({
      next: () => this.router.navigate(['/pools', this.poolId(), 'lanes']),
      error: (err: HttpErrorResponse) => {
        this.saving.set(false);
        this.message.set(err.error?.message ?? 'No fue posible guardar el lane');
      }
    });
  }
}
