import { BrowserModule } from '@angular/platform-browser';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA, APP_INITIALIZER } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent, CustomThing } from './app.component';
import { CommonModule } from '@angular/common';

import { CreateNewEventComponent } from './create-new-event/create-new-event.component';
import { EventRegisterComponent } from './event-register/event-register.component';
import { ModalModule } from 'ngx-bootstrap/modal';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { TabsModule, TabsetConfig } from 'ngx-bootstrap/tabs';
import { MatTabsModule } from '@angular/material/tabs';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgxTagsModule } from 'ngx-tags';
import { SlickCarouselModule } from 'ngx-slick-carousel';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { AccordionModule } from 'ngx-bootstrap/accordion';
import { ToastrModule } from 'ngx-toastr';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { RegistrationLightComponent } from './registration-light/registration-light.component';
import { ArchwizardModule } from 'angular-archwizard';
import { EventSessionsComponent } from './event-sessions/event-sessions.component';
import { BuilderModule } from '@builder.io/angular';
import { EventCreatorComponent } from './event-creator/event-creator.component';
import { RegistrationEventComponent } from './registration-event/registration-event.component';
import { CalendarModule, DateAdapter } from 'angular-calendar';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';
import { EventGeneratorComponent } from './event-generator/event-generator.component';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
import { DataTablesModule } from 'angular-datatables';
import { SignupComponent } from './components/signup/signup.component';
import { CalendarComponent } from './components/calendar/calendar.component';
import { LiveSessionVideoComponent } from './components/live-session-video/live-session-video.component';
import { CurrentUserListingComponent } from './components/current-user-listing/current-user-listing.component';
import { ChatWindowComponent } from './components/chat-window/chat-window.component';
import { EventBuilderComponent } from './components/event-builder/event-builder.component';
import { PollingQuestionsComponent } from './components/polling-questions/polling-questions.component';
import { AttendeeHomeComponent } from './components/attendee-home/attendee-home.component';
import { EventMetricsComponent } from './components/event-metrics/event-metrics.component';
import { EventGoalsComponent } from './components/event-goals/event-goals.component';
import { InternalMailingComponent } from './components/internal-mailing/internal-mailing.component';
import { CameraComponent } from './components/camera/camera.component';
import { EventLandingComponent } from './event-landing/event-landing.component';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { EventModule } from './event/event.module';

//import { ModalStepperComponent } from './FormTools/modal-stepper/modal-stepper.component';
//import { CometChatUI } from "./components/angular-chat-ui-kit/components/CometChatUI/CometChat/cometchat-ui.module";

import { ExhibitorProfileComponent } from './exhibitor-profile/exhibitor-profile.component';
import { LiveVideoChatComponent } from './live-video-chat/live-video-chat.component';
import { PollingQuestionsListingComponent } from './polling-questions-listing/polling-questions-listing.component';
import { PollingQuestionsDetailsComponent } from './polling-questions-details/polling-questions-details.component';
import { GlobalReportingComponent } from './global-reporting/global-reporting.component';
import { AttendeeVerificationComponent } from './attendee-verification/attendee-verification.component';
import { EventErrorComponent } from './event-error/event-error.component';
import { EventVerificationComponent } from './event-verification/event-verification.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { GooglePayButtonModule } from '@google-pay/button-angular';
import { ExhibitorHomeComponent } from './exhibitor-home/exhibitor-home.component';
import { BuilderPagesComponent } from './builder-pages/builder-pages.component';
import { TelerikDesignerComponent } from './telerik-designer/telerik-designer.component';
import { TelerikPreviewComponent } from './telerik-preview/telerik-preview.component';
import { TelerikViewerComponent } from './telerik-viewer/telerik-viewer.component';
import { EventPagesComponent } from './event-pages/event-pages.component';
import { FarmProgressComponent } from './farm-progress/farm-progress.component';
import { NBJComponent } from './nbj/nbj.component';
import { EditEventComponent } from './edit-event/edit-event/edit-event.component';
import { EventsMainComponent } from './events-main/events-main.component';
import { MDBBootstrapModule } from 'angular-bootstrap-md';
import {
  NgbNavModule,
  NgbPaginationModule,
  NgbAlertModule,
  NgbModule
} from '@ng-bootstrap/ng-bootstrap';
import { AuthenticationService } from './services/authentication/authentication';
import { PsmComponent } from './psm/psm.component';
import { ReplacePipe } from './shared/pipes/replace.pipe';
import { CompletionComponent } from './event-pages/completion/completion.component';
import { NgxQRCodeModule } from '@techiediaries/ngx-qrcode';
import { RegistrationModalComponent } from './shared/components/registration-modal/registration-modal.component';
import { BusinessRulesComponent } from './business-rules/business-rules.component';

import {
  ByPassSecurityPipe,
  RunScriptsDirective
} from './components/event-metrics/event-metrics.component';
import { DashboardModule } from './dashboard/dashboard.module';

