'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { setToken } from '@/lib/auth';
import { isValidEmail } from '@/lib/validation';

export default function LoginPage() {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage('');
    
    const formData = new FormData(event.currentTarget);
    const userEmail = formData.get('email') as string;
    const userPassword = formData.get('password') as string;

    // Validate email format
    if (!isValidEmail(userEmail)) {
      setErrorMessage('Please enter a valid email address (example: user@email.com)');
      return;
    }

    // Validate password is not empty
    if (!userPassword || userPassword.trim() === '') {
      setErrorMessage('Please enter your password');
      return;
    }

    setIsLoading(true);

    try {
      const response = await api.login({ 
        email: userEmail, 
        password: userPassword 
      });
      
      setToken(response.access_token || response.token);
      router.push('/profile');
    } catch (error) {
      // Show clear error message to user
      if (error instanceof Error) {
        if (error.message.includes('credentials')) {
          setErrorMessage('Incorrect email or password. Please try again.');
        } else if (error.message.includes('not found')) {
          setErrorMessage('No account found with this email. Please sign up first.');
        } else {
          setErrorMessage(error.message);
        }
      } else {
        setErrorMessage('Unable to login. Please check your internet connection and try again.');
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1 className="auth-title">Welcome Back</h1>
          <p className="auth-subtitle">Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit}>
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
              placeholder="Enter your password"
              autoComplete="current-password"
            />
          </div>

          <div className="forgot-password">
            <Link href="/forgot-password">Forgot password?</Link>
          </div>

          {errorMessage && (
            <div className="error-message">
              ⚠️ {errorMessage}
            </div>
          )}

          <button type="submit" className="btn-primary" disabled={isLoading}>
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="auth-links">
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="auth-link">
            Sign Up
          </Link>
        </div>
      </div>
    </div>
  );
}
