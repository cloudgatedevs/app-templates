import { Component, Injector, OnInit } from '@angular/core';
import { initFlowbite } from 'flowbite';
import { AppComponentBase } from 'src/app/shared/common/app-component-base';
import { NgClass, NgIf } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonComponent } from 'src/app/shared/components/button/button.component';
import { UtilsModule } from 'src/shared/utils/utils.module';
import { idpAuthConfig } from 'src/app/shared/idp-auth/idp-auth.config';
import { getStoredAccessToken } from 'src/app/shared/idp-auth/auth-storage';
import { IdpProfileService } from 'src/app/shared/idp-auth/idp-profile.service';

@Component({
  selector: 'app-profile-edit',
  templateUrl: './profile-edit.component.html',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, NgClass, NgIf, ButtonComponent, UtilsModule],
})
export class ProfileEditComponent extends AppComponentBase implements OnInit {
  form!: FormGroup;
  submitted = false;
  saving = false;
  status: { type: 'success' | 'error'; message: string } | null = null;

  constructor(
    injector: Injector,
    private readonly _formBuilder: FormBuilder,
    private readonly _idpProfileService: IdpProfileService,
  ) {
    super(injector);
  }

  ngOnInit(): void {
    this.form = this._formBuilder.group({
      name: [this.appSession.user?.name ?? ''],
      surname: [this.appSession.user?.surname ?? ''],
      email: [this.appSession.user?.emailAddress ?? '', Validators.email],
    });
    this.setPageName('Profile');
    this.setPageAction('/profile');
    initFlowbite();
  }

  get f() {
    return this.form.controls;
  }

  onSubmit() {
    this.submitted = true;
    this.status = null;

    if (this.form.invalid) {
      return;
    }

    void this.save();
  }

  async save(): Promise<void> {
    if (!idpAuthConfig.enabled) {
      this.status = { type: 'error', message: 'IdP login is not configured.' };
      return;
    }

    const token = getStoredAccessToken();
    const tenancyName = idpAuthConfig.tenancyName;
    if (!token || !tenancyName) {
      this.status = { type: 'error', message: 'IdP session is not available. Sign in again.' };
      return;
    }

    const { name, surname, email } = this.form.value;
    this.saving = true;

    try {
      const updated = await this._idpProfileService.updateProfile(token, tenancyName, { name, surname, email });
      if (!updated) {
        this.status = { type: 'error', message: 'Could not update profile.' };
        return;
      }

      this.appSession.applyIdpProfileUpdate(updated);
      this.status = { type: 'success', message: 'Profile updated.' };
    } catch {
      this.status = { type: 'error', message: 'Could not update profile.' };
    } finally {
      this.saving = false;
    }
  }
}
