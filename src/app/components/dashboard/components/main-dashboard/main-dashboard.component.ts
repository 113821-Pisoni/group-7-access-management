import {AfterViewInit, Component, EventEmitter, Input, OnInit, Output, output} from '@angular/core';
import {DashBoardFilters, graphModel, kpiModel} from "../../../../models/dashboard.model";
import {KpiComponent} from "../../commons/kpi/kpi.component";
import {DashboardService, dashResponse} from "../../../../services/dashboard.service";
import {BarchartComponent} from "../../commons/barchart/barchart.component";
import {PiechartComponent} from "../../commons/piechart/piechart.component";
import {VisitorTypeAccessDictionary} from "../../../../models/authorize.model";
import {ChartType} from "angular-google-charts";

@Component({
  selector: 'app-main-dashboard',
  standalone: true,
  imports: [
    KpiComponent,
    BarchartComponent,
    PiechartComponent
  ],
  templateUrl: './main-dashboard.component.html',
  styleUrl: './main-dashboard.component.css'
})
export class MainDashboardComponent implements AfterViewInit{
  //inputs
  @Input() filters: DashBoardFilters = {} as DashBoardFilters;
  @Output() notifyParent: EventEmitter<string> = new EventEmitter<string>();
  typeDictionary = VisitorTypeAccessDictionary;

  //vars
  kpi1: kpiModel = {} as kpiModel
  kpi2: kpiModel = {} as kpiModel
  kpi3: kpiModel = {} as kpiModel
  kpi4: kpiModel = {} as kpiModel

  graph1: graphModel = {} as graphModel
  graph2: graphModel = {} as graphModel
  graph3: graphModel = {} as graphModel
  graph4: graphModel = {} as graphModel


  //redirect
  sendNotification(mode: string) {
    this.notifyParent.emit(mode);
  }
  //init
  constructor(private dashBoardService: DashboardService) {
    this.kpi1 = {title: "Totales de en el Periodo Actual vs. Anterior", desc: "Suma total en el periodo actual vs. anterior", value: "0", icon: "", color: "bg-success"}
    this.kpi2 = {title: "Tendencia de", desc: "Diferencias porcentuales respecto al periodo anterior", value: "0%", icon: "bi bi-graph-up", color: "bg-info"}
    this.kpi3 = {title: "Tipo de Ingreso/Egreso Más Frecuente", desc: "Tipo más frecuente en el periodo", value: "0", icon: "bi bi-person-circle", color: "bg-warning"}
    this.kpi4 = {title: "Total de Ingresos/Egresos Inconsistentes", desc: "Cantidad total de inconsistencias en el periodo", value: "0", icon: "bi-exclamation-circle", color: "bg-danger"}

    this.graph1 = {title: "Totales de Ingresos/Egresos por Periodo", subtitle: "Comparativa total por el periodo seleccionado", data: [], options: null}
    this.graph2 = {title: "Empleados con Egreso Tardío", subtitle: "Cantidad de trabajadores con egresos tardíos", data: [], options: null}
    this.graph3 = {title: "Distribución de Tipos de Ingresos/Egresos", subtitle: "Porcentaje de cada tipo en el periodo", data: [], options: null}
    this.graph4 = {title: "Inconsistencias en Ingresos/Egresos", subtitle: "Ingresos/egresos con inconsistencias en el periodo", data: [], options: null}
  }

