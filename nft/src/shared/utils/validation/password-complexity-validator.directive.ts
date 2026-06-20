import { Directive, Input, forwardRef } from '@angular/core';
import { AbstractControl, NG_VALIDATORS, Validator } from '@angular/forms';

@Directive({
  selector: '[requireDigit],[requireLowercase],[requireNonAlphanumeric],[requireUppercase],[requiredLength]',
  providers: [{ provide: NG_VALIDATORS, useExisting: forwardRef(() => PasswordComplexityValidator), multi: true }],
})
export class PasswordComplexityValidator implements Validator {
  @Input('requireDigit') requireDigit: boolean | undefined;
  @Input('requireUppercase') requireUppercase: boolean | undefined;
  @Input('requireLowercase') requireLowercase: boolean | undefined;
  @Input('requireNonAlphanumeric') requireNonAlphanumeric: boolean | undefined;
  @Input('requiredLength') requiredLength: number | undefined;

  validate(control: AbstractControl): { [key: string]: any } {
    const givenPassword = control.value;
    let validationResult: any = null;

    const requireDigit = this.requireDigit;
    if (requireDigit && givenPassword && !/[0-9]/.test(givenPassword)) {
      validationResult = validationResult || {};
      validationResult.requireDigit = true;
    }

    const requireUppercase = this.requireUppercase;
    if (requireUppercase && givenPassword && !/[A-Z]/.test(givenPassword)) {
      validationResult = validationResult || {};
      validationResult.requireUppercase = true;
    }

    const requireLowercase = this.requireLowercase;
    if (requireLowercase && givenPassword && !/[a-z]/.test(givenPassword)) {
      validationResult = validationResult || {};
      validationResult.requireLowercase = true;
    }

    const requiredLength = this.requiredLength;
    if (requiredLength && givenPassword && givenPassword.length < requiredLength) {
      validationResult = validationResult || {};
      validationResult.requiredLength = true;
    }

    // use upperCaseLetters
    const requireNonAlphanumeric = this.requireNonAlphanumeric;
    if (requireNonAlphanumeric && givenPassword && /^[0-9a-zA-Z]+$/.test(givenPassword)) {
      validationResult = validationResult || {};
      validationResult.requireNonAlphanumeric = true;
    }

    return validationResult;
  }
}
