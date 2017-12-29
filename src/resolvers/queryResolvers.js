import {
  getUniqueAuthors,
  getUniqueMediums,
  getUniqueAreas,
  getUniqueCategories
} from '../helpers/resolverHelpers'

const queryResolvers = {
  Query: {
    author: async (obj, args, { elasticsearch: { Artworks } }) => {
      if (args.id) {
        return await getUniqueAuthors(Artworks).find((author) => {
          return parseInt(author.author) === parseInt(args.id)
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
    medium: async(obj, args, { elasticsearch: { Artworks } }) => {
      return await getUniqueMediums(Artworks).find((medium) => {
        if (args.id) return parseInt(medium.id) === parseInt(args.id)
      })
    },
    area: async(obj, args, { elasticsearch: { Artworks } }) => {
      return await getUniqueAreas(Artworks).find((area) => {
        if (args.id) return parseInt(area.id) === parseInt(args.id)
      })
    },
    authors: async (obj, args, { elasticsearch: { Artworks } }) => {
      return await getUniqueAuthors(Artworks)
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

      return await Artworks.slice(0, args.limit)
    },
    mediums: async (root, data, { elasticsearch: { Artworks } }) => {
      return await getUniqueMediums(Artworks)
    },
    areas: async (root, data, { elasticsearch: { Artworks } }) => {
      if (data.artwork) {
         return await Artworks.find((artwork) => {
          return parseInt(data.artwork) === parseInt(artwork.id)
        }).areacategories.filter((ac) => ac.type.toLowerCase() === 'area')
      } else {
        return await getUniqueAreas(Artworks)
      }
    },
    categories: async (root, data, { elasticsearch: { Artworks } }) => {
      return await getUniqueCategories(Artworks)
    }
  }
}

export default queryResolvers
