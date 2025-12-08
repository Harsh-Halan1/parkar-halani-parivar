'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const EVENT_TYPES = ['BIRTHDAY', 'BIRTH', 'DEATH', 'ACHIEVEMENT', 'GENERAL'] as const;

type EventType = typeof EVENT_TYPES[number];

type Translated = { en?: string; gu?: string; hi?: string };

const translatedOptional = z.object({
  en: z.string().trim().optional(),
  gu: z.string().trim().optional(),
  hi: z.string().trim().optional(),
});

const eventSchema = z.object({
  title: z.object({
    en: z.string().trim().min(1, 'Title is required'),
    gu: z.string().trim().optional(),
    hi: z.string().trim().optional(),
  }),
  description: translatedOptional.optional(),
  eventDate: z.string().trim().min(1, 'Date is required'),
  location: translatedOptional.optional(),
  type: z.enum(EVENT_TYPES),
  personId: z.string().trim().optional().or(z.literal('')),
  isPublic: z.boolean(),
  imageUrls: z.array(z.string().trim().url('Invalid image URL')).optional(),
});

type EventForm = z.infer<typeof eventSchema>;

export default function CreateEventPage() {
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EventForm>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      title: { en: '', gu: '', hi: '' },
      description: { en: '', gu: '', hi: '' },
      eventDate: '',
      location: { en: '', gu: '', hi: '' },
      type: 'GENERAL',
      personId: '',
      isPublic: true,
      imageUrls: [],
    },
  });

  const [loading, setLoading] = useState(false);
  const [persons, setPersons] = useState<any[]>([]);
  const [imageInput, setImageInput] = useState('');

  useEffect(() => {
    const fetchPersons = async () => {
      try {
        const res = await api.get('/persons');
        setPersons(res.data || []);
      } catch (err) {
        console.error('Failed to fetch persons:', err);
      }
    };
    fetchPersons();
  }, []);

  const cleanedArray = useMemo(() =>
    imageInput
      .split(/\n|,/)
      .map((s) => s.trim())
      .filter(Boolean),
  [imageInput]);

  const onSubmit = async (data: EventForm) => {
    try {
      setLoading(true);

      const payload = {
        ...data,
        title: {
          en: data.title?.en || '',
          gu: data.title?.gu || '',
          hi: data.title?.hi || '',
        },
        description: Object.values(data.description || {}).some(Boolean)
          ? data.description
          : undefined,
        location: Object.values(data.location || {}).some(Boolean)
          ? data.location
          : undefined,
        personId: data.personId || undefined,
        imageUrls: cleanedArray,
      };

      await api.post('/events', payload);
      router.push(`/${locale}/events`);
    } catch (err) {
      console.error('Failed to create event:', err);
      alert('Failed to create event. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-4xl mx-auto px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Create Event</h1>
          <p className="text-gray-600 mt-1">Log birthdays, achievements, and other family events</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-8 py-8">
        <div className="bg-white rounded-lg shadow-md p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* Basic Info */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title (English) *</label>
                  <input
                    type="text"
                    {...register('title.en', { required: 'Title is required' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    placeholder="e.g., Raj's Birthday"
                  />
                  {errors.title?.en && <p className="text-red-600 text-xs mt-1">{errors.title.en.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">શીર્ષક (Gujarati)</label>
                  <input
                    type="text"
                    {...register('title.gu')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    placeholder="ગુજરાતીમાં શીર્ષક"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">शीर्षक (Hindi)</label>
                  <input
                    type="text"
                    {...register('title.hi')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    placeholder="हिंदी में शीर्षक"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Event Date *</label>
                  <input
                    type="date"
                    {...register('eventDate', { required: 'Date is required' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                  {errors.eventDate && <p className="text-red-600 text-xs mt-1">{errors.eventDate.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
                  <select
                    {...register('type', { required: true })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  >
                    {EVENT_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {type.charAt(0) + type.slice(1).toLowerCase()}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Description</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">English</label>
                  <textarea
                    {...register('description.en')}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    placeholder="Details about the event"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ગુજરાતી</label>
                  <textarea
                    {...register('description.gu')}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    placeholder="ગુજરાતીમાં વિગતો"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">हिंदी</label>
                  <textarea
                    {...register('description.hi')}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    placeholder="हिंदी में विवरण"
                  />
                </div>
              </div>
            </div>

            {/* Location */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Location</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">English</label>
                  <input
                    type="text"
                    {...register('location.en')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    placeholder="e.g., Community Hall"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ગુજરાતી</label>
                  <input
                    type="text"
                    {...register('location.gu')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    placeholder="સ્થાન"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">हिंदी</label>
                  <input
                    type="text"
                    {...register('location.hi')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    placeholder="स्थान"
                  />
                </div>
              </div>
            </div>

            {/* Associations */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Association</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Related Person</label>
                  <select
                    {...register('personId')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  >
                    <option value="">None</option>
                    {persons.map((person) => (
                      <option key={person.id} value={person.id}>
                        {person.firstName?.en} {person.lastName?.en}
                      </option>
                    ))}
                  </select>
                </div>
                <label className="flex items-center gap-3 mt-6">
                  <input type="checkbox" {...register('isPublic')} className="w-4 h-4" />
                  <span className="text-sm text-gray-700">Public event</span>
                </label>
              </div>
            </div>

            {/* Images */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Images</h2>
              <p className="text-sm text-gray-600 mb-2">Add image URLs separated by commas or new lines</p>
              <textarea
                value={imageInput}
                onChange={(e) => setImageInput(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                placeholder="https://example.com/photo1.jpg, https://example.com/photo2.jpg"
              />
              {cleanedArray.length > 0 && (
                <p className="text-xs text-gray-600 mt-2">Will attach {cleanedArray.length} image link(s).</p>
              )}
            </div>

            <div className="flex gap-4 pt-6 border-t border-gray-200">
              <Button type="submit" disabled={loading} className="flex-1 bg-blue-600 hover:bg-blue-700">
                {loading ? 'Saving...' : 'Create Event'}
              </Button>
              <Button type="button" variant="outline" onClick={() => router.back()} disabled={loading}>
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
