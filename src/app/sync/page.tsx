'use client'

import { useState, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { RefreshCw, CheckCircle2, AlertCircle, Loader2, ArrowRight } from 'lucide-react'
import { AuthLayout } from '@/components/layout/auth-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { useToast } from '@/components/ui/toast'
import type { SyncSSEEvent } from '@/app/api/sync/route'

interface SyncProgress {
  phase: 'fetching' | 'analyzing' | 'done'
  current: number
  total: number
  projectName?: string
}

interface SyncResult {
  total: number
  newCount: number
  updatedCount: number
}

export default function SyncPage() {
  const [syncing, setSyncing] = useState(false)
  const [force, setForce] = useState(false)
  const [progress, setProgress] = useState<SyncProgress | null>(null)
  const [result, setResult] = useState<SyncResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()
  const router = useRouter()
  const abortRef = useRef<AbortController | null>(null)

  const handleSync = useCallback(async () => {
    setSyncing(true)
    setResult(null)
    setError(null)
    setProgress({ phase: 'fetching', current: 0, total: 0 })

    const abortController = new AbortController()
    abortRef.current = abortController

    try {
      const response = await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ force }),
        signal: abortController.signal,
      })

      // Handle non-SSE error responses (rate limit, auth errors)
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || '同步失败')
      }

      const reader = response.body?.getReader()
      if (!reader) throw new Error('无法读取响应流')

      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })

        // Parse SSE events from buffer
        const lines = buffer.split('\n\n')
        buffer = lines.pop() || ''

        for (const chunk of lines) {
          const dataLine = chunk.trim()
          if (!dataLine.startsWith('data: ')) continue

          const jsonStr = dataLine.slice(6)
          let event: SyncSSEEvent
          try {
            event = JSON.parse(jsonStr)
          } catch {
            continue
          }

          switch (event.type) {
            case 'progress':
              setProgress({
                phase: event.phase,
                current: event.current,
                total: event.total,
                projectName: event.projectName,
              })
              break
            case 'complete':
              setResult({
                total: event.total,
                newCount: event.newCount,
                updatedCount: event.updatedCount,
              })
              setProgress({ phase: 'done', current: event.total, total: event.total })
              toast(
                `同步完成：新增 ${event.newCount} 个，更新 ${event.updatedCount} 个`,
                'success'
              )
              break
            case 'error':
              setError(event.message)
              toast(event.message, 'error')
              break
          }
        }
      }
    } catch (err: unknown) {
      if (err instanceof DOMException && err.name === 'AbortError') return
      const message = err instanceof Error ? err.message : '同步失败'
      setError(message)
      toast(message, 'error')
    } finally {
      setSyncing(false)
      abortRef.current = null
    }
  }, [force, toast])

  const percentage =
    progress && progress.total > 0
      ? Math.round((progress.current / progress.total) * 100)
      : 0

  return (
    <AuthLayout>
      <div className="max-w-lg mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold">同步 GitHub Stars</h1>
          <p className="text-muted-foreground mt-1">
            从 GitHub 获取你收藏的项目并进行 AI 分析
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <RefreshCw className="h-5 w-5 text-primary" />
              同步设置
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">强制重新分析</p>
                <p className="text-xs text-muted-foreground">重新分析已存在的项目</p>
              </div>
              <Switch checked={force} onCheckedChange={setForce} />
            </div>

            <Button
              onClick={handleSync}
              disabled={syncing}
              className="w-full h-12 text-base"
            >
              {syncing ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  同步中...
                </>
              ) : (
                <>
                  <RefreshCw className="h-5 w-5 mr-2" />
                  开始同步
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Progress */}
        {syncing && progress && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card>
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    {progress.phase === 'fetching' && '正在获取 Star 列表...'}
                    {progress.phase === 'analyzing' &&
                      `正在分析 (${progress.current}/${progress.total})`}
                    {progress.phase === 'done' && '同步完成'}
                  </span>
                  {progress.phase === 'analyzing' && (
                    <span className="font-mono text-sm font-medium">{percentage}%</span>
                  )}
                </div>

                {/* Progress bar */}
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-primary"
                    initial={{ width: 0 }}
                    animate={{
                      width:
                        progress.phase === 'fetching'
                          ? '10%'
                          : `${percentage}%`,
                    }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                  />
                </div>

                {/* Current project name */}
                {progress.phase === 'analyzing' && progress.projectName && (
                  <p className="text-xs text-muted-foreground truncate">
                    {progress.projectName}
                  </p>
                )}

                {progress.phase === 'fetching' && (
                  <p className="text-xs text-muted-foreground">
                    同步过程可能需要几分钟，取决于 Star 数量
                  </p>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Error */}
        {error && !syncing && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="border-red-500/30">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <AlertCircle className="h-6 w-6 text-red-500 shrink-0" />
                  <div>
                    <h3 className="font-medium text-red-500">同步失败</h3>
                    <p className="text-sm text-muted-foreground mt-1">{error}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Result */}
        {result && !syncing && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="border-emerald-500/30">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <CheckCircle2 className="h-6 w-6 text-emerald-500" />
                  <h3 className="font-medium text-lg">同步完成</h3>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold">{result.total}</div>
                    <div className="text-xs text-muted-foreground">总项目</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-emerald-500">
                      {result.newCount}
                    </div>
                    <div className="text-xs text-muted-foreground">新增</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-500">
                      {result.updatedCount}
                    </div>
                    <div className="text-xs text-muted-foreground">更新</div>
                  </div>
                </div>

                <Button
                  variant="outline"
                  onClick={() => router.push('/projects')}
                  className="w-full"
                >
                  查看项目列表
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </AuthLayout>
  )
}
