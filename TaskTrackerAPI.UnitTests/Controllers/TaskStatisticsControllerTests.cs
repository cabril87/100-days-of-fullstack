using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Moq;
using Newtonsoft.Json;
using TaskTrackerAPI.Controllers;
using TaskTrackerAPI.DTOs;
using TaskTrackerAPI.Models;
using TaskTrackerAPI.Services.Interfaces;
using Xunit;

namespace TaskTrackerAPI.UnitTests.Controllers
{
    public class TaskStatisticsControllerTests
    {
        private readonly Mock<ITaskStatisticsService> _mockService;
        private readonly Mock<ILogger<TaskStatisticsController>> _mockLogger;
        private readonly TaskStatisticsController _controller;
        private readonly int _userId = 1;

        public TaskStatisticsControllerTests()
        {
            _mockService = new Mock<ITaskStatisticsService>();
            _mockLogger = new Mock<ILogger<TaskStatisticsController>>();
            _controller = new TaskStatisticsController(_mockService.Object, _mockLogger.Object);

            // Setup controller context with user claims
            ClaimsPrincipal user = new ClaimsPrincipal(new ClaimsIdentity(new Claim[]
            {
                new Claim(ClaimTypes.NameIdentifier, _userId.ToString())
            }, "mock"));

            _controller.ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext { User = user }
            };

            SetupMockService();
        }

        private void SetupMockService()
        {
            TaskStatisticsDTO taskStatistics = new TaskStatisticsDTO
            {
                GeneratedAt = DateTime.UtcNow,
                CompletionRate = new TaskCompletionRateDTO
                {
                    TotalTasks = 10,
                    CompletedTasks = 5,
                    CompletionRate = 0.5
                },
                TasksByStatus = new List<TaskDistributionDTO>
                {
                    new TaskDistributionDTO { Label = "Completed", Count = 5, Percentage = 50 },
                    new TaskDistributionDTO { Label = "InProgress", Count = 3, Percentage = 30 },
                    new TaskDistributionDTO { Label = "Pending", Count = 2, Percentage = 20 }
                },
                TasksByPriority = new List<TaskDistributionDTO>
                {
                    new TaskDistributionDTO { Label = "Priority 1", Count = 2, Percentage = 20 },
                    new TaskDistributionDTO { Label = "Priority 2", Count = 3, Percentage = 30 },
                    new TaskDistributionDTO { Label = "Priority 3", Count = 5, Percentage = 50 }
                },
                TasksByCategory = new List<TaskDistributionDTO>
                {
                    new TaskDistributionDTO { Label = "Work", Count = 5, Percentage = 50 },
                    new TaskDistributionDTO { Label = "Personal", Count = 3, Percentage = 30 },
                    new TaskDistributionDTO { Label = "Study", Count = 2, Percentage = 20 }
                },
                CompletionTime = new TaskCompletionTimeDTO
                {
                    AverageCompletionTimeInHours = 48,  // 2 days
                    TasksAnalyzed = 5
                },
                OverdueTasks = new OverdueTasksStatisticsDTO
                {
                    TotalOverdueTasks = 2,
                    PercentageOfAllTasks = 20,
                    AverageDaysOverdue = 3.5,
                    OverdueByPriority = new List<TaskDistributionDTO>()
                }
            };

            ProductivityAnalyticsDTO productivityAnalytics = new ProductivityAnalyticsDTO
            {
                GeneratedAt = DateTime.UtcNow,
                TimeOfDayAnalytics = new List<TimeOfDayProductivityDTO>
                {
                    new TimeOfDayProductivityDTO
                    {
                        TimeFrame = "Morning (8AM-12PM)",
                        CompletedTasks = 3,
                        CreatedTasks = 4,
                        CompletionRate = 0.75
                    },
                    new TimeOfDayProductivityDTO
                    {
                        TimeFrame = "Afternoon (12PM-5PM)",
                        CompletedTasks = 4,
                        CreatedTasks = 6,
                        CompletionRate = 0.67
                    }
                },
                DailyProductivity = new List<DailyProductivityDTO>
                {
                    new DailyProductivityDTO
                    {
                        Date = DateTime.UtcNow.AddDays(-1),
                        CompletedTasks = 3,
                        CreatedTasks = 5,
                        CompletionRate = 0.6,
                        EfficiencyScore = 0.6
                    },
                    new DailyProductivityDTO
                    {
                        Date = DateTime.UtcNow,
                        CompletedTasks = 2,
                        CreatedTasks = 3,
                        CompletionRate = 0.67,
                        EfficiencyScore = 0.67
                    }
                },
                WeeklyProductivity = new List<WeeklyProductivityDTO>
                {
                    new WeeklyProductivityDTO
                    {
                        WeekNumber = 15,
                        StartDate = DateTime.UtcNow.AddDays(-7),
                        EndDate = DateTime.UtcNow,
                        CompletedTasks = 12,
                        CreatedTasks = 15,
                        CompletionRate = 0.8,
                        TopCategories = new List<string> { "Work", "Personal" },
                        EfficiencyScore = 0.8
                    }
                },
                MonthlyProductivity = new List<MonthlyProductivityDTO>
                {
                    new MonthlyProductivityDTO
                    {
                        Year = DateTime.UtcNow.Year,
                        Month = DateTime.UtcNow.Month,
                        CompletedTasks = 45,
                        CreatedTasks = 50,
                        CompletionRate = 0.9,
                        TopCategories = new List<string> { "Work", "Personal", "Study" },
                        EfficiencyScore = 0.9
                    }
                },
                AverageCompletionRate = 0.75,
                AverageTasksPerDay = 4.5,
                AverageTasksPerWeek = 20,
                AverageTimeToComplete = TimeSpan.FromDays(1.5)
            };

            _mockService.Setup(s => s.GetTaskStatisticsAsync(_userId))
                .ReturnsAsync(taskStatistics);

            _mockService.Setup(s => s.GetProductivityAnalyticsAsync(
                    _userId, 
                    It.IsAny<DateTime?>(), 
                    It.IsAny<DateTime?>()))
                .ReturnsAsync(productivityAnalytics);

            _mockService.Setup(s => s.GetProductivityAnalyticsAsync(_userId, null, null))
                .ReturnsAsync(productivityAnalytics);
                
            // Setup for status distribution
            Dictionary<TaskItemStatus, int> statusDistribution = new Dictionary<TaskItemStatus, int>
            {
                { TaskItemStatus.Completed, 5 },
                { TaskItemStatus.InProgress, 3 },
                { TaskItemStatus.Pending, 2 }
            };
            
            _mockService.Setup(s => s.GetTasksByStatusDistributionAsync(_userId))
                .ReturnsAsync(statusDistribution);
        }

