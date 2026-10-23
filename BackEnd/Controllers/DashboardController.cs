using CashReconciliation.Api.DTOs;
using CashReconciliation.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace CashReconciliation.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
public class DashboardController : ControllerBase
{
    private readonly IDepositService _depositService;

    public DashboardController(IDepositService depositService)
    {
        _depositService = depositService;
    }

    /// <summary>
    /// Retrieves dashboard summary metrics for cash reconciliation, optionally filtered.
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(DashboardSummaryDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> Get([FromQuery] DepositFilterParams? filters, CancellationToken cancellationToken)
    {
        var metrics = await _depositService.GetDashboardSummaryAsync(filters, cancellationToken);
        return Ok(metrics);
    }
}
