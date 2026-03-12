'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Github, Mail, Key, Loader2, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { useAuth } from '@/providers/auth-provider'
import { useToast } from '@/components/ui/toast'

export default function LoginPage() {
  const [isRegister, setIsRegister] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [githubToken, setGithubToken] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()
  const { login } = useAuth()
  const { toast } = useToast()

  const handleAccountSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const endpoint = isRegister ? '/api/auth/register' : '/api/auth/login'
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()

      if (!res.ok) {
        toast(data.error || '操作失败', 'error')
        return
      }

      if (isRegister) {
        toast('注册成功，请登录', 'success')
        setIsRegister(false)
        return
      }

      login(data.token, data.user.id, data.user.email)
      toast('登录成功', 'success')
      router.push('/')
    } catch {
      toast('网络错误，请重试', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleTokenSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // For token login, first register/login with a generated account,
      // then save the token. For now, show guidance.
      toast('请先使用邮箱注册账号，然后在设置中配置 GitHub Token', 'info')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Aurora gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900">
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.7, 0.5] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-purple-500/30 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.5, 0.7, 0.5] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-[10%] right-[-5%] w-[35%] h-[35%] bg-blue-500/30 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ scale: [1, 1.3, 1], opacity: [0.4, 0.6, 0.4] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute bottom-[-10%] left-[20%] w-[30%] h-[30%] bg-indigo-500/30 rounded-full blur-3xl"
        />
      </div>

      {/* Dot pattern */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: 'radial-gradient(circle at 25px 25px, rgba(255,255,255,0.15) 1px, transparent 0)',
          backgroundSize: '50px 50px',
        }}
      />

      {/* Login card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 max-w-md w-full mx-4"
      >
        <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl shadow-2xl p-8">
          {/* Logo */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', bounce: 0.5 }}
              className="inline-flex items-center justify-center w-16 h-16 bg-white/10 rounded-2xl mb-4"
            >
              <Github className="w-9 h-9 text-white" />
            </motion.div>
            <h1 className="text-3xl font-bold text-white">GitHub Observe</h1>
            <p className="mt-2 text-white/60">智能管理你的 GitHub Stars</p>
          </div>

          {/* Login mode tabs */}
          <Tabs defaultValue="account" className="mb-6">
            <TabsList className="w-full bg-white/10 border border-white/10">
              <TabsTrigger
                value="account"
                className="flex-1 data-[state=active]:bg-white/20 data-[state=active]:text-white text-white/60"
              >
                <Mail className="w-4 h-4 mr-2" />
                账号{isRegister ? '注册' : '登录'}
              </TabsTrigger>
              <TabsTrigger
                value="token"
                className="flex-1 data-[state=active]:bg-white/20 data-[state=active]:text-white text-white/60"
              >
                <Key className="w-4 h-4 mr-2" />
                Token 登录
              </TabsTrigger>
            </TabsList>

            <TabsContent value="account">
              <form onSubmit={handleAccountSubmit} className="space-y-4 mt-4">
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-1.5">邮箱</label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    required
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/40 focus-visible:ring-purple-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-1.5">密码</label>
                  <div className="relative">
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={isRegister ? '至少8位密码' : '输入密码'}
                      required
                      minLength={isRegister ? 8 : 6}
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/40 focus-visible:ring-purple-400 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white border-0 h-11"
                >
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  {loading ? '处理中...' : isRegister ? '注册' : '登录'}
                </Button>

                <p className="text-center text-sm text-white/50">
                  {isRegister ? '已有账号？' : '还没有账号？'}
                  <button
                    type="button"
                    onClick={() => setIsRegister(!isRegister)}
                    className="text-purple-400 hover:text-purple-300 ml-1"
                  >
                    {isRegister ? '去登录' : '注册'}
                  </button>
                </p>
              </form>
            </TabsContent>

            <TabsContent value="token">
              <form onSubmit={handleTokenSubmit} className="space-y-4 mt-4">
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-1.5">
                    GitHub Personal Access Token
                  </label>
                  <Input
                    type="password"
                    value={githubToken}
                    onChange={(e) => setGithubToken(e.target.value)}
                    placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                    required
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/40 focus-visible:ring-purple-400"
                  />
                  <p className="mt-1.5 text-xs text-white/40">
                    在 GitHub Settings &rarr; Developer settings &rarr; Personal access tokens 创建
                  </p>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white border-0 h-11"
                >
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  {loading ? '验证中...' : '使用 Token 登录'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </div>
      </motion.div>
    </main>
  )
}
