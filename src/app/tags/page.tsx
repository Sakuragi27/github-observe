'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface Tag {
  id: string
  name: string
  slug: string
  category: string | null
  count: number
}

// 模拟数据
const mockTags: Tag[] = [
  { id: '1', name: '前端', slug: 'frontend', category: '技术', count: 156 },
  { id: '2', name: '后端', slug: 'backend', category: '技术', count: 89 },
  { id: '3', name: '工具', slug: 'tool', category: '工具', count: 234 },
  { id: '4', name: 'AI/ML', slug: 'ai-ml', category: '技术', count: 67 },
  { id: '5', name: '开源', slug: 'opensource', category: '其他', count: 312 },
  { id: '6', name: 'React', slug: 'react', category: '框架', count: 145 },
  { id: '7', name: 'Vue', slug: 'vue', category: '框架', count: 98 },
  { id: '8', name: 'Python', slug: 'python', category: '语言', count: 176 },
  { id: '9', name: 'TypeScript', slug: 'typescript', category: '语言', count: 203 },
  { id: '10', name: '机器学习', slug: 'machine-learning', category: '技术', count: 87 },
  { id: '11', name: '区块链', slug: 'blockchain', category: '技术', count: 45 },
  { id: '12', name: 'DevOps', slug: 'devops', category: '技术', count: 76 },
]

export default function TagsPage() {
  const router = useRouter()
  const [viewMode, setViewMode] = useState<'cloud' | 'list'>('cloud')
  const [searchQuery, setSearchQuery] = useState('')

  const tags = mockTags
  const filteredTags = tags.filter(t => t.name.toLowerCase().includes(searchQuery.toLowerCase()))

  const getTagSize = (count: number) => {
    const minSize = 14
    const maxSize = 42
    const maxCount = Math.max(...tags.map(t => t.count))
    const ratio = count / maxCount
    return minSize + (maxSize - minSize) * ratio
  }

  const handleTagClick = (tagSlug: string) => {
    router.push(`/projects?tags=${tagSlug}`)
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    router.push('/login')
  }

  // 按分类分组
  const tagsByCategory = filteredTags.reduce((acc, tag) => {
    const category = tag.category || '其他'
    if (!acc[category]) acc[category] = []
    acc[category].push(tag)
    return acc
  }, {} as Record<string, Tag[]>)

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
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.756-1.333-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
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
            <a href="/tags" className="flex items-center gap-3 px-4 py-3 bg-white/10 text-white rounded-xl">
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
          {/* 统计卡片 */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6">
              <div className="text-white/40 text-sm mb-2">总标签数</div>
              <div className="text-3xl font-bold text-white">{tags.length}</div>
            </div>
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6">
              <div className="text-white/40 text-sm mb-2">总项目数</div>
              <div className="text-3xl font-bold text-white">{tags.reduce((sum, t) => sum + t.count, 0)}</div>
            </div>
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6">
              <div className="text-white/40 text-sm mb-2">未分类</div>
              <div className="text-3xl font-bold text-white">12</div>
            </div>
          </div>

          {/* 搜索和视图切换 */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="搜索标签..."
                  className="w-full px-4 py-3 pl-12 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 backdrop-blur focus:ring-2 focus:ring-purple-400 focus:border-transparent"
                />
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40">🔍</span>
              </div>
            </div>
            <div className="flex gap-2 ml-4">
              <button
                onClick={() => setViewMode('cloud')}
                className={`px-4 py-2 rounded-xl font-medium transition ${
                  viewMode === 'cloud' 
                    ? 'bg-purple-500 text-white' 
                    : 'bg-white/10 text-white/60 hover:bg-white/20'
                }`}
              >
                标签云
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-4 py-2 rounded-xl font-medium transition ${
                  viewMode === 'list' 
                    ? 'bg-purple-500 text-white' 
                    : 'bg-white/10 text-white/60 hover:bg-white/20'
                }`}
              >
                列表
              </button>
            </div>
          </div>

          {/* 标签云视图 */}
          {viewMode === 'cloud' ? (
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-12">
              <div className="flex flex-wrap gap-6 justify-center items-center">
                {filteredTags.map((tag) => (
                  <button
                    key={tag.id}
                    onClick={() => handleTagClick(tag.slug)}
                    className="text-white/80 hover:text-purple-400 transition-all duration-300 hover:scale-110"
                    style={{
                      fontSize: `${getTagSize(tag.count)}px`,
                      fontWeight: tag.count > 150 ? 'bold' : 'normal',
                    }}
                  >
                    {tag.name}
                    <span className="text-white/40 ml-1">({tag.count})</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* 列表视图 */
            <div className="space-y-6">
              {Object.entries(tagsByCategory).map(([category, categoryTags]) => (
                <div key={category} className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6">
                  <h2 className="text-xl font-bold text-white mb-4">{category}</h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {categoryTags
                      .sort((a, b) => b.count - a.count)
                      .map((tag) => (
                        <button
                          key={tag.id}
                          onClick={() => handleTagClick(tag.slug)}
                          className="flex items-center justify-between p-3 bg-white/5 hover:bg-white/10 rounded-xl transition text-left group"
                        >
                          <span className="text-white font-medium group-hover:text-purple-400 transition">{tag.name}</span>
                          <span className="px-2 py-1 bg-purple-500/20 text-purple-400 text-xs rounded-lg">{tag.count}</span>
                        </button>
                      ))}
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
