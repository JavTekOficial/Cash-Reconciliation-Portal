namespace CashReconciliation.Api.DTOs;

public class DepositDto
{
    public int DepositId { get; set; }
    public string DepositNumber { get; set; } = string.Empty;
    public string StoreNumber { get; set; } = string.Empty;
    public decimal ExpectedAmount { get; set; }
    public decimal? ActualAmount { get; set; }
    public decimal? Variance { get; set; }
    public string Status { get; set; } = string.Empty;
    public DateTime DepositDate { get; set; }
    public DateTime? ReconciledAt { get; set; }
    public DateTime CreatedAt { get; set; }
}
