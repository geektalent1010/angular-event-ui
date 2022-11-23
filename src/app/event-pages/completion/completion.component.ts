import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { NgxQrcodeElementTypes, NgxQrcodeErrorCorrectionLevels } from '@techiediaries/ngx-qrcode';
import { ImageConstants } from '../imageConstants';
import html2canvas from 'html2canvas';
import { Input } from '@angular/core';
import { API_URL } from 'src/app/services/url/url';


@Component({
  selector: 'app-completion',
  templateUrl: './completion.component.html',
  styleUrls: ['./completion.component.scss']
})
export class CompletionComponent implements OnInit {
  elementType = NgxQrcodeElementTypes.URL;
  correctionLevel = NgxQrcodeErrorCorrectionLevels.HIGH;
  value = API_URL + '/csi/exhibtor/services/capture/attenddeeleadbyID';
  logo: any;
  firstName: any;
  lastName: any;
  userTypeCode: any;

  @Input() eventName: string; 
  @Input() eventDescription: string; 
  @Input() tradeShowEvent: string; 
  @Input() addUserid: string; 
  @Input() startDate: string; 
  @Input() endDate: string; 
  @Input() category: string; 
  @Input() subcategory: string; 
  @Input() eventID: string;  
  
  @ViewChild('screen') screen: ElementRef;
  @ViewChild('canvas') canvas: ElementRef;
  @ViewChild('downloadLink') downloadLink: ElementRef;


  constructor() { }

  ngOnInit(): void {
    this.logo = localStorage.getItem("logo") ? localStorage.getItem("logo") : ImageConstants.logo,
    this.firstName = localStorage.getItem('firstName');
    this.lastName = localStorage.getItem('nameLast');
    this.value = `${this.value}?attendeeId=${this.addUserid}&eventId=${this.eventID}`;
    console.log('QR code url ', this.value);
  }


  downloadImage(){
    html2canvas(this.screen.nativeElement).then(canvas => {
      this.canvas.nativeElement.src = canvas.toDataURL();
      this.downloadLink.nativeElement.href = canvas.toDataURL('image/png');
      this.downloadLink.nativeElement.download = 'virtual-badge.png';
      this.downloadLink.nativeElement.click();
    });
  }

}
