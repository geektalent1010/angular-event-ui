import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-event-builder',
  //templateUrl: './event-builder.component.html',
  template: "<iframe src='https://builder.io/content/d8a95230b7a3482eb5caae1de5c01d93?apiKey=bpk-a24f8e79c5ef4ae3aa9a0167b9430517'  height='2500' width='2000'></iframe>",
  styleUrls: ['./event-builder.component.scss']
})
export class EventBuilderComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
    $('#main-wrapper').toggle();

  }

}
