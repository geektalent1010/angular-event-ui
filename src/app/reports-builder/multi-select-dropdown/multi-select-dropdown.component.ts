import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-multi-select-dropdown',
  templateUrl: './multi-select-dropdown.component.html',
  styleUrls: ['./multi-select-dropdown.component.scss']
})
export class MultiSelectDropdownComponent implements OnInit {
  @Input() placeholder = 'Make your selection';
  @Input() options: any[] = [];
  @Output() selectedGroups = new EventEmitter<any[]>();
  @Output() latestSelection = new EventEmitter<any>();


  myForm: FormGroup;
  disabled = false;
  ShowFilter = false;
  limitSelection = false;
  selectedItems: any[] = [];
  dropdownSettings: any = {};
  constructor(private fb: FormBuilder) {}

  ngOnInit() {
    this.selectedItems = [];
    this.dropdownSettings = {
      singleSelection: false,
      idField: 'item_id',
      textField: 'item_text',
      enableCheckAll: false,
      // selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      itemsShowLimit: this.options.length,
      allowSearchFilter: this.ShowFilter,
      defaultOpen: true
    };
    this.myForm = this.fb.group({
      selected: [this.selectedItems]
    });
  }

  onItemSelect(event) {
    this.selectedGroups.emit(
      this.myForm.value.selected
    );
    this.latestSelection.emit(event);
  }

  onItemSelectAll(event) {
    this.selectedGroups.emit(event.map(x => x.item_text));
  }

  // logInfo(dropdownObj) {
  //   dropdownObj.myForm.get('selected').setValues([]);
  //   // .value.selected);
  // }

  toogleShowFilter() {
    this.ShowFilter = !this.ShowFilter;
    this.dropdownSettings = Object.assign({}, this.dropdownSettings, {
      allowSearchFilter: this.ShowFilter
    });
  }

  handleLimitSelection() {
    if (this.limitSelection) {
      this.dropdownSettings = Object.assign({}, this.dropdownSettings, {
        limitSelection: 2
      });
    } else {
      this.dropdownSettings = Object.assign({}, this.dropdownSettings, {
        limitSelection: null
      });
    }
  }
}
