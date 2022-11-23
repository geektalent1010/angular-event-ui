import { Component, OnInit, Input } from '@angular/core';
import { ChartsModule } from 'ng2-charts';
import { ChartType, ChartOptions, ChartDataSets } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { DashboardService } from '../dashboard.service';
import evtInfo from '../evt_ids.json';

// import { WEEKS_OUT } from '../mock-data';
var numberFormatter = Intl.NumberFormat();
@Component({
  selector: 'app-weeks-out-chart',
  templateUrl: './weeks-out-chart.component.html',
  styleUrls: ['./weeks-out-chart.component.scss']
})
export class WeeksOutChartComponent implements OnInit {
  title = 'Historical Weeks Out Comparison';
  waiting = true;
  @Input() evt_uids: string[];
  @Input() show_ids: string[];
  // show_id_0: string;
  // evt_uid_1: string;
  // show_id_1: string;
  // evt_uid_2: string;
  // show_id_2: string;
  public chartOptions: ChartOptions & { annotation: any } = {
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
          scaleLabel: {
            labelString: 'Registrants',
            display: true
          }
        }
      ],
      xAxes: [
        {
          id: 'x-axis-0',
          scaleLabel: { labelString: 'Weeks Out', display: true },
          ticks: { padding: 10 }
        }
      ]
    },
    plugins: {
      datalabels: {
        anchor: 'start',
        align: 'start',
        formatter: function(value) {
          return numberFormatter.format(value);
        }
      }
    },
    annotation: {
      annotations: [
        {
          type: 'line',
          mode: 'vertical',
          scaleID: 'x-axis-0',
          value: 'March',
          borderColor: 'orange',
          borderWidth: 2,
          label: {
            enabled: true,
            fontColor: 'orange',
            content: 'LineAnno'
          }
        }
      ]
    }
  };
  public chartType: ChartType = 'bar';
  public chartLegend = true;
  public chartPlugins = [ChartDataLabels];
  public chartData: ChartDataSets[] = [];
  public chartLabels: string[] = [];

  constructor(private service: DashboardService) {}

  ngOnInit(): void {
    this.waiting = true;}
    // let info = evtInfo[this.evt_uid_0];
    // this.show_id_0 = info.show_id_0;
    // this.show_id_1 = info.show_id_1;
    // this.evt_uid_1 = info.evt_uid_1;
    // this.show_id_2 = info.show_id_2;
    // this.evt_uid_2 = info.evt_uid_2;
  ngOnChanges(){
    const rowno = 4;
    const colno = 1;
    let chart_data = [];
    if (this.show_ids && this.evt_uids){
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
        // pos 0: current - 2 years
        // pos 1: current - 1 years
        // pos 2: current year

        for (let i = 0; i < 3; i++) {
          // display if the data series is not empty
          if (results['series'][i.toString()].data.length > 0) {
            chart_data.push({
              ...results['series'][i.toString()],
              type: 'line',
              fill: false
            });
          }
        }
        this.chartLabels = [...Array(results.series['2'].data.length).keys()]
          .reverse()
          .map(x => x.toString());
        this.chartData = chart_data;
        this.waiting = false;
      });
    }}
}
