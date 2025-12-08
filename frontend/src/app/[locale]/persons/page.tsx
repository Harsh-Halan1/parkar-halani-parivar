'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface Person {
  id: string;
  firstName: Record<string, string>;
  lastName: Record<string, string>;
  dateOfBirth?: string;
  familyId: string;
  family?: { name: Record<string, string> };
  email?: string;
  phone?: string;
  relationship?: string;
}

export default function PersonsPage() {
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;

  const [persons, setPersons] = useState<Person[]>([]);
  const [filteredPersons, setFilteredPersons] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFamily, setSelectedFamily] = useState<string>('ALL');
  const [families, setFamilies] = useState<Array<{ id: string; name: Record<string, string> }>>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch families
        const familiesRes = await api.get('/families');
        setFamilies(familiesRes.data);

        // Fetch persons
        const personsRes = await api.get('/persons');
        setPersons(personsRes.data);
      } catch (err) {
        console.error('Failed to fetch data:', err);
        setError('Failed to load persons');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter persons based on search and family selection
  useEffect(() => {
    let filtered = persons;

    // Filter by family
    if (selectedFamily !== 'ALL') {
      filtered = filtered.filter((p) => p.familyId === selectedFamily);
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.firstName?.[locale]?.toLowerCase().includes(query) ||
          p.lastName?.[locale]?.toLowerCase().includes(query) ||
          p.email?.toLowerCase().includes(query)
      );
    }

    setFilteredPersons(filtered);
  }, [searchQuery, selectedFamily, persons, locale]);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this person?')) return;

    try {
      await api.delete(`/persons/${id}`);
      setPersons(persons.filter((p) => p.id !== id));
    } catch (err) {
      console.error('Failed to delete person:', err);
      alert('Failed to delete person');
    }
  };

  const calculateAge = (dateOfBirth?: string) => {
    if (!dateOfBirth) return '—';
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age.toString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-10 bg-slate-700 rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-64 bg-slate-700 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      {/* Header */}
      <div className="border-b border-slate-700 shadow-lg">
        <div className="max-w-6xl mx-auto px-8 py-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-4xl font-bold text-white">Family Members</h1>
              <p className="text-slate-400 mt-2">Manage all family members</p>
            </div>
            <Link href={`/${locale}/persons/create`}>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                + Add Member
              </Button>
            </Link>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Search
              </label>
              <Input
                placeholder="Search by name, email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-slate-800 border-slate-700 text-white placeholder-slate-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Filter by Family
              </label>
              <select
                value={selectedFamily}
                onChange={(e) => setSelectedFamily(e.target.value)}
                className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
              >
                <option value="ALL">All Families</option>
                {families.map((family) => (
                  <option key={family.id} value={family.id}>
                    {family.name?.[locale] || family.name?.['en'] || 'Unknown Family'}
                  </option>
                ))}
              </select>
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

        {filteredPersons.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">👤</div>
            <h2 className="text-2xl font-bold text-white mb-2">No members found</h2>
            <p className="text-slate-400 mb-6">
              {searchQuery || selectedFamily !== 'ALL'
                ? 'Try adjusting your filters'
                : 'Start by adding your first family member'}
            </p>
            {!searchQuery && selectedFamily === 'ALL' && (
              <Link href={`/${locale}/persons/create`}>
                <Button className="bg-blue-600 hover:bg-blue-700">Add First Member</Button>
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPersons.map((person) => (
              <div
                key={person.id}
                className="bg-slate-800 border border-slate-700 rounded-lg overflow-hidden hover:border-slate-600 transition group"
              >
                {/* Card Header */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-4">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-slate-700 rounded-full flex items-center justify-center text-xl mr-4">
                      👤
                    </div>
                    <div className="flex-1">
                      <h3 className="text-white font-bold">
                        {person.firstName?.[locale] || person.firstName?.['en'] || 'Unknown'}{' '}
                        {person.lastName?.[locale] || person.lastName?.['en'] || ''}
                      </h3>
                      <p className="text-blue-100 text-sm">
                        {person.family?.name?.[locale] ||
                          person.family?.name?.['en'] ||
                          'Family Unknown'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-4 space-y-3">
                  {/* Age and DOB */}
                  {person.dateOfBirth && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-400">Age</span>
                      <span className="text-white font-medium">
                        {calculateAge(person.dateOfBirth)} years
                      </span>
                    </div>
                  )}

                  {/* Email */}
                  {person.email && (
                    <div className="flex items-start justify-between text-sm">
                      <span className="text-slate-400">Email</span>
                      <a
                        href={`mailto:${person.email}`}
                        className="text-blue-400 hover:text-blue-300 truncate text-right max-w-[200px]"
                      >
                        {person.email}
                      </a>
                    </div>
                  )}

                  {/* Phone */}
                  {person.phone && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-400">Phone</span>
                      <a href={`tel:${person.phone}`} className="text-blue-400 hover:text-blue-300">
                        {person.phone}
                      </a>
                    </div>
                  )}

                  {/* Relationship */}
                  {person.relationship && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-400">Relationship</span>
                      <span className="text-slate-300 capitalize">{person.relationship}</span>
                    </div>
                  )}
                </div>

                {/* Card Footer */}
                <div className="border-t border-slate-700 p-4 flex gap-2">
                  <Link href={`/${locale}/persons/${person.id}`} className="flex-1">
                    <Button
                      variant="outline"
                      className="w-full border-slate-600 text-slate-300 hover:bg-slate-700"
                    >
                      View
                    </Button>
                  </Link>
                  <Link href={`/${locale}/persons/${person.id}/edit`} className="flex-1">
                    <Button
                      variant="outline"
                      className="w-full border-slate-600 text-slate-300 hover:bg-slate-700"
                    >
                      Edit
                    </Button>
                  </Link>
                  <Button
                    variant="destructive"
                    onClick={() => handleDelete(person.id)}
                    className="bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-600/50"
                  >
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Stats Footer */}
        {filteredPersons.length > 0 && (
          <div className="mt-8 text-center text-slate-400 text-sm">
            Showing {filteredPersons.length} of {persons.length} members
          </div>
        )}
      </div>
    </div>
  );
}
