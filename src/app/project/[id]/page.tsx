'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'

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
  syncedAt: string | null
  topics: string[]
  analysis: any
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

export default function ProjectDetailPage() {
  const router = useRouter()
  const params = useParams()
  const projectId = params.id as string

  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const user = localStorage.getItem('user')
    if (!user) {
      router.push('/login')
      return
    }
    fetchProject()
  }, [projectId, router])

  const fetchProject = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/projects/${projectId}`, {
        headers: getAuthHeaders(),
      })
      const data = await res.json()
      
      if (res.ok) {
        setProject(data.data)
      } else {
        if (res.status === 401) {
          router.push('/login')
        } else {
          alert(data.error || '项目不存在')
          router.push('/projects')
        }
      }
    } catch (err) {
      console.error('Failed to fetch project:', err)
      alert('加载失败')
      router.push('/projects')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">加载中...</div>
      </div>
    )
  }

  if (!project) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <button 
            onClick={() => router.push('/projects')} 
            className="text-blue-500 hover:text-blue-600"
          >
            ← 返回列表
          </button>
          <h1 className="text-xl font-bold">项目详情</h1>
          <div className="w-20"></div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg p-6">
          {/* 项目标题 */}
          <div className="mb-6">
            <div className="flex items-start justify-between mb-2">
              <h2 className="text-2xl font-bold text-gray-900">{project.name}</h2>
              <span className="text-yellow-500 text-lg whitespace-nowrap ml-4">
                ★ {project.stargazersCount}
              </span>
            </div>
            <p className="text-gray-500 text-sm mb-2">{project.fullName}</p>
            <a 
              href={project.htmlUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-500 hover:text-blue-600 text-sm"
            >
              {project.htmlUrl} →
            </a>
          </div>

          {/* 项目描述 */}
          {project.description && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">项目简介</h3>
              <p className="text-gray-700">{project.description}</p>
            </div>
          )}

          {/* 解决的问题 */}
          {project.solvedProblem && (
            <div className="mb-6 bg-green-50 p-4 rounded-lg">
              <h3 className="text-sm font-semibold text-green-800 mb-2">💡 解决的问题</h3>
              <p className="text-green-700">{project.solvedProblem}</p>
            </div>
          )}

          {/* 标签 */}
          {project.tags.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">标签分类</h3>
              <div className="flex flex-wrap gap-2">
                {project.tags.map((tag) => (
                  <span 
                    key={tag.id} 
                    className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full text-sm font-medium"
                  >
                    #{tag.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Topics */}
          {project.topics && project.topics.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">GitHub Topics</h3>
              <div className="flex flex-wrap gap-2">
                {project.topics.map((topic, idx) => (
                  <span 
                    key={idx} 
                    className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs"
                  >
                    {topic}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* 技术信息 */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            {project.language && (
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-1">主要语言</h3>
                <p className="text-gray-600">{project.language}</p>
              </div>
            )}
            {project.starredAt && (
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-1">Star 时间</h3>
                <p className="text-gray-600">
                  {new Date(project.starredAt).toLocaleDateString('zh-CN')}
                </p>
              </div>
            )}
            {project.syncedAt && (
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-1">最后同步</h3>
                <p className="text-gray-600">
                  {new Date(project.syncedAt).toLocaleDateString('zh-CN')}
                </p>
              </div>
            )}
          </div>

          {/* AI 分析结果 */}
          {project.analysis && (
            <div className="mt-6 pt-6 border-t">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">AI 分析结果</h3>
              <pre className="bg-gray-50 p-4 rounded text-xs text-gray-700 overflow-auto">
                {JSON.stringify(project.analysis, null, 2)}
              </pre>
            </div>
          )}

          {/* 操作按钮 */}
          <div className="mt-6 pt-6 border-t flex gap-3">
            <a
              href={project.htmlUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              在 GitHub 查看
            </a>
            <button
              onClick={() => router.push('/projects')}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            >
              返回列表
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}
