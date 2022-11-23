import {
  Component,
  Input,
  Output,
  EventEmitter,
  ViewChild
} from '@angular/core';

@Component({
  selector: 'app-dropdown-basic',
  templateUrl: './dropdown-basic.component.html',
  styleUrls: ['./dropdown-basic.component.scss']
})
export class DropdownBasicComponent {
  @Input() options;
  @Output() change = new EventEmitter<any[]>();
  @Output() latestSelection = new EventEmitter<any>();
  @Input() isFirstColumn = false;

  @Output() hoverFirstColumn = new EventEmitter<any>();
  @Output() removeAndCond = new EventEmitter<any>();

  @ViewChild('toggle') tgl;

  data: any[] = [];
  // over(event) {
  over(option) {
    if (this.isFirstColumn) {
      // this.hoverFirstColumn.emit(event.target.attributes.id.value);
      this.hoverFirstColumn.emit(option.id);
    }
  }
  out() {
    if (this.isFirstColumn) {
      this.hoverFirstColumn.emit(-1);
    }
  }
  check(option) {
    if (option) {
      if (option.checked) {
        this.removeAndCond.emit(option.id);
        this.over(option);
      }
      option.checked = !option.checked;
    }
    this.data = this.options
      .filter((x: any) => x.checked)
      .map(x => {
        return { id: x.id, label: x.label };
      });
    this.change.emit(this.data);
    this.latestSelection.emit(option);
  }
}
