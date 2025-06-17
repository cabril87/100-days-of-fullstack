/*
 * Copyright (c) 2025 Carlos Abril Jr
 * All rights reserved.
 *
 * This source code is licensed under the Business Source License 1.1
 * found in the LICENSE file in the root directory of this source tree.
 *
 * This file may not be used, copied, modified, or distributed except in
 * accordance with the terms contained in the LICENSE file.
 */
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using TaskTrackerAPI.DTOs.Family;
using TaskTrackerAPI.DTOs.Auth;
using TaskTrackerAPI.Models;
using TaskTrackerAPI.Services.Interfaces;
using TaskTrackerAPI.Repositories.Interfaces;
using AutoMapper;

namespace TaskTrackerAPI.Services;

/// <summary>
/// Service for family data seeding (Admin only functionality)
/// </summary>
public class FamilySeedingService : IFamilySeedingService
{
    private readonly IFamilyRepository _familyRepository;
    private readonly IFamilyMemberRepository _familyMemberRepository;
    private readonly IFamilyRoleRepository _familyRoleRepository;
    private readonly IUserRepository _userRepository;
    private readonly IAuthService _authService;
    private readonly ILogger<FamilySeedingService> _logger;
    private readonly IMapper _mapper;

    public FamilySeedingService(
        IFamilyRepository familyRepository,
        IFamilyMemberRepository familyMemberRepository,
        IFamilyRoleRepository familyRoleRepository,
        IUserRepository userRepository,
        IAuthService authService,
        ILogger<FamilySeedingService> logger,
        IMapper mapper)
    {
        _familyRepository = familyRepository;
        _familyMemberRepository = familyMemberRepository;
        _familyRoleRepository = familyRoleRepository;
        _userRepository = userRepository;
        _authService = authService;
        _logger = logger;
        _mapper = mapper;
    }

