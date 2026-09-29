// src/components/teleportation/TeleportationMindMap.tsx
import React, { useState } from 'react';
import { TELEPORTATION_MINDMAP, MindMapNode } from './teleportationData';
import { GitFork, ChevronDown, ChevronRight, Info, Sparkles, CheckCircle2 } from 'lucide-react';
import { soundEffects } from '../../audio/soundEffects';

export const TeleportationMindMap: React.FC = () => {
  const [selectedNode, setSelectedNode] = useState<MindMapNode>(TELEPORTATION_MINDMAP);
  const [expandedNodeIds, setExpandedNodeIds] = useState<Set<string>>(
    new Set(['root', 'qubits', 'entanglement', 'measurement', 'classical', 'bob', 'recovery'])
  );

  const toggleExpand = (nodeId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    soundEffects.playGateClick();
    setExpandedNodeIds(prev => {
      const next = new Set(prev);
      if (next.has(nodeId)) {
        next.delete(nodeId);
      } else {
        next.add(nodeId);
      }
      return next;
    });
  };

  const handleSelectNode = (node: MindMapNode) => {
    soundEffects.playStep();
    setSelectedNode(node);
  };

  const renderNode = (node: MindMapNode, level: number = 0) => {
    const isExpanded = expandedNodeIds.has(node.id);
    const hasChildren = node.children && node.children.length > 0;
    const isSelected = selectedNode.id === node.id;

    return (
      <div key={node.id} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div
          onClick={() => handleSelectNode(node)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: level === 0 ? '12px 18px' : '8px 14px',
            background: isSelected
              ? 'linear-gradient(135deg, #1E1B4B 0%, #312E81 100%)'
              : level === 0
              ? '#F8FAFC'
              : '#FFFFFF',
            border: isSelected ? '2px solid #6366F1' : '1px solid #E2E8F0',
            borderRadius: '10px',
            cursor: 'pointer',
            boxShadow: isSelected ? '0 4px 14px rgba(99, 102, 241, 0.25)' : '0 1px 3px rgba(0,0,0,0.02)',
            transition: 'all 0.15s ease',
            color: isSelected ? '#FFFFFF' : '#0F172A',
            width: 'fit-content'
          }}
        >
          {hasChildren && (
            <button
              onClick={(e) => toggleExpand(node.id, e)}
              style={{
                background: 'none',
                border: 'none',
                padding: '2px',
                display: 'flex',
                alignItems: 'center',
                cursor: 'pointer',
                color: isSelected ? '#C7D2FE' : '#64748B'
              }}
            >
              {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </button>
          )}

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{
              fontSize: level === 0 ? '15px' : '13px',
              fontWeight: 700,
              letterSpacing: level === 0 ? '-0.01em' : 'normal'
            }}>
              {node.label}
            </span>
          </div>

          {node.formula && (
            <span style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '11px',
              background: isSelected ? 'rgba(0,0,0,0.3)' : '#F1F5F9',
              color: isSelected ? '#38BDF8' : '#0369A1',
              padding: '2px 6px',
              borderRadius: '4px',
              marginLeft: '4px'
            }}>
              {node.formula}
            </span>
          )}
        </div>

        {/* Child branches */}
        {hasChildren && isExpanded && (
          <div style={{
            marginLeft: '20px',
            paddingLeft: '16px',
            borderLeft: '2px dashed #CBD5E1',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}>
            {node.children!.map(child => renderNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={{
      background: '#FFFFFF',
      border: '1px solid #E2E8F0',
      borderRadius: '16px',
      padding: '28px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.03)'
    }}>
      {/* Title */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <GitFork size={18} color="#4F46E5" />
          <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
            Interactive Protocol Mind Map
          </h3>
        </div>
        <p style={{ fontSize: '13.5px', color: '#64748B', margin: '4px 0 0 0' }}>
          Explore the conceptual topology of quantum teleportation. Click nodes to expand sub-branches and inspect full mathematical details.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '24px', alignItems: 'start' }}>
        {/* Mind Map Tree View */}
        <div style={{
          background: '#FAFAF8',
          border: '1px solid #E2E8F0',
          borderRadius: '12px',
          padding: '20px',
          overflowX: 'auto',
          maxHeight: '520px'
        }}>
          {renderNode(TELEPORTATION_MINDMAP)}
        </div>

        {/* Selected Node Detail Inspector Card */}
        <div style={{
          background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
          borderRadius: '12px',
          padding: '24px',
          color: '#FFFFFF',
          border: '1px solid #334155',
          boxShadow: '0 8px 24px rgba(15, 23, 42, 0.15)',
          position: 'sticky',
          top: '20px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
            <Sparkles size={16} color="#38BDF8" />
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#38BDF8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Concept Inspector
            </span>
          </div>

          <h4 style={{ fontSize: '18px', fontWeight: 800, color: '#F8FAFC', margin: '0 0 10px 0' }}>
            {selectedNode.label}
          </h4>

          {selectedNode.formula && (
            <div style={{
              background: 'rgba(2, 6, 23, 0.7)',
              border: '1px solid #334155',
              borderRadius: '8px',
              padding: '10px 14px',
              marginBottom: '16px',
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '13.5px',
              color: '#38BDF8'
            }}>
              {selectedNode.formula}
            </div>
          )}

          <p style={{ fontSize: '14px', lineHeight: 1.6, color: '#CBD5E1', margin: 0 }}>
            {selectedNode.details}
          </p>

          <div style={{
            marginTop: '20px',
            paddingTop: '16px',
            borderTop: '1px solid #334155',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '12px',
            color: '#94A3B8'
          }}>
            <CheckCircle2 size={14} color="#10B981" />
            <span>Click any node on the left to inspect its role.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
