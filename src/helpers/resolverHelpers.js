import hash from 'string-hash'

export const getUniqueAuthors = (artworks) => {
  const authors = artworks.map(artwork => {
    return artwork.authors[0].map(author => {
      return JSON.stringify({
        id: author.author,
        name: author.name,
        birthyear_yearformed: author.birthyear_yearformed,
        deathyear: author.deathyear
      })
    })
  })

  const set = new Set([].concat(...authors))
  const real_authors = Array.from(set).map(author => JSON.parse(author))
  return real_authors
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

export const getUniqueAreas = (artworks) => {
  let uniqueAreas = {}

  artworks.map((artwork) => {
    if (artwork.areacategories && artwork.areacategories[0].areacat) {
      artwork.areacategories.map((areacategory) => {
        if (areacategory.type.toLowerCase() === 'area') {
          const id = hash(areacategory.areacat[0].text)
          if (!uniqueAreas[id]) {
            areacategory['id'] = id
            areacategory['artworks'] = []
            areacategory['name'] = areacategory.areacat
            uniqueAreas[id] = areacategory
          }

          if (uniqueAreas[id].artworks.indexOf(artwork.id) < 0) {
            uniqueAreas[id].artworks.push(artwork.id)
          }
        }
      })
    }
  })

  return Object.entries(uniqueAreas).map((area) => {
    return area[1]
  })
}

export const getUniqueCategories = (artworks) => {
  let uniqueCategories = {}

  artworks.map((artwork) => {
    if (artwork.areacategories && artwork.areacategories[0].areacat) {
      artwork.areacategories.map((areacategory) => {
        if (areacategory.type.toLowerCase() === 'category') {
          const id = hash(areacategory.areacat[0].text)
          if (!uniqueCategories[id]) {
            areacategory['id'] = id
            areacategory['artworks'] = []
            areacategory['name'] = areacategory.areacat
            uniqueCategories[id] = areacategory
          }

          if (uniqueCategories[id].artworks.indexOf(artwork.id) < 0) {
            uniqueCategories[id].artworks.push(artwork.id)
          }
        }
      })
    }
  })

  return Object.entries(uniqueCategories).map((area) => {
    return area[1]
  })
}
