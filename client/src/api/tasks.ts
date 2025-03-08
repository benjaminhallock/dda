import api from './api';

// Description: Get list of tasks for current user
// Endpoint: GET /api/tasks
// Response: { tasks: Array<{ _id: string, title: string, status: string, dueDate: string, earnings: number }> }
export const getTasks = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        tasks: [
          { _id: '1', title: 'Complete Data Analysis', status: 'in_progress', dueDate: '2024-03-25', earnings: 150 },
          { _id: '2', title: 'Review Documentation', status: 'pending', dueDate: '2024-03-26', earnings: 100 },
          { _id: '3', title: 'Quality Assurance', status: 'completed', dueDate: '2024-03-24', earnings: 200 },
        ]
      });
    }, 500);
  });
};

// Description: Submit completed task
// Endpoint: POST /api/tasks/:id/complete
// Response: { success: boolean, message: string }
export const completeTask = (taskId: string) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        message: "Task completed successfully"
      });
    }, 500);
  });
};