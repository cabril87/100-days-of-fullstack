using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace TaskTrackerAPI.Controllers
{
    [ApiController]
    [Route("api/v1/[controller]")]
    [ApiVersion("1.0")]
    public class DiagnosticsController : ControllerBase
    {
        private readonly ILogger<DiagnosticsController> _logger;

        public DiagnosticsController(ILogger<DiagnosticsController> logger)
        {
            _logger = logger;
        }

        [HttpGet("ping")]
        [AllowAnonymous]
        public IActionResult Ping()
        {
            return Ok(new { 
                message = "Pong!", 
                timestamp = DateTime.UtcNow 
            });
        }

        [HttpGet("headers")]
        [AllowAnonymous]
        public IActionResult GetHeaders()
        {
            var headers = new Dictionary<string, string>();
            
            foreach (var header in Request.Headers)
            {
                headers[header.Key] = header.Value.ToString();
            }

            return Ok(new { headers });
        }

        [HttpGet("environment")]
        [Authorize(Roles = "Admin")]
        public IActionResult GetEnvironment()
        {
            var environmentVars = Environment.GetEnvironmentVariables()
                .Cast<System.Collections.DictionaryEntry>()
                .Where(e => !e.Key.ToString()!.ToLowerInvariant().Contains("key") &&
                           !e.Key.ToString()!.ToLowerInvariant().Contains("secret") &&
                           !e.Key.ToString()!.ToLowerInvariant().Contains("password") &&
                           !e.Key.ToString()!.ToLowerInvariant().Contains("token"))
                .ToDictionary(e => e.Key.ToString() ?? string.Empty, e => e.Value?.ToString());
            
            return Ok(new { 
                environment = environmentVars,
                isDocker = !string.IsNullOrEmpty(Environment.GetEnvironmentVariable("DOCKER_ENVIRONMENT")),
                osVersion = Environment.OSVersion.ToString()
            });
        }
    }
} 