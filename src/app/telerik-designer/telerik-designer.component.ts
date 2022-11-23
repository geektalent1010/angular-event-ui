import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {  DomSanitizer } from '@angular/platform-browser';
import { AuthenticationService } from 'src/app/services/authentication/authentication';
import { environment } from 'src/environments/environment';
import { Md5 } from 'ts-md5';

@Component({
  selector: 'app-telerik-designer',
  templateUrl: './telerik-designer.component.html',
  styleUrls: ['./telerik-designer.component.scss']
})


export class TelerikDesignerComponent implements OnInit {
  loggedIn: boolean = false;
  reportId: String;
  thisURL: any;
  safeURL: any;
  evtuid: string = "";

  constructor(
    private activatedRoute: ActivatedRoute,
    private sanitizer: DomSanitizer,
    public authenticationService: AuthenticationService
  ) { }

  ngOnInit(): void {
    this.authenticationService.loggedIn.subscribe((loggedIn: boolean) => {
      this.loggedIn = loggedIn;
    });

    this.activatedRoute.queryParams.subscribe(params => {
      console.log(params);
      this.evtuid = params.evtuid;
    });
    
    const username: string = localStorage.getItem("username");
    const password: string = localStorage.getItem("password");
    if (username && password) {
      const passwordMd5 = Md5.hashStr(password).toString().toUpperCase();
      this.reportId = this.activatedRoute.snapshot.params.id;
      console.log(this.reportId);
      const usernameSubfix: string = environment.production ? "_prod" : "_dev";
      this.thisURL = "https://www.csi-event.com/Report/Designer/" + this.reportId + "?username=" + username + usernameSubfix + "&password=" + passwordMd5 + "&evtuid=" + this.evtuid;
      if (this.loggedIn == true) {
        this.safeURL = this.sanitizer.bypassSecurityTrustResourceUrl(this.thisURL);
      }
    } else {
      alert("The username or password is wrong");
    }
  }

}
