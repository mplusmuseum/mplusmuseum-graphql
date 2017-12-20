const typeDefs = `
  # An artwork in the M+ collection
  type Artwork {
    # TMS ID
    id: ID!

    # Accession number
    objectNumber: String!

    # Creation start date
    datebegin: Int

    # Creation end date (if range)
    dateend: Int

    # Display date
    dated: String

    # Object status can be Accessioned Object, [TK] (translated)
    objectstatus: [TranslatedText]

    # Credit lines (translated)
    creditlines: [TranslatedText]

    # Medium listing (translated)
    medium: Medium

    # Object dimensions (translated)
    dimensions: [TranslatedText]

    # Categories assigned to object
    areacategories: [AreaCategory]

    # Authors/makers assigned to object
    authors: [Author]

    medias: [Media]

    # Title (translated)
    titles: [TranslatedText]
  }

  type Media {
    rank: Int
    primarydisplay: Int
    filename: String
  }

  type Author {
    rank: Int
    author: ID
    authornameid: ID
    nationality: String
    name: String
    birthyear_yearformed: Int
    deathyear: Int
    artworks: [Artwork]
  }

  type Medium {
    id: ID
    name: [TranslatedText]
    artworks: [Artwork]
  }

  type AreaCategory {
    rank: Int
    type: String
    areacat: [TranslatedText]
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
    authors: [Author!]!
    mediums: [Medium]
    artwork(id: ID!): Artwork
    author(id: ID!): Author
    medium(id: ID!): Medium
  }

  type Mutation {
    createArtwork(tms_id: ID!, title: [TranslatedTextInput]!): Artwork
  }
`

export default typeDefs
