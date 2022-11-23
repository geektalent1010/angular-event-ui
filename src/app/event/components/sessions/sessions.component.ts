import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  TemplateRef,
  ViewChild,
  SimpleChange,
  ViewChildren,
  QueryList,
  Directive,
} from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DeleteConfirmComponent } from '../../modals/delete-confirm/delete-confirm.component';
import * as moment from 'moment';
import { CreateSessionComponent } from '../../modals/create-session/create-session.component';
import {
  CalendarEvent,
  CalendarEventAction,
  CalendarEventTimesChangedEvent,
  CalendarView,
} from 'angular-calendar';
import { endOfDay, isSameDay, isSameMonth, startOfDay } from 'date-fns';
import { Subject } from 'rxjs';
import { RegtypeData } from 'src/app/shared/interfaces/Regtype';
import Swal from 'sweetalert2';
import { FormControl } from '@angular/forms';
import { SessionRateData } from '../../interfaces/Session';
import { OptionTypes } from './optionTypes';
import { ToastService } from '../../../services/toast/toast.service';

function generateRandomColorHex() {
  return (
    '#' +
    ('00000' + Math.floor(Math.random() * Math.pow(16, 6)).toString(16)).slice(
      -6
    )
  );
}

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

export type SortDirection = 'asc' | 'desc' | '';
const rotate: { [key: string]: SortDirection } = {
  asc: 'desc',
  desc: '',
  '': 'asc',
};
export const compare = (v1, v2) => (v1 < v2 ? -1 : v1 > v2 ? 1 : 0);
export interface SortEvent {
  column: string;
  direction: SortDirection;
}

@Directive({
  selector: 'th[sortable]',
  host: {
    '[class.asc]': 'direction === "asc"',
    '[class.desc]': 'direction === "desc"',
    '(click)': 'rotate()',
  },
})
export class NgbdSortableHeader {
  @Input() sortable: string;
  @Input() direction: SortDirection = '';
  @Output() sort = new EventEmitter<SortEvent>();

  rotate() {
    this.direction = rotate[this.direction];
    this.sort.emit({ column: this.sortable, direction: this.direction });
  }
}

@Component({
  selector: 'app-sessions',
  templateUrl: './sessions.component.html',
  styleUrls: ['./sessions.component.scss'],
})
export class SessionsComponent implements OnInit, OnChanges {
  @Input('data') sessionList: any[];
  @Input('discountList') discountList: any[];
  @Input('regtypesList') regtypesList: any[];
  @Input('pageType') pageType: string;
  @Input('noSessions') noSessions: boolean;
  layoutView: boolean = true;
  editIndex: number = null;
  sessionTypesOptions = ['On-Site', 'Virtual'];
  sessionTopicsOptions = [
    'AGRICULTURE & FARMING',
    'AMUSEMENT, ENTERTAINMENT & GAMING',
    'SPORTING GOODS & RECREATION',
    'CONSUMER GOODS & RETAIL TRADE',
    'TOYS, HOBBIES & GIFTS',
    'EDUCATION, TRAINING, SCIENCE & RESEARCH',
    'ELECTRICAL & ELECTRONICS',
    'AUTOMOTIVE, TRUCKING & TRANSPORTATION',
    'TRAVEL, HOTELS & RESTAURANTS',
    'INDUSTRIAL',
    'MEDICAL & HEALTHCARE PRODUCTS',
    'BUILDING & CONSTRUCTION',
    'EXHIBITION & MEETING INDUSTRY',
    'FOOD & BEVERAGE',
    'MANUFACTURING & PACKAGING',
    'APPAREL, BEAUTY, SHOES & TEXTILES',
    'COMMUNICATIONS & BROADCASTING',
    'COMPUTERS & SOFTWARE APPLICATIONS',
    'AEROSPACE & AVIATION',
    'WASTE MANAGEMENT',
    'WATER, ENERGY & POWER',
    'POLICE, FIRE, SECURITY & EMERGENCY SERVICES',
    'MANAGEMENT, HUMAN RESOURCES & NETWORKING',
    'BUSINESS',
    'GOVERNMENT & MILITARY',
    'PRINTING, GRAPHICS, PHOTOGRAPHY & PUBLISHING',
    'MINING',
    'DENTAL',
    'CIVIC AND SOCIAL ORGANIZATIONS',
  ];
  speakerList: any[] = [];
  @Output() onNoSessionChange = new EventEmitter();
  @ViewChild('modalContent', { static: false }) modalContent: TemplateRef<any>;

