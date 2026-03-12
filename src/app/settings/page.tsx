'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Settings, Key, Sun, Moon, Monitor, LogOut, Loader2, Save, Eye, EyeOff } from 'lucide-react'
import { AuthLayout } from '@/components/layout/auth-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { useAuth } from '@/providers/auth-provider'
import { useTheme } from '@/providers/theme-provider'
import { useToast } from '@/components/ui/toast'
import { api } from '@/lib/api'
import { cn } from '@/lib/utils'

export default function SettingsPage() {
  const [githubToken, setGithubToken] = useState('')
  const [showToken, setShowToken] = useState(false)
  const [saving, setSaving] = useState(false)
  const { user, logout } = useAuth()
  const { theme, setTheme } = useTheme()
  const { toast } = useToast()

  const handleSaveToken = async () => {
    if (!githubToken.trim()) {
      toast('请输入 GitHub Token', 'error')
      return
    }
    setSaving(true)
    try {
      await api.post('/api/user/token', { githubToken })
      toast('Token 保存成功', 'success')
      setGithubToken('')
    } catch (err: any) {
      toast(err.message || '保存失败', 'error')
    } finally {
      setSaving(false)
    }
  }

  const themeOptions = [
    { value: 'light' as const, label: '亮色', icon: Sun },
    { value: 'dark' as const, label: '暗色', icon: Moon },
    { value: 'system' as const, label: '系统', icon: Monitor },
  ]

  return (
    <AuthLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold">设置</h1>
          <p className="text-muted-foreground mt-1">管理你的账户和应用偏好</p>
        </div>

        {/* GitHub Token */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Key className="h-5 w-5 text-primary" />
              GitHub Token
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              配置 GitHub Personal Access Token 以同步你的 Star 项目。Token 会被加密存储。
            </p>
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Input
                  type={showToken ? 'text' : 'password'}
                  value={githubToken}
                  onChange={(e) => setGithubToken(e.target.value)}
                  placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowToken(!showToken)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <Button onClick={handleSaveToken} disabled={saving}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                保存
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              在 GitHub Settings → Developer settings → Personal access tokens → Fine-grained tokens 创建，
              需要 Starring 和 Metadata 的读取权限。
            </p>
          </CardContent>
        </Card>

        {/* Theme */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Sun className="h-5 w-5 text-primary" />
              外观设置
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-3">
              {themeOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setTheme(opt.value)}
                  className={cn(
                    'flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-colors',
                    theme === opt.value
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  )}
                >
                  <opt.icon className={cn('h-6 w-6', theme === opt.value ? 'text-primary' : 'text-muted-foreground')} />
                  <span className="text-sm font-medium">{opt.label}</span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Account */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">账户信息</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">邮箱</p>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
              </div>
            </div>
            <Separator />
            <Button variant="destructive" onClick={logout} className="w-full">
              <LogOut className="h-4 w-4 mr-2" />
              退出登录
            </Button>
          </CardContent>
        </Card>
      </div>
    </AuthLayout>
  )
}
