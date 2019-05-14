const { MongoClient } = require('mongodb');

const { configService } = require('../config/config.service');

const MONGO_CONNECTION_STRING = configService.get('MONGO_CONNECTION_STRING');
const MONGO_DATABASE_NAME = configService.get('MONGO_DATABASE_NAME');

let cachedDb = null;

class DatabaseService {
  static build() {
    return new DatabaseService();
  }

  connect() {
    if (cachedDb) {
      return Promise.resolve(cachedDb);
    }

    return MongoClient.connect(MONGO_CONNECTION_STRING, { useNewUrlParser: true })
      .then(client => {
        cachedDb = client;
        return cachedDb;
      });
  };

  getDatabase(client) {
    return client.db(MONGO_DATABASE_NAME);
  }

  getCollection(client, collection) {
    return this.getDatabase(client).collection(collection);
  }
}

exports.DatabaseService = DatabaseService;
exports.databaseService = DatabaseService.build();
