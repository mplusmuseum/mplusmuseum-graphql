import hash from 'string-hash'

import { getUniqueMediums, getUniqueAreaCats } from '../helpers/resolverHelpers'

const queryResolvers = {
  Query: {
    maker: async (obj, args, { elasticsearch: { Makers } }) => {
      if (args.id) {
        return Makers.find(maker => parseInt(maker.id) === parseInt(args.id))
      }
    },
    artwork: async (obj, args, { elasticsearch: { Artworks } }) => {
      if (args.id) {
        return Artworks.find(
          artwork => parseInt(artwork.id) === parseInt(args.id)
        )
      }
    },
    medium: async (obj, args, { elasticsearch: { Artworks } }) => {
      if (args.id) {
        return getUniqueMediums(Artworks).find(
          medium => parseInt(medium.id) === parseInt(args.id)
        )
      }
    },
    area: async (obj, args, { elasticsearch: { Artworks } }) => {
      if (args.id) {
        return getUniqueAreaCats(Artworks, 'area').find(
          area => parseInt(area.id) === parseInt(args.id)
        )
      }
    },
    category: async (obj, args, { elasticsearch: { Artworks } }) => {
      if (args.id) {
        return getUniqueAreaCats(Artworks, 'category').find(
          category => parseInt(category.id) === parseInt(args.id)
        )
      }
    },
    makers: async (obj, args, { elasticsearch: { Makers } }) => {
      if (args.limit) {
        return Makers.slice(0, args.limit)
      }

      return Makers
    },
    artworks: async (obj, args, { elasticsearch: { Artworks } }) => {
      if (args.area) {
        return Artworks.filter(artwork =>
          artwork.areacategories.find(areacat => {
            if (areacat.type && areacat.type.toLowerCase() === 'area') {
              return hash(areacat.areacat[0].text) === args.area
            }
          })
        )
      }

      if (args.category) {
        return Artworks.filter(artwork =>
          artwork.areacategories.find(areacat => {
            if (areacat.type && areacat.type.toLowerCase() === 'category') {
              return hash(areacat.areacat[0].text) === args.area
            }
          })
        ).slice(0, args.limit)
      }

      if (args.maker) {
        return Artworks.filter(artwork =>
          artwork.makers.find(
            maker => parseInt(maker.author) === parseInt(args.maker)
          )
        ).slice(0, args.limit)
      }

      const query = new RegExp(`.*${args.filter}.*`, 'i')
      console.log(query)

      return Artworks.filter(({ objectid, makers, titles, mediums }) => {
        return (
          (objectid && query.test(objectid)) ||
          (makers && makers.some(maker => query.test(maker.name))) ||
          (titles && titles.some(title => query.test(title.text))) ||
          (mediums && mediums.some(medium => query.test(medium.text)))
        )
      }).slice(0, args.limit)
    },

    mediums: async (obj, args, { elasticsearch: { Artworks } }) => {
      if (args.maker) {
        return getUniqueMediums(
          Artworks.filter(
            artwork =>
              artwork.mediums &&
              artwork.mediums[0] &&
              artwork.makers.find(
                maker => parseInt(maker.author) === parseInt(args.maker)
              )
          )
        ).slice(0, args.limit)
      }

      if (args.limit) {
        return getUniqueMediums(Artworks).slice(0, args.limit)
      }

      return getUniqueMediums(Artworks)
    },
    areas: async (obj, args, { elasticsearch: { Artworks } }) => {
      if (args.artwork) {
        return Artworks.find(artwork => {
          return parseInt(args.artwork) === parseInt(artwork.id)
        }).areacategories.filter(ac => ac.type.toLowerCase() === 'area')
      }

      return getUniqueAreaCats(Artworks, 'area')
    },
    categories: async (obj, args, { elasticsearch: { Artworks } }) => {
      if (args.artwork) {
        return Artworks.find(artwork => {
          return parseInt(args.artwork) === parseInt(artwork.id)
        }).areacategories.filter(ac => ac.type.toLowerCase() === 'category')
      }

      if (args.limit) {
        return getUniqueAreaCats(Artworks, 'category').slice(0, args.limit)
      }

      return getUniqueAreaCats(Artworks, 'category')
    }
  }
}

export default queryResolvers
