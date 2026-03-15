'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Tags, LayoutGrid, List, Search, MoreHorizontal, Pencil, Trash2, GitMerge, Sparkles, Loader2 } from 'lucide-react'
import { AuthLayout } from '@/components/layout/auth-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/components/ui/toast'
import { useLanguage } from '@/providers/language-provider'
import { api } from '@/lib/api'
import type { Tag } from '@/lib/api'

export default function TagsPage() {
  const [tags, setTags] = useState<Tag[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [viewMode, setViewMode] = useState<'cloud' | 'list'>('cloud')
  const [editingTag, setEditingTag] = useState<Tag | null>(null)
  const [editName, setEditName] = useState('')
  const [deletingTag, setDeletingTag] = useState<Tag | null>(null)
  const [mergingTag, setMergingTag] = useState<Tag | null>(null)
  const [mergeTargetId, setMergeTargetId] = useState('')
  const [cleaning, setCleaning] = useState(false)
  const { toast } = useToast()
  const { t } = useLanguage()

  useEffect(() => {
    api.get<{ data: Tag[] }>('/api/tags')
      .then((res) => setTags(res.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const handleRename = async () => {
    if (!editingTag || !editName.trim()) return
    try {
      const res = await api.patch<{ data: Tag }>(`/api/tags/${editingTag.id}`, { name: editName.trim() })
      setTags(tags.map((t) => (t.id === editingTag.id ? { ...t, name: res.data.name, slug: res.data.slug } : t)))
      setEditingTag(null)
      toast(t('tags.tagRenamed'), 'success')
    } catch {
      toast(t('tags.renameFailed'), 'error')
    }
  }

  const handleDelete = async () => {
    if (!deletingTag) return
    try {
      await api.delete(`/api/tags/${deletingTag.id}`)
      setTags(tags.filter((t) => t.id !== deletingTag.id))
      setDeletingTag(null)
      toast(t('tags.tagDeleted'), 'success')
    } catch {
      toast(t('tags.deleteFailed'), 'error')
    }
  }

  const handleCleanup = async () => {
    setCleaning(true)
    try {
      const res = await api.post<{ data: { mergedCount: number; deletedCount: number } }>('/api/tags/cleanup')
      toast(`${t('tags.cleanupComplete')}: ${res.data.mergedCount} merged, ${res.data.deletedCount} deleted`, 'success')
      // Reload tags
      const tagsRes = await api.get<{ data: Tag[] }>('/api/tags')
      setTags(tagsRes.data)
    } catch {
      toast(t('tags.cleanupFailed'), 'error')
    } finally {
      setCleaning(false)
    }
  }

  const handleMerge = async () => {
    if (!mergingTag || !mergeTargetId) return
    try {
      await api.post('/api/tags/merge', { sourceId: mergingTag.id, targetId: mergeTargetId })
      // Remove source tag and update target count
      const sourceCount = mergingTag.count
      setTags(tags
        .filter((t) => t.id !== mergingTag.id)
        .map((t) => (t.id === mergeTargetId ? { ...t, count: t.count + sourceCount } : t))
      )
      setMergingTag(null)
      setMergeTargetId('')
      toast(t('tags.tagMerged'), 'success')
    } catch {
      toast(t('tags.mergeFailed'), 'error')
    }
  }

  const filtered = tags.filter((t) =>
    t.name.toLowerCase().includes(search.toLowerCase())
  )

  const maxCount = Math.max(...tags.map((t) => t.count), 1)
  const getTagSize = (count: number) => {
    const ratio = count / maxCount
    return 0.75 + ratio * 1.5 // 0.75rem to 2.25rem
  }

  const categories = Array.from(new Set(tags.map((t) => t.category).filter(Boolean)))

  const groupedTags = categories.reduce((acc, cat) => {
    acc[cat!] = filtered.filter((t) => t.category === cat)
    return acc
  }, {} as Record<string, Tag[]>)

  const uncategorized = filtered.filter((t) => !t.category)

  return (
    <AuthLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{t('tags.title')}</h1>
            <p className="text-muted-foreground mt-1">{tags.length} {t('common.tags')}</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCleanup}
              disabled={cleaning}
            >
              {cleaning ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Sparkles className="h-4 w-4 mr-1" />}
              {t('tags.cleanTags')}
            </Button>
            <Button
              variant={viewMode === 'cloud' ? 'default' : 'outline'}
              size="icon"
              onClick={() => setViewMode('cloud')}
            >
              <Tags className="h-4 w-4" />
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

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t('tags.searchPlaceholder')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <Skeleton key={i} className="h-16" />
            ))}
          </div>
        ) : viewMode === 'cloud' ? (
          /* Tag cloud */
          <Card>
            <CardContent className="p-8">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-wrap items-center justify-center gap-3"
              >
                {filtered.map((tag, i) => (
                  <motion.div
                    key={tag.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.02 }}
                    whileHover={{ scale: 1.1 }}
                  >
                    <Link href={`/projects?tags=${tag.slug}`}>
                      <Badge
                        variant="secondary"
                        className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                        style={{ fontSize: `${getTagSize(tag.count)}rem`, padding: '0.3em 0.8em' }}
                      >
                        {tag.name}
                        <span className="ml-1.5 opacity-60">{tag.count}</span>
                      </Badge>
                    </Link>
                  </motion.div>
                ))}
                {filtered.length === 0 && (
                  <p className="text-muted-foreground">{t('tags.noMatchingTags')}</p>
                )}
              </motion.div>
            </CardContent>
          </Card>
        ) : (
          /* List view grouped by category */
          <div className="space-y-6">
            {categories.map((cat) => (
              <Card key={cat}>
                <CardHeader>
                  <CardTitle className="text-lg">{cat}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {groupedTags[cat!]?.map((tag) => (
                      <div key={tag.id} className="flex items-center gap-1">
                        <Link href={`/projects?tags=${tag.slug}`}>
                          <Badge variant="outline" className="cursor-pointer hover:bg-accent">
                            {tag.name}
                            <span className="ml-1.5 text-muted-foreground">({tag.count})</span>
                          </Badge>
                        </Link>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-6 w-6">
                              <MoreHorizontal className="h-3 w-3" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => { setEditingTag(tag); setEditName(tag.name) }}>
                              <Pencil className="h-4 w-4 mr-2" />
                              {t('tags.rename')}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => { setMergingTag(tag); setMergeTargetId('') }}>
                              <GitMerge className="h-4 w-4 mr-2" />
                              {t('tags.mergeTo')}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setDeletingTag(tag)} className="text-destructive">
                              <Trash2 className="h-4 w-4 mr-2" />
                              {t('common.delete')}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
            {uncategorized.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">{t('tags.uncategorized')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {uncategorized.map((tag) => (
                      <div key={tag.id} className="flex items-center gap-1">
                        <Link href={`/projects?tags=${tag.slug}`}>
                          <Badge variant="outline" className="cursor-pointer hover:bg-accent">
                            {tag.name}
                            <span className="ml-1.5 text-muted-foreground">({tag.count})</span>
                          </Badge>
                        </Link>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-6 w-6">
                              <MoreHorizontal className="h-3 w-3" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => { setEditingTag(tag); setEditName(tag.name) }}>
                              <Pencil className="h-4 w-4 mr-2" />
                              {t('tags.rename')}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => { setMergingTag(tag); setMergeTargetId('') }}>
                              <GitMerge className="h-4 w-4 mr-2" />
                              {t('tags.mergeTo')}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setDeletingTag(tag)} className="text-destructive">
                              <Trash2 className="h-4 w-4 mr-2" />
                              {t('common.delete')}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Rename Dialog */}
        <Dialog open={!!editingTag} onOpenChange={(open) => !open && setEditingTag(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t('tags.renameTag')}</DialogTitle>
            </DialogHeader>
            <Input
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              placeholder={t('tags.enterNewName')}
              onKeyDown={(e) => { if (e.key === 'Enter') handleRename() }}
            />
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingTag(null)}>{t('common.cancel')}</Button>
              <Button onClick={handleRename}>{t('common.confirm')}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirm Dialog */}
        <Dialog open={!!deletingTag} onOpenChange={(open) => !open && setDeletingTag(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t('tags.confirmDelete')}</DialogTitle>
            </DialogHeader>
            <p className="text-sm text-muted-foreground">
              {t('tags.deleteConfirmMsg').replace('{name}', deletingTag?.name || '').replace('{count}', String(deletingTag?.count || 0))}
            </p>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeletingTag(null)}>{t('common.cancel')}</Button>
              <Button variant="destructive" onClick={handleDelete}>{t('common.delete')}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Merge Dialog */}
        <Dialog open={!!mergingTag} onOpenChange={(open) => { if (!open) { setMergingTag(null); setMergeTargetId('') } }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t('tags.mergeTags')}</DialogTitle>
            </DialogHeader>
            <p className="text-sm text-muted-foreground">
              {t('tags.mergeConfirmMsg').replace('{name}', mergingTag?.name || '')}
            </p>
            <Select value={mergeTargetId} onValueChange={setMergeTargetId}>
              <SelectTrigger>
                <SelectValue placeholder={t('tags.selectTarget')} />
              </SelectTrigger>
              <SelectContent>
                {tags
                  .filter((t) => t.id !== mergingTag?.id)
                  .map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.name} ({t.count})
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            <DialogFooter>
              <Button variant="outline" onClick={() => { setMergingTag(null); setMergeTargetId('') }}>{t('common.cancel')}</Button>
              <Button onClick={handleMerge} disabled={!mergeTargetId}>{t('tags.confirmMerge')}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AuthLayout>
  )
}
