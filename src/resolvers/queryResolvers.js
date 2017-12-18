const queryResolvers = {
  Query: {
    authors: async (root, data, { elasticsearch: { Artworks } }) => {
      let uniqueAuthors = {}
      Artworks.map((artwork) => {
        artwork.authors[0].map((author) => {
          if (!uniqueAuthors[author.author]) {
            uniqueAuthors[author.author] = author
          }
        })
      })

      const Authors = Object.entries(uniqueAuthors).map((author) => {
        return author[1]
      })

      return await Authors
    },
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
