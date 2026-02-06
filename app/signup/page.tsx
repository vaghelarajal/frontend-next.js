'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { isValidEmail, isValidPassword, doPasswordsMatch } from '@/lib/validation';

export default function SignupPage() {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    
    const formData = new FormData(event.currentTarget);
    const userName = formData.get('username') as string;
    const userEmail = formData.get('email') as string;
    const userPassword = formData.get('password') as string;
    const passwordConfirmation = formData.get('confirmPassword') as string;

    // Validate username
    if (!userName || userName.trim().length < 3) {
      setErrorMessage('Username must be at least 3 characters long');
      return;
    }

    // Validate email format
    if (!isValidEmail(userEmail)) {
      setErrorMessage('Please enter a valid email address (example: user@email.com)');
      return;
    }

    // Validate password length
    if (!isValidPassword(userPassword)) {
      setErrorMessage('Password must be at least 6 characters long');
      return;
    }

    // Check if passwords match
    if (!doPasswordsMatch(userPassword, passwordConfirmation)) {
      setErrorMessage('Passwords do not match. Please make sure both passwords are the same.');
      return;
    }

    setIsLoading(true);

    try {
      await api.signup({ 
        username: userName, 
        email: userEmail, 
        password: userPassword 
      });
      
      setSuccessMessage('✓ Account created successfully! Redirecting to login...');
      
      // Redirect after 2 seconds
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (error) {
      // Show clear error message to user
      if (error instanceof Error) {
        if (error.message.includes('already exists') || error.message.includes('already registered')) {
          setErrorMessage('This email is already registered. Please login or use a different email.');
        } else if (error.message.includes('username')) {
          setErrorMessage('This username is already taken. Please choose a different username.');
        } else {
          setErrorMessage(error.message);
        }
      } else {
        setErrorMessage('Unable to create account. Please check your internet connection and try again.');
      }
      setIsLoading(false);
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1 className="auth-title">Create Account</h1>
          <p className="auth-subtitle">Join us today</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username" className="form-label">
              Username
            </label>
            <input
              id="username"
              name="username"
              type="text"
              className="form-input"
              placeholder="johndoe"
              autoComplete="username"
            />
          </div>

          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Email Address
            </label>
            <input
              id="email"
              name="email"
              type="text"
              className="form-input"
              placeholder="user@example.com"
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              className="form-input"
              placeholder="At least 6 characters"
              autoComplete="new-password"
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword" className="form-label">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              className="form-input"
              placeholder="Re-enter your password"
              autoComplete="new-password"
            />
          </div>

          {successMessage && (
            <div className="success-message">
              {successMessage}
            </div>
          )}

          {errorMessage && (
            <div className="error-message">
              ⚠️ {errorMessage}
            </div>
          )}

          <button type="submit" className="btn-primary" disabled={isLoading}>
            {isLoading ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>

        <div className="auth-links">
          Already have an account?{' '}
          <Link href="/login" className="auth-link">
            Login
          </Link>
        </div>
      </div>
    </div>
  );
}
