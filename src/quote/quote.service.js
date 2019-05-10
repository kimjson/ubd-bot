const { connectToDatabase } = require('../database/database.service');

class QuoteService {
  getCollection = async () => (await connectToDatabase()).collection('quotes');

  getRandomQuote = async () => {
    try {
      const collection = await this.getCollection();

      const quotes = collection
        .aggregate([ { $sample: { size: 1 } }, ])
        .toArray();

      if (quotes.length === 0) throw Error('No quotes available');

      return quotes[0];

    } catch (error) {
      throw error;
    }
  };
}

exports.quoteService = new QuoteService();
