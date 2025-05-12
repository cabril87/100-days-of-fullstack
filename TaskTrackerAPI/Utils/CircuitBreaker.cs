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
using System.Collections.Concurrent;

namespace TaskTrackerAPI.Utils;

/// <summary>
/// Represents the current state of the circuit breaker
/// </summary>
public enum CircuitState
{
    /// <summary>
    /// The circuit is closed and requests are allowed through
    /// </summary>
    Closed,
    
    /// <summary>
    /// The circuit is open and requests are blocked to prevent cascading failures
    /// </summary>
    Open,
    
    /// <summary>
    /// The circuit is partially open to test if the underlying system has recovered
    /// </summary>
    HalfOpen
}

/// <summary>
/// Implementation of the Circuit Breaker pattern to prevent cascading failures
/// </summary>
public class CircuitBreaker
{
    private readonly ILogger<CircuitBreaker> _logger;
    private readonly int _failureThreshold;
    private readonly TimeSpan _resetTimeout;
    private readonly object _stateLock = new();
    
    // Track circuits by name
    private static readonly ConcurrentDictionary<string, CircuitBreaker> _circuitBreakers = new();
    
    // Current state of the circuit
    private CircuitState _state = CircuitState.Closed;
    
    // Count of consecutive failures
    private int _failureCount;
    
    // Last time the circuit tripped from closed to open
    private DateTime _lastStateChangeTime = DateTime.MinValue;
    
    // Is this the first test after the timeout period
    private bool _isFirstTestAfterTimeout;
    
    /// <summary>
    /// Gets the current state of the circuit
    /// </summary>
    public CircuitState State => _state;
    
    /// <summary>
    /// Gets the name of this circuit
    /// </summary>
    public string Name { get; }
    
    private CircuitBreaker(
        string name,
        int failureThreshold,
        TimeSpan resetTimeout,
        ILogger<CircuitBreaker> logger)
    {
        Name = name;
        _failureThreshold = failureThreshold;
        _resetTimeout = resetTimeout;
        _logger = logger;
    }
    
    /// <summary>
    /// Gets or creates a circuit breaker with the given name
    /// </summary>
    /// <param name="name">The name of the circuit breaker</param>
    /// <param name="failureThreshold">Number of consecutive failures before the circuit opens</param>
    /// <param name="resetTimeoutSeconds">Seconds to wait before attempting to recover</param>
    /// <param name="logger">Logger for circuit state changes</param>
    /// <returns>The circuit breaker instance</returns>
    public static CircuitBreaker GetOrCreate(
        string name,
        int failureThreshold = 5,
        int resetTimeoutSeconds = 60,
        ILogger<CircuitBreaker>? logger = null)
    {
        return _circuitBreakers.GetOrAdd(name, key => new CircuitBreaker(
            key,
            failureThreshold,
            TimeSpan.FromSeconds(resetTimeoutSeconds),
            logger ?? new NullLogger<CircuitBreaker>()
        ));
    }
    
    /// <summary>
    /// Executes the provided action if the circuit allows
    /// </summary>
    /// <param name="action">The action to execute</param>
    /// <returns>True if the action was executed, false if blocked by the circuit</returns>
    /// <exception cref="Exception">Re-throws any exceptions from the action</exception>
    public bool ExecuteAction(Action action)
    {
        if (!CanExecute())
        {
            return false;
        }
        
        try
        {
            action();
            RecordSuccess();
            return true;
        }
        catch (Exception)
        {
            RecordFailure();
            throw;
        }
    }
    
    /// <summary>
    /// Executes the provided async action if the circuit allows
    /// </summary>
    /// <param name="action">The async action to execute</param>
    /// <returns>True if the action was executed, false if blocked by the circuit</returns>
    public async Task<bool> ExecuteActionAsync(Func<Task> action)
    {
        if (!CanExecute())
        {
            return false;
        }
        
        try
        {
            await action();
            RecordSuccess();
            return true;
        }
        catch (Exception)
        {
            RecordFailure();
            throw;
        }
    }
    
    /// <summary>
    /// Executes the provided function if the circuit allows
    /// </summary>
    /// <typeparam name="T">The return type of the function</typeparam>
    /// <param name="func">The function to execute</param>
    /// <param name="fallbackValue">The value to return if the circuit is open</param>
    /// <returns>The result of the function or the fallback value</returns>
    public T ExecuteFunction<T>(Func<T> func, T fallbackValue)
    {
        if (!CanExecute())
        {
            return fallbackValue;
        }
        
        try
        {
            T result = func();
            RecordSuccess();
            return result;
        }
        catch (Exception)
        {
            RecordFailure();
            throw;
        }
    }
    
