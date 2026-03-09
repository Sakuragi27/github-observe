'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface Tag {
  id: string
  name: string
  slug: string
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

export default function ProjectsPage() {
  const router = useRouter()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])

  useEffect(() => {
    const user = localStorage.getItem('user')
    if (!user) {
      router.push('/login')
      return
    }
    fetchProjects()
  }, [router])

  const fetchProjects = async (tags: string[] = [], searchTerm: string = '') => {
    setLoading(true)
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}')
      const params = new URLSearchParams({
        userId: user.id,
        ...(searchTerm && { search: searchTerm }),
        ...(tags.length > 0 && { tags: tags.join(',') }),
      })
      
      const res = await fetch('/api/projects?' + params)
      const data = await res.json()
      
      if (res.ok) {
        setProjects(data.data.projects)
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

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold">GitHub Stars Manager</h1>
          <div className="flex gap-4">
            <button onClick={() => router.push('/settings')} className="text-blue-500">设置</button>
            <button onClick={() => { localStorage.clear(); router.push('/login') }} className="text-gray-500">退出</button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <form onSubmit={handleSearch} className="mb-6">
          <div className="flex gap-2">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="搜索项目..."
              className="flex-1 px-4 py-2 border rounded-lg"
            />
            <button type="submit" className="px-6 py-2 bg-blue-500 text-white rounded-lg">搜索</button>
          </div>
        </form>

        {loading ? (
          <div className="text-center py-12 text-gray-500">加载中...</div>
        ) : projects.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            暂无项目，请先同步 GitHub Stars
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((project) => (
              <a
                key={project.id}
                href={project.htmlUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white p-4 rounded-lg shadow hover:shadow-md transition"
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-blue-600">{project.name}</h3>
                  <span className="text-yellow-500 text-sm">★ {project.stargazersCount}</span>
                </div>
                <p className="text-gray-600 text-sm mb-2 line-clamp-2">{project.description}</p>
                {project.solvedProblem && (
                  <p className="text-green-600 text-sm mb-2">解决: {project.solvedProblem}</p>
                )}
                <div className="flex flex-wrap gap-1 mt-2">
                  {project.tags.map((tag) => (
                    <span key={tag.id} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                      {tag.name}
                    </span>
                  ))}
                </div>
                {project.language && (
                  <div className="mt-2 text-gray-500 text-xs">{project.language}</div>
                )}
              </a>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
