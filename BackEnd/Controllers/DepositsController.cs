using CashReconciliation.Api.DTOs;
using CashReconciliation.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace CashReconciliation.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
public class DepositsController : ControllerBase
{
    private readonly IDepositService _depositService;
    private readonly ILogger<DepositsController> _logger;

    public DepositsController(IDepositService depositService, ILogger<DepositsController> logger)
    {
        _depositService = depositService;
        _logger = logger;
    }

    /// <summary>
    /// Retrieves paged deposits with optional filters (depositNumber, storeNumber, status, startDate, endDate, pageNumber, pageSize).
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(PagedResult<DepositDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> Get([FromQuery] DepositFilterParams filters, CancellationToken cancellationToken)
    {
        var pagedResult = await _depositService.GetPagedDepositsAsync(filters, cancellationToken);
        return Ok(pagedResult);
    }

    /// <summary>
    /// Exports deposits matching search filters as a CSV file with UTF-8 BOM encoding.
    /// </summary>
    [HttpGet("export")]
    [Produces("text/csv")]
    [ProducesResponseType(typeof(FileContentResult), StatusCodes.Status200OK)]
    public async Task<IActionResult> Export([FromQuery] DepositFilterParams filters, CancellationToken cancellationToken)
    {
        var csvBytes = await _depositService.ExportDepositsToCsvAsync(filters, cancellationToken);
        var fileName = $"deposits_export_{DateTime.UtcNow:yyyyMMdd_HHmmss}.csv";
        return File(csvBytes, "text/csv; charset=utf-8", fileName);
    }

    /// <summary>
    /// Retrieves a specific deposit by ID.
    /// </summary>
    [HttpGet("{id:int}")]
    [ProducesResponseType(typeof(DepositDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(int id, CancellationToken cancellationToken)
    {
        var deposit = await _depositService.GetDepositByIdAsync(id, cancellationToken);
        if (deposit is null)
        {
            return NotFound(new { message = $"Deposit with ID {id} was not found." });
        }

        return Ok(deposit);
    }

    /// <summary>
    /// Registers a new deposit bag.
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(DepositDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Create([FromBody] CreateDepositRequest request, CancellationToken cancellationToken)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        try
        {
            var created = await _depositService.CreateDepositAsync(request, cancellationToken);
            return CreatedAtAction(nameof(GetById), new { id = created.DepositId }, created);
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning(ex, "Failed to create deposit due to validation conflict: {Message}", ex.Message);
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Reconciles an existing deposit by entering actual counted amount.
    /// Calculates variance and assigns status (Reconciled, Over, Short).
    /// </summary>
    [HttpPut("{id:int}/reconcile")]
    [ProducesResponseType(typeof(DepositDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Reconcile(int id, [FromBody] ReconcileDepositRequest request, CancellationToken cancellationToken)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var reconciled = await _depositService.ReconcileDepositAsync(id, request, cancellationToken);
        if (reconciled is null)
        {
            return NotFound(new { message = $"Deposit with ID {id} was not found." });
        }

        return Ok(reconciled);
    }

    /// <summary>
    /// Retrieves the audit trail log history for a specific deposit.
    /// </summary>
    [HttpGet("{id:int}/audit-logs")]
    [ProducesResponseType(typeof(IEnumerable<DepositAuditLogDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetAuditLogs(int id, CancellationToken cancellationToken)
    {
        var deposit = await _depositService.GetDepositByIdAsync(id, cancellationToken);
        if (deposit is null)
        {
            return NotFound(new { message = $"Deposit with ID {id} was not found." });
        }

        var logs = await _depositService.GetAuditLogsAsync(id, cancellationToken);
        return Ok(logs);
    }
}
