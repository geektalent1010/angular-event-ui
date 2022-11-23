import { BuilderBlock } from '@builder.io/angular';
import { Component, Input } from '@angular/core';
import { GetContentOptions } from '@builder.io/sdk';
import { Router } from '@angular/router';
// import { RolesService } from './services/roles.service';
import { MyKeycloakService } from './services/my-keycloak.service';
import { HttpErrorResponse } from '@angular/common/http';
import { NgxSpinnerService } from 'ngx-spinner';
import { StatusService } from './services/status.service';

@Component({
  selector: 'custom-thing',
  template: 'Hello: {{name}}'
})
export class CustomThing {
  @Input()
  name = '';
}

BuilderBlock({
  tag: 'custom-thing',
  name: 'Custom thing',
  inputs: [
    {
      name: 'name',
      type: 'string'
    }
  ]
})(CustomThing);

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'ng-event-ui';
  options: GetContentOptions = {
    cacheSeconds: 1
  };
  isLoading: boolean = false;
  isPageLoading: boolean = false;

  constructor(
    private router: Router,
    // private roleService: RolesService,
    private myKeycloak: MyKeycloakService,
    private spinner: NgxSpinnerService,
    private statusService: StatusService
  ) {
    localStorage.removeItem("logout");
    this.handlePageLoading();
    // this.roleService.getUserRoles();
    // this.myKeycloak.getToken().then((token: string) => {
    //   const keycloakToken = JSON.parse(token);
    //   if (!keycloakToken?.error) {
    //     localStorage.setItem("keycloakToken", keycloakToken.access_token);
    //     localStorage.setItem("keycloakFullToken", token);
    //   }
    // }).catch(err => {
    //   console.error("Get keycloak token error: ", err);
    // });
  }

  public isNotEventPage(): boolean {
    var doc = this.router.url;

    var isNoHeader = doc.startsWith('/pages/') || doc.startsWith('/tlkreport') || doc.startsWith('/payment-gateway');

    return !isNoHeader;
  }

  handlePageLoading() {
    this.isPageLoading = true;
    this.spinner.show("pageLoading", { bdColor: "#007497", size: "medium" });
    setTimeout(() => {
      this.isPageLoading = false;
      this.spinner.hide("pageLoading");
    }, 3000);
    this.statusService.isPageLoading.subscribe((isLoading: boolean) => {
      if (isLoading && !this.isLoading) {
        this.isLoading = true;
        this.spinner.show("pageLoading", { bdColor: "#007497", size: "medium" });
        setTimeout(() => {
          this.isLoading = false;
          this.isPageLoading = false;
          this.spinner.hide("pageLoading");
        }, 5000);
      } else if (!isLoading && this.isLoading) {
        this.isLoading = false;
        this.isPageLoading = false;
        this.spinner.hide("pageLoading");
      }
    });
  } 
}
