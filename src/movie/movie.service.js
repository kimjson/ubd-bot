const { databaseService } = require('../database/database.service');
const { textService } = require('../text/text.service');

class MovieService {
  constructor(client) {
    this.client = client;
    this.collection = databaseService.getCollection(client, 'movies');
  }

  static async build() {
    return new MovieService(await databaseService.connect());
  }

  async findMovieByTitle(title) {
    return this.collection.findOne({ title: textService.removeWhiteSpaces(title) });
  }

  async findOrUpsertOne(movieInput) {
    const filter = { title: textService.removeWhiteSpaces(movieInput.title) };

    const movie = await this.collection.findOne(filter);

    if (!movie || movie.countedAt < movieInput.countedAt) {
      console.log('insert!');
      return await this.upsertOne(movieInput);
    }

    return movie;
  }

  async upsertOne(movieInput) {
    const filter = { title: textService.removeWhiteSpaces(movieInput.title) };
    const doc = { ...movieInput, ...filter };
    const upsertResult = await this.collection.replaceOne(filter, doc, { upsert: true });

    return upsertResult.ops[0];
  }

  async upsertOneByBoxOffice(boxOffice) {
    if (boxOffice && Number.isFinite(boxOffice.audiAcc)) {
      const { audiAcc: audiences } = boxOffice;
      const countedAt = new Date();
      const movieInput = { title, audiences, countedAt };
      return await movieService.upsertOne(movieInput);
    }

    return undefined;
  }

  quit() {
    this.collection = undefined;
    this.client.close();
  }
}

exports.MovieService = MovieService;
