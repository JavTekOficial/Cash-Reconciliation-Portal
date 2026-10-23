import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslatePipe } from './pipes/translate.pipe';
import { TranslationService } from './services/translation.service';
import { DepositService } from './services/deposit.service';
import { DashboardService } from './services/dashboard.service';
import { SupportedLang } from './i18n/translations';
import { Deposit, DashboardSummary, DepositFilter, DepositStatusType, DepositAuditLog } from './models/deposit.model';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, TranslatePipe],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  // Application Data Signals
  readonly deposits = signal<Deposit[]>([]);
  readonly dashboard = signal<DashboardSummary>({
    totalDeposits: 0,
    pendingCount: 0,
    reconciledCount: 0,
    shortCount: 0,
    overCount: 0,
    totalVariance: 0,
    totalExpectedAmount: 0,
    totalActualAmount: 0
  });

  // Filtered Results Summary Signal (bottom of page)
  readonly filteredSummary = signal<DashboardSummary>({
    totalDeposits: 0,
    pendingCount: 0,
    reconciledCount: 0,
    shortCount: 0,
    overCount: 0,
    totalVariance: 0,
    totalExpectedAmount: 0,
    totalActualAmount: 0
  });

  readonly hasActiveFilters = signal<boolean>(false);

  readonly isLoading = signal<boolean>(false);
  readonly errorMessage = signal<string | null>(null);
  readonly successMessage = signal<string | null>(null);

  // Modals state
  readonly isCreateModalOpen = signal<boolean>(false);
  readonly isReconcileModalOpen = signal<boolean>(false);
  readonly selectedDeposit = signal<Deposit | null>(null);
  readonly reconcileActualAmount = signal<number | null>(null);

  // Audit trail modal state
  readonly isAuditModalOpen = signal<boolean>(false);
  readonly selectedAuditDeposit = signal<Deposit | null>(null);
  readonly auditLogs = signal<DepositAuditLog[]>([]);
  readonly isLoadingAudit = signal<boolean>(false);

  // CSV export state
  readonly isExporting = signal<boolean>(false);

  // Server-side Pagination state
  readonly currentPage = signal<number>(1);
  readonly pageSize = signal<number>(10);
  readonly totalCount = signal<number>(0);
  readonly totalPages = signal<number>(1);
  readonly hasPreviousPage = signal<boolean>(false);
  readonly hasNextPage = signal<boolean>(false);

  readonly pageRangeStart = computed(() => {
    return this.totalCount() === 0 ? 0 : (this.currentPage() - 1) * this.pageSize() + 1;
  });

  readonly pageRangeEnd = computed(() => {
    return Math.min(this.currentPage() * this.pageSize(), this.totalCount());
  });

  readonly visiblePages = computed(() => {
    const current = this.currentPage();
    const total = this.totalPages();
    const pages: number[] = [];
    const delta = 2;

    const start = Math.max(1, current - delta);
    const end = Math.min(total, current + delta);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  });

  // Filter Form
  filterDepositNumber = '';
  filterStoreNumber = '';
  filterStatus = '';
  filterStartDate = '';
  filterEndDate = '';

  // Forms
  createForm: FormGroup;
  reconcileForm: FormGroup;

  // Live variance calculation in reconcile modal
  readonly liveVariance = computed(() => {
    const dep = this.selectedDeposit();
    const actual = this.reconcileActualAmount();
    if (!dep || actual === null || actual === undefined || isNaN(actual)) {
      return null;
    }
    // Round to 2 decimals to avoid floating point precision issues
    return Math.round((actual - dep.expectedAmount) * 100) / 100;
  });

  readonly liveStatus = computed<DepositStatusType | null>(() => {
    const variance = this.liveVariance();
    if (variance === null) return null;
    if (variance === 0) return 'Reconciled';
    if (variance > 0) return 'Over';
    return 'Short';
  });

  constructor(
    public readonly i18n: TranslationService,
    private readonly depositService: DepositService,
    private readonly dashboardService: DashboardService,
    private readonly fb: FormBuilder
  ) {
    // Create Deposit Form initialization
    this.createForm = this.fb.group({
      depositNumber: ['', [Validators.required, Validators.maxLength(50)]],
      storeNumber: ['', [Validators.required, Validators.maxLength(50)]],
      expectedAmount: [null, [Validators.required, Validators.min(0.01)]],
      depositDate: [new Date().toISOString().substring(0, 10), [Validators.required]]
    });

    // Reconcile Form initialization
    this.reconcileForm = this.fb.group({
      actualAmount: [null, [Validators.required, Validators.min(0)]]
    });

    // Synchronize form changes with our reactive signal for immediate preview
    this.reconcileForm.get('actualAmount')?.valueChanges.subscribe((val) => {
      this.syncActualAmount(val);
    });
  }

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    const searchFilters: DepositFilter = {};
    if (this.filterDepositNumber.trim()) searchFilters.depositNumber = this.filterDepositNumber.trim();
    if (this.filterStoreNumber.trim()) searchFilters.storeNumber = this.filterStoreNumber.trim();
    if (this.filterStatus.trim()) searchFilters.status = this.filterStatus.trim();
    if (this.filterStartDate) searchFilters.startDate = this.filterStartDate;
    if (this.filterEndDate) searchFilters.endDate = this.filterEndDate;

    const hasFilters = Boolean(
      searchFilters.depositNumber || searchFilters.storeNumber || searchFilters.status || searchFilters.startDate || searchFilters.endDate
    );
    this.hasActiveFilters.set(hasFilters);

    // Filters for paged deposits query
    const pagedFilters: DepositFilter = {
      ...searchFilters,
      pageNumber: this.currentPage(),
      pageSize: this.pageSize()
    };

    // Load deposits (paged)
    this.depositService.getDeposits(pagedFilters).subscribe({
      next: (data) => {
        this.deposits.set(data.items);
        this.totalCount.set(data.totalCount);
        this.totalPages.set(data.totalPages);
        this.hasPreviousPage.set(data.hasPreviousPage);
        this.hasNextPage.set(data.hasNextPage);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error fetching deposits', err);
        this.errorMessage.set(this.i18n.translate('ERROR_GENERIC'));
        this.isLoading.set(false);
      }
    });

    // Load general dashboard metrics (overall vault totals for top cards)
    this.dashboardService.getSummary().subscribe({
      next: (summary) => {
        this.dashboard.set(summary);
      },
      error: (err) => {
        console.error('Error fetching general dashboard', err);
      }
    });

    // Load filtered summary metrics (dynamic totals for bottom cards based on search filters across all pages)
    this.dashboardService.getSummary(searchFilters).subscribe({
      next: (summary) => {
        this.filteredSummary.set(summary);
      },
      error: (err) => {
        console.error('Error fetching filtered summary', err);
      }
    });
  }

  applyFilters(): void {
    this.currentPage.set(1);
    this.loadData();
  }

  clearFilters(): void {
    this.filterDepositNumber = '';
    this.filterStoreNumber = '';
    this.filterStatus = '';
    this.filterStartDate = '';
    this.filterEndDate = '';
    this.currentPage.set(1);
    this.loadData();
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages() && page !== this.currentPage()) {
      this.currentPage.set(page);
      this.loadData();
    }
  }

  previousPage(): void {
    if (this.hasPreviousPage()) {
      this.goToPage(this.currentPage() - 1);
    }
  }

  nextPage(): void {
    if (this.hasNextPage()) {
      this.goToPage(this.currentPage() + 1);
    }
  }

  onPageSizeChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const newSize = Number(select.value);
    if (newSize > 0 && newSize !== this.pageSize()) {
      this.pageSize.set(newSize);
      this.currentPage.set(1);
      this.loadData();
    }
  }

  exportToCsv(): void {
    if (this.isExporting()) return;

    this.isExporting.set(true);

    const filters: DepositFilter = {};
    if (this.filterDepositNumber.trim()) filters.depositNumber = this.filterDepositNumber.trim();
    if (this.filterStoreNumber.trim()) filters.storeNumber = this.filterStoreNumber.trim();
    if (this.filterStatus.trim()) filters.status = this.filterStatus.trim();
    if (this.filterStartDate) filters.startDate = this.filterStartDate;
    if (this.filterEndDate) filters.endDate = this.filterEndDate;

    this.depositService.exportDepositsToCsv(filters).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        a.download = `deposits_export_${timestamp}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);

        this.isExporting.set(false);
        this.showToast(this.i18n.translate('SUCCESS_EXPORT'));
      },
      error: (err) => {
        console.error('Error exporting deposits to CSV', err);
        this.isExporting.set(false);
        this.errorMessage.set(this.i18n.translate('ERROR_GENERIC'));
      }
    });
  }

  setLanguage(lang: SupportedLang): void {
    this.i18n.setLanguage(lang);
  }

  openCreateModal(): void {
    this.createForm.reset({
      depositNumber: '',
      storeNumber: '',
      expectedAmount: null,
      depositDate: new Date().toISOString().substring(0, 10)
    });
    this.isCreateModalOpen.set(true);
  }

  closeCreateModal(): void {
    this.isCreateModalOpen.set(false);
  }

  submitCreateDeposit(): void {
    if (this.createForm.invalid) {
      this.createForm.markAllAsTouched();
      return;
    }

    const formVal = this.createForm.value;
    this.depositService.createDeposit({
      depositNumber: formVal.depositNumber,
      storeNumber: formVal.storeNumber,
      expectedAmount: Number(formVal.expectedAmount),
      depositDate: new Date(formVal.depositDate).toISOString()
    }).subscribe({
      next: () => {
        this.showToast(this.i18n.translate('SUCCESS_CREATED'));
        this.closeCreateModal();
        this.loadData();
      },
      error: (err) => {
        console.error('Error creating deposit', err);
        const msg = err.error?.message || this.i18n.translate('ERROR_GENERIC');
        this.errorMessage.set(msg);
      }
    });
  }

  openReconcileModal(deposit: Deposit): void {
    const initialAmount = deposit.actualAmount ?? deposit.expectedAmount;
    this.selectedDeposit.set(deposit);
    this.syncActualAmount(initialAmount);
    this.reconcileForm.reset({
      actualAmount: initialAmount
    });
    this.isReconcileModalOpen.set(true);
  }

  closeReconcileModal(): void {
    this.isReconcileModalOpen.set(false);
    this.selectedDeposit.set(null);
    this.reconcileActualAmount.set(null);
  }

  onActualAmountInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.syncActualAmount(target.value);
  }

  private syncActualAmount(val: unknown): void {
    if (val === null || val === undefined || val === '' || isNaN(Number(val))) {
      this.reconcileActualAmount.set(null);
    } else {
      this.reconcileActualAmount.set(Number(val));
    }
  }

  submitReconcile(): void {
    const deposit = this.selectedDeposit();
    if (!deposit || this.reconcileForm.invalid) {
      this.reconcileForm.markAllAsTouched();
      return;
    }

    const actualAmount = Number(this.reconcileForm.value.actualAmount);
    this.depositService.reconcileDeposit(deposit.depositId, { actualAmount }).subscribe({
      next: () => {
        this.showToast(this.i18n.translate('SUCCESS_RECONCILED'));
        this.closeReconcileModal();
        this.loadData();
      },
      error: (err) => {
        console.error('Error reconciling deposit', err);
        const msg = err.error?.message || this.i18n.translate('ERROR_GENERIC');
        this.errorMessage.set(msg);
      }
    });
  }

  showToast(message: string): void {
    this.successMessage.set(message);
    setTimeout(() => {
      this.successMessage.set(null);
    }, 4000);
  }

  dismissError(): void {
    this.errorMessage.set(null);
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'Reconciled': return 'status-badge-reconciled';
      case 'Over': return 'status-badge-over';
      case 'Short': return 'status-badge-short';
      default: return 'status-badge-pending';
    }
  }

  getStatusTranslationKey(status: string): string {
    switch (status) {
      case 'Reconciled': return 'STATUS_RECONCILED';
      case 'Over': return 'STATUS_OVER';
      case 'Short': return 'STATUS_SHORT';
      default: return 'STATUS_PENDING';
    }
  }

  openAuditModal(deposit: Deposit): void {
    this.selectedAuditDeposit.set(deposit);
    this.isAuditModalOpen.set(true);
    this.isLoadingAudit.set(true);
    this.auditLogs.set([]);

    this.depositService.getAuditLogs(deposit.depositId).subscribe({
      next: (logs) => {
        this.auditLogs.set(logs);
        this.isLoadingAudit.set(false);
      },
      error: (err) => {
        console.error('Error fetching audit logs', err);
        this.isLoadingAudit.set(false);
        this.errorMessage.set(this.i18n.translate('ERROR_GENERIC'));
      }
    });
  }

  closeAuditModal(): void {
    this.isAuditModalOpen.set(false);
    this.selectedAuditDeposit.set(null);
    this.auditLogs.set([]);
  }

  getAuditActionTranslationKey(action: string): string {
    switch (action) {
      case 'Created': return 'AUDIT_ACTION_CREATED';
      case 'Reconciled': return 'AUDIT_ACTION_RECONCILED';
      case 'Re-Reconciled': return 'AUDIT_ACTION_RERECONCILED';
      default: return action;
    }
  }
}
