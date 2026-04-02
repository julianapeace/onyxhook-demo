import React, { useState } from 'react'
import { Zap, PlusCircle, MinusCircle } from 'lucide-react'

const TABS = [
  { id: 'swap', label: 'Swap', icon: Zap },
  { id: 'add', label: 'Add Liquidity', icon: PlusCircle },
  { id: 'remove', label: 'Remove Liquidity', icon: MinusCircle }
]

const inputStyle = {
  width: '100%',
  padding: '10px 14px',
  backgroundColor: '#1f2937',
  border: '1px solid #374151',
  borderRadius: '6px',
  color: '#f9fafb',
  fontSize: '14px',
  outline: 'none',
  transition: 'border-color 0.15s',
  fontFamily: 'inherit'
}

const labelStyle = {
  display: 'block',
  fontSize: '12px',
  fontWeight: '500',
  color: '#9ca3af',
  marginBottom: '6px'
}

function Spinner() {
  return (
    <span style={{
      display: 'inline-block',
      width: '14px',
      height: '14px',
      border: '2px solid rgba(255,255,255,0.3)',
      borderTopColor: '#fff',
      borderRadius: '50%',
      animation: 'spin 0.7s linear infinite'
    }} />
  )
}

function Alert({ type, message, onDismiss }) {
  if (!message) return null
  const isSuccess = type === 'success'
  return (
    <div style={{
      padding: '10px 14px',
      borderRadius: '8px',
      backgroundColor: isSuccess ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)',
      border: `1px solid ${isSuccess ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`,
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: '10px',
      animation: 'fadeSlideIn 0.2s ease-out'
    }}>
      <p style={{ margin: 0, fontSize: '13px', color: isSuccess ? '#10b981' : '#f87171', lineHeight: 1.5 }}>
        {message}
      </p>
      <button
        onClick={onDismiss}
        style={{ background: 'none', border: 'none', color: isSuccess ? '#6ee7b7' : '#fca5a5', cursor: 'pointer', fontSize: '16px', lineHeight: 1, padding: 0, flexShrink: 0 }}
      >
        ×
      </button>
    </div>
  )
}

function SwapTab({ onAction }) {
  const [zeroForOne, setZeroForOne] = useState(true)
  const [amount, setAmount] = useState('0.1')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null) // { type: 'success'|'error', message }
  const [focusAmount, setFocusAmount] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!amount || isNaN(parseFloat(amount))) return
    setLoading(true)
    setResult(null)
    try {
      const res = await fetch('/api/swap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ zeroForOne, amountSpecified: amount })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error?.message || data.error || data.message || `HTTP ${res.status}`)
      setResult({ type: 'success', message: data.data?.message || data.message || data.data?.txHash || 'Swap simulated successfully' })
      onAction('swap', data)
    } catch (err) {
      setResult({ type: 'error', message: err.message })
      onAction('swap', { error: err.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Direction toggle */}
      <div>
        <label style={labelStyle}>Direction</label>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            type="button"
            onClick={() => setZeroForOne(true)}
            style={{
              flex: 1, padding: '9px 12px', borderRadius: '6px', cursor: 'pointer',
              fontSize: '13px', fontWeight: '500', transition: 'all 0.15s',
              border: zeroForOne ? '1px solid #7c3aed' : '1px solid #374151',
              backgroundColor: zeroForOne ? 'rgba(124,58,237,0.18)' : '#1f2937',
              color: zeroForOne ? '#a78bfa' : '#9ca3af'
            }}
          >
            Token0 → Token1
          </button>
          <button
            type="button"
            onClick={() => setZeroForOne(false)}
            style={{
              flex: 1, padding: '9px 12px', borderRadius: '6px', cursor: 'pointer',
              fontSize: '13px', fontWeight: '500', transition: 'all 0.15s',
              border: !zeroForOne ? '1px solid #7c3aed' : '1px solid #374151',
              backgroundColor: !zeroForOne ? 'rgba(124,58,237,0.18)' : '#1f2937',
              color: !zeroForOne ? '#a78bfa' : '#9ca3af'
            }}
          >
            Token1 → Token0
          </button>
        </div>
      </div>

      {/* Amount */}
      <div>
        <label style={labelStyle} htmlFor="swap-amount">Amount (ETH)</label>
        <input
          id="swap-amount"
          type="number"
          step="0.01"
          min="0"
          value={amount}
          onChange={e => setAmount(e.target.value)}
          placeholder="0.1"
          required
          style={{
            ...inputStyle,
            borderColor: focusAmount ? '#7c3aed' : '#374151',
            boxShadow: focusAmount ? '0 0 0 3px rgba(124,58,237,0.15)' : 'none'
          }}
          onFocus={() => setFocusAmount(true)}
          onBlur={() => setFocusAmount(false)}
        />
      </div>

      <Alert type={result?.type} message={result?.message} onDismiss={() => setResult(null)} />

      <button
        type="submit"
        disabled={loading}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
          padding: '11px 20px', borderRadius: '8px', border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
          background: loading ? 'linear-gradient(135deg, #5b21b6, #3730a3)' : 'linear-gradient(135deg, #7c3aed, #4f46e5)',
          color: '#fff', fontSize: '14px', fontWeight: '600',
          transition: 'all 0.15s', opacity: loading ? 0.7 : 1,
          boxShadow: loading ? 'none' : '0 2px 12px rgba(124,58,237,0.35)'
        }}
      >
        {loading ? <Spinner /> : <Zap size={15} />}
        {loading ? 'Simulating…' : 'Simulate Swap'}
      </button>
    </form>
  )
}

