import { Component, Input, OnInit, ViewChild, NgZone } from '@angular/core';
import { EmailEditorComponent } from 'angular-email-editor';
import defaultBadgeTemplate from './defaultBadgeTemplate.json';
import sampleBadgeTemplate from './sampleBadgeTemplate.json';

declare let unlayer: any;

function controlUnlayer() {
  unlayer.init({
    id: 'editor-container',
    projectId: 86076,
    displayMode: 'email',
    customJS: [
      'https://cdn.jsdelivr.net/gh/codemagician62/BadgeDesignConfig@6/bgColor.js',
      // 'https://cdn.jsdelivr.net/gh/codemagician62/BadgeDesignConfig@5/bgImage.js',
    ],
  });

  // const elements = document.getElementsByClassName('u_content_custom_test1111');
  // console.log('elements : ', elements);
}
@Component({
  selector: 'app-badge-designer',
  templateUrl: './badge-designer.component.html',
  styleUrls: ['./badge-designer.component.scss'],
})
export class BadgeDesignerComponent implements OnInit {
  @ViewChild('editor')
  private emailEditor: EmailEditorComponent;
  @Input('template') template: any;
  @Input('badgeDesigner') badgeDesigner: { [key: string]: any };

  constructor(public ngZone: NgZone) {}
  updatedDesign: boolean = true;

  loadStatus_badge: boolean = false;
  loadStatus_receipt: boolean = true;
  loadStatus_ticket: boolean = false;

  tempEmailList: string[] = ['Badge', 'Receipt', 'Ticket'];
  tempTitle = 'Badge';
  html: any;

  ngOnInit(): void {
    controlUnlayer();
    const badgeTemp = this.badgeDesigner[this.tempTitle]['json'];
    unlayer.loadDesign(badgeTemp);
  }

  editorLoaded() {
    // console.log(
    //   'badgeDesigner ===> ',
    //   this.badgeDesigner[this.tempTitle]['json']
    // );
    // this.emailEditor.editor.addEventListener('design:updated', () => {
    //   this.ngZone.run(() => {
    //     this.updatedDesign = true;
    //   });

    //   console.log('design:updated', this.updatedDesign);
    // });
    let badgeTemp = this.badgeDesigner[this.tempTitle]['json'];

    // this.emailEditor.editor.loadDesign(badgeTemp);

    unlayer.loadDesign(badgeTemp);
  }

  // called when the editor has finished loading
  editorReady() {
    console.log('editorReady');
  }

  switchEmailTemp() {
    this.editorLoaded();
  }

  exportHtml() {
    unlayer.exportHtml((data) => {
      console.log('data ==', data);
      this.badgeDesigner[this.tempTitle]['json'] = data.design;
      this.badgeDesigner[this.tempTitle]['html'] = btoa(data.html);
      alert("Saved new badge design!")
    });

    // this.emailEditor.editor.exportHtml((data) => {
    //   this.badgeDesigner[this.tempTitle]['json'] = data.design;
    //   this.badgeDesigner[this.tempTitle]['html'] = btoa(data.html);
    //   this.ngZone.run(() => {
    //     this.updatedDesign = false;
    //   });
    // });
  }
}
