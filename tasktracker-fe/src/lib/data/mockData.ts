import { Task, TaskPriority, TaskStatus } from "../types/task";

export const mockTasks: Task[] = [
  {
    id: 1,
    title: 'Complete API documentation',
    description: 'Document all API endpoints and their parameters',
    status: 'in-progress',
    priority: 'high',
    dueDate: '2023-06-15',
    createdAt: '2023-06-01T10:00:00Z',
    updatedAt: '2023-06-10T14:30:00Z',
    userId: "user1"
  },
  {
    id: 2,
    title: 'Fix login page bug',
    description: 'Users are experiencing issues with the login form on mobile devices',
    status: 'todo',
    priority: 'high',
    dueDate: '2023-06-12',
    createdAt: '2023-06-08T09:15:00Z',
    updatedAt: '2023-06-08T09:15:00Z',
    userId: "user1"
  },
  {
    id: 3,
    title: 'Add new dashboard widgets',
    description: 'Create analytics widgets for the admin dashboard',
    status: 'done',
    priority: 'medium',
    dueDate: '2023-06-05',
    createdAt: '2023-06-01T11:30:00Z',
    updatedAt: '2023-06-05T16:45:00Z',
    userId: "user1"
  },
  {
    id: 4,
    title: 'Update privacy policy',
    description: 'Review and update privacy policy to comply with new regulations',
    status: 'todo',
    priority: 'low',
    dueDate: '2023-06-25',
    createdAt: '2023-06-02T14:00:00Z',
    updatedAt: '2023-06-09T10:20:00Z',
    userId: "user2"
  },
  {
    id: 5,
    title: 'Design new marketing materials',
    description: 'Create designs for social media campaign',
    status: 'in-progress',
    priority: 'medium',
    dueDate: '2023-06-18',
    createdAt: '2023-06-05T09:00:00Z',
    updatedAt: '2023-06-10T11:10:00Z',
    userId: "user2"
  }
]; 