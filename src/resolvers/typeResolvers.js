import { getUniqueAuthors, getUniqueMediums } from '../helpers/resolverHelpers'

const typeResolvers = {
  Artwork: {
    objectNumber: root => root.objectnumber,
    authors: async (root, data, { elasticsearch: { Artworks } }) => {
     return await getUniqueAuthors(Artworks)
      .filter(author => author.artworks.indexOf(parseInt(root.id)) > -1)
    },
    medium: async (root, data, { elasticsearch: { Artworks } }) => {
      return await getUniqueMediums(Artworks)
        .filter(medium => medium.artworks.indexOf(parseInt(root.id)) > -1)[0]
    }
  },
  Author: {
    artworks: async (root, data, { elasticsearch: { Artworks } }) => {
      return await root.artworks.map(id => Artworks
        .find(artwork => parseInt(id) === parseInt(artwork.id)))
    },
    mediums: async (root, data, { elasticsearch: { Artworks } }) => {
      return await getUniqueMediums(Artworks)
        .filter(medium => root.mediums.indexOf(parseInt(medium.id)) > -1)
    }
  },
  Medium: {
    artworks: async (root, data, { elasticsearch: { Artworks } }) => {
      return await root.artworks.map(id => Artworks
        .find(artwork => parseInt(id) === parseInt(artwork.id)))
    },
    authors: async (root, data, { elasticsearch: { Artworks } }) => {
      return await getUniqueAuthors(Artworks)
        .filter(author => author.mediums.indexOf(parseInt(root.id)) > -1)
    }
  }
}

export default typeResolvers
