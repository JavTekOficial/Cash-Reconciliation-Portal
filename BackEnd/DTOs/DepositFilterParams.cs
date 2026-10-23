using System.ComponentModel.DataAnnotations;

namespace CashReconciliation.Api.DTOs;

public class DepositFilterParams
{
    public string? DepositNumber { get; set; }
    public string? StoreNumber { get; set; }
    public string? Status { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }

    [Range(1, int.MaxValue, ErrorMessage = "PageNumber must be at least 1.")]
    public int PageNumber { get; set; } = 1;

    [Range(1, 100, ErrorMessage = "PageSize must be between 1 and 100.")]
    public int PageSize { get; set; } = 10;
}
