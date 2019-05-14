const numeral = require('numeral');

const { moment } = require('../shared/utils/moment');
const { configService } = require('../config/config.service');

const TWITTER_BOT_USERNAME = configService.get('TWITTER_BOT_USERNAME');

const DATE_FORMAT_FOR_TWEET = 'YYYY년 MM월 DD일 A h시 mm분 ss초';
const DATE_FORMAT_FOR_KOFIC = 'YYYYMMDD';

class TextService {
  static build() {
    return new TextService();
  }

  formatMomentForKofic(moment_) {
    return moment_.format(DATE_FORMAT_FOR_KOFIC);
  }

  formatMomentForTweet(moment_ = moment()) {
    return moment_.format(DATE_FORMAT_FOR_TWEET);
  }

  formatAudiences(audiences) {
    return numeral(audiences).format('0,0');
  }

  formatUBD(ubd) {
    return numeral(ubd).format('0,0.00');
  }

  buildReply(fromUsername, formattedDate, title, formattedUBD, formattedAudiences) {
    return `@${fromUsername} ${formattedDate} 기준 [${title}]의 동원 관객 수는 ${formattedUBD}UBD(=${formattedAudiences}명)입니다.`;
  }

  extractMovieTitle(mention) {
    const tokens = mention.split(`@${TWITTER_BOT_USERNAME} `);

    if (tokens && tokens.length > 0) return tokens[tokens.length - 1];
    throw Error('Invalid mention');
  }

  getFormattedDate() {
    return moment().format(DATE_FORMAT);
  }

  removeWhiteSpaces(str) {
    return str.replace(/\s/g, '');
  }

  parseKoficRange(range) {
    const tokens = range.split('~');
    const from = moment(tokens[0]).toDate();
    const to = moment(tokens[1]).toDate();

    return { from, to };
  }
}

exports.TextService = TextService;
exports.textService = TextService.build();