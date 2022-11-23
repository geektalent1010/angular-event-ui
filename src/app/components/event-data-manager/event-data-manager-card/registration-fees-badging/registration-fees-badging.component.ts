import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-registration-fees-badging',
  templateUrl: './registration-fees-badging.component.html',
  styleUrls: ['./registration-fees-badging.component.scss']
})
export class RegistrationFeesBadgingComponent implements OnInit {
  @Input() valid;
  @Output() valueUpdated: EventEmitter<any> = new EventEmitter();

  regType = [
    { name: 'Attendee Starndard', value:'Attendee Starndard'},
    { name: 'Exhibitor Starndard', value:'Exhibitor Starndard'},
    { name: 'Student Starndard', value:'Student Starndard'},
    { name: 'Media Starndard', value:'Media Starndard'},
    { name: 'Cancelled Exhibitor DUPLICATE', value:'Cancelled Exhibitor DUPLICATE'},
    { name: 'Cancelled Virtual Only Attendee', value:'Cancelled Virtual Only Attendee'},
    { name: 'Education & Exhibits - Basic Mbr', value:'Education & Exhibits - Basic Mbr'},
    { name: 'Education & Exhibits - Premium Mbr', value:'Education & Exhibits - Premium Mbr'},
    { name: 'Education & Exhibits - Elite Mbr', value:'Education & Exhibits - Elite Mbr'},
    { name: 'Education & Exhibits - Non Mbr', value:'Education & Exhibits - Non Mbr'},
    { name: 'Exhibits Hall Only - Basic Mbr', value:'Exhibits Hall Only - Basic Mbr'},
    { name: 'Exhibits Hall Only - Premium Mbr', value:'Exhibits Hall Only - Premium Mbr'},
    { name: 'Exhibits Hall Only - Elite Mbr', value:'Exhibits Hall Only - Elite Mbr'},
    { name: 'Exhibits Hall Only - Non Mbr', value:'Exhibits Hall Only - Non Mbr'},
    { name: 'VIP - Basic Mbr', value:'VIP - Basic Mbr'},
    { name: 'VIP - Premium Mbr', value:'VIP - Premium Mbr'},
    { name: 'VIP - Elite Mbr', value:'VIP - Elite Mbr'},
    { name: 'VIP - Non Mbr', value:'VIP - Non Mbr'},
    { name: 'Speaker - NonMember', value:'Speaker - NonMember'},
    { name: 'Speaker - BASIC', value:'Speaker - BASIC'},
    { name: 'Press - Approved PREMIUM', value:'Press - Approved PREMIUM'},
    { name: 'Press - Approved ELITE', value:'Press - Approved ELITE'},
    { name: 'Press - Pending NONMEMBER', value:'Press - Pending NONMEMBER'},
    { name: 'Press - Pending BASIC', value:'Press - Pending BASIC'},
    { name: 'Press - Pending PREMIUM', value:'Press - Pending PREMIUM'},
    { name: 'Press - Pending ELITE', value:'Press - Pending ELITE'},
    { name: 'Press - Denied', value:'Press - Denied'},
    { name: 'Exhibitor Key Contact - No Badge', value:'Exhibitor Key Contact - No Badge'},
    { name: 'Exhibitor Dealer - Non-Member', value:'Exhibitor Dealer - Non-Member'},
    { name: 'Exhibitor Dealer - Basic ', value:'Exhibitor Dealer - Basic '},
    { name: 'Exhibitor Dealer - Premium', value:'Exhibitor Dealer - Premium'},
    { name: 'Exhibitor Dealer - Elite', value:'Exhibitor Dealer - Elite'},
    { name: 'Exhibitor Distributor - Non-Member', value:'Exhibitor Distributor - Non-Member'},
    { name: 'Exhibitor Distributor - Basic', value:'Exhibitor Distributor - Basic'},
    { name: 'Exhibitor Distributor - Premium', value:'Exhibitor Distributor - Premium'},
    { name: 'Exhibitor Distributor - Elite', value:'Exhibitor Distributor - Elite'},
    { name: 'Exhibitor Independent Rep - Non-Member', value:'Exhibitor Independent Rep - Non-Member'},
    { name: 'Exhibitor Independent Rep - Basic', value:'Exhibitor Independent Rep - Basic'},
    { name: 'Exhibitor Independent Rep - Premium', value:'Exhibitor Independent Rep - Premium'},
    { name: 'Exhibitor Independent Rep - Elite', value:'Exhibitor Independent Rep - Elite'},
    { name: 'Exhibitor Manufacturer - Non-Member', value:'Exhibitor Manufacturer - Non-Member'},
    { name: 'Exhibitor Manufacturer - Basic', value:'Exhibitor Manufacturer - Basic'},
    { name: 'Exhibitor Manufacturer - Premium', value:'Exhibitor Manufacturer - Premium'},
    { name: 'Exhibitor Manufacturer - Elite', value:'Exhibitor Manufacturer - Elite'},
    { name: 'Exhibitor Producer - Non-Member', value:'Exhibitor Producer - Non-Member'},
    { name: 'Exhibitor Producer - Basic', value:'Exhibitor Producer - Basic'},
    { name: 'Exhibitor Producer - Premium', value:'Exhibitor Producer - Premium'},
    { name: 'Exhibitor Producer - Elite', value:'Exhibitor Producer - Elite'},
    { name: 'Exhibitor Other - Non-Member', value:'Exhibitor Other - Non-Member'},
    { name: 'Exhibitor Other - Basic', value:'Exhibitor Other - Basic'},
    { name: 'Exhibitor Other - Premium', value:'Exhibitor Other - Premium'},
    { name: 'Exhibitor Other - Elite', value:'Exhibitor Other - Elite'},
    { name: 'Contractor', value:'Contractor'},
    { name: 'Staff - Nonmember', value:'Staff - Nonmember'},
    { name: 'Staff - Basic', value:'Staff - Basic'},
    { name: 'Staff - Premium', value:'Staff - Premium'},
    { name: 'Staff - Elite', value:'Staff - Elite'},
    { name: 'Virtual Only - Nonmember', value:'Virtual Only - Nonmember'},
    { name: 'Virtual Only - Basic', value:'Virtual Only - Basic'},
    { name: 'Virtual Only - Premium', value:'Virtual Only - Premium'},
    { name: 'Virtual Only - Elite', value:'Virtual Only - Elite'},
    { name: 'Attendee Tuesday Admit', value:'Attendee Tuesday Admit'},
    { name: 'Attendee Sunday Admit', value:'Attendee Sunday Admit'},
    { name: 'Attendee Monday Admit', value:'Attendee Monday Admit'},
    
  ];
  regCode = [
    { name: 'Attendee Starndard', value:'Attendee Starndard'},
    { name: 'Exhibitor Starndard', value:'Exhibitor Starndard'},
    { name: 'Student Starndard', value:'Student Starndard'},
    { name: 'Media Starndard', value:'Media Starndard'},
    { name: 'Cancelled Exhibitor DUPLICATE', value:'Cancelled Exhibitor DUPLICATE'},
    { name: 'Cancelled Virtual Only Attendee', value:'Cancelled Virtual Only Attendee'},
    { name: 'Education & Exhibits - Basic Mbr', value:'Education & Exhibits - Basic Mbr'},
    { name: 'Education & Exhibits - Premium Mbr', value:'Education & Exhibits - Premium Mbr'},
    { name: 'Education & Exhibits - Elite Mbr', value:'Education & Exhibits - Elite Mbr'},
    { name: 'Education & Exhibits - Non Mbr', value:'Education & Exhibits - Non Mbr'},
    { name: 'Exhibits Hall Only - Basic Mbr', value:'Exhibits Hall Only - Basic Mbr'},
    { name: 'Exhibits Hall Only - Premium Mbr', value:'Exhibits Hall Only - Premium Mbr'},
    { name: 'Exhibits Hall Only - Elite Mbr', value:'Exhibits Hall Only - Elite Mbr'},
    { name: 'Exhibits Hall Only - Non Mbr', value:'Exhibits Hall Only - Non Mbr'},
    { name: 'VIP - Basic Mbr', value:'VIP - Basic Mbr'},
    { name: 'VIP - Premium Mbr', value:'VIP - Premium Mbr'},
    { name: 'VIP - Elite Mbr', value:'VIP - Elite Mbr'},
    { name: 'VIP - Non Mbr', value:'VIP - Non Mbr'},
    { name: 'Speaker - NonMember', value:'Speaker - NonMember'},
    { name: 'Speaker - BASIC', value:'Speaker - BASIC'},
    { name: 'Press - Approved PREMIUM', value:'Press - Approved PREMIUM'},
    { name: 'Press - Approved ELITE', value:'Press - Approved ELITE'},
    { name: 'Press - Pending NONMEMBER', value:'Press - Pending NONMEMBER'},
    { name: 'Press - Pending BASIC', value:'Press - Pending BASIC'},
    { name: 'Press - Pending PREMIUM', value:'Press - Pending PREMIUM'},
    { name: 'Press - Pending ELITE', value:'Press - Pending ELITE'},
    { name: 'Press - Denied', value:'Press - Denied'},
    { name: 'Exhibitor Key Contact - No Badge', value:'Exhibitor Key Contact - No Badge'},
    { name: 'Exhibitor Dealer - Non-Member', value:'Exhibitor Dealer - Non-Member'},
    { name: 'Exhibitor Dealer - Basic ', value:'Exhibitor Dealer - Basic '},
    { name: 'Exhibitor Dealer - Premium', value:'Exhibitor Dealer - Premium'},
    { name: 'Exhibitor Dealer - Elite', value:'Exhibitor Dealer - Elite'},
    { name: 'Exhibitor Distributor - Non-Member', value:'Exhibitor Distributor - Non-Member'},
    { name: 'Exhibitor Distributor - Basic', value:'Exhibitor Distributor - Basic'},
    { name: 'Exhibitor Distributor - Premium', value:'Exhibitor Distributor - Premium'},
    { name: 'Exhibitor Distributor - Elite', value:'Exhibitor Distributor - Elite'},
    { name: 'Exhibitor Independent Rep - Non-Member', value:'Exhibitor Independent Rep - Non-Member'},
    { name: 'Exhibitor Independent Rep - Basic', value:'Exhibitor Independent Rep - Basic'},
    { name: 'Exhibitor Independent Rep - Premium', value:'Exhibitor Independent Rep - Premium'},
    { name: 'Exhibitor Independent Rep - Elite', value:'Exhibitor Independent Rep - Elite'},
    { name: 'Exhibitor Manufacturer - Non-Member', value:'Exhibitor Manufacturer - Non-Member'},
    { name: 'Exhibitor Manufacturer - Basic', value:'Exhibitor Manufacturer - Basic'},
    { name: 'Exhibitor Manufacturer - Premium', value:'Exhibitor Manufacturer - Premium'},
    { name: 'Exhibitor Manufacturer - Elite', value:'Exhibitor Manufacturer - Elite'},
    { name: 'Exhibitor Producer - Non-Member', value:'Exhibitor Producer - Non-Member'},
    { name: 'Exhibitor Producer - Basic', value:'Exhibitor Producer - Basic'},
    { name: 'Exhibitor Producer - Premium', value:'Exhibitor Producer - Premium'},
    { name: 'Exhibitor Producer - Elite', value:'Exhibitor Producer - Elite'},
    { name: 'Exhibitor Other - Non-Member', value:'Exhibitor Other - Non-Member'},
    { name: 'Exhibitor Other - Basic', value:'Exhibitor Other - Basic'},
    { name: 'Exhibitor Other - Premium', value:'Exhibitor Other - Premium'},
    { name: 'Exhibitor Other - Elite', value:'Exhibitor Other - Elite'},
    { name: 'Contractor', value:'Contractor'},
    { name: 'Staff - Nonmember', value:'Staff - Nonmember'},
    { name: 'Staff - Basic', value:'Staff - Basic'},
    { name: 'Staff - Premium', value:'Staff - Premium'},
    { name: 'Staff - Elite', value:'Staff - Elite'},
    { name: 'Virtual Only - Nonmember', value:'Virtual Only - Nonmember'},
    { name: 'Virtual Only - Basic', value:'Virtual Only - Basic'},
    { name: 'Virtual Only - Premium', value:'Virtual Only - Premium'},
    { name: 'Virtual Only - Elite', value:'Virtual Only - Elite'},
    { name: 'Attendee Tuesday Admit', value:'Attendee Tuesday Admit'},
    { name: 'Attendee Sunday Admit', value:'Attendee Sunday Admit'},
    { name: 'Attendee Monday Admit', value:'Attendee Monday Admit'},
    
  ];

  constructor() { }

  ngOnInit(): void {

  }

  changedValue(edit, component){

    this.valid[component] = edit;
    this.valueUpdated.emit(this.valid);
  }

  changedSelect(event, component){
    this.valid[component] = event.target.value;
    this.valueUpdated.emit(this.valid);
  }

}
