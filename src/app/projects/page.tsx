'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface Project {
  id: string
  name: string
  fullName: string
  description: string
  htmlUrl: string
  stargazersCount: number
  language: string
  topics: string[]
  tags: { id: string; name: string; slug: string }[]
  starredAt: string
}

interface Tag {
  id: string
  name: string
  slug: string
  count: number
}

// 项目数据从 API 获取

export default function ProjectsPage() {
  const router = useRouter()
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [activeTab, setActiveTab] = useState<'recent' | 'all'>('recent')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [selectedLang, setSelectedLang] = useState<string>('')
  const [showFilters, setShowFilters] = useState(false)
  const [projects, setProjects] = useState<Project[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  const [loading, setLoading] = useState(true)
  const [hasToken, setHasToken] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token')
        if (!token) {
          setLoading(false)
          return
        }
        
        const res = await fetch('/api/projects', {
          headers: { Authorization: `Bearer ${token}` }
        })
        
        if (res.ok) {
          const data = await res.json()
          setProjects(data.data?.projects || data.projects || [])
          setHasToken(true)
        }
      } catch (err) {
        console.error('Failed to fetch projects:', err)
      } finally {
        setLoading(false)
      }
    }
    
    fetchData()
  }, [])

  const filteredProjects = projects.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         p.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesTags = selectedTags.length === 0 || 
                       p.tags.some(t => selectedTags.includes(t.slug))
    const matchesLang = !selectedLang || p.language === selectedLang
    return matchesSearch && matchesTags && matchesLang
  })

  const toggleTag = (slug: string) => {
    setSelectedTags(prev => 
      prev.includes(slug) ? prev.filter(t => t !== slug) : [...prev, slug]
    )
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    router.push('/login')
  }

  // 加载状态
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-lg">加载中...</div>
      </div>
    )
  }

  // 未配置 Token
  if (!hasToken && projects.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-white/60 text-lg mb-4">请先在设置页面配置 GitHub Token</div>
          <button 
            onClick={() => router.push('/settings')}
            className="px-6 py-3 bg-purple-500 text-white rounded-xl hover:bg-purple-600 transition"
          >
            前往设置
          </button>
        </div>
      </div>
    )
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
            <Link href="/" className="flex items-center gap-3 px-4 py-3 text-white/60 hover:bg-white/5 hover:text-white rounded-xl transition">
              <span>🏠</span>
              <span>首页</span>
            </Link>
            <Link href="/projects" className="flex items-center gap-3 px-4 py-3 bg-white/10 text-white rounded-xl">
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
          {/* 顶部搜索和筛选 */}
          <div className="flex items-center justify-between mb-6">
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
            <div className="flex items-center gap-3 ml-4">
              <button 
                onClick={() => setShowFilters(!showFilters)}
                className={`px-4 py-3 rounded-xl transition ${showFilters ? 'bg-purple-500 text-white' : 'bg-white/10 text-white hover:bg-white/20'}`}
              >
                �筛选
              </button>
              <div className="flex bg-white/10 rounded-xl p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-3 py-2 rounded-lg transition ${viewMode === 'grid' ? 'bg-white/20 text-white' : 'text-white/60'}`}
                >
                  ⊞
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-2 rounded-lg transition ${viewMode === 'list' ? 'bg-white/20 text-white' : 'text-white/60'}`}
                >
                  ☰
                </button>
              </div>
            </div>
          </div>

          {/* 筛选面板 */}
          {showFilters && (
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 mb-6">
              <div className="grid grid-cols-3 gap-6">
                {/* 语言筛选 */}
                <div>
                  <h4 className="text-white font-medium mb-3">语言</h4>
                  <div className="flex flex-wrap gap-2">
                    {['TypeScript', 'JavaScript', 'Python', 'Rust', 'Go'].map(lang => (
                      <button
                        key={lang}
                        onClick={() => setSelectedLang(selectedLang === lang ? '' : lang)}
                        className={`px-3 py-1.5 rounded-lg text-sm transition ${
                          selectedLang === lang 
                            ? 'bg-purple-500 text-white' 
                            : 'bg-white/10 text-white/60 hover:bg-white/20'
                        }`}
                      >
                        {lang}
                      </button>
                    ))}
                  </div>
                </div>
                {/* 标签筛选 */}
                <div>
                  <h4 className="text-white font-medium mb-3">标签</h4>
                  <div className="flex flex-wrap gap-2">
                    {tags.map(tag => (
                      <button
                        key={tag.id}
                        onClick={() => toggleTag(tag.slug)}
                        className={`px-3 py-1.5 rounded-lg text-sm transition ${
                          selectedTags.includes(tag.slug)
                            ? 'bg-purple-500 text-white'
                            : 'bg-white/10 text-white/60 hover:bg-white/20'
                        }`}
                      >
                        {tag.name} ({tag.count})
                      </button>
                    ))}
                  </div>
                </div>
                {/* 时间筛选 */}
                <div>
                  <h4 className="text-white font-medium mb-3">时间</h4>
                  <div className="flex flex-wrap gap-2">
                    {['今天', '本周', '本月', '更早'].map(time => (
                      <button
                        key={time}
                        className="px-3 py-1.5 rounded-lg text-sm bg-white/10 text-white/60 hover:bg-white/20 transition"
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 切换 */}
          <div className="flex gap-4 mb-6">
            <button
              onClick={() => setActiveTab('recent')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                activeTab === 'recent' 
                  ? 'bg-white/20 text-white' 
                  : 'text-white/60 hover:text-white'
              }`}
            >
              最近更新
            </button>
            <button
              onClick={() => setActiveTab('all')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                activeTab === 'all' 
                  ? 'bg-white/20 text-white' 
                  : 'text-white/60 hover:text-white'
              }`}
            >
              全部项目 ({projects.length})
            </button>
          </div>

          {/* 项目列表 */}
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProjects.map(project => (
                <div key={project.id} onClick={() => router.push(`/project/${project.id}`)} className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-5 hover:bg-white/15 transition cursor-pointer group">
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-xl flex items-center justify-center text-2xl">
                      📂
                    </div>
                    <a href={project.htmlUrl} target="_blank" className="text-white/40 hover:text-white transition">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  </div>
                  <h3 className="text-white font-semibold mb-1 group-hover:text-purple-400 transition">{project.fullName}</h3>
                  <p className="text-white/40 text-sm mb-4 line-clamp-2">{project.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-white/60 text-sm">{project.language}</span>
                      <span className="text-white/40">•</span>
                      <span className="text-purple-400 text-sm">⭐ {project.stargazersCount.toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {project.tags.map(tag => (
                      <span key={tag.id} className="px-2 py-1 bg-white/10 text-white/60 text-xs rounded-lg">
                        {tag.name}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredProjects.map(project => (
                <div key={project.id} onClick={() => router.push(`/project/${project.id}`)} className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-5 hover:bg-white/15 transition cursor-pointer">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-xl flex items-center justify-center text-2xl">
                      📂
                    </div>
                    <div className="flex-1">
                      <h3 className="text-white font-semibold mb-1">{project.fullName}</h3>
                      <p className="text-white/40 text-sm">{project.description}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-white/60 text-sm">{project.language}</span>
                      <span className="text-purple-400">⭐ {project.stargazersCount.toLocaleString()}</span>
                      <a href={project.htmlUrl} target="_blank" className="p-2 bg-white/10 rounded-lg text-white/60 hover:text-white transition">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
