import { Component, Input } from '@angular/core';
import { filter as _filter, find as _find, concat as _concat } from 'lodash-es';
import { AppLocalizationService } from 'src/app/shared/common/localization/app-localization.service';

class ErrorDef {
  error: string | undefined;
  localizationKey: string | undefined;
  errorProperty: string | undefined;
}

@Component({
  selector: '<validation-messages>',
  template: `
    <div class="has-danger" *ngIf="formCtrl.invalid && (formCtrl.dirty || formCtrl.touched)">
      <div *ngFor="let errorDef of errorDefsInternal">
        <div *ngIf="getErrorDefinitionIsInValid(errorDef)" class="form-control-feedback">
          {{ getErrorDefinitionMessage(errorDef) }}
        </div>
      </div>
    </div>
  `,
})
export class ValidationMessagesComponent {
  @Input() formCtrl: any;

  _errorDefs: ErrorDef[] = [];

  readonly standartErrorDefs: ErrorDef[] = [
    { error: 'required', localizationKey: 'ThisFieldIsRequired' } as ErrorDef,
    {
      error: 'minlength',
      localizationKey: 'PleaseEnterAtLeastNCharacter',
      errorProperty: 'requiredLength',
    } as ErrorDef,
    {
      error: 'maxlength',
      localizationKey: 'PleaseEnterNoMoreThanNCharacter',
      errorProperty: 'requiredLength',
    } as ErrorDef,
    { error: 'email', localizationKey: 'InvalidEmailAddress' } as ErrorDef,
    { error: 'min', localizationKey: 'ValueMustBeBiggerThanOrEqualToX', errorProperty: 'min' } as ErrorDef,
    { error: 'pattern', localizationKey: 'InvalidPattern', errorProperty: 'requiredPattern' } as ErrorDef,
  ];

  constructor(private appLocalizationService: AppLocalizationService) {}

  get errorDefsInternal(): ErrorDef[] {
    let standarts = _filter(this.standartErrorDefs, (ed) => !_find(this._errorDefs, (edC) => edC.error === ed.error));
    let all = <ErrorDef[]>_concat(standarts, this._errorDefs);

    return all;
  }

  @Input() set errorDefs(value: ErrorDef[]) {
    this._errorDefs = value;
  }

  getErrorDefinitionIsInValid(errorDef: any): boolean {
    return !!this.formCtrl.errors[errorDef.error];
  }

  getErrorDefinitionMessage(errorDef: any): string {
    let errorRequirement = this.formCtrl.errors[errorDef.error][errorDef.errorProperty];
    return !!errorRequirement
      ? this.appLocalizationService.l(errorDef.localizationKey, errorRequirement)
      : this.appLocalizationService.l(errorDef.localizationKey);
  }
}
