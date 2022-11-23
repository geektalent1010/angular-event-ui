import { Component, ViewChild, Input, OnInit, NgZone } from '@angular/core';
import { EmailEditorComponent } from 'angular-email-editor';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { EmailTemplateComponent } from '../../modals/email-template/email-template.component';
import { LabelType } from '@angular-slider/ngx-slider';

@Component({
  selector: 'app-email-builder',
  templateUrl: './email-builder.component.html',
  styleUrls: ['./email-builder.component.scss'],
})
export class EmailBuilderComponent implements OnInit {
  @ViewChild('editor')
  private emailEditor: EmailEditorComponent;
  @Input('template') template: any;
  // @Input('emailBuilder') emailBuilder: { [key: string]: any };
  @Input('emailBuilder') emailBuilder: any;

  updatedDesign: boolean = false;
  loadStatus: boolean[] = [];
  emailTemplate: { [key: string]: any } = {};

  static_email = [
    'org_email',
    'reg_email_en',
    'reg_email_es',
    'colleague_email',
    'customer_email',
    'confirmation_email_en',
    'confirmation_email_es',
    'access_denied_email',
    'incomplete_email',
    'visa_email',
    'exhi_confirm',
    'invoice_letter',
    'billing_letter',
  ];

  tempLabel = 'Attendee Reg Email - English';
  tempEmailList = [
    { label: 'Show Org Email', name: 'org_email' },
    { label: 'Attendee Reg Email - English', name: 'reg_email_en' },
    { label: 'Attendee Reg Email - Spanish', name: 'reg_email_es' },
    { label: 'Invite a Colleague Email', name: 'colleague_email' },
    { label: 'Invite a Customer Email', name: 'customer_email' },
    { label: 'Confirmation Email - English', name: 'confirmation_email_en' },
    { label: 'Confirmation Email - Spanish', name: 'confirmation_email_es' },
    { label: 'Access Denied Email', name: 'access_denied_email' },
    { label: 'Incomplete Email', name: 'incomplete_email' },
    { label: 'Visa Letter', name: 'visa_email' },
    { label: 'Exhibitor Reg Email', name: 'exhi_confirm' },
    { label: 'Invoice Letter', name: 'invoice_letter' },
    { label: 'Billing Letter', name: 'billing_letter' },
  ];

  constructor(public ngZone: NgZone, private modalService: NgbModal) {
    //
  }

  ngOnInit(): void {
    console.log('this.emailBuilder: ', this.emailBuilder);

    // this.static_email.forEach((item) => {
    //   Object.assign(this.emailTemplate, {
    //     [item]: this.emailBuilder.filter(function (el) {
    //       return el.name === item;
    //     })[0]['content'],
    //   });
    // });

    this.emailBuilder.forEach((el) => {
      Object.assign(this.emailTemplate, {
        [el.name]: el.content,
      });
      if (this.tempEmailList.findIndex((item) => item.name === el.name) < 0) {
        this.tempEmailList.push({ label: el.content.label, name: el.name });
      }
    });

    // console.log(this.emailBuilder.filter(function(el) { return el.name === "custom_email"}));

    // if (this.emailBuilder.filter(function(el) { return el.name === "custom_email"})?.length > 0 && this.emailBuilder.filter(function(el) { return el.name === "custom_email"})[0]["content"]?.length > 0) {
    //   this.emailBuilder.filter(function(el) { return el.name === "custom_email"})[0]["content"].forEach((item) => {
    //     Object.assign(this.emailTemplate, { [item.name]: item });
    //     this.tempEmailList.push({ label: item.label, name: item.name });
    //   });
    // } else {
    //   (this.emailBuilder.filter(function(el) { return el.name === "custom_email"})?.length > 0) ? null : this.emailBuilder.push({ name: "custom_email", content : [] });
    // }

    this.intialStatus();
    this.loadStatus['reg_email_en'] = true;
  }

  intialStatus() {
    this.tempEmailList.forEach((item) => {
      this.loadStatus[item.name] = false;
    });
  }

  fieldSelect() {
    let field = null;
    for (let key in this.loadStatus) {
      if (this.loadStatus[key]) {
        field = key;
        break;
      }
    }
    console.log(field);
    return field;
  }