        [Fact]
        public async Task GetAllStatistics_ReturnsOkWithStatistics()
        {
            // Act
            IActionResult result = await _controller.GetAllStatistics();

            // Assert
            OkObjectResult okResult = Assert.IsType<OkObjectResult>(result);
            TaskStatisticsDTO returnValue = Assert.IsType<TaskStatisticsDTO>(okResult.Value);
            Assert.Equal(10, returnValue.CompletionRate.TotalTasks);
            Assert.Equal(5, returnValue.CompletionRate.CompletedTasks);
            Assert.Equal(0.5, returnValue.CompletionRate.CompletionRate);
        }

        [Fact]
        public async Task GetProductivityAnalytics_ReturnsOkWithAnalytics()
        {
            // Act
            IActionResult result = await _controller.GetProductivityAnalytics();

            // Assert
            OkObjectResult okResult = Assert.IsType<OkObjectResult>(result);
            ProductivityAnalyticsDTO returnValue = Assert.IsType<ProductivityAnalyticsDTO>(okResult.Value);
            Assert.NotNull(returnValue.TimeOfDayAnalytics);
            Assert.NotNull(returnValue.DailyProductivity);
            Assert.NotNull(returnValue.WeeklyProductivity);
            Assert.NotNull(returnValue.MonthlyProductivity);
            Assert.Equal(0.75, returnValue.AverageCompletionRate);
            Assert.Equal(4.5, returnValue.AverageTasksPerDay);
        }

        [Fact]
        public async Task GetTimeOfDayProductivity_ReturnsOkWithTimeOfDayData()
        {
            // Act
            IActionResult result = await _controller.GetTimeOfDayProductivity();

            // Assert
            OkObjectResult okResult = Assert.IsType<OkObjectResult>(result);
            IEnumerable<TimeOfDayProductivityDTO> returnValue = Assert.IsAssignableFrom<IEnumerable<TimeOfDayProductivityDTO>>(okResult.Value);
            Assert.Contains(returnValue, dto => dto.TimeFrame == "Morning (8AM-12PM)");
            Assert.Contains(returnValue, dto => dto.TimeFrame == "Afternoon (12PM-5PM)");
        }

        [Fact]
        public async Task GetDailyProductivity_ReturnsOkWithDailyData()
        {
            // Act
            IActionResult result = await _controller.GetDailyProductivity();

            // Assert
            OkObjectResult okResult = Assert.IsType<OkObjectResult>(result);
            IEnumerable<DailyProductivityDTO> returnValue = Assert.IsAssignableFrom<IEnumerable<DailyProductivityDTO>>(okResult.Value);
            Assert.Equal(2, ((List<DailyProductivityDTO>)returnValue).Count);
        }

