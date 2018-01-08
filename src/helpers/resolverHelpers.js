import hash from 'string-hash'

export const getUniqueMakers = (artworks) => {
  const makers = artworks.map((artwork) => {
    return artwork.makers.map((maker) => {
      return JSON.stringify({
        id: parseInt(maker.author),
        name: maker.name,
        birthyear_yearformed: maker.birthyear_yearformed,
        deathyear: maker.deathyear
      })
    })
  })

  const uniqueMakers = new Set([].concat(...makers))
  return Array.from(uniqueMakers).map(maker => JSON.parse(maker))
}

export const getUniqueMediums = (artworks) => {
  const mediums = []
  artworks.forEach((artwork) => {
    const medium = artwork.mediums
    if (medium && medium[0].text) {
      const id = hash(medium[0].text)
      mediums.push(
        JSON.stringify({
          id: id,
          name: medium
        })
      )
    }
  })

  const uniqueMediums = new Set([].concat(...mediums))
  return Array.from(uniqueMediums).map(medium => JSON.parse(medium))
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
