import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongoDbDriverModule } from 'nest-mongodb-driver';
import { MoviesModule } from './module/movies/movies.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    MongoDbDriverModule.forRoot({
      url: process.env.MONGO_CONNECTION_STRING!,
  }),
    MoviesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
