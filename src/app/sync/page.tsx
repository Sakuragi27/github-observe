'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { RefreshCw, CheckCircle2, AlertCircle, Loader2, ArrowRight } from 'lucide-react'
import { AuthLayout } from '@/components/layout/auth-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { useToast } from '@/components/ui/toast'
import { api } from '@/lib/api'

export default function SyncPage() {
  const [syncing, setSyncing] = useState(false)
  const [force, setForce] = useState(false)
  const [result, setResult] = useState<{ total: number; newCount: number; updatedCount: number } | null>(null)
  const { toast } = useToast()
  const router = useRouter()

  const handleSync = async () => {
    setSyncing(true)
    setResult(null)

    try {
      const res = await api.post<{ data: { total: number; newCount: number; updatedCount: number } }>('/api/sync', { force })
      setResult(res.data)
      toast(`同步完成：新增 ${res.data.newCount} 个，更新 ${res.data.updatedCount} 个`, 'success')
    } catch (err: any) {
      toast(err.message || '同步失败', 'error')
    } finally {
      setSyncing(false)
    }
  }

  return (
    <AuthLayout>
      <div className="max-w-lg mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold">同步 GitHub Stars</h1>
          <p className="text-muted-foreground mt-1">从 GitHub 获取你收藏的项目并进行 AI 分析</p>
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
                  同步中，请耐心等待...
                </>
              ) : (
                <>
                  <RefreshCw className="h-5 w-5 mr-2" />
                  开始同步
                </>
              )}
            </Button>

            {syncing && (
              <p className="text-xs text-center text-muted-foreground">
                同步过程可能需要几分钟，取决于 Star 数量
              </p>
            )}
          </CardContent>
        </Card>

        {/* Result */}
        {result && (
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
                    <div className="text-2xl font-bold text-emerald-500">{result.newCount}</div>
                    <div className="text-xs text-muted-foreground">新增</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-500">{result.updatedCount}</div>
                    <div className="text-xs text-muted-foreground">更新</div>
                  </div>
                </div>

                <Button variant="outline" onClick={() => router.push('/projects')} className="w-full">
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
