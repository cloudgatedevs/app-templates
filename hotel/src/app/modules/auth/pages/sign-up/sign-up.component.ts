import { Component, Injector, OnInit } from '@angular/core';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { RouterLink } from '@angular/router';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { ButtonComponent } from 'src/app/shared/components/button/button.component';
import { NgClass, NgIf } from '@angular/common';
import { UtilsModule } from 'src/shared/utils/utils.module';
import { AppComponentBase } from 'src/app/shared/common/app-component-base';
import { idpAuthConfig } from 'src/app/shared/idp-auth/idp-auth.config';

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.scss'],
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    RouterLink,
    AngularSvgIconModule,
    NgClass,
    NgIf,
    ButtonComponent,
    UtilsModule,
  ],
})
export class SignUpComponent extends AppComponentBase implements OnInit {
  form!: FormGroup;
  submitted = false;
  passwordTextType!: boolean;
  passwordConfirmTextType!: boolean;
  saving!: boolean;

  constructor(injector: Injector, private readonly _formBuilder: FormBuilder) {
    super(injector);
  }

  ngOnInit(): void {
    this.form = this._formBuilder.group(
      {
        name: ['', [Validators.required]],
        surname: ['', [Validators.required]],
        email: ['', [Validators.required, Validators.email]],
        password: ['', Validators.required],
        passwordConfirm: ['', Validators.required],
        terms: [false, Validators.requiredTrue],
      },
      {
        validators: this.matchValidator('password', 'passwordConfirm'),
      },
    );
  }

  matchValidator(controlName: string, matchingControlName: string): ValidatorFn {
    return (abstractControl: AbstractControl) => {
      const control = abstractControl.get(controlName);
      const matchingControl = abstractControl.get(matchingControlName);

      if (matchingControl!.errors && !matchingControl!.errors?.['confirmedValidator']) {
        return null;
      }

      if (control!.value !== matchingControl!.value) {
        const error = { confirmedValidator: 'Passwords do not match.' };
        matchingControl!.setErrors(error);
        return error;
      } else {
        matchingControl!.setErrors(null);
        return null;
      }
    };
  }

  get f() {
    return this.form.controls;
  }

  togglePasswordTextType() {
    this.passwordTextType = !this.passwordTextType;
  }

  togglePasswordConfirmTextType() {
    this.passwordConfirmTextType = !this.passwordConfirmTextType;
  }

  onSubmit() {
    this.submitted = true;

    if (this.form.invalid) {
      return;
    }

    this.register();
  }

  register(): void {
    this.saving = true;

    if (idpAuthConfig.enabled) {
      const signUpUrl = idpAuthConfig.buildSignUpUrl(window.location.href);
      window.location.href = signUpUrl;
      return;
    }

    this.saving = false;
    if (idpAuthConfig.baseUrl) {
      this.notify.info('Account registration is handled through IdP sign-in. Use the sign-in page to continue.');
      this.navigate('/auth/sign-in');
      return;
    }

    this.notify.warn('Account registration is not configured. Set idpBaseUrl in assets/appconfig.json.');
  }
}
