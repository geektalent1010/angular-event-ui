import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private speakerList: any[] = [];

  constructor() { }

  getSpeakerList() {
    return this.speakerList;
  }

  getSpeakerItem(i: number) {
    return this.speakerList[i];
  }

  setSpeakerList(speaker: any) {
    this.speakerList.push(speaker);
  }

  removeSpeakerItem(i: number) {
    this.speakerList.splice(i, 1);
  }

  clearSpeakerList() {
    this.speakerList = [];
  }
}
