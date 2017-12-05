const typeDefs = `
  # An artwork in the M+ collection
  type Artwork {
    # Artwork ID
    id: ID!
    # Artwork title
    title: String!
  }

  type Query {
    artworks: [Artwork!]!
  }

  type Mutation {
    createArtwork(title: String!): Artwork
  }
`

export default typeDefs
