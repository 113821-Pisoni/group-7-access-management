import { AfterViewInit, Component, inject, OnInit, TemplateRef, ViewChild, ChangeDetectorRef } from '@angular/core';
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
export class GeneralDashboardsComponent implements OnInit {
  // Inicialización inmediata de filtros con valores por defecto
  filters: DashBoardFilters = {
    group: "DAY",
    type: "",
    action: "ENTRY",
    dateFrom: "",
    dateTo: "",
    dataType: "ALL"
  };

  status: DashboardStatus = DashboardStatus.All;
  modalService = inject(NgbModal);

  @ViewChild(MainDashboardComponent) main!: MainDashboardComponent;
  @ViewChild(EntriesDashboardComponent) entries!: EntriesDashboardComponent;
  @ViewChild(LateDashboardComponent) late!: LateDashboardComponent;
  @ViewChild(TypesDashboardComponent) types!: TypesDashboardComponent;
  @ViewChild(InconsistenciesDashboardComponent) inconsistencies!: InconsistenciesDashboardComponent;
  @ViewChild(BarchartComponent) barchartComponent!: BarchartComponent;
  @ViewChild('infoModal') infoModal!: TemplateRef<any>;

  constructor(
    private accessService: AccessService,
    private cdr: ChangeDetectorRef
  ) {
    this.initializeDefaultDates();
  }

  initializeDefaultDates() {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    
    const twoWeeksAgo = new Date(now);
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
    
    this.filters = {
      ...this.filters,
      dateTo: now.toISOString().slice(0, 16),
      dateFrom: twoWeeksAgo.toISOString().slice(0, 16)
    };
  }

  onInfoButtonClick() {
    this.modalService.open(this.infoModal, { size: 'lg' });
  }

  resetFilters() {
    this.initializeDefaultDates();
    this.filters = {
      ...this.filters,
      type: "",
      group: "DAY",
      action: "ENTRY"
    };
    
    // Usar setTimeout para evitar ExpressionChangedAfterItHasBeenCheckedError
    setTimeout(() => {
      this.filterData();
      this.cdr.detectChanges();
    });
  }

  filterData() {
    // Validar que los filtros tengan valores antes de actualizar
    if (!this.filters.dateFrom || !this.filters.dateTo) {
      this.initializeDefaultDates();
    }

    // Usar setTimeout para evitar ExpressionChangedAfterItHasBeenCheckedError
    setTimeout(() => {
      if (this.main) this.main.getData();
      if (this.entries) this.entries.getData();
      if (this.types) this.types.getData();
      if (this.inconsistencies) this.inconsistencies.getData();
      if (this.late) this.late.getData();
      this.cdr.detectChanges();
    });
  }

  ngOnInit(): void {
    this.filterData();
  }

  changeMode(event: any) {
    const statusKey = Object.keys(DashboardStatus).find(key => 
      DashboardStatus[key as keyof typeof DashboardStatus] === event
    );

    if (statusKey) {
      this.status = DashboardStatus[statusKey as keyof typeof DashboardStatus];
      setTimeout(() => {
        if (this.types) this.types.getData();
        this.cdr.detectChanges();
      });
    } else {
      console.error('Valor no válido para el enum');
    }
  }

  protected readonly DashboardStatus = DashboardStatus;

  getCurrentDateTime(): string {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  }
}