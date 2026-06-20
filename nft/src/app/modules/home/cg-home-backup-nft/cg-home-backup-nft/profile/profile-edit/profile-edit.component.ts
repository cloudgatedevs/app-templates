import { Component, Injector, OnInit } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { initFlowbite } from 'flowbite';
import { AppComponentBase } from 'src/app/shared/common/app-component-base';
import { NgClass, NgFor, NgIf } from '@angular/common';
import { finalize } from 'rxjs';
import { CurrentUserProfileSimpleEditDto, ProfileServiceProxy } from 'src/shared/service-proxies/service-proxies';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonComponent } from 'src/app/shared/components/button/button.component';
import { UtilsModule } from 'src/shared/utils/utils.module';

@Component({
  selector: 'app-profile-edit',
  templateUrl: './profile-edit.component.html',
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
export class ProfileEditComponent extends AppComponentBase implements OnInit {
  form!: FormGroup;
  submitted = false;
  saving!: boolean;
  model: CurrentUserProfileSimpleEditDto = new CurrentUserProfileSimpleEditDto();

  constructor(
    injector: Injector,
    private _profileService: ProfileServiceProxy,
    private readonly _formBuilder: FormBuilder,
  ) {
    super(injector);
  }

  ngOnInit(): void {
    this.form = this._formBuilder.group({
      name: [this.appSession.user?.name, [Validators.required]],
      surname: [this.appSession.user?.surname, [Validators.required]],
      email: [this.appSession.user?.emailAddress, [Validators.required]],
    });
    this.setPageName('Account Detail');
    this.setPageAction('/profile');
    initFlowbite();
  }

  get f() {
    return this.form.controls;
  }

  onSubmit() {
    this.submitted = true;
    const { name, surname, email } = this.form.value;

    // stop here if form is invalid
    if (this.form.invalid) {
      return;
    }

    this.save();
  }

  save(): void {
    this.saving = true;
    this.model.name = this.form.value['name'];
    this.model.surname = this.form.value['surname'];
    this._profileService
      .updateCurrentUserProfileSimple(this.model)
      .pipe(
        finalize(() => {
          this.saving = false;
        }),
      )
      .subscribe(
        (result: any) => {
          this.appSession.setUser(this.model.name, this.model.surname);
          this.toastr.success('Saved Successfully');
        },
        (error: any) => {
          var content = '';
          try {
            content = JSON.parse(error?.response).error.message;
          } catch {
            content = error.message;
          }
          abp.event.trigger('showModal', {
            title: 'Error on Account Save',
            content: content,
            buttonText: 'OK',
            buttonTextSecondary: undefined,
            onPositive: () => {},
            onNegative: () => {},
          });
        },
      );
  }

  deleteAccount() {
    abp.event.trigger('showModal', {
      title: 'Delete Account',
      content: `
    <div class="text-center">
      <p>You are about to delete your account. <br/>Are you sure you want to delete your account?</p>
    </div>
    `,
      buttonText: 'Yes, Delete',
      buttonTextSecondary: 'Cancel',
      danger: true,
      onPositive: () => {
        this._profileService.deleteMe().subscribe((result) => {
          abp.event.trigger('hideModal');
          this.toastr.success('Account Deleted');
          window.location.reload();
        });
      },
      onNegative: () => {},
    });
  }
}
