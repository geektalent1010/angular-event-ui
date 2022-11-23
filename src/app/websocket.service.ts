import { Injectable } from '@angular/core';
import * as Stomp from 'stompjs';
import * as SockJS from 'sockjs-client';

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {

  greetings: string[] = [];
  showConversation: boolean = false;
  ws: any;
  name: string;
  disabled: boolean;

  constructor() { }

  connect() {
    //connect to stomp where stomp endpoint is exposed
    //var socket = new SockJS('ws://localhost:8080/greeting');
    //let socket = new SockJS("http://localhost:8081/socket");
    let socket = new SockJS("http://www.csi-event.com:8088/socket");
    
    this.ws = Stomp.over(socket);
    let that = this;
    this.ws.connect({}, function(frame) {
      that.ws.subscribe("/errors", function(message) {
        alert("Error " + message.body);
      });
      that.ws.subscribe("/listener", function(message) {
        console.log(message)
        console.log("Rendering Event Updates")
      });
      that.disabled = true;
    }, function(error) {
      alert("STOMP error " + error);
    });
  }

  disconnect() {
    if (this.ws != null) {
      this.ws.ws.close();
    }
    this.setConnected(false);
    console.log("Disconnected");
  }

  startEvent(eventId) {
    let data = JSON.stringify({
      'eventId' : eventId
    })
    this.ws.send("/app/startEvent", {}, data);
  }

  stopEvent(eventId) {
    let data = JSON.stringify({
      'eventId' : eventId
    })
    this.ws.send("/app/stopEvent", {}, data);
  }

  setConnected(connected) {
    this.disabled = connected;
    this.showConversation = connected;
    this.greetings = [];
  }
}
