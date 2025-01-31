import { Db } from 'mongodb';
import { Injectable } from '@nestjs/common';
import { InjectClient } from 'nest-mongodb-driver';

import { Movie } from './models/movie';
import { OpenAiService } from '../open-ai/open-ai.service';
import { SearchDto } from './dtos/search.dto';

@Injectable()
export class MoviesService {
  constructor(
    @InjectClient() private readonly db: Db,
    private readonly openAiService: OpenAiService,
  ) {}

  /**
   * Performs a search for movies based on the provided search query using embeddings.
   *
   * @param {SearchDto} query - The search query containing the search string.
   * @returns {Promise<Movie[]>} - A promise that resolves to an array of movies that match the search criteria.
   *
   * @throws {Error} - Throws an error if the embeddings retrieval or database aggregation fails.
   */
  async embeddingsSearch(query: SearchDto): Promise<Movie[]> {
    const vector = await this.openAiService.generateEmbeddings(query.search);
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

  /**
   * Creates embeddings for movies that do not have them yet.
   *
   * This method retrieves movies from the database that do not have embeddings,
   * processes them in chunks, and updates each movie with the generated embeddings.
   *
   * The process involves:
   * 1. Fetching movies without embeddings from the database.
   * 2. Logging the number of movies found.
   * 3. Processing movies in chunks of a specified size.
   * 4. For each chunk, generating embeddings for each movie and updating the database.
   * 5. Logging the completion of the embedding process.
   *
   * @returns {Promise<void>} A promise that resolves when the embeddings have been created and updated in the database.
   */
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

  /**
   * Generates an embedding vector for a given movie.
   *
   * @param {Movie} movie - The movie object containing details such as type, title, plot, genres, cast, directors, languages, year, runtime, and IMDB information.
   * @returns {Promise<number[]>} A promise that resolves to an array of numbers representing the embedding vector for the movie.
   * @private
   */
  private async getEmbeddingForMovie(movie: Movie): Promise<number[]> {
    const input = `${movie.type}: ${movie.title}. Plot: ${movie.fullplot || movie.plot} Genres: ${movie.genres?.join(', ') || 'unknown'}. Cast: ${movie.cast?.join(', ') || 'unknown'}. Directors: ${movie.directors?.join(', ') || 'unknown'}. Languages: ${movie.languages?.join(', ') || 'unknown'}. Year: ${movie.year}. Runtime: ${movie.runtime}. IMDB Rating: ${movie.imdb?.rating || 'unknown'}. IMDB Votes: ${movie.imdb?.votes || 'unknown'}.`;
    const embeddings = await this.openAiService.generateEmbeddings(input);
    return embeddings;
  }
}
