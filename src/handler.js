'use strict';

const numeral = require('numeral');

const { quoteService } = require('./quote/quote.service');
const { twitterService } = require('./twitter/twitter.service');
const { koficService } = require('./kofic/kofic.service');
const { awsService } = require('./aws/aws.service');
const { configService } = require('./config/config.service');

const { UBD } = require('./shared/constants');
const { moment } = require('./shared/utils/moment');

const TWITTER_BOT_USERNAME = configService.get('TWITTER_BOT_USERNAME');

exports.tweetRandomQuote = async (event, context, callback) => {
  context.callbackWaitsForEmptyEventLoop = false;

  try {
    const { text } = await quoteService.getRandomQuote(db);
    const tweet = await twitterService.updateStatus({ text });

    callback(null, tweet);

  } catch (error) {
    callback(JSON.stringify(error));
  }
};

exports.crc = (event, context, callback) => {
  if (awsService.isWarmerEvent(event)) return;

  const { crc_token: crcToken } = event.queryStringParameters;

  callback(null, {
    statusCode: 200,
    body: JSON.stringify(twitterService.buildCrcPayload(crcToken)),
  });
}

exports.replyToMention = async (event, context, callback) => {
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

      const movieTitle = twitterService.getMovieTitleFromText(text);

      const formattedDate = moment().format('YYYY년 MM월 DD일 A h시 mm분 ss초');
      const audiences = await koficService.getAudiencesByMovieTitle(movieTitle);
      const audiencesInUBD = audiences / UBD;

      const formattedAudiences = numeral(audiences).format('0,0');
      const formattedAudiencesInUBD = numeral(audiencesInUBD).format('0,0.00');

      if (audiencesInUBD) {
        const sendText =`@${fromUsername} ${formattedDate} 기준 [${movieTitle}]의 동원 관객 수는 ${formattedAudiencesInUBD}UBD(=${formattedAudiences}명)입니다.`;
        await twitterService.updateStatus({ text: sendText, statusId: mentionId });
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
