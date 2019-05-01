'use strict';

const Twitter = require('twitter');

const {
  UBD_BOT_ENV,
  TWITTER_CONSUMER_KEY,
  TWITTER_CONSUMER_SECRET,
  TWITTER_ACCESS_TOKEN_KEY,
  TWITTER_ACCESS_TOKEN_SECRET,
  TWITTER_BOT_USERNAME,
} = process.env;

const client = new Twitter({
  consumer_key: TWITTER_CONSUMER_KEY,
  consumer_secret: TWITTER_CONSUMER_SECRET,
  access_token_key: TWITTER_ACCESS_TOKEN_KEY,
  access_token_secret: TWITTER_ACCESS_TOKEN_SECRET,
});

module.exports.updateStatus = async ({ text, statusId }) => new Promise((resolve, reject) => {
  const status = (UBD_BOT_ENV === 'production')
    ? text
    : `${text} - ${UBD_BOT_ENV} 환경에서 테스트 중.`;

  const params = statusId
    ? { status, in_reply_to_status_id: statusId }
    : { status };

  client
    .post('statuses/update', params)
    .then(tweet => {
      resolve(tweet);
    })
    .catch(error => reject(error));
});

module.exports.getStatusIdFromLink = (link) => {
  const tokens = link.split('/');

  if (!tokens || tokens.length === 0) throw Error('Invalid twitter status link');

  return Number(tokens[tokens.length - 1]);
}

module.exports.getMovieTitleFromText = (text) => {
  const tokens = text.split(`@${TWITTER_BOT_USERNAME} `);

  if (!tokens || tokens.length === 0) throw Error('Invalid mention');

  return tokens[tokens.length - 1];
}
