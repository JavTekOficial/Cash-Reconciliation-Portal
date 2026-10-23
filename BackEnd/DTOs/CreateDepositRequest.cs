using System.ComponentModel.DataAnnotations;

namespace CashReconciliation.Api.DTOs;

public class CreateDepositRequest
{
    [Required(ErrorMessage = "DepositNumber is required")]
    [MaxLength(50)]
    public string DepositNumber { get; set; } = string.Empty;

    [Required(ErrorMessage = "StoreNumber is required")]
    [MaxLength(50)]
    public string StoreNumber { get; set; } = string.Empty;

    [Required]
    [Range(0.01, 100_000_000, ErrorMessage = "ExpectedAmount must be greater than zero")]
    public decimal ExpectedAmount { get; set; }

    [Required]
    public DateTime DepositDate { get; set; } = DateTime.UtcNow;
}
