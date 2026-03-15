'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  FolderGit2, Tags, Star, RefreshCw, ExternalLink, Clock, TrendingUp, Heart,
} from 'lucide-react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, BarChart, Bar, XAxis, YAxis } from 'recharts'
import { AuthLayout } from '@/components/layout/auth-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useLanguage } from '@/providers/language-provider'
import { api } from '@/lib/api'

interface DashboardData {
  totalProjects: number
  taggedCount: number
  favoriteCount: number
  analyzedCount: number
  lastSyncedAt: string | null
  languageDistribution: { name: string; value: number }[]
  tagDistribution: { name: string; value: number }[]
  recentProjects: any[]
}

const COLORS = ['hsl(221, 83%, 53%)', 'hsl(160, 60%, 45%)', 'hsl(30, 80%, 55%)', 'hsl(280, 65%, 60%)', 'hsl(340, 75%, 55%)', 'hsl(200, 70%, 50%)', 'hsl(100, 50%, 45%)', 'hsl(45, 90%, 50%)']

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
}

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const { lang, t } = useLanguage()

  useEffect(() => {
    api.get<{ data: DashboardData }>('/api/dashboard')
      .then((res) => setStats(res.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const statCards = stats
    ? [
        { label: t('dashboard.totalProjects'), value: stats.totalProjects, icon: FolderGit2, color: 'text-blue-500' },
        { label: t('dashboard.tagged'), value: stats.taggedCount, icon: Tags, color: 'text-emerald-500' },
        { label: t('dashboard.favorites'), value: stats.favoriteCount, icon: Heart, color: 'text-rose-500' },
        {
          label: t('dashboard.lastSynced'),
          value: stats.lastSyncedAt
            ? new Date(stats.lastSyncedAt).toLocaleDateString(lang === 'zh' ? 'zh-CN' : 'en-US')
            : t('dashboard.notSynced'),
          icon: RefreshCw,
          color: 'text-amber-500',
        },
      ]
    : []

  return (
    <AuthLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-1">{t('dashboard.subtitle')}</p>
        </div>

        {/* Stat cards */}
        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <Skeleton className="h-4 w-20 mb-3" />
                  <Skeleton className="h-8 w-16" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-2 lg:grid-cols-4 gap-4"
          >
            {statCards.map((card) => (
              <motion.div key={card.label} variants={fadeUp}>
                <Card className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm text-muted-foreground">{card.label}</span>
                      <card.icon className={`h-5 w-5 ${card.color}`} />
                    </div>
                    <div className="text-2xl font-bold">{card.value}</div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Charts */}
        {stats && (
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 lg:grid-cols-2 gap-6"
          >
            {/* Language pie chart */}
            <motion.div variants={fadeUp}>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    {t('dashboard.languageDistribution')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {stats.languageDistribution.length > 0 ? (
                    <>
                      <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                          <Pie
                            data={stats.languageDistribution}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={90}
                            paddingAngle={3}
                            dataKey="value"
                          >
                            {stats.languageDistribution.map((_, i) => (
                              <Cell key={i} fill={COLORS[i % COLORS.length]} />
                            ))}
                          </Pie>
                          <RechartsTooltip
                            contentStyle={{
                              backgroundColor: 'hsl(var(--card))',
                              border: '1px solid hsl(var(--border))',
                              borderRadius: '8px',
                              color: 'hsl(var(--foreground))',
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="flex flex-wrap gap-3 mt-4">
                        {stats.languageDistribution.slice(0, 6).map((lang, i) => (
                          <div key={lang.name} className="flex items-center gap-1.5 text-xs">
                            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                            <span className="text-muted-foreground">{lang.name}</span>
                            <span className="font-medium">{lang.value}</span>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="h-[250px] flex items-center justify-center text-muted-foreground">{t('common.noData')}</div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Tag bar chart */}
            <motion.div variants={fadeUp}>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Tags className="h-5 w-5 text-primary" />
                    {t('dashboard.popularTags')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {stats.tagDistribution.length > 0 ? (
                    <ResponsiveContainer width="100%" height={280}>
                      <BarChart data={stats.tagDistribution.slice(0, 8)} layout="vertical">
                        <XAxis type="number" hide />
                        <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
                        <RechartsTooltip
                          contentStyle={{
                            backgroundColor: 'hsl(var(--card))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px',
                            color: 'hsl(var(--foreground))',
                          }}
                        />
                        <Bar dataKey="value" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-[280px] flex items-center justify-center text-muted-foreground">{t('dashboard.noTagData')}</div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        )}

        {/* Recent projects */}
        {stats && stats.recentProjects.length > 0 && (
          <motion.div variants={fadeUp} initial="hidden" animate="show">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  {t('dashboard.recentlyStarred')}
                </CardTitle>
                <Link href="/projects" className="text-sm text-primary hover:underline">
                  {t('dashboard.viewAll')}
                </Link>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {stats.recentProjects.map((project: any) => (
                    <Link key={project.id} href={`/project/${project.id}`}>
                      <motion.div
                        whileHover={{ y: -2 }}
                        className="p-4 rounded-lg border bg-card hover:shadow-md transition-all"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-medium text-sm truncate flex-1">{project.fullName}</h3>
                          <a
                            href={project.htmlUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="text-muted-foreground hover:text-foreground ml-2"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                          {project.description || t('common.noDescription')}
                        </p>
                        <div className="flex items-center gap-2 flex-wrap">
                          {project.language && (
                            <Badge variant="secondary" className="text-xs">{project.language}</Badge>
                          )}
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Star className="h-3 w-3" />
                            {project.stargazersCount?.toLocaleString()}
                          </div>
                        </div>
                      </motion.div>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Empty state */}
        {!loading && stats && stats.totalProjects === 0 && (
          <Card className="p-12 text-center">
            <FolderGit2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">{t('dashboard.noProjects')}</h3>
            <p className="text-muted-foreground mb-6">{t('dashboard.noProjectsHint')}</p>
            <Link href="/settings">
              <Button>{t('dashboard.goToSettings')}</Button>
            </Link>
          </Card>
        )}
      </div>
    </AuthLayout>
  )
}