import { QueryBuilderModule } from 'angular2-query-builder';
import { ReportsBuilderModule } from './reports-builder/reports-builder.module';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { SharedModule } from './shared/shared.module';
import { NgxSliderModule } from '@angular-slider/ngx-slider';
import { ReportExplorerComponent } from './report-explorer/report-explorer.component';
import { EventDataManagerComponent } from './components/event-data-manager/event-data-manager.component';
import { QualificationsManagerComponent } from './qualifications-manager/qualifications-manager.component';
import { EventDataManagerCardComponent } from './components/event-data-manager/event-data-manager-card/event-data-manager-card.component';
import { RegistrationFeesBadgingComponent } from './components/event-data-manager/event-data-manager-card/registration-fees-badging/registration-fees-badging.component';
import { EventDataManagerDemographicsComponent } from './components/event-data-manager/event-data-manager-card/event-data-manager-demographics/event-data-manager-demographics.component';
import { EventDataManagerLinkedRecordsComponent } from './components/event-data-manager/event-data-manager-card/event-data-manager-linked-records/event-data-manager-linked-records.component';
import { EventDataManagerSessionEventsComponent } from './components/event-data-manager/event-data-manager-card/event-data-manager-session-events/event-data-manager-session-events.component';
import { NgxEditInlineModule } from 'ngx-edit-inline';
import { PermissionsManagerComponent } from './permissions-manager/permissions-manager.component';
import { CreateUserComponent } from './permissions-manager/create-user/create-user.component';

// import { KeycloakAngularModule, KeycloakService } from 'keycloak-angular';
import { CreateGroupComponent } from './permissions-manager/create-group/create-group.component';
import { environment } from 'src/environments/environment';
import { HttpConfigInterceptor } from './_interceptor/httpconfig.interceptor';
import { MembershipComponent } from './membership/membership.component';
import { ExhibitorComponent } from './exhibitor/exhibitor.component';
import { GroupPermissionsComponent } from './permissions-manager/group-permissions/group-permissions.component';
import { ChangePasswordComponent } from './permissions-manager/change-password/change-password.component';
import { DisableUserComponent } from './permissions-manager/disable-user/disable-user.component';
import { NgxSpinnerModule } from 'ngx-spinner';
import { NgxMaskModule, IConfig } from 'ngx-mask';
import { EventCompletionComponent } from './shared/components/event-completion/event-completion.component';
import { ToastComponent } from './services/toast/toast.component';
import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';
import { WINDOW_PROVIDERS } from './window.providers';
import { AccountActivationComponent } from './account-activation/account-activation.component';
import { HelpComponent } from './help/help.component';
import { PaymentGatewayComponent } from './payment-gateway/payment-gateway.component';
import { ReorderPagesComponent } from './shared/modals/reorder-pages/reorder-pages.component';
import { CustomQuestionComponent } from './shared/modals/custom-question/custom-question.component';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { SessionActionComponent } from './shared/modals/session-action/session-action.component';
import { DiscountActionComponent } from './shared/modals/discount-action/discount-action.component';
import { PackageActionComponent } from './shared/modals/package-action/package-action.component';
import { RegTypeDeterminationComponent } from './shared/modals/regtype-determination-action/regtype-determination-action.component';
import { CreateSessionComponent } from './shared/modals/create-session/create-session.component';
import { WelcomeComponent } from './welcome/welcome.component';
// import { RecaptchaFormsModule, RecaptchaModule } from 'ng-recaptcha';
import { LegacyReportsComponent } from './legacy-reports/legacy-reports.component';
import { AccessCodeModalComponent } from './components/access-code-modal/access-code-modal.component';
// function initializeKeycloak(keycloak: KeycloakService) {
//   return async () =>
//     await keycloak.init({
//       config: environment.keycloak.config,
//       initOptions: {
//         onLoad: 'check-sso',
//         checkLoginIframe: true,
//         checkLoginIframeInterval: 100,
//         // flow: "implicit",
//         // silentCheckSsoRedirectUri: environment.baseURL,
//         // silentCheckSsoFallback: false
//       },
//       enableBearerInterceptor: false,
//       bearerExcludedUrls: [
//         "/apiv2/",
//         "/api/",
//         "/assets",
//         "/auth"
//       ]
//     });
// }

// export const options: Partial<IConfig> | (() => Partial<IConfig>) = null;

