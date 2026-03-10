import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AiService } from '../ai/ai.service';

export interface CreateEvaluationDto {
  candidateId: string;
  jobId: string;
}

@Injectable()
export class EvaluationsService {
  constructor(
    private prisma: PrismaService,
    private aiService: AiService,
  ) {}

  async createEvaluation(data: CreateEvaluationDto) {
    const { candidateId, jobId } = data;

    // Get candidate info
    const candidate = await this.prisma.candidate.findUnique({
      where: { id: candidateId },
      include: {
        educations: true,
        workExperiences: true,
        skills: true,
        projects: true,
      },
    });

    // Get job description
    const job = await this.prisma.jobDescription.findUnique({
      where: { id: jobId },
    });

    if (!candidate || !job) {
      throw new Error('Candidate or Job not found');
    }

    // Call AI to score
    const scores = await this.aiService.scoreCandidate(
      {
        name: candidate.name,
        educations: candidate.educations,
        workExperiences: candidate.workExperiences,
        skills: candidate.skills.map((s) => s.skillName),
        projects: candidate.projects,
      },
      {
        description: job.description,
        requiredSkills: job.requiredSkills,
        preferredSkills: job.preferredSkills,
      },
    );

    // Save evaluation
    return this.prisma.evaluation.create({
      data: {
        candidateId,
        jobId,
        overallScore: scores.overallScore,
        skillMatchScore: scores.skillMatchScore,
        experienceScore: scores.experienceScore,
        educationScore: scores.educationScore,
        aiComment: scores.aiComment,
      },
      include: {
        candidate: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        jobDescription: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });
  }

  async findAll() {
    return this.prisma.evaluation.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        candidate: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        jobDescription: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });
  }

  async findOne(id: string) {
    return this.prisma.evaluation.findUnique({
      where: { id },
      include: {
        candidate: true,
        jobDescription: true,
      },
    });
  }

  async findByCandidate(candidateId: string) {
    return this.prisma.evaluation.findMany({
      where: { candidateId },
      orderBy: { createdAt: 'desc' },
      include: {
        jobDescription: true,
      },
    });
  }

  async findByJob(jobId: string) {
    return this.prisma.evaluation.findMany({
      where: { jobId },
      orderBy: { overallScore: 'desc' },
      include: {
        candidate: true,
      },
    });
  }
}
