const { databaseService } = require('../database/database.service');

const _findOrCreateMovie = async (db, movieInput) => {
  const collection = db.collection('movies');

  const movie = collection.findOne({ title: titleWithoutWhiteSpaces });

  if (!movie || movie.countedAt < movieInput.countedAt) {
    console.log('insert!');
    const filter = { title: titleWithoutWhiteSpaces };
    const doc = { ...movieInput, ...filter };

    const insertResult = collection.replaceOne(filter, doc, { upsert: true });

    return insertResult.ops[0];
  }

  return movie;
};

class MovieService {
  findOrCreateMovie = async (movieInput) => {
    const db = await databaseService.connectToDatabase();
    const movie = _findOrCreateMovie(db, movieInput);

    return movie;
  }

  findOrCreateMovieAndClose = async (movieInput) => {
    const db = await databaseService.connectToDatabase();
    const movie = _findOrCreateMovie(db, movieInput);

    db.close();

    return movie;
  }
}

exports.movieService = new MovieService();
