import React, { useState, useEffect, useRef } from 'react'
import { RefreshCw, Zap, PlusCircle, MinusCircle, CheckCircle, AlertTriangle } from 'lucide-react'

function truncateAddress(addr) {
  if (!addr || addr.length < 10) return addr || '—'
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`
}

function AnimatedCount({ value, prev }) {
  const [bumping, setBumping] = useState(false)
  const isFirstRender = useRef(true)

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    if (value !== prev) {
      setBumping(true)
      const t = setTimeout(() => setBumping(false), 400)
      return () => clearTimeout(t)
    }
  }, [value, prev])

  return (
    <span
      style={{
        fontSize: '42px',
        fontWeight: '800',
        color: bumping ? '#a78bfa' : '#f9fafb',
        fontVariantNumeric: 'tabular-nums',
        letterSpacing: '-0.03em',
        lineHeight: 1,
        display: 'inline-block',
        transition: 'color 0.3s ease',
        transform: bumping ? 'scale(1.2)' : 'scale(1)',
        transformOrigin: 'center',
        transitionProperty: 'transform, color',
        transitionDuration: bumping ? '0.15s' : '0.25s'
      }}
    >
      {typeof value === 'number' ? value.toLocaleString() : '—'}
    </span>
  )
}

function HookPair({ label, icon: Icon, beforeKey, afterKey, hookCounts, prevCounts, accentBefore, accentAfter }) {
  const beforeVal = hookCounts[beforeKey] ?? 0
  const afterVal = hookCounts[afterKey] ?? 0
  const prevBefore = prevCounts[beforeKey] ?? 0
  const prevAfter = prevCounts[afterKey] ?? 0
  const balanced = beforeVal === afterVal

  return (
    <div style={{
      backgroundColor: '#111827',
      border: '1px solid #1f2937',
      borderRadius: '12px',
      padding: '20px',
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
      transition: 'border-color 0.2s'
    }}>
      {/* Pair header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Icon size={16} color="#7c3aed" />
          <span style={{ fontSize: '14px', fontWeight: '600', color: '#e5e7eb' }}>{label}</span>
        </div>
        {/* Balanced / Mismatch badge */}
        {balanced ? (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '4px',
            padding: '3px 10px', borderRadius: '20px',
            backgroundColor: 'rgba(16,185,129,0.12)',
            border: '1px solid rgba(16,185,129,0.25)'
          }}>
            <CheckCircle size={11} color="#10b981" />
            <span style={{ fontSize: '11px', fontWeight: '600', color: '#10b981' }}>Balanced</span>
          </div>
        ) : (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '4px',
            padding: '3px 10px', borderRadius: '20px',
            backgroundColor: 'rgba(245,158,11,0.12)',
            border: '1px solid rgba(245,158,11,0.25)'
          }}>
            <AlertTriangle size={11} color="#f59e0b" />
            <span style={{ fontSize: '11px', fontWeight: '600', color: '#f59e0b' }}>Mismatch</span>
          </div>
        )}
      </div>

      {/* Two counters side by side */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        {/* Before */}
        <div style={{
          backgroundColor: '#0d0d14',
          border: `1px solid ${accentBefore}33`,
          borderRadius: '8px',
          padding: '16px 14px',
          display: 'flex', flexDirection: 'column', gap: '8px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <code style={{ fontSize: '10px', color: accentBefore, fontFamily: 'monospace', letterSpacing: '-0.01em' }}>
              {beforeKey}
            </code>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: accentBefore, opacity: 0.7 }} />
          </div>
          <AnimatedCount value={beforeVal} prev={prevBefore} />
          <div style={{ fontSize: '11px', color: '#6b7280' }}>calls</div>
        </div>

        {/* After */}
        <div style={{
          backgroundColor: '#0d0d14',
          border: `1px solid ${accentAfter}33`,
          borderRadius: '8px',
          padding: '16px 14px',
          display: 'flex', flexDirection: 'column', gap: '8px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <code style={{ fontSize: '10px', color: accentAfter, fontFamily: 'monospace', letterSpacing: '-0.01em' }}>
              {afterKey}
            </code>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: accentAfter, opacity: 0.7 }} />
          </div>
          <AnimatedCount value={afterVal} prev={prevAfter} />
          <div style={{ fontSize: '11px', color: '#6b7280' }}>calls</div>
        </div>
      </div>
    </div>
  )
}

export default function HookCounters({ hookCounts, loading, poolInfo, prevCounts }) {
  const totalCalls = Object.values(hookCounts).reduce((a, b) => a + (b || 0), 0)

  return (
    <div style={{
      backgroundColor: '#0f1117',
      border: '1px solid #1f2937',
      borderRadius: '16px',
      overflow: 'hidden'
    }}>
      {/* Panel header */}
      <div style={{
        padding: '20px 24px',
        borderBottom: '1px solid #1f2937',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'linear-gradient(180deg, #13131f 0%, #0f1117 100%)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '32px', height: '32px', borderRadius: '8px',
            background: 'linear-gradient(135deg, #7c3aed22 0%, #4f46e522 100%)',
            border: '1px solid #7c3aed44',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <RefreshCw
              size={15}
              color="#7c3aed"
              style={loading ? { animation: 'spin 1s linear infinite' } : {}}
            />
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#f9fafb' }}>
              Hook Call Counters
            </h2>
            <p style={{ margin: 0, fontSize: '12px', color: '#6b7280' }}>
              Real-time Uniswap v4 hook invocation tracking
            </p>
          </div>
        </div>

        {/* Total badge */}
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px'
        }}>
          <span style={{ fontSize: '24px', fontWeight: '800', color: '#a78bfa', lineHeight: 1 }}>
            {totalCalls.toLocaleString()}
          </span>
          <span style={{ fontSize: '11px', color: '#6b7280' }}>total calls</span>
        </div>
      </div>

      {/* Counter grid */}
      <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <HookPair
          label="Swap Hooks"
          icon={Zap}
          beforeKey="beforeSwap"
          afterKey="afterSwap"
          hookCounts={hookCounts}
          prevCounts={prevCounts}
          accentBefore="#f59e0b"
          accentAfter="#10b981"
        />
        <HookPair
          label="Add Liquidity Hooks"
          icon={PlusCircle}
          beforeKey="beforeAddLiquidity"
          afterKey="afterAddLiquidity"
          hookCounts={hookCounts}
          prevCounts={prevCounts}
          accentBefore="#f59e0b"
          accentAfter="#10b981"
        />
        <HookPair
          label="Remove Liquidity Hooks"
          icon={MinusCircle}
          beforeKey="beforeRemoveLiquidity"
          afterKey="afterRemoveLiquidity"
          hookCounts={hookCounts}
          prevCounts={prevCounts}
          accentBefore="#f59e0b"
          accentAfter="#10b981"
        />
      </div>

      {/* Pool ID footer */}
      {poolInfo?.poolId && (
        <div style={{
          padding: '12px 24px',
          borderTop: '1px solid #1f2937',
          backgroundColor: '#0a0a0f',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <span style={{ fontSize: '11px', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Pool ID
          </span>
          <code style={{ fontSize: '12px', color: '#a78bfa', fontFamily: 'monospace' }}>
            {truncateAddress(poolInfo.poolId.length > 20 ? poolInfo.poolId.slice(0, 10) + '…' + poolInfo.poolId.slice(-8) : poolInfo.poolId)}
          </code>
        </div>
      )}
    </div>
  )
}