  // called when the editor is created
  editorLoaded() {
    this.emailEditor.editor.addEventListener('design:updated', () => {
      this.ngZone.run(() => {
        this.updatedDesign = true;
      });

      console.log('design:updated', this.updatedDesign);
    });

    const field = this.fieldSelect();
    // const emailBuilterTemp = this.emailTemplate[field]['json'];
    if (this.emailTemplate[field]['json']) {
      this.emailEditor.editor.loadDesign(this.emailTemplate[field]['json']);
    } else {
      this.emailEditor.editor.loadDesign({
        html: this.emailTemplate[field]['html'],
        classic: true,
      });
    }
  }

  // called when the editor has finished loading
  editorReady() {
    console.log('editorReady');
  }

  LoadEmailTemp() {
    console.log('load email temp: ', this.tempLabel);
    this.tempEmailList.forEach((item) => {
      if (item.label === this.tempLabel) {
        this.intialStatus();
        this.loadStatus[item.name] = true;
      }
    });
    this.editorLoaded();
  }

  Save() {
    this.emailEditor.editor.exportHtml((data) => {
      const field = this.fieldSelect();
      this.emailTemplate[field]['json'] = data.design;
      this.emailTemplate[field]['html'] = btoa(data.html);
      console.log(btoa(data.html));

      // if (this.static_email.indexOf(field) >= 0) {
      console.log('Save', this.emailBuilder);
      Object.assign(
        this.emailBuilder.filter(function (el) {
          return el.name === field;
        })[0]['content'],
        this.emailTemplate[field]
      );
      // }
      // else {
      //   this.emailBuilder.filter(function(el) { return el.name === 'custom_email'})[0]['content'].forEach((item) => {
      //     if (
      //       item['name'] === this.emailTemplate[field]['name'] &&
      //       item['label'] === this.emailTemplate[field]['label']
      //     ) {
      //       console.log(item['name']);
      //       Object.assign(item, this.emailTemplate[field]);
      //     }
      //   });
      // }

      this.ngZone.run(() => {
        this.updatedDesign = false;
      });
    });
  }
  Duplicate() {
    const emailTemplateModalRef = this.modalService.open(
      EmailTemplateComponent,
      {
        size: 'lg',
        windowClass: 'modal-custom-createSession',
      }
    );

    let fieldNameList = [];
    this.emailBuilder.map((item) => {
      fieldNameList.push(item.name);
    });

    // this.emailBuilder.filter(function(el) { return el.name === 'custom_email'})[0]['content'].forEach((item) => {
    //   fieldNameList.push(item.name);
    // });
    emailTemplateModalRef.componentInstance.fieldNameList = fieldNameList;
    emailTemplateModalRef.result
      .then((template: any) => {
        console.log('Newly Created Email Template: ', template);

        const field = this.fieldSelect();
        const emailBuilderTemp = this.emailTemplate[field];

        this.tempEmailList.push(template);
        Object.assign(this.emailTemplate, {
          [template.name]: { ...emailBuilderTemp },
        });
        // this.emailBuilder.filter(function(el) { return el.name === 'custom_email'})[0]['content'].push({
        //   name: template.name,
        //   label: template.label,
        //   ...emailBuilderTemp,
        // });
        this.emailBuilder.push({
          name: template.label,
          content: {
            ...emailBuilderTemp,
            label: template.label,
            type: template.name,
          },
        });
        console.log('duplicate', this.emailBuilder);
        this.tempLabel = template.label;
        this.LoadEmailTemp();
      })
      .catch((err: Error) => {
        console.error('close error: ', err);
      });
  }

  upload($event) {
    if ($event.target.files && $event.target.files.length > 0) {
      const fileName: string = $event.target.files[0].name.split('.')[0];
      const reader: FileReader = new FileReader();
      reader.readAsText($event.target.files[0]);
      reader.onload = (e: any) => {
        /* read workbook */
        const bstr: string = e.target.result;
        const content = {
          html: bstr,
          label: fileName,
          type: fileName.replace(/\s/g, ''),
        };
        this.tempEmailList.push({
          label: fileName,
          name: content.type,
        });
        this.tempLabel = fileName;

        Object.assign(this.emailTemplate, {
          [fileName.replace(/\s/g, '')]: {
            ...content,
          },
        });

        this.emailBuilder.push({
          name: content.type,
          content: content,
        });
        console.log('upload', this.emailBuilder);
        this.LoadEmailTemp();
      };
    }
  }
}