        [Fact]
        public async Task GetWeeklyProductivity_ReturnsOkWithWeeklyData()
        {
            // Act
            IActionResult result = await _controller.GetWeeklyProductivity();

            // Assert
            OkObjectResult okResult = Assert.IsType<OkObjectResult>(result);
            IEnumerable<WeeklyProductivityDTO> returnValue = Assert.IsAssignableFrom<IEnumerable<WeeklyProductivityDTO>>(okResult.Value);
            Assert.Single((List<WeeklyProductivityDTO>)returnValue);
            Assert.Equal(15, ((List<WeeklyProductivityDTO>)returnValue)[0].WeekNumber);
        }

        [Fact]
        public async Task GetMonthlyProductivity_ReturnsOkWithMonthlyData()
        {
            // Act
            IActionResult result = await _controller.GetMonthlyProductivity();

            // Assert
            OkObjectResult okResult = Assert.IsType<OkObjectResult>(result);
            IEnumerable<MonthlyProductivityDTO> returnValue = Assert.IsAssignableFrom<IEnumerable<MonthlyProductivityDTO>>(okResult.Value);
            Assert.Single((List<MonthlyProductivityDTO>)returnValue);
            Assert.Equal(DateTime.UtcNow.Year, ((List<MonthlyProductivityDTO>)returnValue)[0].Year);
            Assert.Equal(DateTime.UtcNow.Month, ((List<MonthlyProductivityDTO>)returnValue)[0].Month);
        }

        [Fact]
        public async Task GetProductivitySummary_ReturnsOkWithSummaryData()
        {
            // Act
            IActionResult result = await _controller.GetProductivitySummary();

            // Assert
            OkObjectResult okResult = Assert.IsType<OkObjectResult>(result);
            
            // Convert to Dictionary to avoid dynamic binding issues
            string summary = JsonConvert.SerializeObject(okResult.Value);
            Dictionary<string, object> summaryDict = JsonConvert.DeserializeObject<Dictionary<string, object>>(summary) 
                ?? throw new InvalidOperationException("Failed to deserialize summary data");

            // Test properties individually
            Assert.True(summaryDict.ContainsKey("AverageTasksPerDay"));
            Assert.Equal(4.5, Convert.ToDouble(summaryDict["AverageTasksPerDay"]));
            
            Assert.True(summaryDict.ContainsKey("AverageTasksPerWeek"));
            Assert.Equal(20.0, Convert.ToDouble(summaryDict["AverageTasksPerWeek"]));
            
            Assert.True(summaryDict.ContainsKey("AverageCompletionRate"));
            Assert.Equal(0.75, Convert.ToDouble(summaryDict["AverageCompletionRate"]));
            
            // Test nested object
            Assert.True(summaryDict.ContainsKey("AverageTimeToComplete"));
            string timeToCompleteJson = JsonConvert.SerializeObject(summaryDict["AverageTimeToComplete"]);
            Dictionary<string, object> timeToComplete = JsonConvert.DeserializeObject<Dictionary<string, object>>(timeToCompleteJson)
                ?? throw new InvalidOperationException("Failed to deserialize time to complete data");
                
            Assert.Equal(1, Convert.ToInt32(timeToComplete["Days"]));
            Assert.Equal(12, Convert.ToInt32(timeToComplete["Hours"]));
            Assert.Equal(0, Convert.ToInt32(timeToComplete["Minutes"]));
            Assert.Equal(36.0, Convert.ToDouble(timeToComplete["TotalHours"]));
            
            // Check GeneratedAt exists
            Assert.True(summaryDict.ContainsKey("GeneratedAt"));
        }

        [Fact]
        public async Task GetCompletionRate_ReturnsOkWithCompletionRateData()
        {
            // Act
            IActionResult result = await _controller.GetCompletionRate();

            // Assert
            OkObjectResult okResult = Assert.IsType<OkObjectResult>(result);
            TaskCompletionRateDTO returnValue = Assert.IsType<TaskCompletionRateDTO>(okResult.Value);
            Assert.Equal(10, returnValue.TotalTasks);
            Assert.Equal(5, returnValue.CompletedTasks);
            Assert.Equal(0.5, returnValue.CompletionRate);
        }

        [Fact]
        public async Task GetTasksByStatusDistribution_ReturnsOkWithStatusDistribution()
        {
            // Act
            IActionResult result = await _controller.GetTasksByStatusDistribution();

            // Assert
            OkObjectResult okResult = Assert.IsType<OkObjectResult>(result);
            Dictionary<TaskItemStatus, int> returnValue = Assert.IsAssignableFrom<Dictionary<TaskItemStatus, int>>(okResult.Value);
            
            // Verify dictionary contents
            Assert.Equal(3, returnValue.Count);
            Assert.Equal(5, returnValue[TaskItemStatus.Completed]);
            Assert.Equal(3, returnValue[TaskItemStatus.InProgress]);
            Assert.Equal(2, returnValue[TaskItemStatus.Pending]);
        }
    }
} 