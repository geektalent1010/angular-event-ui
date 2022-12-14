import {
  Component,
  Input,
  OnDestroy,
  OnInit,
  OnChanges,
  Output,
  EventEmitter,
  ChangeDetectorRef,
  SimpleChanges,
} from "@angular/core";
import { CometChat } from "@cometchat-pro/chat";
import { STRING_MESSAGES } from "../../../utils/messageConstants";
@Component({
  selector: "cometchat-user-list",
  templateUrl: "./cometchat-user-list.component.html",
  styleUrls: ["./cometchat-user-list.component.css"],
})
export class CometChatUserListComponent
  implements OnInit, OnDestroy, OnChanges {
  @Input() friendsOnly = false;
  @Input() hasActions = false;
  @Input() item = null;

  @Output() onUserClick: EventEmitter<any> = new EventEmitter();
  @Output() actionGenerated: EventEmitter<any> = new EventEmitter();

  userListenerId = "userlist_" + new Date().getTime();

  decoratorMsg: string = STRING_MESSAGES.LOADING_MESSSAGE;
  userSearches: boolean = false;
  loader: Boolean = true;
  contactsNotFound: Boolean = false;
  contacts = [];
  usersList = [];
  usersRequest;
  timeout;
  defaultAvatarImage =
    "https://data-eu.cometchat.io/assets/images/avatars/spiderman.png";

  USERS: String = STRING_MESSAGES.USERS;
  SEARCH: String = STRING_MESSAGES.SEARCH;

  constructor(private ref: ChangeDetectorRef) {
    setInterval(() => {
      if (!this.ref["destroyed"]) {
        this.ref.detectChanges();
      }
    }, 5000);
  }

  ngOnChanges(change: SimpleChanges) {
    if (change["item"]) {
      if (change["item"].previousValue !== change["item"].currentValue) {
        const userlist = [...this.usersList];

        let userKey = userlist.findIndex(
          (u, k) => u.uid === change["item"].currentValue.uid
        );

        //if found in the list, update user object
        if (userKey > -1) {
          let userObj = userlist[userKey]; //{...userlist[userKey]};
          let newUserObj = Object.assign(
            {},
            userObj,
            change["item"].currentValue
          );
          userlist.splice(userKey, 1, newUserObj);
          this.usersList = [...userlist];
        }
      }
    }
  }

  ngOnInit() {
    this.usersRequest = new CometChat.UsersRequestBuilder()
      .friendsOnly(this.friendsOnly)
      .setLimit(60)
      .build();

    let user = CometChat.getLoggedinUser().then(
      (user) => {
        this.fetchNextContactList();
      },
      (error) => {
        console.log("error getting details:", { error });
      }
    );

    //Attaching User Listeners to dynamilcally update when a user comes online and goes offline
    CometChat.addUserListener(
      this.userListenerId,
      new CometChat.UserListener({
        onUserOnline: (onlineUser) => {
          /* when someuser/friend comes online, user will be received here */

          this.userUpdated(onlineUser);
        },
        onUserOffline: (offlineUser) => {
          /* when someuser/friend went offline, user will be received here */

          this.userUpdated(offlineUser);
        },
      })
    );
  }

  ngOnDestroy() {
    // removinf the changeDetector Ref
    this.ref.detach();

    CometChat.removeUserListener(this.userListenerId);
    this.userListenerId = null;
    this.usersRequest = null;
  }

  /**
   * Search User Based on their Name
   * @param String searchKey
   */
  searchUsers(searchKey) {
    this.contactsNotFound = false;
    this.decoratorMsg = STRING_MESSAGES.LOADING_MESSSAGE;

    if (this.timeout) {
      clearTimeout(this.timeout);
    }
    this.userSearches = true;
    this.loader = true;
    let val = searchKey;
    this.timeout = setTimeout(() => {
      //Empty Intial User List before searching user list according to search key
      this.usersList = [];

      this.usersRequest = new CometChat.UsersRequestBuilder()
        .friendsOnly(this.friendsOnly)
        .setSearchKeyword(searchKey)
        .setLimit(30)
        .build();

      this.fetchNextContactList();
    }, 500);
  }

  /**
   * If User scrolls to the bottom of the current Contact list than fetch next items of the contact list and append
   * @param Event e
   */
  handleScroll(e) {
    const bottom =
      Math.round(e.currentTarget.scrollHeight - e.currentTarget.scrollTop) ===
      Math.round(e.currentTarget.clientHeight);

    if (bottom) this.fetchNextContactList();
  }

  /**
   * Get List of users that are contacts of the current user
   *
   */
  fetchNextContactList() {
    this.usersRequest.fetchNext().then(
      (userList) => {
        if (userList.length === 0 && this.userSearches === true) {
          this.contactsNotFound = true;
          this.decoratorMsg = STRING_MESSAGES.NO_USERS_FOUND;
        } else {
          this.userSearches = false;
          /* userList will be the list of User class. */

          this.usersList = [...this.usersList, ...userList];
          this.loader = false;
        }
        /* retrived list can be used to display contact list. */
      },
      (error) => {
        console.log("User list fetching failed with error:", error);
      }
    );
  }

  /**
   * This function updates the status ( online / offline ) , in real-time when getting signals from the listerners
   * @param Any user
   */
  userUpdated = (user) => {
    let userlist = [...this.usersList];

    //search for user
    let userKey = userlist.findIndex((u, k) => u.uid === user.uid);

    //if found in the list, update user object
    if (userKey > -1) {
      let userObj = { ...userlist[userKey] };
      let newUserObj = { ...userObj, ...user };
      userlist.splice(userKey, 1, newUserObj);

      this.usersList = [...userlist];
    }
  };

  /**
   * Emitting the user clicked so that it can be used in the parent component
   * @param Any userToEmit
   */
  onUserClicked(userToEmit) {
    this.onUserClick.emit(userToEmit);
  }

  /**
   * Emitting the close Menu action to be used in parent component to handle screen logic
   * @param
   */
  handleMenuClose = () => {
    if (!this.hasActions) {
      return false;
    }

    this.actionGenerated.emit("closeMenuClicked");
  };
}
