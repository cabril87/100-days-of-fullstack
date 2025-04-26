namespace TaskTrackerAPI.Models
{
    public enum TaskItemStatus
    {
        ToDo = 0,
        NotStarted = 0, // Alias for ToDo
        InProgress = 1,
        OnHold = 2,
        Pending = 3,
        Completed = 4,
        Cancelled = 5
    }
} 