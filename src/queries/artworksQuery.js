const esQueries = {
  artworks: {
    // index: 'mplusmuseum',
    index: 'objects',
    body: {
      query: {
        match: {
          _type: "artwork"
        }
      }
    }
  }
}

export default esQueries
