// API configuration and helper functions
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export interface LoginData {
  email: string;
  password: string;
}

export interface SignupData {
  username: string;
  email: string;
  password: string;
}

export interface ForgotPasswordData {
  email: string;
}

export interface ResetPasswordData {
  token: string;
  new_password: string;
}

// Helper function to handle API errors
async function handleResponse(response: Response) {
  const contentType = response.headers.get('content-type');
  
  if (!response.ok) {
    // Check if response is JSON
    if (contentType && contentType.includes('application/json')) {
      const error = await response.json();
      throw new Error(error.detail || error.message || 'Request failed');
    } else {
      // If not JSON, it might be HTML error page
      throw new Error(`Server error: ${response.status} ${response.statusText}`);
    }
  }
  
  // Check if response is JSON before parsing
  if (contentType && contentType.includes('application/json')) {
    return response.json();
  } else {
    throw new Error('Server returned non-JSON response');
  }
}

export const api = {
  async login(data: LoginData) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return await handleResponse(response);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  async signup(data: SignupData) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return await handleResponse(response);
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  },

  async forgotPassword(data: ForgotPasswordData) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return await handleResponse(response);
    } catch (error) {
      console.error('Forgot password error:', error);
      throw error;
    }
  },

  async resetPassword(data: ResetPasswordData) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return await handleResponse(response);
    } catch (error) {
      console.error('Reset password error:', error);
      throw error;
    }
  },

  async getProfile(token: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });
      return await handleResponse(response);
    } catch (error) {
      console.error('Get profile error:', error);
      throw error;
    }
  },
};
