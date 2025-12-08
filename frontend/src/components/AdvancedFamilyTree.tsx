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

interface AdvancedFamilyTreeProps {
  familyId: string;
}

export const AdvancedFamilyTree: React.FC<AdvancedFamilyTreeProps> = ({
  familyId,
}) => {
  const { fitView } = useReactFlow();
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [loading, setLoading] = useState(true);

  // Simple hierarchical layout
  const getLayoutedElements = useCallback(
    (members: FamilyMember[], relationships: Relationship[]) => {
      const nodes: Node[] = [];
      const edges: Edge[] = [];

      // Simple grid layout
      const itemsPerRow = Math.ceil(Math.sqrt(members.length));
      const xSpacing = 250;
      const ySpacing = 200;

      members.forEach((member, index) => {
        const row = Math.floor(index / itemsPerRow);
        const col = index % itemsPerRow;
        const x = col * xSpacing - (itemsPerRow * xSpacing) / 2;
        const y = row * ySpacing;

        nodes.push({
          id: member.id,
          data: {
            label: `${member.firstName?.en || ''} ${member.lastName?.en || ''}`,
            image: member.photoUrl,
            gender: member.gender,
            maritalStatus: member.maritalStatus,
          },
          position: { x, y },
          type: 'person',
        });
      });

      relationships.forEach((rel) => {
        edges.push({
          id: `${rel.personAId}-${rel.personBId}`,
          source: rel.personAId,
          target: rel.personBId,
          label: rel.relationType,
          markerEnd: { type: MarkerType.ArrowClosed },
          animated: false,
          style: { stroke: '#94a3b8', strokeWidth: 2 },
        });
      });

      return { nodes, edges };
    },
    []
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [familyRes, treeRes] = await Promise.all([
          api.get(`/families/${familyId}`),
          api.get(`/relationships/family-tree/${familyId}`),
        ]);

        const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
          familyRes.data.members || [],
          treeRes.data || []
        );

        setNodes(layoutedNodes);
        setEdges(layoutedEdges);

        setTimeout(() => fitView({ padding: 0.2 }), 0);
      } catch (error) {
        console.error('Failed to fetch family tree:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [familyId, getLayoutedElements, setNodes, setEdges, fitView]);

  if (loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading family tree...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-screen bg-gray-50">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
      >
        <Background color="#aaa" gap={16} />
        <Controls />
        <MiniMap pannable zoomable style={{ backgroundColor: 'white' }} />
      </ReactFlow>
    </div>
  );
};
