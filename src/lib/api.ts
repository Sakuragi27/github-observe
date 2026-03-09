// 前端 API 工具函数

export function getAuthHeaders(): HeadersInit {
  const user = localStorage.getItem('user')
  if (!user) return {}
  
  const { token } = JSON.parse(user)
  if (!token) return {}
  
  return {
    'Authorization': `Bearer ${token}`,
  }
}

export async function apiRequest(url: string, options: RequestInit = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...getAuthHeaders(),
    ...options.headers,
  }
  
  const response = await fetch(url, {
    ...options,
    headers,
  })
  
  return response
}
