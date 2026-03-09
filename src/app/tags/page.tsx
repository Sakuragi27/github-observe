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

export default function TagsPage() {
  const router = useRouter()
  const [tags, setTags] = useState<Tag[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'cloud' | 'list'>('cloud')

  useEffect(() => {
    const user = localStorage.getItem('user')
    if (!user) {
      router.push('/login')
      return
    }
    fetchTags()
  }, [router])

  const fetchTags = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/tags')
      const data = await res.json()
      
      if (res.ok) {
        setTags(data.data)
      }
    } catch (err) {
      console.error('Failed to fetch tags:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleTagClick = (tagSlug: string) => {
    router.push(`/projects?tags=${tagSlug}`)
  }

  const getTagSize = (count: number, maxCount: number) => {
    const minSize = 14
    const maxSize = 32
    const ratio = count / maxCount
    return minSize + (maxSize - minSize) * ratio
  }

  const maxCount = Math.max(...tags.map(t => t.count), 1)

  // 按分类分组
  const tagsByCategory = tags.reduce((acc, tag) => {
    const category = tag.category || '其他'
    if (!acc[category]) acc[category] = []
    acc[category].push(tag)
    return acc
  }, {} as Record<string, Tag[]>)

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => router.push('/projects')} 
              className="text-blue-500 hover:text-blue-600"
            >
              ← 返回项目列表
            </button>
            <h1 className="text-xl font-bold">标签管理</h1>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('cloud')}
              className={`px-3 py-1 rounded ${
                viewMode === 'cloud' 
                  ? 'bg-purple-500 text-white' 
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              标签云
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1 rounded ${
                viewMode === 'list' 
                  ? 'bg-purple-500 text-white' 
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              列表视图
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {loading ? (
          <div className="text-center py-12 text-gray-500">加载中...</div>
        ) : tags.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            暂无标签数据，请先同步项目
          </div>
        ) : (
          <>
            <div className="mb-6 text-sm text-gray-600">
              共 {tags.length} 个标签，{tags.reduce((sum, t) => sum + t.count, 0)} 个项目
            </div>

            {viewMode === 'cloud' ? (
              /* 标签云视图 */
              <div className="bg-white rounded-lg shadow p-8">
                <div className="flex flex-wrap gap-4 justify-center items-center">
                  {tags.map((tag) => (
                    <button
                      key={tag.id}
                      onClick={() => handleTagClick(tag.slug)}
                      className="text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                      style={{
                        fontSize: `${getTagSize(tag.count, maxCount)}px`,
                        fontWeight: tag.count > maxCount / 2 ? 'bold' : 'normal',
                      }}
                    >
                      {tag.name}
                      <span className="text-xs text-gray-400 ml-1">({tag.count})</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              /* 列表视图 - 按分类分组 */
              <div className="space-y-6">
                {Object.entries(tagsByCategory).map(([category, categoryTags]) => (
                  <div key={category} className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-lg font-semibold mb-4 text-gray-800">
                      {category}
                      <span className="text-sm text-gray-500 ml-2">
                        ({categoryTags.length} 个标签)
                      </span>
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {categoryTags
                        .sort((a, b) => b.count - a.count)
                        .map((tag) => (
                          <button
                            key={tag.id}
                            onClick={() => handleTagClick(tag.slug)}
                            className="flex items-center justify-between p-3 bg-gray-50 hover:bg-blue-50 rounded-lg transition-colors text-left"
                          >
                            <span className="font-medium text-gray-700">{tag.name}</span>
                            <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                              {tag.count}
                            </span>
                          </button>
                        ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}
