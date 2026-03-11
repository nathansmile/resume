import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PdfService } from './pdf.service';
import * as fs from 'fs/promises';
import * as path from 'path';

@Injectable()
export class ResumesService {
  constructor(
    private prisma: PrismaService,
    private pdfService: PdfService,
  ) {}

  async uploadResume(file: Express.Multer.File) {
    // Validate file
    if (!file.mimetype.includes('pdf')) {
      throw new BadRequestException('Only PDF files are allowed');
    }

    if (file.size > 10 * 1024 * 1024) {
      throw new BadRequestException('File size must be less than 10MB');
    }

    try {
      // Extract text from PDF
      const rawText = await this.pdfService.extractText(file.path);

      if (!rawText || rawText.length < 50) {
        throw new BadRequestException('PDF appears to be empty or unreadable');
      }

      // Generate thumbnail (optional)
      const thumbnail = await this.pdfService.generateThumbnail(file.path);

      // Create candidate record
      const candidate = await this.prisma.candidate.create({
        data: {
          name: 'Unknown', // Will be extracted by AI
          pdfUrl: file.path,
          pdfThumbnail: thumbnail,
          rawText: rawText,
        },
      });

      return {
        id: candidate.id,
        name: candidate.name,
        rawText: rawText.substring(0, 500), // Return preview
        createdAt: candidate.createdAt,
      };
    } catch (error) {
      // Clean up file if processing failed
      await fs.unlink(file.path).catch(() => {});
      throw error;
    }
  }

  async uploadMultipleResumes(files: Express.Multer.File[]) {
    const results: any[] = [];
    const errors: any[] = [];

    for (const file of files) {
      try {
        const result = await this.uploadResume(file);
        results.push({ success: true, data: result, filename: file.originalname });
      } catch (error) {
        errors.push({ success: false, error: error.message, filename: file.originalname });
      }
    }

    return { results, errors };
  }

  async findOne(id: string) {
    return this.prisma.candidate.findUnique({
      where: { id },
      include: {
        educations: true,
        workExperiences: true,
        skills: true,
        projects: true,
        evaluations: {
          include: {
            jobDescription: true,
          },
        },
      },
    });
  }

  async findAll(params?: {
    skip?: number;
    take?: number;
    status?: string;
    search?: string;
  }) {
    const { skip = 0, take = 20, status, search } = params || {};

    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { rawText: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [candidates, total] = await Promise.all([
      this.prisma.candidate.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          skills: true,
          evaluations: {
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
        },
      }),
      this.prisma.candidate.count({ where }),
    ]);

    return {
      data: candidates,
      total,
      page: Math.floor(skip / take) + 1,
      pageSize: take,
    };
  }
}
