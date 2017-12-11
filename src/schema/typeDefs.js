const typeDefs = `
  # An artwork in the M+ collection
  type Artwork {
    # Artwork ID
    id: ID!
    tmsid: ID
    objectnumber: String!
    datebegin: Int
    dateend: Int
    dated: String
    # Artwork title
    titles: [TranslatedText]!
  }

  type TranslatedText {
    lang: String
    text: String
  }

  input TranslatedTextInput {
    lang: String
    text: String
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
