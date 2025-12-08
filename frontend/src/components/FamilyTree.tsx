'use client';

import React, { useCallback, useState, useEffect } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  NodeTypes,
  MarkerType,
  useReactFlow,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { PersonNode } from './PersonNode';
import { api } from '@/lib/api';

const nodeTypes: NodeTypes = {
  person: PersonNode,
};

interface FamilyMember {
  id: string;
  firstName: Record<string, string>;
  lastName: Record<string, string>;
  gender: string;
  dateOfBirth: string;
  maritalStatus: string;
  photoUrl?: string;
}

interface Relationship {
  id: string;
  personAId: string;
  personBId: string;
  relationType: string;
  marriageDate?: string;
}

interface FamilyTreeProps {
  familyId: string;
}

export const FamilyTree: React.FC<FamilyTreeProps> = ({ familyId }) => {
  const { fitView } = useReactFlow();
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [familyRes, treeRes] = await Promise.all([
          api.get(`/families/${familyId}`),
          api.get(`/relationships/family-tree/${familyId}`),
        ]);

        const familyData = familyRes.data;
        const relationships = treeRes.data;

        // Generate nodes
        const newNodes: Node[] = (familyData.members || []).map((member: FamilyMember) => ({
          id: member.id,
          data: {
            label: `${member.firstName?.en || ''} ${member.lastName?.en || ''}`,
            image: member.photoUrl,
            gender: member.gender,
            maritalStatus: member.maritalStatus,
          },
          position: { x: 0, y: 0 },
          type: 'person',
        }));

        // Generate edges
        const newEdges: Edge[] = (relationships || []).map((rel: Relationship) => ({
          id: `${rel.personAId}-${rel.personBId}`,
          source: rel.personAId,
          target: rel.personBId,
          label: rel.relationType,
          markerEnd: { type: MarkerType.ArrowClosed },
          animated: false,
          style: { stroke: '#666' },
        }));

        setNodes(newNodes);
        setEdges(newEdges);

        setTimeout(() => fitView(), 0);
      } catch (error) {
        console.error('Failed to fetch family tree data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [familyId, setNodes, setEdges, fitView]);

  if (loading) {
    return <div className="w-full h-screen flex items-center justify-center">Loading family tree...</div>;
  }

  return (
    <div className="w-full h-screen">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
      >
        <Background />
        <Controls />
        <MiniMap pannable zoomable />
      </ReactFlow>
    </div>
  );
};
