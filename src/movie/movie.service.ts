import { Injectable, NotFoundException } from '@nestjs/common';
import { ModelType } from '@typegoose/typegoose/lib/types';
import { Types } from 'mongoose';
import { InjectModel } from 'nestjs-typegoose';
import { TelegramService } from 'src/telegram/telegram.service';
import { CreateMovieDto } from './dto/create-movie.dto';
import { updateCountDto } from './dto/update-count-view.dto';
import { MovieModel } from './movie.model';

@Injectable()
export class MovieService {
  constructor(
    @InjectModel(MovieModel) private readonly MovieModel: ModelType<MovieModel>,
    private readonly telegramService: TelegramService,
  ) {}

  async getAll(searchTerm?: string) {
    let options = {};

    if (searchTerm) {
      options = {
        $or: [
          {
            title: new RegExp(searchTerm, 'i'),
          },
        ],
      };
    }

    return this.MovieModel.find(options)
      .select('-updateAt -__v')
      .sort({
        createdAt: 'desc',
      })
      .populate('actors genres')
      .exec();
  }

  async byActor(actorId: Types.ObjectId) {
    const doc = await this.MovieModel.find({ actors: actorId }).exec();
    if (!doc) {
      throw new NotFoundException('Movies Not Found');
    }
    return doc;
  }

  async byGenres(genreIds: Types.ObjectId[]) {
    return this.MovieModel.find({ genres: { $in: genreIds } }).exec();
  }

  async bySlug(slug: string) {
    const doc = await this.MovieModel.findOne({ slug })
      .populate('actors genres')
      .exec();
    if (!doc) {
      throw new NotFoundException('Movies Not Found');
    }
    return doc;
  }

  async updateCountOpened(slug: string) {
    console.log(slug);
    const updateMovie = await this.MovieModel.findOneAndUpdate(
      { slug },
      {
        $inc: { countOpened: 1 },
      },
      {
        new: true,
      },
    ).exec();

    if (!updateMovie) {
      throw new NotFoundException('Movie not found');
    }

    return updateMovie;
  }

  async getMostPopular() {
    return this.MovieModel.find({ countOpened: { $gt: 0 } })
      .sort({ countOpened: -1 })
      .populate('genres')
      .exec();
  }

  async updateRating(_id: Types.ObjectId, newRating: number) {
    return this.MovieModel.findByIdAndUpdate(
      _id,
      {
        rating: newRating,
      },
      {
        new: true,
      },
    ).exec();
  }

  //ADMIN

  async byId(_id: string) {
    const Movie = await this.MovieModel.findById(_id);
    if (!Movie) {
      throw new NotFoundException('Movie not found');
    }
    return Movie;
  }

  async create() {
    const defaultValue: CreateMovieDto = {
      poster: '',
      bigPoster: '',
      title: '',
      slug: '',
      genres: [],
      actors: [],
      videoURL: '',
    };

    const movie = await this.MovieModel.create(defaultValue);
    return movie._id;
  }

  async update(_id: string, dto: CreateMovieDto) {
    if (!dto.IsSendTelegram) {
      await this.sendNotification(dto);
      dto.IsSendTelegram = true;
    }
    const updateMovie = await this.MovieModel.findByIdAndUpdate(_id, dto, {
      new: true,
    }).exec();

    if (!updateMovie) {
      throw new NotFoundException('Movie not found');
    }

    return updateMovie;
  }
  async delete(id: string) {
    const deleteMovie = await this.MovieModel.findByIdAndDelete(id).exec();
    if (!deleteMovie) {
      throw new NotFoundException('Movie not found');
    }
    return deleteMovie;
  }

  //TELEGRAM
  async sendNotification(dto: CreateMovieDto) {
    // if (process.env.NODE_END !== 'development') {
    //   await this.telegramService.sendPhoto(dto.poster);
    // }
    const msg = `<b>${dto.title}</b>`;
    await this.telegramService.sendPhoto(
      'https://images.unsplash.com/photo-1668814454344-d1280b03c075?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2971&q=80',
    );
    await this.telegramService.sendMessage(msg, {
      reply_markup: {
        inline_keyboard: [
          [
            {
              url: 'https://www.youtube.com/',
              text: 'Better watch YT',
            },
          ],
        ],
      },
    });
  }
}
