'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { getToken, removeToken } from '@/lib/auth';

interface UserData {
  username?: string;
  email?: string;
  name?: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    async function loadUserProfile() {
      const authToken = getToken();
      
      // Check if user has authentication token
      if (!authToken) {
        router.push('/login');
        return;
      }

      try {
        const profileData = await api.getProfile(authToken);
        setUserData(profileData);
      } catch (error) {
        console.error('Failed to load profile:', error);
        
        // Show error message
        if (error instanceof Error) {
          if (error.message.includes('401') || error.message.includes('unauthorized')) {
            setErrorMessage('Your session has expired. Please login again.');
          } else {
            setErrorMessage('Unable to load your profile. Please try again.');
          }
        }
        
        // Remove invalid token and redirect to login
        removeToken();
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      } finally {
        setIsLoading(false);
      }
    }

    loadUserProfile();
  }, [router]);

  function handleLogout() {
    removeToken();
    router.push('/login');
  }

  if (isLoading) {
    return (
      <div className="profile-container">
        <div className="profile-header">
          <h1>Loading your profile...</h1>
        </div>
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="profile-container">
        <div className="profile-header">
          <h1>Error</h1>
          <p>{errorMessage}</p>
        </div>
      </div>
    );
  }

  const displayName = userData?.username || userData?.name || 'User';

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h1>Hello, {displayName}!</h1>
        <p>Welcome to your profile</p>
      </div>

      <div className="profile-content">
        <div className="profile-card">
          <h2>Profile Information</h2>
          
          <div className="profile-info-item">
            <p className="profile-info-label">Username</p>
            <p className="profile-info-value">{userData?.username || 'Not available'}</p>
          </div>

          <div className="profile-info-item">
            <p className="profile-info-label">Email</p>
            <p className="profile-info-value">{userData?.email || 'Not available'}</p>
          </div>

          <button onClick={handleLogout} className="logout-btn">
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
