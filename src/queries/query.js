const esQueries = {
  artworks: size => ({
    index: 'objects',
    body: {
      query: {
        match_all: {}
      },
      size: size.count
    }
  }),
  makers: size => ({
    index: 'authors',
    body: {
      query: {
        match_all: {}
      },
      size: size.count
    }
  })
}

export default esQueries
