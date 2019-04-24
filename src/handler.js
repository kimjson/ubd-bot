'use strict';

const { MongoClient } = require('mongodb');

const { getRandomQuote } = require('./quote/quote.service');
const { updateStatus, getStatusIdFromLink } = require('./twitter/twitter.service');

const mongoConnectionString = process.env.MONGO_CONNECTION_STRING;

let cachedDb = null;

function connectToDatabase (uri) {
  if (cachedDb) {
    return Promise.resolve(cachedDb);
  }

  return MongoClient.connect(uri, { useNewUrlParser: true })
    .then((client) => {
      cachedDb = client.db('ubd-bot');
      return cachedDb;
    });
}

const tweetRandomQuote = async (event, context, callback) => {
  context.callbackWaitsForEmptyEventLoop = false;

  try {
    const db = await connectToDatabase(mongoConnectionString);
    const { text } = await getRandomQuote(db);
    const tweet = await updateStatus({ text });

    callback(null, tweet);

  } catch (error) {
    callback(JSON.stringify(error));
  }
};

const replyToMention = async (event, context, callback) => {
  context.callbackWaitsForEmptyEventLoop = false;

  try {
    const { author, link } = JSON.parse(event.body);
    const statusId = getStatusIdFromLink(link);

    const db = await connectToDatabase(mongoConnectionString);
    const { text } = await getRandomQuote(db);

    const tweet = await updateStatus({ text: `@${author} ${text}`, statusId });

    const response = {
      statusCode: 200,
      body: JSON.stringify(tweet),
    };

    callback(null, response);
  } catch (error) {
    callback(null, {
      statusCode: 500,
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify(error),
    });
  }
}

module.exports = {
  tweetRandomQuote,
  replyToMention,
};
