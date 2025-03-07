import api from './api';

// Description: Get expanded analytics data
// Endpoint: GET /api/analytics/expanded
// Response: { 
//   avgPayoutPerUser: number,
//   avgTimeToJob: number,
//   avgTasksPerWeek: number,
//   avgPayrate: number,
//   weeklyTrends: Array<{ week: string, tasks: number, earnings: number }>,
//   userComparison: { user: number, average: number }
// }
export const getExpandedAnalytics = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        avgPayoutPerUser: 450,
        avgTimeToJob: 2.5,
        avgTasksPerWeek: 12,
        avgPayrate: 35,
        weeklyTrends: [
          { week: '2024-W10', tasks: 10, earnings: 400 },
          { week: '2024-W11', tasks: 12, earnings: 480 },
          { week: '2024-W12', tasks: 15, earnings: 600 },
          { week: '2024-W13', tasks: 11, earnings: 440 }
        ],
        userComparison: { user: 42, average: 35 }
      });
    }, 500);
  });
};