const mapArtworks = (artworksES) => {
  return artworksES.map((artwork) => {
    return artwork._source
  })
}

const resolvers = {
  Query: {
    // artworks: async (root, data, { mongo: { Artworks } }) => {
    //   return await Artworks.find({}).toArray()
    // },
    artworks: async (root, data, { elasticsearch: { Artworks } }) => {
      return await mapArtworks(Artworks)
    }
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

export default resolvers
