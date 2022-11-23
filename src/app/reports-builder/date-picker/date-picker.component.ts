// import { MatDatepickerModule } from '@angular/material/datepicker';
import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnChanges,
  ViewChildren,
  ViewChild,
  QueryList,
  SimpleChanges
} from '@angular/core';
// import { FormGroup, FormControl } from '@angular/forms';
import {
  NgbDateStruct,
  NgbCalendar,
  NgbDatepicker
} from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-datepicker',
  templateUrl: './date-picker.component.html',
  styleUrls: ['./date-picker.component.scss']
})
export class DatePickerComponent implements OnInit {
  // campaignOne: FormGroup;
  model: NgbDateStruct;
  @Input() dateTime = {
    date: { month: 0, day: 0, year: 0 },
    time: { hour: 0, minute: 0 }
  };
  date: { year: number; month: number; day: number };
  time: { hour: number; minute: number };
  // @Output() dateTimeEvent = new EventEmitter<any>();
  @ViewChild(NgbDatepicker) datepicker: NgbDatepicker;

  constructor(private calendar: NgbCalendar) {
    // const today = new Date();
    // const month = today.getMonth();
    // const year = today.getFullYear();
    // this.campaignOne = new FormGroup({
    //   start: new FormControl(new Date(year, month, 13)),
    //   end: new FormControl(new Date(year, month, 16))
    // });
  }
  ngOnChanges(changes: SimpleChanges) {
    if (this.datepicker) {
      this.datepicker.navigateTo(changes.dateTime.currentValue.date);
    }
  }
  ngOnInit() {
    // this.date = this.dateTime.date;
    this.time = this.dateTime.time;
    // this.select(this.datepicker.first);
  }
  // ngAfterViewInit() {
  //   setTimeout(() => {
  //     this.datepicker.navigateTo({ year: 2022, month: 12, day: 12 });
  //     // this.datepicker.navigateTo(this.dateTime.date);
  //     // this.select(this.datepicker);
  //   }, 100);
  // }
  // select(dp) {
  // this.model = {
  //   year: 2018,
  //   month: 8,
  //   day: 15
  // };
  //   dp.navigateTo(this.date);
  // }
  // sendDateTime() {
  //   this.dateTimeEvent.emit({ date: this.date, time: this.time });
  // }
}
