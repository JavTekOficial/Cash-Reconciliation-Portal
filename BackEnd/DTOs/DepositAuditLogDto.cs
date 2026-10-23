namespace CashReconciliation.Api.DTOs;

public class DepositAuditLogDto
{
    public int AuditLogId { get; set; }

    public int DepositId { get; set; }

    public string Action { get; set; } = string.Empty;

    public decimal? PreviousActualAmount { get; set; }

    public decimal? NewActualAmount { get; set; }

    public decimal? PreviousVariance { get; set; }

    public decimal? NewVariance { get; set; }

    public string? PreviousStatus { get; set; }

    public string NewStatus { get; set; } = string.Empty;

    public string PerformedBy { get; set; } = string.Empty;

    public string? Notes { get; set; }

    public DateTime Timestamp { get; set; }
}
