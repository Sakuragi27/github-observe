'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface Tag {
  id: string
  name: string
  slug: string
  count?: number
}

interface Project {
  id: string
  name: string
  fullName: string
  description: string | null
  htmlUrl: string
  stargazersCount: number
  language: string | null
  solvedProblem: string | null
  tags: Tag[]
  starredAt: string | null
}

function getAuthHeaders(): HeadersInit {
  const userStr = localStorage.getItem('user')
  if (!userStr) return {}
  
  const user = JSON.parse(userStr)
  if (!user.token) return {}
  
  return {
    'Authorization': `Bearer ${user.token}`,
  }
}

export default function ProjectsPage() {
  const router = useRouter()
  const [projects, setProjects] = useState<Project[]>([])
  const [allTags, setAllTags] = useState<Tag[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])

  useEffect(() => {
    const user = localStorage.getItem('user')
    if (!user) {
      router.push('/login')
      return
    }
    fetchTags()
    fetchProjects()
  }, [router])

  const fetchTags = async () => {
    try {
      const res = await fetch('/api/tags', {
        headers: getAuthHeaders(),
      })
      const data = await res.json()
      if (res.ok) {
        setAllTags(data.data)
      }
    } catch (err) {
      console.error('Failed to fetch tags:', err)
    }
  }

  const fetchProjects = async (tags: string[] = [], searchTerm: string = '') => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        ...(searchTerm && { search: searchTerm }),
        ...(tags.length > 0 && { tags: tags.join(',') }),
      })
      
      const res = await fetch('/api/projects?' + params, {
        headers: getAuthHeaders(),
      })
      const data = await res.json()
      
      if (res.ok) {
        setProjects(data.data.projects)
      } else {
        if (res.status === 401) {
          router.push('/login')
        }
      }
    } catch (err) {
      console.error('Failed to fetch projects:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchProjects(selectedTags, search)
  }

  const toggleTag = (tagSlug: string) => {
    const newSelectedTags = selectedTags.includes(tagSlug)
      ? selectedTags.filter(t => t !== tagSlug)
      : [...selectedTags, tagSlug]
    
    setSelectedTags(newSelectedTags)
    fetchProjects(newSelectedTags, search)
  }

  const clearFilters = () => {
    setSelectedTags([])
    setSearch('')
    fetchProjects([], '')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold">GitHub Observe</h1>
          <div className="flex gap-4">
            <button onClick={() => router.push('/tags')} className="text-purple-500 hover:text-purple-600">
              标签管理
            </button>
            <button onClick={() => router.push('/settings')} className="text-blue-500 hover:text-blue-600">
              设置
            </button>
            <button onClick={() => { localStorage.clear(); router.push('/login') }} className="text-gray-500 hover:text-gray-600">
              退出
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* 搜索栏 */}
        <form onSubmit={handleSearch} className="mb-6">
          <div className="flex gap-2">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="搜索项目名称、描述..."
              className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button type="submit" className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
              搜索
            </button>
            {(selectedTags.length > 0 || search) && (
              <button 
                type="button" 
                onClick={clearFilters} 
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                清除筛选
              </button>
            )}
          </div>
        </form>

        {/* 标签筛选区 */}
        {allTags.length > 0 && (
          <div className="mb-6 bg-white p-4 rounded-lg shadow">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">
              标签筛选 {selectedTags.length > 0 && `(已选 ${selectedTags.length})`}
            </h3>
            <div className="flex flex-wrap gap-2">
              {allTags.slice(0, 20).map((tag) => (
                <button
                  key={tag.id}
                  onClick={() => toggleTag(tag.slug)}
                  className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                    selectedTags.includes(tag.slug)
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {tag.name}
                  {tag.count !== undefined && ` (${tag.count})`}
                </button>
              ))}
              {allTags.length > 20 && (
                <button
                  onClick={() => router.push('/tags')}
                  className="px-3 py-1.5 rounded-full text-sm bg-purple-100 text-purple-700 hover:bg-purple-200"
                >
                  查看全部标签 →
                </button>
              )}
            </div>
          </div>
        )}

        {/* 项目列表 */}
        {loading ? (
          <div className="text-center py-12 text-gray-500">加载中...</div>
        ) : projects.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">
              {selectedTags.length > 0 || search 
                ? '没有找到匹配的项目' 
                : '暂无项目，请先同步 GitHub Stars'}
            </p>
            {!selectedTags.length && !search && (
              <button
                onClick={() => router.push('/settings')}
                className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
              >
                前往同步
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="mb-4 text-sm text-gray-600">
              找到 {projects.length} 个项目
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {projects.map((project) => (
                <div
                  key={project.id}
                  className="bg-white p-4 rounded-lg shadow hover:shadow-md transition cursor-pointer"
                  onClick={() => router.push(`/project/${project.id}`)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-blue-600 truncate">{project.name}</h3>
                    <span className="text-yellow-500 text-sm whitespace-nowrap ml-2">
                      ★ {project.stargazersCount}
                    </span>
                  </div>
                  
                  <p className="text-xs text-gray-400 mb-2">{project.fullName}</p>
                  
                  {project.description && (
                    <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                      {project.description}
                    </p>
                  )}
                  
                  {project.solvedProblem && (
                    <p className="text-green-600 text-sm mb-2 line-clamp-2">
                      💡 {project.solvedProblem}
                    </p>
                  )}
                  
                  <div className="flex flex-wrap gap-1 mt-2 mb-2">
                    {project.tags.slice(0, 5).map((tag) => (
                      <span 
                        key={tag.id} 
                        className="px-2 py-0.5 bg-blue-50 text-blue-600 text-xs rounded"
                      >
                        #{tag.name}
                      </span>
                    ))}
                    {project.tags.length > 5 && (
                      <span className="px-2 py-0.5 bg-gray-50 text-gray-500 text-xs rounded">
                        +{project.tags.length - 5}
                      </span>
                    )}
                  </div>
                  
                  {project.language && (
                    <div className="text-gray-500 text-xs mt-2">
                      📦 {project.language}
                    </div>
                  )}

                  <div className="mt-3 pt-3 border-t text-xs text-gray-400 text-right">
                    点击查看详情 →
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  )
}
