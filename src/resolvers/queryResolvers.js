const queryResolvers = {
  Query: {
    artworks: async (obj, args, { elasticsearch: { Artworks } }) => {
      if (args.maker) {
        return Artworks.filter(artwork =>
          artwork.makers.find(
            maker => parseInt(maker.maker) === parseInt(args.maker)
          )
        ).slice(0, args.limit)
      }

      const query = new RegExp(`.*${args.filter}.*`, 'i')

      return Artworks.filter(({ objectid, makers, titles, mediums }) => {
        return (
          (objectid && query.test(objectid)) ||
          (makers && makers.some(maker => query.test(maker.name))) ||
          (titles && titles.some(title => query.test(title.text))) ||
          (mediums && mediums.some(medium => query.test(medium.text)))
        )
      }).slice(0, args.limit)
    },
    artwork: async (obj, args, { elasticsearch: { Artworks } }) => {
      if (args.id) {
        return Artworks.find(
          artwork => parseInt(artwork.id) === parseInt(args.id)
        )
      }
    },
    makers: async (obj, args, { elasticsearch: { Makers } }) => {
      if (args.limit) {
        return Makers.slice(0, args.limit)
      }

      return Makers
    },
    maker: async (obj, args, { elasticsearch: { Makers } }) => {
      if (args.id) {
        return Makers.find(maker => parseInt(maker.id) === parseInt(args.id))
      }
    }
  }
}

export default queryResolvers
