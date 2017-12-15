const esQueries = {
  artworks: {
    index: 'objects',
    body: {
      query: {
        match_all: {}
      },
      from: 0,
      size: 10000
    }
  }
}

export default esQueries
