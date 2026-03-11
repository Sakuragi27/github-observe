'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function SyncPage() {
  const router = useRouter()
  const [syncing, setSyncing] = useState(false)
  const [progress, setProgress] = useState({ current: 0, total: 0 })
  const [message, setMessage] = useState('')

  const handleLogout = () => {
    localStorage.removeItem('token')
    router.push('/login')
  }

  const handleSync = async () => {
    setSyncing(true)
    setMessage('')
    setProgress({ current: 10, total: 100 })
    
    try {
      const token = localStorage.getItem('token')
      setProgress({ current: 20, total: 100 })
      
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 60000) // 60秒超时
      
      const res = await fetch('/api/sync', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ force: true }),
        signal: controller.signal
      })
      
      clearTimeout(timeoutId)
      setProgress({ current: 80, total: 100 })
      
      const data = await res.json()
      
      if (res.ok) {
        setProgress({ current: 100, total: 100 })
        setMessage(`✅ 同步完成！共同步 ${data.newCount || 0} 个项目`)
      } else {
        setMessage('❌ ' + (data.error || '同步失败'))
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        setMessage('❌ 同步超时，请重试')
      } else {
        setMessage('❌ 同步出错，请重试')
      }
    } finally {
      setSyncing(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 -left-40 w-80 h-80 bg-purple-500/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 -right-40 w-80 h-80 bg-blue-500/30 rounded-full blur-3xl"></div>
      </div>

      <div className="relative flex min-h-screen">
        <aside className="w-64 bg-white/5 backdrop-blur-xl border-r border-white/10 flex flex-col">
          <div className="p-6 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
              </div>
              <span className="text-white font-bold text-lg">Observe</span>
            </div>
          </div>

          <nav className="flex-1 p-4 space-y-2">
            <a href="/" className="flex items-center gap-3 px-4 py-3 text-white/60 hover:bg-white/5 hover:text-white rounded-xl transition">
              <span>🏠</span>
              <span>首页</span>
            </a>
            <a href="/projects" className="flex items-center gap-3 px-4 py-3 text-white/60 hover:bg-white/5 hover:text-white rounded-xl transition">
              <span>📂</span>
              <span>项目</span>
            </a>
            <a href="/sync" className="flex items-center gap-3 px-4 py-3 bg-white/10 text-white rounded-xl">
              <span>🔄</span>
              <span>同步</span>
            </a>
            <a href="/tags" className="flex items-center gap-3 px-4 py-3 text-white/60 hover:bg-white/5 hover:text-white rounded-xl transition">
              <span>🏷️</span>
              <span>标签</span>
            </a>
            <a href="/settings" className="flex items-center gap-3 px-4 py-3 text-white/60 hover:bg-white/5 hover:text-white rounded-xl transition">
              <span>⚙️</span>
              <span>设置</span>
            </a>
          </nav>

          <div className="p-4 border-t border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-rose-500 rounded-full flex items-center justify-center text-white font-bold">T</div>
              <div className="flex-1">
                <div className="text-white text-sm font-medium">Tester</div>
                <div className="text-white/40 text-xs">tester@test.com</div>
              </div>
              <button onClick={handleLogout} className="text-white/40 hover:text-white">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          </div>
        </aside>

        <main className="flex-1 p-8 overflow-auto">
          <div className="max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold text-white mb-8">同步 GitHub Stars</h1>

            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8">
              <div className="text-center mb-8">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-4xl">🔄</span>
                </div>
                <h2 className="text-xl font-bold text-white mb-2">同步你的 GitHub Stars</h2>
                <p className="text-white/60">将你的 GitHub 收藏项目同步到本地</p>
              </div>

              {syncing && (
                <div className="mb-6">
                  <div className="flex justify-between text-sm text-white/60 mb-2">
                    <span>同步进度</span>
                    <span>{progress.current}%</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2">
                    <div className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-300" style={{ width: `${progress.current}%` }} />
                  </div>
                </div>
              )}

              {message && (
                <div className="mb-6 p-4 bg-green-500/20 border border-green-500/30 rounded-xl text-green-400 text-center">{message}</div>
              )}

              <button onClick={handleSync} disabled={syncing} className="w-full py-4 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-xl font-medium hover:from-purple-600 hover:to-blue-600 transition disabled:opacity-50">
                {syncing ? '同步中...' : '开始同步'}
              </button>

              <p className="mt-4 text-center text-white/40 text-sm">同步将获取你 GitHub 账号下所有 star 的项目</p>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
