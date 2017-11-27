const artworks = [
  {
    id: 1,
    title: 'Starry Night'
  },
  {
    id: 2,
    title: 'Elephants on Parade'
  },
]

module.exports = {
  Query: {
    allArtworks: async (root, data, { mongo: {Artworks } }) => {
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
