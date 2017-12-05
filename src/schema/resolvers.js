module.exports = {
  Query: {
    artworks: async (root, data, { mongo: { Artworks } }) => {
      return await Artworks.find({}).toArray()
    },
  },
  Mutation: {
    createArtwork: async (root, data, { mongo: { Artworks } }) => {
      const response = await Artworks.insert(data)
      return Object.assign({ id: response.insertedIds[0] }, data)
    }
  },
  Artwork: {
    id: root => root._id || root.id
  }
}
