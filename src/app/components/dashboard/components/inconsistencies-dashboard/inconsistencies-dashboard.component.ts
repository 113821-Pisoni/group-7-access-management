import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { DashBoardFilters, graphModel, kpiModel } from "../../../../models/dashboard.model";
import { KpiComponent } from "../../commons/kpi/kpi.component";
import { PiechartComponent } from "../../commons/piechart/piechart.component";
import { DashboardService, dashResponse } from "../../../../services/dashboard.service";
import { BarchartComponent } from "../../commons/barchart/barchart.component";

@Component({
  selector: 'app-inconsistencies-dashboard',
  standalone: true,
  imports: [
    KpiComponent,
    PiechartComponent,
    BarchartComponent
  ],
  templateUrl: './inconsistencies-dashboard.component.html',
  styleUrl: './inconsistencies-dashboard.component.css'
})
export class InconsistenciesDashboardComponent implements OnInit {
  @Input() filters: DashBoardFilters = {} as DashBoardFilters;
  @Output() notifyParent: EventEmitter<string> = new EventEmitter<string>();
  title: string = "inconsistencias";

  kpi1: kpiModel = {
    title: "Inconsistencias en el periodo vs el anterior",
    desc: "Total de inconsistencias en el periodo vs el periodo anterior",
    value: "0",
    icon: "bi-exclamation-circle",
    color: "bg-danger"
  };

  kpi2: kpiModel = {
    title: "Tendencias de inconsistencias",
    desc: "",
    value: "0",
    icon: "",
    color: "bg-success"
  };

  kpi3: kpiModel = {
    title: "Periodo con mayor cantidad",
    desc: "",
    value: "0",
    icon: "bi bi-calendar-event",
    color: "bg-info"
  };

  graph1: graphModel = {
    title: "Totales",
    subtitle: "",
    data: [],
    options: null
  };

  constructor(private dashBoardService: DashboardService) {
    this.initializeGraphOptions();
  }

  ngOnInit(): void {
    this.updateDisplayData();
    this.getData();
  }

  private initializeGraphOptions() {
    this.graph1.options = {
      ...this.columnChartOptions
    };
  }

  private updateDisplayData() {
    const action = this.filters.action === "ENTRY" ? "Ingresos" : "Egresos";
    this.title = `inconsistencias de ${action.toLowerCase()}`;
    this.kpi2.color = this.filters.action === "ENTRY" ? "bg-success" : "bg-danger";
    this.kpi2.desc = `Total de ${action.toLowerCase()} en el periodo vs el periodo anterior`;
    this.graph1.title = `${action} totales`;
  }

  back() {
    this.notifyParent.emit("ALL");
  }

  getData() {
    const showTextEvery = this.filters.group === "WEEK" ? 2 : 
                         (this.filters.group === "MONTH" || this.filters.group === "YEAR" ? 1 : 3);

    this.columnChartOptions.hAxis.showTextEvery = showTextEvery;

    const inconsistenciesFilter = {
      ...this.filters,
      dataType: "INCONSISTENCIES"
    };

    this.dashBoardService.getPeriod(inconsistenciesFilter).subscribe(data => {
      this.graph1.data = mapColumnData(data);
      this.graph1.options = {
        ...this.columnChartOptions
      };

      const totalValue1 = data.reduce((sum, item) => sum + Number(item.value), 0);

      const previousFilter = createPreviousFilter(inconsistenciesFilter);
      this.dashBoardService.getPeriod(previousFilter).subscribe(prevData => {
        const totalValue = prevData.reduce((sum, item) => sum + Number(item.value), 0);
        
        this.kpi1.value = `${totalValue1} / ${totalValue}`;
        
        const kpi2value = this.calculateTrendPercentage(totalValue1, totalValue);
        this.kpi2.value = `${kpi2value.toFixed(2)}%`;
        this.kpi2.icon = kpi2value > 0 ? "bi bi-graph-up" : "bi bi-graph-down";
      });

      const maxValueResponse = data.reduce((max, current) => 
        parseFloat(current.value) > parseFloat(max.value) ? current : max, data[0]);
      
      if (maxValueResponse) {
        this.kpi3.value = maxValueResponse.key;
      }
    });
  }

  private calculateTrendPercentage(current: number, previous: number): number {
    const difference = previous - current;
    return difference / current * 100 === Infinity || 
           isNaN(difference / current * 100) ? 0 : 
           difference / current * 100;
  }

  columnChartOptions = {
    backgroundColor: 'transparent',
    legend: {position: 'none'},
    chartArea: {width: '95%', height: '80%'},
    vAxis: {
      textStyle: {
        color: '#6c757d',
        fontSize: 12
      },
      format: '#',
    },
    colors: ['#FFE08A'],
    hAxis: {
      textStyle: {color: '#6c757d'},
      showTextEvery: 2
    },
    animation: {
      duration: 1000,
      easing: 'out',
      startup: true
    },
    height: 500,
    width: '650',
    bar: {groupWidth: '70%'}
  };
}

function mapColumnData(array: dashResponse[]): [string, number][] {
  return array.map(data => [
    data.key,
    Number(data.value) || 0
  ]);
}

function createPreviousFilter(filters: DashBoardFilters): DashBoardFilters {
  const dateFrom = new Date(filters.dateFrom);
  const dateTo = new Date(filters.dateTo);
  const diffInDays = (dateTo.getTime() - dateFrom.getTime()) / (1000 * 60 * 60 * 24);
  const newDateTo = dateFrom;
  const newDateFrom = new Date(dateFrom);
  newDateFrom.setDate(newDateFrom.getDate() - diffInDays);

  return {
    dateFrom: newDateFrom.toISOString(),
    dateTo: newDateTo.toISOString(),
    action: filters.action,
    group: filters.group,
    type: filters.type,
    dataType: "ALL"
  };
}
