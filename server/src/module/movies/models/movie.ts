import { ObjectId } from 'mongodb';

export interface Movie {
  _id: ObjectId;
  plot: string;
  genres: string[];
  runtime: number;
  cast: string[];
  poster: string;
  title: string;
  fullplot: string;
  languages: string[];
  released: Date;
  directors: string[];
  rated: string;
  awards: Array<{
    wins: number;
    nominations: number;
    text: string;
  }>;
  lastupdated: Date;
  year: number;
  imdb: {
    rating: number;
    votes: number;
    id: number;
  };
  countries: string[];
  type: string;
  num_mflix_comments: number;
}
