import {
  getUniqueMakers,
  getUniqueMediums,
  getUniqueAreas,
  getUniqueCategories
} from '../helpers/resolverHelpers'

const queryResolvers = {
  Query: {
    maker: async (obj, args, { elasticsearch: { Artworks } }) => {
      if (args.id) {
        return await getUniqueMakers(Artworks).find((maker) => {
          return parseInt(maker.id) === parseInt(args.id)
        })
      }
    },
    artwork: async (obj, args, { elasticsearch: { Artworks } }) => {
      if (args.id) {
        return await Artworks.find((artwork) => {
          return parseInt(artwork.id) === parseInt(args.id)
        })
      }
    },
    medium: async (obj, args, { elasticsearch: { Artworks } }) => {
      if (args.id) {
        return await getUniqueMediums(Artworks).find((medium) => {
          return parseInt(medium.id) === parseInt(args.id)
        })
      }
    },
    area: async (obj, args, { elasticsearch: { Artworks } }) => {
      return await getUniqueAreas(Artworks).find((area) => {
        if (args.id) return parseInt(area.id) === parseInt(args.id)
      })
    },
    makers: async (obj, args, { elasticsearch: { Artworks } }) => {
      return await getUniqueMakers(Artworks)
    },
    artworks: async (obj, args, { elasticsearch: { Artworks } }) => {
      if (args.area) {
        return await Artworks.filter((artwork) => {
          return artwork.areacategories.find((ac) => {
            return ac.areacat.find((areacat) => {
              return areacat.text === args.area
            })
          })
        }).slice(0, args.limit)
      }

      if (args.limit)
        return await Artworks.slice(0, args.limit)

      return await Artworks
    },
    mediums: async (obj, args, { elasticsearch: { Artworks } }) => {
      return await getUniqueMediums(Artworks)
    },
    areas: async (obj, args, { elasticsearch: { Artworks } }) => {
      if (args.artwork) {
         return await Artworks.find((artwork) => {
          return parseInt(args.artwork) === parseInt(artwork.id)
        }).areacategories.filter((ac) => ac.type.toLowerCase() === 'area')
      } else {
        return await getUniqueAreas(Artworks)
      }
    },
    categories: async (obj, args, { elasticsearch: { Artworks } }) => {
      return await getUniqueCategories(Artworks)
    }
  }
}

export default queryResolvers
