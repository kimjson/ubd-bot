const { databaseService } = require('../database/database.service');

class QuoteService {
  constructor(client) {
    this.client = client;
    this.collection = databaseService.getCollection(client, 'quotes');
  }

  static async build() {
    return new QuoteService(await databaseService.connect());
  }

  async findOneRandomly() {
    try {
      const quotes = await this.collection
        .aggregate([ { $sample: { size: 1 } }, ])
        .toArray();

      if (quotes.length === 0) throw Error('No quotes available');

      return quotes[0];

    } catch (error) {
      throw error;
    }
  }

  quit() {
    this.client.close();
    this.collection = undefined;
  }
}

exports.QuoteService = QuoteService;
