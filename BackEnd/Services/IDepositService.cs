using CashReconciliation.Api.DTOs;

namespace CashReconciliation.Api.Services;

public interface IDepositService
{
    Task<IEnumerable<DepositDto>> GetAllDepositsAsync(DepositFilterParams filters, CancellationToken cancellationToken = default);
    Task<DepositDto?> GetDepositByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<DepositDto> CreateDepositAsync(CreateDepositRequest request, CancellationToken cancellationToken = default);
    Task<DepositDto?> ReconcileDepositAsync(int id, ReconcileDepositRequest request, CancellationToken cancellationToken = default);
    Task<DashboardSummaryDto> GetDashboardSummaryAsync(CancellationToken cancellationToken = default);
}
