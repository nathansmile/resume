import { Injectable } from '@nestjs/common';
import Anthropic from '@anthropic-ai/sdk';
import { ConfigService } from '@nestjs/config';

export interface ExtractedInfo {
  basicInfo: {
    name: string;
    phone?: string;
    email?: string;
    city?: string;
  };
  educations: Array<{
    school: string;
    major?: string;
    degree?: string;
    graduationDate?: string;
  }>;
  workExperiences: Array<{
    company: string;
    position: string;
    startDate?: string;
    endDate?: string;
    description?: string;
  }>;
  skills: string[];
  projects?: Array<{
    projectName: string;
    techStack: string[];
    role?: string;
    highlights?: string;
  }>;
}

@Injectable()
export class AiService {
  private anthropic: Anthropic;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('ANTHROPIC_API_KEY');
    if (!apiKey) {
      console.warn('ANTHROPIC_API_KEY not set, AI features will not work');
    }
    this.anthropic = new Anthropic({
      apiKey: apiKey || 'dummy-key',
    });
  }

  async *extractResumeInfo(resumeText: string): AsyncGenerator<any> {
    const prompt = `你是一个专业的简历解析助手。请从以下简历文本中提取结构化信息，以JSON格式返回。

要求：
1. 仔细分析简历内容，提取所有关键信息
2. 如果某些信息缺失，对应字段可以为空或null
3. 技能标签需要提取所有技术栈、工具、语言等
4. 返回严格的JSON格式，不要有其他文字

JSON格式：
{
  "basicInfo": {
    "name": "姓名",
    "phone": "电话",
    "email": "邮箱",
    "city": "城市"
  },
  "educations": [
    {
      "school": "学校名称",
      "major": "专业",
      "degree": "学历（本科/硕士/博士）",
      "graduationDate": "毕业时间（YYYY-MM格式）"
    }
  ],
  "workExperiences": [
    {
      "company": "公司名称",
      "position": "职位",
      "startDate": "开始时间（YYYY-MM）",
      "endDate": "结束时间（YYYY-MM或至今）",
      "description": "工作内容简要描述"
    }
  ],
  "skills": ["技能1", "技能2", "技能3"],
  "projects": [
    {
      "projectName": "项目名称",
      "techStack": ["技术1", "技术2"],
      "role": "担任角色",
      "highlights": "项目亮点"
    }
  ]
}

简历文本：
${resumeText}`;

    try {
      const stream = await this.anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4096,
        messages: [{ role: 'user', content: prompt }],
        stream: true,
      });

      let fullText = '';

      for await (const event of stream) {
        if (
          event.type === 'content_block_delta' &&
          event.delta.type === 'text_delta'
        ) {
          const text = event.delta.text;
          fullText += text;

          // Yield incremental updates
          yield {
            type: 'text',
            content: text,
            fullText: fullText,
          };
        }

        if (event.type === 'message_stop') {
          // Try to parse the complete JSON
          try {
            const jsonMatch = fullText.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
              const parsed = JSON.parse(jsonMatch[0]);
              yield {
                type: 'complete',
                data: parsed,
              };
            }
          } catch (e) {
            yield {
              type: 'error',
              error: 'Failed to parse JSON response',
            };
          }
        }
      }
    } catch (error) {
      yield {
        type: 'error',
        error: error.message,
      };
    }
  }

  async scoreCandidate(
    candidateInfo: any,
    jobDescription: {
      description: string;
      requiredSkills: string[];
      preferredSkills: string[];
    },
  ): Promise<{
    overallScore: number;
    skillMatchScore: number;
    experienceScore: number;
    educationScore: number;
    aiComment: string;
  }> {
    const prompt = `你是一个专业的HR助手。请根据候选人信息和岗位要求，进行匹配度评分。

岗位要求：
${jobDescription.description}

必备技能：${jobDescription.requiredSkills.join(', ')}
加分技能：${jobDescription.preferredSkills.join(', ')}

候选人信息：
${JSON.stringify(candidateInfo, null, 2)}

请按以下维度评分（0-100分）：
1. 技能匹配度（40%权重）：候选人技能与岗位要求的匹配程度
2. 经验相关性（35%权重）：工作经历与岗位的相关程度
3. 教育背景契合度（25%权重）：学历和专业的匹配程度

返回JSON格式：
{
  "skillMatchScore": 85,
  "experienceScore": 78,
  "educationScore": 90,
  "overallScore": 82,
  "aiComment": "候选人优势：...\n需要关注：..."
}`;

    try {
      const response = await this.anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2048,
        messages: [{ role: 'user', content: prompt }],
      });

      const content = response.content[0];
      if (content.type === 'text') {
        const jsonMatch = content.text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
      }

      throw new Error('Failed to parse AI response');
    } catch (error) {
      throw new Error(`AI scoring failed: ${error.message}`);
    }
  }
}
