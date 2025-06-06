using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TaskTrackerAPI.Migrations
{
    /// <inheritdoc />
    public partial class FixUserDTOAndFamilyMemberProperties : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "DateOfBirth",
                table: "FamilyMembers",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsNaturalLeader",
                table: "FamilyMembers",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTime>(
                name: "LastActiveAt",
                table: "FamilyMembers",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Notes",
                table: "FamilyMembers",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "RelatedToMemberId",
                table: "FamilyMembers",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "RelationshipToAdmin",
                table: "FamilyMembers",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "RelationshipToMember",
                table: "FamilyMembers",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "WantsAdminRole",
                table: "FamilyMembers",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.CreateIndex(
                name: "IX_FamilyMembers_RelatedToMemberId",
                table: "FamilyMembers",
                column: "RelatedToMemberId");

            migrationBuilder.AddForeignKey(
                name: "FK_FamilyMembers_FamilyMembers_RelatedToMemberId",
                table: "FamilyMembers",
                column: "RelatedToMemberId",
                principalTable: "FamilyMembers",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_FamilyMembers_FamilyMembers_RelatedToMemberId",
                table: "FamilyMembers");

            migrationBuilder.DropIndex(
                name: "IX_FamilyMembers_RelatedToMemberId",
                table: "FamilyMembers");

            migrationBuilder.DropColumn(
                name: "DateOfBirth",
                table: "FamilyMembers");

            migrationBuilder.DropColumn(
                name: "IsNaturalLeader",
                table: "FamilyMembers");

            migrationBuilder.DropColumn(
                name: "LastActiveAt",
                table: "FamilyMembers");

            migrationBuilder.DropColumn(
                name: "Notes",
                table: "FamilyMembers");

            migrationBuilder.DropColumn(
                name: "RelatedToMemberId",
                table: "FamilyMembers");

            migrationBuilder.DropColumn(
                name: "RelationshipToAdmin",
                table: "FamilyMembers");

            migrationBuilder.DropColumn(
                name: "RelationshipToMember",
                table: "FamilyMembers");

            migrationBuilder.DropColumn(
                name: "WantsAdminRole",
                table: "FamilyMembers");
        }
    }
}
