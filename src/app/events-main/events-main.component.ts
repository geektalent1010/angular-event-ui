import {
  AfterViewInit,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
  ViewEncapsulation
} from '@angular/core';
import { BehaviorSubject, combineLatest, Observable, of, interval, Subject } from "rxjs";
import { takeUntil, takeWhile } from "rxjs/operators";

import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { CreateNewEventComponent } from 'src/app/create-new-event/create-new-event.component';
import { RegistrationLightComponent } from '../registration-light/registration-light.component';
import { HttpClient } from '@angular/common/http';
import { HttpHeaders } from '@angular/common/http';
import { SafeHtml } from '@angular/platform-browser';
import slugify from 'slugify';
import { SessionServiceService } from '../services/session-service.service';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { API_URL, API_URL2 } from '../services/url/url';
import { FormControl } from '@angular/forms';
import { debounceTime, distinctUntilChanged, startWith } from 'rxjs/operators';
// import { PermissionData, RolesService } from '../services/roles.service';
import { AccessCodeModalComponent } from '../components/access-code-modal/access-code-modal.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

var headers = new HttpHeaders()
  .set('content-type', 'application/json')
  .set('Access-Control-Allow-Headers', 'Content-Type')
  .set('Access-Control-Allow-Methods', 'GET, PUT, POST, OPTIONS')
  .set('Access-Control-Allow-Origin', '*');

@Component({
  selector: 'app-events-main',
  templateUrl: './events-main.component.html',
  styleUrls: ['./events-main.component.scss'],
})
export class EventsMainComponent implements OnInit, AfterViewInit {
  modalRef: BsModalRef;

  events: Array<any>;

  sortCol: string = 'addDate';
  sortDirection: boolean = false;
  searchControl: FormControl = new FormControl("");
  layoutView: boolean = true;

  collectionSize: number = 0;
  page: number = 1;
  pageSize: number = 12;

  isClient: boolean = localStorage.getItem('userTypeCode') === 'CLI';
  canCreateEvent: boolean = false;
  canEditEvent: boolean = true;

  allEventRows: SafeHtml;
  eventCount: Number;
  userTypeCode: string;
  loggedUser: string;

  userId: string = '';
  loggedIn: string = '';
  userName: string = '';
  emailAddr: string = '';
  environment = environment.production;
  PUBLISHED_PAPERBITS: string = environment.PUBLISHED_PAPERBITS;

  today: Date = new Date();
  viewSort: boolean = false;

  componentDestroyed$: Subject<boolean> = new Subject();
  publishingEvents = [];

  constructor(
    private modalService: BsModalService,
    private httpClient: HttpClient,
    private sessionService: SessionServiceService,
    private router: Router,
    private codeModalService: NgbModal,
    // private rolesService: RolesService
  ) {

    if (localStorage.getItem("Authorization")) {
      headers = new HttpHeaders()
      .set('content-type', 'application/json')
      .set('Access-Control-Allow-Headers', 'Content-Type')
      .set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
      .set('Access-Control-Allow-Origin', '*')
      .set('Authorization', localStorage.getItem("Authorization"));
    }

    this.userTypeCode = localStorage.getItem('userTypeCode')
      ? localStorage.getItem('userTypeCode')
      : '';
    this.userId = localStorage.getItem('userId');
    this.loggedIn = localStorage.getItem('loggedIn')
    this.userName = localStorage.getItem('username');
    this.emailAddr = localStorage.getItem('emailAddr') || this.userId
    this.loggedUser = localStorage.getItem('username');

    console.log("loggedUser", this.userId, this.loggedIn)
    if (this.loggedIn !== "true") {
      this.router.navigateByUrl("/login");
    }
  }

  ngOnInit(): void {
    this.allEventRows = '';
    this.eventCount = 0;
    this.canCreateEvent = localStorage.getItem("canCreateEvent") === "true";
    // this.rolesService.permissions.subscribe((roles: PermissionData) => {
    //   this.canCreateEvent = roles.createEvent;
    //   this.canEditEvent = roles.editEvent;
    // });
    this.searchControl.valueChanges.pipe(
      startWith(""),
      debounceTime(1000),
      distinctUntilChanged()
    ).subscribe((searchText: string) => {
      this.getEventsByPage();
    });
  }

  ngAfterViewInit() {
    this.getEventsByPage();
  }

  ngOnDestroy() {
    this.componentDestroyed$.next(true);
    this.componentDestroyed$.complete();
  }

  isValidDate(d: any) {
    return !isNaN(Date.parse(d));
  }

