import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TramoNavegacion } from '../../models/navegacion.model';

@Component({
  selector: 'app-ruta-navegacion',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './ruta-navegacion.component.html',
  styleUrl: './ruta-navegacion.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RutaNavegacionComponent {
  readonly tramos = input.required<TramoNavegacion[]>();
}
