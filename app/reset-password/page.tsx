'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { isValidPassword, doPasswordsMatch } from '@/lib/validation';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [resetToken, setResetToken] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const tokenFromUrl = searchParams.get('token');
    if (tokenFromUrl) {
      setResetToken(tokenFromUrl);
    } else {
      setErrorMessage('Invalid reset link. Please request a new password reset link.');
    }
  }, [searchParams]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    const formData = new FormData(event.currentTarget);
    const newPassword = formData.get('password') as string;
    const passwordConfirmation = formData.get('confirmPassword') as string;

    // Validate password length
    if (!isValidPassword(newPassword)) {
      setErrorMessage('Password must be at least 6 characters long');
      return;
    }

    // Check if passwords match
    if (!doPasswordsMatch(newPassword, passwordConfirmation)) {
      setErrorMessage('Passwords do not match. Please make sure both passwords are the same.');
      return;
    }

    // Check if token exists
    if (!resetToken) {
      setErrorMessage('Invalid reset token. Please request a new password reset link.');
      return;
    }

    setIsLoading(true);

    try {
      await api.resetPassword({ 
        token: resetToken, 
        new_password: newPassword.trim() 
      });
      
      setSuccessMessage('✓ Password reset successfully! Redirecting to login page...');
      
      // Redirect after 2 seconds
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (error) {
      // Show clear error message to user
      if (error instanceof Error) {
        if (error.message.includes('expired') || error.message.includes('invalid')) {
          setErrorMessage('This reset link has expired or is invalid. Please request a new password reset link.');
        } else {
          setErrorMessage(error.message);
        }
      } else {
        setErrorMessage('Unable to reset password. Please check your internet connection and try again.');
      }
      setIsLoading(false);
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1 className="auth-title">Reset Password</h1>
          <p className="auth-subtitle">Enter your new password</p>
        </div>

        {successMessage && (
          <div className="success-message">
            {successMessage}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="password" className="form-label">
              New Password
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
              Confirm New Password
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

          {errorMessage && (
            <div className="error-message">
              ⚠️ {errorMessage}
            </div>
          )}

          <button type="submit" className="btn-primary" disabled={isLoading}>
            {isLoading ? 'Resetting password...' : 'Reset Password'}
          </button>
        </form>

        <div className="auth-links">
          <Link href="/login" className="auth-link">
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <h1 className="auth-title">Loading...</h1>
          </div>
        </div>
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}
