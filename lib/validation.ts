// Simple validation functions

export function isValidEmail(email: string): boolean {
  // Check if email has @ symbol and a domain
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailPattern.test(email);
}

export function isValidPassword(password: string): boolean {
  // Password must be at least 6 characters
  return password.length >= 6;
}

export function doPasswordsMatch(password: string, confirmPassword: string): boolean {
  return password === confirmPassword;
}
