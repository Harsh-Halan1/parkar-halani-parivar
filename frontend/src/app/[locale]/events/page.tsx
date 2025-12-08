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
  person?: { firstName?: Record<string, string>; lastName?: Record<string, string> };
  createdAt: string;
  isPublic?: boolean;
}

const EVENT_TYPES = ['ALL', 'BIRTHDAY', 'BIRTH', 'DEATH', 'ACHIEVEMENT', 'GENERAL'] as const;

export default function EventsPage() {
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;

  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('ALL');

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await api.get('/events');
        // Sort by event date (descending)
        const sorted = response.data.sort(
          (a: Event, b: Event) => new Date(b.eventDate).getTime() - new Date(a.eventDate).getTime()
        );
        setEvents(sorted);
      } catch (err) {
        console.error('Failed to fetch events:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const filteredEvents = events.filter((event) => {
    if (filter === 'ALL') return true;
    return event.type === filter;
  });

  const getEventColor = (type: string) => {
    switch (type) {
      case 'BIRTHDAY':
        return { bg: 'bg-blue-600/20', border: 'border-blue-600/50', text: 'text-blue-300' };
      case 'BIRTH':
        return { bg: 'bg-green-600/20', border: 'border-green-600/50', text: 'text-green-300' };
      case 'DEATH':
        return { bg: 'bg-gray-600/20', border: 'border-gray-600/50', text: 'text-gray-300' };
      case 'ACHIEVEMENT':
        return { bg: 'bg-yellow-600/20', border: 'border-yellow-600/50', text: 'text-yellow-300' };
      default:
        return { bg: 'bg-purple-600/20', border: 'border-purple-600/50', text: 'text-purple-300' };
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

  const handleDeleteEvent = async (eventId: string, eventTitle: string) => {
    if (!confirm(`Delete "${eventTitle}"? This action cannot be undone.`)) return;

    try {
      await api.delete(`/events/${eventId}`);
      setEvents((prev) => prev.filter((e) => e.id !== eventId));
    } catch (err) {
      console.error('Failed to delete event:', err);
      alert('Failed to delete event');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      {/* Header */}
      <div className="border-b border-slate-700 shadow-lg">
        <div className="max-w-5xl mx-auto px-8 py-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold text-white">Family Events</h1>
              <p className="text-slate-400 mt-2">Important dates and occasions</p>
            </div>
            <Link href={`/${locale}/events/create`}>
              <Button className="bg-blue-600 hover:bg-blue-700">+ Create Event</Button>
            </Link>
          </div>

          {/* Filter */}
          <div className="flex gap-2 flex-wrap">
            {EVENT_TYPES.map((type) => (
              <button
                key={type}
                onClick={() => setFilter(type)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === type
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {type === 'ALL'
                  ? 'All Events'
                  : type === 'BIRTHDAY'
                  ? '🎂 Birthdays'
                  : type === 'BIRTH'
                  ? '👶 Births'
                  : type === 'DEATH'
                  ? '🕯️ Deaths'
                  : type === 'ACHIEVEMENT'
                  ? '🏆 Achievements'
                  : '📢 General'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-8 py-8">
        {/* Events List */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <p className="text-slate-400">Loading events...</p>
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📅</div>
            <h2 className="text-2xl font-bold text-white mb-2">No events found</h2>
            <p className="text-slate-400 mb-6">
              {filter !== 'ALL' ? 'Try a different filter' : 'Create your first family event'}
            </p>
            {filter === 'ALL' && (
              <Link href={`/${locale}/events/create`}>
                <Button className="bg-blue-600 hover:bg-blue-700">Create First Event</Button>
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredEvents.map((event) => {
              const colors = getEventColor(event.type);
              return (
                <div
                  key={event.id}
                  className={`rounded-lg border-l-4 p-6 ${colors.bg} border-b ${colors.border} bg-slate-800 shadow-sm hover:shadow-lg transition-shadow`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-2xl">{getEventIcon(event.type)}</span>
                        <h3 className="text-xl font-semibold text-white">
                          {event.title?.[locale] || event.title?.['en'] || 'Unnamed Event'}
                        </h3>
                      </div>

                      {/* Multilingual titles */}
                      {(event.title?.['gu'] || event.title?.['hi']) && (
                        <div className="text-sm text-slate-400 mb-3">
                          {event.title?.['gu'] && <p>ગુજરાતી: {event.title.gu}</p>}
                          {event.title?.['hi'] && <p>हिंदी: {event.title.hi}</p>}
                        </div>
                      )}

                      {/* Description */}
                      {event.description?.[locale] && (
                        <p className="text-slate-300 mb-4">{event.description[locale]}</p>
                      )}

                      {/* Details */}
                      <div className="flex flex-wrap gap-6 text-sm">
                        <div>
                          <p className="font-medium text-slate-400">Date</p>
                          <p className="text-white">{new Date(event.eventDate).toLocaleDateString(locale)}</p>
                        </div>
                        {event.location?.[locale] && (
                          <div>
                            <p className="font-medium text-slate-400">Location</p>
                            <p className="text-white">{event.location[locale]}</p>
                          </div>
                        )}
                        {event.person && (
                          <div>
                            <p className="font-medium text-slate-400">Person</p>
                            <Link
                              href={`/${locale}/persons/${event.personId}`}
                              className="text-blue-400 hover:text-blue-300"
                            >
                              {event.person.firstName?.[locale] || event.person.firstName?.['en']}{' '}
                              {event.person.lastName?.[locale] || event.person.lastName?.['en']}
                            </Link>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 ml-4">
                      <Link href={`/${locale}/events/${event.id}/edit`}>
                        <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700">
                          Edit
                        </Button>
                      </Link>
                      <Button
                        onClick={() =>
                          handleDeleteEvent(
                            event.id,
                            event.title?.[locale] || event.title?.['en'] || 'Event'
                          )
                        }
                        className="bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-600/50"
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
