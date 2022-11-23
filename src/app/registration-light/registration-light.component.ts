import { HttpClient } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { BsModalService } from 'ngx-bootstrap/modal';
import { TabsetComponent } from 'ngx-bootstrap/tabs';
import { WebsocketService } from "../websocket.service";

interface Hero {
  id: number;
  name: string;
}

@Component({
  selector: 'app-registration-light',
  templateUrl: './registration-light.component.html',
  styleUrls: ['./registration-light.component.scss'],
  providers: [WebsocketService]
})

export class RegistrationLightComponent implements OnInit {
  activeTab=0;
  modalFooterHide=true;
  selectedHero:Hero;
  
  HEROES: Hero[] = [
    { id: 11, name: 'Dr Nice' },
    { id: 12, name: 'Narco' },
    { id: 13, name: 'Bombasto' },
    { id: 14, name: 'Celeritas' },
    { id: 15, name: 'Magneta' },
    { id: 16, name: 'RubberMan' },
    { id: 17, name: 'Dynama' },
    { id: 18, name: 'Dr IQ' },
    { id: 19, name: 'Magma' },
    { id: 20, name: 'Tornado' }
  ];

  @ViewChild('registerTabs', { static: false }) registerTabs: TabsetComponent;
  
  constructor(private modalService: BsModalService, private http: HttpClient, private wsService: WebsocketService) {
    wsService.connect();
  }

  startEvent(){
    this.wsService.startEvent("1");
  }

  stopEvent(){
    this.wsService.stopEvent("1");
  }

  registrationComplete() {
  }

  ngOnInit(): void {
  }

  onSelect(hero: Hero): void {
    this.selectedHero = hero;
  }

  changeTab(tabId:number){
    this.activeTab = tabId;
    this.registerTabs.tabs[this.activeTab].active=true;

    if(this.activeTab==1){
      this.modalFooterHide=false;
    }
    else{
      this.modalFooterHide=true;
    }
  }

  nextTab(){
    if(this.activeTab < this.registerTabs.tabs.length-1)
    {
      this.activeTab++;
      this.changeTab(this.activeTab)
    }
  }

  loginFunction(){
    this.modalService.hide();
  }

}
