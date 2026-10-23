namespace CashReconciliation.Api.DTOs;

public class DepositFilterParams
{
    public string? DepositNumber { get; set; }
    public string? StoreNumber { get; set; }
    public string? Status { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
}
