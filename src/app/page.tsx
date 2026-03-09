import Link from 'next/link'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold">GitHub Observe</h1>
      <p className="mt-4 text-gray-600">智能管理你的 GitHub Stars</p>
      <div className="mt-8 flex gap-4">
        <Link 
          href="/login" 
          className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          登录
        </Link>
        <Link 
          href="/projects" 
          className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
        >
          浏览项目
        </Link>
      </div>
    </main>
  )
}
