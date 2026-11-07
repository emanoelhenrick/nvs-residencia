import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { IGroup } from '../../../../models';
import { fmtTime } from '../../../../utils/dates';

@Component({
  selector: 'app-incident-suggestion-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './incident-suggestion-card.html',
})
export class IncidentSuggestionCard {
  readonly group = input.required<IGroup>();
  readonly unit = input.required<string>();
  readonly review = output<void>();
  readonly discard = output<void>();

  protected readonly times = computed(() => this.group().tickets.map((t) => fmtTime(t.openedAt)));
}
