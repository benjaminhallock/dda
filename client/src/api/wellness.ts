import api from './api';

// Description: Get wellness metrics
// Endpoint: GET /api/wellness/metrics
// Response: { stressScore: number, wellnessScore: number, patterns: Array<{ date: string, stress: number, wellness: number }>, recommendations: Array<{ _id: string, type: string, title: string, description: string }> }
export const getWellnessMetrics = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        stressScore: 65,
        wellnessScore: 78,
        patterns: [
          { date: '2024-03-15', stress: 70, wellness: 75 },
          { date: '2024-03-16', stress: 65, wellness: 78 },
          { date: '2024-03-17', stress: 60, wellness: 82 },
          { date: '2024-03-18', stress: 65, wellness: 78 }
        ],
        recommendations: [
          { _id: '1', type: 'break', title: 'Take a Break', description: 'High stress patterns detected. Consider a 15-minute break.' },
          { _id: '2', type: 'therapy', title: 'Therapy Session', description: 'Regular therapy sessions could help manage stress.' }
        ]
      });
    }, 500);
  });
};

// Description: Get available therapists
// Endpoint: GET /api/wellness/therapists
// Response: { therapists: Array<{ _id: string, name: string, specialization: string, availability: Array<{ date: string, slots: Array<string> }>, rating: number }> }
export const getTherapists = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        therapists: [
          {
            _id: '1',
            name: 'Dr. Sarah Johnson',
            specialization: 'Work Stress Management',
            availability: [
              { date: '2024-03-25', slots: ['10:00', '14:00', '16:00'] },
              { date: '2024-03-26', slots: ['11:00', '15:00'] }
            ],
            rating: 4.8
          },
          {
            _id: '2',
            name: 'Dr. Michael Chen',
            specialization: 'Burnout Prevention',
            availability: [
              { date: '2024-03-25', slots: ['09:00', '13:00'] },
              { date: '2024-03-26', slots: ['10:00', '14:00', '16:00'] }
            ],
            rating: 4.9
          }
        ]
      });
    }, 500);
  });
};

// Description: Book therapy session
// Endpoint: POST /api/wellness/book-session
// Request: { therapistId: string, date: string, slot: string }
// Response: { success: boolean, sessionId: string, confirmationDetails: { therapist: string, date: string, time: string } }
export const bookTherapySession = (data: { therapistId: string, date: string, slot: string }) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        sessionId: '12345',
        confirmationDetails: {
          therapist: 'Dr. Sarah Johnson',
          date: '2024-03-25',
          time: '10:00'
        }
      });
    }, 500);
  });
};