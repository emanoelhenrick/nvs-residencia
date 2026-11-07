import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { IGroup, ITicket } from '../../../../models';
import { fmtStamp } from '../../../../utils/dates';

@Component({
  selector: 'app-incident-evidence-review',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './incident-evidence-review.html',
  styleUrls: ['./incident-evidence-review.scss'],
})
export class IncidentEvidenceReview {
  readonly group = input.required<IGroup>();
  readonly parents = input.required<ITicket[]>();
  readonly openLink = output<void>();
  protected readonly stamp = fmtStamp;

  protected evidence(t: ITicket): string {
    return t.evidences.length
      ? t.evidences.map((x) => (x.sizeKb > 0 ? `${x.name}, ${x.sizeKb} KB` : x.name)).join(' · ')
      : 'evidência pendente';
  }
}
