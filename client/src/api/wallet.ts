import api from './api';

// Description: Get wallet balance and transaction history
// Endpoint: GET /api/wallet
// Response: { balance: number, transactions: Array<{ _id: string, type: string, amount: number, date: string, status: string }> }
export const getWalletData = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        balance: 2500.50,
        transactions: [
          { _id: '1', type: 'withdrawal', amount: 500, date: '2024-03-20', status: 'completed' },
          { _id: '2', type: 'earning', amount: 150, date: '2024-03-19', status: 'completed' },
          { _id: '3', type: 'withdrawal', amount: 1000, date: '2024-03-15', status: 'processing' },
          { _id: '4', type: 'earning', amount: 300, date: '2024-03-14', status: 'completed' },
        ]
      });
    }, 500);
  });
};

// Description: Request a withdrawal
// Endpoint: POST /api/wallet/withdraw
// Request: { amount: number, accountDetails: { bank: string, accountNumber: string } }
// Response: { success: boolean, transactionId: string }
export const requestWithdrawal = (data: { amount: number, accountDetails: { bank: string, accountNumber: string } }) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        transactionId: Math.random().toString(36).substring(7)
      });
    }, 500);
  });
};