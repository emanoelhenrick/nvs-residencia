import { ChangeDetectionStrategy, Component, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PRIORITIES } from '../../../constants/sla.constants';

export interface IAttendanceFilters {
  search: string;
  priority: string;
  slaState: string;
  assignee: string;
}

@Component({
  selector: 'app-attendance-filters',
  imports: [FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './attendance-filters.html',
  styleUrl: './attendance-filters.scss',
})
export class AttendanceFilters {
  readonly assignees = input.required<string[]>();
  readonly changed = output<IAttendanceFilters>();

  protected readonly priorities = PRIORITIES;
  protected readonly value = signal<IAttendanceFilters>({ search: '', priority: '', slaState: '', assignee: '' });

  protected set<K extends keyof IAttendanceFilters>(key: K, v: IAttendanceFilters[K]): void {
    this.value.update((f) => ({ ...f, [key]: v }));
    this.changed.emit(this.value());
  }
}
