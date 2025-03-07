import api from './api';

// Description: Get user inbox messages
// Endpoint: GET /api/inbox
// Response: { messages: Array<{ _id: string, title: string, content: string, date: string, read: boolean }> }
export const getInboxMessages = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        messages: [
          { _id: '1', title: 'Welcome to DataDrivesAurora', content: 'Thank you for joining our platform...', date: '2024-03-21', read: false },
          { _id: '2', title: 'New Task Available', content: 'A new high-priority task has been...', date: '2024-03-20', read: false },
          { _id: '3', title: 'Earnings Update', content: 'Your earnings this week have exceeded...', date: '2024-03-19', read: true },
        ]
      });
    }, 500);
  });
};

// Description: Mark message as read
// Endpoint: PUT /api/inbox/:id/read
// Request: { messageId: string }
// Response: { success: boolean }
export const markMessageAsRead = (messageId: string) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ success: true });
    }, 500);
  });
};