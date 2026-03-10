import { Module } from '@nestjs/common';
import { ResumesController } from './resumes.controller';
import { ResumesService } from './resumes.service';
import { PdfService } from './pdf.service';

@Module({
  controllers: [ResumesController],
  providers: [ResumesService, PdfService],
  exports: [ResumesService],
})
export class ResumesModule {}
