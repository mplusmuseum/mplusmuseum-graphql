import {
  getUniqueAuthors,
  getUniqueMediums,
  getUniqueAreas,
  getUniqueCategories
} from '../helpers/resolverHelpers'

const queryResolvers = {
  Query: {
    author: async (root, data, { elasticsearch: { Artworks } }) => {
      if (data.id) {
        return await getUniqueAuthors(Artworks).find((author) => {
          return parseInt(author.id) === parseInt(data.id)
        })
      }
    },
    artwork: async (root, data, { elasticsearch: { Artworks } }) => {
      if (data.id)
        return await Artworks.find(artwork =>parseInt(artwork.id) === parseInt(data.id))
    },
    medium: async(root, data, { elasticsearch: { Artworks } }) => {
      if (data.id)
        return await getUniqueMediums(Artworks).find(medium => parseInt(medium.id) === parseInt(data.id)
        )
    },
    area: async(root, data, { elasticsearch: { Artworks } }) => {
      return await getUniqueAreas(Artworks).find((area) => {
        if (data.id) return parseInt(area.id) === parseInt(data.id)
      })
    },
    authors: async (root, data, { elasticsearch: { Artworks } }) => {
      return await getUniqueAuthors(Artworks)
    },
    artworks: async (root, data, { elasticsearch: { Artworks } }) => {
      if (data.area) {
        return await Artworks.filter((artwork) => {
          return artwork.areacategories.find((ac) => {
            return ac.areacat.find((areacat) => {
              return areacat.text === data.area
            })
          })
        })
      }

      return await Artworks
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
