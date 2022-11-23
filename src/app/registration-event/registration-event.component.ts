import { Component, OnInit } from '@angular/core';
import { BuilderModule } from '@builder.io/angular';

@Component({
  selector: 'app-registration-event',
 // templateUrl: './registration-event.component.html',
  //styleUrls: ['./registration-event.component.scss'],
  //template: '<builder-component model="page" >Loading...</builder-component>'
  template: "<iframe src='https://builder.io/content/c1b778fcec70417ebee62c48949dc8ba?apiKey=bpk-a24f8e79c5ef4ae3aa9a0167b9430517'  height='2500' width='2000'></iframe><iframe src='https://builder.io/content/c1b778fcec70417ebee62c48949dc8ba?apiKey=bpk-a24f8e79c5ef4ae3aa9a0167b9430517'  height='2500' width='2000'></iframe>"

})
export class RegistrationEventComponent implements OnInit {

  constructor() {
    imports: [
      BuilderModule.forRoot('95987ae43674442f9f69697d1ca04156')
    ]

   }

  ngOnInit(): void {
  }

}
