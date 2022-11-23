import { HttpErrorResponse } from '@angular/common/http';
import { AbstractControl, AsyncValidatorFn, FormControl, FormGroup, ValidationErrors } from '@angular/forms';
import { Observable } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import { UtilitiesService } from 'src/app/services/utilities.service';

export class PWChangeValidators {
    constructor(
        public utilities: UtilitiesService
    ) { }

    static newMatchesConfirm(group: FormGroup){
        var confirm = group.controls['confirm'];
        if(group.controls['password'].value !== confirm.value)
            confirm.setErrors({ newMatchesConfirm: true });
        return null;
    }
}