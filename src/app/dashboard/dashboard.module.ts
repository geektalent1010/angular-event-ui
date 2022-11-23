import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  DashboardComponent,
  DashboardDropdownComponent
} from './dashboard/dashboard.component';
import { CarouselComponent } from './carousel/carousel.component';
import { ChoroplethComponent } from './choropleth/choropleth.component';
import { ComplimentaryPaidChartComponent } from './complimentary-paid-chart/complimentary-paid-chart.component';
import { RegistrationSalesChartComponent } from './registration-sales-chart/registration-sales-chart.component';
import { SnapshotComponent } from './snapshot/snapshot.component';
import {
  NgbdSortableHeader,
  TopNTableComponent
} from './top-n-table/top-n-table.component';
import {
  TwoColumnInfoCardComponent,
  MoneyPipe
} from './two-column-info-card/two-column-info-card.component';
import { WeeksOutChartComponent } from './weeks-out-chart/weeks-out-chart.component';
import { DashboardService } from './dashboard.service';
import { ChartsModule } from 'ng2-charts';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HighchartsChartModule } from 'highcharts-angular';
@NgModule({
  declarations: [
    DashboardComponent,
    DashboardDropdownComponent,
    CarouselComponent,
    ChoroplethComponent,
    ComplimentaryPaidChartComponent,
    RegistrationSalesChartComponent,
    SnapshotComponent,
    NgbdSortableHeader,
    TopNTableComponent,
    TwoColumnInfoCardComponent,
    WeeksOutChartComponent,
    MoneyPipe
  ],
  exports: [DashboardComponent],
  imports: [
    CommonModule,
    ChartsModule,
    FormsModule,
    ReactiveFormsModule,
    NgbModule,
    HighchartsChartModule
  ],
  providers: [DashboardService, MoneyPipe]
})
export class DashboardModule {}
