import { AfterViewInit, Component, inject, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { AccessHourlyDashboardComponent } from '../../accesses/access-hourly-dashboard/access-hourly-dashboard.component';
import { AccessWeeklyDashboardComponent } from '../../accesses/access-weekly-dashboard/access-weekly-dashboard.component';
import { AccessPieDashboardComponent } from '../../accesses/access-pie-dashboard/access-pie-dashboard.component';
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MainContainerComponent } from "ngx-dabd-grupo01";
import { AccessService } from "../../../services/access.service";
import { NgbModal, NgbPopover } from '@ng-bootstrap/ng-bootstrap';
import { GoogleChartsModule } from "angular-google-charts";
import { KpiComponent } from "../commons/kpi/kpi.component";
import { DashBoardFilters, DashboardStatus } from "../../../models/dashboard.model";
import { MainDashboardComponent } from "../components/main-dashboard/main-dashboard.component";
import { EntriesDashboardComponent } from "../components/entries-dashboard/entries-dashboard.component";
import { LateDashboardComponent } from "../components/late-dashboard/late-dashboard.component";
import { TypesDashboardComponent } from "../components/types-dashboard/types-dashboard.component";
import { InconsistenciesDashboardComponent } from "../components/inconsistencies-dashboard/inconsistencies-dashboard.component";
import { BarchartComponent } from "../commons/barchart/barchart.component";
import { NgClass } from "@angular/common";

@Component({
  selector: 'app-general-dashboards',
  standalone: true,
  imports: [
    AccessHourlyDashboardComponent, 
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
    NgbPopover,
    BarchartComponent
  ],
  templateUrl: './general-dashboards.component.html',
  styleUrl: './general-dashboards.component.css'
})
export class GeneralDashboardsComponent implements OnInit, AfterViewInit {
  // Objeto para almacenar los filtros activos del dashboard
  filters: DashBoardFilters = {} as DashBoardFilters;

  // Controla qué vista del dashboard se muestra actualmente
  status: DashboardStatus = DashboardStatus.All;

  // Servicio para gestionar ventanas modales
  modalService = inject(NgbModal);

  // Referencias a los componentes del dashboard para actualización de datos
  @ViewChild(MainDashboardComponent) main!: MainDashboardComponent;
  @ViewChild(EntriesDashboardComponent) entries!: EntriesDashboardComponent;
  @ViewChild(LateDashboardComponent) late!: LateDashboardComponent;
  @ViewChild(TypesDashboardComponent) types!: TypesDashboardComponent;
  @ViewChild(InconsistenciesDashboardComponent) inconsistencies!: InconsistenciesDashboardComponent;
  @ViewChild(BarchartComponent) barchartComponent!: BarchartComponent;
  @ViewChild('infoModal') infoModal!: TemplateRef<any>;

  constructor(private accessService: AccessService) {}

  // Configura las fechas iniciales para el filtro de período
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

  // Abre el modal con información sobre el uso del dashboard
  onInfoButtonClick() {
    this.modalService.open(this.infoModal, { size: 'lg' });
  }

  // Restaura los filtros a sus valores predeterminados
  resetFilters() {
    this.initializeDefaultDates();
    this.filters.type = "";
    this.filters.group = "DAY"
    this.filters.action = "ENTRY"
    this.filterData()
  }

  // Actualiza los datos en todos los componentes del dashboard
  filterData() {
    this.main?.getData();
    this.entries?.getData();
    this.types?.getData();
    this.inconsistencies?.getData();
    this.late?.getData();
  }

  // Se ejecuta al inicializar el componente
  ngOnInit(): void {
    // La inicialización principal se realiza en ngAfterViewInit
  }

  // Gestiona los cambios entre diferentes vistas del dashboard
  changeMode(event: any) {
    const statusKey = Object.keys(DashboardStatus).find(key => 
      DashboardStatus[key as keyof typeof DashboardStatus] === event
    );

    if (statusKey) {
      this.status = DashboardStatus[statusKey as keyof typeof DashboardStatus];
    } else {
      console.error('Valor no válido para el enum');
    }

    this.types?.getData();
  }

  // Expone el enum DashboardStatus para uso en el template
  protected readonly DashboardStatus = DashboardStatus;

  // Inicializa el componente después de que la vista está lista
  ngAfterViewInit(): void {
    this.initializeDefaultDates();
    this.filterData()
  }

  // Obtiene la fecha y hora actual en formato ISO para los inputs datetime-local
  getCurrentDateTime(): string {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  }
}