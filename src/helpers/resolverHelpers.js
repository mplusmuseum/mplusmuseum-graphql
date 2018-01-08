import hash from 'string-hash'

export const getUniqueMakers = (artworks) => {
  const makers = artworks.map(artwork =>
    artwork.makers.map(maker => {
        if (maker.author)
          return JSON.stringify({
            id: parseInt(maker.author),
            name: maker.name,
            birthyear_yearformed: maker.birthyear_yearformed,
            deathyear: maker.deathyear
          })
      }
    )
  )

  return Array.from(new Set([].concat(...makers)))
    .map(maker => JSON.parse(maker))
}

export const getUniqueMediums = (artworks) => {
  const mediums = []
  artworks.forEach(artwork => {
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

  return Array.from(new Set([].concat(...mediums)))
    .map(medium => JSON.parse(medium))
}

export const getUniqueAreaCats = (artworks, type) => {
  let uniqueAreaCats = {}

  artworks.map(artwork => {
    if (artwork.areacategories && artwork.areacategories[0].areacat) {
      artwork.areacategories.map(areacat => {
        if (areacat.type.toLowerCase() === type.toLowerCase()) {
          const id = hash(areacat.areacat[0].text)
          if (!uniqueAreaCats[id]) {
            areacat.id = id
            areacat.name = areacat.areacat
            uniqueAreaCats[id] = areacat
          }
        }
      })
    }
  })

  return Object.entries(uniqueAreaCats).map(areacat => areacat[1])
}
