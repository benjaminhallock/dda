import api from './api';

// Description: Get discussion forums
// Endpoint: GET /api/discussions/forums
// Response: { forums: Array<{ _id: string, name: string, description: string, topicCount: number, lastPost: { title: string, author: string, date: string } }> }
export const getForums = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        forums: [
          {
            _id: "1",
            name: "General Discussion",
            description: "General discussion about work and platform",
            topicCount: 156,
            lastPost: {
              title: "New Payment System Update",
              author: "John Doe",
              date: "2024-03-21"
            }
          },
          {
            _id: "2",
            name: "Task Help",
            description: "Get help with tasks and share tips",
            topicCount: 89,
            lastPost: {
              title: "Data Analysis Best Practices",
              author: "Jane Smith",
              date: "2024-03-20"
            }
          }
        ]
      });
    }, 500);
  });
};

// Description: Get forum topics
// Endpoint: GET /api/discussions/forums/:id/topics
// Response: { topics: Array<{ _id: string, title: string, author: string, replies: number, views: number, lastReply: { author: string, date: string } }> }
export const getForumTopics = (forumId: string) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        topics: [
          {
            _id: "1",
            title: "New Payment System Update",
            author: "John Doe",
            replies: 25,
            views: 342,
            lastReply: {
              author: "Jane Smith",
              date: "2024-03-21"
            }
          }
        ]
      });
    }, 500);
  });
};

// Description: Create new topic
// Endpoint: POST /api/discussions/forums/:id/topics
// Request: { title: string, content: string }
// Response: { success: boolean, topicId: string }
export const createTopic = (forumId: string, data: { title: string, content: string }) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        topicId: Math.random().toString(36).substring(7)
      });
    }, 500);
  });
};