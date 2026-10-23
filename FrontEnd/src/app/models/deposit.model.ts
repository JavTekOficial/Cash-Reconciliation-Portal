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
  pageNumber?: number;
  pageSize?: number;
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
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

export interface DepositAuditLog {
  auditLogId: number;
  depositId: number;
  action: string;
  previousActualAmount: number | null;
  newActualAmount: number | null;
  previousVariance: number | null;
  newVariance: number | null;
  previousStatus: string | null;
  newStatus: string;
  performedBy: string;
  notes: string | null;
  timestamp: string;
}