    public async Task<FamilySeedingResponseDTO> SeedFamilyAsync(FamilySeedingRequestDTO request, int adminUserId)
    {
        try
        {
            _logger.LogInformation("Starting family seeding for scenario {Scenario} by admin {AdminUserId}", 
                request.Scenario, adminUserId);

            // Verify admin permissions
            User? adminUser = await _userRepository.GetUserByIdAsync(adminUserId);
            if (adminUser == null || !IsGlobalAdmin(adminUser))
            {
                throw new UnauthorizedAccessException("Only global admins can seed family data");
            }

            // Clear existing test families if requested
            if (request.ClearExisting)
            {
                await ClearTestFamiliesAsync(adminUserId);
            }

            // Handle clear all scenario
            if (request.Scenario == FamilyScenario.ClearAll || request.MemberCount == 0)
            {
                int cleared = await ClearTestFamiliesAsync(adminUserId);
                return new FamilySeedingResponseDTO
                {
                    Success = true,
                    Message = $"Cleared {cleared} test families",
                    MembersCreated = 0
                };
            }

            // Create family
            Family family = await CreateTestFamilyAsync(request.FamilyName ?? GetScenarioName(request.Scenario), adminUserId);

            // Get family roles
            IEnumerable<FamilyRole> rolesEnum = await _familyRoleRepository.GetAllAsync();
            List<FamilyRole> roles = rolesEnum.ToList();
            FamilyRole adminRole = roles.First(r => r.Name == "Admin");
            FamilyRole memberRole = roles.First(r => r.Name == "Member");

            // Generate family members based on scenario
            List<CustomFamilyMemberDTO> membersToCreate = request.Scenario == FamilyScenario.Custom && request.CustomMembers != null
                ? request.CustomMembers
                : GenerateMembersForScenario(request.Scenario, request.MemberCount);

            // Limit members if count specified
            if (request.MemberCount > 0 && membersToCreate.Count > request.MemberCount)
            {
                membersToCreate = membersToCreate.Take(request.MemberCount).ToList();
            }

            // First, add the requesting admin user as a family member if they're not already included
            User? requestingAdmin = await _userRepository.GetUserByIdAsync(adminUserId);
            if (requestingAdmin != null)
            {
                _logger.LogInformation("SEEDING: Admin user {AdminUserId} ({AdminEmail}) is seeding family {FamilyId} ({FamilyName})", 
                    adminUserId, requestingAdmin.Email, family.Id, family.Name);
                
                // Check if the requesting admin is already in the member list
                // We need to check if any generated member will use the admin's email (indicating the same user)
                bool adminAlreadyIncluded = membersToCreate.Any(m => 
                    !string.IsNullOrEmpty(m.Email) && 
                    m.Email.Equals(requestingAdmin.Email, StringComparison.OrdinalIgnoreCase));
                
                _logger.LogInformation("SEEDING: Admin {AdminUserId} ({AdminEmail}) - already included check: {AlreadyIncluded}", 
                    adminUserId, requestingAdmin.Email, adminAlreadyIncluded);
                
                if (!adminAlreadyIncluded)
                {
                    // Add the requesting admin as the family admin
                    FamilyMember adminFamilyMember = new FamilyMember
                    {
                        UserId = adminUserId,
                        FamilyId = family.Id,
                        RoleId = adminRole.Id,
                        Name = $"{requestingAdmin.FirstName} {requestingAdmin.LastName}".Trim(),
                        Email = requestingAdmin.Email,
                        RelationshipToAdmin = FamilyRelationshipType.Self,
                        WantsAdminRole = true,
                        IsNaturalLeader = true,
                        DateOfBirth = DateTime.UtcNow.AddYears(-30), // Default to 30 years old for admin
                        Notes = "Global admin user who created this test family",
                        IsPending = false,
                        ProfileCompleted = true,
                        ApprovedAt = DateTime.UtcNow
                    };

                    await _familyMemberRepository.CreateAsync(adminFamilyMember);
                    
                    _logger.LogInformation("SEEDING: ✅ Successfully added admin {AdminUserId} ({AdminEmail}) as family member with admin role in family {FamilyId}", 
                        adminUserId, requestingAdmin.Email, family.Id);
                }
                else
                {
                    _logger.LogInformation("SEEDING: Admin {AdminUserId} was already included in member list for family {FamilyId}", 
                        adminUserId, family.Id);
                }
            }
            else
            {
                _logger.LogWarning("SEEDING: Could not find admin user {AdminUserId} in database!", adminUserId);
            }

            // Create family members
            List<SeededMemberInfoDTO> seededMembers = new List<SeededMemberInfoDTO>();
            int adminMemberIndex = 0; // First member is usually admin

            for (int i = 0; i < membersToCreate.Count; i++)
            {
                CustomFamilyMemberDTO memberConfig = membersToCreate[i];
                
                // Generate unique user data
                string testEmail = memberConfig.Email ?? GenerateTestEmail(memberConfig.Name);
                string testUsername = GenerateUsername(memberConfig.Name);
                
                // Check if user with this email already exists
                User? existingUser = await _userRepository.GetUserByEmailAsync(testEmail);
                UserDTO user;
                
                if (existingUser != null)
                {
                    _logger.LogWarning("User with email {Email} already exists, using existing user for seeding", testEmail);
                    // Map existing user to UserDTO for consistency
                    user = new UserDTO
                    {
                        Id = existingUser.Id,
                        Username = existingUser.Username,
                        Email = existingUser.Email,
                        FirstName = existingUser.FirstName,
                        LastName = existingUser.LastName,
                        AgeGroup = _mapper.Map<FamilyMemberAgeGroupDTO>(existingUser.AgeGroup)
                    };
                }
                else
                {
                    // Create new user account
                    UserCreateDTO userCreateDto = new UserCreateDTO
                    {
                        Username = testUsername,
                        Email = testEmail,
                        Password = "TestPassword123!",
                        ConfirmPassword = "TestPassword123!",
                        FirstName = memberConfig.Name.Split(' ').FirstOrDefault(),
                        LastName = memberConfig.Name.Split(' ').Skip(1).FirstOrDefault() ?? "Test",
                        AgeGroup = memberConfig.AgeGroup,
                        DateOfBirth = memberConfig.DateOfBirth ?? GenerateDateOfBirth(_mapper.Map<FamilyMemberAgeGroup>(memberConfig.AgeGroup))
                    };

                    user = await _authService.RegisterUserAsync(userCreateDto);
                }

                // Create family member
                FamilyRole roleToAssign = memberConfig.RoleName == "Admin" || i == adminMemberIndex 
                    ? adminRole 
                    : memberRole;

                FamilyMember familyMember = new FamilyMember
                {
                    UserId = user.Id,
                    FamilyId = family.Id,
                    RoleId = roleToAssign.Id,
                    Name = memberConfig.Name,
                    Email = user.Email, // Use the email from the user object
                    RelationshipToAdmin = memberConfig.RelationshipToAdmin,
                    RelationshipToMember = memberConfig.RelationshipToMember,
                    RelatedToMemberId = memberConfig.RelatedToMemberId,
                    WantsAdminRole = memberConfig.WantsAdminRole,
                    IsNaturalLeader = memberConfig.IsNaturalLeader,
                    DateOfBirth = memberConfig.DateOfBirth,
                    Notes = memberConfig.Notes ?? $"Test member created for {request.Scenario} scenario",
                    IsPending = false,
                    ProfileCompleted = true,
                    ApprovedAt = DateTime.UtcNow
                };

                await _familyMemberRepository.CreateAsync(familyMember);

                seededMembers.Add(new SeededMemberInfoDTO
                {
                    Id = familyMember.Id,
                    Name = memberConfig.Name,
                    Email = user.Email, // Use the email from the user object
                    AgeGroup = memberConfig.AgeGroup,
                    RelationshipToAdmin = memberConfig.RelationshipToAdmin,
                    RoleName = roleToAssign.Name,
                    IsAdmin = roleToAssign.Name == "Admin",
                    TestPassword = existingUser != null ? "[Use existing password]" : "TestPassword123!"
                });

                _logger.LogInformation("Created test family member: {Name} ({Email}) with role {Role}", 
                    memberConfig.Name, user.Email, roleToAssign.Name);
            }

            // Add the requesting admin to the seeded members list if they were added to the family
            if (requestingAdmin != null)
            {
                bool adminAlreadyIncluded = membersToCreate.Any(m => m.RelationshipToAdmin == FamilyRelationshipType.Self);
                if (!adminAlreadyIncluded)
                {
                    seededMembers.Insert(0, new SeededMemberInfoDTO
                    {
                        Id = adminUserId,
                        Name = $"{requestingAdmin.FirstName} {requestingAdmin.LastName}".Trim(),
                        Email = requestingAdmin.Email,
                        AgeGroup = _mapper.Map<FamilyMemberAgeGroupDTO>(requestingAdmin.AgeGroup),
                        RelationshipToAdmin = FamilyRelationshipType.Self,
                        RoleName = "Admin",
                        IsAdmin = true,
                        TestPassword = "[Use your existing password]"
                    });
                }
            }

            return new FamilySeedingResponseDTO
            {
                Success = true,
                Message = $"Successfully seeded {request.Scenario} scenario with {seededMembers.Count} members",
                FamilyId = family.Id,
                FamilyName = family.Name,
                MembersCreated = seededMembers.Count,
                SeededMembers = seededMembers
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error seeding family data for scenario {Scenario}", request.Scenario);
            return new FamilySeedingResponseDTO
            {
                Success = false,
                Message = $"Failed to seed family: {ex.Message}"
            };
        }
    }

    public async Task<List<FamilyScenarioInfoDTO>> GetAvailableScenariosAsync()
    {
        return await Task.FromResult(new List<FamilyScenarioInfoDTO>
        {
            new FamilyScenarioInfoDTO
            {
                Scenario = FamilyScenario.ClearAll,
                Name = "Clear All",
                Description = "Remove all test family data",
                DefaultMemberCount = 0,
                MemberTypes = new List<string>(),
                TestCases = new List<string> { "Data cleanup", "Reset environment" }
            },
            new FamilyScenarioInfoDTO
            {
                Scenario = FamilyScenario.NuclearFamily,
                Name = "Nuclear Family",
                Description = "Traditional family with 2 parents and children",
                DefaultMemberCount = 4,
                MemberTypes = new List<string> { "Dad (Admin)", "Mom", "Teen Son", "Child Daughter" },
                TestCases = new List<string> { "Basic family management", "Parent-child permissions", "Admin transitions" }
            },
            new FamilyScenarioInfoDTO
            {
                Scenario = FamilyScenario.SingleParent,
                Name = "Single Parent",
                Description = "Single parent with children",
                DefaultMemberCount = 3,
                MemberTypes = new List<string> { "Mom (Admin)", "Teen Daughter", "Child Son" },
                TestCases = new List<string> { "Single admin scenario", "Child age transitions", "Admin workload" }
            },
            new FamilyScenarioInfoDTO
            {
                Scenario = FamilyScenario.ExtendedFamily,
                Name = "Extended Family",
                Description = "Multi-generational family with grandparents",
                DefaultMemberCount = 7,
                MemberTypes = new List<string> { "Grandpa (Admin)", "Grandma", "Dad", "Mom", "Teen Son", "Child Daughter", "Uncle" },
                TestCases = new List<string> { "Complex relationships", "Multiple adults", "Age group diversity" }
            },
            new FamilyScenarioInfoDTO
            {
                Scenario = FamilyScenario.BlendedFamily,
                Name = "Blended Family",
                Description = "Family with step-parents and step-children",
                DefaultMemberCount = 6,
                MemberTypes = new List<string> { "Dad (Admin)", "Step-Mom", "Son", "Daughter", "Step-Son", "Step-Daughter" },
                TestCases = new List<string> { "Step relationships", "Complex family dynamics", "Permission inheritance" }
            },
            new FamilyScenarioInfoDTO
            {
                Scenario = FamilyScenario.MultiGenerational,
                Name = "Multi-Generational",
                Description = "Three generations living together",
                DefaultMemberCount = 8,
                MemberTypes = new List<string> { "Great-Grandma", "Grandpa (Admin)", "Grandma", "Dad", "Mom", "Teen", "Child", "Toddler" },
                TestCases = new List<string> { "Age transitions", "Elder admin management", "Complex hierarchy" }
            },
            new FamilyScenarioInfoDTO
            {
                Scenario = FamilyScenario.LargeFamily,
                Name = "Large Family",
                Description = "Family with many siblings and relatives",
                DefaultMemberCount = 12,
                MemberTypes = new List<string> { "Dad (Admin)", "Mom", "5 Children", "2 Teens", "Aunt", "Uncle", "Cousin" },
                TestCases = new List<string> { "Performance testing", "Bulk operations", "Role management at scale" }
            },
            new FamilyScenarioInfoDTO
            {
                Scenario = FamilyScenario.AdultOnly,
                Name = "Adult Only",
                Description = "Family with only adult members",
                DefaultMemberCount = 5,
                MemberTypes = new List<string> { "Admin", "Spouse", "Adult Child", "Sibling", "Friend" },
                TestCases = new List<string> { "Adult permission scenarios", "No age restrictions", "Equal capability testing" }
            },
            new FamilyScenarioInfoDTO
            {
                Scenario = FamilyScenario.ChildCentric,
                Name = "Child-Centric",
                Description = "Family focused on children with minimal adults",
                DefaultMemberCount = 6,
                MemberTypes = new List<string> { "Parent (Admin)", "4 Children", "Teen" },
                TestCases = new List<string> { "Child protection", "Age-based restrictions", "Parental controls" }
            },
            new FamilyScenarioInfoDTO
            {
                Scenario = FamilyScenario.TeenHeavy,
                Name = "Teen-Heavy",
                Description = "Family with mostly teenagers",
                DefaultMemberCount = 6,
                MemberTypes = new List<string> { "Parent (Admin)", "5 Teenagers" },
                TestCases = new List<string> { "Teen permissions", "Admin transition preparation", "Responsibility testing" }
            },
            new FamilyScenarioInfoDTO
            {
                Scenario = FamilyScenario.EdgeCases,
                Name = "Edge Cases",
                Description = "Unusual relationship combinations for testing",
                DefaultMemberCount = 8,
                MemberTypes = new List<string> { "Admin", "Ex-Spouse", "Step-relatives", "Caregivers", "Tutors", "Non-family" },
                TestCases = new List<string> { "Boundary testing", "Unusual relationships", "Permission edge cases" }
            },
            new FamilyScenarioInfoDTO
            {
                Scenario = FamilyScenario.AdminTransitions,
                Name = "Admin Transitions",
                Description = "Family designed for testing admin role changes",
                DefaultMemberCount = 5,
                MemberTypes = new List<string> { "Current Admin", "Future Admin", "Teen (wants admin)", "Adult Child", "Elderly Parent" },
                TestCases = new List<string> { "Admin promotion", "Age-based transitions", "Leadership handoff" }
            },
            new FamilyScenarioInfoDTO
            {
                Scenario = FamilyScenario.Minimal,
                Name = "Minimal",
                Description = "Smallest possible family for basic testing",
                DefaultMemberCount = 2,
                MemberTypes = new List<string> { "Admin", "Member" },
                TestCases = new List<string> { "Basic functionality", "Quick testing", "Simple scenarios" }
            },
            new FamilyScenarioInfoDTO
            {
                Scenario = FamilyScenario.Custom,
                Name = "Custom",
                Description = "Define your own family member configuration",
                DefaultMemberCount = 0,
                MemberTypes = new List<string> { "User-defined" },
                TestCases = new List<string> { "Specific test cases", "Custom scenarios", "Targeted testing" }
            }
        });
    }

    public async Task<int> ClearTestFamiliesAsync(int adminUserId)
    {
        try
        {
            _logger.LogInformation("Clearing test families requested by admin {AdminUserId}", adminUserId);

            // Get all families with test data markers
            IEnumerable<Family> testFamiliesEnum = await _familyRepository.GetAllAsync();
            List<Family> testFamilies = testFamiliesEnum.ToList();
            List<Family> familiesToDelete = testFamilies
                .Where(f => f.Name.Contains("[TEST]") || f.Name.Contains("Test") || f.Description?.Contains("seeded") == true)
                .ToList();

            int deletedCount = 0;
            List<int> testUserIds = new List<int>();

            foreach (Family family in familiesToDelete)
            {
                // Collect test user IDs before deleting family
                IEnumerable<FamilyMember> members = await _familyMemberRepository.GetByFamilyIdAsync(family.Id);
                testUserIds.AddRange(members.Select(m => m.UserId));

                await _familyRepository.DeleteAsync(family.Id);
                deletedCount++;
                _logger.LogInformation("Deleted test family: {FamilyName} (ID: {FamilyId})", family.Name, family.Id);
            }

            // Clean up test users (users with test emails)
            List<int> uniqueTestUserIds = testUserIds.Distinct().ToList();
            int testUsersDeleted = 0;

            foreach (int userId in uniqueTestUserIds)
            {
                User? user = await _userRepository.GetUserByIdAsync(userId);
                if (user != null && user.Email.Contains("@test.tasktracker.com"))
                {
                    // Only delete test users, not real users
                    await _userRepository.DeleteUserAsync(userId);
                    testUsersDeleted++;
                    _logger.LogInformation("Deleted test user: {Email}", user.Email);
                }
            }

            _logger.LogInformation("Cleared {FamilyCount} test families and {UserCount} test users", deletedCount, testUsersDeleted);
            return deletedCount;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error clearing test families");
            throw;
        }
    }

    public async Task<List<FamilyDTO>> GetTestFamiliesAsync(int adminUserId)
    {
        try
        {
            IEnumerable<Family> allFamiliesEnum = await _familyRepository.GetAllAsync();
            List<Family> testFamilies = allFamiliesEnum
                .Where(f => f.Name.Contains("[TEST]") || f.Name.Contains("Test") || f.Description?.Contains("seeded") == true)
                .ToList();

            List<FamilyDTO> result = new List<FamilyDTO>();
            foreach (Family family in testFamilies)
            {
                IEnumerable<FamilyMember> membersEnum = await _familyMemberRepository.GetByFamilyIdAsync(family.Id);
                List<FamilyMember> members = membersEnum.ToList();
                result.Add(new FamilyDTO
                {
                    Id = family.Id,
                    Name = family.Name,
                    Description = family.Description,
                    CreatedAt = family.CreatedAt,
                    // Note: MemberCount is not a property of FamilyDTO, we'll calculate it manually
                    Members = new List<FamilyMemberDTO>() // Empty for now, just to satisfy the interface
                });
            }

            return result;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting test families");
            throw;
        }
    }

    #region Private Helper Methods

    private bool IsGlobalAdmin(User user)
    {
        return user.Email.ToLower() == "admin@tasktracker.com" || user.Role.ToLower() == "globaladmin";
    }

    private async Task<Family> CreateTestFamilyAsync(string scenarioName, int adminUserId)
    {
        Family family = new Family
        {
            Name = $"[TEST] {scenarioName} Family",
            Description = $"Test family seeded for {scenarioName} scenario",
            CreatedById = adminUserId,
            CreatedAt = DateTime.UtcNow
            // Note: MaxMembers property doesn't exist in Family model
        };

        return await _familyRepository.CreateAsync(family);
    }

    private string GetScenarioName(FamilyScenario scenario)
    {
        return scenario switch
        {
            FamilyScenario.NuclearFamily => "Nuclear",
            FamilyScenario.SingleParent => "Single Parent",
            FamilyScenario.ExtendedFamily => "Extended",
            FamilyScenario.BlendedFamily => "Blended",
            FamilyScenario.MultiGenerational => "Multi-Gen",
            FamilyScenario.LargeFamily => "Large",
            FamilyScenario.AdultOnly => "Adult Only",
            FamilyScenario.ChildCentric => "Child-Centric",
            FamilyScenario.TeenHeavy => "Teen-Heavy",
            FamilyScenario.EdgeCases => "Edge Cases",
            FamilyScenario.AdminTransitions => "Admin Transitions",
            FamilyScenario.Minimal => "Minimal",
            _ => "Test"
        };
    }

    private List<CustomFamilyMemberDTO> GenerateMembersForScenario(FamilyScenario scenario, int requestedCount)
    {
        return scenario switch
        {
            FamilyScenario.NuclearFamily => GenerateNuclearFamily(),
            FamilyScenario.SingleParent => GenerateSingleParentFamily(),
            FamilyScenario.ExtendedFamily => GenerateExtendedFamily(),
            FamilyScenario.BlendedFamily => GenerateBlendedFamily(),
            FamilyScenario.MultiGenerational => GenerateMultiGenerationalFamily(),
            FamilyScenario.LargeFamily => GenerateLargeFamily(),
            FamilyScenario.AdultOnly => GenerateAdultOnlyFamily(),
            FamilyScenario.ChildCentric => GenerateChildCentricFamily(),
            FamilyScenario.TeenHeavy => GenerateTeenHeavyFamily(),
            FamilyScenario.EdgeCases => GenerateEdgeCasesFamily(),
            FamilyScenario.AdminTransitions => GenerateAdminTransitionsFamily(),
            FamilyScenario.Minimal => GenerateMinimalFamily(),
            _ => new List<CustomFamilyMemberDTO>()
        };
    }

    private List<CustomFamilyMemberDTO> GenerateNuclearFamily()
    {
        return new List<CustomFamilyMemberDTO>
        {
            new CustomFamilyMemberDTO
            {
                Name = "John Thompson",
                AgeGroup = FamilyMemberAgeGroupDTO.Adult,
                RelationshipToAdmin = FamilyRelationshipType.Self,
                RoleName = "Admin",
                DateOfBirth = DateTime.Today.AddYears(-42),
                Notes = "Family patriarch and admin"
            },
            new CustomFamilyMemberDTO
            {
                Name = "Sarah Thompson",
                AgeGroup = FamilyMemberAgeGroupDTO.Adult,
                RelationshipToAdmin = FamilyRelationshipType.Spouse,
                DateOfBirth = DateTime.Today.AddYears(-39),
                Notes = "Spouse of admin"
            },
            new CustomFamilyMemberDTO
            {
                Name = "Michael Thompson",
                AgeGroup = FamilyMemberAgeGroupDTO.Teen,
                RelationshipToAdmin = FamilyRelationshipType.Child,
                DateOfBirth = DateTime.Today.AddYears(-16),
                WantsAdminRole = true,
                Notes = "Teenager who wants admin responsibilities"
            },
            new CustomFamilyMemberDTO
            {
                Name = "Emma Thompson",
                AgeGroup = FamilyMemberAgeGroupDTO.Child,
                RelationshipToAdmin = FamilyRelationshipType.Child,
                DateOfBirth = DateTime.Today.AddYears(-10),
                Notes = "Young child"
            }
        };
    }

    private List<CustomFamilyMemberDTO> GenerateSingleParentFamily()
    {
        return new List<CustomFamilyMemberDTO>
        {
            new CustomFamilyMemberDTO
            {
                Name = "Maria Rodriguez",
                AgeGroup = FamilyMemberAgeGroupDTO.Adult,
                RelationshipToAdmin = FamilyRelationshipType.Self,
                RoleName = "Admin",
                DateOfBirth = DateTime.Today.AddYears(-35),
                Notes = "Single mother and only admin"
            },
            new CustomFamilyMemberDTO
            {
                Name = "Isabella Rodriguez",
                AgeGroup = FamilyMemberAgeGroupDTO.Teen,
                RelationshipToAdmin = FamilyRelationshipType.Child,
                DateOfBirth = DateTime.Today.AddYears(-15),
                WantsAdminRole = true,
                IsNaturalLeader = true,
                Notes = "Responsible teenager, future admin candidate"
            },
            new CustomFamilyMemberDTO
            {
                Name = "Carlos Rodriguez",
                AgeGroup = FamilyMemberAgeGroupDTO.Child,
                RelationshipToAdmin = FamilyRelationshipType.Child,
                DateOfBirth = DateTime.Today.AddYears(-8),
                Notes = "Younger child"
            }
        };
    }

    private List<CustomFamilyMemberDTO> GenerateExtendedFamily()
    {
        return new List<CustomFamilyMemberDTO>
        {
            new CustomFamilyMemberDTO
            {
                Name = "William Chen",
                AgeGroup = FamilyMemberAgeGroupDTO.Adult,
                RelationshipToAdmin = FamilyRelationshipType.Self,
                RoleName = "Admin",
                DateOfBirth = DateTime.Today.AddYears(-68),
                Notes = "Grandfather and family patriarch"
            },
            new CustomFamilyMemberDTO
            {
                Name = "Helen Chen",
                AgeGroup = FamilyMemberAgeGroupDTO.Adult,
                RelationshipToAdmin = FamilyRelationshipType.Spouse,
                DateOfBirth = DateTime.Today.AddYears(-65),
                WantsAdminRole = true,
                Notes = "Grandmother, wants to help with admin duties"
            },
            new CustomFamilyMemberDTO
            {
                Name = "David Chen",
                AgeGroup = FamilyMemberAgeGroupDTO.Adult,
                RelationshipToAdmin = FamilyRelationshipType.Child,
                DateOfBirth = DateTime.Today.AddYears(-45),
                WantsAdminRole = true,
                Notes = "Adult son, wants admin role"
            },
            new CustomFamilyMemberDTO
            {
                Name = "Lisa Chen",
                AgeGroup = FamilyMemberAgeGroupDTO.Adult,
                RelationshipToAdmin = FamilyRelationshipType.MotherInLaw,
                DateOfBirth = DateTime.Today.AddYears(-43),
                Notes = "Daughter-in-law"
            },
            new CustomFamilyMemberDTO
            {
                Name = "Kevin Chen",
                AgeGroup = FamilyMemberAgeGroupDTO.Teen,
                RelationshipToAdmin = FamilyRelationshipType.Grandchild,
                DateOfBirth = DateTime.Today.AddYears(-17),
                WantsAdminRole = true,
                IsNaturalLeader = true,
                Notes = "Teen grandson, natural leader"
            },
            new CustomFamilyMemberDTO
            {
                Name = "Sophie Chen",
                AgeGroup = FamilyMemberAgeGroupDTO.Child,
                RelationshipToAdmin = FamilyRelationshipType.Grandchild,
                DateOfBirth = DateTime.Today.AddYears(-12),
                Notes = "Child granddaughter"
            },
            new CustomFamilyMemberDTO
            {
                Name = "Robert Chen",
                AgeGroup = FamilyMemberAgeGroupDTO.Adult,
                RelationshipToAdmin = FamilyRelationshipType.Uncle,
                DateOfBirth = DateTime.Today.AddYears(-50),
                Notes = "Uncle living with family"
            }
        };
    }

    private List<CustomFamilyMemberDTO> GenerateBlendedFamily()
    {
        return new List<CustomFamilyMemberDTO>
        {
            new CustomFamilyMemberDTO
            {
                Name = "Mark Johnson",
                AgeGroup = FamilyMemberAgeGroupDTO.Adult,
                RelationshipToAdmin = FamilyRelationshipType.Self,
                RoleName = "Admin",
                DateOfBirth = DateTime.Today.AddYears(-41),
                Notes = "Father and family admin"
            },
            new CustomFamilyMemberDTO
            {
                Name = "Jennifer Johnson",
                AgeGroup = FamilyMemberAgeGroupDTO.Adult,
                RelationshipToAdmin = FamilyRelationshipType.Stepparent,
                DateOfBirth = DateTime.Today.AddYears(-38),
                WantsAdminRole = true,
                Notes = "Step-mother, wants admin role"
            },
            new CustomFamilyMemberDTO
            {
                Name = "Tyler Johnson",
                AgeGroup = FamilyMemberAgeGroupDTO.Teen,
                RelationshipToAdmin = FamilyRelationshipType.Child,
                DateOfBirth = DateTime.Today.AddYears(-16),
                Notes = "Biological son"
            },
            new CustomFamilyMemberDTO
            {
                Name = "Ashley Johnson",
                AgeGroup = FamilyMemberAgeGroupDTO.Child,
                RelationshipToAdmin = FamilyRelationshipType.Child,
                DateOfBirth = DateTime.Today.AddYears(-11),
                Notes = "Biological daughter"
            },
            new CustomFamilyMemberDTO
            {
                Name = "Brandon Martinez",
                AgeGroup = FamilyMemberAgeGroupDTO.Teen,
                RelationshipToAdmin = FamilyRelationshipType.Stepchild,
                DateOfBirth = DateTime.Today.AddYears(-15),
                WantsAdminRole = true,
                Notes = "Step-son from previous marriage"
            },
            new CustomFamilyMemberDTO
            {
                Name = "Chloe Martinez",
                AgeGroup = FamilyMemberAgeGroupDTO.Child,
                RelationshipToAdmin = FamilyRelationshipType.Stepchild,
                DateOfBirth = DateTime.Today.AddYears(-9),
                Notes = "Step-daughter from previous marriage"
            }
        };
    }

    private List<CustomFamilyMemberDTO> GenerateMultiGenerationalFamily()
    {
        return new List<CustomFamilyMemberDTO>
        {
            new CustomFamilyMemberDTO
            {
                Name = "Eleanor Washington",
                AgeGroup = FamilyMemberAgeGroupDTO.Adult,
                RelationshipToAdmin = FamilyRelationshipType.Grandparent,
                DateOfBirth = DateTime.Today.AddYears(-89),
                Notes = "Great-grandmother, family matriarch"
            },
            new CustomFamilyMemberDTO
            {
                Name = "James Washington",
                AgeGroup = FamilyMemberAgeGroupDTO.Adult,
                RelationshipToAdmin = FamilyRelationshipType.Self,
                RoleName = "Admin",
                DateOfBirth = DateTime.Today.AddYears(-67),
                Notes = "Grandfather and current admin"
            },
            new CustomFamilyMemberDTO
            {
                Name = "Dorothy Washington",
                AgeGroup = FamilyMemberAgeGroupDTO.Adult,
                RelationshipToAdmin = FamilyRelationshipType.Spouse,
                DateOfBirth = DateTime.Today.AddYears(-64),
                WantsAdminRole = true,
                Notes = "Grandmother"
            },
            new CustomFamilyMemberDTO
            {
                Name = "Marcus Washington",
                AgeGroup = FamilyMemberAgeGroupDTO.Adult,
                RelationshipToAdmin = FamilyRelationshipType.Child,
                DateOfBirth = DateTime.Today.AddYears(-44),
                WantsAdminRole = true,
                Notes = "Adult son, future admin"
            },
            new CustomFamilyMemberDTO
            {
                Name = "Angela Washington",
                AgeGroup = FamilyMemberAgeGroupDTO.Adult,
                RelationshipToAdmin = FamilyRelationshipType.MotherInLaw,
                DateOfBirth = DateTime.Today.AddYears(-42),
                Notes = "Daughter-in-law"
            },
            new CustomFamilyMemberDTO
            {
                Name = "Jamal Washington",
                AgeGroup = FamilyMemberAgeGroupDTO.Teen,
                RelationshipToAdmin = FamilyRelationshipType.Grandchild,
                DateOfBirth = DateTime.Today.AddYears(-16),
                WantsAdminRole = true,
                IsNaturalLeader = true,
                Notes = "Teenage grandson, natural leader"
            },
            new CustomFamilyMemberDTO
            {
                Name = "Zoe Washington",
                AgeGroup = FamilyMemberAgeGroupDTO.Child,
                RelationshipToAdmin = FamilyRelationshipType.Grandchild,
                DateOfBirth = DateTime.Today.AddYears(-11),
                Notes = "Child granddaughter"
            },
            new CustomFamilyMemberDTO
            {
                Name = "Aiden Washington",
                AgeGroup = FamilyMemberAgeGroupDTO.Child,
                RelationshipToAdmin = FamilyRelationshipType.Grandchild,
                DateOfBirth = DateTime.Today.AddYears(-6),
                Notes = "Youngest grandchild"
            }
        };
    }

    private List<CustomFamilyMemberDTO> GenerateLargeFamily()
    {
        return new List<CustomFamilyMemberDTO>
        {
            new CustomFamilyMemberDTO
            {
                Name = "Frank Miller",
                AgeGroup = FamilyMemberAgeGroupDTO.Adult,
                RelationshipToAdmin = FamilyRelationshipType.Self,
                RoleName = "Admin",
                DateOfBirth = DateTime.Today.AddYears(-45),
                Notes = "Father of large family"
            },
            new CustomFamilyMemberDTO
            {
                Name = "Grace Miller",
                AgeGroup = FamilyMemberAgeGroupDTO.Adult,
                RelationshipToAdmin = FamilyRelationshipType.Spouse,
                DateOfBirth = DateTime.Today.AddYears(-43),
                WantsAdminRole = true,
                Notes = "Mother, co-admin candidate"
            }
            // Add 10 more members for large family...
        };
    }

    private List<CustomFamilyMemberDTO> GenerateAdultOnlyFamily()
    {
        return new List<CustomFamilyMemberDTO>
        {
            new CustomFamilyMemberDTO
            {
                Name = "Alex Turner",
                AgeGroup = FamilyMemberAgeGroupDTO.Adult,
                RelationshipToAdmin = FamilyRelationshipType.Self,
                RoleName = "Admin",
                DateOfBirth = DateTime.Today.AddYears(-32),
                Notes = "Young adult admin"
            }
            // Add more adult members...
        };
    }

    private List<CustomFamilyMemberDTO> GenerateChildCentricFamily()
    {
        return new List<CustomFamilyMemberDTO>
        {
            new CustomFamilyMemberDTO
            {
                Name = "Patricia Davis",
                AgeGroup = FamilyMemberAgeGroupDTO.Adult,
                RelationshipToAdmin = FamilyRelationshipType.Self,
                RoleName = "Admin",
                DateOfBirth = DateTime.Today.AddYears(-38),
                Notes = "Single mother with many children"
            }
            // Add multiple child members...
        };
    }

    private List<CustomFamilyMemberDTO> GenerateTeenHeavyFamily()
    {
        return new List<CustomFamilyMemberDTO>
        {
            new CustomFamilyMemberDTO
            {
                Name = "Steven Anderson",
                AgeGroup = FamilyMemberAgeGroupDTO.Adult,
                RelationshipToAdmin = FamilyRelationshipType.Self,
                RoleName = "Admin",
                DateOfBirth = DateTime.Today.AddYears(-47),
                Notes = "Father with teenage children"
            }
            // Add multiple teen members...
        };
    }

    private List<CustomFamilyMemberDTO> GenerateEdgeCasesFamily()
    {
        return new List<CustomFamilyMemberDTO>
        {
            new CustomFamilyMemberDTO
            {
                Name = "Leslie Cooper",
                AgeGroup = FamilyMemberAgeGroupDTO.Adult,
                RelationshipToAdmin = FamilyRelationshipType.Self,
                RoleName = "Admin",
                DateOfBirth = DateTime.Today.AddYears(-40),
                Notes = "Admin in complex family situation"
            }
            // Add edge case members...
        };
    }

    private List<CustomFamilyMemberDTO> GenerateAdminTransitionsFamily()
    {
        return new List<CustomFamilyMemberDTO>
        {
            new CustomFamilyMemberDTO
            {
                Name = "Robert Williams",
                AgeGroup = FamilyMemberAgeGroupDTO.Adult,
                RelationshipToAdmin = FamilyRelationshipType.Self,
                RoleName = "Admin",
                DateOfBirth = DateTime.Today.AddYears(-72),
                Notes = "Elderly current admin, ready to transition"
            }
            // Add transition scenario members...
        };
    }

    private List<CustomFamilyMemberDTO> GenerateMinimalFamily()
    {
        return new List<CustomFamilyMemberDTO>
        {
            new CustomFamilyMemberDTO
            {
                Name = "Admin User",
                AgeGroup = FamilyMemberAgeGroupDTO.Adult,
                RelationshipToAdmin = FamilyRelationshipType.Self,
                RoleName = "Admin",
                DateOfBirth = DateTime.Today.AddYears(-35),
                Notes = "Basic admin for minimal testing"
            },
            new CustomFamilyMemberDTO
            {
                Name = "Test Member",
                AgeGroup = FamilyMemberAgeGroupDTO.Adult,
                RelationshipToAdmin = FamilyRelationshipType.Spouse,
                DateOfBirth = DateTime.Today.AddYears(-33),
                Notes = "Basic member for minimal testing"
            }
        };
    }

    private string GenerateUsername(string name)
    {
        // Make username unique with timestamp and random component
        string timestamp = DateTimeOffset.UtcNow.ToUnixTimeSeconds().ToString();
        string randomSuffix = Guid.NewGuid().ToString("N")[..6]; // First 6 chars of GUID
        return name.ToLower().Replace(" ", ".") + $".test.{timestamp}.{randomSuffix}";
    }

    private string GenerateTestEmail(string name)
    {
        return GenerateUsername(name) + "@test.tasktracker.com";
    }

    private DateTime GenerateDateOfBirth(FamilyMemberAgeGroup ageGroup)
    {
        Random random = new Random();
        return ageGroup switch
        {
            FamilyMemberAgeGroup.Child => DateTime.Today.AddYears(-random.Next(4, 13)),
            FamilyMemberAgeGroup.Teen => DateTime.Today.AddYears(-random.Next(13, 18)),
            FamilyMemberAgeGroup.Adult => DateTime.Today.AddYears(-random.Next(18, 65)),
            _ => DateTime.Today.AddYears(-30)
        };
    }

    #endregion
} 