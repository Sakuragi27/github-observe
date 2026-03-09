import axios from 'axios'

const GITHUB_API = 'https://api.github.com'

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

export async function getUserStars(token: string, page = 1, perPage = 100): Promise<GitHubRepo[]> {
  const response = await axios.get(`${GITHUB_API}/user/starred`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github.v3+json',
    },
    params: {
      page,
      per_page: perPage,
      sort: 'created',
      direction: 'desc',
    },
  })

  return response.data.map((item: any) => ({
    id: item.id,
    name: item.name,
    full_name: item.full_name,
    description: item.description,
    html_url: item.html_url,
    stargazers_count: item.stargazers_count,
    language: item.language,
    topics: item.topics || [],
    starred_at: item.starred_at,
  }))
}

export async function getAllUserStars(token: string): Promise<GitHubRepo[]> {
  const allStars: GitHubRepo[] = []
  let page = 1
  const perPage = 100

  while (true) {
    const stars = await getUserStars(token, page, perPage)
    allStars.push(...stars)
    
    if (stars.length < perPage) {
      break
    }
    page++
  }

  return allStars
}

export async function getRepoReadme(token: string, owner: string, repo: string): Promise<string> {
  try {
    const response = await axios.get(
      `${GITHUB_API}/repos/${owner}/${repo}/readme`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/vnd.github.v3+json',
        },
      }
    )
    
    // Decode base64 content
    const content = Buffer.from(response.data.content, 'base64').toString('utf-8')
    return content.slice(0, 2000) // 只取前2000字符
  } catch (error) {
    return ''
  }
}
