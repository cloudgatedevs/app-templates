import { Component, Injector, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonComponent } from 'src/app/shared/components/button/button.component';
import { AppComponentBase } from 'src/app/shared/common/app-component-base';
import { NgClass, NgIf } from '@angular/common';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { UtilsModule } from 'src/shared/utils/utils.module';
import { idpAuthConfig } from 'src/app/shared/idp-auth/idp-auth.config';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss'],
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
export class ForgotPasswordComponent extends AppComponentBase implements OnInit {
  form!: FormGroup;
  submitted = false;
  saving!: boolean;

  constructor(
    injector: Injector,
    private readonly _formBuilder: FormBuilder,
    private readonly _router: Router,
  ) {
    super(injector);
  }

  ngOnInit(): void {
    this.form = this._formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
    });
  }

  get f() {
    return this.form.controls;
  }

  onSubmit() {
    this.submitted = true;

    if (this.form.invalid) {
      return;
    }

    this.forgotPassword();
  }

  forgotPassword(): void {
    this.saving = true;

    if (idpAuthConfig.enabled && idpAuthConfig.baseUrl) {
      const resetUrl = `${idpAuthConfig.baseUrl.replace(/\/$/, '')}/idp/${encodeURIComponent(idpAuthConfig.tenancyName)}/forgot-password`;
      window.location.href = resetUrl;
      return;
    }

    this.saving = false;
    this.notify.info('Password reset is handled through IdP sign-in. Use the sign-in page to continue.');
    this._router.navigate(['auth/sign-in']);
  }
}
