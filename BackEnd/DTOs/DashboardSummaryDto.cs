namespace CashReconciliation.Api.DTOs;

public class DashboardSummaryDto
{
    public int TotalDeposits { get; set; }
    public int PendingCount { get; set; }
    public int ReconciledCount { get; set; }
    public int ShortCount { get; set; }
    public int OverCount { get; set; }
    public decimal TotalVariance { get; set; }
    public decimal TotalExpectedAmount { get; set; }
    public decimal TotalActualAmount { get; set; }
}
