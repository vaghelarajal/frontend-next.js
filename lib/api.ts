/* eslint-disable @typescript-eslint/no-explicit-any */
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
  confirm_password: string;
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
    console.error('API Error:', response.status, response.statusText);
    console.error('Response URL:', response.url);
    
    // Check if response is JSON
    if (contentType && contentType.includes('application/json')) {
      const error = await response.json();
      console.error('Error details:', error);
      
      // Extract the most specific error message
      let errorMessage = 'Request failed';
      if (error.detail) {
        if (Array.isArray(error.detail)) {
          // FastAPI validation errors
          errorMessage = error.detail.map((err: any) => `${err.loc?.join('.')}: ${err.msg}`).join(', ');
        } else {
          errorMessage = error.detail;
        }
      } else if (error.message) {
        errorMessage = error.message;
      } else if (error.error) {
        errorMessage = error.error;
      }
      
      console.error('Final error message:', errorMessage);
      throw new Error(errorMessage);
    } else {
      // If not JSON, it might be HTML error page
      const errorText = await response.text();
      console.error('Non-JSON error response:', errorText);
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
    const data = JSON.parse(text);
    console.log('API Response:', data);
    return data;
  } catch (error) {
    console.error('Failed to parse response:', error);
    // If parsing fails, return success for 2xx responses
    if (response.status >= 200 && response.status < 300) {
      return { success: true };
    }
    throw new Error('Invalid response from server');
  }
}

export const api = {
  async login(data: LoginData) {
    console.log('=== LOGIN API CALL ===');
    console.log('API_BASE_URL:', API_BASE_URL);
    console.log('Login URL:', `${API_BASE_URL}/auth/login`);
    console.log('Login data:', { email: data.email, password: '[HIDDEN]' });
    
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      console.log('Login response status:', response.status);
      console.log('Login response ok:', response.ok);
      
      const result = await handleResponse(response);
      console.log('Login successful, result keys:', Object.keys(result));
      console.log('=== END LOGIN ===');
      
      return result;
    } catch (error) {
      console.error('=== LOGIN ERROR ===');
      console.error('Login error:', error);
      console.error('=== END LOGIN ERROR ===');
      throw error;
    }
  },

  async signup(data: SignupData) {
    console.log('=== SIGNUP API CALL ===');
    console.log('API_BASE_URL:', API_BASE_URL);
    console.log('Signup URL:', `${API_BASE_URL}/auth/signup`);
    console.log('Signup data:', { 
      username: data.username, 
      email: data.email, 
      password: '[HIDDEN]' 
    });
    
    try {
      const response = await fetch(`${API_BASE_URL}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      console.log('Signup response status:', response.status);
      console.log('Signup response ok:', response.ok);
      
      const result = await handleResponse(response);
      console.log('Signup successful, result:', result);
      console.log('=== END SIGNUP ===');
      
      return result;
    } catch (error) {
      console.error('=== SIGNUP ERROR ===');
      console.error('Signup error:', error);
      console.error('=== END SIGNUP ERROR ===');
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
    // Backend only accepts: address, gender, age
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
        throw new Error('Cannot connect to server. Please make sure the backend is running.');
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
