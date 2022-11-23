import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AddDiscountComponent } from './modals/add-discount/add-discount.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CreateReportComponent } from './modals/create-report/create-report.component';
import { EditReportComponent } from './modals/edit-report/edit-report.component';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { NgxDaterangepickerMd } from 'ngx-daterangepicker-material';
import { ReportChangeHistoryComponent } from './modals/report-change-history/report-change-history.component';
import { PublishReportComponent } from './modals/publish-report/publish-report.component';
import { NgxSpinnerModule } from 'ngx-spinner';
import { CheckboxModule, WavesModule, ButtonsModule } from 'angular-bootstrap-md'
import { MDBBootstrapModule } from 'angular-bootstrap-md';
import { CreateQualificationComponent } from './modals/create-qualification/create-qualification.component';
import { ImportQuestionsComponent } from './modals/import-questions/import-questions.component';
import { DuplicateEventComponent } from './modals/duplicate-event/duplicate-event.component';

import { MatCheckboxModule } from '@angular/material/checkbox';
import { CommunicationDeterminationComponent } from './modals/communication-determination/communication-determination.component';

@NgModule({
  declarations: [
    AddDiscountComponent,
    CreateReportComponent,
    EditReportComponent,
    ReportChangeHistoryComponent,
    PublishReportComponent,
    CreateQualificationComponent,
    ImportQuestionsComponent,
    DuplicateEventComponent,
    CommunicationDeterminationComponent
  ],
  imports: [
    CommonModule,
    BrowserModule.withServerTransition({ appId: 'serverApp' }),
    FormsModule,
    ReactiveFormsModule,
    NgbModule,
    BrowserAnimationsModule,
    NgMultiSelectDropDownModule.forRoot(),
    NgxDaterangepickerMd.forRoot(),
    NgxSpinnerModule,
    MDBBootstrapModule.forRoot(),
    CheckboxModule,
    WavesModule,
    ButtonsModule,
    MatCheckboxModule
  ]
})
export class SharedModule { }
