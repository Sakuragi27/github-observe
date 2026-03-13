import axios from 'axios'

const VOLCANO_API_URL = 'https://ark.cn-beijing.volces.com/api/v3/chat/completions'

export interface AnalyzeResult {
  tags: { name: string; category: string }[]
  // 中文
  solvedProblem: string
  useCases: string[]
  keyFeatures: string[]
  detailedSummary: string
  // 英文
  solvedProblemEn: string
  useCasesEn: string[]
  keyFeaturesEn: string[]
  detailedSummaryEn: string
}

export async function analyzeProject(
  name: string,
  description: string | null,
  language: string | null,
  topics: string[],
  readmeSummary: string
): Promise<AnalyzeResult> {
  if (!process.env.VOLCANO_API_KEY || !process.env.VOLCANO_ENDPOINT_ID) {
    return getDefaultResult(name, description, language, topics)
  }

  const prompt = `你是一个 GitHub 项目分析专家。请分析以下项目，输出中英文双语的结构化结果。

项目信息：
- 名称：${name}
- 描述：${description || '无'}
- 主要语言：${language || '未知'}
- Topics：${topics.join(', ') || '无'}
- README 摘要：${readmeSummary.slice(0, 500) || '无'}

请按以下 JSON 格式输出：
{
  "tags": [
    {"name": "标签名", "category": "分类（技术领域/类型/场景）"}
  ],
  "solvedProblem": "一句话描述这个项目主要解决什么问题（中文）",
  "useCases": ["适用场景1", "适用场景2"],
  "keyFeatures": ["核心特性1", "核心特性2"],
  "detailedSummary": "2-3段详细介绍，包括项目背景、核心功能、技术亮点（200-300字中文）",
  "solvedProblemEn": "One sentence describing the main problem this project solves (English)",
  "useCasesEn": ["Use case 1", "Use case 2"],
  "keyFeaturesEn": ["Key feature 1", "Key feature 2"],
  "detailedSummaryEn": "2-3 paragraphs detailed introduction including project background, core features, technical highlights (English)"
}

严格要求：
1. 标签数量控制在 3-5 个，只保留最核心的标签
2. 标签名必须使用通用、标准化的名称（如用"React"而不是"react.js"或"ReactJS"）
3. 标签分类只使用这几种：技术领域、编程语言、项目类型、应用场景
4. "解决的问题"要具体，让人一目了然
5. 不要生成过于宽泛的标签（如"开源"、"工具"、"库"）
6. detailedSummary 需要 200-300 字，分 2-3 段，涵盖项目背景、核心功能和技术亮点
7. 【极其重要】solvedProblem、useCases、keyFeatures、detailedSummary 这四个字段必须用**中文**填写，绝对不能用英文
8. 【极其重要】solvedProblemEn、useCasesEn、keyFeaturesEn、detailedSummaryEn 这四个字段必须用**英文**填写
9. 即使项目的 README 和描述是英文的，中文字段也必须翻译为中文

只输出 JSON，不要其他内容。`

  try {
    const response = await axios.post(
      VOLCANO_API_URL,
      {
        model: process.env.VOLCANO_ENDPOINT_ID,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        max_tokens: 2000,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.VOLCANO_API_KEY}`,
        },
        timeout: 30000,
      }
    )

    const content = response.data.choices[0].message.content
    const jsonMatch = content.match(/\{[\s\S]*\}/)

    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0])
      // Validate structure
      if (parsed.tags && Array.isArray(parsed.tags) && parsed.solvedProblem) {
        return parsed
      }
    }

    return getDefaultResult(name, description, language, topics)
  } catch (error) {
    console.error('AI analyze error for', name, ':', (error as Error).message)
    return getDefaultResult(name, description, language, topics)
  }
}

function getDefaultResult(
  name: string,
  description: string | null,
  language?: string | null,
  topics?: string[]
): AnalyzeResult {
  const tags: { name: string; category: string }[] = []

  if (language) {
    tags.push({ name: language, category: '技术领域' })
  }
  if (topics && topics.length > 0) {
    topics.slice(0, 3).forEach((t) => {
      tags.push({ name: t, category: '类型' })
    })
  }

  return {
    tags,
    solvedProblem: description || `${name} 项目`,
    useCases: [],
    keyFeatures: [],
    detailedSummary: '',
    solvedProblemEn: description || `${name} project`,
    useCasesEn: [],
    keyFeaturesEn: [],
    detailedSummaryEn: '',
  }
}

/**
 * Analyze multiple projects with concurrency control
 */
export async function analyzeProjectsBatch(
  projects: Array<{
    name: string
    description: string | null
    language: string | null
    topics: string[]
    readme: string
  }>,
  concurrency = 3
): Promise<AnalyzeResult[]> {
  const results: AnalyzeResult[] = []

  for (let i = 0; i < projects.length; i += concurrency) {
    const batch = projects.slice(i, i + concurrency)
    const batchResults = await Promise.all(
      batch.map((p) => analyzeProject(p.name, p.description, p.language, p.topics, p.readme))
    )
    results.push(...batchResults)
  }

  return results
}
