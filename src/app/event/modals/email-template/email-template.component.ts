import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { debounceTime, distinctUntilChanged, startWith } from 'rxjs/operators';

@Component({
  selector: 'app-email-template',
  templateUrl: './email-template.component.html',
  styleUrls: ['./email-template.component.scss'],
})
export class EmailTemplateComponent implements OnInit {
  @Input('fieldNameList') fieldNameList: string[];
  templateForm: FormGroup;

  constructor(public activeModal: NgbActiveModal) {
    this.templateForm = new FormGroup({
      label: new FormControl('', Validators.required),
      name: new FormControl('', Validators.required),
    });
  }

  tempEmailList = [
    { label: 'Show Org Email', name: 'org_email' },
    { label: 'Attendee Reg Email', name: 'reg_email' },
    // { label: 'Attendee Reg Email - Spanish', name: 'reg_email_es' },
    { label: 'Invite a Colleague Email', name: 'colleague_email' },
    { label: 'Invite a Customer Email', name: 'customer_email' },
    { label: 'Confirmation Email', name: 'confirmation_email' },
    { label: 'Access Denied Email', name: 'access_denied_email' },
    { label: 'Incomplete Email', name: 'incomplete_email' },
    { label: 'Visa Letter', name: 'visa_email' },
    { label: 'Exhibitor Reg Email', name: 'exhi_confirm' },
    { label: 'Invoice Letter', name: 'invoice_letter' },
    { label: 'Billing Letter', name: 'billing_letter' },
  ];

  ngOnInit(): void {
    this.initFunc();
  }

  get lf() {
    return this.templateForm.controls;
  }

  private initFunc() {
    this.lf.name.valueChanges
      .pipe(startWith(''), debounceTime(10), distinctUntilChanged())
      .subscribe((fieldName: string) => {
        this.isFieldNameFound();
      });
  }

  private isFieldNameFound() {
    const templateData: any = this.templateForm.value;
    if (this.fieldNameList.includes(templateData.name)) {
      this.lf['name'].setErrors({ fieldNameFound: true });
    } else {
      if (this.lf['name'].errors?.['fieldNameFound'])
        delete this.lf['name'].errors['fieldNameFound'];
    }
  }

  save() {
    if (this.templateForm.valid) {
      const templateData: any = this.templateForm.value;
      this.activeModal.close({
        label: templateData.label,
        name: templateData.name,
      });
    } else {
      Object.keys(this.lf).forEach((field: string) => {
        this.lf[field].markAsTouched();
        this.lf[field].updateValueAndValidity();
      });
    }
  }
}
