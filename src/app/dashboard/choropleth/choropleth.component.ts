import { Component, Input, OnInit } from '@angular/core';
import Highcharts from 'highcharts/highmaps';
import worldMap from '@highcharts/map-collection/custom/world.geo.json';
import usaMap from '@highcharts/map-collection/countries/us//us-all.geo.json';
import { MapData } from '../map-deck';
// https://www.highcharts.com/docs/maps/map-collection

let mapTypes: { [key: string]: any } = {};

mapTypes.world = worldMap;
mapTypes.usa = usaMap;
@Component({
  selector: 'app-choropleth',
  templateUrl: './choropleth.component.html',
  styleUrls: ['./choropleth.component.scss']
})
export class ChoroplethComponent {
  @Input() mapData?: MapData;
  @Input() waiting: boolean = true;
  Highcharts: typeof Highcharts = Highcharts;
  chartOptions?: Highcharts.Options;

  chartConstructor = 'mapChart';

  ngOnChanges() {
    if (this.mapData) {
      this.chartOptions = {

        chart: {
          map: mapTypes[this.mapData.chart]
        },
        title: {
          text: ''
        },
        mapNavigation: {
          enabled: false,
          buttonOptions: {
            alignTo: 'spacingBox'
          }
        },
        legend: {
          enabled: true
        },
        colorAxis: {
          min: 0
        },
        series: this.mapData.series
      };
    }
  }
}
