import {
  Component,
  ViewChild,
  TemplateRef,
  Input,
  OnInit,
  AfterContentInit
} from '@angular/core';
import {
  startOfDay,
  endOfDay,
  subDays,
  addDays,
  endOfMonth,
  isSameDay,
  isSameMonth,
  addHours,
  parse
} from 'date-fns';
import { Subject } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import {
  CalendarEvent,
  CalendarEventAction,
  CalendarEventTimesChangedEvent,
  CalendarView,
} from 'angular-calendar';
import { HttpClient } from '@angular/common/http';
import { HttpHeaders } from '@angular/common/http';
import { DatePipe } from '@angular/common';
import { API_URL } from 'src/app/services/url/url';



const colors: any = {
  red: {
    primary: '#ad2121',
    secondary: '#FAE3E3',
  },
  blue: {
    primary: '#1e90ff',
    secondary: '#D1E8FF',
  },
  yellow: {
    primary: '#e3bc08',
    secondary: '#FDF1BA',
  },
};


var headers= new HttpHeaders()
.set('content-type', 'application/json')
  .set('Access-Control-Allow-Headers', 'Content-Type')
  .set('Access-Control-Allow-Methods', 'GET, PUT, POST, OPTIONS')
  .set('Access-Control-Allow-Origin', '*');

@Component({
  //selector: 'app-calendar',
  selector: 'mwl-demo-component',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss'],
  providers: [DatePipe]
  //changeDetection: ChangeDetectionStrategy.OnPush,

})
export class CalendarComponent implements OnInit, AfterContentInit  {
  @ViewChild('modalContent', { static: true }) modalContent: TemplateRef<any>;

  @Input() eventUid;

  view: CalendarView = CalendarView.Month;

  CalendarView = CalendarView;
  eventSessionsList = {};
  viewDate: Date = new Date();

  sessionFormName: String;
  sessionFormSpeaker: String;
  sessionFormSynopsis: String;
  sessionFormCost: Number;
  sessionFormDiscount: Number;
  sessionFormStartDate: Date;
  sessionFormEndDate: Date;
  sessionFormSessionId: any;

  ngAfterViewInit(): void {
    console.log("ngAfterViewInit");
  }

  ngAfterContentInit(): void {

  }

  updateEventUid(eventUidNw): void {

    this.eventUid = eventUidNw;

    console.log('Updating EventUid...');
    console.log(this.eventUid);
    console.log('refresh');
    this.refreshCalendarWithSessions();
  }

  modalData: {
    action: string;
    event: CalendarEvent;
  };

  actions: CalendarEventAction[] = [
    {
      label: '<i class="fas fa-fw fa-pencil-alt"></i>',
      a11yLabel: 'Edit',
      onClick: ({ event }: { event: CalendarEvent }): void => {
        this.handleEvent('Edited', event);
      },
    },
    {
      label: '<i class="fas fa-fw fa-trash-alt"></i>',
      a11yLabel: 'Delete',
      onClick: ({ event }: { event: CalendarEvent }): void => {
        this.events = this.events.filter((iEvent) => iEvent !== event);
        this.handleEvent('Deleted', event);
      },
    },
  ];

  refresh: Subject<any> = new Subject();

  events: CalendarEvent[] = [ ];

  activeDayIsOpen: boolean = true;
  constructor(private modal: NgbModal, private httpClient: HttpClient, private datePipe: DatePipe) {

  if (localStorage.getItem("Authorization")) {
      headers = new HttpHeaders()
      .set('content-type', 'application/json')
      .set('Access-Control-Allow-Headers', 'Content-Type')
      .set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
      .set('Access-Control-Allow-Origin', '*')
      .set('Authorization', localStorage.getItem("Authorization"));
  }

  }

  dayClicked({ date, events }: { date: Date; events: CalendarEvent[] }): void {
    if (isSameMonth(date, this.viewDate)) {
      if (
        (isSameDay(this.viewDate, date) && this.activeDayIsOpen === true) ||
        events.length === 0
      ) {
        this.activeDayIsOpen = false;
      } else {
        this.activeDayIsOpen = true;
      }
      this.viewDate = date;
    }
  }

  eventTimesChanged({
    event,
    newStart,
    newEnd,
  }: CalendarEventTimesChangedEvent): void {
    this.events = this.events.map( (iEvent) => {
      if (iEvent === event) {
        return {
          ...event,
          start: newStart,
          end: newEnd,
        };
      }
      return iEvent;
    });
    this.handleEvent('Dropped or resized', event);
  }

