# 🏗️ Service Architecture Documentation

## 📖 **OVERVIEW**

This document outlines the **service layer architecture** for the TaskTracker API, establishing consistent patterns for maintainable, scalable, and testable business logic implementation.

---

## 🎯 **CORE ARCHITECTURAL PRINCIPLES**

### **1. Service Layer Responsibilities**
```
Controllers → Services → Repositories → Database
     ↓          ↓           ↓
   DTOs   ←→  Models  ←→  Entities
```

### **2. Data Flow Pattern**
- **Input**: Controllers receive DTOs from clients
- **Processing**: Services work with Models internally
- **Persistence**: Repositories handle Entity persistence
- **Output**: Services return DTOs to controllers

### **3. Separation of Concerns**
- **Controllers**: HTTP concerns, validation, routing
- **Services**: Business logic, orchestration, transactions
- **Repositories**: Data access, query optimization
- **Models**: Domain entities, business rules
- **DTOs**: Data transfer, API contracts

### **4. Coding Standards**
- **Explicit Type Declarations**: Always use explicit type declarations, never use `var`
- **Repository Pattern**: All data access through repository interfaces
- **AutoMapper**: Use AutoMapper for all DTO/Model conversions
- **Async/Await**: Proper async patterns throughout
- **Dependency Injection**: Constructor injection for all dependencies

---

## 🏛️ **ARCHITECTURAL PATTERNS**

### **✅ Repository Pattern Implementation**

```csharp
public class TaskService : ITaskService
{
    private readonly ITaskItemRepository _taskRepository;
    private readonly ICategoryRepository _categoryRepository;
    private readonly IMapper _mapper;
    private readonly ILogger<TaskService> _logger;

    public TaskService(
        ITaskItemRepository taskRepository,
        ICategoryRepository categoryRepository,
        IMapper mapper,
        ILogger<TaskService> logger)
    {
        _taskRepository = taskRepository;
        _categoryRepository = categoryRepository;
        _mapper = mapper;
        _logger = logger;
    }
}
```

### **✅ DTO/Model Conversion Pattern**

```csharp
// ✅ CORRECT: DTOs at service boundaries
public async Task<TaskItemDTO?> GetTaskByIdAsync(int userId, int taskId)
{
    // ✅ Work with models internally
    TaskItem? task = await _taskRepository.GetTaskByIdAsync(taskId, userId);
    
    // ✅ Convert to DTO at boundary
    return task != null ? _mapper.Map<TaskItemDTO>(task) : null;
}

public async Task<TaskItemDTO?> CreateTaskAsync(int userId, TaskItemDTO taskDto)
{
    // ✅ Convert DTO to model for business logic
    TaskItem taskItem = new TaskItem
    {
        Title = taskDto.Title ?? string.Empty,
        Description = taskDto.Description ?? string.Empty,
        Status = taskDto.Status,
        UserId = userId,
        CreatedAt = DateTime.UtcNow
    };
    
    await _taskRepository.CreateTaskAsync(taskItem);
    
    // ✅ Return DTO
    TaskItem? result = await _taskRepository.GetTaskByIdAsync(taskItem.Id, userId);
    return result != null ? _mapper.Map<TaskItemDTO>(result) : null;
}
```

### **✅ Explicit Type Declarations**

```csharp
// ✅ CORRECT: All types explicit
public async Task<IEnumerable<TaskItemDTO>> GetAllTasksAsync(int userId)
{
    IEnumerable<TaskItem> tasks = await _taskRepository.GetAllTasksAsync(userId);
    return _mapper.Map<IEnumerable<TaskItemDTO>>(tasks);
}

public async Task<PagedResult<TaskItemDTO>> GetPagedTasksAsync(int userId, PaginationParams paginationParams)
{
    PagedResult<TaskItem> pagedTasks = await _taskRepository.GetPagedTasksAsync(userId, paginationParams);
    List<TaskItemDTO> mappedTasks = _mapper.Map<List<TaskItemDTO>>(pagedTasks.Items);
    
    PagedResult<TaskItemDTO> result = new PagedResult<TaskItemDTO>(
        mappedTasks,
        pagedTasks.TotalCount,
        pagedTasks.PageNumber,
        pagedTasks.PageSize
    );
    
    return result;
}
```

