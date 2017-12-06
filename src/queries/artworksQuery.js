const artworksQuery = {
  index: 'mplusmuseum',
  body: {
    query: {
      match: {
        _type: "artworks"
      }
    }
  }
}

export default artworksQuery
