import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { ImpactoEliminacionResponse } from '../../models/impacto-eliminacion.model';

@Component({
  selector: 'app-confirmar-eliminacion',
  standalone: true,
  templateUrl: './confirmar-eliminacion.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ConfirmarEliminacionComponent {
  nombre = input.required<string>();
  impacto = input.required<ImpactoEliminacionResponse>();

  confirmar = output<void>();
  cancelar = output<void>();
}