---

## 🔧 **AUTOMAPPER CONFIGURATION**

### **Profile Structure**

```csharp
public class TaskItemProfile : Profile
{
    public TaskItemProfile()
    {
        // Bidirectional mapping
        CreateMap<TaskItem, TaskItemDTO>()
            .ForMember(dest => dest.CategoryName, opt => 
                opt.MapFrom(src => src.Category != null ? src.Category.Name : string.Empty))
            .ForMember(dest => dest.Priority, opt => 
                opt.MapFrom(src => ConvertPriorityToInt(src.Priority)));

        CreateMap<TaskItemDTO, TaskItem>()
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
            .ForMember(dest => dest.UpdatedAt, opt => opt.MapFrom(src => DateTime.UtcNow));
    }
}
```

### **Complex Mapping Examples**

```csharp
// ML Service Mappings
public class AdaptationLearningProfile : Profile
{
    public AdaptationLearningProfile()
    {
        CreateMap<UserLearningProfile, UserLearningProfileDto>();
        
        CreateMap<CreateUserLearningProfileDto, UserLearningProfile>()
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.LearningVelocity, opt => opt.MapFrom(src => 1.0))
            .ForMember(dest => dest.CreatedAt, opt => opt.MapFrom(src => DateTime.UtcNow));
    }
}
```

---

## 📋 **SERVICE IMPLEMENTATION CHECKLIST**

### **✅ Required Components**

#### **1. Dependencies**
```csharp
private readonly I[Entity]Repository _repository;
private readonly IMapper _mapper;
private readonly ILogger<[Service]> _logger;
```

#### **2. Constructor Injection**
```csharp
public [Service](
    I[Entity]Repository repository,
    IMapper mapper,
    ILogger<[Service]> logger)
{
    _repository = repository;
    _mapper = mapper;
    _logger = logger;
}
```

#### **3. Method Pattern**
```csharp
public async Task<[Entity]DTO?> Get[Entity]ByIdAsync(int id, int userId)
{
    [Entity]? entity = await _repository.GetByIdAsync(id, userId);
    return entity != null ? _mapper.Map<[Entity]DTO>(entity) : null;
}
```

### **✅ Naming Conventions**

| Component | Pattern | Example |
|-----------|---------|---------|
| Service | `[Entity]Service` | `TaskService` |
| Interface | `I[Entity]Service` | `ITaskService` |
| Repository | `I[Entity]Repository` | `ITaskItemRepository` |
| Model | `[Entity]` | `TaskItem` |
| DTO | `[Entity]DTO` | `TaskItemDTO` |
| Create DTO | `Create[Entity]DTO` | `CreateTaskItemDTO` |
| Update DTO | `Update[Entity]DTO` | `UpdateTaskItemDTO` |

---

## 🎯 **ADVANCED PATTERNS**

### **✅ Transaction Management**

```csharp
public async Task<TaskItemDTO?> CreateTaskWithCategoryAsync(int userId, CreateTaskWithCategoryDTO dto)
{
    // Validate category ownership
    if (dto.CategoryId.HasValue)
    {
        bool isCategoryOwned = await _categoryRepository.IsCategoryOwnedByUserAsync(dto.CategoryId.Value, userId);
        if (!isCategoryOwned)
        {
            throw new UnauthorizedAccessException("Invalid category access");
        }
    }
    
    // Create task
    TaskItem taskItem = _mapper.Map<TaskItem>(dto);
    taskItem.UserId = userId;
    
    await _taskRepository.CreateTaskAsync(taskItem);
    
    // Handle gamification (secondary concern)
    try
    {
        await _gamificationService.AddPointsAsync(userId, 5, "task_creation", $"Created task: {taskItem.Title}");
    }
    catch (Exception ex)
    {
        _logger.LogError(ex, "Gamification error for task creation");
        // Don't fail the primary operation
    }
    
    return _mapper.Map<TaskItemDTO>(taskItem);
}
```

### **✅ Batch Operations**

