'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

// 模拟数据
const stats = [
  { label: '总项目数', value: '128', icon: '📂', trend: '+12' },
  { label: '今日新增', value: '5', icon: '✨', trend: '+3' },
  { label: '同步时间', value: '2h前', icon: '🔄', trend: '' },
  { label: '标签总数', value: '24', icon: '🏷️', trend: '+2' },
]

const recentProjects = [
  { name: 'vercel/next.js', desc: 'The React Framework', lang: 'TypeScript', stars: '218k', updated: '2小时前' },
  { name: 'facebook/react', desc: 'A declarative UI library', lang: 'JavaScript', stars: '219k', updated: '3小时前' },
  { name: 'vuejs/vue', desc: 'Progressive JavaScript Framework', lang: 'TypeScript', stars: '206k', updated: '5小时前' },
  { name: 'tailwindlabs/tailwindcss', desc: 'A utility-first CSS framework', lang: 'CSS', stars: '76k', updated: '1天前' },
]

const recommendedProjects = [
  { name: 'sindresorhus/awesome', desc: 'Awesome lists', lang: 'Python', stars: '302k' },
  { name: 'github/docs', desc: 'GitHub documentation', lang: 'TypeScript', stars: '156k' },
  { name: 'microsoft/vscode', desc: 'Visual Studio Code', lang: 'TypeScript', stars: '156k' },
]

export default function HomePage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    setIsLoggedIn(!!token)
    setLoading(false)
  }, [])

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">加载中...</div>
      </main>
    )
  }

  // 未登录显示引导页
  if (!isLoggedIn) {
    return (
      <main className="min-h-screen flex items-center justify-center relative overflow-hidden">
        {/* 极光渐变背景 */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900">
          <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
          <div className="absolute top-0 -right-4 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse" style={{ animationDelay: '2s' }}></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse" style={{ animationDelay: '4s' }}></div>
        </div>
        
        <div className="relative z-10 max-w-md w-full mx-4">
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl shadow-2xl p-8">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 rounded-2xl mb-4">
                <svg className="w-10 h-10 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-white">GitHub Observe</h1>
              <p className="mt-2 text-white/60">智能管理你的 GitHub Stars</p>
            </div>
            
            <div className="space-y-4">
              <Link 
                href="/login" 
                className="flex items-center justify-center gap-3 py-3 px-4 bg-white text-gray-900 rounded-xl font-medium hover:bg-gray-100 transition shadow-lg"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
                使用 GitHub 账号登录
              </Link>
              
              <div className="flex items-center gap-4">
                <div className="flex-1 h-px bg-white/20"></div>
                <span className="text-white/40 text-sm">或</span>
                <div className="flex-1 h-px bg-white/20"></div>
              </div>
              
              <Link 
                href="/projects" 
                className="block w-full py-3 px-4 bg-white/10 text-white text-center rounded-xl font-medium hover:bg-white/20 transition border border-white/20"
              >
                浏览项目
              </Link>
            </div>
            
            <div className="mt-8 pt-6 border-t border-white/10">
              <div className="grid grid-cols-3 gap-4 text-center text-sm">
                <div>
                  <div className="text-lg mb-1">🔄</div>
                  <div className="text-white/60">自动同步</div>
                </div>
                <div>
                  <div className="text-lg mb-1">🤖</div>
                  <div className="text-white/60">AI 摘要</div>
                </div>
                <div>
                  <div className="text-lg mb-1">🏷️</div>
                  <div className="text-white/60">标签管理</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    )
  }

  // 登录用户显示 Dashboard
  const handleLogout = () => {
    localStorage.removeItem('token')
    setIsLoggedIn(false)
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
          {/* Logo */}
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

          {/* 导航 */}
          <nav className="flex-1 p-4 space-y-2">
            <Link href="/" className="flex items-center gap-3 px-4 py-3 bg-white/10 text-white rounded-xl">
              <span>🏠</span>
              <span>首页</span>
            </Link>
            <Link href="/projects" className="flex items-center gap-3 px-4 py-3 text-white/60 hover:bg-white/5 hover:text-white rounded-xl transition">
              <span>📂</span>
              <span>项目</span>
            </Link>
            <Link href="/sync" className="flex items-center gap-3 px-4 py-3 text-white/60 hover:bg-white/5 hover:text-white rounded-xl transition">
              <span>🔄</span>
              <span>同步</span>
            </Link>
            <Link href="/tags" className="flex items-center gap-3 px-4 py-3 text-white/60 hover:bg-white/5 hover:text-white rounded-xl transition">
              <span>🏷️</span>
              <span>标签</span>
            </Link>
            <Link href="/settings" className="flex items-center gap-3 px-4 py-3 text-white/60 hover:bg-white/5 hover:text-white rounded-xl transition">
              <span>⚙️</span>
              <span>设置</span>
            </Link>
          </nav>

          {/* 用户信息 */}
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
          {/* 顶部搜索 */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex-1 max-w-xl">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="搜索项目..."
                  className="w-full px-4 py-3 pl-12 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 backdrop-blur focus:ring-2 focus:ring-purple-400 focus:border-transparent"
                />
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40">🔍</span>
              </div>
            </div>
            <div className="flex items-center gap-4 ml-4">
              <button className="p-3 bg-white/10 rounded-xl text-white hover:bg-white/20 transition">
                🔔
              </button>
            </div>
          </div>

          {/* 统计卡片 */}
          <div className="grid grid-cols-4 gap-4 mb-8">
            {stats.map((stat, index) => (
              <div key={index} className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition cursor-pointer">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-3xl">{stat.icon}</span>
                  {stat.trend && (
                    <span className="text-green-400 text-sm font-medium">{stat.trend}</span>
                  )}
                </div>
                <div className="text-white text-2xl font-bold mb-1">{stat.value}</div>
                <div className="text-white/40 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* 最近更新 */}
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-white text-xl font-bold">最近更新</h2>
              <Link href="/projects" className="text-purple-400 hover:text-purple-300 text-sm">查看全部 →</Link>
            </div>
            <div className="space-y-4">
              {recentProjects.map((project, index) => (
                <div key={index} className="flex items-center gap-4 p-4 bg-white/5 rounded-xl hover:bg-white/10 transition cursor-pointer">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-xl flex items-center justify-center text-2xl">
                    📂
                  </div>
                  <div className="flex-1">
                    <div className="text-white font-medium">{project.name}</div>
                    <div className="text-white/40 text-sm">{project.desc}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-white/60 text-sm">{project.lang}</div>
                    <div className="text-white/40 text-xs">{project.updated}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 智能推荐 */}
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-2xl">🤖</span>
              <h2 className="text-white text-xl font-bold">智能推荐</h2>
            </div>
            <div className="grid grid-cols-3 gap-4">
              {recommendedProjects.map((project, index) => (
                <div key={index} className="p-4 bg-white/5 rounded-xl hover:bg-white/10 transition cursor-pointer">
                  <div className="text-white font-medium mb-2">{project.name}</div>
                  <div className="text-white/40 text-sm mb-3">{project.desc}</div>
                  <div className="flex items-center justify-between">
                    <span className="text-white/60 text-sm">{project.lang}</span>
                    <span className="text-purple-400 text-sm">⭐ {project.stars}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
