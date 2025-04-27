using System;

namespace TaskTrackerAPI.Exceptions
{
    
    /// Exception thrown when a security violation is detected
    
    public class SecurityException : Exception
    {
        public SecurityException() : base() { }

        public SecurityException(string message) : base(message) { }

        public SecurityException(string message, Exception innerException) : base(message, innerException) { }
    }
} 