```csharp
public async Task<List<TaskStatusUpdateResponseDTO>> BatchUpdateTaskStatusAsync(
    int userId, 
    BatchStatusUpdateRequestDTO batchUpdateDto)
{
    List<TaskStatusUpdateResponseDTO> responses = new List<TaskStatusUpdateResponseDTO>();
    
    foreach (TaskStatusUpdateDTO statusUpdate in batchUpdateDto.StatusUpdates)
    {
        try
        {
            TaskItemDTO? updatedTask = await UpdateTaskStatusInternalAsync(userId, statusUpdate.TaskId, statusUpdate.NewStatus);
            
            if (updatedTask != null)
            {
                responses.Add(new TaskStatusUpdateResponseDTO
                {
                    TaskId = statusUpdate.TaskId,
                    Success = true,
                    UpdatedTask = updatedTask
                });
            }
        }
        catch (Exception ex)
        {
            responses.Add(new TaskStatusUpdateResponseDTO
            {
                TaskId = statusUpdate.TaskId,
                Success = false,
                ErrorMessage = ex.Message
            });
        }
    }
    
    return responses;
}
```

### **✅ Machine Learning Service Pattern**

```csharp
public class AdaptationLearningService : IAdaptationLearningService
{
    public async Task<UserLearningProfileDto> AdaptUserPreferencesAsync(int userId)
    {
        // ✅ Work with models internally
        UserLearningProfile? profile = await _adaptationRepository.GetUserLearningProfileAsync(userId);
        if (profile == null)
        {
            throw new InvalidOperationException($"Learning profile not found for user {userId}");
        }

        // Complex business logic with models
        List<AdaptationEvent> adaptationEvents = new List<AdaptationEvent>();
        await AdaptComplexityPreferenceAsync(userId, profile, adaptationEvents);
        await AdaptTimingPreferenceAsync(userId, profile, adaptationEvents);
        
        // Update and persist
        UserLearningProfile updatedProfile = await _adaptationRepository.UpdateUserLearningProfileAsync(profile);
        
        // ✅ Return DTO
        return _mapper.Map<UserLearningProfileDto>(updatedProfile);
    }
}
```

---

## 🚫 **ANTI-PATTERNS TO AVOID**

### **❌ Models at Service Boundaries**

```csharp
// ❌ BAD: Exposing models
public async Task<TaskItem> GetTaskAsync(int id) // Should return TaskItemDTO

// ❌ BAD: Accepting models
public async Task<TaskItem> CreateTaskAsync(TaskItem task) // Should accept CreateTaskDTO
```

### **❌ Implicit Var Declarations**

```csharp
// ❌ BAD: Implicit typing
var tasks = await _repository.GetAllAsync();
var result = _mapper.Map<TaskItemDTO>(task);

// ✅ GOOD: Explicit typing
IEnumerable<TaskItem> tasks = await _repository.GetAllAsync();
TaskItemDTO result = _mapper.Map<TaskItemDTO>(task);
```

### **❌ Manual Mapping**

```csharp
// ❌ BAD: Manual mapping
return new TaskItemDTO
{
    Id = task.Id,
    Title = task.Title,
    Description = task.Description
    // ... dozens of properties
};

// ✅ GOOD: AutoMapper
return _mapper.Map<TaskItemDTO>(task);
```

### **❌ Repository Logic in Services**

```csharp
// ❌ BAD: Direct EF context usage
using (var context = new ApplicationDbContext())
{
    var tasks = context.Tasks.Where(t => t.UserId == userId).ToList();
}

// ✅ GOOD: Repository abstraction
IEnumerable<TaskItem> tasks = await _taskRepository.GetAllTasksAsync(userId);
```

---

## 📊 **PERFORMANCE CONSIDERATIONS**

### **✅ Async/Await Patterns**

```csharp
// ✅ CORRECT: Proper async implementation
public async Task<IEnumerable<TaskItemDTO>> GetTasksByStatusAsync(int userId, TaskItemStatus status)
{
    IEnumerable<TaskItem> tasks = await _taskRepository.GetTasksByStatusAsync(userId, status);
    return _mapper.Map<IEnumerable<TaskItemDTO>>(tasks);
}
```

### **✅ Pagination Support**

