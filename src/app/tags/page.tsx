'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Tags, LayoutGrid, List, Search, MoreHorizontal, Pencil, Trash2, GitMerge } from 'lucide-react'
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
  const { toast } = useToast()

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
      toast('标签已重命名', 'success')
    } catch {
      toast('重命名失败', 'error')
    }
  }

  const handleDelete = async () => {
    if (!deletingTag) return
    try {
      await api.delete(`/api/tags/${deletingTag.id}`)
      setTags(tags.filter((t) => t.id !== deletingTag.id))
      setDeletingTag(null)
      toast('标签已删除', 'success')
    } catch {
      toast('删除失败', 'error')
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
      toast('标签已合并', 'success')
    } catch {
      toast('合并失败', 'error')
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
            <h1 className="text-2xl font-bold">标签管理</h1>
            <p className="text-muted-foreground mt-1">{tags.length} 个标签</p>
          </div>
          <div className="flex gap-2">
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
            placeholder="搜索标签..."
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
                  <p className="text-muted-foreground">没有找到匹配的标签</p>
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
                              重命名
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => { setMergingTag(tag); setMergeTargetId('') }}>
                              <GitMerge className="h-4 w-4 mr-2" />
                              合并到...
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setDeletingTag(tag)} className="text-destructive">
                              <Trash2 className="h-4 w-4 mr-2" />
                              删除
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
                  <CardTitle className="text-lg">未分类</CardTitle>
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
                              重命名
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => { setMergingTag(tag); setMergeTargetId('') }}>
                              <GitMerge className="h-4 w-4 mr-2" />
                              合并到...
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setDeletingTag(tag)} className="text-destructive">
                              <Trash2 className="h-4 w-4 mr-2" />
                              删除
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
              <DialogTitle>重命名标签</DialogTitle>
            </DialogHeader>
            <Input
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              placeholder="输入新名称"
              onKeyDown={(e) => { if (e.key === 'Enter') handleRename() }}
            />
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingTag(null)}>取消</Button>
              <Button onClick={handleRename}>确认</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirm Dialog */}
        <Dialog open={!!deletingTag} onOpenChange={(open) => !open && setDeletingTag(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>确认删除</DialogTitle>
            </DialogHeader>
            <p className="text-sm text-muted-foreground">
              确定要删除标签「{deletingTag?.name}」吗？该标签下的 {deletingTag?.count || 0} 个项目关联将被移除，此操作不可撤销。
            </p>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeletingTag(null)}>取消</Button>
              <Button variant="destructive" onClick={handleDelete}>删除</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Merge Dialog */}
        <Dialog open={!!mergingTag} onOpenChange={(open) => { if (!open) { setMergingTag(null); setMergeTargetId('') } }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>合并标签</DialogTitle>
            </DialogHeader>
            <p className="text-sm text-muted-foreground">
              将「{mergingTag?.name}」合并到以下标签，合并后原标签将被删除：
            </p>
            <Select value={mergeTargetId} onValueChange={setMergeTargetId}>
              <SelectTrigger>
                <SelectValue placeholder="选择目标标签" />
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
              <Button variant="outline" onClick={() => { setMergingTag(null); setMergeTargetId('') }}>取消</Button>
              <Button onClick={handleMerge} disabled={!mergeTargetId}>确认合并</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AuthLayout>
  )
}
