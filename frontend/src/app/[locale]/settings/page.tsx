'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';

const profileSchema = z.object({
  name: z.string().trim().min(1, 'Name is required'),
  email: z.string().trim().email('Invalid email address'),
});

type ProfileFormData = z.infer<typeof profileSchema>;

const passwordSchema = z.object({
  currentPassword: z.string().trim().min(1, 'Current password is required'),
  newPassword: z.string().trim().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string().trim(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

type PasswordFormData = z.infer<typeof passwordSchema>;

interface UserSettings {
  language: 'en' | 'gu' | 'hi';
  isDarkMode: boolean;
  emailNotifications: boolean;
  smsNotifications: boolean;
}

export default function SettingsPage() {
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;

  const [user, setUser] = useState<any>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [activeTab, setActiveTab] = useState<'profile' | 'preferences' | 'password'>('profile');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [settings, setSettings] = useState<UserSettings>({
    language: (locale as 'en' | 'gu' | 'hi') || 'en',
    isDarkMode: false,
    emailNotifications: true,
    smsNotifications: false,
  });

  const [loadingSettings, setLoadingSettings] = useState(false);
  const [savedSettings, setSavedSettings] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  const profileForm = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: '', email: '' },
  });

  const passwordForm = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
  });

  // Fetch user profile on mount
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await api.get('/users/profile');
        setUser(response.data);
        profileForm.reset({
          name: response.data.name || '',
          email: response.data.email || '',
        });
      } catch (err) {
        console.error('Failed to fetch user:', err);
      } finally {
        setLoadingUser(false);
      }
    };

    fetchUser();
  }, [profileForm]);

  const handleLanguageChange = (lang: 'en' | 'gu' | 'hi') => {
    setSettings({ ...settings, language: lang });
    setSavedSettings(false);
  };

  const handleToggle = (key: keyof UserSettings, value: boolean) => {
    setSettings({ ...settings, [key]: value });
    setSavedSettings(false);
  };

  const handleSaveSettings = async () => {
    try {
      setLoadingSettings(true);
      setMessage(null);
      await api.patch('/users/preferences', settings);
      setSavedSettings(true);
      setMessage({ type: 'success', text: 'Preferences saved successfully!' });
      setTimeout(() => setSavedSettings(false), 3000);
    } catch (err) {
      console.error('Failed to save settings:', err);
      setMessage({ type: 'error', text: 'Failed to save preferences.' });
    } finally {
      setLoadingSettings(false);
    }
  };

  const onProfileSubmit = async (data: ProfileFormData) => {
    try {
      setProfileLoading(true);
      setMessage(null);
      await api.patch('/users/profile', { name: data.name, email: data.email });
      setUser({ ...user, ...data });
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
    } catch (err) {
      console.error('Failed to update profile:', err);
      setMessage({ type: 'error', text: 'Failed to update profile.' });
    } finally {
      setProfileLoading(false);
    }
  };

  const onPasswordSubmit = async (data: PasswordFormData) => {
    try {
      setPasswordLoading(true);
      setMessage(null);
      await api.post('/users/change-password', {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      passwordForm.reset();
      setMessage({ type: 'success', text: 'Password changed successfully!' });
    } catch (err: any) {
      console.error('Failed to change password:', err);
      const errorMsg = err.response?.data?.message || 'Failed to change password.';
      setMessage({ type: 'error', text: errorMsg });
    } finally {
      setPasswordLoading(false);
    }
  };

  if (loadingUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-4xl mx-auto px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-1">Manage your account and preferences</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-8 py-8">
        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-4 py-3 font-medium border-b-2 transition-colors ${
              activeTab === 'profile'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Profile
          </button>
          <button
            onClick={() => setActiveTab('preferences')}
            className={`px-4 py-3 font-medium border-b-2 transition-colors ${
              activeTab === 'preferences'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Preferences
          </button>
          <button
            onClick={() => setActiveTab('password')}
            className={`px-4 py-3 font-medium border-b-2 transition-colors ${
              activeTab === 'password'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Password
          </button>
        </div>

        {/* Messages */}
        {message && (
          <div
            className={`mb-6 p-4 rounded-lg border ${
              message.type === 'success'
                ? 'bg-green-50 border-green-200 text-green-800'
                : 'bg-red-50 border-red-200 text-red-800'
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="bg-white rounded-lg shadow-md p-8">
            <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Full Name *</label>
                <input
                  type="text"
                  {...profileForm.register('name')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Your name"
                />
                {profileForm.formState.errors.name && (
                  <p className="text-red-600 text-sm mt-1">{profileForm.formState.errors.name.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Email Address *</label>
                <input
                  type="email"
                  {...profileForm.register('email')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="your.email@example.com"
                />
                {profileForm.formState.errors.email && (
                  <p className="text-red-600 text-sm mt-1">{profileForm.formState.errors.email.message}</p>
                )}
              </div>

              <div className="flex gap-4 pt-4">
                <Button type="submit" disabled={profileLoading} className="bg-blue-600 hover:bg-blue-700">
                  {profileLoading ? 'Saving...' : 'Save Changes'}
                </Button>
                <Button type="button" variant="outline" onClick={() => profileForm.reset()} disabled={profileLoading}>
                  Reset
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Preferences Tab */}
        {activeTab === 'preferences' && (
          <div className="space-y-6">
            {/* Language */}
            <div className="bg-white rounded-lg shadow-md p-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Language</h2>
              <div className="space-y-3">
                {['en', 'gu', 'hi'].map((lang) => (
                  <label key={lang} className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="language"
                      value={lang}
                      checked={settings.language === lang}
                      onChange={() => handleLanguageChange(lang as 'en' | 'gu' | 'hi')}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="ml-3">
                      <p className="font-medium text-gray-900">
                        {lang === 'en' ? 'English' : lang === 'gu' ? 'ગુજરાતી' : 'हिंदी'}
                      </p>
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Appearance */}
            <div className="bg-white rounded-lg shadow-md p-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Appearance</h2>
              <label className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                <input
                  type="checkbox"
                  checked={settings.isDarkMode}
                  onChange={(e) => handleToggle('isDarkMode', e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <span className="ml-3">
                  <p className="font-medium text-gray-900">Dark Mode</p>
                  <p className="text-sm text-gray-600">Use dark theme for the application</p>
                </span>
              </label>
            </div>

            {/* Notifications */}
            <div className="bg-white rounded-lg shadow-md p-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Notifications</h2>
              <div className="space-y-3">
                <label className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <input
                    type="checkbox"
                    checked={settings.emailNotifications}
                    onChange={(e) => handleToggle('emailNotifications', e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <span className="ml-3">
                    <p className="font-medium text-gray-900">Email Notifications</p>
                    <p className="text-sm text-gray-600">Receive updates via email</p>
                  </span>
                </label>

                <label className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <input
                    type="checkbox"
                    checked={settings.smsNotifications}
                    onChange={(e) => handleToggle('smsNotifications', e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <span className="ml-3">
                    <p className="font-medium text-gray-900">SMS Notifications</p>
                    <p className="text-sm text-gray-600">Receive updates via SMS</p>
                  </span>
                </label>
              </div>
            </div>

            <div className="flex gap-4">
              <Button onClick={handleSaveSettings} disabled={loadingSettings} className="bg-blue-600 hover:bg-blue-700">
                {loadingSettings ? 'Saving...' : 'Save Preferences'}
              </Button>
            </div>
          </div>
        )}

        {/* Password Tab */}
        {activeTab === 'password' && (
          <div className="bg-white rounded-lg shadow-md p-8">
            <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Current Password *</label>
                <input
                  type="password"
                  {...passwordForm.register('currentPassword')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your current password"
                />
                {passwordForm.formState.errors.currentPassword && (
                  <p className="text-red-600 text-sm mt-1">{passwordForm.formState.errors.currentPassword.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">New Password *</label>
                <input
                  type="password"
                  {...passwordForm.register('newPassword')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter a new password (min. 8 characters)"
                />
                {passwordForm.formState.errors.newPassword && (
                  <p className="text-red-600 text-sm mt-1">{passwordForm.formState.errors.newPassword.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Confirm Password *</label>
                <input
                  type="password"
                  {...passwordForm.register('confirmPassword')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Confirm your new password"
                />
                {passwordForm.formState.errors.confirmPassword && (
                  <p className="text-red-600 text-sm mt-1">{passwordForm.formState.errors.confirmPassword.message}</p>
                )}
              </div>

              <div className="flex gap-4 pt-4">
                <Button type="submit" disabled={passwordLoading} className="bg-blue-600 hover:bg-blue-700">
                  {passwordLoading ? 'Changing...' : 'Change Password'}
                </Button>
                <Button type="button" variant="outline" onClick={() => passwordForm.reset()} disabled={passwordLoading}>
                  Reset
                </Button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
