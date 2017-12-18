export const getUniqueAuthors = (artworks) => {
  let uniqueAuthors = {}
  artworks.map((artwork) => {
    artwork.authors[0].map((author) => {
      const id = author.author
      if (!uniqueAuthors[id]) {
        uniqueAuthors[id] = author
        uniqueAuthors[id].artworks = []
      }

      if (uniqueAuthors[id].artworks.indexOf(artwork.id) < 0)
        uniqueAuthors[id].artworks.push(artwork.id)
    })
  })

  const authors = Object.entries(uniqueAuthors).map((author) => {
    return author[1]
  })

  return authors
}
