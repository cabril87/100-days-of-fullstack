'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/providers/AuthProvider';
import { useRouter } from 'next/navigation';
import { useToast } from '@/lib/hooks/useToast';
import { useTasks } from '@/lib/providers/TaskProvider';
import Link from 'next/link';
import { Task } from '@/lib/types/task';

export default function Dashboard() {
  const { user, isLoading: authLoading } = useAuth();
  const { tasks: allTasks, loading: tasksLoading, error, fetchTasks } = useTasks();
  const router = useRouter();
  const { showToast } = useToast();
  
  // Ensure tasks is always an array
  const tasks = Array.isArray(allTasks) ? allTasks : [];

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login?redirect=/dashboard');
    }
  }, [authLoading, user, router]);

  // Load tasks when auth is resolved
  useEffect(() => {
    if (user) {
      fetchTasks();
    }
  }, [user, fetchTasks]);

  // Show error toast if task loading fails
  useEffect(() => {
    if (error) {
      showToast(error, 'error');
    }
  }, [error, showToast]);

  // Get task statistics
  const totalTasks = tasks.length;
  const todoTasks = tasks.filter(task => task.status === 'todo').length;
  const inProgressTasks = tasks.filter(task => task.status === 'in-progress').length;
  const completedTasks = tasks.filter(task => task.status === 'done').length;
  
  // Get tasks due soon (in the next 7 days)
  const today = new Date();
  const sevenDaysLater = new Date(today);
  sevenDaysLater.setDate(today.getDate() + 7);
  
  const dueSoonTasks = tasks.filter(task => {
    if (!task.dueDate) return false;
    const dueDate = new Date(task.dueDate);
    return dueDate >= today && dueDate <= sevenDaysLater && task.status !== 'done';
  });

  if (authLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="max-w-6xl mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="flex space-x-4">
          <Link
            href="/tasks"
            className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300"
          >
            View All Tasks
          </Link>
          <Link
            href="/tasks/new"
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Add New Task
          </Link>
        </div>
      </div>

      {tasksLoading ? (
        <div className="flex justify-center items-center p-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Task Status Summary */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Task Summary</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-100 p-4 rounded-md">
                <p className="text-sm text-gray-600">Total Tasks</p>
                <p className="text-2xl font-bold">{totalTasks}</p>
              </div>
              <div className="bg-blue-100 p-4 rounded-md">
                <p className="text-sm text-gray-600">To Do</p>
                <p className="text-2xl font-bold">{todoTasks}</p>
              </div>
              <div className="bg-yellow-100 p-4 rounded-md">
                <p className="text-sm text-gray-600">In Progress</p>
                <p className="text-2xl font-bold">{inProgressTasks}</p>
              </div>
              <div className="bg-green-100 p-4 rounded-md">
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-2xl font-bold">{completedTasks}</p>
              </div>
            </div>
          </div>
          
          {/* Tasks Due Soon */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Tasks Due Soon</h2>
            {dueSoonTasks.length > 0 ? (
              <div className="space-y-3">
                {dueSoonTasks.slice(0, 5).map((task) => (
                  <Link href={`/tasks/${task.id}`} key={task.id} className="block">
                    <div className="border p-3 rounded-md hover:bg-gray-50">
                      <p className="font-medium">{task.title}</p>
                      <div className="flex justify-between items-center mt-2 text-sm">
                        <span className={`px-2 py-1 rounded-full ${
                          task.priority === 'high' ? 'bg-red-100 text-red-800' : 
                          task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' : 
                          'bg-green-100 text-green-800'
                        }`}>
                          {task.priority ? task.priority.charAt(0).toUpperCase() + task.priority.slice(1) : 'Normal'}
                        </span>
                        <span className="text-gray-500">Due: {new Date(task.dueDate as string).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </Link>
                ))}
                {dueSoonTasks.length > 5 && (
                  <Link href="/tasks" className="text-blue-600 hover:underline block text-center mt-2">
                    View all {dueSoonTasks.length} tasks due soon
                  </Link>
                )}
              </div>
            ) : (
              <p className="text-gray-500">No tasks due in the next 7 days</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 