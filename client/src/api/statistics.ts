import api from './api';

// Description: Get local area statistics
// Endpoint: GET /api/statistics/local
// Response: { employmentRate: number, averageIncome: number, userIncome: number, localWorkers: number, totalWorkers: number }
export const getLocalStatistics = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        employmentRate: 80,
        averageIncome: 3500,
        userIncome: 2800,
        localWorkers: 4,
        totalWorkers: 5
      });
    }, 500);
  });
};

// Description: Get onboarding tasks progress
// Endpoint: GET /api/onboarding/progress
// Response: { completed: number, total: number, tasks: Array<{ _id: string, title: string, completed: boolean }> }
export const getOnboardingProgress = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        completed: 1,
        total: 5,
        tasks: [
          { _id: '1', title: 'Complete profile', completed: true },
          { _id: '2', title: 'Verify email', completed: false },
          { _id: '3', title: 'Add payment method', completed: false },
          { _id: '4', title: 'Complete first task', completed: false },
          { _id: '5', title: 'Join community', completed: false },
        ]
      });
    }, 500);
  });
};