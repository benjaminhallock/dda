import api from './api';

// Description: Get data monetization stats
// Endpoint: GET /api/data/monetization/stats
// Response: { totalValue: number, categories: Array<{ name: string, value: number, sharePercentage: number }>, history: Array<{ date: string, value: number }> }
export const getDataMonetizationStats = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        totalValue: 2500,
        categories: [
          { name: 'Behavioral Data', value: 1200, sharePercentage: 48 },
          { name: 'Work Patterns', value: 800, sharePercentage: 32 },
          { name: 'Professional Skills', value: 500, sharePercentage: 20 }
        ],
        history: [
          { date: '2024-03-15', value: 2200 },
          { date: '2024-03-16', value: 2300 },
          { date: '2024-03-17', value: 2400 },
          { date: '2024-03-18', value: 2500 }
        ]
      });
    }, 500);
  });
};

// Description: Update data sharing preferences
// Endpoint: POST /api/data/monetization/preferences
// Request: { categoryId: string, enabled: boolean }
// Response: { success: boolean, updatedValue: number }
export const updateDataSharingPreferences = (data: { categoryId: string, enabled: boolean }) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        updatedValue: 2300
      });
    }, 500);
  });
};