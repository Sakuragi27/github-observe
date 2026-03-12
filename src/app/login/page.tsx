'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { motion } from 'framer-motion'
import { Github, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function LoginPage() {
  const [loadingProvider, setLoadingProvider] = useState<string | null>(null)

  const handleOAuthSignIn = async (provider: string) => {
    setLoadingProvider(provider)
    await signIn(provider, { callbackUrl: '/' })
  }

  return (
    <main className="min-h-screen flex items-center justify-center relative overflow-hidden aurora-bg">
      {/* Animated blobs */}
      <motion.div
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-3xl"
      />
      <motion.div
        animate={{ scale: [1.2, 1, 1.2], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-[10%] right-[-5%] w-[35%] h-[35%] bg-primary/15 rounded-full blur-3xl"
      />
      <motion.div
        animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.4, 0.2] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute bottom-[-10%] left-[20%] w-[30%] h-[30%] bg-primary/20 rounded-full blur-3xl"
      />

      {/* Dot pattern */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: 'radial-gradient(circle at 25px 25px, hsl(var(--foreground) / 0.15) 1px, transparent 0)',
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
        <div className="glass-card rounded-2xl shadow-2xl p-8">
          {/* Logo */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', bounce: 0.5 }}
              className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-2xl mb-4"
            >
              <Github className="w-9 h-9 text-primary" />
            </motion.div>
            <h1 className="text-3xl font-bold text-foreground">GitHub Observe</h1>
            <p className="mt-2 text-muted-foreground">智能管理你的 GitHub Stars</p>
          </div>

          {/* OAuth buttons */}
          <div className="space-y-3">
            <Button
              onClick={() => handleOAuthSignIn('github')}
              disabled={!!loadingProvider}
              className="w-full h-12 text-base"
              variant="default"
            >
              {loadingProvider === 'github' ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Github className="w-5 h-5" />
              )}
              {loadingProvider === 'github' ? '跳转中...' : '使用 GitHub 登录'}
            </Button>

            <Button
              onClick={() => handleOAuthSignIn('google')}
              disabled={!!loadingProvider}
              className="w-full h-12 text-base"
              variant="outline"
            >
              {loadingProvider === 'google' ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
              )}
              {loadingProvider === 'google' ? '跳转中...' : '使用 Google 登录'}
            </Button>
          </div>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            登录即表示同意我们的服务条款和隐私政策
          </p>
        </div>
      </motion.div>
    </main>
  )
}
