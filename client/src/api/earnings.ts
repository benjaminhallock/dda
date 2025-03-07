import api from './api';

// Description: Get earnings statistics
// Endpoint: GET /api/earnings/stats
// Response: { totalEarnings: number, weeklyEarnings: number[], monthlyAverage: number }
export const getEarningsStats = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        totalEarnings: 2500,
        weeklyEarnings: [350, 400, 300, 450, 500, 600, 550],
        monthlyAverage: 2200
      });
    }, 500);
  });
};