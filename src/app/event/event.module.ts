import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EventRoutingModule } from './event-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxMaskModule } from 'ngx-mask';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ClipboardModule } from '@angular/cdk/clipboard';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { NgxSpinnerModule } from 'ngx-spinner';
import { CalendarModule, DateAdapter } from 'angular-calendar';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';
import { AngularEditorModule } from '@kolkov/angular-editor';
import { ChipsModule } from 'primeng/chips';
import { ButtonModule } from 'primeng/button';
import { NgTinyUrlModule } from 'ng-tiny-url';

/** Components */
import { EventComponent } from './event.component';
import { EventInfoComponent } from './components/event-info/event-info.component';
import { RegTypesComponent } from './components/reg-types/reg-types.component';
import { PackagesComponent } from './components/packages/packages.component';
import { DiscountsComponent } from './components/discounts/discounts.component';
import { QualificationsComponent } from './components/qualifications/qualifications.component';
import {
  NgbdSortableHeader,
  SessionsComponent,
} from './components/sessions/sessions.component';
import { FloorplanComponent } from './components/floorplan/floorplan.component';
import { DemoQuestionsComponent } from './components/demo-questions/demo-questions.component';
import { PageBuilderComponent } from './components/page-builder/page-builder.component';
import { ExhibitorAllotementComponent } from './components/exhibitor-allotement/exhibitor-allotement.component';
import { MembershipComponent } from './components/membership/membership.component';
import { CompleteComponent } from './components/complete/complete.component';

/** Modals */
import { CreateRegtypeComponent } from './modals/create-regtype/create-regtype.component';
import { DeleteRegtypeConfirmComponent } from './modals/delete-regtype-confirm/delete-regtype-confirm.component';
import { CreateSessionComponent } from './modals/create-session/create-session.component';
import { EmailTemplateComponent } from './modals/email-template/email-template.component';
import { ImportQuestionsComponent } from './modals/import-questions/import-questions.component';
import { EditQuestionsDetailComponent } from './modals/edit-questions-detail/edit-questions-detail.component';
import { CreateQualificationComponent } from './modals/create-qualification/create-qualification.component';
import { DeleteConfirmComponent } from './modals/delete-confirm/delete-confirm.component';
import { CreateSpeakerComponent } from './modals/create-speaker/create-speaker.component';
import { DuplicateEventComponent } from './modals/duplicate-event/duplicate-event.component';
import { SendInviteComponent } from './modals/send-invite/send-invite.component';
import { PSMExportComponent } from './modals/psm-export/psm-export.component';
import { LeaveEventComponent } from './modals/leave-event/leave-event.component';
import { BusinessRulesQbComponent } from './components/business-rules-qb/business-rules-qb.component';
import { CustomQuerybuilderComponent } from './components/custom-querybuilder/custom-querybuilder.component';
import { QueryBuilderModule } from 'angular2-query-builder';

/** directive */
import { NumbersOnlyDirective } from '../shared/directives/number-only.directive';
import { EnableFlowpageComponent } from './modals/enable-flowpage/enable-flowpage.component';
import { PageCustomizationsComponent } from './components/page-customizations/page-customizations.component';
import { FieldModalComponent } from './modals/field-modal/field-modal.component';
import { EmailBuilderComponent } from './components/email-builder/email-builder.component';
import { EmailEditorModule } from 'angular-email-editor';
import { BadgeDesignerComponent } from './components/badge-designer/badge-designer.component';
import { BadgeModule } from 'angular-bootstrap-md';
import { GooglePlaceModule } from 'ngx-google-places-autocomplete';
import { SortDirective } from './directive/sort.directive';
import { DragDropModule } from '@angular/cdk/drag-drop';

@NgModule({
  declarations: [
    EventComponent,
    EventInfoComponent,
    RegTypesComponent,
    PackagesComponent,
    DiscountsComponent,
    QualificationsComponent,
    SessionsComponent,
    FloorplanComponent,
    DemoQuestionsComponent,
    PageBuilderComponent,
    ExhibitorAllotementComponent,
    MembershipComponent,
    CompleteComponent,
    CreateRegtypeComponent,
    DeleteRegtypeConfirmComponent,
    DeleteConfirmComponent,
    CreateSessionComponent,
    EmailTemplateComponent,
    ImportQuestionsComponent,
    EditQuestionsDetailComponent,
    CreateQualificationComponent,
    CreateSpeakerComponent,
    DuplicateEventComponent,
    SendInviteComponent,
    PSMExportComponent,
    LeaveEventComponent,
    CustomQuerybuilderComponent,
    BusinessRulesQbComponent,
    NumbersOnlyDirective,
    EnableFlowpageComponent,
    PageCustomizationsComponent,
    FieldModalComponent,
    EmailBuilderComponent,
    BadgeDesignerComponent,
    SortDirective,
    NgbdSortableHeader,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    EventRoutingModule,
    NgxMaskModule.forRoot(),
    BsDatepickerModule.forRoot(),
    NgMultiSelectDropDownModule.forRoot(),
    NgbModule,
    ClipboardModule,
    MatCheckboxModule,
    NgxSpinnerModule,
    CalendarModule.forRoot({
      provide: DateAdapter,
      useFactory: adapterFactory,
    }),
    NgTinyUrlModule,
    AngularEditorModule,
    ChipsModule,
    ButtonModule,
    QueryBuilderModule,
    EmailEditorModule,
    BadgeModule,
    GooglePlaceModule,
    DragDropModule,
  ],
  exports: [NumbersOnlyDirective],
})
export class EventModule {}
