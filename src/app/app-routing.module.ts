import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { EventsMainComponent } from './events-main/events-main.component';
import { EventCreatorComponent } from './event-creator/event-creator.component';
import { EventGeneratorComponent } from './event-generator/event-generator.component';
import { RegistrationEventComponent } from './registration-event/registration-event.component';
import { SignupComponent } from './components/signup/signup.component';
import { CalendarComponent } from './components/calendar/calendar.component';
import { LiveSessionVideoComponent } from './components/live-session-video/live-session-video.component';
import { EventBuilderComponent } from './components/event-builder/event-builder.component';
import { PollingQuestionsComponent } from './components/polling-questions/polling-questions.component';
import { AttendeeHomeComponent } from './components/attendee-home/attendee-home.component';
import { EventMetricsComponent } from './components/event-metrics/event-metrics.component';
import { InternalMailingComponent } from './components/internal-mailing/internal-mailing.component';
import { EventLandingComponent } from './event-landing/event-landing.component';
import { ExhibitorProfileComponent } from './exhibitor-profile/exhibitor-profile.component';
import { LiveVideoChatComponent } from './live-video-chat/live-video-chat.component';
import { PollingQuestionsDetailsComponent } from './polling-questions-details/polling-questions-details.component';
import { PollingQuestionsListingComponent } from './polling-questions-listing/polling-questions-listing.component';
import { GlobalReportingComponent } from './global-reporting/global-reporting.component';
import { AttendeeVerificationComponent } from './attendee-verification/attendee-verification.component';
import { EventErrorComponent } from './event-error/event-error.component';
import { EventVerificationComponent } from './event-verification/event-verification.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { BuilderPagesComponent } from './builder-pages/builder-pages.component';
import { TelerikDesignerComponent } from './telerik-designer/telerik-designer.component';
import { TelerikPreviewComponent } from './telerik-preview/telerik-preview.component';
import { TelerikViewerComponent } from './telerik-viewer/telerik-viewer.component';
import { EventPagesComponent } from './event-pages/event-pages.component';
import { ExhibitorHomeComponent } from './exhibitor-home/exhibitor-home.component';
import { NBJComponent } from './nbj/nbj.component';
import { FarmProgressComponent } from './farm-progress/farm-progress.component';
import { EditEventComponent } from './edit-event/edit-event/edit-event.component';
import { RegistrationModalComponent } from './shared/components/registration-modal/registration-modal.component';
import { DashboardComponent } from './dashboard/dashboard/dashboard.component';
import { ReportsComponent } from './reports-builder/reports/reports.component';
import { ReportExplorerComponent } from './report-explorer/report-explorer.component';
import { EventDataManagerComponent } from './components/event-data-manager/event-data-manager.component';
import { QualificationsManagerComponent } from './qualifications-manager/qualifications-manager.component';
import { PermissionsManagerComponent } from './permissions-manager/permissions-manager.component';
import { AuthGuard } from './guards/auth.guard';
import { AccountActivationComponent } from './account-activation/account-activation.component';
import { HelpComponent } from './help/help.component';
import { PaymentGatewayComponent } from './payment-gateway/payment-gateway.component';
import { BusinessRulesQbComponent } from './event/components/business-rules-qb/business-rules-qb.component';
import { WelcomeComponent } from './welcome/welcome.component';
import { LegacyReportsComponent } from './legacy-reports/legacy-reports.component';

const routes: Routes = [
  {
    path: '',
    component: EventsMainComponent
  },
  {
    path: 'login',
    component: WelcomeComponent
  },
  // {
  //   // default for nbj event
  //   path: 'nbj/:id',
  //   component: NBJComponent
  // },
  // {
  //   // test for farm event
  //   path: 'farm/:id',
  //   component: FarmProgressComponent
  // },
  {
    path: 'event/:id',
    component: EventCreatorComponent
  },
  {
    path: 'events/:id',
    component: EventLandingComponent
  },
  {
    path: 'eventerror',
    component: EventErrorComponent
  },
  {
    path: 'builder/:id',
    component: BuilderPagesComponent
  },
  {
    path: 'tlkreportdesigner/:id',
    component: TelerikDesignerComponent
  },
  {
    path: 'tlkreportviewer/:id',
    component: TelerikViewerComponent
  },
  {
    path: 'tlkreportpreview/:id',
    component: TelerikPreviewComponent
  },
  {
    path: 'exhibitor/:id',
    component: ExhibitorHomeComponent
  },
  {
    path: 'pages/:id/:eventId',
    component: EventPagesComponent
  },
  {
    path: 'blank/:id/:eventId',
    component: RegistrationModalComponent
  },
  {
    path: 'eventverify/:id',
    component: EventVerificationComponent
  },
  {
    path: 'forgotpassword',
    component: ForgotPasswordComponent
  },
  {
    path: 'reset-password/:code',
    component: ResetPasswordComponent
  },
  {
    path: 'pollingquestionslisting/:id',
    component: PollingQuestionsListingComponent
  },
  {
    path: 'pollingquestionsdetails/:id',
    component: PollingQuestionsDetailsComponent
  },
  {
    path: 'eventgenerator',
    component: EventGeneratorComponent
  },
  {
    path: 'registration',
    component: RegistrationEventComponent
  },
  {
    path: 'calendar',
    component: CalendarComponent
  },
  {
    path: 'signup',
    component: SignupComponent
  },
  {
    path: 'account',
    component: SignupComponent
  },
  {
    path: 'livesession',
    component: LiveSessionVideoComponent
  },
  {
    path: 'groupsession/:id',
    component: LiveVideoChatComponent
  },
  {
    path: 'inbox/:id',
    component: InternalMailingComponent
  },
  {
    path: 'polling/:id',
    component: PollingQuestionsComponent
  },
  {
    path: 'attendees/:id',
    component: AttendeeHomeComponent
  },
  // {
  //   path: 'verification/:id',
  //   component: AttendeeVerificationComponent
  // },
  {
    path: 'verification/:code',
    component: AccountActivationComponent
  },
  {
    path: 'eventmetrics/:id',
    component: EventMetricsComponent
  },
  {
    path: 'globalreports/:id',
    component: GlobalReportingComponent
  },
  {
    path: 'eventbuilder',
    component: EventBuilderComponent
  },
  {
    path: 'editevent',
    component: EditEventComponent
  },
  {
    path: 'viewevent',
    component: EditEventComponent
  },
  {
    path: 'businessrule/:evtUid',
    component: BusinessRulesQbComponent
  },
  {
    path: 'dashboard/:evtUid/:showId',
    component: DashboardComponent
  },
  {
    path: 'payment-gateway/:attendeeUid/:guid',
    component: PaymentGatewayComponent
  },
  {
    path: 'reports/:evtUid/:showId',
    component: ReportsComponent
  },
  {
    path: "report-explorer",
    component: ReportExplorerComponent
  },
  {
    path: "legacy-reports",
    component: LegacyReportsComponent
  },
  {
    path: 'event-data-manager',
    component: EventDataManagerComponent
  },
  {
    path: "qualifications-manager",
    component: QualificationsManagerComponent
  },
  {
    path: "permissions-manager",
    component: PermissionsManagerComponent,
    // canActivate: [AuthGuard]
  },
  {
    path: "faq",
    component: HelpComponent
  },
  {
    path: "eventExplorer",
    loadChildren: () => import("./event/event.module").then(m => m.EventModule)
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      initialNavigation: 'enabled'
    })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
