import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Hexagon, Wifi, WifiOff, RefreshCw } from 'lucide-react'
import HookCounters from './components/HookCounters.jsx'
import PoolInfo from './components/PoolInfo.jsx'
import ActionPanel from './components/ActionPanel.jsx'
import LiveLog from './components/LiveLog.jsx'

const DEFAULT_HOOK_COUNTS = {
  beforeSwap: 0,
  afterSwap: 0,
  beforeAddLiquidity: 0,
  afterAddLiquidity: 0,
  beforeRemoveLiquidity: 0,
  afterRemoveLiquidity: 0
}

const DEFAULT_POOL_INFO = {
  token0: { symbol: 'TOKEN0', address: '0x0000000000000000000000000000000000000000' },
  token1: { symbol: 'TOKEN1', address: '0x0000000000000000000000000000000000000001' },
  fee: 3000,
  tickSpacing: 60,
  poolId: '0x0000000000000000000000000000000000000000000000000000000000000000',
  poolManager: '0x0000000000000000000000000000000000000000',
  onyxHook: '0x0000000000000000000000000000000000000000'
}

function genId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}

function makeLog(type, message) {
  const now = new Date()
  const pad = n => String(n).padStart(2, '0')
  const time = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`
  return { id: genId(), time, type, message }
}

export default function App() {
  const [hookCounts, setHookCounts] = useState(DEFAULT_HOOK_COUNTS)
  const [poolInfo, setPoolInfo] = useState(DEFAULT_POOL_INFO)
  const [logs, setLogs] = useState([])
  const [connected, setConnected] = useState(false)
  const [loading, setLoading] = useState(false)
  const [autoRefresh, setAutoRefresh] = useState(true)
  const intervalRef = useRef(null)
  const prevCounts = useRef(DEFAULT_HOOK_COUNTS)

  const addLog = useCallback((type, message) => {
    setLogs(prev => [...prev.slice(-199), makeLog(type, message)])
  }, [])

  const fetchPoolInfo = useCallback(async () => {
    try {
      const res = await fetch('/api/pool-info')
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      setPoolInfo(data.data || data)
      setConnected(true)
      return true
    } catch (err) {
      setConnected(false)
      addLog('error', `Failed to fetch pool info: ${err.message}`)
      return false
    }
  }, [addLog])

  const fetchHookCounts = useCallback(async (silent = false) => {
    if (!silent) setLoading(true)
    try {
      const res = await fetch('/api/hook-counts')
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      const counts = data.data || data
      setHookCounts(prev => {
        prevCounts.current = prev
        return counts
      })
      setConnected(true)
      return counts
    } catch (err) {
      setConnected(false)
      if (!silent) addLog('error', `Failed to fetch hook counts: ${err.message}`)
      return null
    } finally {
      if (!silent) setLoading(false)
    }
  }, [addLog])

  const refresh = useCallback(async (silent = false) => {
    if (!silent) setLoading(true)
    try {
      await Promise.all([fetchPoolInfo(), fetchHookCounts(true)])
    } finally {
      if (!silent) setLoading(false)
    }
  }, [fetchPoolInfo, fetchHookCounts])

  // Initial load
  useEffect(() => {
    addLog('info', 'Onyx Hook Demo initialized — connecting to backend…')
    refresh(false).then(ok => {
      if (ok !== false) {
        addLog('info', 'Connected to Anvil local node')
      }
    })
  }, []) // eslint-disable-line

  // Auto-refresh interval
  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    if (autoRefresh) {
      intervalRef.current = setInterval(() => {
        fetchHookCounts(true)
      }, 3000)
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [autoRefresh, fetchHookCounts])

  const handleAction = useCallback((type, result) => {
    const typeLabels = { swap: 'Swap', add: 'Add Liquidity', remove: 'Remove Liquidity' }
    const label = typeLabels[type] || type
    if (result && result.success !== false) {
      addLog(type, `${label} simulated: ${result.data?.message || result.message || result.data?.txHash || result.txHash || JSON.stringify(result)}`)
    } else {
      addLog('error', `${label} failed: ${result?.error || result?.message || 'Unknown error'}`)
    }
    // Refresh counts after action
    setTimeout(() => fetchHookCounts(true), 800)
  }, [addLog, fetchHookCounts])

  const clearLogs = useCallback(() => {
    setLogs([])
  }, [])

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0a0a0f', color: '#f9fafb' }}>
      {/* Header */}
      <header style={{ borderBottom: '1px solid #1f2937', backgroundColor: '#0d0d14' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '64px' }}>
            {/* Logo + Title */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '40px', height: '40px', borderRadius: '10px',
                background: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 0 20px rgba(124,58,237,0.3)'
              }}>
                <Hexagon size={22} color="#fff" fill="rgba(255,255,255,0.15)" />
              </div>
              <div>
                <div style={{ fontSize: '18px', fontWeight: '700', color: '#f9fafb', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
                  Onyx Hook Demo
                </div>
                <div style={{ fontSize: '12px', color: '#6b7280', fontFamily: 'monospace' }}>
                  Uniswap v4 Counter Hook
                </div>
              </div>
            </div>

            {/* Right side controls */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              {/* Auto-refresh toggle */}
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', userSelect: 'none' }}>
                <span style={{ fontSize: '13px', color: '#9ca3af' }}>Auto-refresh</span>
                <button
                  onClick={() => setAutoRefresh(v => !v)}
                  style={{
                    width: '44px', height: '24px', borderRadius: '12px', border: 'none', cursor: 'pointer',
                    backgroundColor: autoRefresh ? '#7c3aed' : '#374151',
                    position: 'relative', transition: 'background-color 0.2s',
                    padding: 0
                  }}
                  aria-label="Toggle auto-refresh"
                >
                  <span style={{
                    position: 'absolute', top: '3px',
                    left: autoRefresh ? '23px' : '3px',
                    width: '18px', height: '18px', borderRadius: '50%',
                    backgroundColor: '#fff',
                    transition: 'left 0.2s',
                    display: 'block'
                  }} />
                </button>
              </label>

              {/* Manual refresh */}
              <button
                onClick={() => refresh(false)}
                disabled={loading}
                style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  padding: '7px 14px', borderRadius: '6px', border: '1px solid #374151',
                  backgroundColor: '#111827', color: '#d1d5db', cursor: loading ? 'not-allowed' : 'pointer',
                  fontSize: '13px', fontWeight: '500', transition: 'all 0.15s', opacity: loading ? 0.6 : 1
                }}
              >
                <RefreshCw size={14} className={loading ? 'spin' : ''} style={loading ? { animation: 'spin 1s linear infinite' } : {}} />
                Refresh
              </button>

              {/* Connection status */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 12px', borderRadius: '20px', backgroundColor: connected ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', border: `1px solid ${connected ? 'rgba(16,185,129,0.25)' : 'rgba(239,68,68,0.25)'}` }}>
                {connected ? (
                  <Wifi size={14} color="#10b981" />
                ) : (
                  <WifiOff size={14} color="#ef4444" />
                )}
                <div style={{
                  width: '7px', height: '7px', borderRadius: '50%',
                  backgroundColor: connected ? '#10b981' : '#ef4444',
                  animation: connected ? 'pulse-dot 2s ease-in-out infinite' : 'none'
                }} className={connected ? 'pulse-dot' : ''} />
                <span style={{ fontSize: '13px', fontWeight: '500', color: connected ? '#10b981' : '#ef4444' }}>
                  {connected ? 'Connected' : 'Disconnected'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main style={{ maxWidth: '1280px', margin: '0 auto', padding: '32px 24px' }}>
        {/* Desktop 3-column grid, mobile single column */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gridTemplateRows: 'auto auto',
          gap: '24px'
        }}
          className="grid-layout"
        >
          {/* Hook Counters — spans 2 columns */}
          <div style={{ gridColumn: 'span 2' }}>
            <HookCounters
              hookCounts={hookCounts}
              loading={loading}
              poolInfo={poolInfo}
              prevCounts={prevCounts.current}
            />
          </div>

          {/* Pool Info — column 3 */}
          <div style={{ gridColumn: '3' }}>
            <PoolInfo poolInfo={poolInfo} />
          </div>

          {/* Action Panel — spans 2 columns */}
          <div style={{ gridColumn: 'span 2' }}>
            <ActionPanel onAction={handleAction} />
          </div>

          {/* Live Log — column 3 */}
          <div style={{ gridColumn: '3' }}>
            <LiveLog logs={logs} onClear={clearLogs} />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid #1f2937', marginTop: '16px', padding: '24px' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: '11px', color: '#6b7280', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Onyx Hook Contract
              </div>
              <code style={{ fontSize: '12px', color: '#a78bfa', fontFamily: 'monospace' }}>
                {poolInfo.onyxHook}
              </code>
            </div>
            <div>
              <div style={{ fontSize: '11px', color: '#6b7280', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Pool Manager
              </div>
              <code style={{ fontSize: '12px', color: '#a78bfa', fontFamily: 'monospace' }}>
                {poolInfo.poolManager}
              </code>
            </div>
            <div>
              <div style={{ fontSize: '11px', color: '#6b7280', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Network
              </div>
              <span style={{ fontSize: '12px', color: '#f59e0b', fontFamily: 'monospace' }}>
                Anvil Local (Chain ID: 31337)
              </span>
            </div>
            <div>
              <div style={{ fontSize: '11px', color: '#6b7280', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Built With
              </div>
              <span style={{ fontSize: '12px', color: '#9ca3af' }}>
                Uniswap v4 · Foundry · React · Vite
              </span>
            </div>
          </div>
        </div>
      </footer>

      {/* Responsive styles injected */}
      <style>{`
        @media (max-width: 900px) {
          .grid-layout {
            grid-template-columns: 1fr !important;
          }
          .grid-layout > div {
            grid-column: 1 !important;
          }
        }
      `}</style>
    </div>
  )
}
