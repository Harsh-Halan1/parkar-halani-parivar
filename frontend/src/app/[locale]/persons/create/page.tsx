'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const translatedRequired = z.object({
  en: z.string().trim().min(1, 'English first name is required'),
  gu: z.string().trim().optional(),
  hi: z.string().trim().optional(),
});

const translatedOptional = z.object({
  en: z.string().trim().optional(),
  gu: z.string().trim().optional(),
  hi: z.string().trim().optional(),
});

const basePersonSchema = z.object({
  firstName: translatedRequired,
  middleName: translatedOptional.optional(),
  lastName: z.object({
    en: z.string().trim().min(1, 'Last name is required'),
    gu: z.string().trim().optional(),
    hi: z.string().trim().optional(),
  }),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']),
  dateOfBirth: z.string().trim().optional(),
  placeOfBirth: translatedOptional.optional(),
  email: z.string().trim().email('Invalid email').optional().or(z.literal('')),
  phone: z.string().trim().optional(),
  address: translatedOptional.optional(),
  occupation: translatedOptional.optional(),
  company: translatedOptional.optional(),
  maritalStatus: z.enum(['SINGLE', 'MARRIED', 'DIVORCED', 'WIDOWED', 'UNKNOWN']).optional(),
  photoUrl: z.string().trim().url('Invalid URL').optional().or(z.literal('')),
  bio: translatedOptional.optional(),
});

const personSchema = basePersonSchema.extend({
  familyId: z.string().trim().min(1, 'Please select a family'),
});

type PersonForm = z.infer<typeof personSchema>;

