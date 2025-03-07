import api from './api';

// Description: Get available tasks in marketplace
// Endpoint: GET /api/marketplace/tasks
// Response: { tasks: Array<{ _id: string, title: string, description: string, budget: { min: number, max: number }, skills: string[], deadline: string, bids: number }> }
export const getMarketplaceTasks = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        tasks: [
          {
            _id: "1",
            title: "Data Analysis Project",
            description: "Analyze customer behavior data and create insights report",
            budget: { min: 500, max: 1000 },
            skills: ["Data Analysis", "Python", "Statistics"],
            deadline: "2024-04-15",
            bids: 5
          },
          {
            _id: "2",
            title: "ML Model Training",
            description: "Train and optimize machine learning model for prediction",
            budget: { min: 1000, max: 2000 },
            skills: ["Machine Learning", "TensorFlow", "Python"],
            deadline: "2024-04-10",
            bids: 3
          }
        ]
      });
    }, 500);
  });
};

// Description: Submit bid for task
// Endpoint: POST /api/marketplace/tasks/:id/bid
// Request: { amount: number, proposal: string, timeframe: number }
// Response: { success: boolean, message: string }
export const submitBid = (taskId: string, data: { amount: number, proposal: string, timeframe: number }) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        message: "Bid submitted successfully"
      });
    }, 500);
  });
};

// Description: Get available jobs
// Endpoint: GET /api/marketplace/jobs
// Response: { jobs: Array<{ _id: string, title: string, description: string, company: string, location: string, salary: number, skills: string[], createdAt: string }> }
export const getJobs = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        jobs: [
          {
            _id: "1",
            title: "Software Engineer",
            description: "Develop and maintain web applications",
            company: "Tech Corp",
            location: "Remote",
            salary: 120000,
            skills: ["JavaScript", "React", "Node.js"],
            createdAt: "2024-03-15"
          },
          {
            _id: "2",
            title: "Data Scientist",
            description: "Analyze data and build predictive models",
            company: "Data Inc.",
            location: "New York, NY",
            salary: 130000,
            skills: ["Python", "Machine Learning", "Statistics"],
            createdAt: "2024-03-16"
          }
        ]
      });
    }, 500);
  });
};

// Description: Post a new job
// Endpoint: POST /api/marketplace/jobs
// Request: { title: string, description: string, company: string, location: string, salary: number, skills: string[] }
// Response: { success: boolean, jobId: string }
export const postJob = (data) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        jobId: Math.random().toString(36).substring(7)
      });
    }, 500);
  });
};