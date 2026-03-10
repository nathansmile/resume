import {
  Controller,
  Get,
  Patch,
  Post,
  Param,
  Body,
  Sse,
  NotFoundException,
} from '@nestjs/common';
import { CandidatesService } from './candidates.service';
import { AiService } from '../ai/ai.service';
import { PrismaService } from '../prisma/prisma.service';
import { Observable } from 'rxjs';
import { CandidateStatus } from '@prisma/client';

@Controller('candidates')
export class CandidatesController {
  constructor(
    private readonly candidatesService: CandidatesService,
    private readonly aiService: AiService,
    private readonly prisma: PrismaService,
  ) {}

  @Sse(':id/extract')
  async extractInfo(@Param('id') id: string): Promise<Observable<MessageEvent>> {
    const candidate = await this.prisma.candidate.findUnique({
      where: { id },
    });

    if (!candidate) {
      throw new NotFoundException('Candidate not found');
    }

    return new Observable((observer) => {
      (async () => {
        try {
          let extractedData = null;

          for await (const chunk of this.aiService.extractResumeInfo(candidate.rawText)) {
            observer.next({
              data: JSON.stringify(chunk),
            } as MessageEvent);

            if (chunk.type === 'complete') {
              extractedData = chunk.data;
            }
          }

          // Save extracted info to database
          if (extractedData) {
            await this.candidatesService.updateExtractedInfo(id, extractedData);
          }

          observer.complete();
        } catch (error) {
          observer.error(error);
        }
      })();
    });
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.candidatesService.findOne(id);
  }

  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: CandidateStatus,
  ) {
    return this.candidatesService.updateStatus(id, status);
  }

  @Patch(':id')
  async updateInfo(
    @Param('id') id: string,
    @Body() extractedInfo: any,
  ) {
    return this.candidatesService.updateExtractedInfo(id, extractedInfo);
  }

  @Post('compare')
  async compare(@Body('candidateIds') candidateIds: string[]) {
    if (!candidateIds || candidateIds.length < 2) {
      throw new NotFoundException('At least 2 candidates required for comparison');
    }
    return this.candidatesService.compare(candidateIds);
  }
}
