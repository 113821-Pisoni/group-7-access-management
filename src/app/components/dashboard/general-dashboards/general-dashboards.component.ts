import {AfterViewInit, Component, inject, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {AccessHourlyDashboardComponent} from '../../accesses/access-hourly-dashboard/access-hourly-dashboard.component';
import {AccessWeeklyDashboardComponent} from '../../accesses/access-weekly-dashboard/access-weekly-dashboard.component';
import {AccessPieDashboardComponent} from '../../accesses/access-pie-dashboard/access-pie-dashboard.component';
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {MainContainerComponent} from "ngx-dabd-grupo01";
import {AccessService} from "../../../services/access.service";
import {NgbModal, NgbPopover} from '@ng-bootstrap/ng-bootstrap';
import {GoogleChartsModule} from "angular-google-charts";
import {KpiComponent} from "../commons/kpi/kpi.component";
import {DashBoardFilters, DashboardStatus} from "../../../models/dashboard.model";
import {MainDashboardComponent} from "../components/main-dashboard/main-dashboard.component";
import {EntriesDashboardComponent} from "../components/entries-dashboard/entries-dashboard.component";
import {LateDashboardComponent} from "../components/late-dashboard/late-dashboard.component";
import {TypesDashboardComponent} from "../components/types-dashboard/types-dashboard.component";
import {
  InconsistenciesDashboardComponent
} from "../components/inconsistencies-dashboard/inconsistencies-dashboard.component";
import {BarchartComponent} from "../commons/barchart/barchart.component";
import {NgClass} from "@angular/common";

@Component({
  selector: 'app-general-dashboards',
  standalone: true,
  imports: [AccessHourlyDashboardComponent, 
    AccessWeeklyDashboardComponent, 
    AccessPieDashboardComponent, 
    ReactiveFormsModule, 
    FormsModule, 
    MainContainerComponent, 
    GoogleChartsModule, 
    KpiComponent, 
    MainDashboardComponent, 
    EntriesDashboardComponent, 
    LateDashboardComponent, 
    TypesDashboardComponent, 
    InconsistenciesDashboardComponent, 
    NgClass, 
    NgbPopover],
  templateUrl: './general-dashboards.component.html',
  styleUrl: './general-dashboards.component.css'
})
export class GeneralDashboardsComponent implements OnInit, AfterViewInit{
  //filters
  filters:DashBoardFilters = {} as DashBoardFilters

  //dashboard settings
  status: DashboardStatus = DashboardStatus.All;


  //services
  modalService = inject(NgbModal);


  //Childs
  @ViewChild(MainDashboardComponent) main!: MainDashboardComponent;
  @ViewChild(EntriesDashboardComponent) entries!: EntriesDashboardComponent;
  @ViewChild(LateDashboardComponent) late!: LateDashboardComponent;
  @ViewChild(TypesDashboardComponent) types!: TypesDashboardComponent;
  @ViewChild(InconsistenciesDashboardComponent) inconsistencies!: InconsistenciesDashboardComponent;


  @ViewChild(BarchartComponent) barchartComponent!: BarchartComponent;

  @ViewChild('infoModal') infoModal!: TemplateRef<any>

  constructor(
    private accessService: AccessService) {
  }

  initializeDefaultDates() {
    this.filters.group = "DAY";
    this.filters.type = "";
    this.filters.action = "ENTRY";
    
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    this.filters.dateTo = now.toISOString().slice(0, 16);

    now.setDate(now.getDate() - 14);
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    this.filters.dateFrom = now.toISOString().slice(0, 16);
  }

  onInfoButtonClick() {
   this.modalService.open(this.infoModal, { size: 'lg' });
  }

  resetFilters(){
    this.initializeDefaultDates();
    this.filters.type = "";
    this.filters.group = "DAY"
    this.filters.action = "ENTRY"
    this.filterData()
  }

  filterData() {
    // Validar que dateTo no sea futuro
    const now = new Date();
    const selectedDateTo = new Date(this.filters.dateTo);
    
    if (selectedDateTo > now) {
      this.filters.dateTo = now.toISOString().slice(0, 16);
    }

    this.main.getData();
    this.entries.getData();
    this.types.getData();
    this.inconsistencies.getData();
    this.late.getData();
  }

  getMaxDate(): string {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  }

  ngOnInit(): void {
  }

  changeMode(event: any){
    const statusKey = Object.keys(DashboardStatus).find(key => DashboardStatus[key as keyof typeof DashboardStatus] === event);

    if (statusKey) {
      this.status = DashboardStatus[statusKey as keyof typeof DashboardStatus];
    } else {
      console.error('Valor no válido para el enum');
    }

    this.types.getData()
  }



  protected readonly DashboardStatus = DashboardStatus;

  ngAfterViewInit(): void {
    this.initializeDefaultDates();
    this.filterData()
  }

  getCurrentDateTime(): string {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  }
}
