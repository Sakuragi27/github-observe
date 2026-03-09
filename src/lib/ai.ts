import axios from 'axios'

const VOLCANO_API_URL = 'https://ark.cn-beijing.volces.com/api/v3/chat/completions'

export interface AnalyzeResult {
  tags: { name: string; category: string }[]
  solvedProblem: string
  useCases: string[]
  keyFeatures: string[]
}

export async function analyzeProject(
  name: string,
  description: string | null,
  language: string | null,
  topics: string[],
  readmeSummary: string
): Promise<AnalyzeResult> {
  const prompt = `你是一个 GitHub 项目分析专家。请分析以下项目，输出结构化结果。

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
  "solvedProblem": "一句话描述这个项目主要解决什么问题",
  "useCases": ["适用场景1", "适用场景2"],
  "keyFeatures": ["核心特性1", "核心特性2"]
}

注意：
1. 标签要细化到最小颗粒度，如：AI -> Agent -> Skill
2. 一个项目可以有多个标签，从不同维度描述
3. "解决的问题"要具体，让人一目了然

只输出 JSON，不要其他内容。`

  try {
    const response = await axios.post(
      VOLCANO_API_URL,
      {
        model: process.env.VOLCANO_ENDPOINT_ID,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 1000,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.VOLCANO_API_KEY}`,
        },
      }
    )

    const content = response.data.choices[0].message.content
    const jsonMatch = content.match(/\{[\s\S]*\}/)
    
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0])
    }

    return getDefaultResult(name, description)
  } catch (error) {
    console.error('AI analyze error:', error)
    return getDefaultResult(name, description)
  }
}

function getDefaultResult(name: string, description: string | null): AnalyzeResult {
  return {
    tags: [{ name: '待分类', category: '其他' }],
    solvedProblem: description || `${name} 项目`,
    useCases: [],
    keyFeatures: [],
  }
}