function LiquidityTab({ type, onAction }) {
  const isAdd = type === 'add'
  const [tickLower, setTickLower] = useState('-60')
  const [tickUpper, setTickUpper] = useState('60')
  const [amount, setAmount] = useState('1.0')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [focus, setFocus] = useState({})

  const endpoint = isAdd ? '/api/add-liquidity' : '/api/remove-liquidity'
  const label = isAdd ? 'Add Liquidity' : 'Remove Liquidity'
  const Icon = isAdd ? PlusCircle : MinusCircle
  const accentColor = isAdd ? '#10b981' : '#ef4444'
  const accentBg = isAdd
    ? 'linear-gradient(135deg, #059669, #047857)'
    : 'linear-gradient(135deg, #ef4444, #dc2626)'
  const accentShadow = isAdd ? 'rgba(16,185,129,0.35)' : 'rgba(239,68,68,0.35)'

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!amount || isNaN(parseFloat(amount))) return
    setLoading(true)
    setResult(null)
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tickLower: parseInt(tickLower),
          tickUpper: parseInt(tickUpper),
          liquidityDelta: amount
        })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error?.message || data.error || data.message || `HTTP ${res.status}`)
      setResult({ type: 'success', message: data.data?.message || data.message || data.data?.txHash || `${label} simulated successfully` })
      onAction(type, data)
    } catch (err) {
      setResult({ type: 'error', message: err.message })
      onAction(type, { error: err.message })
    } finally {
      setLoading(false)
    }
  }

  const fieldStyle = (key) => ({
    ...inputStyle,
    borderColor: focus[key] ? accentColor : '#374151',
    boxShadow: focus[key] ? `0 0 0 3px ${accentColor}25` : 'none'
  })

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Tick range */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <div>
          <label style={labelStyle} htmlFor={`${type}-tick-lower`}>Tick Lower</label>
          <input
            id={`${type}-tick-lower`}
            type="number"
            value={tickLower}
            onChange={e => setTickLower(e.target.value)}
            placeholder="-60"
            required
            style={fieldStyle('lower')}
            onFocus={() => setFocus(f => ({ ...f, lower: true }))}
            onBlur={() => setFocus(f => ({ ...f, lower: false }))}
          />
        </div>
        <div>
          <label style={labelStyle} htmlFor={`${type}-tick-upper`}>Tick Upper</label>
          <input
            id={`${type}-tick-upper`}
            type="number"
            value={tickUpper}
            onChange={e => setTickUpper(e.target.value)}
            placeholder="60"
            required
            style={fieldStyle('upper')}
            onFocus={() => setFocus(f => ({ ...f, upper: true }))}
            onBlur={() => setFocus(f => ({ ...f, upper: false }))}
          />
        </div>
      </div>

      {/* Liquidity delta */}
      <div>
        <label style={labelStyle} htmlFor={`${type}-amount`}>
          Liquidity Delta {isAdd ? '' : '(to remove)'}
        </label>
        <input
          id={`${type}-amount`}
          type="number"
          step="0.1"
          min="0"
          value={amount}
          onChange={e => setAmount(e.target.value)}
          placeholder="1.0"
          required
          style={fieldStyle('amount')}
          onFocus={() => setFocus(f => ({ ...f, amount: true }))}
          onBlur={() => setFocus(f => ({ ...f, amount: false }))}
        />
      </div>

      <Alert type={result?.type} message={result?.message} onDismiss={() => setResult(null)} />

      <button
        type="submit"
        disabled={loading}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
          padding: '11px 20px', borderRadius: '8px', border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
          background: loading ? (isAdd ? 'linear-gradient(135deg, #047857, #065f46)' : 'linear-gradient(135deg, #dc2626, #b91c1c)') : accentBg,
          color: '#fff', fontSize: '14px', fontWeight: '600',
          transition: 'all 0.15s', opacity: loading ? 0.7 : 1,
          boxShadow: loading ? 'none' : `0 2px 12px ${accentShadow}`
        }}
      >
        {loading ? <Spinner /> : <Icon size={15} />}
        {loading ? 'Simulating…' : `Simulate ${label}`}
      </button>
    </form>
  )
}

