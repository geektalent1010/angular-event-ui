import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { moveItemInArray, CdkDragDrop } from "@angular/cdk/drag-drop";

@Component({
  selector: 'app-reorder-pages',
  templateUrl: './reorder-pages.component.html',
  styleUrls: ['./reorder-pages.component.scss']
})
export class ReorderPagesComponent implements OnInit {
  @Input() pagesOrderData: any;
  _pagesOrderData;
  constructor(private activeModal: NgbActiveModal) { }

  ngOnInit(): void {
    this._pagesOrderData = {...this.pagesOrderData};
  }

  onDrop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this._pagesOrderData.pages, event.previousIndex, event.currentIndex);
  }

  closeModal() {
    this.activeModal.close();
  }

  save() {
    this.activeModal.close(this._pagesOrderData);
  }

}
