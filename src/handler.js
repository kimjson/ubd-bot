'use strict';

const { MongoClient } = require('mongodb');

const { getRandomQuote } = require('./quote/quote.service');
const { updateStatus } = require('./twitter/twitter.service');

const mongoConnectionString = process.env.MONGO_CONNECTION_STRING;

let cachedDb = null;

function connectToDatabase (uri) {
  if (cachedDb) {
    return Promise.resolve(cachedDb);
  }

  return MongoClient.connect(uri)
    .then((client) => {
      cachedDb = client.db('ubd-bot');
      return cachedDb;
    });
}

const tweetRandomQuote = async (event, context, callback) => {
  context.callbackWaitsForEmptyEventLoop = false;

  try {
    const db = await connectToDatabase(mongoConnectionString);
    const quote = await getRandomQuote(db);
    const tweet = await updateStatus(quote.text);

    callback(null, tweet);

  } catch (error) {
    callback(error);
  }
};

module.exports = {
  tweetRandomQuote
};
