const dotenv = require('dotenv');
const path = require('path');

const NODE_ENV = process.env.NODE_ENV || 'development';

const result = dotenv.config({ path: path.resolve(__dirname, `../../.env.${NODE_ENV}`) });
if (result.error) throw result.error;

class ConfigService {
  static build() {
    return new ConfigService();
  }

  get(key) {
    return process.env[key];
  }

  getNodeEnv() {
    return NODE_ENV;
  }
}

exports.ConfigService = ConfigService;
exports.configService = ConfigService.build();