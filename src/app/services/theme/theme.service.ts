import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {

  private _themeDark: Subject<boolean> = new Subject<boolean>();
  isThemeDark = this._themeDark.asObservable();

  constructor() { }

  setDarkTheme(isThemeDark: boolean) {
    this._themeDark.next(isThemeDark);

    if (isThemeDark == true) {
      console.log('Dark Used');
      document.body.classList.add('dark-theme');
    }
    else {
      console.log('Light Used');
      document.body.classList.remove('dark-theme');
    }
  }
}
