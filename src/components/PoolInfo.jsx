import React, { useState } from 'react'
import { Settings, Copy, Check } from 'lucide-react'

function truncateAddr(addr, front = 6, back = 4) {
  if (!addr || addr === '0x0000000000000000000000000000000000000000') return '—'
  if (addr.length <= front + back + 3) return addr
  return `${addr.slice(0, front)}…${addr.slice(-back)}`
}

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async (e) => {
    e.stopPropagation()
    if (!text || text === '—') return
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // fallback
      const ta = document.createElement('textarea')
      ta.value = text
      ta.style.position = 'fixed'
      ta.style.opacity = '0'
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <button
      onClick={handleCopy}
      title={copied ? 'Copied!' : 'Copy to clipboard'}
      style={{
        border: 'none',
        background: copied ? 'rgba(16,185,129,0.15)' : 'rgba(124,58,237,0.12)',
        borderRadius: '5px',
        padding: '3px 5px',
        cursor: 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        transition: 'all 0.2s',
        color: copied ? '#10b981' : '#7c3aed'
      }}
    >
      {copied ? <Check size={12} /> : <Copy size={12} />}
    </button>
  )
}

function InfoRow({ label, children, mono = false }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '10px 0',
      borderBottom: '1px solid #1f293750'
    }}>
      <span style={{ fontSize: '12px', color: '#9ca3af', flexShrink: 0 }}>{label}</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginLeft: '12px', minWidth: 0 }}>
        <span style={{
          fontSize: '13px',
          color: '#f9fafb',
          fontFamily: mono ? 'monospace' : 'inherit',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap'
        }}>
          {children}
        </span>
      </div>
    </div>
  )
}

function AddressRow({ label, address }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '10px 0',
      borderBottom: '1px solid #1f293750'
    }}>
      <span style={{ fontSize: '12px', color: '#9ca3af', flexShrink: 0 }}>{label}</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginLeft: '12px' }}>
        <code style={{ fontSize: '12px', color: '#a78bfa', fontFamily: 'monospace' }}>
          {truncateAddr(address)}
        </code>
        <CopyButton text={address} />
      </div>
    </div>
  )
}

export default function PoolInfo({ poolInfo }) {
  const fee = poolInfo?.fee ?? 3000
  const feeFormatted = `${(fee / 10000).toFixed(2)}%`
  const tickSpacing = poolInfo?.tickSpacing ?? 60

  return (
    <div style={{
      backgroundColor: '#0f1117',
      border: '1px solid #1f2937',
      borderRadius: '16px',
      overflow: 'hidden'
    }}>
      {/* Header */}
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
            background: 'rgba(124,58,237,0.12)',
            border: '1px solid rgba(124,58,237,0.25)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <Settings size={15} color="#7c3aed" />
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#f9fafb' }}>
              Pool Configuration
            </h2>
            <p style={{ margin: 0, fontSize: '12px', color: '#6b7280' }}>Static pool parameters</p>
          </div>
        </div>

        {/* Network badge */}
        <div style={{
          padding: '4px 10px',
          borderRadius: '20px',
          backgroundColor: 'rgba(245,158,11,0.12)',
          border: '1px solid rgba(245,158,11,0.25)'
        }}>
          <span style={{ fontSize: '11px', fontWeight: '600', color: '#f59e0b' }}>Anvil Local</span>
        </div>
      </div>

      {/* Info rows */}
      <div style={{ padding: '4px 24px 8px' }}>
        <InfoRow label="Fee Tier">
          <span style={{
            backgroundColor: 'rgba(124,58,237,0.15)',
            border: '1px solid rgba(124,58,237,0.3)',
            borderRadius: '5px',
            padding: '1px 8px',
            color: '#a78bfa',
            fontSize: '12px',
            fontFamily: 'monospace',
            fontWeight: '600'
          }}>
            {feeFormatted}
          </span>
        </InfoRow>

        <InfoRow label="Tick Spacing">
          <span style={{
            backgroundColor: 'rgba(79,70,229,0.15)',
            border: '1px solid rgba(79,70,229,0.3)',
            borderRadius: '5px',
            padding: '1px 8px',
            color: '#818cf8',
            fontSize: '12px',
            fontFamily: 'monospace',
            fontWeight: '600'
          }}>
            {tickSpacing}
          </span>
        </InfoRow>

        {/* Token0 */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 0',
          borderBottom: '1px solid #1f293750'
        }}>
          <span style={{ fontSize: '12px', color: '#9ca3af' }}>Token 0</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{
              fontSize: '11px', fontWeight: '700', color: '#f9fafb',
              backgroundColor: '#1f2937', borderRadius: '4px', padding: '1px 6px'
            }}>
              {poolInfo?.token0?.symbol || 'TOKEN0'}
            </span>
            <code style={{ fontSize: '12px', color: '#a78bfa', fontFamily: 'monospace' }}>
              {truncateAddr(poolInfo?.token0?.address)}
            </code>
            <CopyButton text={poolInfo?.token0?.address} />
          </div>
        </div>

        {/* Token1 */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 0',
          borderBottom: '1px solid #1f293750'
        }}>
          <span style={{ fontSize: '12px', color: '#9ca3af' }}>Token 1</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{
              fontSize: '11px', fontWeight: '700', color: '#f9fafb',
              backgroundColor: '#1f2937', borderRadius: '4px', padding: '1px 6px'
            }}>
              {poolInfo?.token1?.symbol || 'TOKEN1'}
            </span>
            <code style={{ fontSize: '12px', color: '#a78bfa', fontFamily: 'monospace' }}>
              {truncateAddr(poolInfo?.token1?.address)}
            </code>
            <CopyButton text={poolInfo?.token1?.address} />
          </div>
        </div>

        {/* Hook address */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 0',
          borderBottom: '1px solid #1f293750'
        }}>
          <span style={{ fontSize: '12px', color: '#9ca3af' }}>Hook</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{
              width: '8px', height: '8px', borderRadius: '50%',
              backgroundColor: '#7c3aed',
              boxShadow: '0 0 6px #7c3aed'
            }} />
            <code style={{ fontSize: '12px', color: '#a78bfa', fontFamily: 'monospace' }}>
              {truncateAddr(poolInfo?.onyxHook)}
            </code>
            <CopyButton text={poolInfo?.onyxHook} />
          </div>
        </div>

        {/* Pool ID */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 0'
        }}>
          <span style={{ fontSize: '12px', color: '#9ca3af' }}>Pool ID</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <code style={{ fontSize: '12px', color: '#a78bfa', fontFamily: 'monospace' }}>
              {poolInfo?.poolId
                ? `${poolInfo.poolId.slice(0, 8)}…${poolInfo.poolId.slice(-6)}`
                : '—'}
            </code>
            <CopyButton text={poolInfo?.poolId} />
          </div>
        </div>
      </div>

      {/* Pool manager footer */}
      <div style={{
        padding: '12px 24px',
        borderTop: '1px solid #1f2937',
        backgroundColor: '#0a0a0f'
      }}>
        <div style={{ fontSize: '11px', color: '#6b7280', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Pool Manager
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <code style={{ fontSize: '12px', color: '#a78bfa', fontFamily: 'monospace' }}>
            {truncateAddr(poolInfo?.poolManager, 10, 8)}
          </code>
          <CopyButton text={poolInfo?.poolManager} />
        </div>
      </div>
    </div>
  )
}
