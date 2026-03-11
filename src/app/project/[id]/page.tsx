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
  forksCount: number
  openIssuesCount: number
  language: string | null
  solvedProblem: string | null
  tags: Tag[]
  starredAt: string | null
  syncedAt: string | null
  topics: string[]
  analysis?: any
  readme?: string
}

// 模拟项目数据
const mockProject: Project = {
  id: '1',
  name: 'next.js',
  fullName: 'vercel/next.js',
  description: 'The React Framework for Production',
  htmlUrl: 'https://github.com/vercel/next.js',
  stargazersCount: 218000,
  forksCount: 89500,
  openIssuesCount: 3210,
  language: 'TypeScript',
  solvedProblem: '提供完善的 SSR/SSG 支持，解决首屏加载慢和 SEO 问题',
  tags: [
    { id: '1', name: '前端', slug: 'frontend' },
    { id: '2', name: '框架', slug: 'framework' },
  ],
  topics: ['react', 'ssr', 'framework', 'vercel'],
  starredAt: '2024-01-15',
  syncedAt: '2024-01-20',
  readme: '# Next.js\n\nThe React Framework for Production\n\n## Features\n- SSR/SSG Support\n- File-system Routing\n- API Routes\n- Fast Refresh',
}

const relatedProjects = [
  { name: 'vercel/next.js', desc: 'The React Framework', stars: '218k' },
  { name: 'facebook/react', desc: 'A declarative UI library', stars: '219k' },
  { name: 'vercel/next.js', desc: 'React Framework', stars: '218k' },
]

export default function ProjectDetailPage() {
  const router = useRouter()
  const params = useParams()
  const projectId = params.id as string

  const [project, setProject] = useState<Project | null>(mockProject)
  const [loading, setLoading] = useState(false)

  const handleLogout = () => {
    localStorage.removeItem('token')
    router.push('/login')
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white">加载中...</div>
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
            <a href="/projects" className="flex items-center gap-3 px-4 py-3 bg-white/10 text-white rounded-xl">
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
          {/* 项目头部 */}
          <div className="mb-8">
            <a href="/projects" className="inline-flex items-center gap-2 text-white/60 hover:text-white mb-4 transition">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              返回项目列表
            </a>
            
            <div className="flex items-start gap-6">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-2xl flex items-center justify-center text-4xl">
                📂
              </div>
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-white mb-2">{project.fullName}</h1>
                <p className="text-white/60 text-lg mb-4">{project.description}</p>
                <div className="flex items-center gap-4">
                  <span className="px-3 py-1.5 bg-white/10 text-white/80 rounded-lg text-sm">{project.language}</span>
                  {project.topics.map(topic => (
                    <span key={topic} className="px-3 py-1.5 bg-purple-500/20 text-purple-400 rounded-lg text-sm">
                      {topic}
                    </span>
                  ))}
                </div>
              </div>
              <a 
                href={project.htmlUrl} 
                target="_blank" 
                className="px-6 py-3 bg-white text-gray-900 rounded-xl font-medium hover:bg-gray-100 transition"
              >
                在 GitHub 查看 →
              </a>
            </div>
          </div>

          {/* 统计卡片 */}
          <div className="grid grid-cols-4 gap-4 mb-8">
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6">
              <div className="text-white/40 text-sm mb-2">Stars</div>
              <div className="text-3xl font-bold text-white">{project.stargazersCount.toLocaleString()}</div>
            </div>
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6">
              <div className="text-white/40 text-sm mb-2">Forks</div>
              <div className="text-3xl font-bold text-white">{project.forksCount.toLocaleString()}</div>
            </div>
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6">
              <div className="text-white/40 text-sm mb-2">Issues</div>
              <div className="text-3xl font-bold text-white">{project.openIssuesCount.toLocaleString()}</div>
            </div>
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6">
              <div className="text-white/40 text-sm mb-2">Last Updated</div>
              <div className="text-3xl font-bold text-white">2h</div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-6">
            {/* 左侧主要内容 */}
            <div className="col-span-2 space-y-6">
              {/* AI 摘要 */}
              <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-2xl">🤖</span>
                  <h2 className="text-xl font-bold text-white">AI 智能摘要</h2>
                </div>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-white/80 font-medium mb-2">解决的问题</h3>
                    <p className="text-white/60">{project.solvedProblem}</p>
                  </div>
                  <div>
                    <h3 className="text-white/80 font-medium mb-2">技术特点</h3>
                    <ul className="text-white/60 space-y-1">
                      <li>• 提供完善的 SSR/SSG 支持</li>
                      <li>• 文件系统路由</li>
                      <li>• API 路由</li>
                      <li>• 快速热重载</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* README 预览 */}
              <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6">
                <h2 className="text-xl font-bold text-white mb-4">README 预览</h2>
                <div className="bg-white/5 rounded-xl p-4 text-white/60 font-mono text-sm whitespace-pre-wrap">
{`# ${project.name}

${project.description}

## Features
- SSR/SSG Support
- File-system Routing
- API Routes
- Fast Refresh`}
                </div>
              </div>
            </div>

            {/* 右侧边栏 */}
            <div className="space-y-6">
              {/* 标签管理 */}
              <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6">
                <h2 className="text-lg font-bold text-white mb-4">标签管理</h2>
                <div className="flex flex-wrap gap-2 mb-4">
                  {project.tags.map(tag => (
                    <span key={tag.id} className="px-3 py-1.5 bg-purple-500/20 text-purple-400 rounded-lg text-sm flex items-center gap-2">
                      {tag.name}
                      <button className="hover:text-white">×</button>
                    </span>
                  ))}
                </div>
                <button className="w-full py-2 border border-white/20 text-white/60 rounded-lg text-sm hover:bg-white/5 transition">
                  + 添加标签
                </button>
              </div>

              {/* 相关推荐 */}
              <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6">
                <h2 className="text-lg font-bold text-white mb-4">相关推荐</h2>
                <div className="space-y-3">
                  {relatedProjects.map((p, i) => (
                    <div key={i} className="p-3 bg-white/5 rounded-xl hover:bg-white/10 cursor-pointer transition">
                      <div className="text-white font-medium text-sm">{p.name}</div>
                      <div className="text-white/40 text-xs">{p.desc}</div>
                      <div className="text-purple-400 text-xs mt-1">⭐ {p.stars}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
