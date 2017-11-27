const { MongoClient } = require('mongodb')

module.exports = async () => {
  const db = await MongoClient.connect(process.env.MONGO_URL)
  return { Artworks: db.collection('artworks') }
}
