import { Injectable } from '@angular/core';
import {io} from 'socket.io-client';
import {ObjectUnsubscribedError, Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SocketService {

  private socket: any;

  constructor() {
    this.socket = io('https://www.csi-event.com:5000');
  }


  // HANDLER
  getMessage(): Observable<any> {
    return new Observable(observer => {
      this.socket.on('resp', msg => {
        console.log(msg);
        observer.next(msg);
      });
    });
  }

  sendMessage(type: string, words: any): void {
    this.socket.emit(type, words);
  }
}
