import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AiService, ExtractedInfo } from '../ai/ai.service';
import { CandidateStatus } from '@prisma/client';

@Injectable()
export class CandidatesService {
  constructor(
    private prisma: PrismaService,
    private aiService: AiService,
  ) {}

  async updateExtractedInfo(candidateId: string, extractedInfo: ExtractedInfo) {
    const { basicInfo, educations, workExperiences, skills, projects } = extractedInfo;

    // Update candidate basic info
    await this.prisma.candidate.update({
      where: { id: candidateId },
      data: {
        name: basicInfo.name || 'Unknown',
        phone: basicInfo.phone,
        email: basicInfo.email,
        city: basicInfo.city,
      },
    });

    // Create educations
    if (educations && educations.length > 0) {
      await this.prisma.education.createMany({
        data: educations.map((edu, index) => ({
          candidateId,
          school: edu.school,
          major: edu.major,
          degree: edu.degree,
          graduationDate: edu.graduationDate ? new Date(edu.graduationDate) : null,
          orderIndex: index,
        })),
      });
    }

    // Create work experiences
    if (workExperiences && workExperiences.length > 0) {
      await this.prisma.workExperience.createMany({
        data: workExperiences.map((work, index) => ({
          candidateId,
          company: work.company,
          position: work.position,
          startDate: work.startDate ? new Date(work.startDate) : null,
          endDate: work.endDate ? new Date(work.endDate) : null,
          description: work.description,
          orderIndex: index,
        })),
      });
    }

    // Create skills
    if (skills && skills.length > 0) {
      await this.prisma.skill.createMany({
        data: skills.map((skill) => ({
          candidateId,
          skillName: skill,
        })),
      });
    }

    // Create projects
    if (projects && projects.length > 0) {
      await this.prisma.project.createMany({
        data: projects.map((project, index) => ({
          candidateId,
          projectName: project.projectName,
          techStack: project.techStack || [],
          role: project.role,
          highlights: project.highlights,
          orderIndex: index,
        })),
      });
    }

    return this.findOne(candidateId);
  }

  async updateStatus(candidateId: string, status: CandidateStatus) {
    return this.prisma.candidate.update({
      where: { id: candidateId },
      data: { status },
    });
  }

  async findOne(id: string) {
    const candidate = await this.prisma.candidate.findUnique({
      where: { id },
      include: {
        educations: { orderBy: { orderIndex: 'asc' } },
        workExperiences: { orderBy: { orderIndex: 'asc' } },
        skills: true,
        projects: { orderBy: { orderIndex: 'asc' } },
        evaluations: {
          include: { jobDescription: true },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!candidate) {
      throw new NotFoundException('Candidate not found');
    }

    return candidate;
  }

  async compare(candidateIds: string[]) {
    const candidates = await Promise.all(
      candidateIds.map((id) => this.findOne(id)),
    );

    return candidates;
  }

  async findAll(params: {
    skip?: number;
    take?: number;
    status?: string;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    skill?: string;
  }) {
    const { skip = 0, take = 20, status, search, sortBy = 'createdAt', sortOrder = 'desc', skill } = params;

    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (skill) {
      where.skills = {
        some: {
          skillName: { contains: skill, mode: 'insensitive' },
        },
      };
    }

    const orderBy: any = {};
    if (sortBy === 'score') {
      orderBy.evaluations = {
        _max: {
          overallScore: sortOrder,
        },
      };
    } else {
      orderBy[sortBy] = sortOrder;
    }

    const [data, total] = await Promise.all([
      this.prisma.candidate.findMany({
        where,
        skip,
        take,
        orderBy,
        include: {
          skills: true,
          educations: {
            orderBy: { orderIndex: 'asc' },
            take: 1,
          },
          evaluations: {
            orderBy: { createdAt: 'desc' },
            take: 1,
            include: {
              jobDescription: true,
            },
          },
        },
      }),
      this.prisma.candidate.count({ where }),
    ]);

    return {
      data,
      total,
      page: Math.floor(skip / take) + 1,
      pageSize: take,
    };
  }

  async delete(id: string) {
    const candidate = await this.prisma.candidate.findUnique({
      where: { id },
    });

    if (!candidate) {
      throw new NotFoundException('Candidate not found');
    }

    await this.prisma.candidate.delete({
      where: { id },
    });

    return { success: true, message: 'Candidate deleted successfully' };
  }
}