export default function ActionPanel({ onAction }) {
  const [activeTab, setActiveTab] = useState('swap')

  return (
    <div style={{
      backgroundColor: '#0f1117',
      border: '1px solid #1f2937',
      borderRadius: '16px',
      overflow: 'hidden'
    }}>
      {/* Header */}
      <div style={{
        padding: '20px 24px 0',
        background: 'linear-gradient(180deg, #13131f 0%, #0f1117 100%)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          <div style={{
            width: '32px', height: '32px', borderRadius: '8px',
            background: 'rgba(124,58,237,0.12)',
            border: '1px solid rgba(124,58,237,0.25)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <Zap size={15} color="#7c3aed" />
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#f9fafb' }}>
              Action Panel
            </h2>
            <p style={{ margin: 0, fontSize: '12px', color: '#6b7280' }}>
              Simulate hook interactions on-chain
            </p>
          </div>
        </div>

        {/* Tab bar */}
        <div style={{ display: 'flex', gap: '0', borderBottom: '1px solid #1f2937' }}>
          {TABS.map(tab => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  padding: '10px 18px', border: 'none', cursor: 'pointer',
                  backgroundColor: 'transparent',
                  color: isActive ? '#a78bfa' : '#6b7280',
                  fontSize: '13px', fontWeight: isActive ? '600' : '500',
                  borderBottom: isActive ? '2px solid #7c3aed' : '2px solid transparent',
                  marginBottom: '-1px',
                  transition: 'all 0.15s'
                }}
              >
                <Icon size={13} />
                {tab.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Tab content */}
      <div style={{ padding: '24px' }}>
        {activeTab === 'swap' && <SwapTab onAction={onAction} />}
        {activeTab === 'add' && <LiquidityTab type="add" onAction={onAction} />}
        {activeTab === 'remove' && <LiquidityTab type="remove" onAction={onAction} />}
      </div>
    </div>
  )
}
