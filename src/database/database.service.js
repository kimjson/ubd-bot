const { configService } = require('../config/config.service');

const MONGO_CONNECTION_STRING = configService.get('MONGO_CONNECTION_STRING');

let cachedDb = null;

class DatabaseService {
  connectToDatabase = () => {
    if (cachedDb) {
      return Promise.resolve(cachedDb);
    }

    return MongoClient.connect(MONGO_CONNECTION_STRING, { useNewUrlParser: true })
      .then(db => {
        cachedDb = db;
        return cachedDb;
      });
  };
}

exports.databaseService = new DatabaseService();
