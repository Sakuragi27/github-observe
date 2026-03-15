import axios from 'axios'

const SILICONFLOW_API_URL = 'https://api.siliconflow.cn/v1/embeddings'
const EMBEDDING_MODEL = 'BAAI/bge-large-zh-v1.5'

export async function generateEmbedding(text: string): Promise<number[] | null> {
  if (!process.env.SILICONFLOW_API_KEY) {
    return null
  }

  try {
    const response = await axios.post(
      SILICONFLOW_API_URL,
      {
        model: EMBEDDING_MODEL,
        input: text.slice(0, 512), // bge-large-zh-v1.5 max token ~512
        encoding_format: 'float',
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SILICONFLOW_API_KEY}`,
        },
        timeout: 30000,
      }
    )

    return response.data.data[0].embedding
  } catch (error) {
    console.error('Embedding generation error:', (error as Error).message)
    return null
  }
}

// Generate search text from project data for embedding
export function buildProjectSearchText(project: {
  name: string
  fullName?: string
  description?: string | null
  analysis?: string | null
  readme?: string | null
}): string {
  const parts = [project.name]
  if (project.fullName) parts.push(project.fullName)
  if (project.description) parts.push(project.description)

  // Parse analysis JSON for richer text
  if (project.analysis) {
    try {
      const a = JSON.parse(project.analysis)
      if (a.solvedProblem) parts.push(a.solvedProblem)
      if (a.solvedProblemEn) parts.push(a.solvedProblemEn)
      if (a.keyFeatures) parts.push(a.keyFeatures.join(', '))
      if (a.useCases) parts.push(a.useCases.join(', '))
    } catch {}
  }

  return parts.join(' ').slice(0, 512)
}
