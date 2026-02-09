/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { api } from '@/lib/api';
import { getToken, removeToken } from '@/lib/auth';

interface UserData {
  username?: string;
  email?: string;
  name?: string;
  age?: number;
  gender?: string;
  address?: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    async function loadUserProfile() {
      const authToken = getToken();
      
      if (!authToken) {
        router.push('/login');
        return;
      }

      try {
        const profileData = await api.getProfile(authToken);
        setUserData(profileData);
      } catch (error) {
        console.error('Failed to load profile:', error);
        
        if (error instanceof Error) {
          if (error.message.includes('401') || error.message.includes('unauthorized')) {
            setErrorMessage('Your session has expired. Please login again.');
          } else {
            setErrorMessage('Unable to load your profile. Please try again.');
          }
        }
        
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

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    
    const formData = new FormData(event.currentTarget);
    const updatedAge = formData.get('age') as string;
    const updatedGender = formData.get('gender') as string;
    const updatedAddress = formData.get('address') as string;

    // Validate age if provided (backend accepts 1-120)
    if (updatedAge && (parseInt(updatedAge) < 1 || parseInt(updatedAge) > 120)) {
      setErrorMessage('Please enter a valid age between 1 and 120');
      return;
    }

    // Validate address if provided (min 5 chars)
    if (updatedAddress && updatedAddress.trim().length > 0 && updatedAddress.trim().length < 5) {
      setErrorMessage('Address must be at least 5 characters long');
      return;
    }

    setIsSaving(true);

    try {
      const authToken = getToken();
      console.log('Auth token exists:', !!authToken);
      
      if (!authToken) {
        setErrorMessage('Session expired. Please login again.');
        setTimeout(() => router.push('/login'), 2000);
        return;
      }

      const updateData:any = {};

      // Only add optional fields if they have values
      // Backend UserUpdate schema only accepts: address, gender, age
      if (updatedAge && updatedAge.trim() !== '') {
        updateData.age = parseInt(updatedAge);
      }
      if (updatedGender && updatedGender.trim() !== '') {
        updateData.gender = updatedGender.toLowerCase(); // Backend expects lowercase
      }
      if (updatedAddress && updatedAddress.trim() !== '') {
        updateData.address = updatedAddress;
      }

      console.log('Sending update with data:', updateData);

      const updatedData = await api.updateProfile(authToken, updateData);
      
      console.log('Profile updated successfully:', updatedData);
      
      // Backend returns {message, success, user}, extract user data
      const userData = updatedData.user || updatedData;
      
      setUserData(userData);
      setSuccessMessage('✓ Profile updated successfully!');
      setIsEditing(false);
      
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Profile update error:', error);
      
      if (error instanceof Error) {
        if (error.message.includes('Cannot connect to server') || error.message.includes('Failed to fetch')) {
          setErrorMessage('Cannot connect to server. Please make sure the backend is running on port 8000.');
        } else if (error.message.includes('Invalid authentication') || error.message.includes('401')) {
          setErrorMessage('Your session has expired. Please login again.');
          setTimeout(() => {
            removeToken();
            router.push('/login');
          }, 2000);
        } else {
          setErrorMessage(error.message);
        }
      } else {
        setErrorMessage('Unable to update profile. Please try again.');
      }
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return (
      <>
        <Navbar />
        <div className="page-container">
          <div className="loading-message">Loading your profile...</div>
        </div>
      </>
    );
  }

  if (errorMessage && !userData) {
    return (
      <>
        <Navbar />
        <div className="page-container">
          <div className="error-message">{errorMessage}</div>
        </div>
      </>
    );
  }

  const displayName = userData?.username || userData?.name || 'User';

  return (
    <>
      <Navbar />
      <div className="page-container">
        <div className="page-header">
          <h1>Hello, {displayName}!</h1>
          <p>Manage your profile information</p>
        </div>

        <div className="profile-content">
          <div className="profile-card">
            <div className="profile-card-header">
              <h2>Profile Information</h2>
              {!isEditing && (
                <button 
                  onClick={() => setIsEditing(true)} 
                  className="btn-edit"
                >
                  Edit Profile
                </button>
              )}
            </div>

            {successMessage && (
              <div className="success-message">
                {successMessage}
              </div>
            )}

            {errorMessage && userData && (
              <div className="error-message">
                ⚠️ {errorMessage}
              </div>
            )}

            {isEditing ? (
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
                    defaultValue={userData?.username || ''}
                    placeholder="Enter username"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email" className="form-label">
                    Email Address
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    className="form-input"
                    defaultValue={userData?.email || ''}
                    placeholder="Enter email"
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="age" className="form-label">
                      Age
                    </label>
                    <input
                      id="age"
                      name="age"
                      type="number"
                      className="form-input"
                      defaultValue={userData?.age || ''}
                      placeholder="Enter age"
                      min="13"
                      max="100"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="gender" className="form-label">
                      Gender
                    </label>
                    <select
                      id="gender"
                      name="gender"
                      className="form-input"
                      defaultValue={userData?.gender || ''}
                    >
                      <option value="">Select gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="address" className="form-label">
                    Address
                  </label>
                  <textarea
                    id="address"
                    name="address"
                    className="form-input form-textarea"
                    defaultValue={userData?.address || ''}
                    placeholder="Enter your address"
                    rows={3}
                  />
                </div>

                <div className="form-actions">
                  <button 
                    type="submit" 
                    className="btn-primary" 
                    disabled={isSaving}
                  >
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button 
                    type="button" 
                    onClick={() => {
                      setIsEditing(false);
                      setErrorMessage('');
                    }}
                    className="btn-secondary"
                    disabled={isSaving}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <>
                <div className="profile-info-item">
                  <p className="profile-info-label">Username</p>
                  <p className="profile-info-value">{userData?.username || 'Not available'}</p>
                </div>

                <div className="profile-info-item">
                  <p className="profile-info-label">Email</p>
                  <p className="profile-info-value">{userData?.email || 'Not available'}</p>
                </div>

                <div className="profile-info-item">
                  <p className="profile-info-label">Age</p>
                  <p className="profile-info-value">{userData?.age || 'Not specified'}</p>
                </div>

                <div className="profile-info-item">
                  <p className="profile-info-label">Gender</p>
                  <p className="profile-info-value">{userData?.gender || 'Not specified'}</p>
                </div>

                <div className="profile-info-item">
                  <p className="profile-info-label">Address</p>
                  <p className="profile-info-value">{userData?.address || 'Not specified'}</p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
