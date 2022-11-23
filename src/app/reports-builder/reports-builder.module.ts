import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReportsComponent } from './reports/reports.component';
import { MultiSelectDropdownComponent } from './multi-select-dropdown/multi-select-dropdown.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { DatePickerComponent } from './date-picker/date-picker.component';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule, MatRippleModule } from '@angular/material/core';
// import { HighlightDirective } from './filters/filters.component';
import { FiltersComponent } from './filters/filters.component';
import { DropdownBasicComponent } from './dropdown-basic/dropdown-basic.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
@NgModule({
  declarations: [
    ReportsComponent,
    MultiSelectDropdownComponent,
    DatePickerComponent,
    // HighlightDirective,
    FiltersComponent,
    DropdownBasicComponent
  ],
  imports: [
    CommonModule,
    NgMultiSelectDropDownModule,
    FormsModule,
    ReactiveFormsModule,
    MatNativeDateModule,
    MatInputModule,
    MatDatepickerModule,
    MatRippleModule,
    NgbModule
  ]
})
export class ReportsBuilderModule {}
