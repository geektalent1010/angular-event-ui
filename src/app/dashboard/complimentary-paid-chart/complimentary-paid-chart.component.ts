import { Component, OnInit, Input } from '@angular/core';
import { ChartsModule } from 'ng2-charts';
import { ChartType, ChartOptions, ChartDataSets } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { DashboardService } from '../dashboard.service';
import { COMPLIMENTARY_PAID_DATA } from '../mock-data';

import evtInfo from '../evt_ids.json';
var numberFormatter = Intl.NumberFormat();

@Component({
  selector: 'app-complimentary-paid-chart',
  templateUrl: './complimentary-paid-chart.component.html',
  styleUrls: ['./complimentary-paid-chart.component.scss']
})
export class ComplimentaryPaidChartComponent implements OnInit {
  title = 'Historical Complimentary vs Paid Comparison';
  waiting = true;
  @Input() evt_uids: string[];
  @Input() show_ids: string[];
  // @Input() evt_uid_0: string;
  // show_id_0: string;
  // evt_uid_1: string;
  // show_id_1: string;
  // evt_uid_2: string;
  // show_id_2: string;
  public barChartOptions: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    legend: {
      position: 'bottom'
    },
    scales: {
      yAxes: [
        {
          id: 'y-axis-0',
          position: 'left',
          ticks: {
            callback: function(label, index, labels) {
              return numberFormatter.format(parseFloat(label.toString()));
            }
          },
          scaleLabel: {
            labelString: 'Registrants',
            display: true
          }
        }
      ]
    },
    plugins: {
      datalabels: {
        anchor: 'center',
        align: 'center',
        font: { weight: 'bold' },
        formatter: function(value) {
          return numberFormatter.format(value);
        }
      }
    }
  };
  public barChartType: ChartType = 'bar';
  public barChartLegend = true;
  public barChartPlugins = [ChartDataLabels];
  public barChartData: ChartDataSets[] = [];
  public barChartLabels: string[] = [];

  constructor(private service: DashboardService) {}

  ngOnInit(): void {
    this.waiting = true;
  }

  ngOnChanges(): void {
    const rowno = 3;
    const colno = 2;
    if (this.show_ids && this.evt_uids) {
      // let info = evtInfo[this.evt_uid_0];
      // this.show_id_0 = info.show_id_0;
      // this.show_id_1 = info.show_id_1;
      // this.evt_uid_1 = info.evt_uid_1;
      // this.show_id_2 = info.show_id_2;
      // this.evt_uid_2 = info.evt_uid_2;

      let chart_data = JSON.parse(JSON.stringify(COMPLIMENTARY_PAID_DATA));
      this.service
        .getChartData(
          this.show_ids[0],
          this.evt_uids[0],
          this.show_ids[1],
          this.evt_uids[1],
          this.show_ids[2],
          this.evt_uids[2],
          rowno,
          colno
        )
        .subscribe(results => {
          let series1 = { ...results['series1'] };
          let series2 = { ...results['series2'] };
          let labels = [...results['labels']];
          // remove entries for the year where both values are 0
          for (let i = 0; i < 3; i++) {
            if (series1.data[i] == 0 && series2.data[i] == 0) {
              if (i == 0) {
                series1.data = series1.data.slice(1);
                series2.data = series2.data.slice(1);

                labels = labels.slice(1);
              } else {
                series1.data = series1.data
                  .slice(0, i)
                  .concat(series1.data.slice(i + 1));
                series2.data = series2.data
                  .slice(0, i)
                  .concat(series2.data.slice(i + 1));
                labels = labels.slice(0, i).concat(labels.slice(i + 1));
              }
            }
          }

          chart_data.data = [series1, series2];
          chart_data.labels = labels;

          this.barChartData = chart_data.data;
          this.barChartLabels = chart_data.labels;
          this.waiting = false;
        });
    }
  }
}
