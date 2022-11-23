import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-event-data-manager-session-events',
  templateUrl: './event-data-manager-session-events.component.html',
  styleUrls: ['./event-data-manager-session-events.component.scss']
})
export class EventDataManagerSessionEventsComponent implements OnInit {
  @Input() valid;
  sortTracker = [];

  constructor() { }

  ngOnInit(): void {
  }

  sortColumn($event, property) {
    if (this.sortTracker.includes(property)) {
      this.sortTracker.splice(this.sortTracker.findIndex((element) => element = property), 1);
      this.valid.sessions.sort((b, a) => a[property] - b[property]);
      this.valid.sessions.sort(function (b, a) {
        var titleA = a[property].toLowerCase(), titleB = b[property].toLowerCase();
        if (titleA < titleB) return -1;
        if (titleA > titleB) return 1;
        return 0;
      });
      this.valid.sessions.sort((b, a) => new Date(a[property]).getTime() - new Date(b[property]).getTime());
    } else {
      this.sortTracker.push(property);
      this.valid.sessions.sort((a, b) => a[property] - b[property]);
      this.valid.sessions.sort(function (a, b) {
        var titleA = a[property].toLowerCase(), titleB = b[property].toLowerCase();
        if (titleA < titleB) return -1;
        if (titleA > titleB) return 1;
        return 0;
      });
      this.valid.sessions.sort((a, b) => new Date(a[property]).getTime() - new Date(b[property]).getTime());
    }
  }

}
