import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class AuthenticationService {
  // loggedIn: boolean = false;
  loggedIn: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  constructor() { }

  public setLoggedInStatus(loggedin: boolean) {
    this.loggedIn.next(loggedin);
  }

  // get authenticationStatus():boolean{
  //   return this.loggedIn;
  // }
  // set authenticationStatus(val: boolean){
  //   this.loggedIn = val;
  // }
}