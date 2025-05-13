'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { apiClient } from '@/lib/services/apiClient';
import { taskService } from '@/lib/services/taskService';

export default function UpdateTestPage() {
  const [taskId, setTaskId] = useState<string>('');
  const [title, setTitle] = useState<string>('');
  const [status, setStatus] = useState<string>('todo');
  const [priority, setPriority] = useState<string>('medium');
  const [currentTask, setCurrentTask] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [token, setToken] = useState<string>('');
  const [refreshToken, setRefreshToken] = useState<string>('');

  useEffect(() => {
    // Get auth tokens from localStorage
    if (typeof window !== 'undefined') {
      setToken(localStorage.getItem('token') || '');
      setRefreshToken(localStorage.getItem('refreshToken') || '');
    }
  }, []);

  const loadTask = async () => {
    if (!taskId || isNaN(parseInt(taskId))) {
      setError('Please enter a valid task ID');
      return;
    }

    setLoading(true);
    setError('');
    setResult('');

    try {
      const id = parseInt(taskId);
      const response = await taskService.getTask(id);
      
      if (response.data) {
        setCurrentTask(response.data);
        setTitle(response.data.title);
        setStatus(response.data.status);
        setPriority(response.data.priority || 'medium');
        setResult(JSON.stringify(response.data, null, 2));
      } else {
        setError(response.error || 'Failed to load task');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const updateTask = async (method: string) => {
    if (!currentTask) {
      setError('Please load a task first');
      return;
    }

    setLoading(true);
    setError('');
    setResult('');

    try {
      const id = parseInt(taskId);
      const updateData = {
        title,
        status,
        priority
      };

      let response;

      switch (method) {
        case 'service':
          response = await taskService.updateTask(id, updateData);
          break;
        case 'client':
          response = await apiClient.updateTask(id, updateData);
          break;
        case 'direct-put':
          // Convert status and priority to numbers for API
          const directData: Record<string, any> = {
            Id: id,
            Title: title
          };

          // Map status
          if (status === 'todo') directData.Status = 0;
          else if (status === 'in-progress') directData.Status = 1;
          else if (status === 'done') directData.Status = 2;

          // Map priority
          if (priority === 'low') directData.Priority = 0;
          else if (priority === 'medium') directData.Priority = 1;
          else if (priority === 'high') directData.Priority = 2;

          const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
          
          const directResponse = await fetch(`${API_URL}/v1/taskitems/${id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
              'Accept': 'application/json'
            },
            body: JSON.stringify(directData),
            credentials: 'include'
          });

          if (directResponse.ok) {
            response = { status: directResponse.status, data: await directResponse.json() };
          } else {
            let errorText = `Error ${directResponse.status}: ${directResponse.statusText}`;
            try {
              const errorData = await directResponse.text();
              errorText += `\n${errorData}`;
            } catch (e) {}
            response = { error: errorText, status: directResponse.status };
          }
          break;
        case 'direct-post':
          // Similar to direct-put but using POST with _method=PUT
          const postData: Record<string, any> = {
            Id: id,
            Title: title
          };

          // Map status
          if (status === 'todo') postData.Status = 0;
          else if (status === 'in-progress') postData.Status = 1;
          else if (status === 'done') postData.Status = 2;

          // Map priority
          if (priority === 'low') postData.Priority = 0;
          else if (priority === 'medium') postData.Priority = 1;
          else if (priority === 'high') postData.Priority = 2;

          const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
          
          const postResponse = await fetch(`${apiUrl}/v1/taskitems/${id}?_method=PUT`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
              'Accept': 'application/json',
              'X-HTTP-Method-Override': 'PUT'
            },
            body: JSON.stringify(postData),
            credentials: 'include'
          });

          if (postResponse.ok) {
            response = { status: postResponse.status, data: await postResponse.json() };
          } else {
            let errorText = `Error ${postResponse.status}: ${postResponse.statusText}`;
            try {
              const errorData = await postResponse.text();
              errorText += `\n${errorData}`;
            } catch (e) {}
            response = { error: errorText, status: postResponse.status };
          }
          break;
        case 'form-data':
          // Using FormData
          const formData = new FormData();
          formData.append('Id', id.toString());
          formData.append('Title', title);
          
          // Map status
          if (status === 'todo') formData.append('Status', '0');
          else if (status === 'in-progress') formData.append('Status', '1');
          else if (status === 'done') formData.append('Status', '2');

          // Map priority
          if (priority === 'low') formData.append('Priority', '0');
          else if (priority === 'medium') formData.append('Priority', '1');
          else if (priority === 'high') formData.append('Priority', '2');

          const formUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
          
          const formResponse = await fetch(`${formUrl}/v1/taskitems/${id}`, {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${token}`
            },
            body: formData,
            credentials: 'include'
          });

          if (formResponse.ok) {
            response = { status: formResponse.status, data: 'Success (No Content)' };
          } else {
            let errorText = `Error ${formResponse.status}: ${formResponse.statusText}`;
            try {
              const errorData = await formResponse.text();
              errorText += `\n${errorData}`;
            } catch (e) {}
            response = { error: errorText, status: formResponse.status };
          }
          break;
        default:
          response = { error: 'Invalid method', status: 400 };
      }

      if (response.data) {
        setResult(JSON.stringify(response.data, null, 2));
      } else if (response.error) {
        setError(response.error);
      } else {
        setResult(`Success with status ${response.status}`);
      }

      // If successful, reload the task
      if (response.status === 200 || response.status === 204) {
        await loadTask();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Task Update Test</h1>
      
      <div className="mb-4">
        <Link href="/dashboard" className="text-blue-600 hover:underline">
          ← Back to Dashboard
        </Link>
      </div>

      {/* Auth Information */}
      <div className="bg-gray-100 p-4 rounded mb-4">
        <h2 className="font-bold mb-2">Auth Information</h2>
        <div>
          <div><strong>Token:</strong> {token ? `${token.substring(0, 20)}...` : 'Not found'}</div>
          <div><strong>Refresh Token:</strong> {refreshToken ? 'Present' : 'Not found'}</div>
        </div>
      </div>
      
      {/* Task Load Form */}
      <div className="bg-white shadow-md rounded p-4 mb-4">
        <h2 className="font-bold mb-2">Load Task</h2>
        <div className="flex gap-2 mb-4">
          <input
            type="number"
            value={taskId}
            onChange={(e) => setTaskId(e.target.value)}
            placeholder="Task ID"
            className="border p-2 rounded"
          />
          <button
            onClick={loadTask}
            disabled={loading}
            className="bg-blue-500 text-white px-4 py-2 rounded disabled:bg-blue-300"
          >
            Load Task
          </button>
        </div>
      </div>

      {/* Task Update Form */}
      {currentTask && (
        <div className="bg-white shadow-md rounded p-4 mb-4">
          <h2 className="font-bold mb-2">Update Task</h2>
          
          <div className="mb-3">
            <label className="block text-sm font-medium mb-1">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border p-2 rounded"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-3">
            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full border p-2 rounded"
              >
                <option value="todo">To Do</option>
                <option value="in-progress">In Progress</option>
                <option value="done">Done</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full border p-2 rounded"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => updateTask('service')}
              disabled={loading}
              className="bg-green-500 text-white px-4 py-2 rounded disabled:bg-green-300"
            >
              Update with TaskService
            </button>
            
            <button
              onClick={() => updateTask('client')}
              disabled={loading}
              className="bg-purple-500 text-white px-4 py-2 rounded disabled:bg-purple-300"
            >
              Update with ApiClient
            </button>
            
            <button
              onClick={() => updateTask('direct-put')}
              disabled={loading}
              className="bg-orange-500 text-white px-4 py-2 rounded disabled:bg-orange-300"
            >
              Direct PUT
            </button>
            
            <button
              onClick={() => updateTask('direct-post')}
              disabled={loading}
              className="bg-indigo-500 text-white px-4 py-2 rounded disabled:bg-indigo-300"
            >
              Direct POST with Override
            </button>
            
            <button
              onClick={() => updateTask('form-data')}
              disabled={loading}
              className="bg-pink-500 text-white px-4 py-2 rounded disabled:bg-pink-300"
            >
              FormData PUT
            </button>
          </div>
        </div>
      )}

      {/* Results */}
      {loading && (
        <div className="bg-blue-50 p-4 rounded mb-4">
          <div className="animate-spin h-5 w-5 mr-3 border-t-2 border-blue-500 rounded-full inline-block"></div>
          Loading...
        </div>
      )}
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <h3 className="font-bold">Error:</h3>
          <pre className="whitespace-pre-wrap">{error}</pre>
        </div>
      )}
      
      {result && (
        <div className="bg-green-100 p-4 rounded mb-4">
          <h3 className="font-bold mb-2">Result:</h3>
          <pre className="bg-white p-2 rounded overflow-auto max-h-96">{result}</pre>
        </div>
      )}
    </div>
  );
} 