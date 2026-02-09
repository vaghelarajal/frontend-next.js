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

export interface UpdateProfileData {
  username: string;
  email: string;
  age?: number;
  gender?: string;
  address?: string;
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
  
  // Try to parse as JSON, but handle cases where response might be empty or non-JSON
  try {
    const text = await response.text();
    if (!text || text.trim() === '') {
      // Empty response is considered success
      return { success: true };
    }
    return JSON.parse(text);
  } catch (error) {
    // If parsing fails, return success for 2xx responses
    if (response.status >= 200 && response.status < 300) {
      return { success: true };
    }
    throw new Error('Invalid response from server');
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
      throw error;
    }
  },

  async updateProfile(token: string, data: UpdateProfileData) {
    // Backend only accepts: address, gender, age (NOT username/email)
    const cleanData: any = {};
    if (data.age !== undefined && data.age !== null) cleanData.age = data.age;
    if (data.gender !== undefined && data.gender !== '') cleanData.gender = data.gender;
    if (data.address !== undefined && data.address !== '') cleanData.address = data.address;

    console.log('=== UPDATE PROFILE DEBUG ===');
    console.log('API_BASE_URL:', API_BASE_URL);
    console.log('Full URL:', `${API_BASE_URL}/auth/profile`);
    console.log('Token:', token ? `${token.substring(0, 20)}...` : 'No token');
    console.log('Clean data:', cleanData);
    console.log('Clean data JSON:', JSON.stringify(cleanData));

    try {
      const response = await fetch(`${API_BASE_URL}/auth/profile`, {
        method: 'PATCH',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(cleanData),
      });

      console.log('Response received!');
      console.log('Response status:', response.status);
      console.log('Response statusText:', response.statusText);
      console.log('Response ok:', response.ok);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));
      
      const result = await handleResponse(response);
      console.log('Update successful, result:', result);
      console.log('=== END DEBUG ===');
      
      return result;
    } catch (error) {
      console.error('=== UPDATE PROFILE ERROR ===');
      console.error('Error:', error);
      console.error('Error message:', error instanceof Error ? error.message : 'Unknown error');
      console.error('Error type:', error instanceof TypeError ? 'Network Error' : 'Other Error');
      console.error('Error stack:', error instanceof Error ? error.stack : 'No stack');
      console.error('=== END ERROR ===');
      
      if (error instanceof TypeError) {
        throw new Error('Cannot connect to server. Please make sure the backend is running on port 8000.');
      }
      throw error;
    }
  },

  async getProducts() {
    try {
      const response = await fetch(`${API_BASE_URL}/products/`);
      return await handleResponse(response);
    } catch (error) {
      throw error;
    }
  },

  async getProduct(id: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/products/${id}`);
      return await handleResponse(response);
    } catch (error) {
      throw error;
    }
  },
};