```csharp
public async Task<PagedResult<TaskItemDTO>> GetPagedTasksAsync(int userId, PaginationParams paginationParams)
{
    PagedResult<TaskItem> pagedTasks = await _taskRepository.GetPagedTasksAsync(userId, paginationParams);
    List<TaskItemDTO> mappedTasks = _mapper.Map<List<TaskItemDTO>>(pagedTasks.Items);
    
    return new PagedResult<TaskItemDTO>(
        mappedTasks,
        pagedTasks.TotalCount,
        pagedTasks.PageNumber,
        pagedTasks.PageSize
    );
}
```

### **✅ Caching Strategy**

```csharp
public async Task<CategoryDTO?> GetCategoryByIdAsync(int categoryId, int userId)
{
    // Repository handles caching internally
    Category? category = await _categoryRepository.GetCategoryByIdAsync(categoryId, userId);
    return category != null ? _mapper.Map<CategoryDTO>(category) : null;
}
```

---

## 🧪 **TESTING PATTERNS**

### **✅ Service Unit Testing**

```csharp
[Test]
public async Task GetTaskByIdAsync_ValidId_ReturnsTaskDto()
{
    // Arrange
    var mockRepository = new Mock<ITaskItemRepository>();
    var mockMapper = new Mock<IMapper>();
    var mockLogger = new Mock<ILogger<TaskService>>();
    
    var taskItem = new TaskItem { Id = 1, Title = "Test Task", UserId = 1 };
    var taskDto = new TaskItemDTO { Id = 1, Title = "Test Task" };
    
    mockRepository.Setup(r => r.GetTaskByIdAsync(1, 1)).ReturnsAsync(taskItem);
    mockMapper.Setup(m => m.Map<TaskItemDTO>(taskItem)).Returns(taskDto);
    
    var service = new TaskService(mockRepository.Object, mockMapper.Object, mockLogger.Object);
    
    // Act
    TaskItemDTO? result = await service.GetTaskByIdAsync(1, 1);
    
    // Assert
    Assert.That(result, Is.Not.Null);
    Assert.That(result.Id, Is.EqualTo(1));
    Assert.That(result.Title, Is.EqualTo("Test Task"));
}
```

---

## 📈 **METRICS & MONITORING**

### **✅ Logging Patterns**

```csharp
public async Task<TaskItemDTO?> CreateTaskAsync(int userId, TaskItemDTO taskDto)
{
    _logger.LogInformation("Creating task for user {UserId}: {TaskTitle}", userId, taskDto.Title);
    
    try
    {
        // Business logic
        TaskItem result = await _taskRepository.CreateTaskAsync(taskItem);
        
        _logger.LogInformation("Successfully created task {TaskId} for user {UserId}", result.Id, userId);
        return _mapper.Map<TaskItemDTO>(result);
    }
    catch (Exception ex)
    {
        _logger.LogError(ex, "Error creating task for user {UserId}", userId);
        throw;
    }
}
```

### **✅ Performance Monitoring**

```csharp
public async Task<PagedResult<TaskItemDTO>> GetPagedTasksAsync(int userId, PaginationParams paginationParams)
{
    using var activity = Activity.StartActivity("TaskService.GetPagedTasks");
    activity?.SetTag("user.id", userId.ToString());
    activity?.SetTag("page.number", paginationParams.PageNumber.ToString());
    
    PagedResult<TaskItem> pagedTasks = await _taskRepository.GetPagedTasksAsync(userId, paginationParams);
    List<TaskItemDTO> mappedTasks = _mapper.Map<List<TaskItemDTO>>(pagedTasks.Items);
    
    activity?.SetTag("tasks.count", mappedTasks.Count.ToString());
    
    return new PagedResult<TaskItemDTO>(mappedTasks, pagedTasks.TotalCount, pagedTasks.PageNumber, pagedTasks.PageSize);
}
```

---

## 🔧 **DEPENDENCY INJECTION SETUP**

### **✅ Service Registration**

```csharp
// Program.cs
builder.Services.AddScoped<ITaskService, TaskService>();
builder.Services.AddScoped<ICategoryService, CategoryService>();
builder.Services.AddScoped<IAdaptationLearningService, AdaptationLearningService>();
builder.Services.AddScoped<IPersonalizedRecommendationService, PersonalizedRecommendationService>();

// AutoMapper
builder.Services.AddAutoMapper(typeof(TaskItemProfile));
```

