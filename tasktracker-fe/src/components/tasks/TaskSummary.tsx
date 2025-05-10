import { Task } from '@/lib/types/task';

interface TaskSummaryProps {
  tasks: Task[];
}

export function TaskSummary({ tasks }: TaskSummaryProps) {
  const todoCount = tasks.filter(task => task.status === 'todo').length;
  const inProgressCount = tasks.filter(task => task.status === 'in-progress').length;
  const doneCount = tasks.filter(task => task.status === 'done').length;
  
  const highPriorityCount = tasks.filter(task => task.priority === 'high').length;
  const mediumPriorityCount = tasks.filter(task => task.priority === 'medium').length;
  const lowPriorityCount = tasks.filter(task => task.priority === 'low').length;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const overdueCount = tasks.filter(task => {
    if (task.status === 'done' || !task.dueDate) return false;
    const dueDate = new Date(task.dueDate);
    return dueDate < today;
  }).length;

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
      <h2 className="text-xl font-semibold mb-4">Task Summary</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-medium mb-2">Status</h3>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">To Do</span>
              <div className="flex items-center">
                <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden mr-2">
                  <div 
                    className="h-full bg-gray-500" 
                    style={{ width: `${tasks.length ? (todoCount / tasks.length) * 100 : 0}%` }}
                  ></div>
                </div>
                <span className="text-gray-800 font-medium">{todoCount}</span>
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-gray-600">In Progress</span>
              <div className="flex items-center">
                <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden mr-2">
                  <div 
                    className="h-full bg-blue-500" 
                    style={{ width: `${tasks.length ? (inProgressCount / tasks.length) * 100 : 0}%` }}
                  ></div>
                </div>
                <span className="text-gray-800 font-medium">{inProgressCount}</span>
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Done</span>
              <div className="flex items-center">
                <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden mr-2">
                  <div 
                    className="h-full bg-green-500" 
                    style={{ width: `${tasks.length ? (doneCount / tasks.length) * 100 : 0}%` }}
                  ></div>
                </div>
                <span className="text-gray-800 font-medium">{doneCount}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div>
          <h3 className="text-lg font-medium mb-2">Priority</h3>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">High</span>
              <div className="flex items-center">
                <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden mr-2">
                  <div 
                    className="h-full bg-red-500" 
                    style={{ width: `${tasks.length ? (highPriorityCount / tasks.length) * 100 : 0}%` }}
                  ></div>
                </div>
                <span className="text-gray-800 font-medium">{highPriorityCount}</span>
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Medium</span>
              <div className="flex items-center">
                <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden mr-2">
                  <div 
                    className="h-full bg-yellow-500" 
                    style={{ width: `${tasks.length ? (mediumPriorityCount / tasks.length) * 100 : 0}%` }}
                  ></div>
                </div>
                <span className="text-gray-800 font-medium">{mediumPriorityCount}</span>
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Low</span>
              <div className="flex items-center">
                <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden mr-2">
                  <div 
                    className="h-full bg-green-500" 
                    style={{ width: `${tasks.length ? (lowPriorityCount / tasks.length) * 100 : 0}%` }}
                  ></div>
                </div>
                <span className="text-gray-800 font-medium">{lowPriorityCount}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {overdueCount > 0 && (
        <div className="mt-4 pt-4 border-t">
          <div className="flex items-center text-red-600">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
            </svg>
            <span className="font-medium">{overdueCount} overdue {overdueCount === 1 ? 'task' : 'tasks'}</span>
          </div>
        </div>
      )}
    </div>
  );
} 