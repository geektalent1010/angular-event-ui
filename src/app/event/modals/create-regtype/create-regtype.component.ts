import { Component, Input, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { RegtypeData } from '../../interfaces/Regtype';

@Component({
  selector: 'app-create-regtype',
  templateUrl: './create-regtype.component.html',
  styleUrls: ['./create-regtype.component.scss'],
})
export class CreateRegtypeComponent implements OnInit {
  @Input('regtypesList') regtypesList: RegtypeData[];
  regtypeForm: FormGroup = new FormGroup({
    code: new FormControl('', [
      Validators.required,
      Validators.minLength(2),
      Validators.maxLength(3),
      Validators.pattern(/[a-zA-Z]{2,3}$/),
      this.codeExistingValidator(),
    ]),
    description: new FormControl('', [
      Validators.required,
      Validators.minLength(3),
      Validators.maxLength(30),
      this.descriptionExistingValidator(),
    ]),
    barcodecolor: new FormControl('#000000'),
    backgroundcolor: new FormControl(''),
    backgroundtextcolor: new FormControl(''),
  });

  constructor(public activeModal: NgbActiveModal) {}

  ngOnInit(): void {}

  codeExistingValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (!value) {
        return null;
      }
      const existingDuplicate: boolean = this.regtypesList.some(
        (regtype: RegtypeData) =>
          regtype.code.toLowerCase() === value.toLowerCase()
      );
      if (existingDuplicate) {
        return { alreadyExisting: true };
      } else {
        return null;
      }
    };
  }

  descriptionExistingValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (!value) {
        return null;
      }
      const existingDuplicate: boolean = this.regtypesList.some(
        (regtype: RegtypeData) =>
          regtype.description.toLowerCase() === value.toLowerCase()
      );
      if (existingDuplicate) {
        return { alreadyExisting: true };
      } else {
        return null;
      }
    };
  }

  get lf() {
    return this.regtypeForm.controls;
  }

  closeModal() {
    this.activeModal.close();
  }

  add() {
    Object.keys(this.lf).forEach((key: string) => {
      this.lf[key].markAsTouched();
      this.lf[key].updateValueAndValidity();
    });
    if (this.regtypeForm.valid) {
      this.activeModal.close(this.regtypeForm.value);
    }
  }
}
