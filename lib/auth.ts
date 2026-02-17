// Enhanced authentication utilities
export const setToken = (token: string) => {
  if (typeof window !== 'undefined' && token) {
    localStorage.setItem('auth_token', token);
    console.log('Token stored successfully');
  }
};

export const getToken = (): string | null => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('auth_token');
    return token;
  }
  return null;
};

export const removeToken = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('auth_token');
    console.log('Token removed');
  }
};

export const isAuthenticated = (): boolean => {
  const token = getToken();
  return !!token && token.length > 0;
};

// Check if user should be redirected to login
export const requireAuth = (): boolean => {
  return !isAuthenticated();
};
