import hash from 'string-hash'

import {
  getUniqueMakers,
  getUniqueMediums,
  getUniqueAreaCats
} from '../helpers/resolverHelpers'

const queryResolvers = {
  Query: {
    maker: async (obj, args, { elasticsearch: { Artworks } }) => {
      if (args.id)
        return await getUniqueMakers(Artworks).find(maker => parseInt(maker.id) === parseInt(args.id))
    },
    artwork: async (obj, args, { elasticsearch: { Artworks } }) => {
      if (args.id)
        return await Artworks.find(artwork => parseInt(artwork.id) === parseInt(args.id))
    },
    medium: async (obj, args, { elasticsearch: { Artworks } }) => {
      if (args.id)
        return await getUniqueMediums(Artworks)
          .find(medium => parseInt(medium.id) === parseInt(args.id))
    },
    area: async (obj, args, { elasticsearch: { Artworks } }) => {
      if (args.id)
        return await getUniqueAreaCats(Artworks, 'area')
          .find(area => parseInt(area.id) === parseInt(args.id))
    },
    makers: async (obj, args, { elasticsearch: { Artworks } }) => {
      if (args.medium) {
        return await getUniqueMakers(
          Artworks.filter(artwork =>
            artwork.mediums && artwork.mediums[0] && artwork.mediums[0].text &&
            parseInt(hash(artwork.mediums[0].text)) === parseInt(args.medium)
          )
        )
      }

      if (args.limit)
        return await getUniqueMakers(Artworks).slice(0, args.limit)

      return await getUniqueMakers(Artworks)
    },
    artworks: async (obj, args, { elasticsearch: { Artworks } }) => {
      if (args.area) {
        return await Artworks.filter(artwork =>
          artwork.areacategories.find(areacat =>
            areacat.areacat.find(ac => ac.text === args.area)
          )
        ).slice(0, args.limit)
      }

      if (args.category) {
        return await Artworks.filter(artwork =>
          artwork.areacategories.find(areacat =>
            areacat.areacat.find(ac => ac.text === args.category)
          )
        ).slice(0, args.limit)
      }

      if (args.maker) {
        return await Artworks.filter(artwork =>
          artwork.makers.find(maker =>
            parseInt(maker.author) === parseInt(args.maker)
          )
        ).slice(0, args.limit)
      }

      if (args.limit)
        return await Artworks.slice(0, args.limit)

      return await Artworks
    },
    mediums: async (obj, args, { elasticsearch: { Artworks } }) => {
      if (args.maker) {
        return await getUniqueMediums(
          Artworks.filter(artwork =>
            artwork.mediums && artwork.mediums[0] &&
            artwork.makers.find(maker => parseInt(maker.author) === parseInt(args.maker))
          ))
        .slice(0, args.limit)
      }

      if (args.limit)
        return await getUniqueMediums(Artworks).slice(0, args.limit)

      return await getUniqueMediums(Artworks)
    },
    areas: async (obj, args, { elasticsearch: { Artworks } }) => {
      if (args.artwork) {
         return await Artworks.find((artwork) => {
          return parseInt(args.artwork) === parseInt(artwork.id)
        }).areacategories.filter((ac) => ac.type.toLowerCase() === 'area')
      } else {
        return await getUniqueAreaCats(Artworks, 'area')
      }
    },
    categories: async (obj, args, { elasticsearch: { Artworks } }) => {
      return await getUniqueAreaCats(Artworks, 'category')
    }
  }
}

export default queryResolvers
