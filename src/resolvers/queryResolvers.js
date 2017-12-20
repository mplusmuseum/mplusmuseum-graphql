import { getUniqueAuthors, getUniqueMediums } from '../helpers/resolverHelpers'

const queryResolvers = {
  Query: {
    author: async (root, data, { elasticsearch: { Artworks } }) => {
      return await getUniqueAuthors(Artworks).find((author) => {
        if (data.id) return parseInt(author.author) === parseInt(data.id)
      })
    },
    artwork: async (root, data, { elasticsearch: { Artworks } }) => {
      return await Artworks.find((artwork) => {
        if (data.id) return parseInt(artwork.id) === parseInt(data.id)
      })
    },
    medium: async(root, data, { elasticsearch: { Artworks } }) => {
      return await getUniqueMediums(Artworks).find((medium) => {
        if (data.id) return parseInt(medium.id) === parseInt(data.id)
      })
    },
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
    mediums: async (root, data, { elasticsearch: { Artworks } }) => {
      return await getUniqueMediums(Artworks)
    }
  }
}

export default queryResolvers
