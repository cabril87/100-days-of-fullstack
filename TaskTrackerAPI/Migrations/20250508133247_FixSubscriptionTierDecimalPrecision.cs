using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TaskTrackerAPI.Migrations
{
    /// <inheritdoc />
    public partial class FixSubscriptionTierDecimalPrecision : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "Tasks",
                keyColumn: "Id",
                keyValue: 1,
                column: "UpdatedAt",
                value: new DateTime(2025, 5, 8, 13, 32, 46, 440, DateTimeKind.Utc).AddTicks(2220));

            migrationBuilder.UpdateData(
                table: "Tasks",
                keyColumn: "Id",
                keyValue: 2,
                column: "UpdatedAt",
                value: new DateTime(2025, 5, 8, 13, 32, 46, 440, DateTimeKind.Utc).AddTicks(3823));

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "Email", "FirstName", "LastName" },
                values: new object[] { "CfDJ8HeiyxunoJNOiKpgMimE46fZZPUrjZvA0UZoxZXhFvewQ5E80CctI41TXc2LL0Pcl-5JCwJa_V8afJz8v2MriHqNhydJ2SZ1chgwl2EL0FfRrPotnxygNK3Kbnb50VfdL1EVEqDiApXqckAv-uT8A5U", "CfDJ8HeiyxunoJNOiKpgMimE46fMxADX1B7_CHHBRPT_E1Et3jDR2wHhnAvbVbB3n1WWC_Ha30T3tauewEAUDgzq3zpKbfxx4mhF_KzEnWXXY5WCMwWBu_ZxnVyLrFQCS41sxQ", "CfDJ8HeiyxunoJNOiKpgMimE46cy1vonaR4kIpFWanINGvME5EhUbe5b88NuIwhGJHCP82bOB4uHhgThL9zfOvVoC91lx531HbCTithJpWzloVElxgyo4kNDiCTLRIQenc37aw" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "Tasks",
                keyColumn: "Id",
                keyValue: 1,
                column: "UpdatedAt",
                value: new DateTime(2025, 5, 8, 13, 22, 41, 113, DateTimeKind.Utc).AddTicks(1092));

            migrationBuilder.UpdateData(
                table: "Tasks",
                keyColumn: "Id",
                keyValue: 2,
                column: "UpdatedAt",
                value: new DateTime(2025, 5, 8, 13, 22, 41, 113, DateTimeKind.Utc).AddTicks(2818));

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "Email", "FirstName", "LastName" },
                values: new object[] { "CfDJ8HeiyxunoJNOiKpgMimE46enJDm20fXtid9pDJ9nec19xzHCoegQ8PkVGNk1QqRYuDiP5VRXq_TT8eTgF1MRPdIbgP17iMjAg1GuDfpeqeR2b_5y6kwKZra1AaXbm4RUVgSjMuE4BxHIO6N2mFb7oDY", "CfDJ8HeiyxunoJNOiKpgMimE46c2OH7VPIP2TsTLQrxYpI0yDVjf6OCZfmcvWI_7hEV1TdAlnqZLmwSbZ1e8gQz_fKZa4u6-f5Z4zWhBkh1LH5UMcO7i831ryWp-bPFjW73vEw", "CfDJ8HeiyxunoJNOiKpgMimE46ecwlUNNHifDinelLUjrOh8LAg6-EKUNGlorwGUjK5ev4YM-Mc4vy8lOR7rDNqn0MwHFN_qSdYp6G8DivdEGLpHwbWLxrLOe82IPq27iqpwEQ" });
        }
    }
}
