import { HttpErrorResponse } from '@angular/common/http';
import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { MyKeycloakService } from 'src/app/services/my-keycloak.service';
import { PWChangeValidators } from './pw-validators'

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.scss']
})

export class ChangePasswordComponent implements OnInit {
  @Input() userId: string;
  passwordForm: FormGroup;

  constructor(
    public activeModal: NgbActiveModal,
    private fb: FormBuilder,
    private myKeycloak: MyKeycloakService
  ) {
    this.passwordForm = this.fb.group({
      newPassword: new FormControl("", Validators.required),
      confirm: new FormControl("", Validators.required)
    }, {
      validator: PWChangeValidators.newMatchesConfirm
    });
  }

  ngOnInit(): void {
  }

  get lf() {
    return this.passwordForm.controls;
  }

  closeModal() {
    this.activeModal.close();
  }

  static newMatchesConfirm(group: FormGroup){
    var confirm = group.controls['confirm'];
    if(group.controls['newPassword'].value !== confirm.value)
        confirm.setErrors({ newMatchesConfirm: true });
    return null;
  }

  save() {
    if (this.passwordForm.valid) {
      const password: string = this.passwordForm.value["newPassword"];
      this.myKeycloak.setPassword(this.userId, password).then((setPasswordRes: any) => {
        this.closeModal();
      }).catch(err => console.error(err));
    } else {
      Object.keys(this.lf).forEach((field: string) => {
        this.lf[field].markAsTouched();
        this.lf[field].updateValueAndValidity();
      });
    }
  }
}
