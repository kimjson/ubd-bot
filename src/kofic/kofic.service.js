'use strict';

const request = require('request-promise');

const { yesterdayMoment } = require('../shared/utils/moment');

const { configService } = require('../config/config.service');
const { textService } = require('../text/text.service');

const KOFIC_API_BASE_URL = configService.get('KOFIC_API_BASE_URL');
const KOFIC_API_KEY = configService.get('KOFIC_API_KEY');

class KoficService {
  constructor() {
    this.request = request.defaults({
      baseUrl: `${KOFIC_API_BASE_URL}/boxoffice`,
      qs: { key: KOFIC_API_KEY },
      json: true,
    });
  }

  static build() {
    return new KoficService();
  }

  async findDailyBoxOfficeResultByDate(moment_ = yesterdayMoment()) {
    const { boxOfficeResult } = await this.request({
      url: '/searchDailyBoxOfficeList.json',
      qs: { targetDt: textService.formatMomentForKofic(moment_) },
    });

    return boxOfficeResult;
  };

  async findDailyBoxOfficeListByDate(moment_ = yesterdayMoment()) {
    const { dailyBoxOfficeList } = await this.findDailyBoxOfficeResultByDate(moment_);

    return dailyBoxOfficeList;
  };

  async findDailyBoxOfficeByTitle(title, moment_ = yesterdayMoment()) {
    const titleQuery = textService.removeWhiteSpaces(title);
    const boxOfficeList = await this.findDailyBoxOfficeListByDate();

    return boxOfficeList.find(boxOffice => textService.removeWhiteSpaces(boxOffice.movieNm) === titleQuery);
  }

  async getWeeklyBoxOffice(moment_) {
    return this.request.get({
      url: `/searchWeeklyBoxOfficeList.json`,
      qs: { targetDt: textService.formatMomentForKofic(moment_) },
    });
  }
}

exports.KoficService = KoficService;
exports.koficService = KoficService.build();
