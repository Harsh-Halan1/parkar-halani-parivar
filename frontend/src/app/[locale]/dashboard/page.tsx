'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import Link from 'next/link';

interface FamilyStats {
  totalMembers: number;
  totalFamilies: number;
  upcomingEvents: number;
  recentActivity: Array<{
    id: string;
    type: string;
    description: string;
    timestamp: string;
  }>;
}

export default function DashboardPage() {
  const params = useParams();
  const locale = params.locale as string;
  const router = useRouter();
  
  const [stats, setStats] = useState<FamilyStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        
        // Fetch families
        const familiesRes = await api.get('/families');
        const families = familiesRes.data;

        // Calculate total members
        let totalMembers = 0;
        families.forEach((family: any) => {
          totalMembers += family.members?.length || 0;
        });

        // Mock recent activity (in real app, fetch from backend)
        const recentActivity = [
          {
            id: '1',
            type: 'member_added',
            description: 'New family member added',
            timestamp: new Date().toISOString(),
          },
          {
            id: '2',
            type: 'family_created',
            description: 'New family created',
            timestamp: new Date(Date.now() - 86400000).toISOString(),
          },
        ];

        setStats({
          totalMembers,
          totalFamilies: families.length,
          upcomingEvents: 5, // Mock data
          recentActivity,
        });
      } catch (err) {
        console.error('Failed to fetch stats:', err);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-10 bg-gray-300 rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-300 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold text-gray-900">
                Family Dashboard
              </h1>
              <p className="text-gray-600 mt-2">
                Welcome back! Here&apos;s your family overview.
              </p>
            </div>
            <Button
              onClick={() => router.push(`/${locale}/families/create`)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              + New Family
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-8 py-8">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Families Card */}
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Families</p>
                <p className="text-4xl font-bold text-gray-900 mt-2">
                  {stats?.totalFamilies || 0}
                </p>
              </div>
              <div className="text-5xl text-blue-200">👨‍👩‍👧‍👦</div>
            </div>
            <p className="text-gray-500 text-xs mt-4">
              Family units in your account
            </p>
          </div>

          {/* Total Members Card */}
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Members</p>
                <p className="text-4xl font-bold text-gray-900 mt-2">
                  {stats?.totalMembers || 0}
                </p>
              </div>
              <div className="text-5xl text-green-200">👥</div>
            </div>
            <p className="text-gray-500 text-xs mt-4">
              Across all families
            </p>
          </div>

          {/* Upcoming Events Card */}
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Upcoming Events</p>
                <p className="text-4xl font-bold text-gray-900 mt-2">
                  {stats?.upcomingEvents || 0}
                </p>
              </div>
              <div className="text-5xl text-purple-200">📅</div>
            </div>
            <p className="text-gray-500 text-xs mt-4">
              This month
            </p>
          </div>

          {/* Family Tree Card */}
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-orange-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Family Trees</p>
                <p className="text-4xl font-bold text-gray-900 mt-2">
                  {stats?.totalFamilies || 0}
                </p>
              </div>
              <div className="text-5xl text-orange-200">🌳</div>
            </div>
            <p className="text-gray-500 text-xs mt-4">
              Interactive visualizations
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href={`/${locale}/persons/create`}>
              <Button
                variant="outline"
                className="w-full justify-start hover:bg-blue-50"
              >
                <span className="mr-3">➕</span>
                Add Family Member
              </Button>
            </Link>
            <Link href={`/${locale}/events`}>
              <Button
                variant="outline"
                className="w-full justify-start hover:bg-purple-50"
              >
                <span className="mr-3">📅</span>
                View Events
              </Button>
            </Link>
            <Link href={`/${locale}/settings`}>
              <Button
                variant="outline"
                className="w-full justify-start hover:bg-gray-50"
              >
                <span className="mr-3">⚙️</span>
                Settings
              </Button>
            </Link>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Activity List */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Activity</h2>
            <div className="space-y-4">
              {stats?.recentActivity && stats.recentActivity.length > 0 ? (
                stats.recentActivity.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                  >
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-4"></div>
                    <div className="flex-1">
                      <p className="text-gray-900 font-medium text-sm">
                        {activity.description}
                      </p>
                      <p className="text-gray-500 text-xs">
                        {new Date(activity.timestamp).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-sm">No recent activity</p>
              )}
            </div>
          </div>

          {/* Family Overview */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Family Overview
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                <span className="text-gray-700 font-medium">Active Families</span>
                <span className="text-2xl font-bold text-blue-600">
                  {stats?.totalFamilies || 0}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                <span className="text-gray-700 font-medium">Total Persons</span>
                <span className="text-2xl font-bold text-green-600">
                  {stats?.totalMembers || 0}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                <span className="text-gray-700 font-medium">Avg Members/Family</span>
                <span className="text-2xl font-bold text-purple-600">
                  {stats?.totalFamilies && stats.totalMembers
                    ? (stats.totalMembers / stats.totalFamilies).toFixed(1)
                    : 0}
                </span>
              </div>
            </div>

            {/* View Family Trees Button */}
            <button className="w-full mt-4 px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-indigo-700 transition">
              Explore Family Trees
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
