using System.ComponentModel.DataAnnotations;

namespace CashReconciliation.Api.DTOs;

public class ReconcileDepositRequest
{
    [Required]
    [Range(0, 100_000_000, ErrorMessage = "ActualAmount cannot be negative")]
    public decimal ActualAmount { get; set; }
}
