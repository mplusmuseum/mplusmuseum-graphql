import hash from 'string-hash'
import {
  getUniqueAuthors,
  getUniqueMediums,
  getUniqueAreas,
  getUniqueCategories
} from '../helpers/resolverHelpers'

const typeResolvers = {
  Artwork: {
    objectNumber: root => root.objectnumber,
    dateBegin: root => root.datebegin,
    dateEnd: root => root.dateend,
    objectStatus: root => root.objectstatus,
    creditLines: root => root.creditlines,
    medium: (root) => {
      let medium = {}
      if (root.mediums[0])
        medium['id'] = hash(root.mediums[0].text)
        medium['name'] = root.mediums
      return medium
    },
    area: root => root.areacategories.filter(ac => ac.type.toLowerCase() === 'area'),
    category: root => root.areacategories.filter(ac => ac.type.toLowerCase() === 'category'),
    authors: root => root.authors[0]
  },
  Author: {
    id: root => root.author,
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
      let authors = {}
      root.artworks
        .map(id => Artworks.find(artwork => parseInt(id) === parseInt(artwork.id)))
        .map(artwork => {
          artwork.authors[0].map((author) => {
            authors[author.author] = author
          })
        })

      return await Object.entries(authors).map(author => author[1])
    }
  },
  Area: {
    artworks: async (root, data, { elasticsearch: { Artworks } }) => {
      return await root.artworks.map(id => Artworks.find(artwork => parseInt(id) === parseInt(artwork.id)))
    },
    name: root => root.areacat
  },
  Category: {
    artworks: async (root, data, { elasticsearch: { Artworks } }) => {
      return await root.artworks.map(id => Artworks.find(artwork => parseInt(id) === parseInt(artwork.id)))
    }
  }
}

export default typeResolvers
