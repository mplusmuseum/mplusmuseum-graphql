import hash from 'string-hash'

export const getUniqueAuthors = (artworks) => {
  let uniqueAuthors = {}
  artworks.map((artwork) => {
    artwork.authors[0].map((author) => {
      const id = author.author
      if (!uniqueAuthors[id]) {
        uniqueAuthors[id] = author
        uniqueAuthors[id].artworks = []
        uniqueAuthors[id].mediums = []
      }

      if (uniqueAuthors[id].artworks.indexOf(artwork.id) < 0)
        uniqueAuthors[id].artworks.push(artwork.id)

      if (artwork.mediums && artwork.mediums[0].text) {
        const mediumId = hash(artwork.mediums[0].text)
        if (uniqueAuthors[id].mediums.indexOf(mediumId) < 0)
          uniqueAuthors[id].mediums.push(mediumId)
      }
    })
  })

  return Object.entries(uniqueAuthors).map((author) => {
    return author[1]
  })
}

export const getUniqueMediums = (artworks) => {
  let uniqueMediums = {}

  artworks.map((artwork) => {
    if (artwork.mediums && artwork.mediums[0].text) {
      const id = hash(artwork.mediums[0].text.toLowerCase())

      if (!uniqueMediums[id]) {
        const medium = {
          id: id,
          name: artwork.mediums,
          artworks: [],
          authors: []
        }
        uniqueMediums[id] = medium
      }

      if (uniqueMediums[id].artworks.indexOf(artwork.id) < 0)
        uniqueMediums[id].artworks.push(artwork.id)

      artwork.authors.map((author) => {
        uniqueMediums[id].authors.push(author.author)
      })
    }
  })

  return Object.entries(uniqueMediums).map((medium) => {
    return medium[1]
  })
}
