const getUniqueAuthors = (artworks) => {
  let uniqueAuthors = {}
  artworks.map((artwork) => {
    artwork.authors[0].map((author) => {
      if (!uniqueAuthors[author.author]) {
        uniqueAuthors[author.author] = author
      }
    })
  })

  const authors = Object.entries(uniqueAuthors).map((author) => {
    return author[1]
  })

  return authors
}

const queryResolvers = {
  Query: {
    authors: async (root, data, { elasticsearch: { Artworks } }) => {
      return await getUniqueAuthors(Artworks)
    },
    artworks: async (root, data, { elasticsearch: { Artworks } }) => {
      const unpackedArtworks = Artworks.map((inArtwork) => {
        let outArtwork = Object.assign({}, inArtwork)

        outArtwork.authors = inArtwork.authors[0] // Temporary fix to address author array nesting issue in import script.

        return outArtwork
      })
      return await unpackedArtworks
    },
    author: async (root, data, { elasticsearch: { Artworks } }) => {
      const Authors = getUniqueAuthors(Artworks)


      return await Authors.find((author) => {
        if (data.id) return parseInt(author.author) === parseInt(data.id)
      })
    },
    artwork: async (root, data, { elasticsearch: { Artworks } }) => {
      return await Artworks.find((artwork) => {
        if (data.id) return parseInt(artwork.id) === parseInt(data.id)
      })
    }
  }
}

export default queryResolvers
