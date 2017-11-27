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
}
