import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './modules/prisma/prisma.module';
import { ResumesModule } from './modules/resumes/resumes.module';
import { CandidatesModule } from './modules/candidates/candidates.module';
import { JobsModule } from './modules/jobs/jobs.module';
import { EvaluationsModule } from './modules/evaluations/evaluations.module';
import { AiModule } from './modules/ai/ai.module';
import { AuthModule } from './modules/auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    AiModule,
    AuthModule,
    ResumesModule,
    CandidatesModule,
    JobsModule,
    EvaluationsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
