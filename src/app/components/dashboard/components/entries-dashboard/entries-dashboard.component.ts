import { AfterViewInit, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { DashBoardFilters, graphModel, kpiModel } from "../../../../models/dashboard.model";
import { BarchartComponent } from "../../commons/barchart/barchart.component";
import { KpiComponent } from "../../commons/kpi/kpi.component";
import { DashboardService, dashResponse } from "../../../../services/dashboard.service";

@Component({
  selector: 'app-entries-dashboard',
  standalone: true,
  imports: [
    BarchartComponent,
    KpiComponent
  ],
  templateUrl: './entries-dashboard.component.html',
  styleUrl: './entries-dashboard.component.css'
})
export class EntriesDashboardComponent implements OnInit, AfterViewInit {
  @Input() filters: DashBoardFilters = {} as DashBoardFilters;
  @Output() notifyParent: EventEmitter<string> = new EventEmitter<string>();
  title: string = "";

  kpi1: kpiModel;
  kpi2: kpiModel;
  kpi3: kpiModel;
  graph1: graphModel;

  constructor(private dashBoardService: DashboardService) {
    // Inicialización base de KPIs
    this.kpi1 = {
      title: "Totales en el periodo",
      desc: "",
      value: "0",
      icon: "bi bi-arrow-up-circle",
      color: "bg-success"
    };

    this.kpi2 = {
      title: "Promedio diario",
      desc: "",
      value: "0",
      icon: "bi bi-calculator",
      color: "bg-warning"
    };

    this.kpi3 = {
      title: "Periodo más concurrido",
      desc: "",
      value: "0",
      icon: "bi bi-calendar-event",
      color: "bg-info"
    };

    this.graph1 = {
      title: "Ingresos/egresos",
      subtitle: "Totales por periodo seleccionado",
      data: [],
      options: null
    };
  }

  ngOnInit() {
    // Actualizamos los valores iniciales basados en el tipo de acción
    this.updateKpiDisplays();
  }

  ngAfterViewInit(): void {
    this.getData();
  }

  private updateKpiDisplays() {
    const isEntry = this.filters?.action === "ENTRY";
    const action = isEntry ? "Ingresos" : "Egresos";
    
    this.title = action;
    this.graph1.title = `${action} totales`;
    this.kpi1.title = `${action} totales`;
    this.kpi1.icon = isEntry ? "bi bi-arrow-up-circle" : "bi bi-arrow-down-circle";
    this.kpi1.color = isEntry ? "bg-success" : "bg-danger";
  }

  getData() {
    this.updateKpiDisplays();

    this.columnChartOptions.hAxis.showTextEvery = this.filters.group === "WEEK" ? 2 : 
      (this.filters.group === "MONTH" || this.filters.group === "YEAR" ? 1 : 3);

    this.dashBoardService.getPeriod(this.filters).subscribe(data => {
      this.graph1.data = mapColumnData(data);
      this.graph1.options = {
        ...this.columnChartOptions,
        colors: [this.filters.action === 'ENTRY' ? '#8DDFDF' : '#FFA8B4']
      };

      const totalValue1 = data.reduce((sum, item) => sum + Number(item.value), 0);
      this.kpi2.value = (totalValue1 / data.length).toFixed(2);
      this.kpi1.value = totalValue1.toString();

      const maxValueResponse = data.reduce((max, item) => 
        parseFloat(item.value) > parseFloat(max.value) ? item : max, data[0]);
      
      if (maxValueResponse) {
        this.kpi3.value = maxValueResponse.key;
      }
    });
  }

  columnChartOptions = {
    backgroundColor: 'transparent',
    legend: { position: 'none' },
    chartArea: { width: '100%', height: '90%' },
    vAxis: {
      textStyle: {
        color: '#6c757d',
        fontSize: 12
      },
      format: '#',
    },
    hAxis: {
      textStyle: { color: '#6c757d' },
      showTextEvery: 2
    },
    animation: {
      duration: 1000,
      easing: 'out',
      startup: true
    },
    height: 400,
    width: 650,
    bar: { groupWidth: '70%' }
  };

  back() {
    this.notifyParent.emit("ALL");
  }
}

function mapColumnData(array: dashResponse[]): [string, number][] {
  return array.map(data => [
    data.key,
    Number(data.value) || 0
  ]);
}