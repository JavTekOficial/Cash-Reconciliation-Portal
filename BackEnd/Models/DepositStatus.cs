namespace CashReconciliation.Api.Models;

public static class DepositStatus
{
    public const string Pending = "Pending";
    public const string Reconciled = "Reconciled";
    public const string Over = "Over";
    public const string Short = "Short";

    public static readonly string[] All = [Pending, Reconciled, Over, Short];
}
