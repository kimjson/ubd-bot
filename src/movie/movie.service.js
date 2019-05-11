const { databaseService } = require('../database/database.service');
const { removeWhiteSpaces } = require('../shared/utils');

class MovieService {
  constructor(client) {
    this.client = client;
    this.collection = databaseService.getCollection(client, 'movies');
  }

  static async build() {
    return new MovieService(await databaseService.connect());
  }

  async findOrUpsertOne(movieInput) {
    const filter = { title: removeWhiteSpaces(movieInput.title) };

    const movie = this.collection.findOne(filter);

    if (!movie || movie.countedAt < movieInput.countedAt) {
      console.log('insert!');
      const doc = { ...movieInput, ...filter };

      const insertResult = this.collection.replaceOne(filter, doc, { upsert: true });

      return insertResult.ops[0];
    }

    return movie;
  }

  quit() {
    this.collection = undefined;
    this.client.close();
  }
}

exports.MovieService = MovieService;
