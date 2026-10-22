using Microsoft.AspNetCore.Mvc;

namespace CashReconciliation.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class HealthController : ControllerBase
{
    /// <summary>
    /// Health check endpoint to verify backend service status.
    /// </summary>
    /// <returns>JSON object with status ok</returns>
    [HttpGet]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public IActionResult Get()
    {
        return Ok(new { status = "ok" });
    }
}