  //getData
  getData() {
    console.log(this.filters)
    let action = this.filters.action == "ENTRY" ? "Ingresos" : "Egresos"
    this.kpi1.icon = this.filters.action == "ENTRY" ? "bi bi-arrow-up-circle" : "bi bi-arrow-down-circle"
    this.kpi1.color = this.filters.action == "ENTRY" ? "bg-success" : "bg-danger"
    this.kpi1.title = "Totales de " + action + " en el Periodo Actual vs. Anterior"
    this.kpi2.title = "Tendencias de " + action.toLowerCase()
    this.kpi1.desc = "Suma total de " + action.toLowerCase() + " en el periodo actual vs. anterior"
    this.kpi4.title = "Total de " + action.toLowerCase() + " Inconsistentes"
    this.kpi4.desc = "Cantidad total de inconsistencias en " + action.toLowerCase() + " durante el periodo"
    this.kpi3.desc = "Tipo de " + action.toLowerCase() + " más frecuente en el periodo"
    this.kpi3.title = "Tipo de " + action.toLowerCase() + " Más Frecuente"
    this.graph1.title = "Totales de " + action + " por Periodo"
    this.graph3.title = "Distribución de Tipos de " + action
    this.graph3.subtitle = "Porcentaje de cada tipo de " + action.toLowerCase()
    this.graph4.title = "Inconsistencias en " + action
    this.graph4.subtitle = action + " con Inconsistencias"


    this.graph4.options = {...this.columnChartOptions,
      colors: ['#ffc107']}
    this.graph4.options.chartArea.width='95%';
    this.graph4.options.width = 900;
    this.graph4.options.height = 175;

    this.graph3.options = this.pieChartOptions

    this.graph2.options = {...this.columnChartOptions,
      colors: ['#ffc107']}
    this.graph2.options.width = null;
    this.graph2.options.height = 200;

    //obtener filtro
    this.dashBoardService.getPeriod(this.filters).subscribe(data => {
      this.graph1.data = mapColumnData(data)
      this.graph1.options = {...this.columnChartOptions,
        colors: [this.filters.action == 'ENTRY' ? '#40916c' : '#9d0208']}
      this.graph1.options.height = 500
      let totalValue1 = 0;
      data.forEach(item => {
        totalValue1 += Number(item.value);
      });

      let previousFilter = createPreviousFilter(this.filters)
      this.dashBoardService.getPeriod(previousFilter).subscribe(data => {
        let totalValue = 0;
        data.forEach(item => {
          totalValue += Number(item.value);
        });

        this.kpi1.value = totalValue1.toString() + " vs " + totalValue.toString();
        let kpi2value = ((totalValue - totalValue1 )/ totalValue1) * 100
        this.kpi2.value = kpi2value.toFixed(2) + "%";
        this.kpi2.icon = kpi2value > 0 ? "bi bi-graph-up" : "bi bi-graph-down"
      })
    })
    //obtener tipos
    this.dashBoardService.getTypes(this.filters).subscribe(data => {
      if (data.length === 0) {
        return undefined;
      }

      // Buscar el objeto con el valor más alto
      let maxValueResponse = data[0];

      if (this.filters.action == "EXIT"){
        for (let i = 1; i < data.length; i++) {
          data[i].value = data[i].secondary_value
        }
      }

      for (let i = 1; i < data.length; i++) {
        if (parseFloat(data[i].value) > parseFloat(maxValueResponse.value)) {
          maxValueResponse = data[i];
        }
      }

      this.kpi3.value = translateTable(maxValueResponse.key, this.typeDictionary)!.toString();
      this.graph3.data = mapColumnDataT(data,this.typeDictionary)
    })

    let inconsistenciesFilter = {...this.filters}
    inconsistenciesFilter.dataType= "INCONSISTENCIES"
    this.dashBoardService.getPeriod(inconsistenciesFilter).subscribe(data => {
      let totalValue1 = 0;
      data.forEach(item => {
        totalValue1 += Number(item.value);
      });
      this.kpi4.value = totalValue1.toString()
      this.graph4.data = mapColumnData(data)
    })

    inconsistenciesFilter.dataType= "LATE"
    inconsistenciesFilter.action= ""
    this.dashBoardService.getPeriod(inconsistenciesFilter).subscribe(data => {
      this.graph2.data = mapColumnData(data)
    })

  }


  columnChartOptions = {
    backgroundColor: 'transparent',
    legend: {position: 'none'},
    chartArea: {width: '80%', height: '60%'},
    vAxis: {
      textStyle: {
        color: '#6c757d',
        fontSize: 12  // Tamaño de fuente más pequeño
      },
      // Formato personalizado para mostrar los valores en miles
      format: '#',
    },
    hAxis: {
      textStyle: {color: '#6c757d'},
    },
    animation: {
      duration: 1000,
      easing: 'out',
      startup: true
    },
    height: 400,
    width: '100%',
    bar: {groupWidth: '70%'}
  };

  pieChartOptions = {
    backgroundColor: 'transparent',
    legend: {
      position: 'right-center',
      textStyle: { color: '#6c757d', fontSize: 17 }
    },
    chartArea: { width: '100%', height: '100%' },
    pieHole: 0,
    height: '80%',
    slices: {
      0: { color: '#00BFFF' },  // MP siempre azul
      1: { color: '#8A2BE2' },  // STRIPE siempre violeta
      2: { color: '#ACE1AF' }   // EFECTIVO siempre verde
    },
    pieSliceTextStyle: {
      color: 'black',
      fontSize: 18
    }
  };

  ngAfterViewInit(): void {
    this.getData()
  }
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

function mapColumnData(array:dashResponse[]) : any{
  return array.map(data => [
    data.key,
    data.value || 0
  ]);
}

function translateTable(value: any, dictionary: { [key: string]: any }) {
  if (value !== undefined && value !== null) {
    for (const key in dictionary) {
      if (dictionary[key] === value) {
        return key;
      }
    }
  }
  console.log("Algo salio mal.");
  return;
}

function mapColumnDataT(array:dashResponse[], dictionary:any ) : any{
  return array.map(data => [
    translateTable(data.key, dictionary),
    data.value || 0
  ]);
}

