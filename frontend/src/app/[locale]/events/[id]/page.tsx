'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';

interface Event {
  id: string;
  title: Record<string, string>;
  description?: Record<string, string>;
  eventDate: string;
  location?: Record<string, string>;
  type: 'BIRTHDAY' | 'BIRTH' | 'DEATH' | 'ACHIEVEMENT' | 'GENERAL';
  personId?: string;
  familyId?: string;
  person?: {
    id: string;
    firstName: Record<string, string>;
    lastName: Record<string, string>;
  };
  family?: {
    id: string;
    name: Record<string, string>;
  };
  createdAt: string;
  updatedAt: string;
  isPublic?: boolean;
}

export default function EventDetailPage() {
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;
  const eventId = params.id as string;

  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/events/${eventId}`);
        setEvent(response.data);
      } catch (err) {
        console.error('Failed to fetch event:', err);
        setError('Failed to load event');
      } finally {
        setLoading(false);
      }
    };

    if (eventId) {
      fetchEvent();
    }
  }, [eventId]);

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
      return;
    }

    try {
      await api.delete(`/events/${eventId}`);
      router.push(`/${locale}/events`);
    } catch (err) {
      console.error('Failed to delete event:', err);
      alert('Failed to delete event');
    }
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'BIRTHDAY':
        return '🎂';
      case 'BIRTH':
        return '👶';
      case 'DEATH':
        return '🕯️';
      case 'ACHIEVEMENT':
        return '🏆';
      default:
        return '📢';
    }
  };

  const getEventTypeLabel = (type: string) => {
    switch (type) {
      case 'BIRTHDAY':
        return 'Birthday';
      case 'BIRTH':
        return 'Birth';
      case 'DEATH':
        return 'Death';
      case 'ACHIEVEMENT':
        return 'Achievement';
      default:
        return 'General Event';
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

  if (!event) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-4">Event Not Found</h1>
          <p className="text-slate-400 mb-6">The event you&apos;re looking for doesn&apos;t exist.</p>
          <Link href={`/${locale}/events`}>
            <Button className="bg-blue-600 hover:bg-blue-700">Back to Events</Button>
          </Link>
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
            <Link href={`/${locale}/events`} className="flex items-center text-slate-400 hover:text-slate-300 mb-6">
              <span className="mr-2">←</span> Back to Events
            </Link>
            <div />
          </div>

          <div className="flex items-start gap-6">
            <div className="text-6xl">{getEventIcon(event.type)}</div>
            <div className="flex-1">
              <h1 className="text-4xl font-bold text-white">
                {event.title?.[locale] || event.title?.['en'] || 'Unnamed Event'}
              </h1>
              <div className="mt-3 flex items-center gap-2">
                <span className="bg-blue-600/30 px-3 py-1 rounded-full text-sm text-blue-300 border border-blue-600/50">
                  {getEventTypeLabel(event.type)}
                </span>
                {event.isPublic && (
                  <span className="bg-green-600/30 px-3 py-1 rounded-full text-sm text-green-300 border border-green-600/50">
                    Public
                  </span>
                )}
              </div>
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
            {/* Details */}
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
              <h2 className="text-2xl font-bold text-white mb-6">Event Details</h2>

              <div className="space-y-6">
                {/* Date */}
                <div>
                  <p className="text-slate-400 font-medium text-sm mb-2">Date</p>
                  <p className="text-white text-lg">
                    {new Date(event.eventDate).toLocaleDateString(locale, {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>

                {/* Location */}
                {event.location && (
                  <div>
                    <p className="text-slate-400 font-medium text-sm mb-2">Location</p>
                    <p className="text-white">
                      {event.location?.[locale] || event.location?.['en'] || '—'}
                    </p>
                  </div>
                )}

                {/* Description */}
                {event.description && (
                  <div>
                    <p className="text-slate-400 font-medium text-sm mb-2">Description</p>
                    <p className="text-slate-300 whitespace-pre-wrap">
                      {event.description?.[locale] || event.description?.['en'] || '—'}
                    </p>
                  </div>
                )}

                {/* Multilingual Titles */}
                {(event.title?.['gu'] || event.title?.['hi']) && (
                  <div className="border-t border-slate-700 pt-6">
                    <p className="text-slate-400 font-medium text-sm mb-3">Other Languages</p>
                    <div className="space-y-2">
                      {event.title?.['gu'] && (
                        <div>
                          <p className="text-slate-500 text-xs">Gujarati</p>
                          <p className="text-white">{event.title.gu}</p>
                        </div>
                      )}
                      {event.title?.['hi'] && (
                        <div>
                          <p className="text-slate-500 text-xs">Hindi</p>
                          <p className="text-white">{event.title.hi}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Person Link */}
            {event.person && (
              <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
                <h3 className="text-lg font-bold text-white mb-4">Person</h3>
                <Link href={`/${locale}/persons/${event.personId}`}>
                  <div className="p-4 border border-slate-700 rounded-lg hover:border-blue-500 hover:bg-slate-700/50 transition cursor-pointer">
                    <p className="text-white font-medium">
                      {event.person.firstName?.[locale] || event.person.firstName?.['en']}{' '}
                      {event.person.lastName?.[locale] || event.person.lastName?.['en']}
                    </p>
                    <p className="text-slate-400 text-sm mt-1">View profile</p>
                  </div>
                </Link>
              </div>
            )}

            {/* Family Link */}
            {event.family && (
              <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
                <h3 className="text-lg font-bold text-white mb-4">Family</h3>
                <Link href={`/${locale}/families/${event.familyId}`}>
                  <div className="p-4 border border-slate-700 rounded-lg hover:border-blue-500 hover:bg-slate-700/50 transition cursor-pointer">
                    <p className="text-white font-medium">
                      {event.family.name?.[locale] || event.family.name?.['en']}
                    </p>
                    <p className="text-slate-400 text-sm mt-1">View family</p>
                  </div>
                </Link>
              </div>
            )}

            {/* Actions */}
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
              <h3 className="text-lg font-bold text-white mb-4">Actions</h3>

              <div className="space-y-3">
                <Link href={`/${locale}/events/${event.id}/edit`} className="block">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                    Edit Event
                  </Button>
                </Link>

                <Button
                  onClick={handleDelete}
                  className="w-full bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-600/50"
                >
                  Delete Event
                </Button>
              </div>
            </div>

            {/* Metadata */}
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
              <h3 className="text-lg font-bold text-white mb-4">Details</h3>

              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-slate-400">Created</p>
                  <p className="text-slate-300">{new Date(event.createdAt).toLocaleDateString(locale)}</p>
                </div>

                <div>
                  <p className="text-slate-400">Last Updated</p>
                  <p className="text-slate-300">{new Date(event.updatedAt).toLocaleDateString(locale)}</p>
                </div>

                <div className="border-t border-slate-700 pt-3">
                  <p className="text-slate-400 text-xs">ID</p>
                  <p className="text-slate-300 font-mono text-xs break-all">{event.id}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
