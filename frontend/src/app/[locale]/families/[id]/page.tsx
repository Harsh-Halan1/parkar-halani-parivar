'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

interface Family {
  id: string;
  name: Record<string, string>;
  headPersonId?: string;
  createdAt?: string;
  updatedAt?: string;
  members?: Array<{
    id: string;
    firstName: Record<string, string>;
    lastName: Record<string, string>;
    gender?: string;
    dateOfBirth?: string;
    relationship?: string;
  }>;
}

export default function FamilyDetailPage() {
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;
  const familyId = params.id as string;

  const [family, setFamily] = useState<Family | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFamily = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/families/${familyId}`);
        setFamily(response.data);
      } catch (err) {
        console.error('Failed to fetch family:', err);
        setError('Failed to load family');
      } finally {
        setLoading(false);
      }
    };

    if (familyId) {
      fetchFamily();
    }
  }, [familyId]);

  const handleDeleteFamily = async () => {
    if (
      !confirm(
        `Are you sure you want to delete "${family?.name?.[locale] || family?.name?.['en']}"? This action cannot be undone.`
      )
    ) {
      return;
    }

    try {
      await api.delete(`/families/${familyId}`);
      router.push(`/${locale}/families`);
    } catch (err) {
      console.error('Failed to delete family:', err);
      alert('Failed to delete family');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-10 bg-slate-700 rounded w-1/3"></div>
            <div className="bg-slate-700 rounded-lg h-40"></div>
            <div className="bg-slate-700 rounded-lg h-64"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!family) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-4">Family Not Found</h1>
          <p className="text-slate-400 mb-6">The family you&apos;re looking for doesn&apos;t exist.</p>
          <Button
            onClick={() => router.push(`/${locale}/families`)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Back to Families
          </Button>
        </div>
      </div>
    );
  }

  const calculateAge = (dateOfBirth?: string) => {
    if (!dateOfBirth) return null;
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      {/* Header */}
      <div className="border-b border-slate-700 shadow-lg">
        <div className="max-w-6xl mx-auto px-8 py-8">
          <div className="flex items-center justify-between">
            <Link
              href={`/${locale}/families`}
              className="flex items-center text-slate-400 hover:text-slate-300 mb-6"
            >
              <span className="mr-2">←</span> Back to Families
            </Link>
            <div />
          </div>

          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white">
                {family.name?.[locale] || family.name?.['en'] || 'Family'}
              </h1>
              <p className="text-slate-400 mt-2">
                {family.members?.length || 0} member{family.members?.length !== 1 ? 's' : ''}
              </p>
            </div>
            <div className="flex gap-2">
              <Link href={`/${locale}/families/${familyId}/tree`}>
                <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700">
                  🌳 View Tree
                </Button>
              </Link>
              <Link href={`/${locale}/families/${familyId}/edit`}>
                <Button className="bg-blue-600 hover:bg-blue-700">Edit</Button>
              </Link>
              <Button
                onClick={handleDeleteFamily}
                className="bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-600/50"
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-8 py-8">
        {error && (
          <div className="mb-6 bg-red-500/20 border border-red-500/50 rounded-lg p-4">
            <p className="text-red-200">{error}</p>
          </div>
        )}

        {/* Family Info */}
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-white mb-6">Family Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-slate-400 font-medium text-sm mb-1">English Name</p>
              <p className="text-white text-lg">{family.name?.en || 'N/A'}</p>
            </div>
            {family.name?.gu && (
              <div>
                <p className="text-slate-400 font-medium text-sm mb-1">ગુજરાતી નામ</p>
                <p className="text-white text-lg">{family.name.gu}</p>
              </div>
            )}
            {family.name?.hi && (
              <div>
                <p className="text-slate-400 font-medium text-sm mb-1">हिंदी नाम</p>
                <p className="text-white text-lg">{family.name.hi}</p>
              </div>
            )}
          </div>

          {/* Metadata */}
          {(family.createdAt || family.updatedAt) && (
            <div className="border-t border-slate-700 mt-6 pt-6 grid grid-cols-2 gap-4 text-sm">
              {family.createdAt && (
                <div>
                  <p className="text-slate-400">Created</p>
                  <p className="text-slate-300">{new Date(family.createdAt).toLocaleDateString(locale)}</p>
                </div>
              )}
              {family.updatedAt && (
                <div>
                  <p className="text-slate-400">Last Updated</p>
                  <p className="text-slate-300">{new Date(family.updatedAt).toLocaleDateString(locale)}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Members Section */}
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white">Family Members</h2>
            <Link href={`/${locale}/persons/create?familyId=${familyId}`}>
              <Button className="bg-blue-600 hover:bg-blue-700">+ Add Member</Button>
            </Link>
          </div>

          {family.members && family.members.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {family.members.map((member) => (
                <Link key={member.id} href={`/${locale}/persons/${member.id}`}>
                  <div className="p-4 border border-slate-700 rounded-lg hover:border-blue-500 hover:bg-slate-700/50 transition cursor-pointer">
                    <div className="flex items-start gap-3">
                      <div className="text-2xl">👤</div>
                      <div className="flex-1">
                        <h3 className="font-bold text-white">
                          {member.firstName?.[locale] || member.firstName?.['en'] || 'Unknown'}{' '}
                          {member.lastName?.[locale] || member.lastName?.['en'] || ''}
                        </h3>
                        {member.relationship && (
                          <p className="text-blue-300 text-sm mt-1 capitalize">{member.relationship}</p>
                        )}
                        {member.dateOfBirth && (
                          <p className="text-slate-400 text-xs mt-2">
                            Age: {calculateAge(member.dateOfBirth)} years
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-5xl mb-4">👥</div>
              <p className="text-slate-400 mb-6">No members yet</p>
              <Link href={`/${locale}/persons/create?familyId=${familyId}`}>
                <Button className="bg-blue-600 hover:bg-blue-700">Add First Member</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
