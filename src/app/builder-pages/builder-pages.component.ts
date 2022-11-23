import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {  DomSanitizer } from '@angular/platform-browser';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-builder-pages',
  templateUrl: './builder-pages.component.html',
  styleUrls: ['./builder-pages.component.scss']
})


export class BuilderPagesComponent implements OnInit {

  clientId: String;
  guId: String;
  thisURL: any;
  safeURL: any;

  constructor(private activatedRoute: ActivatedRoute, private sanitizer: DomSanitizer) { }


  ngOnInit(): void {
    $('#main-wrapper').toggle();

    this.clientId = this.activatedRoute.snapshot.params.id;
    console.log(this.clientId);
    this.guId = this.activatedRoute.snapshot.queryParams.guId
    console.log(this.guId);
    this.thisURL = environment.PAPERBITS_URL + "/" + this.clientId + "/" + this.guId + "/";
    this.safeURL = this.sanitizer.bypassSecurityTrustResourceUrl(this.thisURL);
  }

}
