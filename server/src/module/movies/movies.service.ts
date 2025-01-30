import { Db } from 'mongodb';
import { Injectable } from '@nestjs/common';
import { InjectClient } from 'nest-mongodb-driver';
import OpenAI from 'openai';
import type { Document } from 'mongodb';

import { SearchDto } from './dtos/search.dto';
import { Movie } from './models/movie';

@Injectable()
export class MoviesService {
  constructor(@InjectClient() private readonly db: Db) {}

  async embeddingsSearch(query: SearchDto): Promise<Movie[]> {
    const vector = await this.getEmbeddings(query.search);
    const aggregationPipeline = [
      {
        $vectorSearch: {
          queryVector: vector,
          path: 'embeddings',
          numCandidates: 100,
          index: 'vectorsearch',
          limit: 100,
        },
      },
    ];
    const movies = (await this.db
      .collection('movies')
      .aggregate(aggregationPipeline)
      .toArray()) as Movie[];

    return movies;
  }

  async createEmbeddings(): Promise<void> {
    const moviesToAddEmbeddings: Movie[] = (await this.db
      .collection('movies')
      .find({ embeddings: { $exists: false } })
      .sort({ _id: 1 })
      .toArray()) as Movie[];

    console.log(
      `${new Date().toISOString()}: Found ${moviesToAddEmbeddings.length} titles without embeddings`,
    );

    const chunkSize = 100;
    for (let i = 0; i < moviesToAddEmbeddings.length; i += chunkSize) {
      const chunk = moviesToAddEmbeddings.slice(i, i + chunkSize);
      await Promise.all(
        chunk.map(async (movie) => {
          const embeddings = await this.getEmbeddingForMovie(movie);
          console.log(
            `Adding embeddings for movie ${movie._id}: ${movie.title}`,
          );
          await this.db
            .collection('movies')
            .updateOne({ _id: movie._id }, { $set: { embeddings } });
        }),
      );
    }

    console.log(
      `${new Date().toISOString()}: Added embedding for ${moviesToAddEmbeddings.length} documents`,
    );
  }

  private async getEmbeddings(input: string): Promise<number[]> {
    const openai = new OpenAI({ apiKey: process.env.OPEN_AI_EMBEDDING_KEY });
    const embeddings = await openai.embeddings.create({
      model: 'text-embedding-ada-002',
      input,
    });
    return embeddings?.data[0]?.embedding;
  }

  private async getEmbeddingForMovie(movie: Movie): Promise<number[]> {
    const input = `${movie.type}: ${movie.title}. Plot: ${movie.plot}. Genres: ${movie.genres?.join(', ') || 'unknown'}. Cast: ${movie.cast?.join(', ') || 'unknown'}. Directors: ${movie.directors?.join(', ') || 'unknown'}. Languages: ${movie.languages?.join(', ') || 'unknown'}. Year: ${movie.year}. Runtime: ${movie.runtime}. IMDB Rating: ${movie.imdb?.rating || 'unknown'}. IMDB Votes: ${movie.imdb?.votes || 'unknown'}`;
    const embeddings = await this.getEmbeddings(input);
    return embeddings;
  }
}
