using CashReconciliation.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace CashReconciliation.Api.Data;

public class CashReconciliationDbContext : DbContext
{
    public CashReconciliationDbContext(DbContextOptions<CashReconciliationDbContext> options)
        : base(options)
    {
    }

    public DbSet<Deposit> Deposits => Set<Deposit>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Deposit>(entity =>
        {
            entity.ToTable("Deposits");

            entity.HasKey(d => d.DepositId);

            entity.Property(d => d.DepositNumber)
                .IsRequired()
                .HasMaxLength(50);

            entity.HasIndex(d => d.DepositNumber)
                .IsUnique();

            entity.Property(d => d.StoreNumber)
                .IsRequired()
                .HasMaxLength(50);

            entity.HasIndex(d => d.StoreNumber);

            entity.Property(d => d.ExpectedAmount)
                .IsRequired()
                .HasPrecision(18, 2);

            entity.Property(d => d.ActualAmount)
                .HasPrecision(18, 2);

            entity.Property(d => d.Variance)
                .HasPrecision(18, 2);

            entity.Property(d => d.Status)
                .IsRequired()
                .HasMaxLength(20);

            entity.HasIndex(d => d.Status);

            entity.Property(d => d.DepositDate)
                .IsRequired()
                .HasColumnType("datetime2");

            entity.HasIndex(d => d.DepositDate);

            entity.Property(d => d.ReconciledAt)
                .HasColumnType("datetime2");

            entity.Property(d => d.CreatedAt)
                .IsRequired()
                .HasColumnType("datetime2");

            // Seed initial sample test data
            entity.HasData(
                new Deposit
                {
                    DepositId = 1,
                    DepositNumber = "DEP1001",
                    StoreNumber = "ST001",
                    ExpectedAmount = 5000.00m,
                    ActualAmount = null,
                    Variance = null,
                    Status = DepositStatus.Pending,
                    DepositDate = new DateTime(2026, 10, 20, 10, 0, 0, DateTimeKind.Utc),
                    CreatedAt = new DateTime(2026, 10, 20, 10, 0, 0, DateTimeKind.Utc)
                },
                new Deposit
                {
                    DepositId = 2,
                    DepositNumber = "DEP1002",
                    StoreNumber = "ST002",
                    ExpectedAmount = 4250.00m,
                    ActualAmount = null,
                    Variance = null,
                    Status = DepositStatus.Pending,
                    DepositDate = new DateTime(2026, 10, 20, 11, 30, 0, DateTimeKind.Utc),
                    CreatedAt = new DateTime(2026, 10, 20, 11, 30, 0, DateTimeKind.Utc)
                },
                new Deposit
                {
                    DepositId = 3,
                    DepositNumber = "DEP1003",
                    StoreNumber = "ST003",
                    ExpectedAmount = 8000.00m,
                    ActualAmount = null,
                    Variance = null,
                    Status = DepositStatus.Pending,
                    DepositDate = new DateTime(2026, 10, 21, 9, 15, 0, DateTimeKind.Utc),
                    CreatedAt = new DateTime(2026, 10, 21, 9, 15, 0, DateTimeKind.Utc)
                },
                new Deposit
                {
                    DepositId = 4,
                    DepositNumber = "DEP1004",
                    StoreNumber = "ST004",
                    ExpectedAmount = 1200.00m,
                    ActualAmount = null,
                    Variance = null,
                    Status = DepositStatus.Pending,
                    DepositDate = new DateTime(2026, 10, 21, 14, 45, 0, DateTimeKind.Utc),
                    CreatedAt = new DateTime(2026, 10, 21, 14, 45, 0, DateTimeKind.Utc)
                },
                new Deposit
                {
                    DepositId = 5,
                    DepositNumber = "DEP1005",
                    StoreNumber = "ST005",
                    ExpectedAmount = 3100.00m,
                    ActualAmount = null,
                    Variance = null,
                    Status = DepositStatus.Pending,
                    DepositDate = new DateTime(2026, 10, 22, 8, 30, 0, DateTimeKind.Utc),
                    CreatedAt = new DateTime(2026, 10, 22, 8, 30, 0, DateTimeKind.Utc)
                }
            );
        });
    }
}
