import { Controller, Get, Post, Query, ValidationPipe } from '@nestjs/common';
import type { Document } from 'mongodb';

import { Movie } from './models/movie';
import { MoviesService } from './movies.service';
import { SearchDto } from './dtos/search.dto';

@Controller('movies')
export class MoviesController {
  constructor(private readonly moviesService: MoviesService) {}

  @Get()
  async embeddingsSearch(
    @Query(
      new ValidationPipe({
        transform: true,
        transformOptions: { enableImplicitConversion: true },
        forbidNonWhitelisted: true,
      }),
    )
    query: SearchDto,
  ): Promise<Movie[]> {
    return await this.moviesService.embeddingsSearch(query);
  }

  @Post('/createEmbeddings')
  async createEmbeddings(): Promise<void> {
    return await this.moviesService.createEmbeddings();
  }
}
