import { Module } from '@nestjs/common';
import { MovieService } from './movie.service';
import { MovieController } from './movie.controller';
import { TypegooseModule } from 'nestjs-typegoose';
import { MovieModel } from './movie.model';
import { TelegramModule } from 'src/telegram/telegram.module';

@Module({
  imports: [
    TypegooseModule.forFeature([
      {
        typegooseClass: MovieModel,
        schemaOptions: {
          collection: 'Movie',
        },
      },
    ]),
    TelegramModule,
  ],
  exports: [MovieService],
  providers: [MovieService],
  controllers: [MovieController],
})
export class MovieModule {}