    /// <summary>
    /// Executes the provided async function if the circuit allows
    /// </summary>
    /// <typeparam name="T">The return type of the function</typeparam>
    /// <param name="func">The async function to execute</param>
    /// <param name="fallbackValue">The value to return if the circuit is open</param>
    /// <returns>The result of the function or the fallback value</returns>
    public async Task<T> ExecuteFunctionAsync<T>(Func<Task<T>> func, T fallbackValue)
    {
        if (!CanExecute())
        {
            return fallbackValue;
        }
        
        try
        {
            T result = await func();
            RecordSuccess();
            return result;
        }
        catch (Exception)
        {
            RecordFailure();
            throw;
        }
    }
    
    /// <summary>
    /// Manually opens the circuit
    /// </summary>
    public void Trip()
    {
        lock (_stateLock)
        {
            if (_state != CircuitState.Open)
            {
                _logger.LogWarning("Circuit '{CircuitName}' manually tripped to Open state", Name);
                _state = CircuitState.Open;
                _lastStateChangeTime = DateTime.UtcNow;
            }
        }
    }
    
    /// <summary>
    /// Manually resets the circuit to closed state
    /// </summary>
    public void Reset()
    {
        lock (_stateLock)
        {
            _logger.LogInformation("Circuit '{CircuitName}' manually reset to Closed state", Name);
            _state = CircuitState.Closed;
            _failureCount = 0;
            _lastStateChangeTime = DateTime.UtcNow;
        }
    }
    
    /// <summary>
    /// Determines if a request can proceed based on the current circuit state
    /// </summary>
    private bool CanExecute()
    {
        lock (_stateLock)
        {
            switch (_state)
            {
                case CircuitState.Closed:
                    return true;
                    
                case CircuitState.Open:
                    // Check if the reset timeout has expired
                    TimeSpan elapsed = DateTime.UtcNow - _lastStateChangeTime;
                    if (elapsed >= _resetTimeout)
                    {
                        // Move to half-open state to test if the system has recovered
                        _state = CircuitState.HalfOpen;
                        _isFirstTestAfterTimeout = true;
                        _logger.LogInformation(
                            "Circuit '{CircuitName}' transitioned from Open to HalfOpen after {Elapsed:g} timeout",
                            Name, elapsed);
                        return true;
                    }
                    
                    _logger.LogTrace(
                        "Circuit '{CircuitName}' is Open - Blocking execution. {SecondsRemaining}s remaining until retry.",
                        Name, Math.Round((_resetTimeout - elapsed).TotalSeconds));
                    return false;
                    
                case CircuitState.HalfOpen:
                    // Only allow one test request at a time in half-open state
                    if (_isFirstTestAfterTimeout)
                    {
                        _isFirstTestAfterTimeout = false;
                        return true;
                    }
                    
                    _logger.LogTrace("Circuit '{CircuitName}' is HalfOpen - Waiting for test request to complete", Name);
                    return false;
                    
                default:
                    return false;
            }
        }
    }
    
    /// <summary>
    /// Records a successful operation
    /// </summary>
    private void RecordSuccess()
    {
        lock (_stateLock)
        {
            _failureCount = 0;
            
            if (_state == CircuitState.HalfOpen)
            {
                _state = CircuitState.Closed;
                _logger.LogInformation("Circuit '{CircuitName}' recovered and is now Closed", Name);
            }
        }
    }
    
    /// <summary>
    /// Records a failed operation
    /// </summary>
    private void RecordFailure()
    {
        lock (_stateLock)
        {
            _failureCount++;
            
            if (_state == CircuitState.HalfOpen || (_state == CircuitState.Closed && _failureCount >= _failureThreshold))
            {
                _state = CircuitState.Open;
                _lastStateChangeTime = DateTime.UtcNow;
                _logger.LogWarning(
                    "Circuit '{CircuitName}' tripped to Open state after {FailureCount} consecutive failures", 
                    Name, _failureCount);
            }
        }
    }
    
    /// <summary>
    /// Gets all circuit breakers
    /// </summary>
    public static IReadOnlyDictionary<string, CircuitBreaker> GetAll()
    {
        return _circuitBreakers;
    }
    
    /// <summary>
    /// Null logger implementation
    /// </summary>
    private class NullLogger<T> : ILogger<T>
    {
        public IDisposable? BeginScope<TState>(TState state) where TState : notnull => NullDisposable.Instance;
        public bool IsEnabled(LogLevel logLevel) => false;
        public void Log<TState>(LogLevel logLevel, EventId eventId, TState state, Exception? exception, Func<TState, Exception?, string> formatter) { }
        
        private class NullDisposable : IDisposable
        {
            public static readonly NullDisposable Instance = new();
            public void Dispose() { }
        }
    }
} 