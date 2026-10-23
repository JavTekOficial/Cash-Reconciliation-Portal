namespace CashReconciliation.Api.Models;

public class DepositAuditLog
{
    public int AuditLogId { get; set; }

    public int DepositId { get; set; }

    public string Action { get; set; } = string.Empty; // "Created", "Reconciled", "Re-Reconciled"

    public decimal? PreviousActualAmount { get; set; }

    public decimal? NewActualAmount { get; set; }

    public decimal? PreviousVariance { get; set; }

    public decimal? NewVariance { get; set; }

    public string? PreviousStatus { get; set; }

    public string NewStatus { get; set; } = string.Empty;

    public string PerformedBy { get; set; } = "Operador de Bóveda";

    public string? Notes { get; set; }

    public DateTime Timestamp { get; set; } = DateTime.UtcNow;

    public virtual Deposit Deposit { get; set; } = null!;
}