  view: CalendarView = CalendarView.Month;

  CalendarView = CalendarView;

  viewDate: Date = new Date();

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

  refresh = new Subject<void>();
  events: CalendarEvent[] = [];
  activeDayIsOpen: boolean = true;
  filteredSessionList: any[] = [];
  regtypeControl: FormControl = new FormControl('all');

  selectedItems: any[] = [];

  showMemberRate: boolean = false;
  showNonMemberRate: boolean = false;
  addedRateIndex: number = 0;

  @ViewChildren(NgbdSortableHeader) headers: QueryList<NgbdSortableHeader>;

  constructor(
    private modalService: NgbModal,
    private toastService: ToastService
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.sessionList && !this.noSessions) {
      if (this.noSessions) {
        this.sessionList = [];
      }
      this.addedRateIndex = Number(this.sessionList?.[0]?.period?.length) || 0;
      this.filterSessions();
      this.getValidateAllSessions();
    }
  }

  ngOnInit(): void {
    this.sessionList.forEach((session: any, i: number) => {
      this.sessionList[i]['id'] = i;
      if (
        session.startDate ||
        session.startTime ||
        session.endDate ||
        session.endTime
      ) {
        this.events.push({
          id: i,
          title: session.name,
          start: startOfDay(
            this.formatDate(session.startDate, session.startTime)
          ),
          end: endOfDay(this.formatDate(session.endDate, session.endTime)),
          color: {
            primary: generateRandomColorHex(),
            secondary: '#D1E8FF',
          },
          draggable: true,
          resizable: {
            beforeStart: true,
            afterEnd: true,
          },
        });
      }
    });

    this.filterSessions();
    this.regtypeControl.valueChanges.subscribe((value: string) => {
      this.filterSessions();
    });

    console.error('sessionList: ', this.sessionList);

    /** Determine the reg package rate index */
    this.addedRateIndex = Number(this.sessionList?.[0]?.period?.length) || 0;

    if (this.sessionList?.[0]?.memberStartDate) this.showMemberRate = true;
    if (this.sessionList?.[0]?.nonMemberStartDate)
      this.showNonMemberRate = true;
  }

  onSort({ column, direction }: SortEvent) {
    // resetting other headers
    this.headers.forEach((header) => {
      if (header.sortable !== column) {
        header.direction = '';
      }
    });

    // sorting sessions list
    if (direction === '') {
      this.filteredSessionList = this.filteredSessionList;
    } else {
      this.filteredSessionList = [...this.filteredSessionList].sort((a, b) => {
        const res = compare(a[column], b[column]);
        return direction === 'asc' ? res : -res;
      });
      this.sessionList = [...this.sessionList].sort((a, b) => {
        const res = compare(a[column], b[column]);
        return direction === 'asc' ? res : -res;
      });
    }
  }

  private formatDate(date: string, time: string) {
    const d = new Date(date);
    d.setUTCHours(Number(time.split(':')?.[0]));
    d.setUTCMinutes(Number(time.split(':')?.[1]));
    return d;
  }

  editSession(i: number, flag = null) {
    if (flag === 'calendar') {
      i = this.sessionList.findIndex((session: any) => session.id === i);
    }
    const editSessionModalRef = this.modalService.open(CreateSessionComponent, {
      size: 'large',
      windowClass: 'modal-custom-createSession',
    });

    let rateList: SessionRateData[] = [];
    const originalSession: any = this.sessionList[i];
    if (this.showMemberRate) {
      rateList?.push({
        category: 'member',
        startDate: originalSession?.memberStartDate,
        startTime: originalSession?.memberStartTime,
        endDate: originalSession?.memberEndDate,
        endTime: originalSession?.memberEndTime,
        cost: originalSession?.memberCost,
      });
    }
    if (this.showNonMemberRate) {
      rateList?.push({
        category: 'non-member',
        startDate: originalSession?.nonMemberStartDate,
        startTime: originalSession?.nonMemberStartTime,
        endDate: originalSession?.nonMemberEndDate,
        endTime: originalSession?.nonMemberEndTime,
        cost: originalSession?.nonMemberCost,
      });
    }
    for (let i = 0; i < this.addedRateIndex; i++) {
      rateList?.push({
        category: i + 1,
        ...(originalSession?.['period']?.[i] ?? {
          startDate: null,
          startTime: null,
          endDate: null,
          endTime: null,
          cost: null,
        }),
      });
    }

    editSessionModalRef.componentInstance.type = 'edit';
    editSessionModalRef.componentInstance.rateList = rateList;
    editSessionModalRef.componentInstance.data = this.sessionList[i];
    editSessionModalRef.componentInstance.discountList =
      this.discountList.filter((el) => el.discountStatus === 'active');
    editSessionModalRef.componentInstance.regtypesList = this.regtypesList.map(
      (regtype: RegtypeData) => regtype.description
    );
    editSessionModalRef.componentInstance.optiontypesList = OptionTypes.map(
      (optType) => optType.code
    );
    editSessionModalRef.result
      .then((session: any) => {
        console.log('Edited session: ', session);
        if (!session) {
          return;
        }

        let newSession: any = {
          id: this.sessionList[i]?.id,
          ...session,
        };
        let period: any[] = [];
        newSession.rateList?.forEach((rate: SessionRateData) => {
          if (rate.category === 'member') {
            newSession['memberStartDate'] = rate.startDate;
            newSession['memberStartTime'] = rate.startTime;
            newSession['memberEndDate'] = rate.endDate;
            newSession['memberEndTime'] = rate.endTime;
            newSession['memberCost'] = rate.cost ?? 0;
          } else if (rate.category === 'non-member') {
            newSession['nonMemberStartDate'] = rate.startDate;
            newSession['nonMemberStartTime'] = rate.startTime;
            newSession['nonMemberEndDate'] = rate.endDate;
            newSession['nonMemberEndTime'] = rate.endTime;
            newSession['nonMemberCost'] = rate.cost ?? 0;
          } else {
            period.push({
              startDate: rate.startDate,
              startTime: rate.startTime,
              endDate: rate.endDate,
              endTime: rate.endTime,
              cost: rate.cost ?? 0,
            });
          }
        });
        delete newSession['rateList'];
        newSession['period'] = period;
        this.sessionList[i] = newSession;

        const lastIndex: number = newSession.period?.length - 1 ?? 0;
        const startDate = newSession.period?.[0]?.startDate;
        const startTime = newSession.period?.[0]?.startTime;
        const endDate = newSession.period?.[lastIndex]?.endDate;
        const endTime = newSession.period?.[lastIndex]?.endTime;
        if (startDate || startTime || endDate || endTime) {
          const editIndex: number = this.events.findIndex(
            (event: CalendarEvent) => event.id === i
          );
          this.events = [
            ...this.events.slice(0, editIndex),
            {
              ...this.events[editIndex],
              title: newSession.name,
              start: startOfDay(this.formatDate(startDate, startTime)),
              end: endOfDay(this.formatDate(endDate, endTime)),
            },
            ...this.events.slice(editIndex + 1, this.events.length),
          ];
        }
        this.filterSessions();
      })
      .catch((err: Error) => {
        console.error('close error: ', err);
      });
  }

  removeSession(id: number) {
    const i: number = this.sessionList.findIndex(
      (session: any) => session.id === id
    );
    const deleteSessionConfirmModalRef = this.modalService.open(
      DeleteConfirmComponent,
      {
        size: 'sm',
        windowClass: 'modal-custom-deleteConfirm',
      }
    );
    deleteSessionConfirmModalRef.componentInstance.confirmMsg =
      'Delete this session?';
    deleteSessionConfirmModalRef.result
      .then((agree: boolean) => {
        console.log('Do you want to delete?: ', agree);
        if (agree === true) {
          if (this.editIndex === i) this.editIndex = null;
          this.sessionList?.splice(i, 1);

          const idx = this.selectedItems.findIndex((el) => el.id === id);
          this.selectedItems.splice(idx, 1);
        }
        this.filterSessions();
      })
      .catch((err: Error) => {
        console.error('close error: ', err);
      });
  }

  createSession() {
    const createSessionModalRef = this.modalService.open(
      CreateSessionComponent,
      {
        size: 'large',
        windowClass: 'modal-custom-createSession',
      }
    );
    createSessionModalRef.componentInstance.type = 'create';
    createSessionModalRef.componentInstance.discountList =
      this.discountList.filter((el) => el.discountStatus === 'active');
    createSessionModalRef.componentInstance.showMemberRate =
      this.showMemberRate;
    createSessionModalRef.componentInstance.showNonMemberRate =
      this.showNonMemberRate;
    createSessionModalRef.componentInstance.addedRateIndex =
      this.addedRateIndex;
    createSessionModalRef.componentInstance.regtypesList =
      this.regtypesList.map((regtype: RegtypeData) => regtype.description);
    createSessionModalRef.componentInstance.optiontypesList = OptionTypes.map(
      (optType) => optType.code
    );
    createSessionModalRef.result
      .then((session: any) => {
        console.log('New Created session: ', session);
        if (!session) {
          return;
        }

        let newSession: any = {
          id:
            this.sessionList?.length > 0
              ? Math.max(
                  ...this.sessionList.map((session: any) => session.id)
                ) + 1
              : 0,
          ...session,
        };
        let period: any[] = [];
        newSession.rateList?.forEach((rate: SessionRateData) => {
          if (rate.category === 'member') {
            newSession['memberStartDate'] = rate.startDate;
            newSession['memberStartTime'] = rate.startTime;
            newSession['memberEndDate'] = rate.endDate;
            newSession['memberEndTime'] = rate.endTime;
            newSession['memberCost'] = rate.cost ?? 0;
          } else if (rate.category === 'non-member') {
            newSession['nonMemberStartDate'] = rate.startDate;
            newSession['nonMemberStartTime'] = rate.startTime;
            newSession['nonMemberEndDate'] = rate.endDate;
            newSession['nonMemberEndTime'] = rate.endTime;
            newSession['nonMemberCost'] = rate.cost ?? 0;
          } else {
            period.push({
              startDate: rate.startDate,
              startTime: rate.startTime,
              endDate: rate.endDate,
              endTime: rate.endTime,
              cost: rate.cost ?? 0,
            });
          }
        });
        delete newSession['rateList'];
        newSession['period'] = period;
        this.sessionList.push(newSession);

        const lastIndex: number = newSession.period?.length - 1 ?? 0;
        const startDate = newSession.period?.[0]?.startDate;
        const startTime = newSession.period?.[0]?.startTime;
        const endDate = newSession.period?.[lastIndex]?.endDate;
        const endTime = newSession.period?.[lastIndex]?.endTime;
        if (startDate || startTime || endDate || endTime) {
          this.events = [
            ...this.events,
            {
              id: newSession.id,
              title: newSession.name,
              start: startOfDay(this.formatDate(startDate, startTime)),
              end: endOfDay(this.formatDate(endDate, endTime)),
              color: {
                primary: generateRandomColorHex(),
                secondary: '#D1E8FF',
              },
              draggable: true,
              resizable: {
                beforeStart: true,
                afterEnd: true,
              },
            },
          ];
        }
        this.filterSessions();
      })
      .catch((err: Error) => {
        console.error('close error: ', err);
      });
  }

  handleSession(session: any, i: number = null) {
    session;
    if (i === null) {
    }
  }

  datePickerCreated(event: any, type: string, i: number) {
    this.sessionList[i][type] = moment(event).format('YYYY-MM-DD');
  }

  getDateFormat(date: string) {
    return new Date(date);
  }

  checkNoSessions() {
    this.onNoSessionChange.emit(this.noSessions);
    if (this.noSessions) {
      this.sessionList = [];
      this.filteredSessionList = [];
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
    this.events = this.events.map((iEvent) => {
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

  handleEvent(action: string, event: CalendarEvent): void {
    this.modalData = { event, action };
    this.editSession(Number(event.id), 'calendar');
  }

  addEvent(): void {
    this.events = [
      ...this.events,
      {
        title: 'New event',
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

  getValidateAllSessions() {
    let count = {};
    this.sessionList.forEach((item) => {
      if (count[item['name']]) {
        count[item['name']] += 1;
      } else {
        count[item['name']] = 1;
      }
    });
    let duplicated = [];
    for (let key in count) {
      if (count[key] > 1) {
        duplicated.push(key);
      }
    }
    if (duplicated.length > 0) {
      this.toastService.show(
        'Session ' +
          (duplicated.length === 1 ? 'name is ' : 'names are ') +
          ' duplicated. ' +
          duplicated.join(', '),
        {
          delay: 8000,
          classname: 'bg-warning text-light',
          headertext: 'Warning',
          autohide: true,
        }
      );
    }
    return duplicated.length === 0;
  }

  filterSessions() {
    if (this.regtypeControl.value === 'all') {
      this.filteredSessionList = this.sessionList;
    } else {
      this.filteredSessionList = this.sessionList?.filter((session: any) => {
        if (Array.isArray(session.regtypes)) {
          return session.regtypes?.some(
            (regDesc: string) =>
              regDesc.toLowerCase() === this.regtypeControl.value?.toLowerCase()
          );
        }
        return (
          session.regtypes?.toLowerCase() ===
          this.regtypeControl.value?.toLowerCase()
        );
      });
    }

    this.selectedItems = this.filteredSessionList.map((session: any) => ({
      id: session.id,
      selected: false,
    }));
  }

  checkedItem(checked: boolean, idx: number) {
    this.selectedItems[idx].selected = checked;
  }

  checkedBre(checked: boolean, idx: number) {
    this.sessionList[idx].useBre = checked;
    this.filterSessions();
  }

  deleteSelectedItems() {
    const deleteRegtypeConfirmModalRef = this.modalService.open(
      DeleteConfirmComponent,
      {
        size: 'sm',
        windowClass: 'modal-custom-deleteConfirm',
      }
    );
    deleteRegtypeConfirmModalRef.componentInstance.confirmMsg =
      'Delete these sessions?';
    deleteRegtypeConfirmModalRef.result
      .then((agree: boolean) => {
        console.log('Do you want to delete?: ', agree);
        if (agree === true) {
          let i = this.selectedItems.length - 1;
          while (i >= 0) {
            if (this.selectedItems[i].selected) {
              const sessionIdx = this.sessionList.findIndex(
                (session: any) => session.id === this.selectedItems[i].id
              );
              this.sessionList?.splice(sessionIdx, 1);
              const idx = this.selectedItems.findIndex(
                (el) => el.id === this.selectedItems[i].id
              );
              this.selectedItems.splice(idx, 1);
            }
            i--;
          }
          this.filterSessions();
        }
      })
      .catch((err: Error) => {
        console.error('close error: ', err);
      });
  }

  selectAllItems() {
    let val = this.disableDeleteBtn();
    this.selectedItems = this.selectedItems.map((el) => {
      el.selected = val;
      return el;
    });
    console.log('----->', this.selectedItems);
  }

  disableDeleteBtn() {
    return this.selectedItems.every((el) => !el.selected);
  }

  addRate() {
    if (this.addedRateIndex < 8) {
      this.addedRateIndex++;
      this.sessionList.forEach((session: any, index: number) => {
        if ((session.period?.length ?? 0) < this.addedRateIndex) {
          while ((session.period?.length ?? 0) < this.addedRateIndex) {
            if (!this.sessionList[index]?.period?.length) {
              this.sessionList[index]['period'] = [];
            }
            this.sessionList[index]?.period?.push({
              startDate: moment().format('yyyy-MM-DD'),
              startTime: '00:00',
              endDate: moment().format('yyyy-MM-DD'),
              endTime: '23:59',
              cost: 0,
            });
          }
        }
      });
    }
  }

  deleteRate() {
    if (this.addedRateIndex > 0) {
      for (let i = 0; i < this.sessionList.length; i++) {
        if (this.addedRateIndex === 1) {
          this.sessionList[i].startDate = null;
          this.sessionList[i].startTime = null;
          this.sessionList[i].endDate = null;
          this.sessionList[i].endTime = null;
          this.sessionList[i].cost = 0;
        } else if (this.addedRateIndex === 2) {
          this.sessionList[i].startDate2 = null;
          this.sessionList[i].startTime2 = null;
          this.sessionList[i].endDate2 = null;
          this.sessionList[i].endTime2 = null;
          this.sessionList[i].cost2 = 0;
        } else if (this.addedRateIndex === 3) {
          this.sessionList[i].startDate3 = null;
          this.sessionList[i].startTime3 = null;
          this.sessionList[i].endDate3 = null;
          this.sessionList[i].endTime3 = null;
          this.sessionList[i].cost3 = 0;
        } else if (this.addedRateIndex === 4) {
          this.sessionList[i].startDate4 = null;
          this.sessionList[i].startTime4 = null;
          this.sessionList[i].endDate4 = null;
          this.sessionList[i].endTime4 = null;
          this.sessionList[i].cost4 = 0;
        }
      }
      this.addedRateIndex--;
    }
  }

  changeRateVisibility(type: string) {
    if (type === 'member') {
      this.showMemberRate = !this.showMemberRate;
    } else if (type === 'non-member') {
      this.showNonMemberRate = !this.showNonMemberRate;
    }
  }
}
