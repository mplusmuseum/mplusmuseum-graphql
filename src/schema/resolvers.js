const artworks = [
  {
    id: 1,
    title: 'Starry Night'
  },
  {
    id: 2,
    title: 'Elephants on Parade'
  },
]

module.exports = {
  Query: {
    allArtworks: () => artworks,
  },
  Mutation: {
    createArtwork: (_, data) => {
      const newArtwork = Object.assign({ id: artworks.length + 1 }, data)

      artworks.push(newArtwork)

      return newArtwork
    }
  }
}
