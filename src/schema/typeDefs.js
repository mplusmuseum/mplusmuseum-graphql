const typeDefs = `
  # An artwork in the M+ collection
  type Artwork {
    # Artwork ID
    id: ID!
    tms_id: ID!
    # Artwork title
    title: [TranslatedText!]!
  }

  type TranslatedText {
    language: String!
    text: String!
  }

  input TranslatedTextInput {
    language: String!
    text: String!
  }

  type Query {
    artworks: [Artwork!]!
    artwork(id: ID!): Artwork
  }

  type Mutation {
    createArtwork(tms_id: ID!, title: [TranslatedTextInput]!): Artwork
  }
`

export default typeDefs
