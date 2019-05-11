const dotenv = require('dotenv');

const result = dotenv.config({ path: `../../.env.${process.env.NODE_ENV}` });
if (result.error) throw result.error;

class ConfigService {
  get = (key) => process.env[key];
  getNodeEnv = () => (this.get('NODE_ENV') || 'development');
}

exports.configService = new ConfigService();