import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">GitHub Observe</h1>
            <p className="mt-2 text-gray-600">智能管理你的 GitHub Stars</p>
          </div>
          
          <div className="space-y-4">
            <Link 
              href="/login" 
              className="block w-full py-3 px-4 bg-blue-600 text-white text-center rounded-lg font-medium hover:bg-blue-700 transition"
            >
              使用 GitHub 登录
            </Link>
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">或</span>
              </div>
            </div>
            
            <Link 
              href="/projects" 
              className="block w-full py-3 px-4 bg-gray-100 text-gray-700 text-center rounded-lg font-medium hover:bg-gray-200 transition"
            >
              浏览项目
            </Link>
          </div>
          
          <div className="mt-8 pt-6 border-t border-gray-100">
            <div className="grid grid-cols-3 gap-4 text-center text-sm text-gray-600">
              <div>
                <div className="text-lg">🔄</div>
                <div>自动同步</div>
              </div>
              <div>
                <div className="text-lg">🤖</div>
                <div>AI 摘要</div>
              </div>
              <div>
                <div className="text-lg">🏷️</div>
                <div>标签管理</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
