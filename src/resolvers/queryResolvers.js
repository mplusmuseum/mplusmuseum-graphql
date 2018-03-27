const queryResolvers = {
  Query: {
    artworks: async (obj, args, { elasticsearch: { Artworks } }) => {
      /*
       * This is a *VERY* verbose way to filter all the artworks
       * by a maker. We can easily shorten this code down but
       * for the moment I'm keeping it overly dramatic so we can
       * easily see what's going on and drop breakpoints in when we
       * want to study what's going on in the debugger. You're welcome!
       */

      if (args.maker) {
        // Run .filter on the Artworks to get just the matching ones
        const matchingArtworks = Artworks.filter(artwork => {
          // If there's no makers or the makers are null, return false
          if (!('makers' in artwork)) return false
          if (artwork.makers === null) return false
          // Ok, so we got some makers now what? We _could_ do this
          // a number of ways, .find, .forEach but I'm going to filter
          // down again to get just the makers that match
          const foundMaker = artwork.makers.filter(maker => {
            // convert everything to Ints (this is probably bad)
            // and in reality we should cast to Strings as we don't
            // know for a fact that the maker ID is going to be an
            // Int, we are just making that assumption.
            // Again, easy to make this shorter, keeping it longhand
            // for the moment.
            const searchMakerId = parseInt(args.maker, 10)
            const thisMakerId = parseInt(maker.maker, 10)
            if (searchMakerId === thisMakerId) return true
            return false
          })
          // Now we can do our check, if we have anything left
          // in the array then we had a match. Otherwise no dice!
          return foundMaker.length > 0
        })
        return matchingArtworks.slice(0, args.limit)
      }

      /* The stuff below is all to do with "free text" search, we'll
       * put this back in when we get to that bridge
       *
      const query = new RegExp(`.*${args.filter}.*`, 'i')

      return Artworks.filter(({ objectid, makers, titles, mediums }) => {
        return (
          (objectid && query.test(objectid)) ||
          (makers && makers.some(maker => query.test(maker.name))) ||
          (titles && titles.some(title => query.test(title.text))) ||
          (mediums && mediums.some(medium => query.test(medium.text)))
        )
      }).slice(0, args.limit)
      */

      return Artworks.slice(0, args.limit)
    },

    /*
     * This is attempting to get a single artwork, note the _only_ thing
     * we are looking for is an id which is coming across in the `args`
     * what is `obj`, no idea.
     */
    artwork: async (obj, args, { elasticsearch: { Artworks } }) => {
      //  If we are searching based on an id we do that here
      if (args.id) {
        const artwork = Artworks.find(
          artwork => parseInt(artwork.id) === parseInt(args.id)
        )
        return artwork
      }
      //  Example search that matches what we have in typeDefs.js
      if (args.examplesSearchOptionOne) {
        const artwork = Artworks.find(
          artwork =>
            parseInt(artwork.id) === parseInt(args.examplesSearchOptionOne)
        )
        return artwork
      }
    },

    /*
     * This grabs all the makers from the Makers records
     */
    makers: async (obj, args, { elasticsearch: { Makers } }) => {
      if (args.limit) {
        return Makers.slice(0, args.limit)
      }

      return Makers
    },

    /*
     * Getting a single maker
     */
    maker: async (obj, args, { elasticsearch: { Makers } }) => {
      if (args.id) {
        return Makers.find(maker => parseInt(maker.id) === parseInt(args.id))
      }
    },

    /*
     * We don't have a "table" of mediums, so we're going to build on from
     * all of the artworks. We'll do this by looping through them grabbing
     * the medium and language from each one and sticking it into a new
     * array that we then return
     */
    mediums: async (obj, args, { elasticsearch: { Artworks } }) => {
      //  These are the mediums we are going to keep
      let mediums = []
      //  This is a set of "keys" so we can keep an index of what
      //  we've found so far and quickly look them up
      const mediumKeys = {}

      //  Loop through the artworks
      Artworks.forEach(artwork => {
        //  See if the artwork has a medium node within it
        if (
          'mediums' in artwork &&
          artwork.mediums !== null &&
          artwork.mediums !== undefined
        ) {
          //  Sometimes we get an array of Mediums, other times we
          //  get a single object. We should always turn these
          //  into arrays
          let theseMediums = artwork.mediums
          if (!Array.isArray(theseMediums)) {
            theseMediums = [theseMediums]
          }
          theseMediums.forEach(thisMedium => {
            //  If we don't already have this medium in our lookup
            //  then we can add it
            if (!(thisMedium.text in mediumKeys)) {
              mediumKeys[thisMedium.text] = true
              mediums.push({ text: thisMedium.text, lang: thisMedium.lang })
            }
          })
        }
      })

      //  If we've been passed a language filter then we do that here
      if ('lang' in args) {
        mediums = mediums.filter(medium => {
          return args.lang === medium.lang
        })
      }

      //  Finally return the number of records we've been asked for
      return mediums.slice(0, args.limit)
    }
  }
}

export default queryResolvers