@NgModule({
  declarations: [
    AppComponent,
    CreateNewEventComponent,
    EventRegisterComponent,
    RegistrationLightComponent,
    EventSessionsComponent,
    EventCreatorComponent,
    CustomThing,
    RegistrationEventComponent,
    // CustomQuerybuilderComponent,
    EventGeneratorComponent,
    HeaderComponent,
    FooterComponent,
    SignupComponent,
    CalendarComponent,
    LiveSessionVideoComponent,
    CameraComponent,
    CurrentUserListingComponent,
    ChatWindowComponent,
    EventBuilderComponent,
    PollingQuestionsComponent,
    AttendeeHomeComponent,
    EventMetricsComponent,
    EventGoalsComponent,
    InternalMailingComponent,
    EventLandingComponent,
    ExhibitorProfileComponent,
    LiveVideoChatComponent,
    PollingQuestionsListingComponent,
    PollingQuestionsDetailsComponent,
    GlobalReportingComponent,
    AttendeeVerificationComponent,
    EventErrorComponent,
    EventVerificationComponent,
    ForgotPasswordComponent,
    ExhibitorHomeComponent,
    BuilderPagesComponent,
    TelerikDesignerComponent,
    TelerikPreviewComponent,
    TelerikViewerComponent,
    EventPagesComponent,
    FarmProgressComponent,
    NBJComponent,
    EditEventComponent,
    CompletionComponent,
    CustomThing,
    RegistrationEventComponent,
    EventGeneratorComponent,
    HeaderComponent,
    FooterComponent,
    SignupComponent,
    CalendarComponent,
    LiveSessionVideoComponent,
    CameraComponent,
    CurrentUserListingComponent,
    ChatWindowComponent,
    EventBuilderComponent,
    PollingQuestionsComponent,
    AttendeeHomeComponent,
    EventMetricsComponent,
    EventGoalsComponent,
    InternalMailingComponent,
    EventLandingComponent,
    ExhibitorProfileComponent,
    LiveVideoChatComponent,
    PollingQuestionsListingComponent,
    PollingQuestionsDetailsComponent,
    GlobalReportingComponent,
    AttendeeVerificationComponent,
    EventErrorComponent,
    EventVerificationComponent,
    ForgotPasswordComponent,
    ExhibitorHomeComponent,
    BuilderPagesComponent,
    EventPagesComponent,
    FarmProgressComponent,
    NBJComponent,
    EditEventComponent,
    EventsMainComponent,
    PsmComponent,
    ReplacePipe,
    RegistrationModalComponent,
    BusinessRulesComponent,
    // BusinessRulesQbComponent,
    ByPassSecurityPipe,
    RunScriptsDirective,
    ResetPasswordComponent,
    ReportExplorerComponent,
    EventDataManagerComponent,
    QualificationsManagerComponent,
    EventDataManagerCardComponent,
    RegistrationFeesBadgingComponent,
    EventDataManagerDemographicsComponent,
    EventDataManagerLinkedRecordsComponent,
    EventDataManagerSessionEventsComponent,
    EventCompletionComponent,
    
    /** Permissions Manager Components */
    PermissionsManagerComponent,
    CreateUserComponent,
    CreateGroupComponent,
    MembershipComponent,
    ExhibitorComponent,
    GroupPermissionsComponent,
    ChangePasswordComponent,
    DisableUserComponent,
    ToastComponent,
    AccountActivationComponent,
    HelpComponent,
    PaymentGatewayComponent,
    ReorderPagesComponent,
    CustomQuestionComponent,
    SessionActionComponent,
    DiscountActionComponent,
    PackageActionComponent,
    CreateSessionComponent,
    WelcomeComponent,
    RegTypeDeterminationComponent,
    LegacyReportsComponent,
    AccessCodeModalComponent,
  ],
  entryComponents: [CustomThing],
  imports: [
    SlickCarouselModule,
    GooglePayButtonModule,
    BrowserModule.withServerTransition({ appId: 'serverApp' }),
    AppRoutingModule,
    CommonModule,
    BrowserModule,
    ModalModule.forRoot(),
    BsDatepickerModule.forRoot(),
    TabsModule.forRoot(),
    FormsModule,
    BrowserAnimationsModule,
    NgxTagsModule,
    ReactiveFormsModule,
    DragDropModule,
    AccordionModule.forRoot(),
    ToastrModule.forRoot(),
    HttpClientModule,
    ArchwizardModule,
    BuilderModule.forRoot('95987ae43674442f9f69697d1ca04156'),
    DataTablesModule,
    //CometChatUI,
    CalendarModule.forRoot({
      provide: DateAdapter,
      useFactory: adapterFactory
    }),
    MDBBootstrapModule.forRoot(),
    NgbNavModule,
    NgxQRCodeModule,
    NgbPaginationModule,
    NgbAlertModule,
    NgbModule,
    NgMultiSelectDropDownModule.forRoot(),
    DashboardModule,
    // QueryBuilderModule,
    ReportsBuilderModule,
    MatTabsModule,
    SharedModule,
    NgxSliderModule,
    NgxEditInlineModule,
    // KeycloakAngularModule,
    NgxSpinnerModule,
    MatAutocompleteModule,
    MatInputModule,
    NgxMaskModule.forRoot(),
    SweetAlert2Module.forRoot(),
    MatRadioModule,
    // RecaptchaV3Module,
    // RecaptchaModule,
    // RecaptchaFormsModule 
    EventModule,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  providers: [
    // {
    //   provide: RECAPTCHA_V3_SITE_KEY,
    //   useValue: environment.recaptcha.siteKey,
    // },
    AuthenticationService,
    TabsetConfig,
    // {
    //   provide: APP_INITIALIZER,
    //   useFactory: initializeKeycloak,
    //   multi: true,
    //   deps: [KeycloakService],
    // },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: HttpConfigInterceptor,
      multi: true
    },
    WINDOW_PROVIDERS,
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
