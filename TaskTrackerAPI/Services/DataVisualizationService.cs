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
using TaskTrackerAPI.Services.Interfaces;

namespace TaskTrackerAPI.Services
{
    /// <summary>
    /// Service implementation for data visualization operations
    /// </summary>
    public class DataVisualizationService : IDataVisualizationService
    {
        private readonly ILogger<DataVisualizationService> _logger;

        public DataVisualizationService(ILogger<DataVisualizationService> logger)
        {
            _logger = logger;
        }

        public Task<object> GenerateChartDataAsync(string chartType, object data)
        {
            try
            {
                return chartType.ToLowerInvariant() switch
                {
                    "line" => Task.FromResult(GenerateLineChartData(data)),
                    "bar" => Task.FromResult(GenerateBarChartData(data)),
                    "pie" => Task.FromResult(GeneratePieChartData(data)),
                    "doughnut" => Task.FromResult(GenerateDoughnutChartData(data)),
                    "area" => Task.FromResult(GenerateAreaChartData(data)),
                    "scatter" => Task.FromResult(GenerateScatterChartData(data)),
                    "radar" => Task.FromResult(GenerateRadarChartData(data)),
                    "heatmap" => Task.FromResult(GenerateHeatmapData(data)),
                    _ => Task.FromResult(GenerateDefaultChartData(data))
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating chart data for type {ChartType}", chartType);
                throw;
            }
        }

        public Task<IEnumerable<string>> GetSupportedChartTypesAsync()
        {
            var supportedTypes = new[]
            {
                "line", "bar", "pie", "doughnut", "area", "scatter", "radar", "heatmap"
            };
            return Task.FromResult<IEnumerable<string>>(supportedTypes);
        }

        public Task<object> GetChartConfigurationAsync(string chartType)
        {
            try
            {
                var config = chartType.ToLowerInvariant() switch
                {
                    "line" => GetLineChartConfig(),
                    "bar" => GetBarChartConfig(),
                    "pie" => GetPieChartConfig(),
                    "doughnut" => GetDoughnutChartConfig(),
                    "area" => GetAreaChartConfig(),
                    "scatter" => GetScatterChartConfig(),
                    "radar" => GetRadarChartConfig(),
                    "heatmap" => GetHeatmapConfig(),
                    _ => GetDefaultChartConfig()
                };
                return Task.FromResult(config);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting chart configuration for type {ChartType}", chartType);
                throw;
            }
        }

        public Task<object> CreateInteractiveVisualizationAsync(string visualizationType, object data, object options)
        {
            try
            {
                var visualization = new
                {
                    Type = visualizationType,
                    Data = data,
                    Options = options,
                    Interactive = true,
                    Responsive = true,
                    Animation = new
                    {
                        Duration = 1000,
                        Easing = "easeInOutQuart"
                    },
                    Tooltip = new
                    {
                        Enabled = true,
                        Mode = "index",
                        Intersect = false
                    },
                    Legend = new
                    {
                        Display = true,
                        Position = "top"
                    }
                };

                return Task.FromResult<object>(visualization);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating interactive visualization for type {VisualizationType}", visualizationType);
                throw;
            }
        }

        public Task<object> GenerateCustomChartAsync(object chartDefinition, object data)
        {
            try
            {
                var customChart = new
                {
                    Definition = chartDefinition,
                    Data = data,
                    Generated = DateTime.UtcNow,
                    Custom = true
                };

                return Task.FromResult<object>(customChart);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating custom chart");
                throw;
            }
        }

        public Task<IEnumerable<object>> GetVisualizationTemplatesAsync()
        {
            try
            {
                var templates = new[]
                {
                    new { Name = "Task Completion Trends", Type = "line", Category = "productivity" },
                    new { Name = "Category Distribution", Type = "pie", Category = "overview" },
                    new { Name = "Daily Activity", Type = "bar", Category = "activity" },
                    new { Name = "Performance Radar", Type = "radar", Category = "performance" },
                    new { Name = "Time Heatmap", Type = "heatmap", Category = "time" }
                };

                return Task.FromResult<IEnumerable<object>>(templates);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting visualization templates");
                throw;
            }
        }

        public Task<object> ApplyChartThemeAsync(object chartData, string theme)
        {
            try
            {
                var themedChart = new
                {
                    Data = chartData,
                    Theme = theme,
                    Colors = GetThemeColors(theme),
                    Styling = GetThemeStyling(theme)
                };

                return Task.FromResult<object>(themedChart);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error applying chart theme {Theme}", theme);
                throw;
            }
        }

        public Task<object> GenerateResponsiveChartAsync(object chartData, object responsiveOptions)
        {
            try
            {
                var responsiveChart = new
                {
                    Data = chartData,
                    Responsive = true,
                    MaintainAspectRatio = false,
                    Options = responsiveOptions,
                    Breakpoints = new
                    {
                        Mobile = 768,
                        Tablet = 1024,
                        Desktop = 1200
                    }
                };

                return Task.FromResult<object>(responsiveChart);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating responsive chart");
                throw;
            }
        }

        // Private helper methods for chart generation
        private object GenerateLineChartData(object data)
        {
            return new
            {
                Type = "line",
                Data = data,
                Options = new
                {
                    Responsive = true,
                    Scales = new
                    {
                        X = new { Display = true },
                        Y = new { Display = true }
                    }
                }
            };
        }

        private object GenerateBarChartData(object data)
        {
            return new
            {
                Type = "bar",
                Data = data,
                Options = new
                {
                    Responsive = true,
                    IndexAxis = "x"
                }
            };
        }

        private object GeneratePieChartData(object data)
        {
            return new
            {
                Type = "pie",
                Data = data,
                Options = new
                {
                    Responsive = true,
                    Plugins = new
                    {
                        Legend = new { Position = "right" }
                    }
                }
            };
        }

        private object GenerateDoughnutChartData(object data)
        {
            return new
            {
                Type = "doughnut",
                Data = data,
                Options = new
                {
                    Responsive = true,
                    CutoutPercentage = 50
                }
            };
        }

        private object GenerateAreaChartData(object data)
        {
            return new
            {
                Type = "area",
                Data = data,
                Options = new
                {
                    Responsive = true,
                    Fill = true
                }
            };
        }

        private object GenerateScatterChartData(object data)
        {
            return new
            {
                Type = "scatter",
                Data = data,
                Options = new
                {
                    Responsive = true,
                    Scales = new
                    {
                        X = new { Type = "linear", Position = "bottom" },
                        Y = new { Type = "linear" }
                    }
                }
            };
        }

        private object GenerateRadarChartData(object data)
        {
            return new
            {
                Type = "radar",
                Data = data,
                Options = new
                {
                    Responsive = true,
                    Scale = new
                    {
                        AngleLines = new { Display = false },
                        Ticks = new { SuggestedMin = 0, SuggestedMax = 100 }
                    }
                }
            };
        }

        private object GenerateHeatmapData(object data)
        {
            return new
            {
                Type = "heatmap",
                Data = data,
                Options = new
                {
                    Responsive = true,
                    Plugins = new
                    {
                        Tooltip = new
                        {
                            Callbacks = new
                            {
                                Title = "function(context) { return context[0].label; }",
                                Label = "function(context) { return context.formattedValue; }"
                            }
                        }
                    }
                }
            };
        }

        private object GenerateDefaultChartData(object data)
        {
            return new
            {
                Type = "bar",
                Data = data,
                Options = new { Responsive = true }
            };
        }

        // Configuration methods
        private object GetLineChartConfig()
        {
            return new
            {
                Type = "line",
                Responsive = true,
                Tension = 0.4,
                PointRadius = 4,
                BorderWidth = 2
            };
        }

        private object GetBarChartConfig()
        {
            return new
            {
                Type = "bar",
                Responsive = true,
                BorderWidth = 1,
                BorderRadius = 4
            };
        }

        private object GetPieChartConfig()
        {
            return new
            {
                Type = "pie",
                Responsive = true,
                BorderWidth = 2
            };
        }

        private object GetDoughnutChartConfig()
        {
            return new
            {
                Type = "doughnut",
                Responsive = true,
                CutoutPercentage = 60,
                BorderWidth = 2
            };
        }

        private object GetAreaChartConfig()
        {
            return new
            {
                Type = "area",
                Responsive = true,
                Fill = true,
                Tension = 0.4
            };
        }

        private object GetScatterChartConfig()
        {
            return new
            {
                Type = "scatter",
                Responsive = true,
                PointRadius = 6,
                PointHoverRadius = 8
            };
        }

        private object GetRadarChartConfig()
        {
            return new
            {
                Type = "radar",
                Responsive = true,
                PointRadius = 4,
                PointHoverRadius = 6
            };
        }

        private object GetHeatmapConfig()
        {
            return new
            {
                Type = "heatmap",
                Responsive = true,
                BorderWidth = 1
            };
        }

        private object GetDefaultChartConfig()
        {
            return new
            {
                Type = "bar",
                Responsive = true
            };
        }

        private object GetThemeColors(string theme)
        {
            return theme.ToLowerInvariant() switch
            {
                "dark" => new[] { "#8B5CF6", "#06B6D4", "#10B981", "#F59E0B", "#EF4444" },
                "light" => new[] { "#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6" },
                "blue" => new[] { "#1E40AF", "#3B82F6", "#60A5FA", "#93C5FD", "#DBEAFE" },
                "green" => new[] { "#065F46", "#10B981", "#34D399", "#6EE7B7", "#D1FAE5" },
                _ => new[] { "#6366F1", "#8B5CF6", "#EC4899", "#EF4444", "#F59E0B" }
            };
        }

        private object GetThemeStyling(string theme)
        {
            return theme.ToLowerInvariant() switch
            {
                "dark" => new
                {
                    BackgroundColor = "#1F2937",
                    TextColor = "#F9FAFB",
                    GridColor = "#374151"
                },
                "light" => new
                {
                    BackgroundColor = "#FFFFFF",
                    TextColor = "#1F2937",
                    GridColor = "#E5E7EB"
                },
                _ => new
                {
                    BackgroundColor = "#FFFFFF",
                    TextColor = "#1F2937",
                    GridColor = "#E5E7EB"
                }
            };
        }
    }
} 