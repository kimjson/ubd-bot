'use strict';

const { MongoClient } = require('mongodb');
const moment = require('moment-timezone');
const numeral = require('numeral');
const crypto = require('crypto');

const { getRandomQuote } = require('./quote/quote.service');
const { updateStatus, getMovieTitleFromText } = require('./twitter/twitter.service');
const { getAudiencesByMovieTitle } = require('./kofic/kofic.service');
const { UBD } = require('./shared/constants');
const { isWarmerEvent } = require('./aws/aws.service');

const { MONGO_CONNECTION_STRING, TWITTER_CONSUMER_SECRET, TWITTER_BOT_USERNAME } = process.env;

let cachedDb = null;

const connectToDatabase = (uri) => {
  if (cachedDb) {
    return Promise.resolve(cachedDb);
  }

  return MongoClient.connect(uri, { useNewUrlParser: true })
    .then((client) => {
      cachedDb = client.db('ubd-bot');
      return cachedDb;
    });
}

module.exports.tweetRandomQuote = async (event, context, callback) => {
  context.callbackWaitsForEmptyEventLoop = false;

  try {
    const db = await connectToDatabase(MONGO_CONNECTION_STRING);
    const { text } = await getRandomQuote(db);
    const tweet = await updateStatus({ text });

    callback(null, tweet);

  } catch (error) {
    callback(JSON.stringify(error));
  }
};

module.exports.crc = (event, context, callback) => {
  if (isWarmerEvent(event)) return;

  const { crc_token } = event.queryStringParameters;

  callback(null, {
    statusCode: 200,
    body: JSON.stringify({
      response_token: `sha256=${crypto.createHmac('sha256', TWITTER_CONSUMER_SECRET).update(crc_token).digest('base64')}`,
    }),
  });
}

module.exports.replyToMention = async (event, context, callback) => {
  try {
    const eventBody = JSON.parse(event.body);
    const { tweet_create_events: tweetCreateEvents = [] } = eventBody;

    for (let tweetCreateEvent of tweetCreateEvents) {
      const {
        id_str: mentionId,
        text,
        in_reply_to_screen_name: toUsername,
        user: { screen_name: fromUsername }
      } = tweetCreateEvent;

      if (toUsername !== TWITTER_BOT_USERNAME) continue;

      const movieTitle = getMovieTitleFromText(text);

      const formattedDate = moment().tz('Asia/Seoul').format('YYYY년 MM월 DD일 A h시 mm분 ss초');
      const audiences = await getAudiencesByMovieTitle(movieTitle);
      const audiencesInUBD = audiences / UBD;

      const formattedAudiences = numeral(audiences).format('0,0');
      const formattedAudiencesInUBD = numeral(audiencesInUBD).format('0,0.00');

      if (audiencesInUBD) {
        const sendText =`@${fromUsername} ${formattedDate} 기준 [${movieTitle}]의 동원 관객 수는 ${formattedAudiencesInUBD}UBD(=${formattedAudiences}명)입니다.`;
        await updateStatus({ text: sendText, statusId: mentionId });
      }
    }

    return {
      statusCode: 200,
      body: 'Success',
    };
  } catch (error) {
    console.error(error);

    return {
      statusCode: 500,
      headers: { 'Content-Type': 'text/plain' },
      body: error.stack.toString(),
    };
  }
}
