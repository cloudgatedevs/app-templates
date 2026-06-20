import { Component, Injector, OnInit, ViewChild } from '@angular/core';
import { AppComponentBase } from 'src/app/shared/common/app-component-base';

import {
  ChartComponent,
  ApexAxisChartSeries,
  ApexChart,
  ApexXAxis,
  ApexTitleSubtitle,
  ApexPlotOptions,
  NgApexchartsModule,
} from 'ng-apexcharts';
import { initFlowbite } from 'flowbite';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { ThemeService } from 'src/app/core/services/theme.service';

export type ChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  title: ApexTitleSubtitle;
  plotOptions: ApexPlotOptions;
};

@Component({
  selector: 'app-charts-widget1',
  templateUrl: './charts-widget1.component.html',
  styleUrls: ['./charts-widget1.component.scss'],
  standalone: true,
  imports: [NgApexchartsModule, AngularSvgIconModule],
})
export class ChartsWidget1Component extends AppComponentBase implements OnInit {
  @ViewChild('chart') chart!: ChartComponent;
  public chartOptions!: Partial<ChartOptions> | any;

  constructor(injector: Injector, private _themeService: ThemeService) {
    super(injector);
  }

  ngOnInit(): void {
    initFlowbite();
    var labelColor = '#919191';
    const baseColor = '#387af5';
    const secondaryColor = '#2e2e2e';
    const height = 200;
    this.chartOptions = {
      series: [
        {
          name: 'Payments',
          data: [480.88, 320.59, 501.22, 452.78, 610.5, 420.32, 398.99],
        },
      ],
      chart: {
        fontFamily: 'inherit',
        type: 'bar',
        height: height,
        toolbar: {
          show: false,
        },
      },
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: '40%',
          borderRadius: 8,
        },
      },
      legend: {
        show: false,
      },
      dataLabels: {
        enabled: false,
      },
      stroke: {
        show: false,
      },
      xaxis: {
        categories: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        axisBorder: {
          show: false,
        },
        axisTicks: {
          show: false,
        },
        labels: {
          style: {
            colors: labelColor,
            fontSize: '12px',
            fontWeight: 'bold',
          },
        },
      },
      yaxis: {
        show: false,
        labels: {
          show: false,
        },
        axisBorder: {
          show: false,
        },
        axisTicks: {
          show: false,
        },
      },
      fill: {
        opacity: 1,
      },
      grid: {
        show: false,
      },
      tooltip: {
        style: {
          fontSize: '12px',
        },
        y: {
          formatter: function (val: number) {
            return '$' + val;
          },
        },
        x: {
          show: false,
        },
      },
      colors: [baseColor, secondaryColor],
      states: {
        normal: {
          filter: { type: 'none', value: 0 },
        },
        hover: {
          filter: { type: 'lighten', value: 0.2 },
        },
        active: {
          filter: { type: 'darken', value: 0.2 },
          allowMultipleDataPointsSelection: false,
        },
      },
    };
  }
}
