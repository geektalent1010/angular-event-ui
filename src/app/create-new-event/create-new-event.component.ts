import { AfterContentInit, Component, ElementRef, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { TabsetComponent } from 'ngx-bootstrap/tabs';
import { HttpClient } from '@angular/common/http';

import $ from 'jquery';
import { API_URL } from '../services/url/url';

@Component({
  selector: 'app-create-new-event',
  templateUrl: './create-new-event.component.html',
  styleUrls: ['./create-new-event.component.scss']
})

export class CreateNewEventComponent implements OnInit, AfterContentInit {
  removeLastOnBackspace=false;
  defaultTags: string[] = [];
  statesTags: string[] = [];
  activeTab=0;
  selectedIndex;
  addButtonVisibility=false;
  nextButtonVisibility=true;

  @ViewChild('createEventTabs', { static: false }) createEventTabs: TabsetComponent;
  @ViewChild('slickModal') slickModal;
  @ViewChild('categoryCarousel') categoryCarousel;
  @ViewChild('createNewEventModal') createNewEventModal;

  slideConfig = {
    "slidesToShow": 3,
    "slidesToScroll": 2,
    "nextArrow": "<div class='nav-btn next-slide'></div>",
    "prevArrow": "<div class='nav-btn prev-slide'></div>",
    "dots": true,
    "infinite": true
  };

  categorySlideConfig = {
    "slidesToShow": 3,
    "slidesToScroll": 2,
    "nextArrow": "<div class='nav-btn next-slide'></div>",
    "prevArrow": "<div class='nav-btn prev-slide'></div>",
    "dots": true,
    "infinite": true
  };

  constructor(private modalService: BsModalService, private http: HttpClient) { }

  ngOnInit(): void {
    this.http.get<any>(API_URL + '/csi/event/services/eventV2/getAllDistinctEventTypes').subscribe(data => {
            this.eventTypes = data;
        })
  }

  addEvent(){
    this.hideModal();
    $('#sampleEvent').show();
  }

  public setRow(_index: number) {
    this.selectedIndex = _index;
}

  ngAfterViewInit() {
    this.createEventTabs.tabs[this.activeTab].active=true;
  }

  ngAfterContentInit(): void {
  }

  ruleCodes:string[] = ["Is this your first time attending..."];
  conditionCodes:string[] = ["Is not answered"];
  optionCodes:string[] = ["Ask Again On Enrollment Page"];

  eventTypes;

  fieldArray: Array<any> = [];
  newAttribute: any = {};

    addFieldValue() {
        this.fieldArray.push(this.newAttribute)
        this.newAttribute = {};
    }

    deleteFieldValue(index) {
        this.fieldArray.splice(index, 1);
    }

  hideModal(){
    this.modalService.hide();
  }

  changeTab(tabId:number){
    this.activeTab = tabId;
    this.createEventTabs.tabs[this.activeTab].active=true;
    
    if(this.activeTab == 4){
      this.addButtonVisibility = true;
      this.nextButtonVisibility = false;
    }
    else{
      this.addButtonVisibility = false;
      this.nextButtonVisibility = true;
    }
  }

  nextTab(){
    if(this.activeTab < this.createEventTabs.tabs.length-1)
    {
      this.activeTab++;
      this.changeTab(this.activeTab)
    }
  }

  slideEvent3D(e){
    console.log('3d');
  }

  slideEventOnsite(e){
    console.log('onsite');
  }

  slideEventOnsiteVirtual(e){
    console.log('onsite_virtual');
  }

  slideEventVirtual(e){
    console.log('virtual');
  }

  onTagsChanged(e){
    console.log(e);
  }

  tagEntered(e){
    
  }
}