  getEventsByPage() {
    this.componentDestroyed$.next(true);

    var GET_ALL_EVENTS = `${API_URL2}/csi/event/services/eventV2/getEventsPerPage?page=${this.page-1}&sort=${this.sortCol},${this.sortDirection? 'ASC':'DESC'}&searchTerm=${this.searchControl.value? this.searchControl.value.toLowerCase():''}`;

    this.httpClient.get(GET_ALL_EVENTS, { headers }).subscribe(data => {
      if (data['response']['Error'] != undefined) {
        alert('Something wrong to fetch events.');
      } else {
        this.events = data['response']['events']
          .map(event => ({
            ...event,
            eventSlug: slugify(event.evtName, { lower: true }),
            eventShowEndDate: this.formatDate(new Date(event.showEndDate)),
            evtStartDate: event.evtStartDate
              ? this.formatDate(new Date(event.evtStartDate))
              : this.formatDate(new Date(event.startDate)),
            evtEndDate: event.evtEndDate
              ? this.formatDate(new Date(event.evtEndDate))
              : this.formatDate(new Date(event.endDate)),
            startDate: this.isValidDate(event.evtStartDate) ? new Date(event.evtStartDate) : (this.isValidDate(event.startDate) ? new Date(event.startDate) : null),
            endDate: this.isValidDate(event.evtEndDate) ? new Date(event.evtEndDate) : (this.isValidDate(event.endDate) ? new Date(event.endDate) : null),
            addDate: this.isValidDate(event.addDate) ? new Date(event.addDate) : null,
            location: `${event.venueAddress || ''} ${event.venueCity ||
              ''} ${event.venueState || ''}`,
            eventYear: this.getEventYear(event.evtName),
            isPublished: this.formatIsPublished(event.isPublished),
            isTestEnv: window.location.href.indexOf('test')
          }))
          .filter(x => !x.disabledFlag)
          .sort((a, b) => {
            const valueLeft = new Date(a.addDate);
            const valueRight = new Date(b.addDate);
            if (valueLeft > valueRight) return this.sortDirection ? 1 : -1;
            if (valueLeft < valueRight) return this.sortDirection ? -1 : 1;
            return 0;
          });
        this.collectionSize = data['response']['totalPages'] * this.pageSize;

        this.componentDestroyed$.next(false);
        this.publishingEvents = this.events.map(event => new Subject());

        this.events.forEach((event, idx) => {
          if (!event.isPublished) {
            console.log('calling isPublished', event.builderId);
            interval(2000).pipe(takeUntil(this.componentDestroyed$)).pipe(takeUntil(this.publishingEvents[idx])).subscribe((x) => {
              const SERVICE_API =
                API_URL2 +
                '/csi/event/services/eventSetupV2/isPublishPaperbitsForEventCompleted';
              const data = {
                projectId: 'csi-event-a3367',
                clientName: this.userName,
                guid: event.builderId
              };
              this.httpClient
                .post<any>(SERVICE_API, data, { headers: headers })
                .pipe(takeUntil(this.componentDestroyed$))
                .pipe(takeUntil(this.publishingEvents[idx]))
                .subscribe(
                  data => {
                    let isChanged = false;
                    if (data.response.buildComplete === 'yes' || data.response.buildComplete === 'error') {
                      this.makeEventPublished(event.builderId, data.response);
                      isChanged = true;
                    } else {
                      this.events = this.events.map(e => {
                        if (e.builderId === event.builderId && e.buildPercentage !== parseInt(data.response.percentComplete )) {
                          isChanged = true;
                          return {
                              ...e,
                              isPublished: false,
                              buildPercentage: parseInt(
                                data.response.percentComplete
                              ),
                              buildStatus: data.response.buildStatus,
                              thumbnailUrl: data.response.thumbnailUrl
                          }
                        } else {
                          return e;
                        }
                      });
                    }
                    // if (isChanged)
                    //   this.filterEvents();
                  },
                  error => {
                    const errorMessage = `Error -  ${error.message}`;
                    console.log(error);
                  }
                );
              });
          }
        });

        console.log(this.events);
      }
    });
  }

  changePage($event) {
    this.page = $event;
    this.getEventsByPage();
  }

  private formatIsPublished(value: any): boolean {
    return value === 'false' ? false : true;
  }

  makeEventPublished(builderId, newEvent) {
    this.events = this.events.map((e, idx) => {
      if (builderId === e.builderId && newEvent.buildComplete === "yes") {
        this.publishingEvents[idx].next(true);
        this.publishingEvents[idx].complete();
      }
      return builderId === e.builderId
        ? {
            ...e,
            isPublished: newEvent.buildComplete === "yes" ? true : false,
            buildPercentage: newEvent.buildComplete === "yes" ? 100 : 0,
            buildStatus: newEvent.buildComplete === "yes" ? 'Complete' : "Error",
            thumbnailUrl: newEvent.thumbnailUrl
          }
        : e
    });
  }

