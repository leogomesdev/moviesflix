import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';

@Injectable()
export class OpenAiService {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({ apiKey: process.env.OPEN_AI_EMBEDDING_KEY });
  }

  /**
   * Retrieves the embeddings for a given input string using the OpenAI API.
   *
   * @param {string} input - The input string for which to generate embeddings.
   * @returns {Promise<number[]>} A promise that resolves to an array of numbers representing the embeddings.
   *
   * @throws Will throw an error if the OpenAI API request fails.
   */
  async generateEmbeddings(input: string): Promise<number[]> {
    console.log(`Getting embeddings for: ${input}`);
    const embeddings = await this.openai.embeddings.create({
      model: 'text-embedding-ada-002',
      input,
    });
    return embeddings?.data[0]?.embedding;
  }
}
