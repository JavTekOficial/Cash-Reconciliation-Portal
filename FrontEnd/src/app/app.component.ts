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

    const filters: DepositFilter = {};
    if (this.filterDepositNumber.trim()) filters.depositNumber = this.filterDepositNumber.trim();
    if (this.filterStoreNumber.trim()) filters.storeNumber = this.filterStoreNumber.trim();
    if (this.filterStatus.trim()) filters.status = this.filterStatus.trim();
    if (this.filterStartDate) filters.startDate = this.filterStartDate;
    if (this.filterEndDate) filters.endDate = this.filterEndDate;

    const hasFilters = Boolean(
      filters.depositNumber || filters.storeNumber || filters.status || filters.startDate || filters.endDate
    );
    this.hasActiveFilters.set(hasFilters);

    // Load deposits
    this.depositService.getDeposits(filters).subscribe({
      next: (data) => {
        this.deposits.set(data);
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

    // Load filtered summary metrics (dynamic totals for bottom cards based on filters)
    this.dashboardService.getSummary(filters).subscribe({
      next: (summary) => {
        this.filteredSummary.set(summary);
      },
      error: (err) => {
        console.error('Error fetching filtered summary', err);
      }
    });
  }

  applyFilters(): void {
    this.loadData();
  }

  clearFilters(): void {
    this.filterDepositNumber = '';
    this.filterStoreNumber = '';
    this.filterStatus = '';
    this.filterStartDate = '';
    this.filterEndDate = '';
    this.loadData();
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
