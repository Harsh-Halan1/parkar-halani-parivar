'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

interface Family {
  id: string;
  name: Record<string, string>;
  members?: Array<{ id: string }>;
  headPersonId?: string;
  createdAt?: string;
}

export default function FamiliesPage() {
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;

  const [families, setFamilies] = useState<Family[]>([]);
  const [filteredFamilies, setFilteredFamilies] = useState<Family[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchFamilies = async () => {
      try {
        setLoading(true);
        const response = await api.get('/families');
        setFamilies(response.data);
      } catch (err) {
        console.error('Failed to fetch families:', err);
        setError('Failed to load families');
      } finally {
        setLoading(false);
      }
    };

    fetchFamilies();
  }, []);

  // Filter families based on search
  useEffect(() => {
    if (!searchQuery) {
      setFilteredFamilies(families);
    } else {
      const query = searchQuery.toLowerCase();
      setFilteredFamilies(
        families.filter(
          (f) =>
            f.name?.[locale]?.toLowerCase().includes(query) ||
            f.name?.['en']?.toLowerCase().includes(query) ||
            f.name?.['gu']?.toLowerCase().includes(query) ||
            f.name?.['hi']?.toLowerCase().includes(query)
        )
      );
    }
  }, [searchQuery, families, locale]);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete the family "${name}"? This action cannot be undone.`))
      return;

    try {
      await api.delete(`/families/${id}`);
      setFamilies(families.filter((f) => f.id !== id));
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-56 bg-slate-700 rounded"></div>
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
              <h1 className="text-4xl font-bold text-white">Families</h1>
              <p className="text-slate-400 mt-2">Manage your family groups</p>
            </div>
            <Button onClick={() => router.push(`/${locale}/families/create`)} className="bg-blue-600 hover:bg-blue-700">
              + Create Family
            </Button>
          </div>

          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Search Families</label>
            <Input
              placeholder="Search by family name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-slate-800 border-slate-700 text-white placeholder-slate-500"
            />
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

        {filteredFamilies.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">👨‍👩‍👧‍👦</div>
            <h2 className="text-2xl font-bold text-white mb-2">No families found</h2>
            <p className="text-slate-400 mb-6">
              {searchQuery ? 'Try adjusting your search' : 'Start by creating your first family'}
            </p>
            {!searchQuery && (
              <Button onClick={() => router.push(`/${locale}/families/create`)} className="bg-blue-600 hover:bg-blue-700">
                Create Your First Family
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredFamilies.map((family) => (
              <div
                key={family.id}
                className="bg-slate-800 border border-slate-700 rounded-lg overflow-hidden hover:border-slate-600 transition group"
              >
                {/* Card Header */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-4">
                  <div className="flex items-start">
                    <div className="text-3xl mr-3">👨‍👩‍👧‍👦</div>
                    <div className="flex-1">
                      <h3 className="text-white font-bold text-lg">
                        {family.name?.[locale] || family.name?.['en'] || 'Unnamed Family'}
                      </h3>
                      <p className="text-blue-100 text-sm">
                        {family.members?.length || 0} member{family.members?.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-4 space-y-3">
                  {/* Multilingual Names */}
                  {(family.name?.gu || family.name?.hi) && (
                    <div className="text-sm space-y-1">
                      {family.name?.gu && (
                        <p className="text-slate-400">
                          <span className="font-medium">ગુજરાતી:</span> {family.name.gu}
                        </p>
                      )}
                      {family.name?.hi && (
                        <p className="text-slate-400">
                          <span className="font-medium">हिंदी:</span> {family.name.hi}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Created Date */}
                  {family.createdAt && (
                    <div className="text-xs text-slate-500">
                      Created {new Date(family.createdAt).toLocaleDateString(locale)}
                    </div>
                  )}
                </div>

                {/* Card Footer */}
                <div className="border-t border-slate-700 p-4 flex gap-2">
                  <Link href={`/${locale}/families/${family.id}`} className="flex-1">
                    <Button variant="outline" className="w-full border-slate-600 text-slate-300 hover:bg-slate-700">
                      View
                    </Button>
                  </Link>
                  <Link href={`/${locale}/families/${family.id}/tree`} className="flex-1">
                    <Button variant="outline" className="w-full border-slate-600 text-slate-300 hover:bg-slate-700">
                      Tree
                    </Button>
                  </Link>
                  <Button
                    onClick={() =>
                      handleDelete(family.id, family.name?.[locale] || family.name?.['en'] || 'Family')
                    }
                    className="flex-1 bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-600/50"
                  >
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Stats Footer */}
        {filteredFamilies.length > 0 && (
          <div className="mt-8 text-center text-slate-400 text-sm">
            Showing {filteredFamilies.length} of {families.length} families
          </div>
        )}
      </div>
    </div>
  );
}