  isPublished(eventGuid: string) {
    const headers = new HttpHeaders()
      .set('content-type', 'application/json')
      .set('Access-Control-Allow-Headers', 'Content-Type')
      .set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
      .set('Access-Control-Allow-Origin', '*');

    const SERVICE_API =
      API_URL +
      '/csi/event/services/eventV2/isPublishPaperbitsForEventCompleted';
    const data = {
      projectId: 'csi-event-a3367',
      clientName: this.userName,
      guid: eventGuid
    };
    this.httpClient
      .post<any>(SERVICE_API, data, { headers: headers })
      .subscribe(
        data => {
          console.log(data);
        },
        error => {
          const errorMessage = `Error -  ${error.message}`;
          console.log(error);
        }
      );
  }

  private formatDate(date) {
    const d = new Date(date);
    let month = '' + (d.getMonth() + 1);
    let day = '' + d.getDate();
    const year = d.getFullYear();
    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;
    return [year, month, day].join('-');
  }
  isNumeric(str: string) {
    if (typeof str != 'string') return false; // we only process strings!
    return !isNaN(parseInt(str)); // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)... // ...and ensure strings of whitespace fail
  }
  getEventYear(str: string) {
    const dateString = str ? str.substring(str.length - 4) : '';
    return this.isNumeric(dateString) ? dateString : '';
  }

  openSignupLoginModal() {
    this.modalRef = this.modalService.show(RegistrationLightComponent, {
      class: 'modal-lg modal-dialog-centered',
      ignoreBackdropClick: true,
      keyboard: false
    });
  }

  sortOn(column: string) {
    this.sortDirection = this.sortCol === column ? !this.sortDirection : false;
    this.sortCol = column;
    this.getEventsByPage();
  }

  sortColClass(col: string) {
    if (this.sortCol === col) {
      return this.sortDirection ? 'sort-asc' : 'sort-desc';
    }
    return '';
  }

  openEventRegisterModal(eventSlug, id) {
    // const initialState = {
    //   paramEventId: id,
    //   paramID: eventSlug
    // };
    // this.modalRef = this.modalService.show(RegistrationModalComponent, {
    //   class: 'modal-lg modal-dialog-centered',
    //   initialState,
    //   ignoreBackdropClick: true,
    //   keyboard: false
    // });
    // this.modalRef.content.hide.subscribe(result => {
    //   this.hideModal();
    // });
  }

  hideModal() {
    this.modalService.hide();
  }

  editEvent(id) {
    this.sessionService.set('selectedEvent', id);
    this.sessionService.set('mode', 'edit');
    this.router.navigate(['/editevent']);
  }

  businessRule(id) {
    this.sessionService.set('selectedEvent', id);
    this.router.navigate([`/businessrule/${id}`]);
  }

  deleteEvent(id) {

    let delete_api = API_URL2 + `/csi/event/services/eventSetupV2/disable?evtUid=${id}`;
    if (confirm('Are you sure want to delete Event')) {
      this.httpClient
        .post(delete_api, { disableFlag: true }, { headers: headers })
        .subscribe((deleteResponse: any) => {
          if (deleteResponse?.statusMessage === "Success") {
            this.events = this.events.filter(event => event.id != id);
          }
        });
    }
  }

  viewEvent(id, eventSlug) {
    this.sessionService.set('selectedEvent', id);
    this.sessionService.set('mode', 'view');
    this.router.navigate(['/viewevent']);
  }

  openSite(event: any, type: string) {
    const timestamp: number = new Date().getTime();
    let selectionPath: string = "";
    let guid: string = "";
    switch (type) {
      case "attendee":
        selectionPath = event.builderSelection;
        guid = event.builderId;
        break;
      case "exhibitor":
        selectionPath = event.exhibitorSelection;
        guid = event.exhibitorId;
        break;
      case "organizer":
        selectionPath = event.organizerSelection;
        guid = event.organizerId;
        break;
      default:
        break;
    }
    const URL: string = `${this.PUBLISHED_PAPERBITS}/${event.addUserid}/${guid}/${selectionPath}?email=${this.emailAddr}&isLoggedIn=${this.loggedIn}`;
    window.open(URL, '_blank');
  }

  gotoCreateEvent() {
    // this.router.navigateByUrl("/eventgenerator");
    this.router.navigateByUrl("/eventExplorer/create");
  }

  goEditEvent(event) {
    if (event.eventSecurityType === 'private') {
      const createQuestionModalRef = this.codeModalService.open(AccessCodeModalComponent, {
        size: 'lg',
        windowClass: 'modal-access-code'
      });
      createQuestionModalRef.componentInstance.evtUid = event.id;
      createQuestionModalRef.result.then((value: any) => {
        console.log("value: ", value);
      }).catch((err: Error) => {
        console.error("close error: ", err);
      });
    } else {
      this.router.navigateByUrl("/eventExplorer/edit/" + event.id);
    }
  }
}
