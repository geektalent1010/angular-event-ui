import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-event-data-manager-linked-records',
  templateUrl: './event-data-manager-linked-records.component.html',
  styleUrls: ['./event-data-manager-linked-records.component.scss']
})
export class EventDataManagerLinkedRecordsComponent implements OnInit {
  @Input() valid;
  sortTracker = [];

  constructor() { }

  ngOnInit(): void {
  }

  sortColumn($event, property) {
    if (this.sortTracker.includes(property)) {
      this.sortTracker.splice(this.sortTracker.findIndex((element) => element = property), 1);
      this.valid.linkedRecords.sort((b, a) => a[property] - b[property]);
      this.valid.linkedRecords.sort(function (b, a) {
        var titleA = a[property].toLowerCase(), titleB = b[property].toLowerCase();
        if (titleA < titleB) return -1;
        if (titleA > titleB) return 1;
        return 0;
      });
      this.valid.linkedRecords.sort((b, a) => new Date(a[property]).getTime() - new Date(b[property]).getTime());
    } else {
      this.sortTracker.push(property);
      this.valid.linkedRecords.sort((a, b) => a[property] - b[property]);
      this.valid.linkedRecords.sort(function (a, b) {
        var titleA = a[property].toLowerCase(), titleB = b[property].toLowerCase();
        if (titleA < titleB) return -1;
        if (titleA > titleB) return 1;
        return 0;
      });
      this.valid.linkedRecords.sort((a, b) => new Date(a[property]).getTime() - new Date(b[property]).getTime());
    }
  }

}
