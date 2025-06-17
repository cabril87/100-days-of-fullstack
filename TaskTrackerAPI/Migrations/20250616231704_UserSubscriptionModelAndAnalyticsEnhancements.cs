using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace TaskTrackerAPI.Migrations
{
    /// <inheritdoc />
    public partial class UserSubscriptionModelAndAnalyticsEnhancements : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ChecklistItems_Tasks_TaskId",
                table: "ChecklistItems");

            migrationBuilder.DropForeignKey(
                name: "FK_FocusSessions_Tasks_TaskId",
                table: "FocusSessions");

            migrationBuilder.DropForeignKey(
                name: "FK_Notes_Tasks_TaskItemId",
                table: "Notes");

            migrationBuilder.DropForeignKey(
                name: "FK_PointTransactions_Tasks_TaskId",
                table: "PointTransactions");

            migrationBuilder.DropForeignKey(
                name: "FK_Reminders_Tasks_TaskItemId",
                table: "Reminders");

            migrationBuilder.DropForeignKey(
                name: "FK_Tasks_Boards_BoardId",
                table: "Tasks");

            migrationBuilder.DropForeignKey(
                name: "FK_Tasks_Categories_CategoryId",
                table: "Tasks");

            migrationBuilder.DropForeignKey(
                name: "FK_Tasks_Families_FamilyId",
                table: "Tasks");

            migrationBuilder.DropForeignKey(
                name: "FK_Tasks_FamilyMembers_AssignedToFamilyMemberId",
                table: "Tasks");

            migrationBuilder.DropForeignKey(
                name: "FK_Tasks_Users_ApprovedByUserId",
                table: "Tasks");

            migrationBuilder.DropForeignKey(
                name: "FK_Tasks_Users_AssignedByUserId",
                table: "Tasks");

            migrationBuilder.DropForeignKey(
                name: "FK_Tasks_Users_AssignedToId",
                table: "Tasks");

            migrationBuilder.DropForeignKey(
                name: "FK_Tasks_Users_UserId",
                table: "Tasks");

            migrationBuilder.DropForeignKey(
                name: "FK_TaskTags_Tasks_TaskId",
                table: "TaskTags");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Tasks",
                table: "Tasks");

            migrationBuilder.DropColumn(
                name: "CompletedAt",
                table: "TemplateUsageAnalytics");

            migrationBuilder.DropColumn(
                name: "EfficiencyScore",
                table: "TemplateUsageAnalytics");

            migrationBuilder.DropColumn(
                name: "Feedback",
                table: "TemplateUsageAnalytics");

            migrationBuilder.DropColumn(
                name: "Notes",
                table: "TemplateUsageAnalytics");

            migrationBuilder.DropColumn(
                name: "TasksCompleted",
                table: "TemplateUsageAnalytics");

            migrationBuilder.DropColumn(
                name: "TasksCreated",
                table: "TemplateUsageAnalytics");

            migrationBuilder.DropColumn(
                name: "UsedDate",
                table: "TemplateUsageAnalytics");

            migrationBuilder.DropColumn(
                name: "ExecutionTime",
                table: "AnalyticsQueries");

            migrationBuilder.RenameTable(
                name: "Tasks",
                newName: "TaskItems");

            migrationBuilder.RenameColumn(
                name: "QueryName",
                table: "AnalyticsQueries",
                newName: "Name");

            migrationBuilder.RenameColumn(
                name: "Parameters",
                table: "AnalyticsQueries",
                newName: "QueryDefinition");

            migrationBuilder.RenameIndex(
                name: "IX_Tasks_UserId",
                table: "TaskItems",
                newName: "IX_TaskItems_UserId");

            migrationBuilder.RenameIndex(
                name: "IX_Tasks_FamilyId",
                table: "TaskItems",
                newName: "IX_TaskItems_FamilyId");

            migrationBuilder.RenameIndex(
                name: "IX_Tasks_CategoryId",
                table: "TaskItems",
                newName: "IX_TaskItems_CategoryId");

            migrationBuilder.RenameIndex(
                name: "IX_Tasks_BoardId",
                table: "TaskItems",
                newName: "IX_TaskItems_BoardId");

            migrationBuilder.RenameIndex(
                name: "IX_Tasks_AssignedToId",
                table: "TaskItems",
                newName: "IX_TaskItems_AssignedToId");

            migrationBuilder.RenameIndex(
                name: "IX_Tasks_AssignedToFamilyMemberId",
                table: "TaskItems",
                newName: "IX_TaskItems_AssignedToFamilyMemberId");

            migrationBuilder.RenameIndex(
                name: "IX_Tasks_AssignedByUserId",
                table: "TaskItems",
                newName: "IX_TaskItems_AssignedByUserId");

            migrationBuilder.RenameIndex(
                name: "IX_Tasks_ApprovedByUserId",
                table: "TaskItems",
                newName: "IX_TaskItems_ApprovedByUserId");

            migrationBuilder.AddColumn<DateTime>(
                name: "UsedAt",
                table: "TemplateUsageAnalytics",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<int>(
                name: "ExecutionCount",
                table: "AnalyticsQueries",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<bool>(
                name: "IsPublic",
                table: "AnalyticsQueries",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTime>(
                name: "LastExecuted",
                table: "AnalyticsQueries",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "UpdatedAt",
                table: "AnalyticsQueries",
                type: "datetime2",
                nullable: true,
                defaultValue: new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddPrimaryKey(
                name: "PK_TaskItems",
                table: "TaskItems",
                column: "Id");

            migrationBuilder.CreateTable(
                name: "UserSubscriptions",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserId = table.Column<int>(type: "int", nullable: false),
                    SubscriptionTierId = table.Column<int>(type: "int", nullable: false),
                    SubscriptionType = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    StartDate = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValue: new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified)),
                    EndDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    AutoRenew = table.Column<bool>(type: "bit", nullable: false),
                    MonthlyPrice = table.Column<decimal>(type: "decimal(10,2)", nullable: false),
                    Currency = table.Column<string>(type: "nvarchar(3)", maxLength: 3, nullable: false),
                    PaymentMethod = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    ExternalSubscriptionId = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    CancellationReason = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    CancelledAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CancelledByUserId = table.Column<int>(type: "int", nullable: true),
                    Notes = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    TrialEndDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsTrial = table.Column<bool>(type: "bit", nullable: false),
                    NextBillingDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    LastBillingDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    BillingCyclesCompleted = table.Column<int>(type: "int", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValue: new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified)),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true, defaultValue: new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified))
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserSubscriptions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_UserSubscriptions_SubscriptionTiers_SubscriptionTierId",
                        column: x => x.SubscriptionTierId,
                        principalTable: "SubscriptionTiers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_UserSubscriptions_Users_CancelledByUserId",
                        column: x => x.CancelledByUserId,
                        principalTable: "Users",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_UserSubscriptions_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.UpdateData(
                table: "BoardTemplateColumns",
                keyColumn: "Id",
                keyValue: 1,
                column: "MappedStatus",
                value: 0);

            migrationBuilder.UpdateData(
                table: "BoardTemplateColumns",
                keyColumn: "Id",
                keyValue: 4,
                column: "MappedStatus",
                value: 0);

            migrationBuilder.UpdateData(
                table: "BoardTemplateColumns",
                keyColumn: "Id",
                keyValue: 10,
                column: "MappedStatus",
                value: 0);

            migrationBuilder.UpdateData(
                table: "BoardTemplateColumns",
                keyColumn: "Id",
                keyValue: 15,
                column: "MappedStatus",
                value: 0);

            migrationBuilder.UpdateData(
                table: "BoardTemplateColumns",
                keyColumn: "Id",
                keyValue: 21,
                column: "MappedStatus",
                value: 0);

            migrationBuilder.UpdateData(
                table: "BoardTemplateColumns",
                keyColumn: "Id",
                keyValue: 24,
                column: "MappedStatus",
                value: 0);

            migrationBuilder.UpdateData(
                table: "BoardTemplateColumns",
                keyColumn: "Id",
                keyValue: 29,
                column: "MappedStatus",
                value: 0);

            migrationBuilder.UpdateData(
                table: "BoardTemplateColumns",
                keyColumn: "Id",
                keyValue: 34,
                column: "MappedStatus",
                value: 0);

            migrationBuilder.InsertData(
                table: "BoardTemplates",
                columns: new[] { "Id", "AverageRating", "Category", "CreatedAt", "CreatedByUserId", "Description", "IsDefault", "IsPublic", "LayoutConfiguration", "Name", "PreviewImageUrl", "RatingCount", "Tags", "UpdatedAt", "UsageCount" },
                values: new object[,]
                {
                    { 9, 4.2m, "Personal", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), null, "Basic task tracking with minimal columns", true, true, "{\"theme\":\"minimal\",\"layout\":\"simple\"}", "Simple To-Do", null, 8, "minimal,simple,todo,basic", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), 0 },
                    { 10, 4.4m, "Family", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), null, "Perfect for organizing household tasks and chores", true, true, "{\"theme\":\"family\",\"layout\":\"chores\"}", "Family Chores", null, 12, "household,chores,family,cleaning", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), 0 },
                    { 11, 4.0m, "Family", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), null, "Organize weekly cleaning tasks by room and priority", false, true, "{\"theme\":\"cleaning\",\"layout\":\"weekly\"}", "Weekly Cleaning", null, 5, "cleaning,weekly,household,maintenance", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), 0 },
                    { 12, 4.3m, "Family", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), null, "Plan meals, shopping, and cooking tasks", false, true, "{\"theme\":\"cooking\",\"layout\":\"meal-plan\"}", "Meal Planning", null, 9, "meals,cooking,shopping,planning", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), 0 },
                    { 13, 4.1m, "Family", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), null, "Track home repairs and maintenance tasks", false, true, "{\"theme\":\"maintenance\",\"layout\":\"repair\"}", "Home Maintenance", null, 7, "maintenance,repairs,home,diy", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), 0 },
                    { 14, 4.2m, "Education", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), null, "Organize homework and school assignments", false, true, "{\"theme\":\"education\",\"layout\":\"homework\"}", "School Projects", null, 6, "school,homework,education,students", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), 0 },
                    { 15, 4.0m, "Education", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), null, "Track children's activities and commitments", false, true, "{\"theme\":\"kids\",\"layout\":\"activities\"}", "Kids Activities", null, 4, "kids,activities,schedule,extracurricular", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), 0 },
                    { 16, 4.1m, "Education", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), null, "Track family reading goals and book lists", false, true, "{\"theme\":\"reading\",\"layout\":\"books\"}", "Reading Goals", null, 5, "reading,books,education,goals", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), 0 },
                    { 17, 4.2m, "Health", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), null, "Track appointments, medications, and health goals", false, true, "{\"theme\":\"health\",\"layout\":\"medical\"}", "Family Health", null, 8, "health,medical,appointments,wellness", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), 0 },
                    { 18, 4.0m, "Health", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), null, "Track family fitness activities and goals", false, true, "{\"theme\":\"fitness\",\"layout\":\"workout\"}", "Fitness Goals", null, 6, "fitness,exercise,health,goals", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), 0 },
                    { 19, 4.3m, "Events", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), null, "Plan birthday parties and celebrations", false, true, "{\"theme\":\"party\",\"layout\":\"birthday\"}", "Birthday Planning", null, 7, "birthday,party,celebration,planning", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), 0 },
                    { 20, 4.2m, "Events", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), null, "Organize holiday preparations and traditions", false, true, "{\"theme\":\"holiday\",\"layout\":\"seasonal\"}", "Holiday Planning", null, 9, "holiday,traditions,celebration,seasonal", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), 0 },
                    { 21, 4.4m, "Events", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), null, "Plan family trips and vacations", false, true, "{\"theme\":\"travel\",\"layout\":\"vacation\"}", "Vacation Planning", null, 11, "vacation,travel,planning,family", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), 0 },
                    { 22, 4.1m, "Financial", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), null, "Track family expenses and financial goals", false, true, "{\"theme\":\"finance\",\"layout\":\"budget\"}", "Family Budget", null, 6, "budget,finance,money,expenses", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), 0 },
                    { 23, 4.0m, "Seasonal", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), null, "Plan and track gardening activities", false, true, "{\"theme\":\"garden\",\"layout\":\"seasonal\"}", "Garden Planning", null, 5, "garden,plants,seasonal,outdoor", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), 0 }
                });

            migrationBuilder.InsertData(
                table: "BoardTemplateColumns",
                columns: new[] { "Id", "BoardTemplateId", "Color", "Description", "Icon", "IsCollapsible", "IsDoneColumn", "MappedStatus", "Name", "Order", "TaskLimit" },
                values: new object[,]
                {
                    { 40, 9, "#8B5CF6", "Tasks that haven't been started yet", "clipboard", true, false, 0, "Tasks", 1, null },
                    { 41, 9, "#3B82F6", "Tasks currently being worked on", "play", true, false, 1, "In Progress", 2, 3 },
                    { 42, 9, "#10B981", "Tasks that have been finished", "check", true, true, 4, "Completed", 3, null },
                    { 43, 10, "#6366F1", "Chores assigned to family members", "user", true, false, 0, "Assigned", 1, null },
                    { 44, 10, "#F59E0B", "Chores currently being done", "play", true, false, 1, "In Progress", 2, null },
                    { 45, 10, "#8B5CF6", "Chores waiting for approval", "eye", true, false, 1, "Needs Review", 3, null },
                    { 46, 10, "#10B981", "Chores that have been finished", "check", true, true, 4, "Complete", 4, null },
                    { 47, 11, "#DC2626", "Cleaning tasks assigned for this week", "calendar", true, false, 0, "This Week", 1, null },
                    { 48, 11, "#EA580C", "Cleaning tasks currently being done", "play", true, false, 1, "In Progress", 2, null },
                    { 49, 11, "#10B981", "Cleaning tasks that have been finished", "check", true, true, 4, "Done", 3, null },
                    { 50, 12, "#F59E0B", "Meal ideas and recipes to try", "lightbulb", true, false, 0, "Meal Ideas", 1, null },
                    { 51, 12, "#3B82F6", "Ingredients to buy", "shopping-cart", true, false, 1, "Shopping List", 2, null },
                    { 52, 12, "#8B5CF6", "Meals currently being prepared", "chef-hat", true, false, 1, "Prep & Cook", 3, null },
                    { 53, 12, "#10B981", "Meals that have been served", "check", true, true, 4, "Served", 4, null },
                    { 54, 13, "#EF4444", "Items that need maintenance or repair", "alert-triangle", true, false, 0, "Needs Attention", 1, null },
                    { 55, 13, "#F59E0B", "Maintenance tasks being planned", "calendar", true, false, 1, "Planning", 2, null },
                    { 56, 13, "#3B82F6", "Maintenance tasks currently being worked on", "wrench", true, false, 1, "Working On", 3, null },
                    { 57, 13, "#10B981", "Items that have been fixed or maintained", "check", true, true, 4, "Completed", 4, null },
                    { 58, 14, "#DC2626", "Assignments that need to be started", "book", true, false, 0, "Homework", 1, null },
                    { 59, 14, "#EA580C", "Assignments currently being worked on", "edit", true, false, 1, "Working On", 2, null },
                    { 60, 14, "#9333EA", "Assignments ready for review and submission", "eye", true, false, 1, "Review & Submit", 3, null },
                    { 61, 14, "#059669", "Assignments that have been submitted", "check", true, true, 4, "Submitted", 4, null },
                    { 62, 15, "#6366F1", "Activities scheduled for the future", "calendar", true, false, 0, "Upcoming", 1, null },
                    { 63, 15, "#F59E0B", "Activities happening today", "play", true, false, 1, "Today", 2, null },
                    { 64, 15, "#10B981", "Activities that have been completed", "check", true, true, 4, "Completed", 3, null },
                    { 65, 16, "#8B5CF6", "Books on the reading wishlist", "book", true, false, 0, "Want to Read", 1, null },
                    { 66, 16, "#3B82F6", "Books currently being read", "book-open", true, false, 1, "Currently Reading", 2, null },
                    { 67, 16, "#10B981", "Books that have been completed", "check", true, true, 4, "Finished", 3, null },
                    { 68, 17, "#EF4444", "Health appointments and tasks to schedule", "calendar", true, false, 0, "Schedule", 1, null },
                    { 69, 17, "#F59E0B", "Scheduled health appointments and tasks", "clock", true, false, 1, "Upcoming", 2, null },
                    { 70, 17, "#10B981", "Completed health appointments and tasks", "check", true, true, 4, "Completed", 3, null },
                    { 71, 18, "#6366F1", "Fitness goals to start working on", "target", true, false, 0, "Goals", 1, null },
                    { 72, 18, "#F59E0B", "Fitness goals currently being worked on", "activity", true, false, 1, "Active", 2, null },
                    { 73, 18, "#10B981", "Fitness goals that have been achieved", "trophy", true, true, 4, "Achieved", 3, null },
                    { 74, 19, "#F59E0B", "Birthday party ideas and concepts", "lightbulb", true, false, 0, "Ideas", 1, null },
                    { 75, 19, "#3B82F6", "Birthday party tasks being planned", "calendar", true, false, 1, "Planning", 2, null },
                    { 76, 19, "#8B5CF6", "Birthday party preparations in progress", "gift", true, false, 1, "Preparing", 3, null },
                    { 77, 19, "#10B981", "Birthday party tasks completed", "check", true, true, 4, "Done", 4, null },
                    { 78, 20, "#DC2626", "Holiday traditions and ideas to plan", "star", true, false, 0, "Traditions", 1, null },
                    { 79, 20, "#F59E0B", "Holiday shopping and preparation tasks", "shopping-cart", true, false, 1, "Shopping", 2, null },
                    { 80, 20, "#3B82F6", "Holiday preparations in progress", "gift", true, false, 1, "Preparing", 3, null },
                    { 81, 20, "#10B981", "Holiday traditions completed and celebrated", "check", true, true, 4, "Celebrated", 4, null },
                    { 82, 21, "#6366F1", "Vacation destinations and activities to research", "search", true, false, 0, "Research", 1, null },
                    { 83, 21, "#F59E0B", "Vacation bookings and reservations to make", "calendar", true, false, 1, "Booking", 2, null },
                    { 84, 21, "#8B5CF6", "Vacation preparations in progress", "luggage", true, false, 1, "Preparing", 3, null },
                    { 85, 21, "#10B981", "Vacation activities completed and enjoyed", "check", true, true, 4, "Enjoyed", 4, null },
                    { 86, 22, "#3B82F6", "Expenses and financial goals to plan", "calculator", true, false, 0, "Planned", 1, null },
                    { 87, 22, "#F59E0B", "Expenses pending payment or approval", "clock", true, false, 1, "Pending", 2, null },
                    { 88, 22, "#10B981", "Expenses that have been paid", "check", true, true, 4, "Paid", 3, null },
                    { 89, 23, "#059669", "Garden plans and ideas to develop", "lightbulb", true, false, 0, "Planning", 1, null },
                    { 90, 23, "#10B981", "Seeds and plants being planted", "seedling", true, false, 1, "Planting", 2, null },
                    { 91, 23, "#22C55E", "Plants currently growing and being tended", "leaf", true, false, 1, "Growing", 3, null },
                    { 92, 23, "#16A34A", "Plants that have been harvested or completed", "check", true, true, 4, "Harvested", 4, null }
                });

            migrationBuilder.CreateIndex(
                name: "IX_UserSubscriptions_CancelledByUserId",
                table: "UserSubscriptions",
                column: "CancelledByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_UserSubscriptions_SubscriptionTierId",
                table: "UserSubscriptions",
                column: "SubscriptionTierId");

            migrationBuilder.CreateIndex(
                name: "IX_UserSubscriptions_UserId",
                table: "UserSubscriptions",
                column: "UserId");

            migrationBuilder.AddForeignKey(
                name: "FK_ChecklistItems_TaskItems_TaskId",
                table: "ChecklistItems",
                column: "TaskId",
                principalTable: "TaskItems",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_FocusSessions_TaskItems_TaskId",
                table: "FocusSessions",
                column: "TaskId",
                principalTable: "TaskItems",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Notes_TaskItems_TaskItemId",
                table: "Notes",
                column: "TaskItemId",
                principalTable: "TaskItems",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_PointTransactions_TaskItems_TaskId",
                table: "PointTransactions",
                column: "TaskId",
                principalTable: "TaskItems",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_Reminders_TaskItems_TaskItemId",
                table: "Reminders",
                column: "TaskItemId",
                principalTable: "TaskItems",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_TaskItems_Boards_BoardId",
                table: "TaskItems",
                column: "BoardId",
                principalTable: "Boards",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_TaskItems_Categories_CategoryId",
                table: "TaskItems",
                column: "CategoryId",
                principalTable: "Categories",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_TaskItems_Families_FamilyId",
                table: "TaskItems",
                column: "FamilyId",
                principalTable: "Families",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_TaskItems_FamilyMembers_AssignedToFamilyMemberId",
                table: "TaskItems",
                column: "AssignedToFamilyMemberId",
                principalTable: "FamilyMembers",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_TaskItems_Users_ApprovedByUserId",
                table: "TaskItems",
                column: "ApprovedByUserId",
                principalTable: "Users",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_TaskItems_Users_AssignedByUserId",
                table: "TaskItems",
                column: "AssignedByUserId",
                principalTable: "Users",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_TaskItems_Users_AssignedToId",
                table: "TaskItems",
                column: "AssignedToId",
                principalTable: "Users",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_TaskItems_Users_UserId",
                table: "TaskItems",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_TaskTags_TaskItems_TaskId",
                table: "TaskTags",
                column: "TaskId",
                principalTable: "TaskItems",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ChecklistItems_TaskItems_TaskId",
                table: "ChecklistItems");

            migrationBuilder.DropForeignKey(
                name: "FK_FocusSessions_TaskItems_TaskId",
                table: "FocusSessions");

            migrationBuilder.DropForeignKey(
                name: "FK_Notes_TaskItems_TaskItemId",
                table: "Notes");

            migrationBuilder.DropForeignKey(
                name: "FK_PointTransactions_TaskItems_TaskId",
                table: "PointTransactions");

            migrationBuilder.DropForeignKey(
                name: "FK_Reminders_TaskItems_TaskItemId",
                table: "Reminders");

            migrationBuilder.DropForeignKey(
                name: "FK_TaskItems_Boards_BoardId",
                table: "TaskItems");

            migrationBuilder.DropForeignKey(
                name: "FK_TaskItems_Categories_CategoryId",
                table: "TaskItems");

            migrationBuilder.DropForeignKey(
                name: "FK_TaskItems_Families_FamilyId",
                table: "TaskItems");

            migrationBuilder.DropForeignKey(
                name: "FK_TaskItems_FamilyMembers_AssignedToFamilyMemberId",
                table: "TaskItems");

            migrationBuilder.DropForeignKey(
                name: "FK_TaskItems_Users_ApprovedByUserId",
                table: "TaskItems");

            migrationBuilder.DropForeignKey(
                name: "FK_TaskItems_Users_AssignedByUserId",
                table: "TaskItems");

            migrationBuilder.DropForeignKey(
                name: "FK_TaskItems_Users_AssignedToId",
                table: "TaskItems");

            migrationBuilder.DropForeignKey(
                name: "FK_TaskItems_Users_UserId",
                table: "TaskItems");

            migrationBuilder.DropForeignKey(
                name: "FK_TaskTags_TaskItems_TaskId",
                table: "TaskTags");

            migrationBuilder.DropTable(
                name: "UserSubscriptions");

            migrationBuilder.DropPrimaryKey(
                name: "PK_TaskItems",
                table: "TaskItems");

            migrationBuilder.DeleteData(
                table: "BoardTemplateColumns",
                keyColumn: "Id",
                keyValue: 40);

            migrationBuilder.DeleteData(
                table: "BoardTemplateColumns",
                keyColumn: "Id",
                keyValue: 41);

            migrationBuilder.DeleteData(
                table: "BoardTemplateColumns",
                keyColumn: "Id",
                keyValue: 42);

            migrationBuilder.DeleteData(
                table: "BoardTemplateColumns",
                keyColumn: "Id",
                keyValue: 43);

            migrationBuilder.DeleteData(
                table: "BoardTemplateColumns",
                keyColumn: "Id",
                keyValue: 44);

            migrationBuilder.DeleteData(
                table: "BoardTemplateColumns",
                keyColumn: "Id",
                keyValue: 45);

            migrationBuilder.DeleteData(
                table: "BoardTemplateColumns",
                keyColumn: "Id",
                keyValue: 46);

            migrationBuilder.DeleteData(
                table: "BoardTemplateColumns",
                keyColumn: "Id",
                keyValue: 47);

            migrationBuilder.DeleteData(
                table: "BoardTemplateColumns",
                keyColumn: "Id",
                keyValue: 48);

            migrationBuilder.DeleteData(
                table: "BoardTemplateColumns",
                keyColumn: "Id",
                keyValue: 49);

            migrationBuilder.DeleteData(
                table: "BoardTemplateColumns",
                keyColumn: "Id",
                keyValue: 50);

            migrationBuilder.DeleteData(
                table: "BoardTemplateColumns",
                keyColumn: "Id",
                keyValue: 51);

            migrationBuilder.DeleteData(
                table: "BoardTemplateColumns",
                keyColumn: "Id",
                keyValue: 52);

            migrationBuilder.DeleteData(
                table: "BoardTemplateColumns",
                keyColumn: "Id",
                keyValue: 53);

            migrationBuilder.DeleteData(
                table: "BoardTemplateColumns",
                keyColumn: "Id",
                keyValue: 54);

            migrationBuilder.DeleteData(
                table: "BoardTemplateColumns",
                keyColumn: "Id",
                keyValue: 55);

            migrationBuilder.DeleteData(
                table: "BoardTemplateColumns",
                keyColumn: "Id",
                keyValue: 56);

            migrationBuilder.DeleteData(
                table: "BoardTemplateColumns",
                keyColumn: "Id",
                keyValue: 57);

            migrationBuilder.DeleteData(
                table: "BoardTemplateColumns",
                keyColumn: "Id",
                keyValue: 58);

            migrationBuilder.DeleteData(
                table: "BoardTemplateColumns",
                keyColumn: "Id",
                keyValue: 59);

            migrationBuilder.DeleteData(
                table: "BoardTemplateColumns",
                keyColumn: "Id",
                keyValue: 60);

            migrationBuilder.DeleteData(
                table: "BoardTemplateColumns",
                keyColumn: "Id",
                keyValue: 61);

            migrationBuilder.DeleteData(
                table: "BoardTemplateColumns",
                keyColumn: "Id",
                keyValue: 62);

            migrationBuilder.DeleteData(
                table: "BoardTemplateColumns",
                keyColumn: "Id",
                keyValue: 63);

            migrationBuilder.DeleteData(
                table: "BoardTemplateColumns",
                keyColumn: "Id",
                keyValue: 64);

            migrationBuilder.DeleteData(
                table: "BoardTemplateColumns",
                keyColumn: "Id",
                keyValue: 65);

            migrationBuilder.DeleteData(
                table: "BoardTemplateColumns",
                keyColumn: "Id",
                keyValue: 66);

            migrationBuilder.DeleteData(
                table: "BoardTemplateColumns",
                keyColumn: "Id",
                keyValue: 67);

            migrationBuilder.DeleteData(
                table: "BoardTemplateColumns",
                keyColumn: "Id",
                keyValue: 68);

            migrationBuilder.DeleteData(
                table: "BoardTemplateColumns",
                keyColumn: "Id",
                keyValue: 69);

            migrationBuilder.DeleteData(
                table: "BoardTemplateColumns",
                keyColumn: "Id",
                keyValue: 70);

            migrationBuilder.DeleteData(
                table: "BoardTemplateColumns",
                keyColumn: "Id",
                keyValue: 71);

            migrationBuilder.DeleteData(
                table: "BoardTemplateColumns",
                keyColumn: "Id",
                keyValue: 72);

            migrationBuilder.DeleteData(
                table: "BoardTemplateColumns",
                keyColumn: "Id",
                keyValue: 73);

            migrationBuilder.DeleteData(
                table: "BoardTemplateColumns",
                keyColumn: "Id",
                keyValue: 74);

            migrationBuilder.DeleteData(
                table: "BoardTemplateColumns",
                keyColumn: "Id",
                keyValue: 75);

            migrationBuilder.DeleteData(
                table: "BoardTemplateColumns",
                keyColumn: "Id",
                keyValue: 76);

            migrationBuilder.DeleteData(
                table: "BoardTemplateColumns",
                keyColumn: "Id",
                keyValue: 77);

            migrationBuilder.DeleteData(
                table: "BoardTemplateColumns",
                keyColumn: "Id",
                keyValue: 78);

            migrationBuilder.DeleteData(
                table: "BoardTemplateColumns",
                keyColumn: "Id",
                keyValue: 79);

            migrationBuilder.DeleteData(
                table: "BoardTemplateColumns",
                keyColumn: "Id",
                keyValue: 80);

            migrationBuilder.DeleteData(
                table: "BoardTemplateColumns",
                keyColumn: "Id",
                keyValue: 81);

            migrationBuilder.DeleteData(
                table: "BoardTemplateColumns",
                keyColumn: "Id",
                keyValue: 82);

            migrationBuilder.DeleteData(
                table: "BoardTemplateColumns",
                keyColumn: "Id",
                keyValue: 83);

            migrationBuilder.DeleteData(
                table: "BoardTemplateColumns",
                keyColumn: "Id",
                keyValue: 84);

            migrationBuilder.DeleteData(
                table: "BoardTemplateColumns",
                keyColumn: "Id",
                keyValue: 85);

            migrationBuilder.DeleteData(
                table: "BoardTemplateColumns",
                keyColumn: "Id",
                keyValue: 86);

            migrationBuilder.DeleteData(
                table: "BoardTemplateColumns",
                keyColumn: "Id",
                keyValue: 87);

            migrationBuilder.DeleteData(
                table: "BoardTemplateColumns",
                keyColumn: "Id",
                keyValue: 88);

            migrationBuilder.DeleteData(
                table: "BoardTemplateColumns",
                keyColumn: "Id",
                keyValue: 89);

            migrationBuilder.DeleteData(
                table: "BoardTemplateColumns",
                keyColumn: "Id",
                keyValue: 90);

            migrationBuilder.DeleteData(
                table: "BoardTemplateColumns",
                keyColumn: "Id",
                keyValue: 91);

            migrationBuilder.DeleteData(
                table: "BoardTemplateColumns",
                keyColumn: "Id",
                keyValue: 92);

            migrationBuilder.DeleteData(
                table: "BoardTemplates",
                keyColumn: "Id",
                keyValue: 9);

            migrationBuilder.DeleteData(
                table: "BoardTemplates",
                keyColumn: "Id",
                keyValue: 10);

            migrationBuilder.DeleteData(
                table: "BoardTemplates",
                keyColumn: "Id",
                keyValue: 11);

            migrationBuilder.DeleteData(
                table: "BoardTemplates",
                keyColumn: "Id",
                keyValue: 12);

            migrationBuilder.DeleteData(
                table: "BoardTemplates",
                keyColumn: "Id",
                keyValue: 13);

            migrationBuilder.DeleteData(
                table: "BoardTemplates",
                keyColumn: "Id",
                keyValue: 14);

            migrationBuilder.DeleteData(
                table: "BoardTemplates",
                keyColumn: "Id",
                keyValue: 15);

            migrationBuilder.DeleteData(
                table: "BoardTemplates",
                keyColumn: "Id",
                keyValue: 16);

            migrationBuilder.DeleteData(
                table: "BoardTemplates",
                keyColumn: "Id",
                keyValue: 17);

            migrationBuilder.DeleteData(
                table: "BoardTemplates",
                keyColumn: "Id",
                keyValue: 18);

            migrationBuilder.DeleteData(
                table: "BoardTemplates",
                keyColumn: "Id",
                keyValue: 19);

            migrationBuilder.DeleteData(
                table: "BoardTemplates",
                keyColumn: "Id",
                keyValue: 20);

            migrationBuilder.DeleteData(
                table: "BoardTemplates",
                keyColumn: "Id",
                keyValue: 21);

            migrationBuilder.DeleteData(
                table: "BoardTemplates",
                keyColumn: "Id",
                keyValue: 22);

            migrationBuilder.DeleteData(
                table: "BoardTemplates",
                keyColumn: "Id",
                keyValue: 23);

            migrationBuilder.DropColumn(
                name: "UsedAt",
                table: "TemplateUsageAnalytics");

            migrationBuilder.DropColumn(
                name: "ExecutionCount",
                table: "AnalyticsQueries");

            migrationBuilder.DropColumn(
                name: "IsPublic",
                table: "AnalyticsQueries");

            migrationBuilder.DropColumn(
                name: "LastExecuted",
                table: "AnalyticsQueries");

            migrationBuilder.DropColumn(
                name: "UpdatedAt",
                table: "AnalyticsQueries");

            migrationBuilder.RenameTable(
                name: "TaskItems",
                newName: "Tasks");

            migrationBuilder.RenameColumn(
                name: "QueryDefinition",
                table: "AnalyticsQueries",
                newName: "Parameters");

            migrationBuilder.RenameColumn(
                name: "Name",
                table: "AnalyticsQueries",
                newName: "QueryName");

            migrationBuilder.RenameIndex(
                name: "IX_TaskItems_UserId",
                table: "Tasks",
                newName: "IX_Tasks_UserId");

            migrationBuilder.RenameIndex(
                name: "IX_TaskItems_FamilyId",
                table: "Tasks",
                newName: "IX_Tasks_FamilyId");

            migrationBuilder.RenameIndex(
                name: "IX_TaskItems_CategoryId",
                table: "Tasks",
                newName: "IX_Tasks_CategoryId");

            migrationBuilder.RenameIndex(
                name: "IX_TaskItems_BoardId",
                table: "Tasks",
                newName: "IX_Tasks_BoardId");

            migrationBuilder.RenameIndex(
                name: "IX_TaskItems_AssignedToId",
                table: "Tasks",
                newName: "IX_Tasks_AssignedToId");

            migrationBuilder.RenameIndex(
                name: "IX_TaskItems_AssignedToFamilyMemberId",
                table: "Tasks",
                newName: "IX_Tasks_AssignedToFamilyMemberId");

            migrationBuilder.RenameIndex(
                name: "IX_TaskItems_AssignedByUserId",
                table: "Tasks",
                newName: "IX_Tasks_AssignedByUserId");

            migrationBuilder.RenameIndex(
                name: "IX_TaskItems_ApprovedByUserId",
                table: "Tasks",
                newName: "IX_Tasks_ApprovedByUserId");

            migrationBuilder.AddColumn<DateTime>(
                name: "CompletedAt",
                table: "TemplateUsageAnalytics",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "EfficiencyScore",
                table: "TemplateUsageAnalytics",
                type: "decimal(18,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<string>(
                name: "Feedback",
                table: "TemplateUsageAnalytics",
                type: "nvarchar(1000)",
                maxLength: 1000,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Notes",
                table: "TemplateUsageAnalytics",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "TasksCompleted",
                table: "TemplateUsageAnalytics",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "TasksCreated",
                table: "TemplateUsageAnalytics",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<DateTime>(
                name: "UsedDate",
                table: "TemplateUsageAnalytics",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<double>(
                name: "ExecutionTime",
                table: "AnalyticsQueries",
                type: "float",
                nullable: false,
                defaultValue: 0.0);

            migrationBuilder.AddPrimaryKey(
                name: "PK_Tasks",
                table: "Tasks",
                column: "Id");

            migrationBuilder.UpdateData(
                table: "BoardTemplateColumns",
                keyColumn: "Id",
                keyValue: 1,
                column: "MappedStatus",
                value: 3);

            migrationBuilder.UpdateData(
                table: "BoardTemplateColumns",
                keyColumn: "Id",
                keyValue: 4,
                column: "MappedStatus",
                value: 3);

            migrationBuilder.UpdateData(
                table: "BoardTemplateColumns",
                keyColumn: "Id",
                keyValue: 10,
                column: "MappedStatus",
                value: 3);

            migrationBuilder.UpdateData(
                table: "BoardTemplateColumns",
                keyColumn: "Id",
                keyValue: 15,
                column: "MappedStatus",
                value: 3);

            migrationBuilder.UpdateData(
                table: "BoardTemplateColumns",
                keyColumn: "Id",
                keyValue: 21,
                column: "MappedStatus",
                value: 3);

            migrationBuilder.UpdateData(
                table: "BoardTemplateColumns",
                keyColumn: "Id",
                keyValue: 24,
                column: "MappedStatus",
                value: 3);

            migrationBuilder.UpdateData(
                table: "BoardTemplateColumns",
                keyColumn: "Id",
                keyValue: 29,
                column: "MappedStatus",
                value: 3);

            migrationBuilder.UpdateData(
                table: "BoardTemplateColumns",
                keyColumn: "Id",
                keyValue: 34,
                column: "MappedStatus",
                value: 3);

            migrationBuilder.AddForeignKey(
                name: "FK_ChecklistItems_Tasks_TaskId",
                table: "ChecklistItems",
                column: "TaskId",
                principalTable: "Tasks",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_FocusSessions_Tasks_TaskId",
                table: "FocusSessions",
                column: "TaskId",
                principalTable: "Tasks",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Notes_Tasks_TaskItemId",
                table: "Notes",
                column: "TaskItemId",
                principalTable: "Tasks",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_PointTransactions_Tasks_TaskId",
                table: "PointTransactions",
                column: "TaskId",
                principalTable: "Tasks",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_Reminders_Tasks_TaskItemId",
                table: "Reminders",
                column: "TaskItemId",
                principalTable: "Tasks",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Tasks_Boards_BoardId",
                table: "Tasks",
                column: "BoardId",
                principalTable: "Boards",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_Tasks_Categories_CategoryId",
                table: "Tasks",
                column: "CategoryId",
                principalTable: "Categories",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_Tasks_Families_FamilyId",
                table: "Tasks",
                column: "FamilyId",
                principalTable: "Families",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Tasks_FamilyMembers_AssignedToFamilyMemberId",
                table: "Tasks",
                column: "AssignedToFamilyMemberId",
                principalTable: "FamilyMembers",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Tasks_Users_ApprovedByUserId",
                table: "Tasks",
                column: "ApprovedByUserId",
                principalTable: "Users",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Tasks_Users_AssignedByUserId",
                table: "Tasks",
                column: "AssignedByUserId",
                principalTable: "Users",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Tasks_Users_AssignedToId",
                table: "Tasks",
                column: "AssignedToId",
                principalTable: "Users",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Tasks_Users_UserId",
                table: "Tasks",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_TaskTags_Tasks_TaskId",
                table: "TaskTags",
                column: "TaskId",
                principalTable: "Tasks",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
