'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Tags, LayoutGrid, List, Search } from 'lucide-react'
import { AuthLayout } from '@/components/layout/auth-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { api } from '@/lib/api'
import type { Tag } from '@/lib/api'

export default function TagsPage() {
  const [tags, setTags] = useState<Tag[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [viewMode, setViewMode] = useState<'cloud' | 'list'>('cloud')

  useEffect(() => {
    api.get<{ data: Tag[] }>('/api/tags')
      .then((res) => setTags(res.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

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
                      <Link key={tag.id} href={`/projects?tags=${tag.slug}`}>
                        <Badge variant="outline" className="cursor-pointer hover:bg-accent">
                          {tag.name}
                          <span className="ml-1.5 text-muted-foreground">({tag.count})</span>
                        </Badge>
                      </Link>
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
                      <Link key={tag.id} href={`/projects?tags=${tag.slug}`}>
                        <Badge variant="outline" className="cursor-pointer hover:bg-accent">
                          {tag.name}
                          <span className="ml-1.5 text-muted-foreground">({tag.count})</span>
                        </Badge>
                      </Link>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </AuthLayout>
  )
}
