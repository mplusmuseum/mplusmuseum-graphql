import { MongoClient } from 'mongodb'

const client = async () => {
  const db = await MongoClient.connect(process.env.MONGO_URL)
  return {
    Artworks: db.collection('artworks')
  }
}

export default client
