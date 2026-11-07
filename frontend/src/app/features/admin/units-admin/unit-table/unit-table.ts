import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { IUnit } from '../../../../models';

@Component({
  selector: 'app-unit-table',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './unit-table.html',
})
export class UnitTable {
  readonly units = input.required<IUnit[]>();
  readonly edit = output<IUnit>();
  readonly delete = output<IUnit>();
}
