import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PdfService } from './pdf.service';
import * as fs from 'fs/promises';

@Injectable()
export class ResumesService {
  constructor(
    private prisma: PrismaService,
    private pdfService: PdfService,
  ) {}

  async uploadResume(file: Express.Multer.File) {
    try {
      // Validate file
      if (!file.mimetype.includes('pdf')) {
        throw new BadRequestException('Only PDF files are allowed');
      }

      // Extract text from PDF
      const rawText = await this.pdfService.extractText(file.path);

      if (!rawText || rawText.trim().length === 0) {
        throw new BadRequestException('PDF文件为空或无法提取文本');
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
    } catch (error: any) {
      // Clean up file if processing failed
      await fs.unlink(file.path).catch(() => {});
      
      // Re-throw with better error message
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(`PDF处理失败: ${error.message || '未知错误'}`);
    }
  }

  async uploadMultipleResumes(files: Express.Multer.File[]) {
    const results: any[] = [];
    const errors: any[] = [];

    for (const file of files) {
      try {
        const result = await this.uploadResume(file);
        results.push({ success: true, data: result, filename: file.originalname });
      } catch (error: any) {
        const errorMessage = error.message || error.toString();
        results.push({ success: false, error: errorMessage, filename: file.originalname });
      }
    }

    return { results, errors: [] };
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

  async findAll(params: {
    skip?: number;
    take?: number;
    status?: string;
    search?: string;
  }) {
    const { skip = 0, take = 20, status, search } = params;

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

    const [data, total] = await Promise.all([
      this.prisma.candidate.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          skills: true,
          educations: true,
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
}
