'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

function getAuthHeaders(): HeadersInit {
  const userStr = localStorage.getItem('user')
  if (!userStr) return {}
  
  const user = JSON.parse(userStr)
  if (!user.token) return {}
  
  return {
    'Authorization': `Bearer ${user.token}`,
    'Content-Type': 'application/json',
  }
}

export default function SettingsPage() {
  const router = useRouter()
  const [token, setToken] = useState('')
  const [loading, setLoading] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [message, setMessage] = useState('')
  const [syncProgress, setSyncProgress] = useState({ current: 0, total: 0 })
  const [syncMode, setSyncMode] = useState<'full' | 'incremental'>('incremental')

  useEffect(() => {
    const userStr = localStorage.getItem('user')
    if (!userStr) {
      router.push('/login')
      return
    }
  }, [router])

  const handleSaveToken = async () => {
    if (!token) return
    setLoading(true)
    setMessage('')
    
    try {
      const res = await fetch('/api/user/token', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ githubToken: token }),
      })
      
      const data = await res.json()
      
      if (res.ok) {
        setMessage('✅ Token 保存成功！')
        setToken('')
      } else {
        setMessage('❌ ' + (data.error || '保存失败'))
      }
    } catch (err) {
      setMessage('❌ 网络错误，请重试')
    } finally {
      setLoading(false)
    }
  }

  const handleSync = async () => {
    setSyncing(true)
    setMessage('')
    setSyncProgress({ current: 0, total: 0 })
    
    try {
      const res = await fetch('/api/sync', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ 
          force: syncMode === 'full'
        }),
      })
      
      const data = await res.json()
      
      if (res.ok) {
        const { total, newCount, updatedCount } = data.data
        setSyncProgress({ current: total, total })
        
        let msg = '✅ 同步完成！'
        if (newCount > 0) msg += ` 新增 ${newCount} 个项目`
        if (updatedCount > 0) msg += ` 更新 ${updatedCount} 个项目`
        if (newCount === 0 && updatedCount === 0) msg += ' 没有新项目'
        
        setMessage(msg)
      } else {
        setMessage('❌ ' + (data.error || '同步失败'))
      }
    } catch (err) {
      setMessage('❌ 同步失败，请重试')
    } finally {
      setSyncing(false)
    }
  }

  const progressPercentage = syncProgress.total > 0 
    ? (syncProgress.current / syncProgress.total) * 100 
    : 0

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">设置</h1>
          <button 
            onClick={() => router.push('/projects')} 
            className="text-blue-500 hover:text-blue-600"
          >
            返回项目列表
          </button>
        </div>
        
        {/* GitHub Token 配置 */}
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-lg font-semibold mb-4">GitHub Token 配置</h2>
          <p className="text-gray-600 text-sm mb-4">
            请输入您的 GitHub Personal Access Token，用于获取您的 Stars 列表。
            <a 
              href="https://github.com/settings/tokens" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-500 ml-2"
            >
              创建 Token →
            </a>
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
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? '保存中...' : '保存 Token'}
          </button>
        </div>

        {/* 同步 Stars */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">同步 Stars</h2>
          <p className="text-gray-600 text-sm mb-4">
            点击按钮同步您的 GitHub Stars，系统将自动使用 AI 分析并分类每个项目。
          </p>
          
          {/* 同步模式选择 */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              同步模式
            </label>
            <div className="flex gap-4">
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  value="incremental"
                  checked={syncMode === 'incremental'}
                  onChange={(e) => setSyncMode(e.target.value as 'incremental')}
                  className="mr-2"
                  disabled={syncing}
                />
                <span className="text-sm">增量同步（仅新项目）</span>
              </label>
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  value="full"
                  checked={syncMode === 'full'}
                  onChange={(e) => setSyncMode(e.target.value as 'full')}
                  className="mr-2"
                  disabled={syncing}
                />
                <span className="text-sm">全量同步（所有项目）</span>
              </label>
            </div>
          </div>

          {/* 进度条 */}
          {syncing && (
            <div className="mb-4">
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>同步进度</span>
                <span>{syncProgress.current} / {syncProgress.total || '...'}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className="bg-green-500 h-2.5 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>
          )}

          <button
            onClick={handleSync}
            disabled={syncing}
            className={`px-4 py-2 rounded-lg text-white font-medium transition-colors ${
              syncing 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-green-500 hover:bg-green-600'
            }`}
          >
            {syncing ? '同步中...' : `开始${syncMode === 'full' ? '全量' : '增量'}同步`}
          </button>
        </div>

        {/* 消息提示 */}
        {message && (
          <div className={`mt-4 p-4 rounded-lg ${
            message.startsWith('✅') 
              ? 'bg-green-50 text-green-700' 
              : 'bg-red-50 text-red-700'
          }`}>
            {message}
          </div>
        )}
      </div>
    </div>
  )
}
