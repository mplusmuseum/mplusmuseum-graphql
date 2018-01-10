import hash from 'string-hash'
import {
  getUniqueMakers,
  getUniqueMediums,
  getUniqueAreaCats
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
    makers: root => root.makers.map(root => {
        root.id = root.author
        return root
      })
  },
  Medium: {
    artworks: async (root, data, { elasticsearch: { Artworks } }) => {
      return await Artworks.filter((artwork) => {
        return artwork.mediums && artwork.mediums[0] && hash(artwork.mediums[0].text) === root.id
      })
    }
  },
  Area: {
    // artworks: async (root, data, { elasticsearch: { Artworks } }) => {
    //   return await root.artworks.map(id => Artworks.find(artwork => parseInt(id) === parseInt(artwork.id)))
    // },
    name: root => root.areacat
  },
  Category: {
    artworks: async (root, data, { elasticsearch: { Artworks } }) => {
      return await root.artworks.map(id => Artworks.find(artwork => parseInt(id) === parseInt(artwork.id)))
    }
  }
}

export default typeResolvers
