using CashReconciliation.Api.Data;
using CashReconciliation.Api.DTOs;
using CashReconciliation.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace CashReconciliation.Api.Repositories;

public class DepositRepository : IDepositRepository
{
    private readonly CashReconciliationDbContext _context;

    public DepositRepository(CashReconciliationDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<Deposit>> GetAllAsync(DepositFilterParams filters, CancellationToken cancellationToken = default)
    {
        var query = _context.Deposits.AsNoTracking().AsQueryable();
        query = ApplyFilters(query, filters);

        return await query
            .OrderByDescending(d => d.DepositDate)
            .ThenByDescending(d => d.DepositId)
            .ToListAsync(cancellationToken);
    }

    private static IQueryable<Deposit> ApplyFilters(IQueryable<Deposit> query, DepositFilterParams? filters)
    {
        if (filters is null) return query;

        if (!string.IsNullOrWhiteSpace(filters.DepositNumber))
        {
            var depositNo = filters.DepositNumber.Trim();
            query = query.Where(d => d.DepositNumber.Contains(depositNo));
        }

        if (!string.IsNullOrWhiteSpace(filters.StoreNumber))
        {
            var storeNo = filters.StoreNumber.Trim();
            query = query.Where(d => d.StoreNumber.Contains(storeNo));
        }

        if (!string.IsNullOrWhiteSpace(filters.Status))
        {
            var status = filters.Status.Trim();
            query = query.Where(d => d.Status == status);
        }

        if (filters.StartDate.HasValue)
        {
            var start = filters.StartDate.Value.Date;
            query = query.Where(d => d.DepositDate >= start);
        }

        if (filters.EndDate.HasValue)
        {
            var end = filters.EndDate.Value.Date.AddDays(1).AddTicks(-1);
            query = query.Where(d => d.DepositDate <= end);
        }

        return query;
    }

    public async Task<Deposit?> GetByIdAsync(int depositId, CancellationToken cancellationToken = default)
    {
        return await _context.Deposits
            .FirstOrDefaultAsync(d => d.DepositId == depositId, cancellationToken);
    }

    public async Task<Deposit?> GetByDepositNumberAsync(string depositNumber, CancellationToken cancellationToken = default)
    {
        return await _context.Deposits
            .FirstOrDefaultAsync(d => d.DepositNumber.ToLower() == depositNumber.ToLower(), cancellationToken);
    }

    public async Task<bool> ExistsAsync(string depositNumber, CancellationToken cancellationToken = default)
    {
        return await _context.Deposits
            .AnyAsync(d => d.DepositNumber.ToLower() == depositNumber.ToLower(), cancellationToken);
    }

    public async Task<Deposit> AddAsync(Deposit deposit, CancellationToken cancellationToken = default)
    {
        await _context.Deposits.AddAsync(deposit, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);
        return deposit;
    }

    public async Task UpdateAsync(Deposit deposit, CancellationToken cancellationToken = default)
    {
        _context.Deposits.Update(deposit);
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task<DashboardSummaryDto> GetDashboardMetricsAsync(DepositFilterParams? filters = null, CancellationToken cancellationToken = default)
    {
        var query = _context.Deposits.AsNoTracking().AsQueryable();
        query = ApplyFilters(query, filters);

        var deposits = await query.ToListAsync(cancellationToken);

        return new DashboardSummaryDto
        {
            TotalDeposits = deposits.Count,
            PendingCount = deposits.Count(d => d.Status == DepositStatus.Pending),
            ReconciledCount = deposits.Count(d => d.Status == DepositStatus.Reconciled),
            ShortCount = deposits.Count(d => d.Status == DepositStatus.Short),
            OverCount = deposits.Count(d => d.Status == DepositStatus.Over),
            TotalVariance = deposits.Where(d => d.Variance.HasValue).Sum(d => d.Variance!.Value),
            TotalExpectedAmount = deposits.Sum(d => d.ExpectedAmount),
            TotalActualAmount = deposits.Where(d => d.ActualAmount.HasValue).Sum(d => d.ActualAmount!.Value)
        };
    }

    public async Task<IEnumerable<DepositAuditLog>> GetAuditLogsByDepositIdAsync(int depositId, CancellationToken cancellationToken = default)
    {
        return await _context.DepositAuditLogs
            .AsNoTracking()
            .Where(a => a.DepositId == depositId)
            .OrderByDescending(a => a.Timestamp)
            .ThenByDescending(a => a.AuditLogId)
            .ToListAsync(cancellationToken);
    }

    public async Task AddAuditLogAsync(DepositAuditLog auditLog, CancellationToken cancellationToken = default)
    {
        await _context.DepositAuditLogs.AddAsync(auditLog, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);
    }
}
