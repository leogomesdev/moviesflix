import { ConfigModule } from '@nestjs/config';
import { Module } from '@nestjs/common';
import { MongoDbDriverModule } from 'nest-mongodb-driver';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MoviesModule } from './module/movies/movies.module';
import { OpenAiModule } from './module/open-ai/open-ai.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    // https://github.com/Tony133/nestjs-mongodb-driver
    MongoDbDriverModule.forRoot({
      url: process.env.MONGO_CONNECTION_STRING!,
    }),
    MoviesModule,
    OpenAiModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
