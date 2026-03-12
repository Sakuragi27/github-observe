// Unified API client with error handling and type safety

interface ApiError {
  message: string
  status: number
}

class ApiClient {
  private getToken(): string | null {
    if (typeof window === "undefined") return null
    try {
      const auth = localStorage.getItem("auth")
      if (auth) {
        return JSON.parse(auth).token
      }
      // Fallback to old key
      return localStorage.getItem("token")
    } catch {
      return null
    }
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = { "Content-Type": "application/json" }
    const token = this.getToken()
    if (token) headers["Authorization"] = `Bearer ${token}`
    return headers
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      let message = "请求失败"
      try {
        const data = await response.json()
        message = data.error || data.message || message
      } catch {}
      const error: ApiError = { message, status: response.status }
      throw error
    }
    return response.json()
  }

  async get<T>(url: string, params?: Record<string, string | number | undefined>): Promise<T> {
    const searchParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== "") {
          searchParams.set(key, String(value))
        }
      })
    }
    const queryString = searchParams.toString()
    const fullUrl = queryString ? `${url}?${queryString}` : url

    const response = await fetch(fullUrl, { headers: this.getHeaders() })
    return this.handleResponse<T>(response)
  }

  async post<T>(url: string, body?: unknown): Promise<T> {
    const response = await fetch(url, {
      method: "POST",
      headers: this.getHeaders(),
      body: body ? JSON.stringify(body) : undefined,
    })
    return this.handleResponse<T>(response)
  }

  async patch<T>(url: string, body?: unknown): Promise<T> {
    const response = await fetch(url, {
      method: "PATCH",
      headers: this.getHeaders(),
      body: body ? JSON.stringify(body) : undefined,
    })
    return this.handleResponse<T>(response)
  }

  async delete<T>(url: string): Promise<T> {
    const response = await fetch(url, {
      method: "DELETE",
      headers: this.getHeaders(),
    })
    return this.handleResponse<T>(response)
  }
}

export const api = new ApiClient()

// Type definitions for API responses
export interface ProjectTag {
  id: string
  tag: {
    id: string
    name: string
    slug: string
    category: string | null
  }
}

export interface Project {
  id: string
  userId: string
  githubId: number | null
  name: string
  fullName: string
  description: string | null
  htmlUrl: string
  stargazersCount: number
  language: string | null
  topics: string | null
  analysis: string | null
  solvedProblem: string | null
  isFavorite: boolean
  userNotes: string | null
  starredAt: string | null
  syncedAt: string | null
  createdAt: string
  updatedAt: string
  tags: ProjectTag[]
}

export interface Tag {
  id: string
  name: string
  slug: string
  category: string | null
  count: number
  createdAt: string
}

export interface ProjectListResponse {
  projects: Project[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface SyncResponse {
  message: string
  total: number
  newCount: number
  updatedCount: number
}

export interface DashboardStats {
  totalProjects: number
  taggedCount: number
  analyzedCount: number
  lastSyncedAt: string | null
  languageDistribution: { name: string; value: number }[]
  tagDistribution: { name: string; value: number }[]
  recentProjects: Project[]
}

// Backward compatibility
export function getAuthHeaders(): HeadersInit {
  return {}
}

export async function apiRequest(url: string, options: RequestInit = {}) {
  return fetch(url, options)
}
