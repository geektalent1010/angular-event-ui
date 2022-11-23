import { AfterContentInit, Component, ElementRef, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { TabsetComponent } from 'ngx-bootstrap/tabs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { API_URL } from '../services/url/url';

var headers= new HttpHeaders()
.set('content-type', 'application/json')
.set('Access-Control-Allow-Headers', 'Content-Type')
.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
.set('Access-Control-Allow-Origin', '*');

@Component({
  selector: 'app-event-register',
  templateUrl: './event-register.component.html',
  styleUrls: ['./event-register.component.scss']
})



export class EventRegisterComponent implements OnInit, AfterContentInit {
  activeTab=0;
  selectedIndex;
  addButtonVisibility=false;
  nextButtonVisibility=true;
  hotels;
  eventSessions;

  @ViewChild('eventRegisterTabs', { static: false }) eventRegisterTabs: TabsetComponent;

  constructor(private modalService: BsModalService, private http: HttpClient) {

    if (localStorage.getItem("Authorization")) {
      headers = new HttpHeaders()
      .set('content-type', 'application/json')
      .set('Access-Control-Allow-Headers', 'Content-Type')
      .set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
      .set('Access-Control-Allow-Origin', '*')
      .set('Authorization', localStorage.getItem("Authorization"));
    }
  }

  ngOnInit(): void {
  }

  ngAfterViewInit() {
    this.eventRegisterTabs.tabs[this.activeTab].active=true;
    /*this.http.get<any>(API_URL + '/csi/event/services/eventV2/getAllEventHotels').subscribe(data => {
      this.hotels = data.localHotels;
    });*/

    this.http.get<any>(API_URL + '/csi/event/services/analyticsServices/getMLRecommendationCustomQuery?recommendationNameAndParams=getAvailableSessions%20181', { headers }).subscribe(data => {
      this.eventSessions = data.eventSessions;
    });
  }

  ngAfterContentInit(): void {
  }

  hideModal(){
    this.modalService.hide();
  }

  changeTab(tabId:number){
    this.activeTab = tabId;
    this.eventRegisterTabs.tabs[this.activeTab].active=true;

    if(this.activeTab == 5){
      this.addButtonVisibility = true;
      this.nextButtonVisibility = false;
    }
    else{
      this.addButtonVisibility = false;
      this.nextButtonVisibility = true;
    }
  }

  nextTab(){
    if(this.activeTab < this.eventRegisterTabs.tabs.length-1)
    {
      this.activeTab++;
      this.changeTab(this.activeTab)
    }
  }

}
