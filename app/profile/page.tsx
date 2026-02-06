'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { getToken, removeToken } from '@/lib/auth';

interface UserProfile {
  username?: string;
  email?: string;
  name?: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      const token = getToken();
      
      if (!token) {
        router.push('/login');
        return;
      }

      try {
        const profile = await api.getProfile(token);
        setUser(profile);
      } catch (error) {
        console.error('Failed to fetch profile:', error);
        removeToken();
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [router]);

  const handleLogout = () => {
    removeToken();
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="profile-container">
        <div className="profile-header">
          <h1 style={{ fontSize: '32px', fontWeight: '700' }}>Loading...</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h1>Hello, {user?.username || user?.name || 'User'}!</h1>
        <p>Welcome to your profile</p>
      </div>

      <div className="profile-content">
        <div className="profile-card">
          <h2>Profile Information</h2>
          
          <div className="profile-info-item">
            <p className="profile-info-label">Username</p>
            <p className="profile-info-value">{user?.username || 'User'}</p>
          </div>

          <div className="profile-info-item">
            <p className="profile-info-label">Email</p>
            <p className="profile-info-value">{user?.email || 'User'}</p>
          </div>

          <button onClick={handleLogout} className="logout-btn">
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
