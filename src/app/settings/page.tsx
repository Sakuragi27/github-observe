'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function SettingsPage() {
  const router = useRouter()
  const [token, setToken] = useState('')
  const [loading, setLoading] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [message, setMessage] = useState('')
  const [userId, setUserId] = useState('')

  useEffect(() => {
    const userStr = localStorage.getItem('user')
    if (!userStr) {
      router.push('/login')
      return
    }
    const user = JSON.parse(userStr)
    setUserId(user.id)
  }, [router])

  const handleSaveToken = async () => {
    if (!token) return
    setLoading(true)
    setMessage('')
    
    try {
      const res = await fetch('/api/user/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, githubToken: token }),
      })
      
      const data = await res.json()
      
      if (res.ok) {
        setMessage('Token 保存成功！')
        setToken('')
      } else {
        setMessage(data.error || '保存失败')
      }
    } catch (err) {
      setMessage('网络错误，请重试')
    } finally {
      setLoading(false)
    }
  }

  const handleSync = async () => {
    setSyncing(true)
    setMessage('')
    
    try {
      const res = await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      })
      
      const data = await res.json()
      
      if (res.ok) {
        setMessage('同步成功！新增 ' + data.data.newCount + ' 个项目，更新 ' + data.data.updatedCount + ' 个项目')
      } else {
        setMessage(data.error || '同步失败')
      }
    } catch (err) {
      setMessage('同步失败，请重试')
    } finally {
      setSyncing(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">设置</h1>
          <button onClick={() => router.push('/projects')} className="text-blue-500">返回项目列表</button>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-lg font-semibold mb-4">GitHub Token 配置</h2>
          <p className="text-gray-600 text-sm mb-4">
            请输入您的 GitHub Personal Access Token，用于获取您的 Stars 列表。
          </p>
          <input
            type="password"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="ghp_xxxxxxxxxxxx"
            className="w-full px-3 py-2 border rounded-lg mb-4"
          />
          <button
            onClick={handleSaveToken}
            disabled={loading || !token}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? '保存中...' : '保存 Token'}
          </button>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">同步 Stars</h2>
          <p className="text-gray-600 text-sm mb-4">
            点击按钮同步您的 GitHub Stars，系统将自动分析并分类每个项目。
          </p>
          <button
            onClick={handleSync}
            disabled={syncing}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50"
          >
            {syncing ? '同步中...' : '开始同步'}
          </button>
        </div>

        {message && (
          <div className="mt-4 p-4 bg-blue-50 text-blue-700 rounded-lg">
            {message}
          </div>
        )}
      </div>
    </div>
  )
}
