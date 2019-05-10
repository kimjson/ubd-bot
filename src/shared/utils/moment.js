const momentTimezone = require('moment-timezone');
const momentRange = require('moment-range');

momentTimezone.tz.setDefault("Asia/Seoul");
const moment = momentRange.extendMoment(momentTimezone)

exports.moment = moment;
