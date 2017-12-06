const esQueries = {
  artworks: {
    index: 'mplusmuseum',
    body: {
      query: {
        match: {
          _type: "artworks"
        }
      }
    }
  }
}

export default esQueries
