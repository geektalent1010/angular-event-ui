import { HttpErrorResponse } from '@angular/common/http';
import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { MyKeycloakService } from 'src/app/services/my-keycloak.service';
import { UserData } from '../permissions-manager.component';

@Component({
  selector: 'app-disable-user',
  templateUrl: './disable-user.component.html',
  styleUrls: ['./disable-user.component.scss']
})
export class DisableUserComponent implements OnInit {
  @Input() user: UserData;

  constructor(
    public activeModal: NgbActiveModal,
    private myKeycloak: MyKeycloakService
  ) { }

  ngOnInit(): void {
  }

  closeModal() {
    this.activeModal.close();
  }

  change() {
    this.myKeycloak.updateUser(this.user).then((updateRes: any) => {
      this.activeModal.close(true);
    }).catch(err => console.error("Disable User API error: ", err));
  }
}
