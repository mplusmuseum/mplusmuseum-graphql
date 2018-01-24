import hash from 'string-hash'
import searchhash from 'searchhash'

import {
  getUniqueMakers,
  getUniqueMediums,
  getUniqueAreaCats,
  compileMakerRoles
} from '../helpers/resolverHelpers'

const queryResolvers = {
  Query: {
    maker: async (obj, args, { elasticsearch: { Artworks } }) => {
      if (args.id) { return getUniqueMakers(Artworks).find(maker => parseInt(maker.id) === parseInt(args.id)) }
    },
    artwork: async (obj, args, { elasticsearch: { Artworks } }) => {
      if (args.id) { return Artworks.find(artwork => parseInt(artwork.id) === parseInt(args.id)) }
    },
    medium: async (obj, args, { elasticsearch: { Artworks } }) => {
      if (args.id) {
        return getUniqueMediums(Artworks)
          .find(medium => parseInt(medium.id) === parseInt(args.id))
      }
    },
    area: async (obj, args, { elasticsearch: { Artworks } }) => {
      if (args.id) {
        return getUniqueAreaCats(Artworks, 'area')
          .find(area => parseInt(area.id) === parseInt(args.id))
      }
    },
    category: async (obj, args, { elasticsearch: { Artworks } }) => {
      if (args.id) {
        return getUniqueAreaCats(Artworks, 'category')
          .find(category => parseInt(category.id) === parseInt(args.id))
      }
    },
    makers: async (obj, args, { elasticsearch: { Artworks } }) => {
      if (args.artwork) {
        return compileMakerRoles(getUniqueMakers(
          Artworks.filter(artwork =>
            parseInt(artwork.id) === parseInt(args.artwork))))
      }

      if (args.medium) {
        return getUniqueMakers(
          Artworks.filter(artwork =>
            artwork.mediums && artwork.mediums[0] && artwork.mediums[0].text &&
            parseInt(hash(artwork.mediums[0].text)) === parseInt(args.medium)
          )
        )
      }

      if (args.limit) { return getUniqueMakers(Artworks).slice(0, args.limit) }

      return getUniqueMakers(Artworks)
    },
    artworks: async (obj, args, { elasticsearch: { Artworks } }) => {
      if (args.area) {
        return Artworks.filter(artwork =>
          artwork.areacategories.find(areacat => {
            if (areacat.type && areacat.type.toLowerCase() === 'area') {
              return hash(areacat.areacat[0].text) === args.area
            }
          }
        ))
      }

      if (args.category) {
        return Artworks.filter(artwork =>
          artwork.areacategories.find(areacat => {
            if (areacat.type && areacat.type.toLowerCase() === 'category') {
              return hash(areacat.areacat[0].text) === args.area
            }
          }
        )).slice(0, args.limit)
      }

      if (args.maker) {
        return Artworks.filter(artwork =>
          artwork.makers.find(maker =>
            parseInt(maker.author) === parseInt(args.maker)
          )
        ).slice(0, args.limit)
      }

      const query = new RegExp(`.*${args.filter}.*`)
      console.log(query)

      return Artworks
        .filter(({makers, titles, mediums}) => {
          const found = searchhash.forValue({makers, titles, mediums}, query)
          return found.length > 0
        })
        .slice(0, args.limit)
    },

    mediums: async (obj, args, { elasticsearch: { Artworks } }) => {
      if (args.maker) {
        return getUniqueMediums(
          Artworks.filter(artwork =>
            artwork.mediums && artwork.mediums[0] &&
            artwork.makers.find(maker => parseInt(maker.author) === parseInt(args.maker))
          ))
        .slice(0, args.limit)
      }

      if (args.limit) { return getUniqueMediums(Artworks).slice(0, args.limit) }

      return getUniqueMediums(Artworks)
    },
    areas: async (obj, args, { elasticsearch: { Artworks } }) => {
      if (args.artwork) {
        return Artworks.find((artwork) => {
          return parseInt(args.artwork) === parseInt(artwork.id)
        }).areacategories.filter((ac) => ac.type.toLowerCase() === 'area')
      }

      return getUniqueAreaCats(Artworks, 'area')
    },
    categories: async (obj, args, { elasticsearch: { Artworks } }) => {
      if (args.artwork) {
        return Artworks.find((artwork) => {
          return parseInt(args.artwork) === parseInt(artwork.id)
        }).areacategories.filter((ac) => ac.type.toLowerCase() === 'category')
      }

      if (args.limit) { return getUniqueAreaCats(Artworks, 'category').slice(0, args.limit) }

      return getUniqueAreaCats(Artworks, 'category')
    }
  }
}

export default queryResolvers
