import { Task } from '@/lib/types/task';

function randomRecentTimestamp() {
  const now = new Date();
  const daysAgo = Math.floor(Math.random() * 30);
  const hoursAgo = Math.floor(Math.random() * 24);
  
  now.setDate(now.getDate() - daysAgo);
  now.setHours(now.getHours() - hoursAgo);
  
  return now.toISOString();
}

function randomFutureDate() {
  const now = new Date();
  const daysAhead = Math.floor(Math.random() * 14) + 1; 
  now.setDate(now.getDate() + daysAhead);
  return now.toISOString().split('T')[0]; 
}

export const mockTasks: Task[] = [
  {
    id: 1,
    title: 'Complete task management UI',
    description: 'Implement all the core task management UI components including task list, details, and forms.',
    status: 'in-progress',
    priority: 'high',
    dueDate: randomFutureDate(),
    createdAt: randomRecentTimestamp(),
    updatedAt: randomRecentTimestamp(),
    userId: '1'
  },
  {
    id: 2,
    title: 'Fix CSRF token handling',
    description: 'Fix the security issues with CSRF token handling between the frontend and backend.',
    status: 'todo',
    priority: 'high',
    dueDate: randomFutureDate(),
    createdAt: randomRecentTimestamp(),
    updatedAt: randomRecentTimestamp(),
    userId: '1'
  },
  {
    id: 3,
    title: 'Add notification system',
    description: 'Implement a toast notification system for providing feedback on user actions.',
    status: 'done',
    priority: 'medium',
    dueDate: randomFutureDate(),
    createdAt: randomRecentTimestamp(),
    updatedAt: randomRecentTimestamp(),
    userId: '1'
  },
  {
    id: 4,
    title: 'Implement responsive design',
    description: 'Ensure all UI components work well on mobile, tablet, and desktop devices.',
    status: 'todo',
    priority: 'medium',
    createdAt: randomRecentTimestamp(),
    updatedAt: randomRecentTimestamp(),
    userId: '1'
  },
  {
    id: 5,
    title: 'Write unit tests',
    description: 'Create comprehensive test coverage for all core components and services.',
    status: 'todo',
    priority: 'low',
    createdAt: randomRecentTimestamp(),
    updatedAt: randomRecentTimestamp(),
    userId: '1'
  }
]; 