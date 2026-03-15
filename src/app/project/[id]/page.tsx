'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  ArrowLeft, Star, GitFork, ExternalLink, Heart,
  Sparkles, BookOpen, Tag, Share2, Loader2, Copy, X, FileText,
} from 'lucide-react'
import { AuthLayout } from '@/components/layout/auth-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { useToast } from '@/components/ui/toast'
import { useLanguage } from '@/providers/language-provider'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
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
  readme: string | null
  analysis: {
    tags: { name: string; category: string }[]
    solvedProblem: string
    useCases: string[]
    keyFeatures: string[]
    detailedSummary: string
    solvedProblemEn: string
    useCasesEn: string[]
    keyFeaturesEn: string[]
    detailedSummaryEn: string
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
  const [newTagName, setNewTagName] = useState('')
  const { lang, t } = useLanguage()
  const { toast } = useToast()

  useEffect(() => {
    if (!params.id) return
    api.get<{ data: ProjectDetail }>(`/api/projects/${params.id}`)
      .then((res) => {
        setProject(res.data)
        setNotes(res.data.userNotes || '')
      })
      .catch(() => toast(t('projectDetail.fetchFailed'), 'error'))
      .finally(() => setLoading(false))
  }, [params.id, toast])

  const toggleFavorite = async () => {
    if (!project) return
    try {
      const res = await api.patch<{ data: ProjectDetail }>(`/api/projects/${project.id}`, {
        isFavorite: !project.isFavorite,
      })
      setProject(res.data)
      toast(res.data.isFavorite ? t('common.saved') : t('common.unsaved'), 'success')
    } catch {
      toast(t('common.operationFailed'), 'error')
    }
  }

  const saveNotes = async () => {
    if (!project) return
    setSavingNotes(true)
    try {
      await api.patch(`/api/projects/${project.id}`, { userNotes: notes })
      toast(t('projectDetail.notesSaved'), 'success')
    } catch {
      toast(t('settings.saveFailed'), 'error')
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
      toast(t('projectDetail.shareCopied'), 'success')
    } catch {
      toast(t('projectDetail.shareFailed'), 'error')
    }
  }

  const addTag = async () => {
    if (!project || !newTagName.trim()) return
    try {
      const res = await api.post<{ data: { id: string; name: string; slug: string; category: string | null }[] }>(
        `/api/projects/${project.id}/tags`,
        { tagName: newTagName.trim() }
      )
      setProject({ ...project, tags: res.data })
      setNewTagName('')
      toast(t('projectDetail.tagAdded'), 'success')
    } catch {
      toast(t('projectDetail.tagAddFailed'), 'error')
    }
  }

  const removeTag = async (tagId: string) => {
    if (!project) return
    try {
      const res = await api.delete<{ data: { id: string; name: string; slug: string; category: string | null }[] }>(
        `/api/projects/${project.id}/tags?tagId=${tagId}`
      )
      setProject({ ...project, tags: res.data })
      toast(t('projectDetail.tagRemoved'), 'success')
    } catch {
      toast(t('projectDetail.tagRemoveFailed'), 'error')
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
          <h2 className="text-xl font-medium">{t('projectDetail.projectNotFound')}</h2>
          <Link href="/projects" className="text-primary hover:underline mt-2 inline-block">
            {t('projectDetail.backToProjects')}
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
          {t('projectDetail.backToProjects')}
        </Link>

        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold mb-2">{project.fullName}</h1>
            <p className="text-muted-foreground">{project.description || t('common.noDescription')}</p>
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
              {project.isFavorite ? t('common.saved') : t('projectDetail.save')}
            </Button>
            <Button variant="outline" onClick={shareProject}>
              <Share2 className="h-4 w-4 mr-2" />
              {t('projectDetail.share')}
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
                    {t('projectDetail.aiSummary')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium mb-1">
                      {t('projectDetail.problemSolved')}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {lang === 'zh' ? analysis.solvedProblem : (analysis.solvedProblemEn || analysis.solvedProblem)}
                    </p>
                  </div>

                  {((lang === 'zh' ? analysis.keyFeatures : (analysis.keyFeaturesEn || analysis.keyFeatures)) || []).length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium mb-2">
                        {t('projectDetail.keyFeatures')}
                      </h4>
                      <ul className="space-y-1">
                        {(lang === 'zh' ? analysis.keyFeatures : (analysis.keyFeaturesEn || analysis.keyFeatures)).map((feature, i) => (
                          <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                            <span className="text-primary mt-0.5">-</span>
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {((lang === 'zh' ? analysis.useCases : (analysis.useCasesEn || analysis.useCases)) || []).length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium mb-2">
                        {t('projectDetail.useCases')}
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {(lang === 'zh' ? analysis.useCases : (analysis.useCasesEn || analysis.useCases)).map((uc, i) => (
                          <Badge key={i} variant="secondary">{uc}</Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {(lang === 'zh' ? analysis.detailedSummary : (analysis.detailedSummaryEn || analysis.detailedSummary)) && (
                    <div>
                      <h4 className="text-sm font-medium mb-2">
                        {t('projectDetail.detailedIntro')}
                      </h4>
                      <p className="text-sm text-muted-foreground whitespace-pre-line leading-relaxed">
                        {lang === 'zh' ? analysis.detailedSummary : (analysis.detailedSummaryEn || analysis.detailedSummary)}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* README */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  README
                </CardTitle>
              </CardHeader>
              <CardContent>
                {project.readme ? (
                  <div className="prose prose-sm dark:prose-invert max-w-none max-h-[600px] overflow-y-auto">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {project.readme}
                    </ReactMarkdown>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">{t('projectDetail.noReadme')}</p>
                )}
              </CardContent>
            </Card>

            {/* User notes */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-primary" />
                  {t('projectDetail.myNotes')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={t('projectDetail.addNotesPlaceholder')}
                  className="w-full min-h-[120px] bg-transparent border rounded-lg p-3 text-sm resize-y focus:outline-none focus:ring-2 focus:ring-ring"
                />
                <div className="flex justify-end mt-3">
                  <Button size="sm" onClick={saveNotes} disabled={savingNotes}>
                    {savingNotes && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                    {t('projectDetail.saveNotes')}
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
                  {t('projectDetail.tags')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {project.tags.map((tag) => (
                    <Badge key={tag.id} variant="secondary" className="group cursor-pointer hover:bg-secondary/80">
                      <Link href={`/projects?tags=${tag.slug}`}>
                        {tag.name}
                      </Link>
                      <button
                        onClick={(e) => { e.preventDefault(); removeTag(tag.id) }}
                        className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                  {project.tags.length === 0 && (
                    <p className="text-sm text-muted-foreground">{t('projectDetail.noTags')}</p>
                  )}
                </div>
                <div className="mt-3">
                  <Input
                    placeholder={t('projectDetail.addTagPlaceholder')}
                    value={newTagName}
                    onChange={(e) => setNewTagName(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') addTag() }}
                    className="text-sm"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Project info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">{t('projectDetail.projectInfo')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{t('projectDetail.stars')}</span>
                  <span className="font-medium">{project.stargazersCount.toLocaleString()}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{t('projectDetail.language')}</span>
                  <span className="font-medium">{project.language || '-'}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{t('projectDetail.starredAt')}</span>
                  <span className="font-medium">
                    {project.starredAt
                      ? new Date(project.starredAt).toLocaleDateString(lang === 'zh' ? 'zh-CN' : 'en-US')
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
