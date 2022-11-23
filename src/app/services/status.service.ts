import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class StatusService {
  isPageLoading: Subject<boolean> = new Subject<boolean>();

  constructor() { }

  showPageLoading() {
    this.isPageLoading.next(true);
  }

  hidePageLoading() {
    this.isPageLoading.next(false);
  }
}
