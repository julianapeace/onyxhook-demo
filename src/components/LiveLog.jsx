import React, { useEffect, useRef } from 'react'
import { Activity, Ghost, Trash2 } from 'lucide-react'

const TYPE_CONFIG = {
  swap: { label: 'SWAP', bg: 'rgba(124,58,237,0.18)', border: 'rgba(124,58,237,0.35)', color: '#a78bfa' },
  add: { label: 'ADD', bg: 'rgba(16,185,129,0.15)', border: 'rgba(16,185,129,0.35)', color: '#10b981' },
  remove: { label: 'REM', bg: 'rgba(245,158,11,0.15)', border: 'rgba(245,158,11,0.35)', color: '#f59e0b' },
  error: { label: 'ERR', bg: 'rgba(239,68,68,0.15)', border: 'rgba(239,68,68,0.35)', color: '#ef4444' },
  info: { label: 'INFO', bg: 'rgba(107,114,128,0.18)', border: 'rgba(107,114,128,0.3)', color: '#9ca3af' }
}

function TypeBadge({ type }) {
  const cfg = TYPE_CONFIG[type] || TYPE_CONFIG.info
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      padding: '1px 7px',
      borderRadius: '4px',
      fontSize: '10px',
      fontWeight: '700',
      letterSpacing: '0.05em',
      backgroundColor: cfg.bg,
      border: `1px solid ${cfg.border}`,
      color: cfg.color,
      flexShrink: 0,
      fontFamily: 'monospace'
    }}>
      {cfg.label}
    </span>
  )
}

function LogEntry({ entry }) {
  return (
    <div
      className="log-entry"
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '10px',
        padding: '8px 0',
        borderBottom: '1px solid rgba(31,41,55,0.6)'
      }}
    >
      {/* Timestamp */}
      <span style={{
        fontSize: '11px',
        color: '#4b5563',
        fontFamily: 'monospace',
        flexShrink: 0,
        lineHeight: '20px',
        letterSpacing: '-0.01em'
      }}>
        {entry.time}
      </span>

      {/* Badge */}
      <TypeBadge type={entry.type} />

      {/* Message */}
      <span style={{
        fontSize: '12px',
        color: entry.type === 'error' ? '#f87171' : '#d1d5db',
        lineHeight: 1.5,
        wordBreak: 'break-word',
        fontFamily: entry.type === 'error' ? 'monospace' : 'inherit'
      }}>
        {entry.message}
      </span>
    </div>
  )
}

export default function LiveLog({ logs, onClear }) {
  const bottomRef = useRef(null)
  const containerRef = useRef(null)

  // Auto-scroll to bottom on new logs
  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }
  }, [logs.length])

  return (
    <div style={{
      backgroundColor: '#0f1117',
      border: '1px solid #1f2937',
      borderRadius: '16px',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Header */}
      <div style={{
        padding: '20px 24px',
        borderBottom: '1px solid #1f2937',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'linear-gradient(180deg, #13131f 0%, #0f1117 100%)',
        flexShrink: 0
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '32px', height: '32px', borderRadius: '8px',
            background: 'rgba(124,58,237,0.12)',
            border: '1px solid rgba(124,58,237,0.25)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <Activity size={15} color="#7c3aed" />
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#f9fafb' }}>
              Activity Log
            </h2>
            <p style={{ margin: 0, fontSize: '12px', color: '#6b7280' }}>
              {logs.length} {logs.length === 1 ? 'entry' : 'entries'}
            </p>
          </div>
        </div>

        {/* Clear button */}
        {logs.length > 0 && (
          <button
            onClick={onClear}
            style={{
              display: 'flex', alignItems: 'center', gap: '5px',
              padding: '6px 12px', borderRadius: '6px',
              border: '1px solid #374151',
              backgroundColor: 'transparent',
              color: '#6b7280', cursor: 'pointer', fontSize: '12px', fontWeight: '500',
              transition: 'all 0.15s'
            }}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(239,68,68,0.1)'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.3)'; e.currentTarget.style.color = '#ef4444' }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.borderColor = '#374151'; e.currentTarget.style.color = '#6b7280' }}
          >
            <Trash2 size={12} />
            Clear
          </button>
        )}
      </div>

      {/* Log list */}
      <div
        ref={containerRef}
        style={{
          maxHeight: '300px',
          overflowY: 'auto',
          padding: '0 24px',
          flexGrow: 1
        }}
      >
        {logs.length === 0 ? (
          /* Empty state */
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', padding: '40px 20px', gap: '12px',
            textAlign: 'center'
          }}>
            <div style={{
              width: '48px', height: '48px', borderRadius: '12px',
              backgroundColor: '#1f2937',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <Ghost size={24} color="#4b5563" />
            </div>
            <p style={{ margin: 0, fontSize: '13px', color: '#6b7280', lineHeight: 1.5 }}>
              No activity yet.<br />
              Use the Action Panel to simulate hook interactions.
            </p>
          </div>
        ) : (
          <div>
            {logs.map(entry => (
              <LogEntry key={entry.id} entry={entry} />
            ))}
            <div ref={bottomRef} style={{ height: '8px' }} />
          </div>
        )}
      </div>

      {/* Live indicator footer */}
      {logs.length > 0 && (
        <div style={{
          padding: '8px 24px',
          borderTop: '1px solid #1f2937',
          backgroundColor: '#0a0a0f',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          flexShrink: 0
        }}>
          <div style={{
            width: '6px', height: '6px', borderRadius: '50%',
            backgroundColor: '#10b981',
            animation: 'pulse-dot 2s ease-in-out infinite'
          }} />
          <span style={{ fontSize: '11px', color: '#4b5563' }}>Live — streaming hook events</span>
        </div>
      )}
    </div>
  )
}
