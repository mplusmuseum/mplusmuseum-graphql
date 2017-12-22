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
    authors: root => root.authors[0],
    objectStatus: root => root.objectstatus,
    medium: (root) => {
      let medium = {}
      if (root.mediums[0])
        medium['id'] = hash(root.mediums[0].text)
        medium['name'] = root.mediums
      return medium
    },
    // medium: async (root, data, { elasticsearch: { Artworks } }) => {
    //   return await getUniqueMediums(Artworks)
    //     .filter(medium => medium.artworks.indexOf(parseInt(root.id)) > -1)[0]
    // },
    area: root => root.areacategories.filter((ac) => ac.type === 'Area')
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
      return await getUniqueAuthors(Artworks)
        .filter(author => author.mediums.indexOf(parseInt(root.id)) > -1)
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
