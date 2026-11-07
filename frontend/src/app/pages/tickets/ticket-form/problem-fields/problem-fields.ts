import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { IUnit } from '../../../../models';
import { Icon } from '../../../../shared/icon/icon';
import { RequiredFieldName, TicketFormGroup } from '../ticket-form.types';

@Component({
  selector: 'app-problem-fields',
  imports: [ReactiveFormsModule, Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './problem-fields.html',
})
export class ProblemFields {
  readonly form = input.required<TicketFormGroup>();
  readonly submitted = input(false);
  readonly categories = input.required<string[]>();
  readonly needsUnit = input(false);
  readonly units = input<IUnit[]>([]);

  protected invalid(name: RequiredFieldName): boolean {
    return this.submitted() && this.form().controls[name].invalid;
  }
}
