'use strict';

const { twitterService } = require('./twitter/twitter.service');
const { koficService } = require('./kofic/kofic.service');
const { awsService } = require('./aws/aws.service');
const { textService } = require('./text/text.service');

const { QuoteService } = require('./quote/quote.service');
const { MovieService } = require('./movie/movie.service');

exports.tweetRandomQuote = async (event, context, callback) => {
  context.callbackWaitsForEmptyEventLoop = false;

  try {
    const quoteService = await QuoteService.build();

    const { text } = await quoteService.findOneRandomly();
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

exports.collectDailyBoxOffice = async (event, context, callback) => {
  context.callbackWaitsForEmptyEventLoop = false;

  try {
    const movieService = await MovieService.build();

    const { showRange, dailyBoxOfficeList } = await koficService.findDailyBoxOfficeResultByDate();
    const { to: countedAt } = textService.parseKoficRange(showRange);

    const promises = dailyBoxOfficeList.map(async (boxOffice) => {
      const { movieNm: title, audiAcc: audiences } = boxOffice;
      const movie = { title, audiences: Number(audiences), countedAt }

      return await movieService.findOrUpsertOne(movie);
    });

    const movies = await Promise.all(promises);

    callback(null, movies);

  } catch (error) {
    callback(JSON.stringify(error));
  }
}

exports.replyToMention = async (event, context, callback) => {
  context.callbackWaitsForEmptyEventLoop = false;

  try {
    const eventBody = JSON.parse(event.body);
    const { tweet_create_events: tweetCreateEvents = [] } = eventBody;

    const movieService = await MovieService.build();

    const replyPromises = tweetCreateEvents
      .filter(twitterService.isMentionForBot)
      .map(twitterService.parseTweetCreateEvent)
      .map(async (parsedEvent) => {
        const { text } = parsedEvent;
        const title = textService.extractMovieTitle(text);

        const boxOffice = await koficService.findDailyBoxOfficeByTitle(title);
        const upsertedMovie = await movieService.upsertOneByBoxOffice(boxOffice);
        const movie = upsertedMovie || (await movieService.findMovieByTitle(title));

        return twitterService.computeUbdAndReply(parsedEvent, movie);
      });

    await Promise.all(replyPromises);

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
