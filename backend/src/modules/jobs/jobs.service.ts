import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface CreateJobDto {
  title: string;
  description: string;
  requiredSkills: string[];
  preferredSkills: string[];
}

@Injectable()
export class JobsService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateJobDto) {
    return this.prisma.jobDescription.create({
      data,
    });
  }

  async findAll() {
    return this.prisma.jobDescription.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        evaluations: {
          select: {
            id: true,
            candidateId: true,
            overallScore: true,
          },
        },
      },
    });
  }

  async findOne(id: string) {
    return this.prisma.jobDescription.findUnique({
      where: { id },
      include: {
        evaluations: {
          include: {
            candidate: {
              select: {
                id: true,
                name: true,
                email: true,
                status: true,
              },
            },
          },
          orderBy: { overallScore: 'desc' },
        },
      },
    });
  }

  async update(id: string, data: Partial<CreateJobDto>) {
    return this.prisma.jobDescription.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    return this.prisma.jobDescription.delete({
      where: { id },
    });
  }
}
