'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { ReactFlowProvider } from 'reactflow';
import { AdvancedFamilyTree } from '@/components/AdvancedFamilyTree';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export default function FamilyTreePage() {
  const params = useParams();
  const router = useRouter();
  const familyId = params.id as string;

  return (
    <div className="w-full h-screen flex flex-col bg-gradient-to-br from-slate-900 to-slate-800">
      <div className="bg-slate-800 border-b border-slate-700 p-4 flex justify-between items-center shadow-lg">
        <div>
          <h1 className="text-2xl font-bold text-white">Family Tree</h1>
          <p className="text-slate-400">Visualize your family relationships</p>
        </div>
        <Button
          onClick={() => router.back()}
          className="bg-blue-600 hover:bg-blue-700 text-white border-0"
        >
          Back
        </Button>
      </div>

      <div className="flex-1 overflow-hidden">
        <ReactFlowProvider>
          <AdvancedFamilyTree familyId={familyId} />
        </ReactFlowProvider>
      </div>
    </div>
  );
}
