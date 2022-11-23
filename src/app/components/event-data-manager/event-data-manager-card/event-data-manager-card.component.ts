import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ImageConstants } from 'src/app/event-pages/imageConstants';

@Component({
  selector: 'app-event-data-manager-card',
  templateUrl: './event-data-manager-card.component.html',
  styleUrls: ['./event-data-manager-card.component.scss']
})
export class EventDataManagerCardComponent implements OnInit {
  photoID = ImageConstants.photoID;
  @Input() valid;
  @Input() position;
  @Output() updateEntry: EventEmitter<any> = new EventEmitter();
  @Output() saveEntry: EventEmitter<any> = new EventEmitter();
  @Output() resetEntry: EventEmitter<any> = new EventEmitter();

  displayTabs = {
    registration: true,
    demographics: false,
    sessions: false,
    linkedRecords: false,
  };

  firstName = localStorage.getItem('firstName');
  lastName = localStorage.getItem('nameLast');

  constructor() { }

  ngOnInit(): void {
    
  }

  applyPreviewHeight() {
    const styles = { 'height': `25vh` };
    return styles;
  }

  enableTabs(tabName):void{
    this.displayTabs = {
      registration: false,
      demographics: false,
      sessions: false,
      linkedRecords: false,
    };
    this.displayTabs[tabName] = true;
  
  }

  changedValue(data){
    this.updateEntry.emit({position: this.position, data: data});
  }

  save(data){
    console.log('save');
    this.saveEntry.emit({});
  }
  
  reset(data){
    console.log('reset');
    this.resetEntry.emit({});
  }

}
