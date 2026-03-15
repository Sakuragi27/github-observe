import axios from 'axios'

const VOLCANO_API_URL = 'https://ark.cn-beijing.volces.com/api/v3/embeddings'

export async function generateEmbedding(text: string): Promise<number[] | null> {
  if (!process.env.VOLCANO_API_KEY || !process.env.VOLCANO_EMBEDDING_ENDPOINT_ID) {
    return null
  }

  try {
    const response = await axios.post(
      VOLCANO_API_URL,
      {
        model: process.env.VOLCANO_EMBEDDING_ENDPOINT_ID,
        input: [text.slice(0, 8000)], // Limit input length
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.VOLCANO_API_KEY}`,
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
      if (a.detailedSummary) parts.push(a.detailedSummary)
      if (a.detailedSummaryEn) parts.push(a.detailedSummaryEn)
      if (a.keyFeatures) parts.push(a.keyFeatures.join(', '))
      if (a.keyFeaturesEn) parts.push(a.keyFeaturesEn.join(', '))
      if (a.useCases) parts.push(a.useCases.join(', '))
      if (a.useCasesEn) parts.push(a.useCasesEn.join(', '))
    } catch {}
  }

  // Add first part of readme
  if (project.readme) parts.push(project.readme.slice(0, 1000))

  return parts.join('\n').slice(0, 8000)
}
