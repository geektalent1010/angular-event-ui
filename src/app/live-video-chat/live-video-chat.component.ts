import { Component, OnInit } from '@angular/core';
//import { CometChat } from "@cometchat-pro/chat";
//import { CometChatUI } from "angular-chat-ui-kit";

@Component({
  selector: 'app-live-video-chat',
  templateUrl: './live-video-chat.component.html',
  styleUrls: ['./live-video-chat.component.scss']
})

export class LiveVideoChatComponent implements OnInit {
  //private cometChatUI: CometChatUI
  constructor() {
   
   }

  ngOnInit(): void {
    const appID = "28959137fb4efe8";
    const region = "us";
   /* const appSetting = new CometChat.AppSettingsBuilder()
      .subscribePresenceForAllUsers()
      .setRegion(region)
      .build();
    
    CometChat.init(appID, appSetting).then(
      () => {
        console.log("Initialization completed successfully");
        // You can now call login function.
      },
      (error) => {
        console.log("Initialization failed with error:", error);
        // Check the reason for error and take appropriate action.
      }
    );
    const authKey = "4cad84454c8a4651e7053f88b8aaae5e49e3574c";
    const uid = "SUPERHERO1";

    CometChat.login(uid, authKey).then(
      (user) => {
        console.log("Login Successful:", { user });
      },
      (error) => {
        console.log("Login failed with exception:", { error });
      }
    );*/
  
  }

}
