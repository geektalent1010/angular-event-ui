import { Component, OnInit, Input } from '@angular/core';
import { Snapshot } from '../snapshot';

@Component({
  selector: 'app-snapshot',
  templateUrl: './snapshot.component.html',
  styleUrls: ['./snapshot.component.scss']
})
export class SnapshotComponent implements OnInit {
  @Input() snapshot?: Snapshot;
  @Input() waiting: boolean = true;
  @Input() timeRange = 4;
  @Input() idx: number;
  constructor() {}

  ngOnInit(): void {}
}
