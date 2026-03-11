'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function SettingsPage() {
  const router = useRouter()
  const [token, setToken] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [syncMode, setSyncMode] = useState<'incremental' | 'full'>('incremental')
  const [darkMode, setDarkMode] = useState(true)
  const [autoSync, setAutoSync] = useState(false)

  const handleSaveToken = async () => {
    if (!token) return
    setLoading(true)
    setMessage('')
    
    try {
      const authToken = localStorage.getItem('token')
      const res = await fetch('/api/user/token', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({ githubToken: token }),
      })
      
      const data = await res.json()
      
      if (res.ok) {
        setMessage('✅ Token 保存成功！正在同步...')
        // 保存成功后自动触发同步
        try {
          const syncRes = await fetch('/api/sync', {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({ force: true })
          })
          const syncData = await syncRes.json()
          if (syncRes.ok) {
            setMessage('✅ Token 保存成功！已同步 ' + (syncData.newCount || 0) + ' 个项目')
          } else {
            setMessage('✅ Token 保存成功！同步失败: ' + (syncData.error || '未知错误'))
          }
        } catch (syncErr) {
          setMessage('✅ Token 保存成功！同步出错，请手动同步')
        }
        setToken('')
      } else {
        setMessage('❌ ' + (data.error || '保存失败'))
      }
    } catch (err) {
      setMessage('❌ 网络错误，请重试')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    router.push('/login')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* 动态背景 */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 -left-40 w-80 h-80 bg-purple-500/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 -right-40 w-80 h-80 bg-blue-500/30 rounded-full blur-3xl"></div>
      </div>

      <div className="relative flex min-h-screen">
        {/* 侧边栏 */}
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
            <a href="/sync" className="flex items-center gap-3 px-4 py-3 text-white/60 hover:bg-white/5 hover:text-white rounded-xl transition">
              <span>🔄</span>
              <span>同步</span>
            </a>
            <a href="/tags" className="flex items-center gap-3 px-4 py-3 text-white/60 hover:bg-white/5 hover:text-white rounded-xl transition">
              <span>🏷️</span>
              <span>标签</span>
            </a>
            <a href="/settings" className="flex items-center gap-3 px-4 py-3 bg-white/10 text-white rounded-xl">
              <span>⚙️</span>
              <span>设置</span>
            </a>
          </nav>

          <div className="p-4 border-t border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-rose-500 rounded-full flex items-center justify-center text-white font-bold">
                T
              </div>
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

        {/* 主内容区 */}
        <main className="flex-1 p-8 overflow-auto">
          <h1 className="text-3xl font-bold text-white mb-8">设置</h1>

          <div className="space-y-6 max-w-2xl">
            {/* Token 配置 */}
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6">
              <h2 className="text-xl font-bold text-white mb-4">GitHub Token 配置</h2>
              <p className="text-white/40 text-sm mb-4">
                请输入您的 GitHub Personal Access Token，用于获取您的 Stars 列表。
                <a href="https://github.com/settings/tokens" target="_blank" className="text-purple-400 ml-2 hover:underline">
                  创建 Token →
                </a>
              </p>
              <input
                type="password"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="ghp_xxxxxxxxxxxx"
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 mb-4 focus:ring-2 focus:ring-purple-400 focus:border-transparent"
              />
              <button
                onClick={handleSaveToken}
                disabled={loading || !token}
                className="px-6 py-2.5 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-xl font-medium hover:from-purple-600 hover:to-blue-600 transition disabled:opacity-50"
              >
                {loading ? '保存中...' : '保存 Token'}
              </button>
              {message && (
                <p className={`mt-3 text-sm ${message.startsWith('✅') ? 'text-green-400' : 'text-red-400'}`}>
                  {message}
                </p>
              )}
            </div>

            {/* 同步设置 */}
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6">
              <h2 className="text-xl font-bold text-white mb-4">同步设置</h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-white font-medium">自动同步</div>
                    <div className="text-white/40 text-sm">每天自动同步 GitHub Stars</div>
                  </div>
                  <button
                    onClick={() => setAutoSync(!autoSync)}
                    className={`w-12 h-6 rounded-full transition-colors ${autoSync ? 'bg-purple-500' : 'bg-white/20'}`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full transition-transform ${autoSync ? 'translate-x-6' : 'translate-x-0.5'}`} />
                  </button>
                </div>

                <div>
                  <div className="text-white font-medium mb-3">同步模式</div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setSyncMode('incremental')}
                      className={`px-4 py-2 rounded-xl text-sm transition ${
                        syncMode === 'incremental' 
                          ? 'bg-purple-500 text-white' 
                          : 'bg-white/10 text-white/60 hover:bg-white/20'
                      }`}
                    >
                      增量同步
                    </button>
                    <button
                      onClick={() => setSyncMode('full')}
                      className={`px-4 py-2 rounded-xl text-sm transition ${
                        syncMode === 'full' 
                          ? 'bg-purple-500 text-white' 
                          : 'bg-white/10 text-white/60 hover:bg-white/20'
                      }`}
                    >
                      全量同步
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* 外观设置 */}
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6">
              <h2 className="text-xl font-bold text-white mb-4">外观设置</h2>
              
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-white font-medium">深色模式</div>
                  <div className="text-white/40 text-sm">使用深色主题</div>
                </div>
                <button
                  onClick={() => setDarkMode(!darkMode)}
                  className={`w-12 h-6 rounded-full transition-colors ${darkMode ? 'bg-purple-500' : 'bg-white/20'}`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full transition-transform ${darkMode ? 'translate-x-6' : 'translate-x-0.5'}`} />
                </button>
              </div>
            </div>

            {/* 账号操作 */}
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6">
              <h2 className="text-xl font-bold text-white mb-4">账号</h2>
              <button
                onClick={handleLogout}
                className="px-6 py-2.5 bg-red-500/20 text-red-400 rounded-xl font-medium hover:bg-red-500/30 transition"
              >
                退出登录
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
