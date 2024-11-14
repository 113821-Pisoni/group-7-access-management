import {AfterViewInit, Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {DashBoardFilters, graphModel, kpiModel} from "../../../../models/dashboard.model";
import {DashboardService, dashResponse} from "../../../../services/dashboard.service";
import {BarchartComponent} from "../../commons/barchart/barchart.component";
import {KpiComponent} from "../../commons/kpi/kpi.component";
import {PiechartComponent} from "../../commons/piechart/piechart.component";
import {VisitorTypeAccessDictionary} from "../../../../models/authorize.model";
import {ChartType} from "angular-google-charts";

@Component({
  selector: 'app-types-dashboard',
  standalone: true,
  imports: [
    BarchartComponent,
    KpiComponent,
    PiechartComponent
  ],
  templateUrl: './types-dashboard.component.html',
  styleUrl: './types-dashboard.component.css'
})
export class TypesDashboardComponent implements OnInit {
  @Input() filters: DashBoardFilters = {} as DashBoardFilters;
  @Output() notifyParent: EventEmitter<string> = new EventEmitter<string>();
  title: string = ""
  typeDictionary = VisitorTypeAccessDictionary;

  //vars
  kpi1: kpiModel = {} as kpiModel
  kpi2: kpiModel = {} as kpiModel
  kpi3: kpiModel = {} as kpiModel

  graph1: graphModel = {} as graphModel

  ngOnInit(): void {
    this.getData()
  }

  constructor(private dashBoardService: DashboardService) {
    this.kpi1 = {title: "Tipo más frecuente", desc: "", value: "0", icon: "bi bi-person-circle", color: "bg-warning"}
    this.kpi2 = {title: "Frecuencia", desc: "", value: "0", icon: "bi bi-graph-up", color: "bg-info"}
    this.kpi3 = {title: "Total de ", desc: "", value: "0", icon: "bi bi-calculator", color: "bg-success"}

    this.graph1 = {title: "Tipos de ingresos", subtitle: "Totales por perdiodo seleccionado", data: [], options: null}
  }


  getData() {
    let action = this.filters.action == "ENTRY" ? "ingresos" : "egresos"
    this.title = action
    this.graph1.title = "Tipos de " + action
    this.graph1.options=this.pieChartOptions
    this.kpi3.title = "Total de " + action
    this.kpi3.icon = this.filters.action == "ENTRY" ? "bi bi-arrow-up-circle" : "bi bi-arrow-down-circle"
    this.kpi3.color = this.filters.action == "ENTRY" ? "bg-success" : "bg-danger"
    this.dashBoardService.getTypes(this.filters).subscribe(data => {
      if (data.length === 0) {
        return undefined;
      }

      let maxValueResponse = data[0];

      if (this.filters.action == "EXIT") {
        for (let i = 1; i < data.length; i++) {
          data[i].value = data[i].secondary_value
        }
      }
      let total = data[0].value

      for (let i = 1; i < data.length; i++) {
        total += data[i].value
        if (parseFloat(data[i].value) > parseFloat(maxValueResponse.value)) {
          maxValueResponse = data[i];
        }
      }

      this.kpi1.value = translateTable(maxValueResponse.key, this.typeDictionary)!;
      this.kpi2.value = ((Number(maxValueResponse.value)/Number(total)) * 100).toFixed(2) + "%";
      this.kpi3.value = total;
      this.graph1.data = mapColumnDataT(data, this.typeDictionary)
    })
  }

  pieChartOptions = {
    backgroundColor: 'transparent',
    legend: {
      position: 'right-center',
      textStyle: { color: '#6c757d', fontSize: 17 }
    },
    chartArea: { width: '100%', height: '100%' },
    pieHole: 0,
    height: 400,
    slices: {
      0: { color: '#fff2cc' },
      1: { color: '#cadefc' },  
      2: { color: '#ffccd7' } ,  
      3: { color: '#99bfbf' },   
      4: { color: '#ddccff' }   
    },
    pieSliceTextStyle: {
      color: 'black',
      fontSize: 18
    }
  };
 
  back() {
    this.notifyParent.emit("ALL");
  }

}

function mapColumnData(array: dashResponse[]): any {
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
