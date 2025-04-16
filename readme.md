# 💻 100 Days of Code – Full Stack with C#/.NET & Next.js

Hi, I’m **Carlos Abril Jr.** 👋  
I’m a Sys Admin and Full Stack Developer expanding my backend skills in **C#/.NET** and building modern frontends with **Next.js 14**. I’m using the #100DaysOfCode challenge to sharpen my skills in secure coding, API design, and full-stack app development.

---

## 🎯 Goals

- Dive deeper into **C#** and **ASP.NET Core Web API**
- Build secure, scalable full-stack applications
- Strengthen frontend architecture using **Next.js App Router**
- Apply real-world secure coding practices throughout the stack
- Share daily/weekly progress to stay accountable

---

## 🏗️ Planned Projects

1. **Task Tracker API**  
   - Build a simple CRUD API with ASP.NET Core for creating and managing tasks  
   - Implement **Entity Framework** for database operations  
   - Add basic **authentication/authorization** to practice secure coding

2. **Inventory Management System**  
   - A more complex API with user roles, authentication, and data validation  
   - Integrate a **Next.js** frontend to manage inventory items and suppliers  
   - Employ security best practices (input validation, form sanitization, etc.)

3. **(Optional) Portfolio Rebuild**  
   - Rebuild my personal portfolio in **Next.js**  
   - Integrate a blog section or project gallery that consumes a .NET backend

Feel free to suggest any other ideas or if you have a favorite project you want to see built!

---

## 🧰 Tech Stack

### 🔙 Backend
- **Language**: C#
- **Framework**: ASP.NET Core Web API (.NET 9)
- **ORM**: Entity Framework Core
- **Database**: SQL Server / SQLite
- **Security**: Secure coding patterns, validation, error handling

### 🔜 Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: JavaScript / React
- **Styling**: Tailwind CSS (optional)
- **API Handling**: Fetch / Axios

### ⚙️ Dev Tools
- VS Code + Cursor (AI-powered coding)
- Git & GitHub
- Postman (API testing)
- Docker (optional)
- SQL Management Studio / DB tools

---

## 📅 Daily Log

| Day | Summary |
|-----|---------|
| 1   | Created GitHub repo + README. Defined stack and roadmap for challenge. |
| 2   | **Project Setup Only:** Created ASP.NET Core Web API and tested default endpoints (no DB config yet). |
| 3   | **Database Integration:** Installed EF Core & Dapper; configured MSSQL; added DbContext; tested DB.   |
| 4   | **Data Model Expansion:** Added User, Category, Tag, and TaskTag models with relationships. Implemented entity configurations and proper foreign key constraints. Set up seed data for initial testing. |
| 5   | **DTOs & API Security:** Created DTOs for all models (User, TaskItem, Category, Tag) to properly separate data concerns and improve security. Implemented validation attributes for input sanitization. Set up authentication infrastructure with JWT token support. |
| 6   | **Task Controller Implementation:** Created TaskItemsController with CRUD operations (GET all tasks, GET by ID, POST new task, PUT/PATCH for updates, DELETE). Implemented user-specific task filtering so users can only see their own tasks. Added basic query parameters for filtering tasks by status and category. |
| 7   | **Category Management:** Implemented CategoryController with basic CRUD operations and proper user isolation. Added validation to ensure users can only manage their own categories. Added protection against deleting categories that have associated tasks. |
| 8   | **Tag Management:** Implemented TagController with CRUD operations. Added endpoints to get all tasks with a specific tag. Ensured proper user isolation for tag operations. |
| 9   | **Auth Controller (Part 1):** Implemented AuthController with user registration endpoint. Set up password hashing with Argon2id. Created JWT token configuration. |
| 10  | **Auth Controller (Part 2):** Added login endpoint with JWT token generation. Implemented input validation and error handling. Set up configuration for token lifetime and secret key. |
| 11  | **Auth Controller (Part 3):** Added refresh token functionality. Implemented user profile endpoints. Set up role-based authorization for admin operations. |
| 12  | **Repository Pattern (Part 1):** Created IUserRepository and implementation. Refactored AuthController to use the repository. Added dependency injection for repositories. |
| 13  | **Repository Pattern (Part 2-A):** Designed ITaskItemRepository interface with CRUD and filtering operations. Implemented TaskItemRepository with proper data access methods. Added dependency injection setup. |
| 14  | **Repository Pattern (Part 2-B):** Created TaskStatisticsDTO for dashboard view. Implemented ITaskService interface and TaskService with business logic. Added methods for task filtering and statistics. |
| 15  | **Repository Pattern (Part 2-C):** Refactored TaskItemsController to use the service layer. Added new endpoints for task statistics and due date filtering. Improved error handling across the task management system. |
| 16  | **Repository Pattern (Part 3):** Creating ICategoryRepository and ITagRepository. Refactoring remaining controllers to use repositories. Adding unit tests for repository classes. |
| 17  | Coming soon... |

---

## 🧠 Reflections & Lessons

This challenge is not just about consistency—it's about writing better code, thinking about **security** early, and building software that can scale. I’ll include key takeaways, fixes, and ah-ha moments here weekly.

---

## 🔗 Connect with Me

- [LinkedIn](https://www.linkedin.com/in/abrilcjr/)
- [GitHub](https://github.com/cabril87)

---

## 🚀 Inspired by

- #100DaysOfCode movement
- Real-world dev challenges

---

Thanks for following along!
