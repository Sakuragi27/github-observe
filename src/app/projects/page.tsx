'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, Filter, LayoutGrid, List, Star, ExternalLink,
  Heart, ChevronLeft, ChevronRight, SlidersHorizontal, X,
} from 'lucide-react'
import { AuthLayout } from '@/components/layout/auth-layout'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/components/ui/toast'
import { useLanguage } from '@/providers/language-provider'
import { api } from '@/lib/api'
import type { Project, Tag, ProjectListResponse } from '@/lib/api'

export default function ProjectsPage() {
  const [projects, setProjects] = useState<any[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showFilters, setShowFilters] = useState(false)

  // Filters
  const [search, setSearch] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [selectedLanguage, setSelectedLanguage] = useState('')
  const [favoriteOnly, setFavoriteOnly] = useState(false)
  const [sort, setSort] = useState('starredAt')
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({ total: 0, totalPages: 0 })

  const { toast } = useToast()
  const { t } = useLanguage()

  const fetchProjects = useCallback(async () => {
    setLoading(true)
    try {
      const res = await api.get<{ data: ProjectListResponse }>('/api/projects', {
        page,
        limit: 20,
        search,
        tags: selectedTags.join(','),
        language: selectedLanguage,
        favorite: favoriteOnly ? 'true' : undefined,
        sort,
      })
      setProjects(res.data.projects)
      setPagination({ total: res.data.pagination.total, totalPages: res.data.pagination.totalPages })
    } catch {
      toast(t('projects.fetchFailed'), 'error')
    } finally {
      setLoading(false)
    }
  }, [page, search, selectedTags, selectedLanguage, favoriteOnly, sort, toast])

  useEffect(() => {
    fetchProjects()
  }, [fetchProjects])

  useEffect(() => {
    api.get<{ data: Tag[] }>('/api/tags').then((res) => setTags(res.data)).catch(() => {})
  }, [])

  // Debounced search
  const [searchInput, setSearchInput] = useState('')
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput)
      setPage(1)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchInput])

  const toggleTag = (slug: string) => {
    setSelectedTags((prev) =>
      prev.includes(slug) ? prev.filter((t) => t !== slug) : [...prev, slug]
    )
    setPage(1)
  }

  const toggleFavorite = async (projectId: string, current: boolean) => {
    try {
      await api.patch(`/api/projects/${projectId}`, { isFavorite: !current })
      setProjects((prev) =>
        prev.map((p) => (p.id === projectId ? { ...p, isFavorite: !current } : p))
      )
      toast(!current ? t('common.saved') : t('common.unsaved'), 'success')
    } catch {
      toast(t('common.operationFailed'), 'error')
    }
  }

  const languages = Array.from(new Set(projects.map((p) => p.language).filter(Boolean)))

  return (
    <AuthLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">{t('projects.title')}</h1>
            <p className="text-muted-foreground mt-1">{pagination.total} {t('common.projects')}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="icon"
              onClick={() => setViewMode('grid')}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="icon"
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Search & Filter bar */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t('projects.searchPlaceholder')}
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button
            variant={showFilters ? 'default' : 'outline'}
            onClick={() => setShowFilters(!showFilters)}
            className="gap-2"
          >
            <SlidersHorizontal className="h-4 w-4" />
            {t('projects.filter')}
          </Button>
          <Button
            variant={favoriteOnly ? 'default' : 'outline'}
            size="icon"
            onClick={() => { setFavoriteOnly(!favoriteOnly); setPage(1) }}
          >
            <Heart className={`h-4 w-4 ${favoriteOnly ? 'fill-current' : ''}`} />
          </Button>
        </div>

        {/* Filter drawer */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <Card>
                <CardContent className="p-4 space-y-4">
                  {/* Tags */}
                  <div>
                    <h4 className="text-sm font-medium mb-2">{t('projects.filterByTag')}</h4>
                    <div className="flex flex-wrap gap-2">
                      {tags.slice(0, 20).map((tag) => (
                        <Badge
                          key={tag.slug}
                          variant={selectedTags.includes(tag.slug) ? 'default' : 'outline'}
                          className="cursor-pointer"
                          onClick={() => toggleTag(tag.slug)}
                        >
                          {tag.name} ({tag.count})
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Language */}
                  <div>
                    <h4 className="text-sm font-medium mb-2">{t('projects.filterByLanguage')}</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedLanguage && (
                        <Badge variant="default" className="cursor-pointer" onClick={() => { setSelectedLanguage(''); setPage(1) }}>
                          {selectedLanguage} <X className="h-3 w-3 ml-1" />
                        </Badge>
                      )}
                      {languages.filter((l) => l !== selectedLanguage).slice(0, 10).map((lang) => (
                        <Badge
                          key={lang}
                          variant="outline"
                          className="cursor-pointer"
                          onClick={() => { setSelectedLanguage(lang); setPage(1) }}
                        >
                          {lang}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Sort */}
                  <div>
                    <h4 className="text-sm font-medium mb-2">{t('projects.sort')}</h4>
                    <div className="flex gap-2">
                      {[
                        { key: 'starredAt', label: t('projects.starredDate') },
                        { key: 'stargazersCount', label: t('projects.stars') },
                        { key: 'name', label: t('projects.name') },
                      ].map((s) => (
                        <Badge
                          key={s.key}
                          variant={sort === s.key ? 'default' : 'outline'}
                          className="cursor-pointer"
                          onClick={() => setSort(s.key)}
                        >
                          {s.label}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Project grid/list */}
        {loading ? (
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-3'}>
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i}>
                <CardContent className="p-5">
                  <Skeleton className="h-5 w-3/4 mb-3" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-1/2" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : projects.length === 0 ? (
          <Card className="p-12 text-center">
            <Search className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">{t('projects.noProjects')}</h3>
            <p className="text-muted-foreground">{t('projects.noProjectsHint')}</p>
          </Card>
        ) : viewMode === 'grid' ? (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {projects.map((project) => (
              <motion.div key={project.id} whileHover={{ y: -3 }} transition={{ duration: 0.2 }}>
                <Link href={`/project/${project.id}`}>
                  <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-medium text-sm truncate flex-1">{project.fullName}</h3>
                        <div className="flex items-center gap-1.5 ml-2 shrink-0">
                          <button
                            onClick={(e) => { e.preventDefault(); toggleFavorite(project.id, project.isFavorite) }}
                            className="text-muted-foreground hover:text-rose-500 transition-colors"
                          >
                            <Heart className={`h-4 w-4 ${project.isFavorite ? 'fill-rose-500 text-rose-500' : ''}`} />
                          </button>
                          <a
                            href={project.htmlUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="text-muted-foreground hover:text-foreground"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                        </div>
                      </div>

                      <p className="text-xs text-muted-foreground line-clamp-2 mb-3 min-h-[2rem]">
                        {project.solvedProblem || project.description || t('common.noDescription')}
                      </p>

                      <div className="flex items-center gap-2 flex-wrap mb-3">
                        {project.tags?.slice(0, 3).map((tag: any) => (
                          <Badge key={tag.id || tag.slug} variant="secondary" className="text-xs">
                            {tag.name}
                          </Badge>
                        ))}
                      </div>

                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        {project.language && (
                          <span className="flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-primary" />
                            {project.language}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Star className="h-3 w-3" />
                          {project.stargazersCount?.toLocaleString()}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <div className="space-y-2">
            {projects.map((project) => (
              <Link key={project.id} href={`/project/${project.id}`}>
                <Card className="hover:shadow-sm transition-shadow">
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium text-sm truncate">{project.fullName}</h3>
                        {project.language && (
                          <Badge variant="secondary" className="text-xs shrink-0">{project.language}</Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">
                        {project.solvedProblem || project.description || t('common.noDescription')}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Star className="h-3 w-3" />
                        {project.stargazersCount?.toLocaleString()}
                      </span>
                      <button
                        onClick={(e) => { e.preventDefault(); toggleFavorite(project.id, project.isFavorite) }}
                        className="text-muted-foreground hover:text-rose-500"
                      >
                        <Heart className={`h-4 w-4 ${project.isFavorite ? 'fill-rose-500 text-rose-500' : ''}`} />
                      </button>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-center gap-4">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              {t('projects.previous')}
            </Button>
            <span className="text-sm text-muted-foreground">
              {page} / {pagination.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page === pagination.totalPages}
              onClick={() => setPage(page + 1)}
            >
              {t('projects.next')}
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        )}
      </div>
    </AuthLayout>
  )
}
