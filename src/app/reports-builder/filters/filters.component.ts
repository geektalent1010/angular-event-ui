import {
  Host,
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  ViewChildren,
  QueryList,
  Directive,
  ElementRef,
  OnChanges,
  SimpleChanges
} from '@angular/core';
import { ReportsService } from '../reports.service';
import { DropdownBasicComponent } from '../dropdown-basic/dropdown-basic.component';
import { CommonModule } from '@angular/common';
import { ReportsComponent } from '../reports/reports.component';
// @Directive({
//   selector: '[appHighlight]'
// })
// export class HighlightDirective
// {
// // implements OnInit, OnChanges {
//   el: ElementRef;
//   private host: FiltersComponent;
//   @Input() appHighlight = '';
//   constructor(el: ElementRef, host: FiltersComponent) {
//     this.el = el;
//     this.host = host;
//   }
//   update(firstColId: number): void {
//     console.log('logging from update');
//     console.log(firstColId);
//     console.log(this.el);
//     // if (
//     //   this.host.col1Selection == this.el.nativeElement.
//     // ) {
//     //   this.el.nativeElement.style.backgroundColor = 'yellow';
//     // } else {
//     //   this.el.nativeElement.style.backgroundColor = '';
//     // }
//   }
//   // ngOnInit(): void {
//   //   this.update();
//   // }
//   // ngOnChanges(changes: SimpleChanges) {
//   //   console.log(changes);
//   // }
// }

@Component({
  selector: 'app-filters',
  templateUrl: './filters.component.html',
  styleUrls: ['./filters.component.scss']
})
export class FiltersComponent implements OnInit {
  @Input() selectedGroupsFunction;
  @Input() latestSelectionFunction;
  @Input() secondColumnFunction;
  @Input() options;
  @Input() id;
  @Input() removeButton = false;
  @Input() showFilterValues = false;
  @Input() parent;
  @Output() removeSectionId = new EventEmitter<any>();
  @Output() removeAndCond = new EventEmitter<any>();
  @Output() newBlock = new EventEmitter<any>();
  @Output() hoveredCol1 = new EventEmitter<any>();
  // highlightedRegCodes = [];
  // @ViewChildren(HighlightDirective)
  // directives: QueryList<HighlightDirective>;

  @ViewChildren(DropdownBasicComponent) dropdownList: QueryList<
    DropdownBasicComponent
  >;
  selectedFields = [];
  lastSelectedField: any;
  selectedGroups = [];
  lastSelectedGroup: any;
  secondColValues = [];
  thirdColValues = [];
  col1Selection = -1;
  showAddCondition = false;

  constructor(
    private reportsService: ReportsService // @Host() parent: ReportsComponent,
  ) {}

  ngOnInit(): void {
    this.thirdColValues = this.options
      .filter(x => x.checked)
      .map(x => {
        return { firstColId: x.id, text: x.label };
      });
  }

  hoverFirstColumnUpdate(event) {
    this.col1Selection = event;
    this.hoveredCol1.emit({
      blockId: this.id,
      firstColInd: event,
      filterObj: this
    });
  }
  update() {
    this.secondColumnFunction(this, this.lastSelectedGroup.label);
    if (this.dropdownList.length > 1) {
      this.dropdownList.last.options.forEach(x => (x.checked = false));
      this.dropdownList.last.check(false);
    }
  }

  updateCondtion():boolean{
    this.showAddCondition = this.dropdownList.last.options.filter(x => x.checked).length > 0;
    return this.showAddCondition;
  }

  updateThirdCol() {
    if (this.showFilterValues) {
      console.log('secondColValues', this.dropdownList.last.options.filter(x => x.checked).length > 0);
      if (this.dropdownList.last.options.filter(x => x.checked).length > 0) {
        let secondColSelections = this.dropdownList.last.options.filter(
          x => x.checked
        );
        let secondColText = secondColSelections.map(x => x.label).join(', ');
        let textData = `${this.lastSelectedGroup.label} IN ${secondColText}`;
        this.thirdColValues.push({
          firstColId: this.lastSelectedGroup.id,
          text: textData
        });
        this.newBlock.emit({
          orBlockId: this.id,
          type: 'filter',
          data: this.thirdColValues,
          saveData: {
            firstColSelection: this.lastSelectedGroup.id,
            secondColSelection: secondColSelections.map(x => x.id)
          }
        });
      }
    }
  }

  removeOrBlock() {
    this.removeSectionId.emit(this.id);
  }
  updateParentToRemove(event) {
    this.removeAndCond.emit({ blockId: this.id, firstColId: event });
  }
}
