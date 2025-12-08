'use client';

import React from 'react';
import { ReactFlowProvider } from 'reactflow';
import { FamilyTree } from './FamilyTree';

interface FamilyTreeWrapperProps {
  familyId: string;
}

export const FamilyTreeWrapper: React.FC<FamilyTreeWrapperProps> = ({
  familyId,
}) => {
  return (
    <ReactFlowProvider>
      <FamilyTree familyId={familyId} />
    </ReactFlowProvider>
  );
};
