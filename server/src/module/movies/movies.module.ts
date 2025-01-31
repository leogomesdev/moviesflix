import { Module } from '@nestjs/common';
import { MoviesService } from './movies.service';
import { MoviesController } from './movies.controller';
import { OpenAiModule } from '../open-ai/open-ai.module';

@Module({
  controllers: [MoviesController],
  imports: [OpenAiModule],
  providers: [MoviesService],
})
export class MoviesModule {}
