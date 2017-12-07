const queryResolvers = {
  Query: {
    // artworks: async (root, data, { mongo: { Artworks } }) => {
    //   return await Artworks.find({}).toArray()
    // }
    artworks: async (root, data, { elasticsearch: { Artworks } }) => {
      return await Artworks
    },
    artwork: async (root, data, { elasticsearch: { Artworks } }) => {
      return await Artworks.find((artwork) => {
        if (data.id) return artwork.id === data.id
      })
    }
  }
}

export default queryResolvers
