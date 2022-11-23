import { Component, OnInit, Input, Pipe, PipeTransform } from '@angular/core';
import { Card } from '../card';
import {CommonModule} from "@angular/common";

let moneyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD'
});

@Pipe({ name: 'money' })
export class MoneyPipe implements PipeTransform {
  transform(value: number): number | string {
    return moneyFormatter.format(value);
  }
}

@Component({
  selector: 'app-two-column-info-card',
  templateUrl: './two-column-info-card.component.html',
  styleUrls: ['./two-column-info-card.component.scss']
})
export class TwoColumnInfoCardComponent implements OnInit {
  @Input() card?: Card;
  @Input() waiting: boolean = true;
  @Input() idx: number;
  constructor() {}

  ngOnInit(): void {}
}
