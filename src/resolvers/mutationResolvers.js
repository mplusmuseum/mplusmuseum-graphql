const mutationResolvers = {
  Mutation: {
    createArtwork: async (root, data, { mongo: { Artworks } }) => {
      const response = await Artworks.insert(data)
      return Object.assign({ id: response.insertedIds[0] }, data)
    }
  },
}

export default mutationResolvers
