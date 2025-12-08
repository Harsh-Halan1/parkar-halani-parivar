'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';

interface Person {
  id: string;
  firstName: Record<string, string>;
  lastName: Record<string, string>;
  dateOfBirth?: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  email?: string;
  phone?: string;
  address?: Record<string, string>;
  relationship?: string;
  familyId: string;
  family?: { name: Record<string, string> };
  createdAt: string;
  updatedAt: string;
}

interface Event {
  id: string;
  title: Record<string, string>;
  eventDate: string;
  type: string;
}

export default function PersonDetailPage() {
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;
  const personId = params.id as string;

  const [person, setPerson] = useState<Person | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch person details
        const personRes = await api.get(`/persons/${personId}`);
        setPerson(personRes.data);

        // Fetch events for this person
        try {
          const eventsRes = await api.get(`/events?personId=${personId}`);
          setEvents(eventsRes.data || []);
        } catch {
          // Events endpoint might not support this filter, continue anyway
          setEvents([]);
        }
      } catch (err) {
        console.error('Failed to fetch data:', err);
        setError('Failed to load person details');
      } finally {
        setLoading(false);
      }
    };

    if (personId) {
      fetchData();
    }
  }, [personId]);

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this person? This action cannot be undone.')) {
      return;
    }

    try {
      await api.delete(`/persons/${personId}`);
      router.push(`/${locale}/persons`);
    } catch (err) {
      console.error('Failed to delete person:', err);
      alert('Failed to delete person');
    }
  };

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

  const getGenderLabel = (gender?: string) => {
    switch (gender) {
      case 'MALE':
        return '👨 Male';
      case 'FEMALE':
        return '👩 Female';
      case 'OTHER':
        return '👤 Other';
      default:
        return '—';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-10 bg-slate-700 rounded w-1/3"></div>
            <div className="bg-slate-700 rounded-lg h-96"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!person) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-white mb-4">Person Not Found</h1>
            <p className="text-slate-400 mb-6">The person you&apos;re looking for doesn&apos;t exist.</p>
            <Link href={`/${locale}/persons`}>
              <Button className="bg-blue-600 hover:bg-blue-700">Back to Members</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      {/* Header */}
      <div className="border-b border-slate-700 shadow-lg">
        <div className="max-w-4xl mx-auto px-8 py-8">
          <div className="flex items-center justify-between">
            <Link
              href={`/${locale}/persons`}
              className="flex items-center text-slate-400 hover:text-slate-300 mb-6"
            >
              <span className="mr-2">←</span> Back to Members
            </Link>
            <div />
          </div>

          <div className="flex items-start gap-6">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center text-5xl">
              👤
            </div>
            <div className="flex-1">
              <h1 className="text-4xl font-bold text-white">
                {person.firstName?.[locale] || person.firstName?.['en'] || 'Unknown'}{' '}
                {person.lastName?.[locale] || person.lastName?.['en'] || ''}
              </h1>
              <p className="text-slate-400 mt-2">
                {person.family?.name?.[locale] || person.family?.name?.['en'] || 'Family Unknown'}
              </p>
              {person.relationship && (
                <div className="mt-2 inline-block bg-blue-600/30 px-3 py-1 rounded-full text-sm text-blue-300 border border-blue-600/50">
                  {person.relationship}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-8 py-8">
        {error && (
          <div className="mb-6 bg-red-500/20 border border-red-500/50 rounded-lg p-4">
            <p className="text-red-200">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Information */}
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
              <h2 className="text-2xl font-bold text-white mb-6">Personal Information</h2>

              <div className="grid grid-cols-2 gap-6">
                {/* Gender */}
                <div>
                  <p className="text-sm font-medium text-slate-400 mb-1">Gender</p>
                  <p className="text-white">{getGenderLabel(person.gender)}</p>
                </div>

                {/* Age / DOB */}
                {person.dateOfBirth && (
                  <div>
                    <p className="text-sm font-medium text-slate-400 mb-1">Date of Birth</p>
                    <p className="text-white">
                      {new Date(person.dateOfBirth).toLocaleDateString(locale)}
                    </p>
                    <p className="text-slate-400 text-sm">
                      Age: {calculateAge(person.dateOfBirth)} years
                    </p>
                  </div>
                )}

                {/* Email */}
                {person.email && (
                  <div>
                    <p className="text-sm font-medium text-slate-400 mb-1">Email</p>
                    <a href={`mailto:${person.email}`} className="text-blue-400 hover:text-blue-300">
                      {person.email}
                    </a>
                  </div>
                )}

                {/* Phone */}
                {person.phone && (
                  <div>
                    <p className="text-sm font-medium text-slate-400 mb-1">Phone</p>
                    <a href={`tel:${person.phone}`} className="text-blue-400 hover:text-blue-300">
                      {person.phone}
                    </a>
                  </div>
                )}

                {/* Address */}
                {person.address && (
                  <div className="col-span-2">
                    <p className="text-sm font-medium text-slate-400 mb-1">Address</p>
                    <p className="text-white">
                      {person.address?.[locale] || person.address?.['en'] || '—'}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Events */}
            {events.length > 0 && (
              <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
                <h2 className="text-2xl font-bold text-white mb-6">Events</h2>

                <div className="space-y-3">
                  {events.map((event) => (
                    <Link
                      key={event.id}
                      href={`/${locale}/events/${event.id}`}
                      className="block p-4 bg-slate-700/50 border border-slate-600 rounded-lg hover:border-slate-500 transition"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-white font-medium">
                            {event.title?.[locale] || event.title?.['en'] || 'Unnamed Event'}
                          </p>
                          <p className="text-slate-400 text-sm">
                            {new Date(event.eventDate).toLocaleDateString(locale)}
                          </p>
                        </div>
                        <span className="text-slate-400 text-sm">{event.type}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Actions */}
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
              <h3 className="text-lg font-bold text-white mb-4">Actions</h3>

              <div className="space-y-3">
                <Link href={`/${locale}/persons/${person.id}/edit`} className="block">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                    Edit Profile
                  </Button>
                </Link>

                <Button
                  onClick={() => router.push(`/${locale}/events/create?personId=${personId}`)}
                  variant="outline"
                  className="w-full border-slate-600 text-slate-300 hover:bg-slate-700"
                >
                  Create Event
                </Button>

                <Button
                  onClick={handleDelete}
                  variant="destructive"
                  className="w-full bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-600/50"
                >
                  Delete Person
                </Button>
              </div>
            </div>

            {/* Metadata */}
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
              <h3 className="text-lg font-bold text-white mb-4">Details</h3>

              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-slate-400">ID</p>
                  <p className="text-slate-300 font-mono text-xs break-all">{person.id}</p>
                </div>

                <div>
                  <p className="text-slate-400">Created</p>
                  <p className="text-slate-300">
                    {new Date(person.createdAt).toLocaleDateString(locale)}
                  </p>
                </div>

                <div>
                  <p className="text-slate-400">Last Updated</p>
                  <p className="text-slate-300">
                    {new Date(person.updatedAt).toLocaleDateString(locale)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
