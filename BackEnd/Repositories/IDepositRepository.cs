using CashReconciliation.Api.DTOs;
using CashReconciliation.Api.Models;

namespace CashReconciliation.Api.Repositories;

public interface IDepositRepository
{
    Task<IEnumerable<Deposit>> GetAllAsync(DepositFilterParams filters, CancellationToken cancellationToken = default);
    Task<Deposit?> GetByIdAsync(int depositId, CancellationToken cancellationToken = default);
    Task<Deposit?> GetByDepositNumberAsync(string depositNumber, CancellationToken cancellationToken = default);
    Task<bool> ExistsAsync(string depositNumber, CancellationToken cancellationToken = default);
    Task<Deposit> AddAsync(Deposit deposit, CancellationToken cancellationToken = default);
    Task UpdateAsync(Deposit deposit, CancellationToken cancellationToken = default);
    Task<DashboardSummaryDto> GetDashboardMetricsAsync(DepositFilterParams? filters = null, CancellationToken cancellationToken = default);
}
