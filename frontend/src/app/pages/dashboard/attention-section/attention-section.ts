import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IUnit } from '../../../models';
import { Icon } from '../../../shared/icon/icon';
import { IDashRow } from '../../../utils/dashboard-stats';
import { AttentionCard } from '../attention-card/attention-card';

@Component({
  selector: 'app-attention-section',
  imports: [RouterLink, Icon, AttentionCard],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './attention-section.html',
  styles: [
    '.alert-ic { color: var(--c-danger); display: inline-flex; } .att-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 14px; }',
  ],
})
export class AttentionSection {
  readonly rows = input.required<IDashRow[]>();
  readonly units = input.required<IUnit[]>();
  readonly now = input.required<number>();
}
