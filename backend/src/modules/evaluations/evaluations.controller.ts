import { Controller, Post, Get, Param, Body } from '@nestjs/common';
import { EvaluationsService, CreateEvaluationDto } from './evaluations.service';

@Controller('evaluations')
export class EvaluationsController {
  constructor(private readonly evaluationsService: EvaluationsService) {}

  @Post()
  async create(@Body() data: CreateEvaluationDto) {
    return this.evaluationsService.createEvaluation(data);
  }

  @Get()
  async findAll() {
    return this.evaluationsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.evaluationsService.findOne(id);
  }

  @Get('candidate/:candidateId')
  async findByCandidate(@Param('candidateId') candidateId: string) {
    return this.evaluationsService.findByCandidate(candidateId);
  }

  @Get('job/:jobId')
  async findByJob(@Param('jobId') jobId: string) {
    return this.evaluationsService.findByJob(jobId);
  }
}
