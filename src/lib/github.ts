import axios, { AxiosError } from 'axios'

const GITHUB_API = 'https://api.github.com'
const MAX_RETRIES = 3
const RETRY_DELAY_MS = 1000

export interface GitHubRepo {
  id: number
  name: string
  full_name: string
  description: string | null
  html_url: string
  stargazers_count: number
  language: string | null
  topics: string[]
  starred_at?: string
}

function getHeaders(token: string) {
  return {
    Authorization: `Bearer ${token}`,
    Accept: 'application/vnd.github.star+json',
  }
}

async function withRetry<T>(fn: () => Promise<T>, retries = MAX_RETRIES): Promise<T> {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn()
    } catch (error) {
      const axiosErr = error as AxiosError
      const status = axiosErr.response?.status

      // Don't retry auth errors or not found
      if (status === 401 || status === 403 || status === 404) throw error

      // Rate limited - wait and retry
      if (status === 429) {
        const retryAfter = parseInt(axiosErr.response?.headers?.['retry-after'] || '60')
        await new Promise((r) => setTimeout(r, retryAfter * 1000))
        continue
      }

      if (i === retries - 1) throw error
      await new Promise((r) => setTimeout(r, RETRY_DELAY_MS * (i + 1)))
    }
  }
  throw new Error('Max retries exceeded')
}

export async function getUserStars(token: string, page = 1, perPage = 100): Promise<GitHubRepo[]> {
  return withRetry(async () => {
    const response = await axios.get(`${GITHUB_API}/user/starred`, {
      headers: getHeaders(token),
      params: { page, per_page: perPage, sort: 'created', direction: 'desc' },
      timeout: 30000,
    })

    return response.data.map((item: any) => ({
      id: item.repo?.id || item.id,
      name: item.repo?.name || item.name,
      full_name: item.repo?.full_name || item.full_name,
      description: item.repo?.description || item.description,
      html_url: item.repo?.html_url || item.html_url,
      stargazers_count: item.repo?.stargazers_count || item.stargazers_count,
      language: item.repo?.language || item.language,
      topics: item.repo?.topics || item.topics || [],
      starred_at: item.starred_at,
    }))
  })
}

export async function getAllUserStars(token: string): Promise<GitHubRepo[]> {
  const allStars: GitHubRepo[] = []
  let page = 1
  const perPage = 100

  while (true) {
    const stars = await getUserStars(token, page, perPage)
    allStars.push(...stars)

    if (stars.length < perPage) break
    page++
  }

  return allStars
}

export async function getRepoReadme(token: string, owner: string, repo: string): Promise<string> {
  try {
    const response = await withRetry(() =>
      axios.get(`${GITHUB_API}/repos/${owner}/${repo}/readme`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/vnd.github.v3+json',
        },
        timeout: 15000,
      })
    )

    const content = Buffer.from(response.data.content, 'base64').toString('utf-8')
    return content
  } catch {
    return ''
  }
}
