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

const updateStatus = ({ text, statusId }) => new Promise((resolve, reject) => {
  const status = (UBD_BOT_ENV === 'production')
    ? text
    : `${text} - ${UBD_BOT_ENV} 환경에서 테스트 중. 중복 방지 값: ${Math.floor(Date.now() / 1000)}`;

  const params = statusId
    ? { status, in_reply_to_status_id: statusId }
    : { status };

  client
    .post('statuses/update', params)
    .then(tweet => resolve(tweet))
    .catch(error => reject(error));
});

const getStatusIdFromLink = (link) => {
  const tokens = link.split('/');

  if (!tokens || tokens.length === 0) throw Error('Invalid twitter status link');

  return Number(link.split('/')[-1]);
}

module.exports = {
  updateStatus,
  getStatusIdFromLink,
};
