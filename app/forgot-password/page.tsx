'use client';

import { useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { isValidEmail } from '@/lib/validation';

export default function ForgotPasswordPage() {
  const [errorMessage, setErrorMessage] = useState('');     //store errors to show the users
  const [successMessage, setSuccessMessage] = useState('');  //stores sucess text when reset link is sent
  const [isLoading, setIsLoading] = useState(false);         //disable the button
  const [emailValue, setEmailValue] = useState('');          //stores what user types in email field

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    const formData = new FormData(event.currentTarget);
    const userEmail = formData.get('email') as string;

    // Validate email format
    if (!userEmail || !isValidEmail(userEmail)) {
      setErrorMessage('Please enter a valid email address (example: user@gmail.com)');
      return;
    }

    setIsLoading(true);  //disable button, change to sending reset link...

    try {
      await api.forgotPassword({ email: userEmail.trim() });
      
      setSuccessMessage(
        '✓ Password reset link sent successfully! Please check your email inbox.'
      );
      
      // Clear the email input
      setEmailValue('');
    } catch (error) {
      // Show clear error message to user
      if (error instanceof Error) {
        if (error.message.includes('not found')) {
          setErrorMessage('No account found with this email address. Please check your email or sign up for a new account.');
        } else if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
          setErrorMessage('Cannot connect to server.');
        } else {
          setErrorMessage(error.message);
        }
      } else {
        setErrorMessage('Unable to send reset link. Please check your internet connection and try again.');
      }
    } finally {
      setIsLoading(false);  //re-enables button and text to send reset link
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1 className="auth-title">Forgot Password?</h1>
          <p className="auth-subtitle">
            Enter your email to receive a reset link
          </p>
        </div>

        {successMessage && (
          <div className="success-message">
            {successMessage}
          </div>
        )}

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
              value={emailValue}
              onChange={(e) => setEmailValue(e.target.value)}
            />
          </div>

          {errorMessage && (
            <div className="error-message">
              ⚠️ {errorMessage}
            </div>
          )}

          <button type="submit" className="btn-primary" disabled={isLoading}>
            {isLoading ? 'Sending reset link...' : 'Send Reset Link'}
          </button>
        </form>

        <div className="auth-links">
          Remember your password?{' '}
          <Link href="/login" className="auth-link">
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
