import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { CometChatSenderFileMessageBubbleComponent } from "./cometchat-sender-file-message-bubble/cometchat-sender-file-message-bubble.component";
import { CometChatReadReciept } from "../CometChat-read-reciept/cometchat-read-reciept.module";
import { CometChatMessageActions } from "../CometChat-message-actions/cometchat-message-actions.module";
import { CometChatThreadedMessageReplyCount } from "../CometChat-threaded-message-reply-count/cometchat-threaded-message-reply-count.module";
import { CometChatMessageReactions } from "../Extensions/CometChat-message-reactions/cometchat-message-reactions.module";

@NgModule({
  declarations: [CometChatSenderFileMessageBubbleComponent],
  imports: [
    CommonModule,
    CometChatReadReciept,
    CometChatMessageActions,
    CometChatThreadedMessageReplyCount,
    CometChatMessageReactions,
  ],
  exports: [CometChatSenderFileMessageBubbleComponent],
})
export class CometChatSenderFileMessageBubble {}
