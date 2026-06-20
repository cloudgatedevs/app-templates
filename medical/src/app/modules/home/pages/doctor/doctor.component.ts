import { Component, Injector, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { initFlowbite } from 'flowbite';
import { AppComponentBase } from 'src/app/shared/common/app-component-base';
import { GalleryGridItemComponent } from '../../components/gallery-grid-item/gallery-grid-item.component';
import { NgClass, NgFor } from '@angular/common';
import { MedicalWorkflowService } from 'src/app/shared/workflow/medical-workflow.service';
import { MedicalDoctor } from 'src/app/shared/workflow/medical.models';

@Component({
  selector: 'app-doctor',
  templateUrl: './doctor.component.html',
  standalone: true,
  imports: [AngularSvgIconModule, GalleryGridItemComponent, NgClass, NgFor],
})
export class DoctorComponent extends AppComponentBase implements OnInit {
  doctor: MedicalDoctor | undefined;
  heroImage = './assets/images/image-01.jpg';

  constructor(
    injector: Injector,
    private readonly _route: ActivatedRoute,
    private readonly _medicalWorkflow: MedicalWorkflowService,
  ) {
    super(injector);
  }

  ngOnInit(): void {
    this.setPageName('Appointment');
    this.setPageAction('/home');

    void this._medicalWorkflow.loadCatalog().then(() => {
      const doctorId = this._route.snapshot.queryParamMap.get('id');
      this.doctor = this._medicalWorkflow.getById(doctorId);
      if (this.doctor?.imageUrl) {
        this.heroImage = this.doctor.imageUrl;
      }
      this.setPageName(this.doctor?.title ?? 'Appointment');
      initFlowbite();
    });
  }
}
