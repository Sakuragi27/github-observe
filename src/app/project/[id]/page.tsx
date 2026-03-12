'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  ArrowLeft, Star, GitFork, ExternalLink, Heart,
  Sparkles, BookOpen, Tag, Share2, Loader2, Copy,
} from 'lucide-react'
import { AuthLayout } from '@/components/layout/auth-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { useToast } from '@/components/ui/toast'
import { api } from '@/lib/api'

interface ProjectDetail {
  id: string
  name: string
  fullName: string
  description: string | null
  htmlUrl: string
  stargazersCount: number
  language: string | null
  topics: string[]
  analysis: {
    tags: { name: string; category: string }[]
    solvedProblem: string
    useCases: string[]
    keyFeatures: string[]
  } | null
  solvedProblem: string | null
  isFavorite: boolean
  userNotes: string | null
  tags: { id: string; name: string; slug: string; category: string | null }[]
  starredAt: string | null
}

export default function ProjectDetailPage() {
  const params = useParams()
  const [project, setProject] = useState<ProjectDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [notes, setNotes] = useState('')
  const [savingNotes, setSavingNotes] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (!params.id) return
    api.get<{ data: ProjectDetail }>(`/api/projects/${params.id}`)
      .then((res) => {
        setProject(res.data)
        setNotes(res.data.userNotes || '')
      })
      .catch(() => toast('获取项目详情失败', 'error'))
      .finally(() => setLoading(false))
  }, [params.id, toast])

  const toggleFavorite = async () => {
    if (!project) return
    try {
      const res = await api.patch<{ data: ProjectDetail }>(`/api/projects/${project.id}`, {
        isFavorite: !project.isFavorite,
      })
      setProject(res.data)
      toast(res.data.isFavorite ? '已收藏' : '已取消收藏', 'success')
    } catch {
      toast('操作失败', 'error')
    }
  }

  const saveNotes = async () => {
    if (!project) return
    setSavingNotes(true)
    try {
      await api.patch(`/api/projects/${project.id}`, { userNotes: notes })
      toast('笔记已保存', 'success')
    } catch {
      toast('保存失败', 'error')
    } finally {
      setSavingNotes(false)
    }
  }

  const shareProject = async () => {
    if (!project) return
    try {
      const res = await api.post<{ data: { shareUrl: string } }>('/api/share', {
        projectId: project.id,
      })
      await navigator.clipboard.writeText(window.location.origin + res.data.shareUrl)
      toast('分享链接已复制到剪贴板', 'success')
    } catch {
      toast('创建分享失败', 'error')
    }
  }

  if (loading) {
    return (
      <AuthLayout>
        <div className="space-y-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </AuthLayout>
    )
  }

  if (!project) {
    return (
      <AuthLayout>
        <div className="text-center py-12">
          <h2 className="text-xl font-medium">项目不存在</h2>
          <Link href="/projects" className="text-primary hover:underline mt-2 inline-block">
            返回项目列表
          </Link>
        </div>
      </AuthLayout>
    )
  }

  const analysis = project.analysis

  return (
    <AuthLayout>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Breadcrumb */}
        <Link
          href="/projects"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          返回项目列表
        </Link>

        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold mb-2">{project.fullName}</h1>
            <p className="text-muted-foreground">{project.description || '暂无描述'}</p>
            <div className="flex items-center gap-4 mt-3">
              {project.language && (
                <Badge variant="secondary">
                  <span className="w-2 h-2 rounded-full bg-primary mr-1.5" />
                  {project.language}
                </Badge>
              )}
              <span className="flex items-center gap-1 text-sm text-muted-foreground">
                <Star className="h-4 w-4" />
                {project.stargazersCount.toLocaleString()}
              </span>
              {project.topics.length > 0 && (
                <div className="flex items-center gap-1.5">
                  {project.topics.slice(0, 5).map((topic) => (
                    <Badge key={topic} variant="outline" className="text-xs">{topic}</Badge>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={toggleFavorite}>
              <Heart className={`h-4 w-4 mr-2 ${project.isFavorite ? 'fill-rose-500 text-rose-500' : ''}`} />
              {project.isFavorite ? '已收藏' : '收藏'}
            </Button>
            <Button variant="outline" onClick={shareProject}>
              <Share2 className="h-4 w-4 mr-2" />
              分享
            </Button>
            <a href={project.htmlUrl} target="_blank" rel="noopener noreferrer">
              <Button>
                <ExternalLink className="h-4 w-4 mr-2" />
                GitHub
              </Button>
            </a>
          </div>
        </div>

        <Separator />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* AI Summary */}
            {analysis && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    AI 智能摘要
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium mb-1">解决的问题</h4>
                    <p className="text-sm text-muted-foreground">{analysis.solvedProblem}</p>
                  </div>

                  {analysis.keyFeatures.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium mb-2">核心特性</h4>
                      <ul className="space-y-1">
                        {analysis.keyFeatures.map((feature, i) => (
                          <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                            <span className="text-primary mt-0.5">-</span>
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {analysis.useCases.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium mb-2">适用场景</h4>
                      <div className="flex flex-wrap gap-2">
                        {analysis.useCases.map((uc, i) => (
                          <Badge key={i} variant="secondary">{uc}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* User notes */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-primary" />
                  我的笔记
                </CardTitle>
              </CardHeader>
              <CardContent>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="添加你的笔记..."
                  className="w-full min-h-[120px] bg-transparent border rounded-lg p-3 text-sm resize-y focus:outline-none focus:ring-2 focus:ring-ring"
                />
                <div className="flex justify-end mt-3">
                  <Button size="sm" onClick={saveNotes} disabled={savingNotes}>
                    {savingNotes && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                    保存笔记
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Tags */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Tag className="h-5 w-5 text-primary" />
                  标签
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {project.tags.map((tag) => (
                    <Link key={tag.id} href={`/projects?tags=${tag.slug}`}>
                      <Badge variant="secondary" className="cursor-pointer hover:bg-secondary/80">
                        {tag.name}
                      </Badge>
                    </Link>
                  ))}
                  {project.tags.length === 0 && (
                    <p className="text-sm text-muted-foreground">暂无标签</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Project info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">项目信息</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Star 数</span>
                  <span className="font-medium">{project.stargazersCount.toLocaleString()}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">语言</span>
                  <span className="font-medium">{project.language || '-'}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">收藏时间</span>
                  <span className="font-medium">
                    {project.starredAt
                      ? new Date(project.starredAt).toLocaleDateString('zh-CN')
                      : '-'}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </motion.div>
    </AuthLayout>
  )
}
