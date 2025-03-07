import api from './api';

// Description: Get email validation status
// Endpoint: GET /api/settings/email-status
// Response: { email: string, isValidated: boolean }
export const getEmailStatus = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        email: "user@example.com",
        isValidated: false
      });
    }, 500);
  });
};

// Description: Update user settings
// Endpoint: PUT /api/settings
// Request: { field: string, value: any }
// Response: { success: boolean, message: string }
export const updateUserSettings = (data: { field: string, value: any }) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        message: "Settings updated successfully"
      });
    }, 500);
  });
};

// Description: Resend validation email
// Endpoint: POST /api/settings/resend-validation
// Response: { success: boolean, message: string }
export const resendValidationEmail = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        message: "Validation email sent successfully"
      });
    }, 500);
  });
};