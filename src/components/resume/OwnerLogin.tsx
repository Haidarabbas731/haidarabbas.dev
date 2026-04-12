import { AlertCircle, CheckCircle2, Loader2, Lock } from 'lucide-react'
import { useState } from 'react'
import { authenticateOwner } from '@/services/authService'
import type { AuthResult } from '@/types/resume'

interface OwnerLoginProps {
  onAuthenticated: (result: AuthResult) => void
}

export function OwnerLogin({ onAuthenticated }: OwnerLoginProps) {
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [shake, setShake] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!password.trim()) return

    setLoading(true)
    setError(null)
    try {
      const result = await authenticateOwner(password)
      if (result.authorized) {
        onAuthenticated(result)
      } else {
        setError(result.error ?? 'Incorrect password')
        setShake(true)
        setTimeout(() => setShake(false), 500)
      }
    } catch {
      setError('Failed to connect to auth server')
      setShake(true)
      setTimeout(() => setShake(false), 500)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <div
          className={`flex items-center gap-3 px-4 py-3 rounded-md border transition-all focus-within:border-primary/50 focus-within:[box-shadow:0_0_12px_hsl(var(--primary)/0.15)] ${shake ? 'animate-shake' : ''}`}
          style={{
            background: 'hsl(var(--card) / 0.4)',
            borderColor: error ? 'hsl(var(--destructive) / 0.5)' : 'hsl(var(--border) / 0.5)',
          }}
        >
          <Lock size={14} style={{ color: 'hsl(var(--muted-foreground))' }} />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter owner password..."
            aria-label="Owner password"
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground font-mono-jb"
            style={{ color: 'hsl(var(--foreground))' }}
            autoComplete="current-password"
          />
        </div>

        {error && (
          <div
            className="flex items-center gap-2 text-xs px-3 py-2 rounded-md font-mono-jb"
            style={{
              color: 'hsl(var(--destructive))',
              background: 'hsl(var(--destructive) / 0.08)',
              border: '1px solid hsl(var(--destructive) / 0.3)',
            }}
          >
            <AlertCircle size={11} />
            {error}
          </div>
        )}
      </div>

      <button
        type="submit"
        disabled={loading || !password.trim()}
        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-md text-sm font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed font-mono-jb"
        style={{
          background: 'hsl(var(--primary))',
          color: 'hsl(var(--primary-foreground))',
          boxShadow: !loading && password ? '0 0 20px hsl(var(--primary) / 0.3)' : 'none',
        }}
      >
        {loading ? <Loader2 size={13} className="animate-spin" /> : <CheckCircle2 size={13} />}
        {loading ? 'Verifying...' : 'Unlock'}
      </button>
    </form>
  )
}
