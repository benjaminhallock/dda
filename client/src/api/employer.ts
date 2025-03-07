import api from './api';

// Description: Get employer dashboard data
// Endpoint: GET /api/employer/dashboard
// Response: { activeWorkers: number, pendingPayments: { btc: string, usd: number }, walletBalance: { btc: string, usd: number } }
export const getDashboardData = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        activeWorkers: 12,
        pendingPayments: { btc: "0.75", usd: 32150 },
        walletBalance: { btc: "1.25", usd: 53583 }
      });
    }, 500);
  });
};

// Description: Get list of available workers
// Endpoint: GET /api/employer/workers
// Response: { workers: Array<{ _id: string, name: string, skills: string[], rating: number, hourlyRate: { btc: string, usd: number }, status: 'online' | 'offline' }> }
export const getWorkers = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        workers: [
          { _id: '1', name: 'John Doe', skills: ['Data Analysis', 'Python'], rating: 4.8, hourlyRate: { btc: "0.001", usd: 42.50 }, status: 'online' },
          { _id: '2', name: 'Jane Smith', skills: ['Machine Learning', 'JavaScript'], rating: 4.9, hourlyRate: { btc: "0.0012", usd: 51.00 }, status: 'offline' },
          { _id: '3', name: 'Mike Johnson', skills: ['Data Visualization', 'R'], rating: 4.7, hourlyRate: { btc: "0.0009", usd: 38.25 }, status: 'online' }
        ]
      });
    }, 500);
  });
};

// Description: Hire a worker
// Endpoint: POST /api/employer/hire
// Request: { workerId: string, taskDetails: string, hours: number, paymentAmount: { btc: string, usd: number } }
// Response: { success: boolean, contractId: string }
export const hireWorker = (data: { workerId: string, taskDetails: string, hours: number, paymentAmount: { btc: string, usd: number } }) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        contractId: Math.random().toString(36).substring(7)
      });
    }, 500);
  });
};

// Description: Get timecards
// Endpoint: GET /api/employer/timecards
// Response: { timecards: Array<{ _id: string, workerId: string, workerName: string, date: string, hours: number, status: string, amount: { btc: string, usd: number } }> }
export const getTimecards = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        timecards: [
          { _id: '1', workerId: '1', workerName: 'John Doe', date: '2024-03-21', hours: 8, status: 'pending', amount: { btc: "0.008", usd: 340 } },
          { _id: '2', workerId: '2', workerName: 'Jane Smith', date: '2024-03-21', hours: 6, status: 'approved', amount: { btc: "0.007", usd: 306 } }
        ]
      });
    }, 500);
  });
};

// Description: Get payment history
// Endpoint: GET /api/employer/payments
// Response: { transactions: Array<{ _id: string, date: string, recipient: string, amount: { btc: string, usd: number }, status: string, txHash: string }> }
export const getPaymentHistory = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        transactions: [
          { _id: '1', date: '2024-03-21', recipient: 'John Doe', amount: { btc: "0.008", usd: 340 }, status: 'completed', txHash: '0x123...' },
          { _id: '2', date: '2024-03-20', recipient: 'Jane Smith', amount: { btc: "0.007", usd: 306 }, status: 'pending', txHash: '0x456...' }
        ]
      });
    }, 500);
  });
};