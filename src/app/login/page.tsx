'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
  const [loginType, setLoginType] = useState<'account' | 'token'>('account')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [token, setToken] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleAccountLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      
      if (data.success) {
        localStorage.setItem('token', data.data.token)
        router.push('/projects')
      } else {
        setError(data.error || '登录失败')
      }
    } catch (err) {
      setError('登录出错，请重试')
    } finally {
      setLoading(false)
    }
  }

  const handleTokenLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ githubToken: token }),
      })
      const data = await res.json()
      
      if (data.success) {
        localStorage.setItem('token', data.data.token)
        router.push('/projects')
      } else {
        setError(data.error || '登录失败')
      }
    } catch (err) {
      setError('登录出错，请重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">GitHub Observe</h1>
            <p className="mt-2 text-gray-600">智能管理你的 GitHub Stars</p>
          </div>

          {/* 登录方式切换 */}
          <div className="flex mb-6 bg-gray-100 rounded-lg p-1">
            <button
              type="button"
              onClick={() => setLoginType('account')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition ${
                loginType === 'account' 
                  ? 'bg-white text-blue-600 shadow' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              账号登录
            </button>
            <button
              type="button"
              onClick={() => setLoginType('token')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition ${
                loginType === 'token' 
                  ? 'bg-white text-blue-600 shadow' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Token 登录
            </button>
          </div>

          {loginType === 'account' ? (
            <form onSubmit={handleAccountLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">邮箱</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="your@email.com"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">密码</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="••••••••"
                  required
                />
              </div>
              {error && (
                <div className="text-red-500 text-sm text-center">{error}</div>
              )}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50"
              >
                {loading ? '登录中...' : '登录'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleTokenLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">GitHub Token</label>
                <input
                  type="password"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                  required
                />
                <p className="mt-1 text-xs text-gray-500">
                  在 GitHub Settings → Developer settings → Personal access tokens 创建
                </p>
              </div>
              {error && (
                <div className="text-red-500 text-sm text-center">{error}</div>
              )}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50"
              >
                {loading ? '验证中...' : '使用 Token 登录'}
              </button>
            </form>
          )}

          <div className="mt-6 text-center">
            <Link href="/register" className="text-blue-600 hover:underline">
              还没有账号？立即注册
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