export default function CreatePersonPage() {
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;

  const { register, handleSubmit, formState: { errors }, reset } = useForm<PersonForm>({
    resolver: zodResolver(personSchema),
    defaultValues: {
      firstName: { en: '', gu: '', hi: '' },
      middleName: { en: '', gu: '', hi: '' },
      lastName: { en: '', gu: '', hi: '' },
      gender: 'MALE',
      dateOfBirth: '',
      placeOfBirth: { en: '', gu: '', hi: '' },
      email: '',
      phone: '',
      address: { en: '', gu: '', hi: '' },
      occupation: { en: '', gu: '', hi: '' },
      company: { en: '', gu: '', hi: '' },
      maritalStatus: 'UNKNOWN',
      photoUrl: '',
      bio: { en: '', gu: '', hi: '' },
      familyId: '',
    },
  });

  const [loading, setLoading] = useState(false);
  const [families, setFamilies] = useState<any[]>([]);

  useEffect(() => {
    const fetchFamilies = async () => {
      try {
        const response = await api.get('/families');
        setFamilies(response.data);
      } catch (err) {
        console.error('Failed to fetch families:', err);
      }
    };
    fetchFamilies();
  }, []);

  const onSubmit = async (data: PersonForm) => {
    try {
      setLoading(true);

      // Clean up empty objects
      const cleanData = {
        ...data,
        middleName: Object.values(data.middleName || {}).some(v => v) ? data.middleName : undefined,
        placeOfBirth: Object.values(data.placeOfBirth || {}).some(v => v) ? data.placeOfBirth : undefined,
        address: Object.values(data.address || {}).some(v => v) ? data.address : undefined,
        occupation: Object.values(data.occupation || {}).some(v => v) ? data.occupation : undefined,
        company: Object.values(data.company || {}).some(v => v) ? data.company : undefined,
        bio: Object.values(data.bio || {}).some(v => v) ? data.bio : undefined,
      };

      await api.post('/persons', cleanData);
      router.push(`/${locale}/families/${data.familyId}`);
    } catch (err) {
      console.error('Failed to create person:', err);
      alert('Failed to create person. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-4xl mx-auto px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Add New Family Member</h1>
          <p className="text-gray-600 mt-1">Fill in the details to add a new person to your family tree</p>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-4xl mx-auto px-8 py-8">
        <div className="bg-white rounded-lg shadow-md p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* Family Selection */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Family</h2>
              <select
                {...register('familyId', { required: 'Please select a family' })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select a family...</option>
                {families.map((family) => (
                  <option key={family.id} value={family.id}>
                    {family.name?.en || 'Unnamed Family'}
                  </option>
                ))}
              </select>
              {errors.familyId && (
                <p className="text-red-600 text-sm mt-1">{errors.familyId.message}</p>
              )}
            </div>

            {/* Basic Information */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                {/* First Name - English */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    First Name (English) *
                  </label>
                  <input
                    type="text"
                    {...register('firstName.en', { required: 'First name is required' })}
                    placeholder="e.g., Raj"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                  {errors.firstName?.en && (
                    <p className="text-red-600 text-xs mt-1">{errors.firstName.en.message}</p>
                  )}
                </div>

                {/* First Name - Gujarati */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    પ્રથમ નામ (Gujarati)
                  </label>
                  <input
                    type="text"
                    {...register('firstName.gu')}
                    placeholder="ગુજરાતીમાં નામ"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>

                {/* First Name - Hindi */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    पहला नाम (Hindi)
                  </label>
                  <input
                    type="text"
                    {...register('firstName.hi')}
                    placeholder="हिंदी में नाम"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                {/* Middle Name - English */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Middle Name (English)
                  </label>
                  <input
                    type="text"
                    {...register('middleName.en')}
                    placeholder="Optional"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>

                {/* Middle Name - Gujarati */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    વચ્ચે નામ (Gujarati)
                  </label>
                  <input
                    type="text"
                    {...register('middleName.gu')}
                    placeholder="વૈકલ્પિક"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>

                {/* Middle Name - Hindi */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    बीच का नाम (Hindi)
                  </label>
                  <input
                    type="text"
                    {...register('middleName.hi')}
                    placeholder="वैकल्पिक"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Last Name - English */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name (English) *
                  </label>
                  <input
                    type="text"
                    {...register('lastName.en', { required: 'Last name is required' })}
                    placeholder="e.g., Halani"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                  {errors.lastName?.en && (
                    <p className="text-red-600 text-xs mt-1">{errors.lastName.en.message}</p>
                  )}
                </div>

                {/* Last Name - Gujarati */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    અટક (Gujarati)
                  </label>
                  <input
                    type="text"
                    {...register('lastName.gu')}
                    placeholder="ગુજરાતીમાં અટક"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>

                {/* Last Name - Hindi */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    अंतिम नाम (Hindi)
                  </label>
                  <input
                    type="text"
                    {...register('lastName.hi')}
                    placeholder="हिंदी में अंतिम नाम"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Personal Details */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Personal Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                {/* Gender */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Gender
                  </label>
                  <select
                    {...register('gender')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  >
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>

                {/* Date of Birth */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    {...register('dateOfBirth')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Place of Birth - English */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Place of Birth (English)
                  </label>
                  <input
                    type="text"
                    {...register('placeOfBirth.en')}
                    placeholder="e.g., Ahmedabad"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>

                {/* Place of Birth - Gujarati */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    જન્મ સ્થાન (Gujarati)
                  </label>
                  <input
                    type="text"
                    {...register('placeOfBirth.gu')}
                    placeholder="ગુજરાતીમાં સ્થાન"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>

                {/* Place of Birth - Hindi */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    जन्म स्थान (Hindi)
                  </label>
                  <input
                    type="text"
                    {...register('placeOfBirth.hi')}
                    placeholder="हिंदी में स्थान"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    {...register('email')}
                    placeholder="e.g., raj@example.com"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone
                  </label>
                  <input
                    type="tel"
                    {...register('phone')}
                    placeholder="e.g., +91-9876543210"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Address */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Address</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Address - English */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address (English)
                  </label>
                  <textarea
                    {...register('address.en')}
                    placeholder="Street, City, State, PIN"
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>

                {/* Address - Gujarati */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    સરનામું (Gujarati)
                  </label>
                  <textarea
                    {...register('address.gu')}
                    placeholder="ગુજરાતીમાં સરનામું"
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>

                {/* Address - Hindi */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    पता (Hindi)
                  </label>
                  <textarea
                    {...register('address.hi')}
                    placeholder="हिंदी में पता"
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Professional Information */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Professional Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                {/* Occupation - English */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Occupation (English)
                  </label>
                  <input
                    type="text"
                    {...register('occupation.en')}
                    placeholder="e.g., Software Engineer"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>

                {/* Occupation - Gujarati */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    વ્યવસાય (Gujarati)
                  </label>
                  <input
                    type="text"
                    {...register('occupation.gu')}
                    placeholder="ગુજરાતીમાં વ્યવસાય"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>

                {/* Occupation - Hindi */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    व्यवसाय (Hindi)
                  </label>
                  <input
                    type="text"
                    {...register('occupation.hi')}
                    placeholder="हिंदी में व्यवसाय"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Company - English */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Company (English)
                  </label>
                  <input
                    type="text"
                    {...register('company.en')}
                    placeholder="e.g., Tech Corp"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>

                {/* Company - Gujarati */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    કંપની (Gujarati)
                  </label>
                  <input
                    type="text"
                    {...register('company.gu')}
                    placeholder="ગુજરાતીમાં કંપની"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>

                {/* Company - Hindi */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    कंपनी (Hindi)
                  </label>
                  <input
                    type="text"
                    {...register('company.hi')}
                    placeholder="हिंदी में कंपनी"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Additional Information */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Additional Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                {/* Marital Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Marital Status
                  </label>
                  <select
                    {...register('maritalStatus')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  >
                    <option value="UNKNOWN">Unknown</option>
                    <option value="SINGLE">Single</option>
                    <option value="MARRIED">Married</option>
                    <option value="DIVORCED">Divorced</option>
                    <option value="WIDOWED">Widowed</option>
                  </select>
                </div>

                {/* Photo URL */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Photo URL
                  </label>
                  <input
                    type="url"
                    {...register('photoUrl')}
                    placeholder="https://example.com/photo.jpg"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Bio - English */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bio (English)
                  </label>
                  <textarea
                    {...register('bio.en')}
                    placeholder="Brief biography"
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>

                {/* Bio - Gujarati */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    જીવનચરિત્ર (Gujarati)
                  </label>
                  <textarea
                    {...register('bio.gu')}
                    placeholder="ગુજરાતીમાં જીવનચરિત્ર"
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>

                {/* Bio - Hindi */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    जीवनी (Hindi)
                  </label>
                  <textarea
                    {...register('bio.hi')}
                    placeholder="हिंदी में जीवनी"
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-4 pt-6 border-t border-gray-200">
              <Button
                type="submit"
                disabled={loading}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                {loading ? 'Adding...' : 'Add Member'}
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
