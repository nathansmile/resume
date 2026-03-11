import {
  Controller,
  Post,
  Get,
  Param,
  Query,
  UseInterceptors,
  UploadedFiles,
  BadRequestException,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { ResumesService } from './resumes.service';
import * as path from 'path';
import * as fs from 'fs';

// Ensure uploads directory exists
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

@Controller('resumes')
export class ResumesController {
  constructor(private readonly resumesService: ResumesService) {}

  @Post('upload')
  @UseInterceptors(
    FilesInterceptor('files', 5, {
      storage: diskStorage({
        destination: uploadsDir,
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, `resume-${uniqueSuffix}.pdf`);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/pdf') {
          cb(null, true);
        } else {
          cb(new BadRequestException('Only PDF files are allowed'), false);
        }
      },
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
      },
    }),
  )
  async uploadResumes(@UploadedFiles() files: Express.Multer.File[]) {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files uploaded');
    }

    // Decode originalname for each file to handle Chinese characters
    const filesWithDecodedNames = files.map(file => ({
      ...file,
      originalname: Buffer.from(file.originalname, 'latin1').toString('utf8'),
    }));

    return this.resumesService.uploadMultipleResumes(filesWithDecodedNames);
  }

  @Get()
  async findAll(
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('status') status?: string,
    @Query('search') search?: string,
  ) {
    const pageNum = parseInt(page || '1') || 1;
    const size = parseInt(pageSize || '20') || 20;

    return this.resumesService.findAll({
      skip: (pageNum - 1) * size,
      take: size,
      status,
      search,
    });
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const candidate = await this.resumesService.findOne(id);
    if (!candidate) {
      throw new BadRequestException('Candidate not found');
    }
    return candidate;
  }
}
