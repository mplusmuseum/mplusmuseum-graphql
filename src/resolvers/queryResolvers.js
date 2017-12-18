const queryResolvers = {
  Query: {
    artworks: async (root, data, { elasticsearch: { Artworks } }) => {
      const unpackedArtworks = Artworks.map((inArtwork) => {
        let outArtwork = Object.assign({}, inArtwork)

        outArtwork.authors = inArtwork.authors[0] // Temporary fix to address author array nesting issue in import script.

        return outArtwork
      })
      return await unpackedArtworks
    },
    artwork: async (root, data, { elasticsearch: { Artworks } }) => {
      return await Artworks.find((artwork) => {
        if (data.id) return parseInt(artwork.id) === parseInt(data.id)
      })
    }
  }
}

export default queryResolvers
