import { NgClass, NgFor, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Modal } from 'flowbite';
import { finalize } from 'rxjs';
import { CommsServiceProxy, ContactUsDto, RegisterOutput } from 'src/shared/service-proxies/service-proxies';
import { UtilsModule } from 'src/shared/utils/utils.module';

@Component({
  selector: 'getInTouchModal',
  templateUrl: './get-in-touch.component.html',
  styleUrls: ['./get-in-touch.component.css'],
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, NgClass, NgIf, UtilsModule, NgFor],
})
export class GetInTouchModalComponent implements OnInit {
  modal: Modal | undefined;
  options: any = {
    closable: false,
  };

  form!: FormGroup;
  saving!: boolean;
  submitted = false;
  subjects: any = [
    {
      name: 'Consulting Services: Get expert advice for your SaaS business needs.',
      value: 1,
    },
    {
      name: "App Support: Benefit from our hands-on assistance to ensure your SaaS project's success.",
      value: 2,
    },
    {
      name: 'Custom Marketplace App: Let us build your custom SaaS application.',
      value: 3,
    },
    {
      name: 'Proof of Concept (POC): Validate your SaaS ideas with our RAD process.',
      value: 4,
    },
    { name: 'Other', value: 5 },
  ];

  constructor(private readonly _formBuilder: FormBuilder, private _commsService: CommsServiceProxy) {}

  ngOnInit(): void {
    this.form = this._formBuilder.group({
      name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      subject: ['', [Validators.required]],
      message: ['', [Validators.required]],
    });

    const infoModal = document.getElementById('getInTouchModal');
    this.modal = new Modal(infoModal, this.options);
    abp.event.on('showGetInTouchModal', () => {
      this.show();
    });
    abp.event.on('hideModal', () => {
      this.hide();
    });
  }

  show(): void {
    this.modal?.toggle();
  }

  hide(): void {
    this.modal?.hide();
  }

  close() {
    if (!this.saving) {
      this.hide();
    }
  }

  get f() {
    return this.form.controls;
  }

  onSubmit() {
    this.submitted = true;
    const { name, email, subject, message, duration } = this.form.value;

    // stop here if form is invalid
    if (this.form.invalid) {
      return;
    }

    this.sendMessage();
  }

  sendMessage() {
    var model = new ContactUsDto();
    model.name = this.form.value['name'];
    model.email = this.form.value['email'];
    model.subject = this.form.value['subject'];
    model.message = this.form.value['message'];

    this.saving = true;
    this._commsService
      .contact(model)
      .pipe(
        finalize(() => {
          this.saving = false;
          this.form.controls['name'].setValue('');
          this.form.controls['email'].setValue('');
          this.form.controls['subject'].setValue('');
          this.form.controls['message'].setValue('');
          this.close();
          abp.notify.success('Sent successfully');
        }),
      )
      .subscribe((result) => {
        this.hide();
      });
  }
}
