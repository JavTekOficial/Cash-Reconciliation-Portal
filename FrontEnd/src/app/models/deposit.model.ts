export type DepositStatusType = 'Pending' | 'Reconciled' | 'Over' | 'Short';

export interface Deposit {
  depositId: number;
  depositNumber: string;
  storeNumber: string;
  expectedAmount: number;
  actualAmount: number | null;
  variance: number | null;
  status: DepositStatusType;
  depositDate: string;
  reconciledAt: string | null;
  createdAt: string;
}

export interface CreateDepositRequest {
  depositNumber: string;
  storeNumber: string;
  expectedAmount: number;
  depositDate: string;
}

export interface ReconcileDepositRequest {
  actualAmount: number;
}

export interface DepositFilter {
  depositNumber?: string;
  storeNumber?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
}

export interface DashboardSummary {
  totalDeposits: number;
  pendingCount: number;
  reconciledCount: number;
  shortCount: number;
  overCount: number;
  totalVariance: number;
  totalExpectedAmount: number;
  totalActualAmount: number;
}
