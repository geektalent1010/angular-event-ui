import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-event-data-manager-demographics',
  templateUrl: './event-data-manager-demographics.component.html',
  styleUrls: ['./event-data-manager-demographics.component.scss']
})
export class EventDataManagerDemographicsComponent implements OnInit {
  @Input() valid;
  @Output() valueUpdated: EventEmitter<any> = new EventEmitter();
  
  constructor() { }

  ngOnInit(): void {
  }

  changedValue(edit, i){
    console.log(edit, this.valid['questions'][i]['answer']);
    this.valid['questions'][i]['answer'] = edit;
    this.valueUpdated.emit(this.valid);
  }

}