  refreshCalendarWithSessions(): void {

    console.log("eventUid");
    console.log(this.eventUid);

    var EVENT_SESSIONS_API = API_URL + "/csi/event/services/event/getAllEventSessions?evtUid=" + this.eventUid;

    console.log("refreshCalendarWithSessions 1");

    this.httpClient.get(EVENT_SESSIONS_API, { headers }).subscribe(data => {

      console.log("refreshCalendarWithSessions 2");

      console.log(data);
      if (data['response']['Error'] != undefined) {
        console.log(data['response']['Error']);

      }
      else {
        this.events = [];
        var sessionsCnt = Number(data['response']['sessionCnt']);
        if (sessionsCnt > 0) {
          var sessions = data['response']['sessions'][0];
          this.eventSessionsList = {};

          for (const key in sessions) {

            var sessionStartDate =  new Date(Date.parse(sessions[key]['addDate']));
            var sessionEndDate =  new Date(Date.parse(sessions[key]['addDate']));

            if (sessions[key]['sessionStartDate'] !== undefined && sessions[key]['sessionStartDate'] !== 'undefined') {
              sessionStartDate = new Date(Date.parse(sessions[key]['sessionStartDate']));
            }

            if (sessions[key]['sessionEnddate'] !== undefined && sessions[key]['sessionEnddate'] !== 'undefined') {
              sessionEndDate = new Date(Date.parse(sessions[key]['sessionEnddate']));
            }

            if (isNaN(sessionStartDate.getTime())
                || isNaN(sessionEndDate.getTime()) ) {
              console.log("Could not parse session date");
              console.log(sessions[key]['addDate']);
              console.log(sessionStartDate);
              continue;
            }

            var tzOffsetGmtMins = sessionStartDate.getTimezoneOffset();

            sessionStartDate = new Date(sessionStartDate.getTime() + tzOffsetGmtMins*60000);
            sessionEndDate = new Date(sessionEndDate.getTime() + tzOffsetGmtMins*60000);

            var sessionKey: any = sessions[key]['id'];

            var sessionData = {
              start: sessionStartDate,
              end: sessionEndDate,
              title: sessions[key]['sessionName'],
              color: colors.red,
              actions: this.actions,
              allDay: true,
              resizable: {
                beforeStart: true,
                afterEnd: true,
              },
              draggable: true,
              meta: sessionKey
            };
            this.events = [
              ...this.events,
              sessionData
            ];

            var sessionDict = {
              sessionStartDate: sessionStartDate,
              sessionEndDate: sessionEndDate,
              evtUid: sessions[key]['evtUid'],
              id: sessionKey,
              opdId: sessions[key]['opdId'],
              sessionCode: sessions[key]['sessionCode'],
              sessionName: sessions[key]['sessionName'],
              sessionType: sessions[key]['sessionType']
            }

            this.eventSessionsList[sessionKey] = sessionDict;
          }
        }
   /* {
      start: startOfDay(new Date()),
      title: 'An event with no end date',
      color: colors.yellow,
      actions: this.actions,
    },*/
  }
    });

    console.log("this.events");

    console.log(this.events);
  }

  enrollInSession(): void {

    console.log("eventUid");
    console.log(this.eventUid);

    /* does this event have at least one session? */

    var sessionShortInfo = this.eventSessionsList[this.sessionFormSessionId];
    var sessionCode = sessionShortInfo.sessionCode;

    // just in case
    var sessionKey = this.eventUid + '-' + sessionCode;
    if (sessionCode != null) {
      window.open('http://3.19.40.177:5000/chat/' + sessionKey, 'Live Session', 'width=800,height=600,left=200,top=200');
    }
    console.log("enrollInSession");
  }

  handleEvent(action: string, event: CalendarEvent): void {

    console.log("Clicked Calendar");

    var sessionId = event.meta;
    var sessionShortInfo = this.eventSessionsList[sessionId];

    var SESSION_INFO_API = API_URL + "/csi/event/services/event/session/info?evtUid=" + this.eventUid + "&sessionCode=" + sessionShortInfo.sessionCode;

    this.httpClient.get(SESSION_INFO_API, { headers }).subscribe(data => {

      console.log(data);
      if (data['response']['Error'] != undefined) {
        console.log(data['response']['Error']);
        alert("The session selected has no information associated with it.");
      }
      else {

        const formattedStartDate = sessionShortInfo.sessionEndDate.toLocaleString("en-US", {
          day: "numeric",
          month: "short",
          year: "numeric",
          hour: "numeric",
          minute: "2-digit"
        });

        const formattedEndDate = sessionShortInfo.sessionEndDate.toLocaleString("en-US", {
          day: "numeric",
          month: "short",
          year: "numeric",
          hour: "numeric",
          minute: "2-digit"
        });

        this.sessionFormName = data['response']['sessionAdditionalInfo']['sessionName'];
        this.sessionFormSpeaker = "";
        this.sessionFormSynopsis = "";
        this.sessionFormCost = data['response']['sessionManager']['sessionRate'];
        this.sessionFormDiscount = 0;
        this.sessionFormStartDate = formattedStartDate;
        this.sessionFormEndDate = formattedEndDate;
        this.sessionFormSessionId = sessionId;
        this.modalData = { event, action };
        this.modal.open(this.modalContent, { size: 'lg' });
      }
    });

  }

  addEvent(): void {
    this.events = [
      ...this.events,
      {
        title: 'New event',
        meta: 123454,
        start: startOfDay(new Date()),
        end: endOfDay(new Date()),
        color: colors.red,
        draggable: true,
        resizable: {
          beforeStart: true,
          afterEnd: true,
        },
      },
    ];
  }

  deleteEvent(eventToDelete: CalendarEvent) {
    this.events = this.events.filter((event) => event !== eventToDelete);
  }

  setView(view: CalendarView) {
    this.view = view;
  }

  closeOpenMonthViewDay() {
    this.activeDayIsOpen = false;
  }

  ngOnInit(): void {
  }

}
