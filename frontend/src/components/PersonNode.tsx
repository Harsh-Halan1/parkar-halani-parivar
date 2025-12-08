'use client';

import React from 'react';
import { Handle, Position } from 'reactflow';

interface PersonNodeProps {
  data: {
    label: string;
    image?: string;
    gender: string;
    maritalStatus: string;
  };
}

export const PersonNode: React.FC<PersonNodeProps> = ({ data }) => {
  const bgColor = data.gender === 'MALE' ? 'bg-blue-50' : 'bg-pink-50';
  const borderColor = data.gender === 'MALE' ? 'border-blue-300' : 'border-pink-300';

  return (
    <div className={`${bgColor} ${borderColor} border-2 rounded-lg p-3 min-w-[200px]`}>
      <Handle type="target" position={Position.Top} />

      {data.image && (
        <img
          src={data.image}
          alt={data.label}
          className="w-16 h-16 rounded-full mx-auto mb-2 object-cover"
        />
      )}

      <div className="text-center">
        <div className="font-semibold text-sm text-gray-800 truncate">
          {data.label}
        </div>
        <div className="text-xs text-gray-600 mt-1">
          {data.maritalStatus ? `Marital: ${data.maritalStatus}` : 'Single'}
        </div>
      </div>

      <Handle type="source" position={Position.Bottom} />
    </div>
  );
};
