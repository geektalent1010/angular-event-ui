import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { moveItemInArray } from '@angular/cdk/drag-drop';
import { ToastService } from 'src/app/services/toast/toast.service';

@Component({
  selector: 'app-enable-flowpage',
  templateUrl: './enable-flowpage.component.html',
  styleUrls: ['./enable-flowpage.component.scss']
})
export class EnableFlowpageComponent implements OnInit {
  @Input('template') _template: any;
  @Input('regtypesList') regtypesList: any;  

  template: any;

  regList: string[] = [];
  regMethodList: string[] = ['Member Lookup', 'Default'];
  regtypeDeterm = 'Package Selection';

  initial_regtype = '';
  reg_method = '';

  requiredPages = [
    "personal-layout/personal",
    // "review-layout/Review-Information",
    "registration-confirmation/confirmation",
  ];
  tabsList: string[] = ["Page Visibility", "Initial Regtype", "Regtype Determination"];
  currentTab: string = this.tabsList[0];
  regtypeDetermMethods = ["Demographic Questions","Package Selection","None"];

  constructor(public activeModal: NgbActiveModal, public toastService: ToastService,) { }

  ngOnInit(): void {
    this.template = JSON.parse(JSON.stringify(this._template));
    // console.log('=====: 1', this.template);
    if (this.template.templateName.includes('Workflow 5')) {
      this.tabsList.push("Registration Method");
    }
    this.regList = this.regtypesList.map(el => el.code + ' - ' + el.description);
    this.template.pages.forEach(el => {
      if (el.page === 'initial_regtype') {
        this.initial_regtype = el.displayName;
        el.regTypeDeterm = !!el.regTypeDeterm ? el.regTypeDeterm: 'Package Selection';
        this.regtypeDeterm = el.regTypeDeterm;
      } else if (el.page === 'reg_method') {
        this.reg_method = el.enable ? 'Member Lookup' : 'Default';
      } else {
        this.reg_method = 'Member Lookup';
      }
    });
  }

  closeModal() {
    this.activeModal.close();
  }

  onRegTypeChange(value) {
    const idx = this.template.pages.findIndex(el => el.page === 'initial_regtype');
    if (idx > -1) {
      this.template.pages[idx].displayName = this.initial_regtype;
    } else {
      this.template.pages.push({page: 'initial_regtype', displayName: this.initial_regtype, enable: true, regTypeDeterm: this.regtypeDeterm });
    }
  }

  onRegMethodChange() {
    const idx = this.template.pages.findIndex(el => el.page === 'reg_method');
    if (idx > -1) {
      this.template.pages[idx].enable = this.reg_method === 'Member Lookup' ? true : false;
    } else {
      this.template.pages.push({page: 'reg_method', displayName: 'Member Lookup', enable: this.reg_method === 'Member Lookup' ? true : false});
    }
  }

  save() {
    let valid = false;
    const minusVal = this.template.pages.findIndex(el => el.page === 'initial_regtype') > -1 ? 1 : 0;
    let errMsg = '';
    if (this.template.pages[this.template.pages.length - 1 - minusVal].page === 'dashboard-layout/dashboard' || this.template.pages[this.template.pages.length - 1 - minusVal].page === 'review-layout/Review-Information' && this.template.pages[this.template.pages.length - 2 - minusVal].page === 'dashboard-layout/dashboard') {
      const confirmIdx = this.template.pages.findIndex(el => el.page==='registration-confirmation/confirmation');
      const dashboardIdx = this.template.pages.findIndex(el => el.page==='dashboard-layout/dashboard');
      if (confirmIdx > -1) {
        if (dashboardIdx - confirmIdx === 1) {
          valid = true
        } else {
          errMsg = "Confirmation page should just be ahead of Dashboard page";
        }
      } else {
        valid = true
      }
    } else {
      errMsg = "Dashboard or Payment page should be last page.";
    }
    if (valid) {
      this.activeModal.close(this.template);
    } else {
      this.toastService.show(errMsg, {
        delay: 6000,
        classname: 'bg-warning text-dark',
        headertext: 'Warning',
        autohide: true,
      });
    }
  }

  onRegtypeDetermChange() {
    const idx = this.template.pages.findIndex(el => el.page === 'initial_regtype');
    if (idx > -1) {
      this.template.pages[idx].displayName = this.initial_regtype;
      this.template.pages[idx].regTypeDeterm = this.regtypeDeterm;
    } else {
      this.template.pages.push({page: 'initial_regtype', displayName: this.initial_regtype, enable: true, regTypeDeterm: this.regtypeDeterm });
    }
  }

  onDrop(event) {
    moveItemInArray(this.template.pages, event.previousIndex, event.currentIndex);
  }
}
