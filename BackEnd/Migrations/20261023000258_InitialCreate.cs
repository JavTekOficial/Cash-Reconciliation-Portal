using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace CashReconciliation.Api.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Deposits",
                columns: table => new
                {
                    DepositId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    DepositNumber = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    StoreNumber = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    ExpectedAmount = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    ActualAmount = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: true),
                    Variance = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: true),
                    Status = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    DepositDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ReconciledAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Deposits", x => x.DepositId);
                });

            migrationBuilder.InsertData(
                table: "Deposits",
                columns: new[] { "DepositId", "ActualAmount", "CreatedAt", "DepositDate", "DepositNumber", "ExpectedAmount", "ReconciledAt", "Status", "StoreNumber", "Variance" },
                values: new object[,]
                {
                    { 1, null, new DateTime(2026, 10, 20, 10, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 10, 20, 10, 0, 0, 0, DateTimeKind.Utc), "DEP1001", 5000.00m, null, "Pending", "ST001", null },
                    { 2, null, new DateTime(2026, 10, 20, 11, 30, 0, 0, DateTimeKind.Utc), new DateTime(2026, 10, 20, 11, 30, 0, 0, DateTimeKind.Utc), "DEP1002", 4250.00m, null, "Pending", "ST002", null },
                    { 3, null, new DateTime(2026, 10, 21, 9, 15, 0, 0, DateTimeKind.Utc), new DateTime(2026, 10, 21, 9, 15, 0, 0, DateTimeKind.Utc), "DEP1003", 8000.00m, null, "Pending", "ST003", null },
                    { 4, null, new DateTime(2026, 10, 21, 14, 45, 0, 0, DateTimeKind.Utc), new DateTime(2026, 10, 21, 14, 45, 0, 0, DateTimeKind.Utc), "DEP1004", 1200.00m, null, "Pending", "ST004", null },
                    { 5, null, new DateTime(2026, 10, 22, 8, 30, 0, 0, DateTimeKind.Utc), new DateTime(2026, 10, 22, 8, 30, 0, 0, DateTimeKind.Utc), "DEP1005", 3100.00m, null, "Pending", "ST005", null }
                });

            migrationBuilder.CreateIndex(
                name: "IX_Deposits_DepositDate",
                table: "Deposits",
                column: "DepositDate");

            migrationBuilder.CreateIndex(
                name: "IX_Deposits_DepositNumber",
                table: "Deposits",
                column: "DepositNumber",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Deposits_Status",
                table: "Deposits",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_Deposits_StoreNumber",
                table: "Deposits",
                column: "StoreNumber");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Deposits");
        }
    }
}
