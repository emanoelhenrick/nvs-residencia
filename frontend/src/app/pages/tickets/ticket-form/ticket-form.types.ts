import { FormControl, FormGroup } from '@angular/forms';

export type TicketFormGroup = FormGroup<{
  category: FormControl<string>;
  title: FormControl<string>;
  description: FormControl<string>;
  impact: FormControl<string>;
  affectsOthers: FormControl<boolean>;
  errorCode: FormControl<string>;
  unitId: FormControl<string>;
}>;

export type RequiredFieldName = 'category' | 'description' | 'impact' | 'errorCode' | 'unitId';
