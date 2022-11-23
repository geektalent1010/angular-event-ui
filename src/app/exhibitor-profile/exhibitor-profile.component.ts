import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {NgbModal, ModalDismissReasons} from '@ng-bootstrap/ng-bootstrap';
import {Observable} from 'rxjs';
import {debounceTime, distinctUntilChanged, map} from 'rxjs/operators';
import { API_URL } from '../services/url/url';

@Component({
  selector: 'app-exhibitor-profile',
  templateUrl: './exhibitor-profile.component.html',
  styleUrls: ['./exhibitor-profile.component.scss']
})
export class ExhibitorProfileComponent implements OnInit {


  public regCode: string;
  private REST_API_SERVER = API_URL + "/csi/event/services/eventV2/getDistinctRegTypeByEvtType?evtType=REG";
  private EVENT_TYPE_API = API_URL + "/csi/event/services/eventV2/getAllDistinctEventTypes";
  private ATTENDEE_TYPE_API = API_URL + "/csi/event/services/eventRegistration/getEventRegistrationUserTypes";
  regCodes = [];
  public myEventID: string;
  list1: any[];
  list2: any[];
  eventID = "230849682";



  constructor(private modalService: NgbModal, private httpClient: HttpClient) { }



  private getDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return  `with: ${reason}`;
    }
  }
  public addOption() {
    var options = $('#regCodeList').find(":selected").text();
    console.log(options);
    $('select.multiselect2').append(options);
  }

  public addAllOptions() {
   // var options = $('select.regCodeList option').toArray().sort().clone();
   // $('select.multiselect2').append(options);
  }
  
  public removeOption() {
    $('select.multiselect2 option:selected').remove();
  }

  public removeAllOptions() {
    $('select.multiselect2').empty();
  }

  public sendGetRequest(){
    //return this.httpClient.get(this.REST_API_SERVER);
  }

  addGoal() {

      $(".client-goals").clone().appendTo(".client-goals-container");

  }
  
  open(content) {
    this.modalService.open(content, {ariaLabelledBy: 'modal-basic-title'}).result.then((result) => {
      //this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
     // this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }

  addEventCall () {
    
    $("#addNewEvent").trigger( "click" );
  }

    ngOnInit(): void {


      /* this.sendGetRequest().subscribe((data: any[])=>{
         this.regCodes = data;
         this.list1 = data;
       })  
   */
       var modal = document.getElementById("myModal");
       modal.style.display = "none";
   
      // Get the button that opens the modal
      var btn = document.getElementById("myBtn");
      
      // Get the <span> element that closes the modal
      var span = document.getElementsByClassName("close")[0];
       
      window.onclick = function(event) {
        if (event.target == modal) {
         modal.style.display = "none";
       }
      
      }
      
      
      function toggleColor(src) {
        $(src).addClass('col-3-clicked');
      }
      
      function runSave() {
        //alert('Your event was saved successfully.\n\nYou will be directed to the builder for the event.');
        
        window.location.href="/creator";
        
      }
      
      
      function launchSignup() {
        modal.style.display = "block";
      }
      
      function updateBlock() {
        
      }
     
      
            
      $(function() {
   
       //$('#eventType').selectpicker();
   
       $('#saveEvent').bind('click', function(e) {
         runSave();
       })
       
   
        $('.tab-content:first-child').show();
        $('.tab-nav-link').bind('click', function(e) {
        
         console.log("Event ID: 230849682");
         
         let myThis = $(this);
          console.log(myThis);
          //let myTabs = myThis.parent().parent().next();
          let target = $(myThis.data("target")); // get the target from data attribute
          myThis.siblings().removeClass('current');
          target.siblings().css("display", "none")
            myThis.addClass('current');
            target.fadeIn("fast");
         
        });
        $('.tab-nav-link:first-child').trigger('click');
      });
   
      this.regCode = $('#eventType option:selected').text();
     }
    
   }
   