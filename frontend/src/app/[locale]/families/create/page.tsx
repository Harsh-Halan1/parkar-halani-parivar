'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const familySchema = z.object({
  name: z.object({
    en: z.string().trim().min(1, 'English name is required'),
    gu: z.string().trim().optional(),
    hi: z.string().trim().optional(),
  }),
});

type FamilyForm = z.infer<typeof familySchema>;

export default function CreateFamilyPage() {
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;
  const familyId = (params.id as string) || null;

  const { register, handleSubmit, formState: { errors }, reset } = useForm<FamilyForm>({
    resolver: zodResolver(familySchema),
    defaultValues: {
      name: { en: '', gu: '', hi: '' },
    },
  });

  const [loading, setLoading] = useState(false);
  const [existingFamily, setExistingFamily] = useState<FamilyForm | null>(null);

  useEffect(() => {
    if (familyId) {
      const fetchFamily = async () => {
        try {
          const response = await api.get(`/families/${familyId}`);
          setExistingFamily(response.data);
          reset(response.data);
        } catch (err) {
          console.error('Failed to fetch family:', err);
        }
      };
      fetchFamily();
    }
  }, [familyId, reset]);

  const onSubmit = async (data: FamilyForm) => {
    try {
      setLoading(true);

      if (familyId) {
        await api.patch(`/families/${familyId}`, data);
      } else {
        await api.post('/families', data);
      }

      router.push(`/${locale}/families`);
    } catch (err) {
      console.error('Failed to save family:', err);
      alert('Failed to save family. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-2xl mx-auto px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900">
            {familyId ? 'Edit Family' : 'Create New Family'}
          </h1>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-2xl mx-auto px-8 py-8">
        <div className="bg-white rounded-lg shadow-md p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* English Name */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Family Name (English)
              </label>
              <input
                type="text"
                {...register('name.en', { required: 'English name is required' })}
                placeholder="e.g., Halani Family"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.name?.en && (
                <p className="text-red-600 text-sm mt-1">{errors.name.en.message}</p>
              )}
            </div>

            {/* Gujarati Name */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                હાલાણી પરિવાર (Gujarati)
              </label>
              <input
                type="text"
                {...register('name.gu')}
                placeholder="ગુજરાતીમાં પરિવારનું નામ"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Hindi Name */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                हिंदी नाम (Hindi)
              </label>
              <input
                type="text"
                {...register('name.hi')}
                placeholder="हिंदी में परिवार का नाम"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-4 pt-4">
              <Button
                type="submit"
                disabled={loading}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                {loading ? 'Saving...' : familyId ? 'Update Family' : 'Create Family'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={loading}
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
