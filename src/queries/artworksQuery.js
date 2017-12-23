const esQueries = {
  artworks: {
    index: 'objects',
    body: {
      query: {
        match_all: {}
      },
      from: 0,
      size: 1000
    }
  }
}

export default esQueries
