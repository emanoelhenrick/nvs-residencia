import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { fmtTime } from '../../../utils/dates';
import { IRecentUpdate } from '../../../utils/dashboard-stats';

@Component({
  selector: 'app-recent-updates',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './recent-updates.html',
  styles: [
    '.upd { display: flex; flex-direction: column; gap: 8px; align-items: flex-start; padding: 8px 0 14px; } .upd p { margin: 4px 0; }',
  ],
})
export class RecentUpdates {
  readonly updates = input.required<IRecentUpdate[]>();
  protected readonly time = fmtTime;

  protected firstName(author: string): string {
    return author.split(' · ')[0];
  }
}