---

## 🎉 **CONCLUSION**

This service architecture provides:

### **✅ Benefits Achieved**
- **🏗️ Consistent Patterns**: All services follow the same structure
- **🔧 Maintainability**: Clear separation of concerns
- **🧪 Testability**: Easy to mock and unit test
- **📊 Performance**: Async operations and proper data handling
- **🛡️ Type Safety**: Explicit typing prevents runtime errors
- **🔄 Scalability**: Repository pattern enables easy data layer changes

### **📋 Quick Reference**
1. **Services use Models internally**
2. **DTOs at service boundaries**
3. **AutoMapper for conversions**
4. **Repository pattern for data access**
5. **Explicit type declarations**
6. **Proper async/await usage**
7. **Comprehensive error handling**
8. **Logging and monitoring**

**🚀 This architecture is production-ready and enterprise-grade!** 

## 📏 **CODING STANDARDS & REQUIREMENTS**

### **✅ MANDATORY: Explicit Type Declarations**

```csharp
// ✅ CORRECT: Always use explicit types
public async Task<IEnumerable<TaskItemDTO>> GetAllTasksAsync(int userId)
{
    IEnumerable<TaskItem> tasks = await _taskRepository.GetAllTasksAsync(userId);
    List<TaskItemDTO> mappedTasks = _mapper.Map<List<TaskItemDTO>>(tasks);
    PagedResult<TaskItem> pagedResult = await _taskRepository.GetPagedTasksAsync(userId, pagination);
    Dictionary<string, object> metadata = new Dictionary<string, object>();
    
    return mappedTasks;
}

// ❌ FORBIDDEN: Never use var keyword
public async Task<IEnumerable<TaskItemDTO>> GetAllTasksAsync(int userId)
{
    var tasks = await _taskRepository.GetAllTasksAsync(userId);  // ❌ NO!
    var mappedTasks = _mapper.Map<List<TaskItemDTO>>(tasks);     // ❌ NO!
    var pagedResult = await _taskRepository.GetPagedTasks();     // ❌ NO!
    var metadata = new Dictionary<string, object>();             // ❌ NO!
    
    return mappedTasks;
}
```

### **✅ Exception Handling Standards**

```csharp
// ✅ CORRECT: Explicit type in catch blocks
try
{
    TaskItem task = await _taskRepository.GetTaskByIdAsync(taskId, userId);
    TaskItemDTO result = _mapper.Map<TaskItemDTO>(task);
    return result;
}
catch (Exception ex) // ✅ Explicit Exception type
{
    _logger.LogError(ex, "Error retrieving task {TaskId} for user {UserId}", taskId, userId);
    throw;
}

// ❌ WRONG: Using var in exception handling
catch (var ex) // ❌ NEVER do this
{
    // ...
}
```

### **✅ LINQ and Collection Standards**

```csharp
// ✅ CORRECT: Explicit types in LINQ operations
public async Task<List<TaskSummaryDTO>> GetTaskSummariesAsync(int userId)
{
    IEnumerable<TaskItem> allTasks = await _taskRepository.GetAllTasksAsync(userId);
    
    List<TaskItem> completedTasks = allTasks.Where(t => t.Status == TaskItemStatus.Completed).ToList();
    List<TaskItem> pendingTasks = allTasks.Where(t => t.Status == TaskItemStatus.Pending).ToList();
    Dictionary<TaskItemStatus, int> statusCounts = allTasks.GroupBy(t => t.Status)
        .ToDictionary(g => g.Key, g => g.Count());
    
    List<TaskSummaryDTO> summaries = new List<TaskSummaryDTO>();
    // Process summaries...
    
    return summaries;
}

// ❌ WRONG: Using var in LINQ
public async Task<List<TaskSummaryDTO>> GetTaskSummariesAsync(int userId)
{
    var allTasks = await _taskRepository.GetAllTasksAsync(userId);     // ❌ NO!
    var completedTasks = allTasks.Where(t => t.Status == TaskItemStatus.Completed).ToList(); // ❌ NO!
    var statusCounts = allTasks.GroupBy(t => t.Status).ToDictionary(g => g.Key, g => g.Count()); // ❌ NO!
}
``` 