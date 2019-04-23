const Twitter = require('twitter');

const {
  UBD_BOT_ENV,
  TWITTER_CONSUMER_KEY,
  TWITTER_CONSUMER_SECRET,
  TWITTER_ACCESS_TOKEN_KEY,
  TWITTER_ACCESS_TOKEN_SECRET,
} = process.env;

const client = new Twitter({
  consumer_key: TWITTER_CONSUMER_KEY,
  consumer_secret: TWITTER_CONSUMER_SECRET,
  access_token_key: TWITTER_ACCESS_TOKEN_KEY,
  access_token_secret: TWITTER_ACCESS_TOKEN_SECRET,
});

const updateStatus = text => new Promise((resolve, reject) => {
  const status = (UBD_BOT_ENV === 'production')
    ? text
    : `${text} - ${UBD_BOT_ENV} 환경에서 테스트 중`;

  client
    .post('statuses/update', { status })
    .then(tweet => resolve(tweet))
    .catch(error => reject(error));
});

module.exports = {
  updateStatus,
};
