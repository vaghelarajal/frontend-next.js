// Enhanced validation functions

export function isValidEmail(email: string): boolean {
  // Check if email is provided and not empty
  if (!email || email.trim() === '') {
    return false;
  }
  
  // email validation
  const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailPattern.test(email.trim());
}

export function isValidPassword(password: string): boolean {
  // Password must be at least 6 characters and not empty
  return !!password && password.length >= 6;
}

export function doPasswordsMatch(password: string, confirmPassword: string): boolean {
  return password === confirmPassword && password.length > 0;
}

export function isValidUsername(username: string): boolean {
  // Username must be at least 3 characters, no spaces, alphanumeric + underscore
  if (!username || username.trim().length < 3) {
    return false;
  }
  const usernamePattern = /^[a-zA-Z0-9_]{3,20}$/;
  return usernamePattern.test(username.trim());
}
