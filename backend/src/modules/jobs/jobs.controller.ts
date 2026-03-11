import { Controller, Get, Post, Patch, Delete, Param, Body } from '@nestjs/common';
import { JobsService } from './jobs.service';
import type { CreateJobDto } from './jobs.service';

@Controller('jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @Post()
  async create(@Body() data: CreateJobDto) {
    return this.jobsService.create(data);
  }

  @Get()
  async findAll() {
    return this.jobsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.jobsService.findOne(id);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() data: Partial<CreateJobDto>) {
    return this.jobsService.update(id, data);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.jobsService.delete(id);
  }
}
