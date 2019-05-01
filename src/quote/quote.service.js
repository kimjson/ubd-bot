module.exports.getRandomQuote = async db => {
  try {
    const quotes = await db
      .collection('quotes')
      .aggregate([
        { $sample: { size: 1 } },
      ])
      .toArray();

    if (quotes.length === 0) throw Error('No quotes available');

    return quotes[0];

  } catch (error) {
    throw error;
  }
};
