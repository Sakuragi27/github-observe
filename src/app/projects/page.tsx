'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

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

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    checkAuth()
  }, [])

  useEffect(() => {
    if (user?.id) {
      fetchProjects()
      fetchTags()
    }
  }, [user, selectedTags])

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/user/token')
      const data = await res.json()
      if (data.success) {
        setUser(data.data?.user)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const fetchProjects = async () => {
    try {
      const tagParam = selectedTags.length > 0 ? `&tags=${selectedTags.join(',')}` : ''
      const res = await fetch(`/api/projects?userId=${user?.id}${tagParam}`)
      const data = await res.json()
      if (data.success) {
        setProjects(data.data.projects)
      }
    } catch (e) {
      console.error(e)
    }
  }

  const fetchTags = async () => {
    try {
      const res = await fetch('/api/tags')
      const data = await res.json()
      if (data.success) {
        setTags(data.data)
      }
    } catch (e) {
      console.error(e)
    }
  }

  const toggleTag = (slug: string) => {
    setSelectedTags(prev => 
      prev.includes(slug) 
        ? prev.filter(t => t !== slug)
        : [...prev, slug]
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">请先登录</p>
          <Link href="/login" className="text-blue-600 hover:underline">去登录</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/" className="text-xl font-bold text-blue-600">GitHub Observe</Link>
            <span className="text-gray-600">Stars ({projects.length})</span>
          </div>
          <div className="flex items-center space-x-4">
            <button className="p-2 hover:bg-gray-100 rounded-lg">
              🔍
            </button>
            <button 
              onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              {viewMode === 'grid' ? '☰' : '⊞'}
            </button>
          </div>
        </div>
      </header>

      {/* Active Filters */}
      {selectedTags.length > 0 && (
        <div className="bg-white border-b px-4 py-2 flex items-center gap-2">
          <span className="text-sm text-gray-600">活跃筛选：</span>
          {selectedTags.map(tag => (
            <button
              key={tag}
              onClick={() => toggleTag(tag)}
              className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm flex items-center gap-1"
            >
              {tag} ✕
            </button>
          ))}
          <button 
            onClick={() => setSelectedTags([])}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            清除全部
          </button>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Sidebar Filters */}
          <aside className="w-64 flex-shrink-0">
            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="font-semibold text-gray-900 mb-4">筛选</h3>
              <div>
                <h4 className="text-sm text-gray-600 mb-2">标签</h4>
                <div className="flex flex-wrap gap-2">
                  {tags.map(tag => (
                    <button
                      key={tag.id}
                      onClick={() => toggleTag(tag.slug)}
                      className={`px-3 py-1 rounded-full text-sm ${
                        selectedTags.includes(tag.slug)
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {tag.name} ({tag.count})
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Projects Grid/List */}
          <main className="flex-1">
            {loading ? (
              <div className="text-center py-12 text-gray-500">加载中...</div>
            ) : projects.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                暂无项目，请先同步 GitHub Stars
              </div>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {projects.map(project => (
                  <div key={project.id} className="bg-white rounded-lg shadow p-4 hover:shadow-md transition">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-gray-900">{project.name}</h3>
                      <a href={project.htmlUrl} target="_blank" className="text-gray-400 hover:text-gray-600">🔗</a>
                    </div>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{project.description}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <span>⭐ {project.stargazersCount}</span>
                        {project.language && <span>• {project.language}</span>}
                      </div>
                    </div>
                    {project.tags?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-3">
                        {project.tags.map((tag: any) => (
                          <span key={tag.id} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
                            {tag.name}
                          </span>
                        ))}
                      </div>
                    )}
                    <Link 
                      href={`/project/${project.id}`}
                      className="mt-3 block text-center text-blue-600 hover:text-blue-700 text-sm"
                    >
                      查看详情 →
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {projects.map(project => (
                  <div key={project.id} className="bg-white rounded-lg shadow p-4 hover:shadow-md transition">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{project.fullName}</h3>
                        <p className="text-sm text-gray-600">{project.description}</p>
                      </div>
                      <div className="flex items-center gap-4 ml-4">
                        <span className="text-lg">⭐ {project.stargazersCount}</span>
                        <Link 
                          href={`/project/${project.id}`}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                          查看
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}
