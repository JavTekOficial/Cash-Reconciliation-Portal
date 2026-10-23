using System.Globalization;
using System.Text;
using CashReconciliation.Api.DTOs;
using CashReconciliation.Api.Models;
using CashReconciliation.Api.Repositories;

namespace CashReconciliation.Api.Services;

public class DepositService : IDepositService
{
    private readonly IDepositRepository _repository;
    private readonly ILogger<DepositService> _logger;

    public DepositService(IDepositRepository repository, ILogger<DepositService> logger)
    {
        _repository = repository;
        _logger = logger;
    }

    public async Task<IEnumerable<DepositDto>> GetAllDepositsAsync(DepositFilterParams filters, CancellationToken cancellationToken = default)
    {
        var deposits = await _repository.GetAllAsync(filters, cancellationToken);
        return deposits.Select(MapToDto);
    }

    public async Task<DepositDto?> GetDepositByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        var deposit = await _repository.GetByIdAsync(id, cancellationToken);
        return deposit is null ? null : MapToDto(deposit);
    }

    public async Task<DepositDto> CreateDepositAsync(CreateDepositRequest request, CancellationToken cancellationToken = default)
    {
        var exists = await _repository.ExistsAsync(request.DepositNumber, cancellationToken);
        if (exists)
        {
            throw new InvalidOperationException($"Deposit with number '{request.DepositNumber}' already exists.");
        }

        var deposit = new Deposit
        {
            DepositNumber = request.DepositNumber.Trim(),
            StoreNumber = request.StoreNumber.Trim(),
            ExpectedAmount = request.ExpectedAmount,
            ActualAmount = null,
            Variance = null,
            Status = DepositStatus.Pending,
            DepositDate = request.DepositDate,
            ReconciledAt = null,
            CreatedAt = DateTime.UtcNow
        };

        var created = await _repository.AddAsync(deposit, cancellationToken);
        _logger.LogInformation("Deposit {DepositNumber} created successfully with ID {DepositId}", created.DepositNumber, created.DepositId);

        var auditLog = new DepositAuditLog
        {
            DepositId = created.DepositId,
            Action = "Created",
            PreviousActualAmount = null,
            NewActualAmount = null,
            PreviousVariance = null,
            NewVariance = null,
            PreviousStatus = null,
            NewStatus = DepositStatus.Pending,
            PerformedBy = "Operador de Bóveda",
            Notes = $"Depósito registrado con monto esperado de {created.ExpectedAmount:C}",
            Timestamp = DateTime.UtcNow
        };
        await _repository.AddAuditLogAsync(auditLog, cancellationToken);

        return MapToDto(created);
    }

    public async Task<DepositDto?> ReconcileDepositAsync(int id, ReconcileDepositRequest request, CancellationToken cancellationToken = default)
    {
        var deposit = await _repository.GetByIdAsync(id, cancellationToken);
        if (deposit is null)
        {
            return null;
        }

        // Snapshot previous values for audit logging
        var previousActual = deposit.ActualAmount;
        var previousVariance = deposit.Variance;
        var previousStatus = deposit.Status;
        var isReReconciliation = deposit.Status != DepositStatus.Pending;

        // Reglas de Negocio de Conciliación
        // Cálculo de Varianza = Monto Real - Monto Esperado
        var variance = request.ActualAmount - deposit.ExpectedAmount;

        // Regla:
        // Diferencia = 0 -> Conciliado (Reconciled)
        // Diferencia > 0 -> Sobrante (Over)
        // Diferencia < 0 -> Faltante (Short)
        var status = variance switch
        {
            0 => DepositStatus.Reconciled,
            > 0 => DepositStatus.Over,
            _ => DepositStatus.Short
        };

        deposit.ActualAmount = request.ActualAmount;
        deposit.Variance = variance;
        deposit.Status = status;
        deposit.ReconciledAt = DateTime.UtcNow;

        await _repository.UpdateAsync(deposit, cancellationToken);

        var auditLog = new DepositAuditLog
        {
            DepositId = deposit.DepositId,
            Action = isReReconciliation ? "Re-Reconciled" : "Reconciled",
            PreviousActualAmount = previousActual,
            NewActualAmount = deposit.ActualAmount,
            PreviousVariance = previousVariance,
            NewVariance = deposit.Variance,
            PreviousStatus = previousStatus,
            NewStatus = deposit.Status,
            PerformedBy = "Operador de Bóveda",
            Notes = isReReconciliation ? "Ajuste de conciliación existente" : "Conciliación inicial de depósito",
            Timestamp = DateTime.UtcNow
        };
        await _repository.AddAuditLogAsync(auditLog, cancellationToken);

        _logger.LogInformation("Deposit {DepositId} reconciled. Expected: {Expected}, Actual: {Actual}, Variance: {Variance}, Status: {Status}",
            id, deposit.ExpectedAmount, request.ActualAmount, variance, status);

        return MapToDto(deposit);
    }

    public async Task<DashboardSummaryDto> GetDashboardSummaryAsync(DepositFilterParams? filters = null, CancellationToken cancellationToken = default)
    {
        return await _repository.GetDashboardMetricsAsync(filters, cancellationToken);
    }

    public async Task<IEnumerable<DepositAuditLogDto>> GetAuditLogsAsync(int depositId, CancellationToken cancellationToken = default)
    {
        var logs = await _repository.GetAuditLogsByDepositIdAsync(depositId, cancellationToken);
        return logs.Select(MapAuditLogToDto);
    }

    public async Task<byte[]> ExportDepositsToCsvAsync(DepositFilterParams filters, CancellationToken cancellationToken = default)
    {
        var deposits = await _repository.GetAllAsync(filters, cancellationToken);

        var builder = new StringBuilder();
        builder.AppendLine("Deposit Number,Store Number,Deposit Date,Expected Amount,Actual Amount,Variance,Status,Reconciled At,Created At");

        foreach (var d in deposits)
        {
            var depositNo = EscapeCsv(d.DepositNumber);
            var storeNo = EscapeCsv(d.StoreNumber);
            var depositDate = d.DepositDate.ToString("yyyy-MM-dd HH:mm:ss", CultureInfo.InvariantCulture);
            var expected = d.ExpectedAmount.ToString("F2", CultureInfo.InvariantCulture);
            var actual = d.ActualAmount.HasValue ? d.ActualAmount.Value.ToString("F2", CultureInfo.InvariantCulture) : "";
            var variance = d.Variance.HasValue ? d.Variance.Value.ToString("F2", CultureInfo.InvariantCulture) : "";
            var status = EscapeCsv(d.Status);
            var reconciledAt = d.ReconciledAt.HasValue ? d.ReconciledAt.Value.ToString("yyyy-MM-dd HH:mm:ss", CultureInfo.InvariantCulture) : "";
            var createdAt = d.CreatedAt.ToString("yyyy-MM-dd HH:mm:ss", CultureInfo.InvariantCulture);

            builder.AppendLine($"{depositNo},{storeNo},{depositDate},{expected},{actual},{variance},{status},{reconciledAt},{createdAt}");
        }

        var preamble = Encoding.UTF8.GetPreamble();
        var bytes = Encoding.UTF8.GetBytes(builder.ToString());

        var result = new byte[preamble.Length + bytes.Length];
        Buffer.BlockCopy(preamble, 0, result, 0, preamble.Length);
        Buffer.BlockCopy(bytes, 0, result, preamble.Length, bytes.Length);

        return result;
    }

    private static string EscapeCsv(string? value)
    {
        if (string.IsNullOrEmpty(value)) return "";
        if (value.Contains(',') || value.Contains('"') || value.Contains('\n') || value.Contains('\r'))
        {
            return $"\"{value.Replace("\"", "\"\"")}\"";
        }
        return value;
    }

    private static DepositDto MapToDto(Deposit entity) => new()
    {
        DepositId = entity.DepositId,
        DepositNumber = entity.DepositNumber,
        StoreNumber = entity.StoreNumber,
        ExpectedAmount = entity.ExpectedAmount,
        ActualAmount = entity.ActualAmount,
        Variance = entity.Variance,
        Status = entity.Status,
        DepositDate = entity.DepositDate,
        ReconciledAt = entity.ReconciledAt,
        CreatedAt = entity.CreatedAt
    };

    private static DepositAuditLogDto MapAuditLogToDto(DepositAuditLog entity) => new()
    {
        AuditLogId = entity.AuditLogId,
        DepositId = entity.DepositId,
        Action = entity.Action,
        PreviousActualAmount = entity.PreviousActualAmount,
        NewActualAmount = entity.NewActualAmount,
        PreviousVariance = entity.PreviousVariance,
        NewVariance = entity.NewVariance,
        PreviousStatus = entity.PreviousStatus,
        NewStatus = entity.NewStatus,
        PerformedBy = entity.PerformedBy,
        Notes = entity.Notes,
        Timestamp = entity.Timestamp
    };
}
