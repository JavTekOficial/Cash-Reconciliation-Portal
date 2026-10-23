using CashReconciliation.Api.DTOs;
using CashReconciliation.Api.Models;
using CashReconciliation.Api.Repositories;
using CashReconciliation.Api.Services;
using Microsoft.Extensions.Logging;
using Moq;
using Xunit;

namespace BackEnd.Tests;

public class DepositServiceTests
{
    private readonly Mock<IDepositRepository> _repositoryMock;
    private readonly Mock<ILogger<DepositService>> _loggerMock;
    private readonly DepositService _service;

    public DepositServiceTests()
    {
        _repositoryMock = new Mock<IDepositRepository>();
        _loggerMock = new Mock<ILogger<DepositService>>();
        _service = new DepositService(_repositoryMock.Object, _loggerMock.Object);
    }

    [Fact]
    public async Task ReconcileDepositAsync_WhenVarianceIsZero_SetsStatusToReconciled()
    {
        // Arrange
        var existingDeposit = new Deposit
        {
            DepositId = 1,
            DepositNumber = "DEP1001",
            StoreNumber = "ST001",
            ExpectedAmount = 5000.00m,
            Status = DepositStatus.Pending
        };

        _repositoryMock
            .Setup(r => r.GetByIdAsync(1, It.IsAny<CancellationToken>()))
            .ReturnsAsync(existingDeposit);

        var request = new ReconcileDepositRequest { ActualAmount = 5000.00m };

        // Act
        var result = await _service.ReconcileDepositAsync(1, request);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(5000.00m, result.ActualAmount);
        Assert.Equal(0.00m, result.Variance);
        Assert.Equal("Reconciled", result.Status);
        Assert.NotNull(result.ReconciledAt);
        _repositoryMock.Verify(r => r.UpdateAsync(It.Is<Deposit>(d =>
            d.DepositId == 1 &&
            d.ActualAmount == 5000.00m &&
            d.Variance == 0.00m &&
            d.Status == DepositStatus.Reconciled
        ), It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task ReconcileDepositAsync_WhenActualIsGreaterThanExpected_SetsStatusToOver()
    {
        // Arrange
        var existingDeposit = new Deposit
        {
            DepositId = 2,
            DepositNumber = "DEP1002",
            StoreNumber = "ST002",
            ExpectedAmount = 4250.00m,
            Status = DepositStatus.Pending
        };

        _repositoryMock
            .Setup(r => r.GetByIdAsync(2, It.IsAny<CancellationToken>()))
            .ReturnsAsync(existingDeposit);

        var request = new ReconcileDepositRequest { ActualAmount = 4300.00m };

        // Act
        var result = await _service.ReconcileDepositAsync(2, request);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(4300.00m, result.ActualAmount);
        Assert.Equal(50.00m, result.Variance);
        Assert.Equal("Over", result.Status);
        _repositoryMock.Verify(r => r.UpdateAsync(It.Is<Deposit>(d =>
            d.DepositId == 2 &&
            d.ActualAmount == 4300.00m &&
            d.Variance == 50.00m &&
            d.Status == DepositStatus.Over
        ), It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task ReconcileDepositAsync_WhenActualIsLessThanExpected_SetsStatusToShort()
    {
        // Arrange
        var existingDeposit = new Deposit
        {
            DepositId = 3,
            DepositNumber = "DEP1003",
            StoreNumber = "ST003",
            ExpectedAmount = 8000.00m,
            Status = DepositStatus.Pending
        };

        _repositoryMock
            .Setup(r => r.GetByIdAsync(3, It.IsAny<CancellationToken>()))
            .ReturnsAsync(existingDeposit);

        var request = new ReconcileDepositRequest { ActualAmount = 7850.00m };

        // Act
        var result = await _service.ReconcileDepositAsync(3, request);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(7850.00m, result.ActualAmount);
        Assert.Equal(-150.00m, result.Variance);
        Assert.Equal("Short", result.Status);
        _repositoryMock.Verify(r => r.UpdateAsync(It.Is<Deposit>(d =>
            d.DepositId == 3 &&
            d.ActualAmount == 7850.00m &&
            d.Variance == -150.00m &&
            d.Status == DepositStatus.Short
        ), It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task ReconcileDepositAsync_WhenDepositDoesNotExist_ReturnsNull()
    {
        // Arrange
        _repositoryMock
            .Setup(r => r.GetByIdAsync(999, It.IsAny<CancellationToken>()))
            .ReturnsAsync((Deposit?)null);

        var request = new ReconcileDepositRequest { ActualAmount = 1000.00m };

        // Act
        var result = await _service.ReconcileDepositAsync(999, request);

        // Assert
        Assert.Null(result);
        _repositoryMock.Verify(r => r.UpdateAsync(It.IsAny<Deposit>(), It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task CreateDepositAsync_WhenDepositNumberAlreadyExists_ThrowsInvalidOperationException()
    {
        // Arrange
        var request = new CreateDepositRequest
        {
            DepositNumber = "DEP1001",
            StoreNumber = "ST001",
            ExpectedAmount = 5000.00m,
            DepositDate = DateTime.UtcNow
        };

        _repositoryMock
            .Setup(r => r.ExistsAsync("DEP1001", It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);

        // Act & Assert
        await Assert.ThrowsAsync<InvalidOperationException>(() =>
            _service.CreateDepositAsync(request));

        _repositoryMock.Verify(r => r.AddAsync(It.IsAny<Deposit>(), It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task CreateDepositAsync_WhenValid_SetsStatusPendingAndSaves()
    {
        // Arrange
        var request = new CreateDepositRequest
        {
            DepositNumber = "DEP2000",
            StoreNumber = "ST005",
            ExpectedAmount = 2500.00m,
            DepositDate = new DateTime(2026, 10, 22, 12, 0, 0, DateTimeKind.Utc)
        };

        _repositoryMock
            .Setup(r => r.ExistsAsync("DEP2000", It.IsAny<CancellationToken>()))
            .ReturnsAsync(false);

        _repositoryMock
            .Setup(r => r.AddAsync(It.IsAny<Deposit>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((Deposit d, CancellationToken _) =>
            {
                d.DepositId = 10;
                return d;
            });

        // Act
        var result = await _service.CreateDepositAsync(request);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(10, result.DepositId);
        Assert.Equal("DEP2000", result.DepositNumber);
        Assert.Equal("ST005", result.StoreNumber);
        Assert.Equal(2500.00m, result.ExpectedAmount);
        Assert.Null(result.ActualAmount);
        Assert.Null(result.Variance);
        Assert.Equal("Pending", result.Status);
    }

    [Fact]
    public async Task GetDashboardSummaryAsync_ReturnsSummaryFromRepository()
    {
        // Arrange
        var expectedSummary = new DashboardSummaryDto
        {
            TotalDeposits = 10,
            PendingCount = 3,
            ReconciledCount = 5,
            ShortCount = 1,
            OverCount = 1,
            TotalVariance = -50.00m,
            TotalExpectedAmount = 20000.00m,
            TotalActualAmount = 14950.00m
        };

        _repositoryMock
            .Setup(r => r.GetDashboardMetricsAsync(null, It.IsAny<CancellationToken>()))
            .ReturnsAsync(expectedSummary);

        // Act
        var result = await _service.GetDashboardSummaryAsync();

        // Assert
        Assert.NotNull(result);
        Assert.Equal(10, result.TotalDeposits);
        Assert.Equal(3, result.PendingCount);
        Assert.Equal(5, result.ReconciledCount);
        Assert.Equal(-50.00m, result.TotalVariance);
    }

    [Fact]
    public async Task GetDashboardSummaryAsync_WithFilters_PassesFiltersToRepository()
    {
        // Arrange
        var filters = new DepositFilterParams
        {
            StoreNumber = "ST001",
            Status = "Short"
        };

        var expectedSummary = new DashboardSummaryDto
        {
            TotalDeposits = 2,
            PendingCount = 0,
            ReconciledCount = 0,
            ShortCount = 2,
            OverCount = 0,
            TotalVariance = -150.00m,
            TotalExpectedAmount = 8000.00m,
            TotalActualAmount = 7850.00m
        };

        _repositoryMock
            .Setup(r => r.GetDashboardMetricsAsync(filters, It.IsAny<CancellationToken>()))
            .ReturnsAsync(expectedSummary);

        // Act
        var result = await _service.GetDashboardSummaryAsync(filters);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(2, result.TotalDeposits);
        Assert.Equal(2, result.ShortCount);
        Assert.Equal(-150.00m, result.TotalVariance);
        _repositoryMock.Verify(r => r.GetDashboardMetricsAsync(filters, It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task CreateDepositAsync_RecordsAuditLog()
    {
        // Arrange
        var request = new CreateDepositRequest
        {
            DepositNumber = "DEP-AUDIT-1",
            StoreNumber = "ST007",
            ExpectedAmount = 1500.00m,
            DepositDate = DateTime.UtcNow
        };

        _repositoryMock
            .Setup(r => r.ExistsAsync("DEP-AUDIT-1", It.IsAny<CancellationToken>()))
            .ReturnsAsync(false);

        _repositoryMock
            .Setup(r => r.AddAsync(It.IsAny<Deposit>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((Deposit d, CancellationToken _) =>
            {
                d.DepositId = 42;
                return d;
            });

        // Act
        var result = await _service.CreateDepositAsync(request);

        // Assert
        Assert.NotNull(result);
        _repositoryMock.Verify(r => r.AddAuditLogAsync(It.Is<DepositAuditLog>(a =>
            a.DepositId == 42 &&
            a.Action == "Created" &&
            a.PreviousActualAmount == null &&
            a.NewActualAmount == null &&
            a.NewStatus == DepositStatus.Pending &&
            a.PerformedBy == "Operador de Bóveda"
        ), It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task ReconcileDepositAsync_InitialReconciliation_RecordsAuditLogWithReconciledAction()
    {
        // Arrange
        var deposit = new Deposit
        {
            DepositId = 55,
            DepositNumber = "DEP-55",
            StoreNumber = "ST002",
            ExpectedAmount = 2000.00m,
            ActualAmount = null,
            Variance = null,
            Status = DepositStatus.Pending
        };

        _repositoryMock
            .Setup(r => r.GetByIdAsync(55, It.IsAny<CancellationToken>()))
            .ReturnsAsync(deposit);

        var request = new ReconcileDepositRequest { ActualAmount = 2000.00m };

        // Act
        var result = await _service.ReconcileDepositAsync(55, request);

        // Assert
        Assert.NotNull(result);
        _repositoryMock.Verify(r => r.AddAuditLogAsync(It.Is<DepositAuditLog>(a =>
            a.DepositId == 55 &&
            a.Action == "Reconciled" &&
            a.PreviousActualAmount == null &&
            a.NewActualAmount == 2000.00m &&
            a.PreviousStatus == DepositStatus.Pending &&
            a.NewStatus == DepositStatus.Reconciled &&
            a.PreviousVariance == null &&
            a.NewVariance == 0.00m
        ), It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task ReconcileDepositAsync_SubsequentReconciliation_RecordsAuditLogWithReReconciledAction()
    {
        // Arrange
        var deposit = new Deposit
        {
            DepositId = 56,
            DepositNumber = "DEP-56",
            StoreNumber = "ST002",
            ExpectedAmount = 2000.00m,
            ActualAmount = 1900.00m,
            Variance = -100.00m,
            Status = DepositStatus.Short
        };

        _repositoryMock
            .Setup(r => r.GetByIdAsync(56, It.IsAny<CancellationToken>()))
            .ReturnsAsync(deposit);

        var request = new ReconcileDepositRequest { ActualAmount = 2050.00m };

        // Act
        var result = await _service.ReconcileDepositAsync(56, request);

        // Assert
        Assert.NotNull(result);
        _repositoryMock.Verify(r => r.AddAuditLogAsync(It.Is<DepositAuditLog>(a =>
            a.DepositId == 56 &&
            a.Action == "Re-Reconciled" &&
            a.PreviousActualAmount == 1900.00m &&
            a.NewActualAmount == 2050.00m &&
            a.PreviousStatus == DepositStatus.Short &&
            a.NewStatus == DepositStatus.Over &&
            a.PreviousVariance == -100.00m &&
            a.NewVariance == 50.00m
        ), It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task GetAuditLogsAsync_ReturnsMappedDtos()
    {
        // Arrange
        var logs = new List<DepositAuditLog>
        {
            new()
            {
                AuditLogId = 1,
                DepositId = 10,
                Action = "Created",
                NewStatus = DepositStatus.Pending,
                Timestamp = DateTime.UtcNow.AddMinutes(-10)
            },
            new()
            {
                AuditLogId = 2,
                DepositId = 10,
                Action = "Reconciled",
                PreviousStatus = DepositStatus.Pending,
                NewStatus = DepositStatus.Reconciled,
                PreviousActualAmount = null,
                NewActualAmount = 1000m,
                PreviousVariance = null,
                NewVariance = 0m,
                Timestamp = DateTime.UtcNow
            }
        };

        _repositoryMock
            .Setup(r => r.GetAuditLogsByDepositIdAsync(10, It.IsAny<CancellationToken>()))
            .ReturnsAsync(logs);

        // Act
        var result = (await _service.GetAuditLogsAsync(10)).ToList();

        // Assert
        Assert.Equal(2, result.Count);
        Assert.Equal(1, result[0].AuditLogId);
        Assert.Equal("Created", result[0].Action);
        Assert.Equal(2, result[1].AuditLogId);
        Assert.Equal("Reconciled", result[1].Action);
    }
}
