import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { of } from 'rxjs';
import { AppComponent } from './app.component';
import { DepositService } from './services/deposit.service';
import { DashboardService } from './services/dashboard.service';
import { Deposit, DashboardSummary } from './models/deposit.model';

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  let depositServiceMock: jasmine.SpyObj<DepositService>;
  let dashboardServiceMock: jasmine.SpyObj<DashboardService>;

  const mockDeposits: Deposit[] = [
    {
      depositId: 1,
      depositNumber: 'DEP1001',
      storeNumber: 'ST001',
      expectedAmount: 1500.0,
      actualAmount: 1500.0,
      variance: 0.0,
      status: 'Reconciled',
      depositDate: '2026-03-01T10:00:00Z',
      reconciledAt: '2026-03-01T14:30:00Z',
      createdAt: '2026-03-01T08:00:00Z'
    },
    {
      depositId: 2,
      depositNumber: 'DEP1002',
      storeNumber: 'ST002',
      expectedAmount: 800.0,
      actualAmount: null,
      variance: null,
      status: 'Pending',
      depositDate: '2026-03-02T11:00:00Z',
      reconciledAt: null,
      createdAt: '2026-03-02T09:00:00Z'
    }
  ];

  const mockDashboard: DashboardSummary = {
    totalDeposits: 2,
    pendingCount: 1,
    reconciledCount: 1,
    shortCount: 0,
    overCount: 0,
    totalVariance: 0,
    totalExpectedAmount: 2300,
    totalActualAmount: 1500
  };

  beforeEach(async () => {
    depositServiceMock = jasmine.createSpyObj('DepositService', ['getDeposits', 'createDeposit', 'reconcileDeposit']);
    dashboardServiceMock = jasmine.createSpyObj('DashboardService', ['getSummary']);

    depositServiceMock.getDeposits.and.returnValue(of(mockDeposits));
    dashboardServiceMock.getSummary.and.returnValue(of(mockDashboard));

    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: DepositService, useValue: depositServiceMock },
        { provide: DashboardService, useValue: dashboardServiceMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component and load initial data', () => {
    expect(component).toBeTruthy();
    expect(depositServiceMock.getDeposits).toHaveBeenCalled();
    expect(dashboardServiceMock.getSummary).toHaveBeenCalled();
    expect(component.deposits().length).toBe(2);
    expect(component.dashboard().totalDeposits).toBe(2);
  });

  describe('Dynamic Variance and Live Status Calculation', () => {
    const testDeposit: Deposit = {
      depositId: 10,
      depositNumber: 'DEP999',
      storeNumber: 'ST10',
      expectedAmount: 500.0,
      actualAmount: null,
      variance: null,
      status: 'Pending',
      depositDate: '2026-03-05T10:00:00Z',
      reconciledAt: null,
      createdAt: '2026-03-05T08:00:00Z'
    };

    it('should initialize live variance to 0 and status to Reconciled when opened for a pending deposit', () => {
      component.openReconcileModal(testDeposit);

      expect(component.selectedDeposit()).toEqual(testDeposit);
      expect(component.liveVariance()).toBe(0);
      expect(component.liveStatus()).toBe('Reconciled');
    });

    it('should dynamically calculate positive variance and status Over when actual > expected', () => {
      component.openReconcileModal(testDeposit);

      // User types 550.50 in the actual amount input
      component.reconcileForm.get('actualAmount')?.setValue(550.5);

      expect(component.liveVariance()).toBe(50.5);
      expect(component.liveStatus()).toBe('Over');
    });

    it('should dynamically calculate negative variance and status Short when actual < expected', () => {
      component.openReconcileModal(testDeposit);

      // User types 480.25 in the actual amount input
      component.reconcileForm.get('actualAmount')?.setValue(480.25);

      expect(component.liveVariance()).toBe(-19.75);
      expect(component.liveStatus()).toBe('Short');
    });

    it('should dynamically handle exact match with status Reconciled', () => {
      component.openReconcileModal(testDeposit);

      component.reconcileForm.get('actualAmount')?.setValue(500.0);

      expect(component.liveVariance()).toBe(0);
      expect(component.liveStatus()).toBe('Reconciled');
    });

    it('should return null when input is empty or invalid', () => {
      component.openReconcileModal(testDeposit);

      component.reconcileForm.get('actualAmount')?.setValue('');

      expect(component.liveVariance()).toBeNull();
      expect(component.liveStatus()).toBeNull();
    });

    it('should update live variance via onActualAmountInput directly from HTML event', () => {
      component.openReconcileModal(testDeposit);

      const fakeEvent = {
        target: { value: '600' }
      } as unknown as Event;

      component.onActualAmountInput(fakeEvent);

      expect(component.liveVariance()).toBe(100);
      expect(component.liveStatus()).toBe('Over');
    });

    it('should reset modal state and signals on closeReconcileModal', () => {
      component.openReconcileModal(testDeposit);
      expect(component.isReconcileModalOpen()).toBeTrue();

      component.closeReconcileModal();

      expect(component.isReconcileModalOpen()).toBeFalse();
      expect(component.selectedDeposit()).toBeNull();
      expect(component.liveVariance()).toBeNull();
      expect(component.liveStatus()).toBeNull();
    });
  });

  describe('Language Switcher', () => {
    it('should toggle languages between es and en', () => {
      component.setLanguage('en');
      expect(component.i18n.currentLang()).toBe('en');
      expect(component.i18n.isEnglish()).toBeTrue();

      component.setLanguage('es');
      expect(component.i18n.currentLang()).toBe('es');
      expect(component.i18n.isSpanish()).toBeTrue();
    });
  });

  describe('Filters', () => {
    it('should reset filters and reload data on clearFilters', () => {
      component.filterDepositNumber = 'DEP123';
      component.filterStoreNumber = 'ST999';
      component.filterStatus = 'Pending';
      component.filterStartDate = '2026-01-01';
      component.filterEndDate = '2026-01-31';

      component.clearFilters();

      expect(component.filterDepositNumber).toBe('');
      expect(component.filterStoreNumber).toBe('');
      expect(component.filterStatus).toBe('');
      expect(component.filterStartDate).toBe('');
      expect(component.filterEndDate).toBe('');
      expect(depositServiceMock.getDeposits).toHaveBeenCalled();
    });
  });
});
