import { NgClass, NgFor, NgIf } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Modal } from 'flowbite';
import { UtilsModule } from 'src/shared/utils/utils.module';
import { AppEventsService } from '../../core/app-events.service';
import { NotifyService } from '../../core/notify.service';

@Component({
  selector: 'getInTouchModal',
  templateUrl: './get-in-touch.component.html',
  styleUrls: ['./get-in-touch.component.css'],
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, NgClass, NgIf, UtilsModule, NgFor],
})
export class GetInTouchModalComponent implements OnInit, OnDestroy {
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

  private readonly showHandler = () => {
    this.show();
  };

  private readonly hideHandler = () => {
    this.hide();
  };

  constructor(
    private readonly _formBuilder: FormBuilder,
    private readonly appEvents: AppEventsService,
    private readonly notify: NotifyService,
  ) {}

  ngOnInit(): void {
    this.form = this._formBuilder.group({
      name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      subject: ['', [Validators.required]],
      message: ['', [Validators.required]],
    });

    const infoModal = document.getElementById('getInTouchModal');
    this.modal = new Modal(infoModal, this.options);
    this.appEvents.on('showGetInTouchModal', this.showHandler);
    this.appEvents.on('hideModal', this.hideHandler);
  }

  ngOnDestroy(): void {
    this.appEvents.off('showGetInTouchModal', this.showHandler);
    this.appEvents.off('hideModal', this.hideHandler);
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

    if (this.form.invalid) {
      return;
    }

    this.sendMessage();
  }

  sendMessage() {
    this.saving = true;
    this.form.controls['name'].setValue('');
    this.form.controls['email'].setValue('');
    this.form.controls['subject'].setValue('');
    this.form.controls['message'].setValue('');
    this.saving = false;
    this.close();
    this.notify.info('Contact form is not connected to a backend in this template.');
  }
}
