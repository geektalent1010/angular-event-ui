import { Component, OnInit, Input } from '@angular/core';
import { ChartsModule } from 'ng2-charts';
import { ChartType, ChartOptions, ChartDataSets } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { DashboardService } from '../dashboard.service';
import { REGISTRATION_SALES_DATA } from '../mock-data';
import evtInfo from '../evt_ids.json';
var moneyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0
});
var numberFormatter = new Intl.NumberFormat();
@Component({
  selector: 'app-registration-sales-chart',
  templateUrl: './registration-sales-chart.component.html',
  styleUrls: ['./registration-sales-chart.component.scss']
})
export class RegistrationSalesChartComponent implements OnInit {
  title = 'Historical Registration & Sales Comparison';
  waiting = true;
  // @Input() evt_uid_0: string;
  @Input() evt_uids: string[];
  @Input() show_ids: string[];
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
              if (parseFloat(label.toString()) > 1000) {
                return `${parseFloat(label.toString()) / 1000}` + 'k';
              } else {
                return label;
              }
            }
          },
          scaleLabel: {
            labelString: 'Registrants',
            display: true
          }
        },
        {
          id: 'y-axis-1',
          position: 'right',
          ticks: {
            callback: function(label, index, labels) {
              return  `${moneyFormatter.format(parseFloat(label.toString()) / 1000)}` + 'k';
            }
          },
          scaleLabel: {
            labelString: 'Sales',
            display: true
          }
        }
      ]
    },
    plugins: {
      datalabels: {
        align: function(context) {
          return context.datasetIndex == 1 ? 'end' : 'right';
        },
        offset: function(context) {
          return context.datasetIndex == 1 ? 5 : 1;
        },

        anchor: function(context) {
          return context.datasetIndex == 1 ? 'start' : 'center'; // display labels with an odd index
        },

        font: { weight: 'bold' },
        formatter: function(value, context) {
          if (context.datasetIndex == 0) {
            return moneyFormatter.format(value);
          } else {
            return numberFormatter.format(value);
          }
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
  ngOnChanges(){
    if (this.show_ids && this.evt_uids){
    const rowno = 3;
    const colno = 1;
    // let info = evtInfo[this.evt_uid_0]
    // this.show_id_0 = info.show_id_0;
    // this.show_id_1 = info.show_id_1;
    // this.evt_uid_1 = info.evt_uid_1;
    // this.show_id_2 = info.show_id_2;
    // this.evt_uid_2 = info.evt_uid_2;

    let chart_data = JSON.parse(JSON.stringify(REGISTRATION_SALES_DATA));
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
        // remove entries for the year where both values are 0
        let series1 = { ...results['series1'] };
        let series2 = { ...results['series2'] };
        let labels = [...results['labels']];
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

        chart_data.data = [
          {
            ...series1,
            type: 'line',
            yAxisID: 'y-axis-1',
            fill: false
          },
          {
            ...series2,
            stack: 'a'
          }
        ];
        this.barChartData = chart_data.data;
        this.barChartLabels = labels;
        this.waiting = false;
      });
    }}
}
