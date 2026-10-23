namespace CashReconciliation.Api.Models;

public class Deposit
{
    public int DepositId { get; set; }

    public string DepositNumber { get; set; } = string.Empty;

    public string StoreNumber { get; set; } = string.Empty;

    public decimal ExpectedAmount { get; set; }

    public decimal? ActualAmount { get; set; }

    public decimal? Variance { get; set; }

    public string Status { get; set; } = DepositStatus.Pending;

    public DateTime DepositDate { get; set; }

    public DateTime? ReconciledAt { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
